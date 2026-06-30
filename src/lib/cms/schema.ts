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
});

export const cmsUnitSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  layoutLabel: z.string().nullable(),
  beds: z.number().nullable(),
  baths: z.number().nullable(),
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
  units: z.array(cmsUnitSummarySchema),
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
