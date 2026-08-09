/**
 * Runtime (Zod) schemas for the Emmut public CMS API, and the single source of
 * truth for the CMS DTO types (derived via `z.infer`). `fetchCms` validates
 * responses against these so an upstream contract change degrades to the
 * graceful empty state instead of rendering `undefined` into the page.
 */

import { z } from "zod";

const cmsImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  thumbUrl: z.string(),
  alt: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  // Tiny LQIP preview (data URL). Optional so responses from a CMS that predates
  // the field still parse; defaults to null (no blur-up).
  blurDataUrl: z.string().nullable().default(null),
});

const cmsUnitSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  layoutLabel: z.string().nullable(),
  beds: z.number().nullable(),
  baths: z.number().nullable(),
  // Optional (default) so the site keeps working before the CMS exposes them.
  priceLabel: z.string().nullable().default(null),
  priceMonthly: z.number().nullable().default(null),
  amenities: z.array(z.string()).default([]),
  hero: cmsImageSchema.nullable(),
});

const cmsBuildingSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  neighborhood: z.string().nullable(),
  address: z.string(),
  hero: cmsImageSchema.nullable(),
  unitCount: z.number(),
});

const cmsBuildingSchema = cmsBuildingSummarySchema.extend({
  // Sanitized rich-text HTML (the CMS sanitizes on write). Render via
  // `dangerouslySetInnerHTML`; use `descriptionToPlainText()` for meta/JSON-LD.
  description: z.string().nullable(),
  // Optional (default) so the site keeps working before the CMS exposes them.
  amenities: z.array(z.string()).default([]),
  videoUrl: z.string().nullable().default(null),
  // Public gallery display mode. `.catch` coerces missing/unknown values to grid.
  galleryLayout: z.enum(["grid", "carousel"]).catch("grid"),
  units: z.array(cmsUnitSummarySchema),
  // The building's own gallery photos. Optional (default []) so responses that
  // predate the field still parse.
  images: z.array(cmsImageSchema).default([]),
});

/**
 * Public contact details managed in the CMS and rendered site-wide (header,
 * footer, contact page). Both fields may be empty strings when unset — callers
 * fall back to the static `siteConfig` values in that case.
 */
const cmsCompanyInfoSchema = z.object({
  email: z.string(),
  phone: z.string(),
});

/** Active operational inventory used by the public maintenance form. */
const maintenanceUnitBuildingSchema = z.object({
  name: z.string().min(1),
  units: z.array(z.string().min(1)),
});

const maintenanceUnitInventorySchema = z.object({
  buildings: z.array(maintenanceUnitBuildingSchema),
});

/** Envelope wrappers — the API returns `{ data: ... }`. */
export const cmsBuildingsResponseSchema = z.object({
  data: z.array(cmsBuildingSummarySchema),
});
export const cmsBuildingResponseSchema = z.object({ data: cmsBuildingSchema });
export const cmsCompanyInfoResponseSchema = z.object({ data: cmsCompanyInfoSchema });
export const maintenanceUnitInventoryResponseSchema = z.object({
  data: maintenanceUnitInventorySchema,
});

export type CmsImage = z.infer<typeof cmsImageSchema>;
export type CmsUnitSummary = z.infer<typeof cmsUnitSummarySchema>;
export type CmsBuildingSummary = z.infer<typeof cmsBuildingSummarySchema>;
export type CmsBuilding = z.infer<typeof cmsBuildingSchema>;
export type CmsCompanyInfo = z.infer<typeof cmsCompanyInfoSchema>;
export type MaintenanceUnitBuilding = z.infer<
  typeof maintenanceUnitBuildingSchema
>;
export type MaintenanceUnitInventory = z.infer<
  typeof maintenanceUnitInventorySchema
>;
