import "dotenv/config";
import assert from "node:assert/strict";
import {
  buildMaintenancePayload,
  signMaintenancePayload,
} from "../src/lib/maintenance/payload";
import { canonicalize, sign, verify } from "../src/lib/maintenance/signature";

/**
 * Signature contract test for the Maintenance Request intake.
 *
 *   npm run test:maintenance
 *
 * Proves the signed payload verifies, that tampering with ANY field breaks the
 * signature, and that canonicalization is order-independent (so the ingest side
 * recomputes the same digest). Optionally sends ONE real email to a sandbox
 * mailbox when SEND_TEST_EMAIL=1 and SMTP/intake env vars are present.
 *
 * Run with `tsx`, which is already a dev dependency.
 */

const SECRET =
  process.env.MAINTENANCE_INTAKE_SHARED_SECRET ?? "test-shared-secret";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("Maintenance signature contract\n");

const basePayload = buildMaintenancePayload({
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  phone: "212-555-0147",
  building: "200 Mott Street — Little Italy",
  apartment: "4B",
  message: "Kitchen faucet is leaking under the sink.",
  permissionToEnter: "yes",
  petInResidence: true,
  photos: [
    { filename: "leak-1.jpg", contentType: "image/jpeg" },
    { filename: "leak-2.png", contentType: "image/png" },
  ],
  // Fixed timestamp keeps the test deterministic.
  submittedAt: "2026-06-04T15:30:00.000Z",
});

const signed = signMaintenancePayload(basePayload, SECRET);

check("payload is signed with a hex HMAC-SHA256 digest", () => {
  assert.match(signed.signature, /^[0-9a-f]{64}$/);
});

check("a valid signature verifies", () => {
  assert.equal(verify(signed, signed.signature, SECRET), true);
});

check("verifying with the wrong secret fails", () => {
  assert.equal(verify(signed, signed.signature, "not-the-secret"), false);
});

check("tampering with a top-level field fails verification", () => {
  const tampered = { ...signed, apartment: "5C" };
  assert.equal(verify(tampered, tampered.signature, SECRET), false);
});

check("tampering with a nested contact field fails verification", () => {
  const tampered = {
    ...signed,
    contact: { ...signed.contact, email: "attacker@example.com" },
  };
  assert.equal(verify(tampered, tampered.signature, SECRET), false);
});

check("tampering with a photo filename fails verification", () => {
  const tampered = {
    ...signed,
    photos: [{ filename: "evil.jpg", contentType: "image/jpeg" }, signed.photos[1]],
  };
  assert.equal(verify(tampered, tampered.signature, SECRET), false);
});

check("flipping the petInResidence boolean fails verification", () => {
  const tampered = { ...signed, petInResidence: false };
  assert.equal(verify(tampered, tampered.signature, SECRET), false);
});

check("canonicalization is independent of key insertion order", () => {
  const reordered = {
    petInResidence: basePayload.petInResidence,
    photos: basePayload.photos,
    message: basePayload.message,
    apartment: basePayload.apartment,
    building: basePayload.building,
    permissionToEnter: basePayload.permissionToEnter,
    contact: {
      phone: basePayload.contact.phone,
      email: basePayload.contact.email,
      lastName: basePayload.contact.lastName,
      firstName: basePayload.contact.firstName,
    },
    submittedAt: basePayload.submittedAt,
    formVersion: basePayload.formVersion,
  };
  assert.equal(canonicalize(reordered), canonicalize(basePayload));
  assert.equal(sign(reordered, SECRET), signed.signature);
});

check("the signature field is excluded from the signed bytes", () => {
  // Signing the full signed object (which contains `signature`) yields the same
  // digest as signing the unsigned payload — proving the field is omitted.
  assert.equal(sign(signed, SECRET), signed.signature);
});

console.log(`\n${passed} checks passed.\n`);

async function maybeSendTestEmail() {
  if (process.env.SEND_TEST_EMAIL !== "1") {
    console.log(
      "Skipping live email send (set SEND_TEST_EMAIL=1 with SMTP/intake env vars to send one).",
    );
    return;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAINTENANCE_MAILBOX, FORM_FROM_ADDRESS } =
    process.env;
  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !MAINTENANCE_MAILBOX ||
    !FORM_FROM_ADDRESS
  ) {
    throw new Error(
      "SEND_TEST_EMAIL=1 but SMTP_*/MAINTENANCE_MAILBOX/FORM_FROM_ADDRESS are not all set.",
    );
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // 1x1 transparent PNG.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );

  const emailPayload = buildMaintenancePayload({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "212-555-0147",
    building: "200 Mott Street — Little Italy",
    apartment: "4B",
    message: "Test maintenance request from the signature test script.",
    permissionToEnter: "coordinate",
    petInResidence: false,
    photos: [{ filename: "test-photo.png", contentType: "image/png" }],
  });
  const emailSubmission = signMaintenancePayload(emailPayload, SECRET);

  const info = await transporter.sendMail({
    from: FORM_FROM_ADDRESS,
    to: MAINTENANCE_MAILBOX,
    subject: `[Maintenance Request] ${emailPayload.contact.firstName} ${emailPayload.contact.lastName} — ${emailPayload.building} ${emailPayload.apartment}`,
    text: "Test maintenance request — see submission.json.",
    attachments: [
      {
        filename: "submission.json",
        content: Buffer.from(JSON.stringify(emailSubmission, null, 2), "utf8"),
        contentType: "application/json",
      },
      {
        filename: "test-photo.png",
        content: png,
        contentType: "image/png",
      },
    ],
  });
  console.log(`Sent test email: ${info.messageId}`);
}

maybeSendTestEmail().catch((error) => {
  console.error("\nTest email failed:", error);
  process.exit(1);
});
