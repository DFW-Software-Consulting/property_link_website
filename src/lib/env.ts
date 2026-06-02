import { z } from "zod";

/**
 * Server-side environment validation.
 * Do not import this from Client Components.
 *
 * Email vars are OPTIONAL here: the app/builds must not hard-fail when SMTP
 * isn't configured. `lib/email/mailer.ts` checks them at send time and only
 * errors when an email is actually attempted.
 */
const envSchema = z.object({
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
});

export const env = envSchema.parse(process.env);
