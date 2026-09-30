import { describe, expect, it } from "vitest";

import { buildingsInNeighborhood } from "@/lib/contact-location";

const buildings = [
  { slug: "138-bowery", name: "138 Bowery", neighborhood: "Bowery" },
  { slug: "145-mulberry", name: "145 Mulberry", neighborhood: "Little Italy" },
  { slug: "no-area", name: "No Area", neighborhood: null },
];

describe("buildingsInNeighborhood", () => {
  it("offers every building when no location is chosen", () => {
    expect(buildingsInNeighborhood(buildings, "")).toEqual(buildings);
    expect(buildingsInNeighborhood(buildings, undefined)).toEqual(buildings);
  });

  it("offers only the chosen location's buildings", () => {
    expect(buildingsInNeighborhood(buildings, "Little Italy").map((b) => b.slug)).toEqual([
      "145-mulberry",
    ]);
  });

  it("offers nothing for a location with no buildings", () => {
    expect(buildingsInNeighborhood(buildings, "Harlem")).toEqual([]);
  });
});
