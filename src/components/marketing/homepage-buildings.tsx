import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { CmsBuildingCard } from "@/components/marketing/cms-building-card";
import { PropertyCard } from "@/components/marketing/property-card";
import { listCmsBuildings } from "@/lib/cms/client";
import { properties } from "@/lib/data/properties";

/**
 * Homepage "Our buildings" showcase, driven by the CMS so it stays in sync with
 * the Long-Term Rentals pages (single source of truth). Falls back to the
 * curated static list if the CMS is empty or unreachable, so the homepage always
 * shows buildings. Async server component — the CMS fetch is ISR-cached (60s),
 * so the homepage stays statically rendered.
 */
export async function HomepageBuildings() {
  const cmsBuildings = await listCmsBuildings();
  const useCms = cmsBuildings.length > 0;

  return (
    <Section id="properties" className="scroll-mt-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Our buildings"
          title="Buildings we own across Manhattan"
          description="Every PropertyLink home sits in a building we own and manage, in some of Manhattan's most connected neighborhoods."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCms
            ? cmsBuildings.map((building, index) => (
                <CmsBuildingCard
                  key={building.slug}
                  building={building}
                  priority={index < 3}
                />
              ))
            : properties.map((property) => (
                <PropertyCard key={property.slug} property={property} />
              ))}
        </div>
      </Container>
    </Section>
  );
}
