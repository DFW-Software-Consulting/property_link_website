import type { Metadata } from "next";
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

export const revalidate = 60;

const PAGE_DESCRIPTION =
  "Browse PropertyLink's furnished residences across Manhattan — 12-month leases in a building we own and manage, from Little Italy to the Upper East Side.";

export const metadata: Metadata = {
  title: "Residences",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/residences" },
  openGraph: {
    type: "website",
    title: "Residences",
    description: PAGE_DESCRIPTION,
    url: "/residences",
    images: ["/images/hero.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

type SearchParams = Promise<{
  neighborhood?: string;
  q?: string;
  sort?: string;
}>;

export default async function LongTermRentalsPage({
  searchParams,
}: {
  searchParams: SearchParams;
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
      {buildings.length > 0 ? (
        <JsonLd data={buildingsItemListJsonLd(buildings)} />
      ) : null}

      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow="Residences"
            title="Find your home in Manhattan"
            description="Each building below is one we own and manage end-to-end, with 12-month leases available. Explore a property to see its available layouts, then reach out and we'll match you to the right home."
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
                      href="/residences"
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
                No listings available right now
              </h2>
              <p className="text-sm text-muted-foreground">
                We don&apos;t have any residences to show at the moment.
                Reach out and we&apos;ll share what&apos;s available and match you
                to the right home.
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
