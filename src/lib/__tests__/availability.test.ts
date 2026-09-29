import { describe, expect, it } from "vitest";

import {
  availabilityLabel,
  bathroomLabel,
  bedroomLabel,
  parseAvailabilitySearch,
  requestHref,
} from "@/lib/availability";

const options = {
  buildingSlugs: ["138-bowery", "145-mulberry"],
  neighborhoods: ["Bowery", "Little Italy"],
};

const result = {
  building: {
    slug: "145-mulberry",
    name: "145 Mulberry",
    neighborhood: "Little Italy",
  },
  bedrooms: 2,
  bathrooms: 1,
  availableFrom: "2026-11-01",
};

describe("parseAvailabilitySearch", () => {
  it("keeps the building, neighborhood, and bedroom count the page offers", () => {
    expect(
      parseAvailabilitySearch(
        { building: "138-bowery", neighborhood: "Bowery", bedrooms: "0" },
        options,
      ),
    ).toEqual({ building: "138-bowery", neighborhood: "Bowery", bedrooms: 0 });
  });

  it("drops blank, unknown, or repeated values", () => {
    expect(
      parseAvailabilitySearch(
        {
          building: "nowhere",
          neighborhood: ["Bowery", "Little Italy"],
          bedrooms: "",
        },
        options,
      ),
    ).toEqual({});
    expect(parseAvailabilitySearch({ bedrooms: "9" }, options)).toEqual({});
    expect(parseAvailabilitySearch({ bedrooms: "1.5" }, options)).toEqual({});
  });
});

describe("labels", () => {
  it("names studios and pluralizes rooms", () => {
    expect(bedroomLabel(0)).toBe("Studio");
    expect(bedroomLabel(1)).toBe("1 bedroom");
    expect(bedroomLabel(3)).toBe("3 bedrooms");
    expect(bathroomLabel(1)).toBe("1 bath");
    expect(bathroomLabel(1.5)).toBe("1.5 baths");
  });

  it("says available now for today or earlier, otherwise the move-in date", () => {
    expect(availabilityLabel("2026-09-29", "2026-09-29")).toBe("Available now");
    expect(availabilityLabel("2026-11-01", "2026-09-29")).toBe(
      "Available Nov 1",
    );
    expect(availabilityLabel("2027-01-05", "2026-11-20")).toBe(
      "Available Jan 5, 2027",
    );
  });
});

describe("requestHref", () => {
  it("pre-fills the contact form with the building, size, and move-in date", () => {
    const url = new URL(
      requestHref(result, "2026-09-29"),
      "https://example.com",
    );

    expect(url.pathname).toBe("/contact");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      building: "145 Mulberry",
      buildingSlug: "145-mulberry",
      unitSize: "two_bedroom",
      moveInDate: "2026-11-01",
    });
  });

  it("uses today for an apartment that is already open and skips sizes the form lacks", () => {
    const url = new URL(
      requestHref(
        { ...result, bedrooms: 6, availableFrom: "2026-09-01" },
        "2026-09-29",
      ),
      "https://example.com",
    );

    expect(url.searchParams.get("moveInDate")).toBe("2026-09-29");
    expect(url.searchParams.has("unitSize")).toBe(false);
  });
});
