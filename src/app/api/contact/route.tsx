import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import {
  contactInquirySchema,
  inquiryTypeLabels,
} from "@/lib/schemas/contact";
import { isEmailConfigured, sendContactNotification } from "@/lib/email/mailer";
import { ContactNotificationEmail } from "@/emails/contact-notification";

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
  const name = data.name.trim();
  const email = data.email.trim();
  const building = data.building?.trim() || undefined;

  if (isEmailConfigured()) {
    const element = (
      <ContactNotificationEmail
        name={name}
        email={email}
        phone={data.phone?.trim() || undefined}
        inquiryType={data.inquiryType}
        building={building}
        company={data.company?.trim() || undefined}
        moveInDate={data.moveInDate?.trim() || undefined}
        message={data.message.trim()}
      />
    );
    try {
      const [html, text] = await Promise.all([
        render(element),
        render(element, { plainText: true }),
      ]);
      await sendContactNotification({
        subject: `New ${inquiryTypeLabels[data.inquiryType]} inquiry from ${name}${
          building ? ` — ${building}` : ""
        }`,
        html,
        text,
        replyTo: email,
      });
    } catch (error) {
      console.error("[contact] email notification failed:", error);
    }
  } else {
    console.warn("[contact] email not configured — inquiry not delivered.");
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
