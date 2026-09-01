import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import {
  contactInquirySchema,
  inquiryTypeLabels,
} from "@/lib/schemas/contact";
import { isEmailConfigured, sendContactNotification } from "@/lib/email/mailer";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import { createRateLimiter } from "@/lib/rate-limit";
import { getClientIp, isHoneypotFilled } from "@/lib/request-helpers";

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const rateLimiter = createRateLimiter(RATE_LIMIT, WINDOW_MS);

function readString(body: unknown, key: string): string | undefined {
  if (typeof body === "object" && body !== null && key in body) {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const body: unknown = await request.json().catch(() => null);

  const honeypot = readString(body, "website");
  if (isHoneypotFilled(honeypot)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (rateLimiter.isRateLimited(ip)) {
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

  if (!isEmailConfigured()) {
    console.warn("[contact] email not configured — inquiry not delivered.");
    return NextResponse.json(
      { error: "Contact form is temporarily unavailable." },
      { status: 503 },
    );
  }

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
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
