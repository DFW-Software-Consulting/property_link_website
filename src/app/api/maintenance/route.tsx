import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { maintenanceFormSchema, validatePhotos } from "@/lib/schemas/maintenance";
import {
  buildMaintenancePayload,
  signMaintenancePayload,
  type MaintenancePhotoMeta,
} from "@/lib/maintenance/payload";
import { verifyCaptcha } from "@/lib/maintenance/captcha";
import {
  isMaintenanceIntakeConfigured,
  sendMaintenanceRequestEmail,
  type MaintenanceAttachment,
} from "@/lib/email/mailer";
import { MaintenanceRequestEmail } from "@/emails/maintenance-request";

// Nodemailer + node:crypto + file reads require the Node.js runtime.
export const runtime = "nodejs";

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

/** Sanitize an uploaded filename to a safe basename. */
function safeFilename(original: string): string {
  const base = original.split(/[\\/]/).pop() || "photo";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  return cleaned.replace(/^[._]+/, "") || "photo";
}

/** Ensure every attachment filename is unique within the submission. */
function dedupeFilename(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 1;
  let candidate = `${stem}-${i}${ext}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${stem}-${i}${ext}`;
  }
  used.add(candidate);
  return candidate;
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

  // 1) Validate the text fields.
  const parsed = maintenanceFormSchema.safeParse({
    firstName: getField("firstName"),
    lastName: getField("lastName"),
    building: getField("building"),
    apartment: getField("apartment"),
    phone: getField("phone"),
    email: getField("email"),
    message: getField("message"),
    permissionToEnter: getField("permissionToEnter"),
    petInResidence: getField("petInResidence"),
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

  // 2) Validate the photo files.
  const files = form
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const photoCheck = validatePhotos(files);
  if (!photoCheck.ok) {
    return NextResponse.json({ error: photoCheck.error }, { status: 400 });
  }

  // 3) Verify the CAPTCHA server-side before doing any sending.
  const captcha = await verifyCaptcha(data.captchaToken || null, ip);
  if (!captcha.success) {
    return NextResponse.json(
      { error: "CAPTCHA verification failed. Please try again." },
      { status: 403 },
    );
  }

  // 4) Refuse to send (rather than emit an unsigned / misaddressed email) when
  //    the intake contract isn't fully configured.
  if (!isMaintenanceIntakeConfigured() || !env.MAINTENANCE_INTAKE_SHARED_SECRET) {
    console.error(
      "[maintenance] intake not configured — set SMTP_*, MAINTENANCE_MAILBOX, FORM_FROM_ADDRESS, and MAINTENANCE_INTAKE_SHARED_SECRET.",
    );
    return NextResponse.json(
      { error: "Maintenance intake is temporarily unavailable." },
      { status: 503 },
    );
  }

  // 5) Read file bytes and assign unique, contract-matching filenames.
  const usedNames = new Set<string>();
  const attachments: MaintenanceAttachment[] = [];
  const photoMeta: MaintenancePhotoMeta[] = [];
  for (const file of files) {
    const filename = dedupeFilename(safeFilename(file.name), usedNames);
    const content = Buffer.from(await file.arrayBuffer());
    attachments.push({ filename, content, contentType: file.type });
    photoMeta.push({ filename, contentType: file.type });
  }

  // 6) Build + sign the payload (the contract the ingest verifies).
  const payload = buildMaintenancePayload({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    building: data.building,
    apartment: data.apartment,
    message: data.message,
    permissionToEnter: data.permissionToEnter,
    petInResidence: data.petInResidence === "yes",
    photos: photoMeta,
  });
  const submission = signMaintenancePayload(
    payload,
    env.MAINTENANCE_INTAKE_SHARED_SECRET,
  );

  // submission.json must be attached exactly, alongside the photos.
  attachments.unshift({
    filename: "submission.json",
    content: Buffer.from(JSON.stringify(submission, null, 2), "utf8"),
    contentType: "application/json",
  });

  // 7) Render the human-readable body and send the single email.
  const element = (
    <MaintenanceRequestEmail
      firstName={payload.contact.firstName}
      lastName={payload.contact.lastName}
      email={payload.contact.email}
      phone={payload.contact.phone}
      building={payload.building}
      apartment={payload.apartment}
      message={payload.message}
      permissionToEnter={payload.permissionToEnter}
      petInResidence={payload.petInResidence}
      photoFilenames={photoMeta.map((p) => p.filename)}
      submittedAt={payload.submittedAt}
    />
  );

  try {
    const [html, text] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
    ]);
    await sendMaintenanceRequestEmail({
      subject: `[Maintenance Request] ${payload.contact.firstName} ${payload.contact.lastName} — ${payload.building} ${payload.apartment}`,
      html,
      text,
      replyTo: payload.contact.email,
      attachments,
    });
  } catch (error) {
    console.error("[maintenance] failed to send request email:", error);
    return NextResponse.json(
      { error: "We couldn't submit your request. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
