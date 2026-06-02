import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { db } from "@/lib/db";
import {
  contactInquirySchema,
  inquiryTypeLabels,
  type InquiryType,
} from "@/lib/schemas/contact";
import { isEmailConfigured, sendContactNotification } from "@/lib/email/mailer";
import { ContactNotificationEmail } from "@/emails/contact-notification";

// Map the zod (snake_case) enum to the Prisma (SCREAMING_CASE) enum.
const prismaInquiryType: Record<
  InquiryType,
  "SHORT_TERM" | "LONG_TERM" | "CORPORATE" | "GENERAL"
> = {
  short_term: "SHORT_TERM",
  long_term: "LONG_TERM",
  corporate: "CORPORATE",
  general: "GENERAL",
};

// Lightweight in-memory rate limit per IP. Resets on restart and is per-instance
// — swap for Redis/Upstash for durable, multi-instance production limiting.
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function readString(body: unknown, key: string): string | undefined {
  if (typeof body === "object" && body !== null && key in body) {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const body: unknown = await request.json().catch(() => null);

  // Honeypot: bots fill the hidden `website` field. Pretend success and drop.
  const honeypot = readString(body, "website");
  if (honeypot && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const parsed = contactInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const phone = data.phone?.trim() ? data.phone.trim() : null;
  const company = data.company?.trim() ? data.company.trim() : null;
  const rawMoveIn = data.moveInDate?.trim();
  const moveInDate =
    rawMoveIn && !Number.isNaN(new Date(rawMoveIn).getTime())
      ? new Date(rawMoveIn)
      : null;

  // 1) Persist — the source of truth. Must succeed.
  const inquiry = await db.contactInquiry.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone,
      inquiryType: prismaInquiryType[data.inquiryType],
      company,
      moveInDate,
      message: data.message.trim(),
    },
  });

  // 2) Notify by email — best-effort. A transient SMTP failure must NOT lose
  //    the persisted record, so we log and still return success.
  if (isEmailConfigured()) {
    const element = (
      <ContactNotificationEmail
        name={inquiry.name}
        email={inquiry.email}
        phone={phone ?? undefined}
        inquiryType={data.inquiryType}
        company={company ?? undefined}
        moveInDate={rawMoveIn || undefined}
        message={inquiry.message}
      />
    );
    try {
      const [html, text] = await Promise.all([
        render(element),
        render(element, { plainText: true }),
      ]);
      await sendContactNotification({
        subject: `New ${inquiryTypeLabels[data.inquiryType]} inquiry from ${inquiry.name}`,
        html,
        text,
        replyTo: inquiry.email,
      });
    } catch (error) {
      console.error("[contact] email notification failed:", error);
    }
  } else {
    console.warn(
      "[contact] email not configured — inquiry persisted without notification.",
    );
  }

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}
