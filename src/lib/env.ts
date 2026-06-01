import { z } from "zod";

/**
 * Server-side environment validation. Imported by `lib/db.ts`, so an invalid
 * or missing `DATABASE_URL` fails fast at startup with a clear message.
 * Do not import this from Client Components.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export const env = envSchema.parse(process.env);
