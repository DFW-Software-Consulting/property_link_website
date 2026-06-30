import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { CtaBand } from "@/components/marketing/cta-band";
import { CmsUnitCard } from "@/components/marketing/cms-unit-card";
import { BuildingLocation } from "@/components/marketing/building-location";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import {
  JsonLd,
  breadcrumbJsonLd,
  buildingJsonLd,
  type Crumb,
} from "@/lib/seo/json-ld";
import { cmsImageUrl, getCmsBuilding, listCmsBuildings } from "@/lib/cms/client";

export const revalidate = 60;

export async function generateStaticParams() {
  const buildings = await listCmsBuildings();
  return buildings.map((building) => ({ slug: building.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const building = await getCmsBuilding(slug);
  if (!building) return { title: "Property not found" };

  const where = building.neighborhood ? `, ${building.neighborhood}` : "";
  const description =
    building.description ??
    `Long-term furnished rentals at ${building.name}${where} — a building PropertyLink owns and manages.`;
  const path = `/long-term-rentals/${building.slug}`;
  const ogImages = building.hero
    ? [
        {
          url: cmsImageUrl(building.hero.url),
          alt: building.hero.alt ?? building.name,
          ...(building.hero.width && building.hero.height
            ? { width: building.hero.width, height: building.hero.height }
            : {}),
        },
      ]
    : undefined;

  return {
    title: building.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: building.name,
      description,
      url: path,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: { card: "summary_large_image", title: building.name, description },
  };
}

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const building = await getCmsBuilding(slug);
  if (!building) notFound();

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Long-Term Rentals", path: "/long-term-rentals" },
    { name: building.name, path: `/long-term-rentals/${building.slug}` },
  ];

  const inquiryHref = `/contact?inquiryType=long_term&building=${encodeURIComponent(
    building.name,
  )}&buildingSlug=${encodeURIComponent(building.slug)}`;

  return (
    <>
      <JsonLd data={buildingJsonLd(building)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="relative isolate overflow-hidden bg-primary">
        {building.hero ? (
          <Image
            src={cmsImageUrl(building.hero.url)}
            alt={building.hero.alt ?? building.name}
            fill
            preload
            sizes="100vw"
            className="-z-10 object-cover"
          />
        ) : null}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/55"
          aria-hidden
        />
        <Container className="flex flex-col gap-4 py-20 text-primary-foreground sm:py-28">
          {building.neighborhood ? (
            <Badge className="w-fit gap-1 bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20">
              <MapPin aria-hidden />
              {building.neighborhood}
            </Badge>
          ) : null}
          <h1 className="max-w-3xl font-heading text-4xl font-semibold text-balance sm:text-5xl">
            {building.name}
          </h1>
          <p className="flex items-center gap-2 text-primary-foreground/85">
            <MapPin aria-hidden className="size-4" />
            {building.address}
          </p>
        </Container>
      </section>

      <div className="border-b border-border/60">
        <Container className="py-3">
          <Breadcrumbs items={crumbs} />
        </Container>
      </div>

      {building.description ? (
        <Section spacing="sm">
          <Container className="max-w-3xl">
            <p className="text-base text-pretty text-muted-foreground sm:text-lg">
              {building.description}
            </p>
          </Container>
        </Section>
      ) : null}

      <Section tone={building.description ? "muted" : "default"}>
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Available layouts"
            title={
              building.units.length > 0
                ? "Floor plans in this building"
                : "Availability"
            }
            description={
              building.units.length > 0
                ? "Each layout is move-in ready and furnished. Reach out and we'll confirm current availability and pricing."
                : "We don't have published layouts for this building right now — contact us and we'll share what's available."
            }
          />
          {building.units.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {building.units.map((unit) => (
                <CmsUnitCard key={unit.slug} unit={unit} />
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      <BuildingLocation
        name={building.name}
        address={building.address}
        neighborhood={building.neighborhood}
        tone={building.description ? "default" : "muted"}
      />

      <CtaBand
        title={`Interested in ${building.name}?`}
        description="Tell us your dates and what you're looking for — we'll confirm availability and respond within one business day."
        ctaHref={inquiryHref}
      />
    </>
  );
}
