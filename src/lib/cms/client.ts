/**
 * Read client for the Emmut public CMS API that powers the Long-Term Rentals
 * pages (buildings + their units).
 *
 * Server-side only — these helpers read `env` and use Next's data cache
 * (`next.revalidate`). Do not import them from Client Components.
 *
 * The list/detail helpers never throw: they log and fall back to an empty list
 * / `null` so the marketing site degrades gracefully when the CMS is offline.
 */

import { env } from "@/lib/env";

import type { CmsBuilding, CmsBuildingSummary } from "./types";

/** How long fetched CMS content is cached before Next revalidates (seconds). */
const CMS_REVALIDATE_SECONDS = 60;

/**
 * Server-to-server request timeout (ms). Bounds the await so a hung CMS (a
 * connection that accepts but never responds) trips the graceful catch below
 * instead of stalling ISR revalidation or `next build`.
 */
const CMS_REQUEST_TIMEOUT_MS = 5000;

/** Base origin of the Emmut public CMS API, without a trailing slash. */
function cmsApiBase(): string {
  return env.CMS_API_URL.replace(/\/+$/, "");
}

/**
 * Turn a relative CMS image path (e.g. `/api/public/cms/images/abc`) into an
 * absolute URL on the CMS origin so `next/image` can load it.
 */
export function cmsImageUrl(relativePath: string): string {
  return `${cmsApiBase()}${relativePath}`;
}

type Envelope<T> = { data: T };

async function fetchCms<T>(path: string): Promise<T> {
  const res = await fetch(`${cmsApiBase()}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(CMS_REQUEST_TIMEOUT_MS),
    next: { revalidate: CMS_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`CMS request failed (${res.status}) for ${path}`);
  }
  const json = (await res.json()) as Envelope<T>;
  return json.data;
}

/**
 * All published buildings, ordered as configured in the CMS. Returns an empty
 * list (never throws) so the listing page and `generateStaticParams` stay
 * resilient when the CMS is unreachable.
 */
export async function listCmsBuildings(): Promise<CmsBuildingSummary[]> {
  try {
    return await fetchCms<CmsBuildingSummary[]>("/api/public/cms/buildings");
  } catch (error) {
    console.error("[cms] failed to list buildings", error);
    return [];
  }
}

/**
 * A single published building with its published units, or `null` if it does
 * not exist, is unpublished, or the CMS is unreachable.
 */
export async function getCmsBuilding(slug: string): Promise<CmsBuilding | null> {
  try {
    return await fetchCms<CmsBuilding>(
      `/api/public/cms/buildings/${encodeURIComponent(slug)}`,
    );
  } catch (error) {
    console.error(`[cms] failed to load building "${slug}"`, error);
    return null;
  }
}
