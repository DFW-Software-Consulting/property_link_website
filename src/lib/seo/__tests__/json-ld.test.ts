import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  buildingJsonLd,
  buildingsItemListJsonLd,
} from "../json-ld";

describe("buildingsItemListJsonLd", () => {
  it("builds a positioned ItemList with absolute URLs", () => {
    const ld = buildingsItemListJsonLd([
      { slug: "a", name: "A", neighborhood: null, address: "1", hero: null, unitCount: 0 },
      { slug: "b", name: "B", neighborhood: null, address: "2", hero: null, unitCount: 0 },
    ]);
    expect(ld["@type"]).toBe("ItemList");
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[1]?.position).toBe(2);
    expect(ld.itemListElement[0]?.url).toContain("/long-term-rentals/a");
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds a positioned BreadcrumbList", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Long-Term Rentals", path: "/long-term-rentals" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement[0]?.name).toBe("Home");
    expect(ld.itemListElement[1]?.position).toBe(2);
  });
});

describe("buildingJsonLd", () => {
  it("emits an ApartmentComplex and omits null beds/baths", () => {
    const ld = buildingJsonLd({
      slug: "a",
      name: "A",
      neighborhood: null,
      address: "1 Main St",
      hero: null,
      unitCount: 1,
      description: null,
      amenities: [],
      videoUrl: null,
      images: [],
      units: [
        {
          slug: "u",
          title: "Studio",
          layoutLabel: null,
          beds: null,
          baths: null,
          priceLabel: null,
          priceMonthly: null,
          amenities: [],
          hero: null,
        },
      ],
    });
    const json = JSON.stringify(ld);
    expect(ld["@type"]).toBe("ApartmentComplex");
    expect(json).toContain('"name":"Studio"');
    expect(json).not.toContain("numberOfBedrooms");
  });

  it("includes beds/baths when present", () => {
    const json = JSON.stringify(
      buildingJsonLd({
        slug: "a",
        name: "A",
        neighborhood: null,
        address: "1 Main St",
        hero: null,
        unitCount: 1,
        description: "Nice",
        amenities: [],
        videoUrl: null,
        images: [],
        units: [
          {
            slug: "u",
            title: "1BR",
            layoutLabel: "1 Bedroom",
            beds: 1,
            baths: 1,
            priceLabel: null,
            priceMonthly: null,
            amenities: [],
            hero: null,
          },
        ],
      }),
    );
    expect(json).toContain('"numberOfBedrooms":1');
    expect(json).toContain('"numberOfBathroomsTotal":1');
  });
});
