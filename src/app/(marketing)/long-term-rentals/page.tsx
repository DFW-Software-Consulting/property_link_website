import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/marketing/cta-band";
import { CmsBuildingCard } from "@/components/marketing/cms-building-card";
import { JsonLd, buildingsItemListJsonLd } from "@/lib/seo/json-ld";
import { listCmsBuildings } from "@/lib/cms/client";

export const revalidate = 60;

const PAGE_DESCRIPTION =
  "Browse PropertyLink's long-term furnished rentals across Manhattan — every home in a building we own and manage, from Little Italy to the Upper East Side.";

export const metadata: Metadata = {
  title: "Long-Term Rentals",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/long-term-rentals" },
  openGraph: {
    type: "website",
    title: "Long-Term Rentals",
    description: PAGE_DESCRIPTION,
    url: "/long-term-rentals",
    images: ["/images/hero.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export default async function LongTermRentalsPage() {
  const buildings = await listCmsBuildings();

  return (
    <>
      {buildings.length > 0 ? (
        <JsonLd data={buildingsItemListJsonLd(buildings)} />
      ) : null}

      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow="Long-term rentals"
            title="Find your long-term home in Manhattan"
            description="Each building below is one we own and manage end-to-end. Explore a property to see its available layouts, then reach out and we'll match you to the right home."
          />
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-10">
          {buildings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((building, index) => (
                <CmsBuildingCard
                  key={building.slug}
                  building={building}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Building2 aria-hidden className="size-6" />
              </span>
              <h2 className="font-heading text-lg font-semibold">
                No listings available right now
              </h2>
              <p className="text-sm text-muted-foreground">
                We don&apos;t have any long-term rentals to show at the moment.
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
