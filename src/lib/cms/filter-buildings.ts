/**
 * Pure filter/sort helpers for the Long-Term Rentals listing.
 *
 * No dependencies on Next or the DOM so the logic is unit-testable and can run
 * on the server (the listing page filters server-side from the URL params).
 */

import type { CmsBuildingSummary } from "./types";

/** Sort options offered on the listing, in display order. */
export const BUILDING_SORTS = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "layouts-desc", label: "Most layouts" },
] as const;

export type BuildingSort = (typeof BUILDING_SORTS)[number]["value"];

const SORT_VALUES = new Set<string>(BUILDING_SORTS.map((s) => s.value));

/** Coerce an arbitrary `?sort=` value to a known sort, defaulting to featured. */
export function normalizeSort(value: string | undefined | null): BuildingSort {
  return value && SORT_VALUES.has(value) ? (value as BuildingSort) : "featured";
}

/** Distinct neighborhoods present in the set, alphabetically sorted. */
export function uniqueNeighborhoods(
  buildings: CmsBuildingSummary[],
): string[] {
  const seen = new Set<string>();
  for (const b of buildings) {
    const value = b.neighborhood?.trim();
    if (value) seen.add(value);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

export type BuildingFilters = {
  neighborhood?: string | null;
  q?: string | null;
  sort?: string | null;
};

/**
 * Filter by neighborhood (exact, case-insensitive) and free-text query (matches
 * name, neighborhood, or address), then sort. "featured" preserves the CMS
 * order. Returns a new array; never mutates the input.
 */
export function filterAndSortBuildings(
  buildings: CmsBuildingSummary[],
  { neighborhood, q, sort }: BuildingFilters,
): CmsBuildingSummary[] {
  const hood = neighborhood?.trim().toLowerCase() ?? "";
  const query = q?.trim().toLowerCase() ?? "";

  const filtered = buildings.filter((b) => {
    if (hood && (b.neighborhood?.trim().toLowerCase() ?? "") !== hood) {
      return false;
    }
    if (query) {
      const haystack =
        `${b.name} ${b.neighborhood ?? ""} ${b.address}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  switch (normalizeSort(sort)) {
    case "name-asc":
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    case "layouts-desc":
      return [...filtered].sort(
        (a, b) => b.unitCount - a.unitCount || a.name.localeCompare(b.name),
      );
    default:
      return filtered;
  }
}
