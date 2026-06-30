import { MapPin, Navigation } from "lucide-react";

import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

type Props = {
  name: string;
  address: string;
  neighborhood: string | null;
  /** Alternates the tonal band against the preceding section. */
  tone?: "default" | "muted";
};

/**
 * "Location" block for a building page: address, an embedded map, and a
 * directions deep link. Keyless — Google's `output=embed` needs no API key and
 * geocodes from the address string; the directions link still works even if the
 * map iframe fails to load. We geocode by address + city/state because building
 * names alone aren't reliably geocodable.
 */
export function BuildingLocation({
  name,
  address,
  neighborhood,
  tone = "default",
}: Props) {
  const query = encodeURIComponent(
    `${address}, ${siteConfig.address.city}, ${siteConfig.address.state}`,
  );
  const mapSrc = `https://www.google.com/maps?q=${query}&z=15&output=embed`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <Section tone={tone} spacing="sm">
      <Container className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="Location"
          title="Where you'll be"
          description={
            neighborhood
              ? `${name} sits in ${neighborhood} — find it on the map below.`
              : `Find ${name} on the map below.`
          }
        />
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden className="size-4 shrink-0 text-brand-strong" />
            {address}
          </p>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <iframe
              title={`Map showing ${name} at ${address}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-video w-full border-0"
            />
          </div>
          <Button
            render={
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
            variant="outline"
            size="lg"
            className="w-full sm:w-fit"
          >
            <Navigation aria-hidden />
            Get directions
          </Button>
        </div>
      </Container>
    </Section>
  );
}
