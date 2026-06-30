/**
 * DTOs for the Emmut public CMS API (`/api/public/cms/*`).
 *
 * These mirror the shapes the property-management app serves to this marketing
 * site. Only PUBLISHED content is ever returned, and image URLs are RELATIVE to
 * the CMS origin — prepend it with `cmsImageUrl()` before rendering.
 */

export type CmsImage = {
  id: string;
  /** Full-resolution image path, relative to the CMS origin. */
  url: string;
  /** Thumbnail (webp) image path, relative to the CMS origin. */
  thumbUrl: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

/** A unit (room type / layout) as shown inline on a building page. */
export type CmsUnitSummary = {
  slug: string;
  title: string;
  layoutLabel: string | null;
  beds: number | null;
  baths: number | null;
  hero: CmsImage | null;
};

/** A building as shown in the long-term rentals listing grid. */
export type CmsBuildingSummary = {
  slug: string;
  name: string;
  neighborhood: string | null;
  address: string;
  hero: CmsImage | null;
  unitCount: number;
};

/** A single building with its published units (the building detail page). */
export type CmsBuilding = CmsBuildingSummary & {
  description: string | null;
  units: CmsUnitSummary[];
};
