import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { InternationalApplicationInquiryEmail } from "@/emails/international-application-inquiry";
import { isEmailConfigured, sendContactNotification } from "@/lib/email/mailer";
import { verifyCaptcha } from "@/lib/maintenance/captcha";
import {
  applicationInquirySchema,
  GENDER_LABELS,
  validatePassportFile,
} from "@/lib/schemas/application-inquiry";

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

/** Sanitize an uploaded filename to a safe basename. */
function safeFilename(original: string): string {
  const base = original.split(/[\\/]/).pop() || "passport";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  return cleaned.replace(/^[._]+/, "") || "passport";
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
    firstName: getField("firstName"),
    lastName: getField("lastName"),
    email: getField("email"),
    phone: getField("phone"),
    gender: getField("gender"),
    dateOfBirth: getField("dateOfBirth"),
    countryOfCitizenship: getField("countryOfCitizenship"),
    passportIdNumber: getField("passportIdNumber"),
    visaType: getField("visaType"),
    visaExpirationDate: getField("visaExpirationDate"),
    landlordFirstName: getField("landlordFirstName"),
    landlordLastName: getField("landlordLastName"),
    landlordPhone: getField("landlordPhone"),
    relativeName: getField("relativeName"),
    relativePhone: getField("relativePhone"),
    relationship: getField("relationship"),
    desiredAddress: getField("desiredAddress"),
    desiredMoveInDate: getField("desiredMoveInDate"),
    hasPets: getField("hasPets"),
    emergencyUsFirstName: getField("emergencyUsFirstName"),
    emergencyUsLastName: getField("emergencyUsLastName"),
    emergencyUsPhone: getField("emergencyUsPhone"),
    emergencyUsEmail: getField("emergencyUsEmail"),
    emergencyHomeFirstName: getField("emergencyHomeFirstName"),
    emergencyHomeLastName: getField("emergencyHomeLastName"),
    emergencyHomePhone: getField("emergencyHomePhone"),
    emergencyHomeEmail: getField("emergencyHomeEmail"),
    cardholderName: getField("cardholderName"),
    creditCardNumber: getField("creditCardNumber"),
    cardExpirationDate: getField("cardExpirationDate"),
    securityCode: getField("securityCode"),
    captchaToken: getField("captchaToken"),
    website: getField("website"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // The passport scan is a File, so it is validated outside the zod contract.
  const passportEntry = form.get("passport");
  const passport =
    passportEntry instanceof File && passportEntry.size > 0
      ? passportEntry
      : null;
  const passportCheck = validatePassportFile(passport);
  if (!passportCheck.ok) {
    return NextResponse.json({ error: passportCheck.error }, { status: 400 });
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

  // `passport` is non-null here — validatePassportFile rejects a missing file.
  const passportFile = passport as File;
  const passportFilename = safeFilename(passportFile.name);

  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const element = (
    <InternationalApplicationInquiryEmail
      firstName={data.firstName}
      lastName={data.lastName}
      email={data.email}
      phone={data.phone}
      gender={GENDER_LABELS[data.gender]}
      dateOfBirth={data.dateOfBirth}
      countryOfCitizenship={data.countryOfCitizenship}
      passportIdNumber={data.passportIdNumber}
      visaType={data.visaType}
      visaExpirationDate={data.visaExpirationDate}
      passportFilename={passportFilename}
      landlordFirstName={data.landlordFirstName}
      landlordLastName={data.landlordLastName}
      landlordPhone={data.landlordPhone}
      relativeName={data.relativeName}
      relativePhone={data.relativePhone}
      relationship={data.relationship}
      desiredAddress={data.desiredAddress}
      desiredMoveInDate={data.desiredMoveInDate}
      hasPets={data.hasPets === "yes" ? "Yes" : "No"}
      emergencyUsFirstName={data.emergencyUsFirstName}
      emergencyUsLastName={data.emergencyUsLastName}
      emergencyUsPhone={data.emergencyUsPhone}
      emergencyUsEmail={data.emergencyUsEmail}
      emergencyHomeFirstName={data.emergencyHomeFirstName}
      emergencyHomeLastName={data.emergencyHomeLastName}
      emergencyHomePhone={data.emergencyHomePhone}
      emergencyHomeEmail={data.emergencyHomeEmail}
      cardholderName={data.cardholderName}
      creditCardNumber={data.creditCardNumber}
      cardExpirationDate={data.cardExpirationDate}
      securityCode={data.securityCode}
    />
  );

  try {
    const [html, text, content] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
      passportFile.arrayBuffer().then((buffer) => Buffer.from(buffer)),
    ]);
    await sendContactNotification({
      subject: `[Rental Application — International] ${fullName}, ${data.countryOfCitizenship}`,
      html,
      text,
      replyTo: data.email,
      attachments: [
        {
          filename: passportFilename,
          content,
          contentType: passportFile.type,
        },
      ],
    });
  } catch (error) {
    console.error("[application-inquiry] email notification failed:", error);
    return NextResponse.json(
      { error: "We couldn't submit your application. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
