import type { MetadataRoute } from "next";
import { listCmsBuildings } from "@/lib/cms/client";
import { siteConfig } from "@/lib/site-config";

// Refresh alongside the CMS content cadence so newly published buildings appear.
export const revalidate = 60;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/long-term-rentals", priority: 0.9 },
  { path: "/services", priority: 0.8 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/residents/maintenance", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/+$/, "");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: "weekly",
    priority: route.priority,
  }));

  // listCmsBuildings never throws — degrades to the static routes if the CMS is down.
  const buildings = await listCmsBuildings();
  const buildingEntries: MetadataRoute.Sitemap = buildings.map((building) => ({
    url: `${base}/long-term-rentals/${building.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...buildingEntries];
}
