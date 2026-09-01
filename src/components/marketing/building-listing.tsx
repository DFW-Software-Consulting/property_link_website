import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, SearchX } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/marketing/cta-band";
import { CmsBuildingCard } from "@/components/marketing/cms-building-card";
import { ListingFilters } from "@/components/marketing/listing-filters";
import { JsonLd, buildingsItemListJsonLd } from "@/lib/seo/json-ld";
import { listCmsBuildings } from "@/lib/cms/client";
import {
  filterAndSortBuildings,
  normalizeSort,
  uniqueNeighborhoods,
} from "@/lib/cms/filter-buildings";

/** Shared shape of the `searchParams` prop for CMS-backed listing pages. */
export type ListingSearchParams = Promise<{
  neighborhood?: string;
  q?: string;
  sort?: string;
}>;

export type BuildingListingCopy = {
  /** Route path used to link back to the unfiltered listing (e.g. "/residences"). */
  basePath: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Emit the buildings ItemList JSON-LD block. Only the canonical residences listing does this. */
  includeJsonLd?: boolean;
  /** Heading shown when there is no CMS inventory at all. */
  emptyTitle: string;
  /** Supporting copy shown when there is no CMS inventory at all. */
  emptyDescription: ReactNode;
};

/**
 * CMS-backed building listing: hero, filter bar, results grid/empty-states,
 * and CTA band. Shared by the residences and short-term-stays pages, which
 * differ only in copy and whether they emit the listing JSON-LD.
 */
export async function BuildingListing({
  searchParams,
  copy,
}: {
  searchParams: ListingSearchParams;
  copy: BuildingListingCopy;
}) {
  const [params, buildings] = await Promise.all([
    searchParams,
    listCmsBuildings(),
  ]);

  const neighborhoods = uniqueNeighborhoods(buildings);
  const current = {
    neighborhood:
      typeof params.neighborhood === "string" ? params.neighborhood : "",
    q: typeof params.q === "string" ? params.q : "",
    sort: normalizeSort(params.sort),
  };
  const visible = filterAndSortBuildings(buildings, current);

  return (
    <>
      {/* JSON-LD always reflects the full inventory, not the filtered view. */}
      {copy.includeJsonLd && buildings.length > 0 ? (
        <JsonLd data={buildingsItemListJsonLd(buildings)} />
      ) : null}

      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-8">
          {buildings.length > 0 ? (
            <>
              <ListingFilters neighborhoods={neighborhoods} current={current} />

              <p
                role="status"
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                {visible.length === buildings.length
                  ? `${buildings.length} ${buildings.length === 1 ? "building" : "buildings"}`
                  : `${visible.length} of ${buildings.length} buildings`}
              </p>

              {visible.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((building, index) => (
                    <CmsBuildingCard
                      key={building.slug}
                      building={building}
                      priority={index < 3}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl bg-card px-6 py-12 text-center ring-1 ring-foreground/10">
                  <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                    <SearchX aria-hidden className="size-6" />
                  </span>
                  <h2 className="font-heading text-lg font-semibold">
                    No buildings match your filters
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Try a different neighborhood or search term — or{" "}
                    <Link
                      href={copy.basePath}
                      className="font-medium text-brand-strong underline-offset-4 hover:underline"
                    >
                      clear all filters
                    </Link>
                    .
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Building2 aria-hidden className="size-6" />
              </span>
              <h2 className="font-heading text-lg font-semibold">
                {copy.emptyTitle}
              </h2>
              <p className="text-sm text-muted-foreground">
                {copy.emptyDescription}
              </p>
              <Button
                render={<Link href="/contact" />}
                nativeButton={false}
                variant="brand"
                size="xl"
              >
                Contact us
              </Button>
            </div>
          )}
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
