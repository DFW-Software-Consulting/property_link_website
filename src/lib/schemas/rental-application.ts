import { z } from "zod";

/**
 * USA rental application schema. The client form and API route share this
 * contract so invalid data never reaches the office.
 */
export const rentalApplicationSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your full name").max(160),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  building: z
    .string()
    .trim()
    .max(255, "Please keep the building name under 255 characters")
    .optional()
    .or(z.literal("")),
  moveInDate: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])$/,
      "Please choose a valid move-in month",
    )
    .optional()
    .or(z.literal("")),
  occupants: z
    .number()
    .int()
    .positive()
    .max(20, "Please enter 20 or fewer occupants")
    .optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Please keep your message under 2000 characters")
    .optional()
    .or(z.literal("")),
  captchaToken: z.string().optional().or(z.literal("")),
  website: z.string().optional(),
});

export type RentalApplicationInput = z.infer<typeof rentalApplicationSchema>;
