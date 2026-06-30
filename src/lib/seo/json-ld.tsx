/**
 * Schema.org JSON-LD builders + a tiny renderer for the marketing pages.
 *
 * Builders return plain objects; <JsonLd> serializes them into a
 * <script type="application/ld+json"> tag. `<` is escaped so CMS-provided
 * strings can never break out of the script element.
 */

import { cmsImageUrl } from "@/lib/cms/client";
import type { CmsBuilding, CmsBuildingSummary } from "@/lib/cms/types";
import { siteConfig } from "@/lib/site-config";

/** A breadcrumb step — drives both the visible trail and the BreadcrumbList. */
export type Crumb = { name: string; path: string };

function absoluteUrl(path: string): string {
  return `${siteConfig.url.replace(/\/+$/, "")}${path}`;
}

/** ItemList of buildings for the long-term rentals listing page. */
export function buildingsItemListJsonLd(buildings: CmsBuildingSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: buildings.map((building, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/long-term-rentals/${building.slug}`),
      name: building.name,
    })),
  };
}

/** BreadcrumbList mirroring the visible breadcrumb trail. */
export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** ApartmentComplex node for a building detail page. */
export function buildingJsonLd(building: CmsBuilding) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: building.name,
    url: absoluteUrl(`/long-term-rentals/${building.slug}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: building.address,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      addressCountry: "US",
    },
  };

  if (building.description) node.description = building.description;
  if (building.hero) node.image = cmsImageUrl(building.hero.url);

  if (building.units.length > 0) {
    node.numberOfAvailableAccommodationUnits = {
      "@type": "QuantitativeValue",
      value: building.units.length,
    };
    node.containsPlace = building.units.map((unit) => {
      const apartment: Record<string, unknown> = { "@type": "Apartment", name: unit.title };
      if (unit.beds != null) apartment.numberOfBedrooms = unit.beds;
      if (unit.baths != null) apartment.numberOfBathroomsTotal = unit.baths;
      return apartment;
    });
  }

  return node;
}

/** Renders a JSON-LD object into the document. Safe for CMS-sourced strings. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
