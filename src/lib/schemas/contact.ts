import { z } from "zod";
import { minMoveOutDate, parseIsoDate } from "@/lib/dates";

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
  short_term: "Short-term stay (30+ days)",
  long_term: "Long-term lease (12 months)",
  corporate: "Corporate / relocation",
  general: "General question",
};

/** Apartment sizes an inquiry can ask about. */
export const UNIT_SIZES = [
  "studio",
  "one_bedroom",
  "two_bedroom",
  "three_bedroom",
  "four_bedroom",
] as const;

export type UnitSize = (typeof UNIT_SIZES)[number];

export const unitSizeLabels: Record<UnitSize, string> = {
  studio: "Studio",
  one_bedroom: "One bedroom",
  two_bedroom: "Two bedroom",
  three_bedroom: "Three bedroom",
  four_bedroom: "Four bedroom",
};

/** Inquiries about a specific stay, where we need the move-out date. */
const STAY_INQUIRY_TYPES: InquiryType[] = ["short_term", "corporate"];

export const contactInquirySchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name").max(100),
    email: z.email("Please enter a valid email address"),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    inquiryType: z.enum(INQUIRY_TYPES),
    unitSize: z.enum(UNIT_SIZES).or(z.literal("")).optional(),
    // Optional property context, set when the form is opened from a building page.
    building: z.string().trim().max(160).optional().or(z.literal("")),
    buildingSlug: z.string().trim().max(120).optional().or(z.literal("")),
    company: z.string().trim().max(120).optional().or(z.literal("")),
    moveInDate: z.string().max(40).optional().or(z.literal("")),
    moveOutDate: z.string().max(40).optional().or(z.literal("")),
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
  })
  .superRefine((value, ctx) => {
    if (value.inquiryType !== "general" && !value.unitSize) {
      ctx.addIssue({
        code: "custom",
        path: ["unitSize"],
        message: "Please choose an apartment size",
      });
    }

    const moveIn = value.moveInDate?.trim() ?? "";
    const moveOut = value.moveOutDate?.trim() ?? "";

    if (!moveOut) {
      if (STAY_INQUIRY_TYPES.includes(value.inquiryType)) {
        ctx.addIssue({
          code: "custom",
          path: ["moveOutDate"],
          message: "Please choose a move-out date",
        });
      }
      return;
    }

    if (!parseIsoDate(moveOut)) {
      ctx.addIssue({
        code: "custom",
        path: ["moveOutDate"],
        message: "Please choose a valid move-out date",
      });
      return;
    }

    const earliest = minMoveOutDate(moveIn || undefined);
    if (moveOut >= earliest) return;

    // A later move-in date pushes the cutoff past the "30 days from today" one.
    const countsFromMoveIn = minMoveOutDate() < earliest;
    ctx.addIssue({
      code: "custom",
      path: ["moveOutDate"],
      message: countsFromMoveIn
        ? "Stays run at least 30 days, so please choose a move-out date at least 30 days after your move-in date"
        : "Please choose a move-out date at least 30 days from today",
    });
  });

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
