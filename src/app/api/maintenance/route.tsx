import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { env } from "@/lib/env";
import {
  maintenanceFormSchema,
  validatePhotos,
  type MaintenanceFormInput,
} from "@/lib/schemas/maintenance";
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
import { createRateLimiter } from "@/lib/rate-limit";
import {
  createFormFieldGetter,
  getClientIp,
  isHoneypotFilled,
} from "@/lib/request-helpers";

// Nodemailer + node:crypto + file reads require the Node.js runtime.
export const runtime = "nodejs";

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const rateLimiter = createRateLimiter(RATE_LIMIT, WINDOW_MS);

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

/** A photo read into memory once, reused by whichever delivery path runs. */
type PreparedPhoto = { filename: string; contentType: string; bytes: Buffer };

/**
 * Primary delivery: POST straight to the property-management app's public
 * maintenance endpoint (real-time — the submission lands in the triage Inbox
 * immediately, no mailbox round-trip). Sends multipart so photos come along.
 *
 * Returns true when accepted (2xx). Any non-2xx / network error returns false
 * (or throws) so the caller falls back to the signed-email path — a submission
 * is never dropped just because the direct API is unreachable.
 */
async function deliverToDirectEndpoint(
  data: MaintenanceFormInput,
  photos: PreparedPhoto[],
  clientIp: string,
): Promise<boolean> {
  const base = env.CMS_API_URL.replace(/\/+$/, "");

  const fd = new FormData();
  fd.append("firstName", data.firstName);
  fd.append("lastName", data.lastName);
  fd.append("email", data.email);
  fd.append("phone", data.phone);
  fd.append("building", data.building);
  fd.append("apartment", data.apartment);
  fd.append("message", data.message);
  fd.append("permissionToEnter", data.permissionToEnter);
  fd.append("petInResidence", data.petInResidence === "yes" ? "true" : "false");
  for (const photo of photos) {
    fd.append(
      "photos",
      new Blob([new Uint8Array(photo.bytes)], { type: photo.contentType }),
      photo.filename,
    );
  }

  const res = await fetch(`${base}/api/public/maintenance-request`, {
    method: "POST",
    body: fd,
    // Forward the real client IP so the app's per-IP rate limit + abuse controls
    // key on the tenant, not this server. (A fronting proxy may re-stamp XFF.)
    headers: { "x-forwarded-for": clientIp },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    console.warn(
      `[maintenance] direct endpoint returned ${res.status}; falling back to email`,
    );
    return false;
  }
  return true;
}

/**
 * Fallback delivery: the original signed-email path. Builds + signs the payload
 * (the contract the ingest poller verifies), renders the human-readable email,
 * and sends it with `submission.json` + the photos attached.
 */
async function deliverViaEmail(
  data: MaintenanceFormInput,
  photos: PreparedPhoto[],
): Promise<void> {
  const attachments: MaintenanceAttachment[] = [];
  const photoMeta: MaintenancePhotoMeta[] = [];
  for (const photo of photos) {
    attachments.push({
      filename: photo.filename,
      content: photo.bytes,
      contentType: photo.contentType,
    });
    photoMeta.push({ filename: photo.filename, contentType: photo.contentType });
  }

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
    env.MAINTENANCE_INTAKE_SHARED_SECRET as string,
  );

  // submission.json must be attached exactly, alongside the photos.
  attachments.unshift({
    filename: "submission.json",
    content: Buffer.from(JSON.stringify(submission, null, 2), "utf8"),
    contentType: "application/json",
  });

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
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  const getField = createFormFieldGetter(form);

  if (isHoneypotFilled(getField("website"))) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (rateLimiter.isRateLimited(ip)) {
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

  // 4) Read every photo into memory once, with safe, unique filenames. Reused by
  //    whichever delivery path runs (direct multipart or email attachments).
  const usedNames = new Set<string>();
  const photos: PreparedPhoto[] = [];
  for (const file of files) {
    photos.push({
      filename: dedupeFilename(safeFilename(file.name), usedNames),
      contentType: file.type,
      bytes: Buffer.from(await file.arrayBuffer()),
    });
  }

  // 5) Direct-first, then fall back to the signed email so a submission is never
  //    lost if the app's public endpoint is unreachable.
  let delivered = false;
  try {
    delivered = await deliverToDirectEndpoint(data, photos, ip);
  } catch (error) {
    console.warn(
      "[maintenance] direct endpoint threw; falling back to email:",
      error,
    );
  }
  if (delivered) {
    return NextResponse.json({ ok: true, via: "direct" }, { status: 201 });
  }

  // 6) Fallback requires the signed-email intake to be configured.
  if (!isMaintenanceIntakeConfigured() || !env.MAINTENANCE_INTAKE_SHARED_SECRET) {
    console.error(
      "[maintenance] direct delivery failed and email intake is not configured — set SMTP_*, MAINTENANCE_MAILBOX, FORM_FROM_ADDRESS, and MAINTENANCE_INTAKE_SHARED_SECRET.",
    );
    return NextResponse.json(
      { error: "Maintenance intake is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    await deliverViaEmail(data, photos);
  } catch (error) {
    console.error("[maintenance] email fallback failed:", error);
    return NextResponse.json(
      { error: "We couldn't submit your request. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, via: "email" }, { status: 201 });
}
