import { z } from "zod";

/**
 * Shared Zod schema for creating an item. Reused on the client (react-hook-form
 * resolver) and on the server (API route validation) — one source of truth.
 */
export const createItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

/** Shape of an item as returned by the API (dates serialized to ISO strings). */
export interface Item {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
