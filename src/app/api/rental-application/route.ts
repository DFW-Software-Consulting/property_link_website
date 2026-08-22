import { NextResponse } from "next/server";
import {
  isRentalApplicationConfigured,
  sendRentalApplicationEmail,
} from "@/lib/email/mailer";
import { verifyCaptcha } from "@/lib/maintenance/captcha";
import { rentalApplicationSchema } from "@/lib/schemas/rental-application";

export const runtime = "nodejs";

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

/** Test-only: clear the rate-limit window. */
export function __resetRateLimiter(): void {
  hits.clear();
}

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

  if (getField("website").trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const occupantsParsed = getField("occupants").trim();
  const occupants = occupantsParsed === "" ? undefined : Number(occupantsParsed);

  const parsed = rentalApplicationSchema.safeParse({
    fullName: getField("fullName"),
    email: getField("email"),
    phone: getField("phone"),
    building: getField("building"),
    moveInDate: getField("moveInDate"),
    occupants,
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

  if (!isRentalApplicationConfigured()) {
    console.error(
      "[rental-application] email is not configured — set SMTP_* and FROM_ADDRESS.",
    );
    return NextResponse.json(
      { error: "Rental applications are temporarily unavailable." },
      { status: 503 },
    );
  }

  const fullName = data.fullName.trim();
  const email = data.email.trim();
  const building = data.building?.trim() || undefined;
  const phone = data.phone?.trim() || undefined;
  const moveInDate = data.moveInDate?.trim() || undefined;
  const occupantsValue =
    data.occupants != null ? String(data.occupants) : undefined;
  const message = data.message?.trim() || undefined;

  const rows: Array<[string, string | undefined]> = [
    ["Full name", fullName],
    ["Email", email],
    ["Phone", phone],
    ["Building", building],
    ["Desired move-in", moveInDate],
    ["Occupants", occupantsValue],
  ];

  const htmlRows = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${label}</td><td>${value}</td></tr>`,
    )
    .join("");

  const html = `<table style="border-collapse:collapse">${htmlRows}</table>${
    message
      ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/><p style="font-weight:700;margin:0 0 4px">Message</p><p style="white-space:pre-wrap;margin:0">${message}</p>`
      : ""
  }`;

  const textRows = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  const text = `${textRows}${message ? `\n\nMessage:\n${message}` : ""}`;

  try {
    await sendRentalApplicationEmail({
      subject: `[Rental Application] ${fullName} — ${building ?? "NYC"}`,
      html,
      text,
      replyTo: email,
    });
  } catch (error) {
    console.error("[rental-application] email send failed:", error);
    return NextResponse.json(
      { error: "We couldn't submit your application. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
