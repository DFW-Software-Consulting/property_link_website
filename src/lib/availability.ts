/**
 * Helpers for the Check Availability page: reading the search from the URL,
 * labelling results, and pre-filling the contact form from a result.
 */

import type { CmsAvailabilityResult } from "@/lib/cms/types";
import type { AvailabilitySearch } from "@/lib/cms/client";
import { UNIT_SIZES, type UnitSize } from "@/lib/schemas/contact";

/** Bedroom counts offered in the search (0 is a studio). */
export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4] as const;

export function bedroomLabel(bedrooms: number): string {
  if (bedrooms === 0) return "Studio";
  return `${bedrooms} bedroom${bedrooms === 1 ? "" : "s"}`;
}

export function bathroomLabel(bathrooms: number): string {
  return `${bathrooms} bath${bathrooms === 1 ? "" : "s"}`;
}

type RawParams = { [key: string]: string | string[] | undefined };

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

/**
 * The search a visitor asked for, keeping only values the page offers so a
 * hand-edited URL can't send junk to the CMS.
 */
export function parseAvailabilitySearch(
  params: RawParams,
  options: {
    buildingSlugs: readonly string[];
    neighborhoods: readonly string[];
  },
): AvailabilitySearch {
  const search: AvailabilitySearch = {};

  const building = single(params.building);
  if (building && options.buildingSlugs.includes(building))
    search.building = building;

  const neighborhood = single(params.neighborhood);
  if (neighborhood && options.neighborhoods.includes(neighborhood)) {
    search.neighborhood = neighborhood;
  }

  const bedrooms = Number(single(params.bedrooms));
  if ((BEDROOM_OPTIONS as readonly number[]).includes(bedrooms))
    search.bedrooms = bedrooms;

  return search;
}

/** "Available now", or the move-in date (with the year when it isn't this year). */
export function availabilityLabel(
  availableFrom: string,
  today: string,
): string {
  if (availableFrom <= today) return "Available now";
  const date = new Date(`${availableFrom}T00:00:00.000Z`);
  const sameYear = availableFrom.slice(0, 4) === today.slice(0, 4);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
  return `Available ${formatted}`;
}

function unitSizeFor(bedrooms: number): UnitSize | undefined {
  return UNIT_SIZES[bedrooms];
}

/** Contact form link pre-filled with the result's building, size, and move-in date. */
export function requestHref(
  result: CmsAvailabilityResult,
  today: string,
): string {
  const params = new URLSearchParams({
    building: result.building.name,
    buildingSlug: result.building.slug,
  });
  const unitSize = unitSizeFor(result.bedrooms);
  if (unitSize) params.set("unitSize", unitSize);
  params.set(
    "moveInDate",
    result.availableFrom > today ? result.availableFrom : today,
  );
  return `/contact?${params}`;
}
