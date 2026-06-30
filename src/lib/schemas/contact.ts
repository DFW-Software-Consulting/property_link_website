import { z } from "zod";

/**
 * Shared contact-inquiry schema. One source of truth used by the client form
 * (react-hook-form resolver) and the API route (server validation).
 */

export const INQUIRY_TYPES = [
  "short_term",
  "long_term",
  "corporate",
  "general",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const inquiryTypeLabels: Record<InquiryType, string> = {
  short_term: "Short-term furnished stay",
  long_term: "Long-term rental",
  corporate: "Corporate / relocation",
  general: "General question",
};

export const contactInquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  inquiryType: z.enum(INQUIRY_TYPES),
  // Optional property context, set when the form is opened from a building page.
  building: z.string().trim().max(160).optional().or(z.literal("")),
  buildingSlug: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  moveInDate: z.string().max(40).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please add a few details (at least 10 characters)")
    .max(2000, "Please keep your message under 2000 characters"),
  consent: z
    .boolean()
    .refine((value) => value === true, "Please agree to be contacted"),
  // Honeypot — real users never see or fill this. Handled in the API route.
  website: z.string().optional(),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
