import { z } from "zod";

const currentYear = new Date().getFullYear();

/**
 * Shared international application inquiry schema. The client form and API
 * route use this single contract so invalid data never reaches the office.
 */
export const applicationInquirySchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your full name").max(160),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  currentCountry: z
    .string()
    .trim()
    .min(1, "Please enter your current country")
    .max(100),
  moveInDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Please choose a valid move-in month")
    .refine(
      (value) => {
        const year = Number(value.slice(0, 4));
        return year >= currentYear && year <= currentYear + 3;
      },
      "Please choose a move-in month within the next three years",
    )
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(2000, "Please keep your message under 2000 characters")
    .optional()
    .or(z.literal("")),
  // CAPTCHA required-ness is enforced server-side only when configured, so
  // local development and CI can run without Turnstile keys.
  captchaToken: z.string().optional().or(z.literal("")),
  // Honeypot — the API route quietly accepts and drops bot submissions.
  website: z.string().optional(),
});

export type ApplicationInquiryInput = z.infer<typeof applicationInquirySchema>;
