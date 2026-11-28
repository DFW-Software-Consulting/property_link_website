import { z } from "zod";

export const portalRequestLinkSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(254),
});

export const portalVerifySchema = z.object({
  token: z.string().trim().min(16, "Invalid verification token").max(2048),
});

export const portalMaintenanceReplySchema = z.object({
  body: z.string().trim().min(1, "Reply cannot be empty").max(4000, "Reply is too long"),
});

export const portalRenewalRequestSchema = z.object({
  reservationId: z.number().int().positive("Invalid stay ID"),
  preferredEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Preferred end date must be YYYY-MM-DD")
    .optional(),
  notes: z.string().trim().max(1000, "Notes are too long").optional(),
});

export const residentAccessCodeSchema = z.object({
  label: z.string(),
  target: z.string(),
  value: z.string(),
  notes: z.string().nullable(),
});

export const residentStaySchema = z.object({
  reservationId: z.number(),
  propertyName: z.string(),
  buildingName: z.string().nullable(),
  unitName: z.string().nullable(),
  arrivalDate: z.string().nullable(),
  departureDate: z.string().nullable(),
  checkedIn: z.boolean(),
  checkedOut: z.boolean(),
  wifiNetwork: z.string().nullable(),
  wifiPassword: z.string().nullable(),
  accessInstructions: z.string().nullable(),
  parkingInfo: z.string().nullable(),
  accessCodes: z.array(residentAccessCodeSchema),
});

export const residentInvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  reservationId: z.number().nullable(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.string(),
  totalAmount: z.number(),
  balanceAmount: z.number(),
  itemSummaries: z.array(z.string()),
});

export const residentMaintenanceMessageSchema = z.object({
  id: z.number(),
  direction: z.string(),
  channel: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

export const residentMaintenanceThreadSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(residentMaintenanceMessageSchema),
});

export const residentPortalOverviewSchema = z.object({
  residentEmail: z.string(),
  residentName: z.string(),
  stays: z.array(residentStaySchema),
  invoices: z.array(residentInvoiceSchema),
  maintenanceRequests: z.array(residentMaintenanceThreadSchema),
});

export type ResidentPortalOverview = z.infer<typeof residentPortalOverviewSchema>;
export type PortalRenewalRequestInput = z.infer<typeof portalRenewalRequestSchema>;
