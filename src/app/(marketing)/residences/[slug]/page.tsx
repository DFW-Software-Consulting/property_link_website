import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Check, MapPin } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { CtaBand } from "@/components/marketing/cta-band";
import { CmsUnitCard } from "@/components/marketing/cms-unit-card";
import { BuildingLocation } from "@/components/marketing/building-location";
import {
  BuildingGallery,
  type GalleryImage,
} from "@/components/marketing/building-gallery";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import {
  JsonLd,
  breadcrumbJsonLd,
  buildingJsonLd,
  type Crumb,
} from "@/lib/seo/json-ld";
import { cmsImageUrl, getCmsBuilding, listCmsBuildings } from "@/lib/cms/client";
import { descriptionToPlainText } from "@/lib/cms/description";
import { buildingAmenities } from "@/lib/cms/amenities";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

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
  // `description` is now sanitized rich-text HTML; flatten it for meta/OG tags.
  const description =
    descriptionToPlainText(building.description) ||
    `12-month furnished leases at ${building.name}${where} — a building PropertyLink owns and manages.`;
  const path = `/residences/${building.slug}`;
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
    { name: "Residences", path: "/residences" },
    { name: building.name, path: `/residences/${building.slug}` },
  ];

  const inquiryHref = `/contact?inquiryType=long_term&building=${encodeURIComponent(
    building.name,
  )}&buildingSlug=${encodeURIComponent(building.slug)}`;

  // Resolve image URLs server-side so the client gallery gets plain strings.
  const galleryImages: GalleryImage[] = building.images.map((img) => ({
    id: img.id,
    src: cmsImageUrl(img.url),
    thumbSrc: cmsImageUrl(img.thumbUrl),
    alt: img.alt ?? building.name,
    blurDataUrl: img.blurDataUrl,
    width: img.width,
    height: img.height,
  }));
  const amenities = buildingAmenities(building);
  const videoEmbedUrl = getYouTubeEmbedUrl(building.videoUrl);

  // Alternate section background bands regardless of which optional sections
  // render (gallery/video/amenities only appear once the CMS provides the data).
  const sections = [
    ...(building.description ? ["description"] : []),
    "layouts",
    ...(galleryImages.length > 0 ? ["gallery"] : []),
    ...(videoEmbedUrl ? ["video"] : []),
    ...(amenities.length > 0 ? ["amenities"] : []),
    "location",
  ];
  const toneFor = (name: string): "default" | "muted" =>
    sections.indexOf(name) % 2 === 0 ? "default" : "muted";

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
            {...(building.hero.blurDataUrl
              ? { placeholder: "blur" as const, blurDataURL: building.hero.blurDataUrl }
              : {})}
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
            {/* Sanitized rich-text HTML from the CMS (Emmut sanitizes on write). */}
            <div
              className="cms-prose text-base text-pretty text-muted-foreground sm:text-lg"
              dangerouslySetInnerHTML={{ __html: building.description }}
            />
          </Container>
        </Section>
      ) : null}

      <Section tone={toneFor("layouts")}>
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

      {galleryImages.length > 0 ? (
        <Section tone={toneFor("gallery")}>
          <Container className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Photos"
              title="Photo gallery"
              description="A closer look at the building and its spaces."
            />
            <BuildingGallery
              images={galleryImages}
              buildingName={building.name}
              layout={building.galleryLayout}
            />
          </Container>
        </Section>
      ) : null}

      {videoEmbedUrl ? (
        <Section tone={toneFor("video")}>
          <Container className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Video"
              title="Take a video tour"
              description="See the building and its spaces on video."
            />
            <div className="mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <iframe
                src={videoEmbedUrl}
                title={`${building.name} video tour`}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Container>
        </Section>
      ) : null}

      {amenities.length > 0 ? (
        <Section tone={toneFor("amenities")} spacing="sm">
          <Container className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Amenities"
              title="What's included"
              description="Amenities available across this building's homes."
            />
            <ul className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm ring-1 ring-foreground/10"
                >
                  <Check aria-hidden className="size-3.5 text-brand-strong" />
                  {amenity}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <BuildingLocation
        name={building.name}
        address={building.address}
        neighborhood={building.neighborhood}
        tone={toneFor("location")}
      />

      <CtaBand
        title={`Interested in ${building.name}?`}
        description="Tell us your dates and what you're looking for — we'll confirm availability and respond within one business day."
        ctaHref={inquiryHref}
      />
    </>
  );
}
