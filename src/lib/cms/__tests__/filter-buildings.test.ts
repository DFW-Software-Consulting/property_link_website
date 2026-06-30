import { describe, expect, it } from "vitest";

import {
  filterAndSortBuildings,
  normalizeSort,
  uniqueNeighborhoods,
} from "../filter-buildings";
import type { CmsBuildingSummary } from "../types";

function building(
  overrides: Partial<CmsBuildingSummary> & { slug: string },
): CmsBuildingSummary {
  return {
    slug: overrides.slug,
    name: overrides.name ?? overrides.slug,
    neighborhood: overrides.neighborhood ?? null,
    address: overrides.address ?? "1 Main St",
    hero: overrides.hero ?? null,
    unitCount: overrides.unitCount ?? 0,
  };
}

const buildings: CmsBuildingSummary[] = [
  building({ slug: "bowery", name: "138 Bowery", neighborhood: "Little Italy", address: "138 Bowery", unitCount: 2 }),
  building({ slug: "w48", name: "521 West 48th", neighborhood: "Hell's Kitchen", address: "521 West 48th St", unitCount: 5 }),
  building({ slug: "mulberry", name: "145 Mulberry", neighborhood: "Little Italy", address: "145 Mulberry St", unitCount: 1 }),
  building({ slug: "e89", name: "165 East 89th", neighborhood: null, address: "165 East 89th St", unitCount: 3 }),
];

describe("normalizeSort", () => {
  it("passes known sorts through", () => {
    expect(normalizeSort("name-asc")).toBe("name-asc");
    expect(normalizeSort("layouts-desc")).toBe("layouts-desc");
  });

  it("falls back to featured for unknown/empty values", () => {
    expect(normalizeSort(undefined)).toBe("featured");
    expect(normalizeSort(null)).toBe("featured");
    expect(normalizeSort("")).toBe("featured");
    expect(normalizeSort("bogus")).toBe("featured");
  });
});

describe("uniqueNeighborhoods", () => {
  it("returns distinct, alphabetically sorted, non-null neighborhoods", () => {
    expect(uniqueNeighborhoods(buildings)).toEqual([
      "Hell's Kitchen",
      "Little Italy",
    ]);
  });

  it("returns an empty array when none are set", () => {
    expect(uniqueNeighborhoods([building({ slug: "x" })])).toEqual([]);
  });
});

describe("filterAndSortBuildings", () => {
  it("returns all buildings (CMS order) with no filters", () => {
    const result = filterAndSortBuildings(buildings, {});
    expect(result.map((b) => b.slug)).toEqual(["bowery", "w48", "mulberry", "e89"]);
  });

  it("filters by neighborhood, case-insensitively", () => {
    const result = filterAndSortBuildings(buildings, { neighborhood: "little italy" });
    expect(result.map((b) => b.slug)).toEqual(["bowery", "mulberry"]);
  });

  it("searches name, neighborhood, and address", () => {
    expect(filterAndSortBuildings(buildings, { q: "mulberry" }).map((b) => b.slug)).toEqual(["mulberry"]);
    expect(filterAndSortBuildings(buildings, { q: "kitchen" }).map((b) => b.slug)).toEqual(["w48"]);
    expect(filterAndSortBuildings(buildings, { q: "east 89" }).map((b) => b.slug)).toEqual(["e89"]);
  });

  it("combines neighborhood and query filters", () => {
    const result = filterAndSortBuildings(buildings, { neighborhood: "Little Italy", q: "138" });
    expect(result.map((b) => b.slug)).toEqual(["bowery"]);
  });

  it("sorts by name A–Z", () => {
    const result = filterAndSortBuildings(buildings, { sort: "name-asc" });
    expect(result.map((b) => b.name)).toEqual([
      "138 Bowery",
      "145 Mulberry",
      "165 East 89th",
      "521 West 48th",
    ]);
  });

  it("sorts by most layouts, breaking ties by name", () => {
    const result = filterAndSortBuildings(buildings, { sort: "layouts-desc" });
    expect(result.map((b) => b.slug)).toEqual(["w48", "e89", "bowery", "mulberry"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterAndSortBuildings(buildings, { q: "nonexistent" })).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [...buildings];
    filterAndSortBuildings(input, { sort: "name-asc" });
    expect(input.map((b) => b.slug)).toEqual(["bowery", "w48", "mulberry", "e89"]);
  });
});
