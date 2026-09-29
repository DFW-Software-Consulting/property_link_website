import type { Metadata } from "next";
import Link from "next/link";
import { CalendarSearch, SearchX } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { AvailabilityResultCard } from "@/components/marketing/availability-result-card";
import {
  BEDROOM_OPTIONS,
  bedroomLabel,
  parseAvailabilitySearch,
} from "@/lib/availability";
import { listCmsBuildings, searchCmsAvailability } from "@/lib/cms/client";
import { uniqueNeighborhoods } from "@/lib/cms/filter-buildings";
import { todayInNewYork } from "@/lib/dates";

const PAGE_DESCRIPTION =
  "Check which PropertyLink apartments are open now or soon. Search by neighborhood, building, and number of bedrooms.";

export const metadata: Metadata = {
  title: "Check Availability",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/availability" },
};

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, buildings] = await Promise.all([
    searchParams,
    listCmsBuildings(),
  ]);
  const neighborhoods = uniqueNeighborhoods(buildings);
  const search = parseAvailabilitySearch(params, {
    buildingSlugs: buildings.map((b) => b.slug),
    neighborhoods,
  });
  const results = await searchCmsAvailability(search);
  const heroBySlug = new Map(buildings.map((b) => [b.slug, b.hero]));
  const today = todayInNewYork();
  const filtered = Object.keys(search).length > 0;

  return (
    <>
      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow="Check Availability"
            title="See what's open"
            description="Apartments below are open now or opening within the next few months, for stays of 30 days or more. Pick one to send us a request and we'll confirm the details."
          />
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-8">
          <form
            action="/availability"
            method="get"
            role="search"
            aria-label="Search available apartments"
            className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="neighborhood" className="text-sm font-medium">
                Location
              </label>
              <select
                id="neighborhood"
                name="neighborhood"
                defaultValue={search.neighborhood ?? ""}
                className={selectClassName}
              >
                <option value="">Any neighborhood</option>
                {neighborhoods.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="building" className="text-sm font-medium">
                Building
              </label>
              <select
                id="building"
                name="building"
                defaultValue={search.building ?? ""}
                className={selectClassName}
              >
                <option value="">Any building</option>
                {buildings.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bedrooms" className="text-sm font-medium">
                Bedrooms
              </label>
              <select
                id="bedrooms"
                name="bedrooms"
                defaultValue={
                  search.bedrooms === undefined ? "" : String(search.bedrooms)
                }
                className={selectClassName}
              >
                <option value="">Any size</option>
                {BEDROOM_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {bedroomLabel(count)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              variant="brand"
              size="xl"
              className="sm:col-span-2 lg:col-span-1"
            >
              <CalendarSearch aria-hidden />
              Search
            </Button>
          </form>

          {results === null ? (
            <EmptyState
              title="We couldn't check availability just now"
              body="Please try again in a moment, or send us a message and we'll tell you what's open."
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="Nothing open matches your search"
              body={
                filtered
                  ? "Try another neighborhood, building, or size, or send us a message and we'll let you know when something opens up."
                  : "Send us a message and we'll let you know when something opens up."
              }
              showReset={filtered}
            />
          ) : (
            <>
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                {results.length} {results.length === 1 ? "match" : "matches"}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <AvailabilityResultCard
                    key={`${result.building.slug}-${result.bedrooms}-${result.bathrooms}`}
                    result={result}
                    hero={heroBySlug.get(result.building.slug) ?? null}
                    today={today}
                  />
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}

function EmptyState({
  title,
  body,
  showReset = false,
}: {
  title: string;
  body: string;
  showReset?: boolean;
}) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl bg-card px-6 py-12 text-center ring-1 ring-foreground/10"
    >
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX aria-hidden className="size-6" />
      </span>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button
          render={<Link href="/contact" />}
          nativeButton={false}
          variant="brand"
        >
          Send us a message
        </Button>
        {showReset ? (
          <Button
            render={<Link href="/availability" />}
            nativeButton={false}
            variant="outline"
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
