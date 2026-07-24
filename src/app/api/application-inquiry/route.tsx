import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { InternationalApplicationInquiryEmail } from "@/emails/international-application-inquiry";
import { isEmailConfigured, sendContactNotification } from "@/lib/email/mailer";
import { verifyCaptcha } from "@/lib/maintenance/captcha";
import { applicationInquirySchema } from "@/lib/schemas/application-inquiry";

// Nodemailer requires the Node.js runtime.
export const runtime = "nodejs";

// Lightweight in-memory rate limit per IP. Resets on restart and is per-instance.
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

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  const getField = (key: string): string => {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
  };

  // Honeypot: bots fill the hidden `website` field. Pretend success and drop.
  if (getField("website").trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const parsed = applicationInquirySchema.safeParse({
    fullName: getField("fullName"),
    email: getField("email"),
    phone: getField("phone"),
    currentCountry: getField("currentCountry"),
    moveInDate: getField("moveInDate"),
    message: getField("message"),
    captchaToken: getField("captchaToken"),
    website: getField("website"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const captcha = await verifyCaptcha(data.captchaToken || null, ip);
  if (!captcha.success) {
    return NextResponse.json(
      { error: "CAPTCHA verification failed. Please try again." },
      { status: 403 },
    );
  }

  if (!isEmailConfigured()) {
    console.error(
      "[application-inquiry] email is not configured — set SMTP_*, CONTACT_TO, and CONTACT_FROM.",
    );
    return NextResponse.json(
      { error: "Application inquiries are temporarily unavailable." },
      { status: 503 },
    );
  }

  const fullName = data.fullName.trim();
  const email = data.email.trim();
  const currentCountry = data.currentCountry.trim();
  const phone = data.phone?.trim() || undefined;
  const moveInDate = data.moveInDate?.trim() || undefined;
  const message = data.message?.trim() || undefined;

  const element = (
    <InternationalApplicationInquiryEmail
      fullName={fullName}
      email={email}
      phone={phone}
      currentCountry={currentCountry}
      moveInDate={moveInDate}
      message={message}
    />
  );

  try {
    const [html, text] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
    ]);
    await sendContactNotification({
      subject: `[Application Inquiry — International] ${fullName}, ${currentCountry}`,
      html,
      text,
      replyTo: email,
    });
  } catch (error) {
    console.error("[application-inquiry] email notification failed:", error);
    return NextResponse.json(
      { error: "We couldn't submit your inquiry. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
