/**
 * Amenity token → display-label helpers.
 *
 * The public CMS exposes amenities as stable tokens (e.g. "wifi",
 * "in-unit-laundry"). These turn them into human labels and dedupe the union of
 * a building's own amenities plus its units'. Pure — unit-testable, no DOM deps.
 */

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

type AmenitySource = {
  amenities: string[];
  units: { amenities: string[] }[];
};

/**
 * Deduplicated, alphabetically-sorted amenity labels for a building: its own
 * building-level amenities plus the union across its units. Dedupe is by final
 * label (so "wifi" and "wi-fi" collapse to one "Wi-Fi"); blank tokens dropped.
 */
export function buildingAmenities(building: AmenitySource): string[] {
  const labels = new Set<string>();
  const add = (tokens: string[]) => {
    for (const token of tokens) {
      if (token.trim()) labels.add(amenityLabel(token));
    }
  };
  add(building.amenities);
  for (const unit of building.units) add(unit.amenities);
  return [...labels].sort((a, b) => a.localeCompare(b));
}
