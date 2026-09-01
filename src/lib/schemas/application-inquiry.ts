import { z } from "zod";

/**
 * Shared international rental application schema. The client form and the API
 * route use this single contract so invalid data never reaches the office.
 *
 * The passport scan is a `File` and cannot round-trip through zod in both the
 * browser and node, so it is validated separately by `validatePassportFile`
 * (same split the maintenance intake uses for photos).
 */

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Today at UTC midnight — all date comparisons are day-granular. */
function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** Parse `YYYY-MM-DD` to a UTC date, rejecting impossible days like 2026-02-31. */
function parseIsoDate(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Round-trip guards against JS date rollover (e.g. Feb 31 -> Mar 3).
  return date.toISOString().slice(0, 10) === value ? date : null;
}

/** A calendar date in `YYYY-MM-DD`, real days only. */
function isoDate(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => parseIsoDate(value) !== null, message);
}

const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `Please enter ${label}`).max(max);

const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(7, `Please enter a valid ${label}`)
    .max(30, `Please enter a valid ${label}`);

export const GENDER_OPTIONS = [
  "female",
  "male",
  "non-binary",
  "prefer-not-to-say",
] as const;

export const GENDER_LABELS: Record<(typeof GENDER_OPTIONS)[number], string> = {
  female: "Female",
  male: "Male",
  "non-binary": "Non-binary",
  "prefer-not-to-say": "Prefer not to say",
};

const YES_NO_OPTIONS = ["yes", "no"] as const;

export const applicationInquirySchema = z.object({
  /* ------------------------------ applicant ------------------------------ */
  firstName: requiredText("your first name", 80),
  lastName: requiredText("your last name", 80),
  email: z.email("Please enter a valid email address"),
  phone: phone("phone number"),
  gender: z.enum(GENDER_OPTIONS, "Please select an option"),
  dateOfBirth: isoDate("Please enter a valid date of birth").refine((value) => {
    const dob = parseIsoDate(value);
    if (!dob) return false;
    const today = todayUtc();
    const eighteenth = new Date(
      Date.UTC(
        dob.getUTCFullYear() + 18,
        dob.getUTCMonth(),
        dob.getUTCDate(),
      ),
    );
    const oldest = new Date(
      Date.UTC(today.getUTCFullYear() - 120, today.getUTCMonth(), today.getUTCDate()),
    );
    return eighteenth <= today && dob >= oldest;
  }, "Applicants must be at least 18 years old"),

  /* ----------------------------- immigration ----------------------------- */
  countryOfCitizenship: requiredText("your country of citizenship", 100),
  passportIdNumber: requiredText("your passport or ID number", 40),
  visaType: requiredText("your visa type", 60),
  visaExpirationDate: isoDate(
    "Please enter a valid visa expiration date",
  ).refine((value) => {
    const date = parseIsoDate(value);
    return date !== null && date >= todayUtc();
  }, "Your visa expiration date must be in the future"),

  /* -------------------------- current landlord --------------------------- */
  landlordFirstName: requiredText("your landlord's first name", 80),
  landlordLastName: requiredText("your landlord's last name", 80),
  landlordPhone: phone("landlord phone number"),

  /* --------------------------- relative reference ------------------------ */
  relativeName: requiredText("your relative's name", 160),
  relativePhone: phone("relative phone number"),
  relationship: requiredText("your relationship to this person", 60),

  /* -------------------------------- tenancy ------------------------------ */
  desiredAddress: requiredText("the address you're applying for", 200),
  desiredMoveInDate: isoDate(
    "Please choose a valid move-in date",
  ).refine((value) => {
    const date = parseIsoDate(value);
    if (!date) return false;
    const today = todayUtc();
    const latest = new Date(
      Date.UTC(today.getUTCFullYear() + 3, today.getUTCMonth(), today.getUTCDate()),
    );
    return date >= today && date <= latest;
  }, "Please choose a move-in date within the next three years"),
  hasPets: z.enum(YES_NO_OPTIONS, "Please let us know about pets"),

  /* -------------------- emergency contact — United States ---------------- */
  emergencyUsFirstName: requiredText("a U.S. contact first name", 80),
  emergencyUsLastName: requiredText("a U.S. contact last name", 80),
  emergencyUsPhone: phone("U.S. contact phone number"),
  emergencyUsEmail: z.email("Please enter a valid U.S. contact email address"),

  /* --------------------- emergency contact — home country ---------------- */
  emergencyHomeFirstName: requiredText("a home-country contact first name", 80),
  emergencyHomeLastName: requiredText("a home-country contact last name", 80),
  emergencyHomePhone: phone("home-country contact phone number"),
  emergencyHomeEmail: z.email(
    "Please enter a valid home-country contact email address",
  ),

  /* -------------------------------- payment ------------------------------ */
  cardholderName: requiredText("the name on the card", 160),
  creditCardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{13,19}$/, "Please enter a valid credit card number"),
    ),
  cardExpirationDate: z
    .string()
    .trim()
    .regex(MONTH_RE, "Please enter a valid expiration date")
    .refine((value) => {
      const today = todayUtc();
      const currentMonth = `${today.getUTCFullYear()}-${String(
        today.getUTCMonth() + 1,
      ).padStart(2, "0")}`;
      return value >= currentMonth;
    }, "This card has expired"),
  securityCode: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "Please enter the 3- or 4-digit security code"),

  /* -------------------------------- hidden ------------------------------- */
  // CAPTCHA required-ness is enforced server-side only when configured, so
  // local development and CI can run without Turnstile keys.
  captchaToken: z.string().optional().or(z.literal("")),
  // Honeypot — the API route quietly accepts and drops bot submissions.
  website: z.string().optional(),
});

export type ApplicationInquiryInput = z.input<
  typeof applicationInquirySchema
>;

/* ---------------------------- passport upload ---------------------------- */

const MAX_PASSPORT_BYTES = 8 * 1024 * 1024; // ~8 MB
const ACCEPTED_PASSPORT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
/** For the file input `accept` attribute. */
export const ACCEPTED_PASSPORT_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

export type PassportValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/** The passport scan is required; reject anything oversized or unreadable. */
export function validatePassportFile(
  file: File | null | undefined,
): PassportValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, error: "Please attach a copy of your passport." };
  }
  if (
    !ACCEPTED_PASSPORT_TYPES.includes(
      file.type as (typeof ACCEPTED_PASSPORT_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      error: `"${file.name}" isn't a supported file — use JPG, PNG, WEBP, or PDF.`,
    };
  }
  if (file.size > MAX_PASSPORT_BYTES) {
    return { ok: false, error: `"${file.name}" is larger than 8 MB.` };
  }
  return { ok: true };
}
