import { z } from "zod";

export const conciergeLeadSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  phone: z.string().trim().max(40).optional(),
  moveInDate: z.string().trim().max(40).optional(),
  stayLength: z.string().trim().max(80).optional(),
});

export const conciergeRequestSchema = z.object({
  message: z.string().trim().min(1, "Please enter a question").max(1500, "Question is too long"),
  buildingSlug: z.string().trim().max(120).optional(),
  lead: conciergeLeadSchema.optional(),
});

export const conciergeReplySchema = z.object({
  answer: z.string(),
  buildingsReferenced: z.array(z.string()),
  leadCaptured: z.boolean(),
  modelUsed: z.string(),
});

export type ConciergeRequestInput = z.infer<typeof conciergeRequestSchema>;
export type ConciergeReply = z.infer<typeof conciergeReplySchema>;
