import type { Metadata } from "next";
import { CalendarClock, PawPrint, ShieldCheck, Sparkles } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { FeatureCard } from "@/components/marketing/feature-card";
import { AmenityItem } from "@/components/marketing/amenity-item";
import { PropertyCard } from "@/components/marketing/property-card";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { LogoStrip } from "@/components/marketing/logo-strip";
import { CtaBand } from "@/components/marketing/cta-band";
import { amenities } from "@/lib/data/amenities";
import { properties } from "@/lib/data/properties";
import { testimonials } from "@/lib/data/testimonials";

export const metadata: Metadata = {
  description:
    "PropertyLink NYC offers move-in-ready furnished apartments for short- and long-term stays across Manhattan. We own and manage every building we rent — from Little Italy to the Upper East Side.",
};

const valueProps = [
  {
    icon: ShieldCheck,
    title: "We own every building",
    description:
      "No middlemen, no runaround. The team you reach is the team that owns and manages your building.",
  },
  {
    icon: Sparkles,
    title: "Truly move-in ready",
    description:
      "Furnished and stocked with Wi-Fi, linens, and a full kitchen. Arrive with a suitcase.",
  },
  {
    icon: CalendarClock,
    title: "Flexible terms",
    description:
      "From 30-day furnished stays to long-term leases, matched to your timeline.",
  },
  {
    icon: PawPrint,
    title: "Pet-friendly",
    description:
      "Bring the whole household — pets are welcome across our buildings.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />

      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Why PropertyLink"
            title="A different kind of Manhattan landlord"
            description="Because we own and operate our buildings, we know every unit firsthand — and we're accountable for your experience from your first inquiry to your last day."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="What's included"
            title="Everything's already here"
            description="Each furnished home comes ready for daily life — no setup, no separate utility accounts, no waiting."
          />
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <AmenityItem key={amenity.label} {...amenity} />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="properties" className="scroll-mt-16">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Our buildings"
            title="Seven buildings, four neighborhoods"
            description="Every PropertyLink home sits in a building we own across some of Manhattan's most connected neighborhoods."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Resident reviews"
            title="Trusted by New Yorkers and the companies that move them"
            align="center"
            className="mx-auto"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.quote} testimonial={testimonial} />
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="sm">
        <Container>
          <LogoStrip heading="Trusted by teams at" />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
