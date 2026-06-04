import { z } from "zod";
import { BUILDINGS } from "@/lib/data/buildings";

/**
 * Shared maintenance-request validation. The text-field schema is the single
 * source of truth used by both the client form (react-hook-form resolver) and
 * the API route (server-side validation). Photo files travel as multipart
 * blobs, so they are validated separately by `validatePhotos` (works in both
 * the browser and the Node runtime since `File` is global in each).
 */

export const PERMISSION_OPTIONS = [
  {
    value: "yes",
    label:
      "YES — it's okay to enter when maintenance is available even if I'm not home",
  },
  {
    value: "no",
    label:
      "NO — not okay to enter when I'm not present (may delay repairs; emergencies excepted)",
  },
  {
    value: "coordinate",
    label: "Provide a date/time someone will be home and wait for confirmation",
  },
] as const;

export const PERMISSION_VALUES = ["yes", "no", "coordinate"] as const;
export type PermissionValue = (typeof PERMISSION_VALUES)[number];

export const PET_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const maintenanceFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  building: z
    .string()
    .trim()
    .min(1, "Please select your building")
    .refine((value) => BUILDINGS.includes(value), "Please select your building"),
  apartment: z.string().trim().min(1, "Apartment number is required").max(20),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Please enter a valid phone number"),
  email: z.email("Please enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(10, "Please describe the issue (at least 10 characters)")
    .max(4000, "Please keep your message under 4000 characters"),
  permissionToEnter: z.enum(PERMISSION_VALUES, {
    message: "Please choose a permission-to-enter option",
  }),
  petInResidence: z.enum(["yes", "no"], {
    message: "Please tell us whether there's a pet in residence",
  }),
  // CAPTCHA token from the client widget. Required-ness is enforced server-side
  // (and only when a CAPTCHA secret is configured) so dev without keys still works.
  captchaToken: z.string().optional().or(z.literal("")),
  // Honeypot — real users never see or fill this. Handled in the API route.
  website: z.string().optional(),
});

export type MaintenanceFormInput = z.infer<typeof maintenanceFormSchema>;

/* ------------------------------- photos ---------------------------------- */

export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // ~5 MB each
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
] as const;
/** For the file input `accept` attribute. */
export const ACCEPTED_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif";

export type PhotoValidationResult = { ok: true } | { ok: false; error: string };

export function validatePhotos(files: File[]): PhotoValidationResult {
  if (files.length > MAX_PHOTOS) {
    return { ok: false, error: `Please attach at most ${MAX_PHOTOS} photos.` };
  }
  for (const file of files) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      return {
        ok: false,
        error: `"${file.name}" isn't a supported image — use JPG, PNG, or GIF.`,
      };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { ok: false, error: `"${file.name}" is larger than 5 MB.` };
    }
  }
  return { ok: true };
}
