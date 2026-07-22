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

// Hard guard: importing this module from a Client Component is a build error.
// It reads server env and talks to the CMS server-to-server.
import "server-only";

import { env } from "@/lib/env";

import { cmsLogger } from "./logger";
import {
  cmsBuildingResponseSchema,
  cmsBuildingsResponseSchema,
  cmsCompanyInfoResponseSchema,
  maintenanceUnitInventoryResponseSchema,
} from "./schema";
import type {
  CmsBuilding,
  CmsBuildingSummary,
  CmsCompanyInfo,
  MaintenanceUnitInventory,
} from "./types";

/** How long fetched CMS content is cached before Next revalidates (seconds). */
const CMS_REVALIDATE_SECONDS = 60;
const MAINTENANCE_UNITS_REVALIDATE_SECONDS = 300;

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

/** Fetch + check status; returns the raw JSON body (validated by the caller). */
async function fetchCmsJson(
  path: string,
  revalidate = CMS_REVALIDATE_SECONDS,
): Promise<unknown> {
  const res = await fetch(`${cmsApiBase()}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(CMS_REQUEST_TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`CMS request failed (${res.status}) for ${path}`);
  }
  return res.json();
}

/**
 * All published buildings, ordered as configured in the CMS. Returns an empty
 * list (never throws) so the listing page and `generateStaticParams` stay
 * resilient when the CMS is unreachable or returns an unexpected shape.
 */
export async function listCmsBuildings(): Promise<CmsBuildingSummary[]> {
  try {
    const json = await fetchCmsJson("/api/public/cms/buildings");
    return cmsBuildingsResponseSchema.parse(json).data;
  } catch (error) {
    cmsLogger.error("failed to list buildings", error, {
      operation: "listBuildings",
    });
    return [];
  }
}

/**
 * A single published building with its published units, or `null` if it does
 * not exist, is unpublished, the CMS is unreachable, or the shape is invalid.
 */
export async function getCmsBuilding(slug: string): Promise<CmsBuilding | null> {
  try {
    const json = await fetchCmsJson(
      `/api/public/cms/buildings/${encodeURIComponent(slug)}`,
    );
    return cmsBuildingResponseSchema.parse(json).data;
  } catch (error) {
    cmsLogger.error("failed to load building", error, {
      operation: "getBuilding",
      slug,
    });
    return null;
  }
}

/**
 * Public contact details (phone + email) managed in the CMS. Returns `null`
 * when the CMS is unreachable or the shape is invalid so callers can fall back
 * to the static `siteConfig` values instead of rendering nothing.
 */
export async function getCmsCompanyInfo(): Promise<CmsCompanyInfo | null> {
  try {
    const json = await fetchCmsJson("/api/public/cms/company-info");
    return cmsCompanyInfoResponseSchema.parse(json).data;
  } catch (error) {
    cmsLogger.error("failed to load company info", error, {
      operation: "getCompanyInfo",
    });
    return null;
  }
}

/**
 * Active building/unit labels for the maintenance form. A null or empty list
 * lets the form fall back to its free-text location fields when the app is down.
 */
export async function getPublicMaintenanceUnitInventory(): Promise<MaintenanceUnitInventory | null> {
  try {
    const json = await fetchCmsJson(
      "/api/public/maintenance-units",
      MAINTENANCE_UNITS_REVALIDATE_SECONDS,
    );
    return maintenanceUnitInventoryResponseSchema.parse(json).data;
  } catch (error) {
    cmsLogger.error("failed to load maintenance unit inventory", error, {
      operation: "getPublicMaintenanceUnitInventory",
    });
    return null;
  }
}

/**
 * Lightweight reachability probe for `/api/health`. Issues a HEAD against the
 * buildings endpoint (Next auto-serves HEAD for GET routes, so this exercises
 * the CMS without downloading a body) and never throws.
 */
export async function checkCmsHealth(): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${cmsApiBase()}/api/public/cms/buildings`, {
      method: "HEAD",
      signal: AbortSignal.timeout(CMS_REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}
