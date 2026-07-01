import { describe, expect, it } from "vitest";

import { amenityLabel, buildingAmenities } from "../amenities";
import type { CmsUnitSummary } from "../types";

function unit(amenities: string[]): CmsUnitSummary {
  return {
    slug: "u",
    title: "Unit",
    layoutLabel: null,
    beds: null,
    baths: null,
    priceLabel: null,
    priceMonthly: null,
    amenities,
    hero: null,
  };
}

describe("amenityLabel", () => {
  it("maps known tokens to nicer labels", () => {
    expect(amenityLabel("wifi")).toBe("Wi-Fi");
    expect(amenityLabel("in-unit-laundry")).toBe("In-Unit Laundry");
    expect(amenityLabel("ac")).toBe("Air Conditioning");
  });

  it("humanizes unknown tokens", () => {
    expect(amenityLabel("rooftop_terrace")).toBe("Rooftop Terrace");
    expect(amenityLabel("bike storage")).toBe("Bike Storage");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(amenityLabel("  WIFI  ")).toBe("Wi-Fi");
  });
});

describe("buildingAmenities", () => {
  it("dedupes across units and sorts alphabetically", () => {
    const result = buildingAmenities([
      unit(["wifi", "gym"]),
      unit(["gym", "dishwasher"]),
    ]);
    expect(result).toEqual(["Dishwasher", "Gym", "Wi-Fi"]);
  });

  it("collapses tokens that map to the same label", () => {
    expect(buildingAmenities([unit(["wifi", "wi-fi"])])).toEqual(["Wi-Fi"]);
  });

  it("drops blank tokens and returns [] when there are none", () => {
    expect(buildingAmenities([unit(["", "  "])])).toEqual([]);
    expect(buildingAmenities([])).toEqual([]);
  });
});
