/**
 * DTOs for the Emmut public CMS API (`/api/public/cms/*`).
 *
 * The canonical definitions live in `./schema` (Zod) and are re-exported here as
 * inferred types so the runtime validation and the static types never drift.
 * Only PUBLISHED content is ever returned, and image URLs are RELATIVE to the
 * CMS origin — prepend it with `cmsImageUrl()` before rendering.
 */

export type {
  CmsImage,
  CmsUnitSummary,
  CmsBuildingSummary,
  CmsBuilding,
  CmsCompanyInfo,
} from "./schema";
