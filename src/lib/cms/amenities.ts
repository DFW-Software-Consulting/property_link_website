/**
 * Amenity token → display-label helpers.
 *
 * The public CMS exposes amenities as stable tokens (e.g. "wifi",
 * "in-unit-laundry"). These turn them into human labels and dedupe the union
 * across a building's units. Pure — unit-testable, no Next/DOM deps.
 */

import type { CmsUnitSummary } from "./types";

/** Tokens with nicer labels than a generic humanize would produce. */
const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  "wi-fi": "Wi-Fi",
  ac: "Air Conditioning",
  "air-conditioning": "Air Conditioning",
  "in-unit-laundry": "In-Unit Laundry",
  laundry: "Laundry",
  dishwasher: "Dishwasher",
  elevator: "Elevator",
  doorman: "Doorman",
  gym: "Gym",
  "roof-deck": "Roof Deck",
  parking: "Parking",
  "pet-friendly": "Pet-Friendly",
  balcony: "Balcony",
  furnished: "Furnished",
};

/** Humanize an amenity token into a display label. */
export function amenityLabel(token: string): string {
  const key = token.trim().toLowerCase();
  const known = AMENITY_LABELS[key];
  if (known) return known;
  return key
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Deduplicated, alphabetically-sorted amenity labels across a building's units.
 * Dedupe is by final label (so "wifi" and "wi-fi" collapse to one "Wi-Fi");
 * blank tokens are dropped.
 */
export function buildingAmenities(units: CmsUnitSummary[]): string[] {
  const labels = new Set<string>();
  for (const unit of units) {
    for (const token of unit.amenities) {
      if (!token.trim()) continue;
      labels.add(amenityLabel(token));
    }
  }
  return [...labels].sort((a, b) => a.localeCompare(b));
}
