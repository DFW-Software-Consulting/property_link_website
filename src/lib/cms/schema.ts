/**
 * Runtime (Zod) schemas for the Emmut public CMS API, and the single source of
 * truth for the CMS DTO types (derived via `z.infer`). `fetchCms` validates
 * responses against these so an upstream contract change degrades to the
 * graceful empty state instead of rendering `undefined` into the page.
 */

import { z } from "zod";

export const cmsImageSchema = z.object({
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

export const cmsUnitSummarySchema = z.object({
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

export const cmsBuildingSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  neighborhood: z.string().nullable(),
  address: z.string(),
  hero: cmsImageSchema.nullable(),
  unitCount: z.number(),
});

export const cmsBuildingSchema = cmsBuildingSummarySchema.extend({
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

/** Envelope wrappers — the API returns `{ data: ... }`. */
export const cmsBuildingsResponseSchema = z.object({
  data: z.array(cmsBuildingSummarySchema),
});
export const cmsBuildingResponseSchema = z.object({ data: cmsBuildingSchema });

export type CmsImage = z.infer<typeof cmsImageSchema>;
export type CmsUnitSummary = z.infer<typeof cmsUnitSummarySchema>;
export type CmsBuildingSummary = z.infer<typeof cmsBuildingSummarySchema>;
export type CmsBuilding = z.infer<typeof cmsBuildingSchema>;
