import { z } from "zod";

/**
 * Server-side environment validation. Imported by `lib/db.ts`, so an invalid
 * or missing `DATABASE_URL` fails fast at startup with a clear message.
 * Do not import this from Client Components.
 *
 * Email vars are OPTIONAL here: the app/builds must not hard-fail when SMTP
 * isn't configured. `lib/email/mailer.ts` checks them at send time and only
 * errors when an email is actually attempted.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Contact-form email notifications (Nodemailer / SMTP). All required together
  // to enable sending — see lib/email/mailer.ts `isEmailConfigured()`.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // Inbox that receives inquiries, e.g. "info@propertylinknyc.com".
  CONTACT_TO: z.string().optional(),
  // From header, e.g. "PropertyLink NYC <info@propertylinknyc.com>".
  CONTACT_FROM: z.string().optional(),

  // Maintenance Request intake. Optional at startup; the API route checks them
  // at request time and refuses to send (rather than producing an unsigned or
  // misaddressed email) when any are missing. The shared secret MUST be byte
  // identical to the value configured in the property-management ingest app.
  MAINTENANCE_INTAKE_SHARED_SECRET: z.string().optional(),
  // Workspace intake address that receives submissions, e.g. "maintenance@…".
  MAINTENANCE_MAILBOX: z.string().optional(),
  // Stable sender the ingest filters on. Reuses SMTP_* for transport.
  FORM_FROM_ADDRESS: z.string().optional(),

  // Cloudflare Turnstile secret (server-side CAPTCHA verification). When unset,
  // verification is skipped — production MUST set it. The matching public site
  // key is read client-side from NEXT_PUBLIC_TURNSTILE_SITE_KEY.
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
