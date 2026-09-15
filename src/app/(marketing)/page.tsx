import type { Metadata } from "next";
import { CalendarClock, PawPrint, ShieldCheck, Sparkles } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { FeatureCard } from "@/components/marketing/feature-card";
import { AmenityItem } from "@/components/marketing/amenity-item";
import { HomepageBuildings } from "@/components/marketing/homepage-buildings";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import { LogoStrip } from "@/components/marketing/logo-strip";
import { CtaBand } from "@/components/marketing/cta-band";
import { amenities } from "@/lib/data/amenities";
import { testimonials } from "@/lib/data/testimonials";

export const revalidate = 60;

export const metadata: Metadata = {
  description:
    "PropertyLink NYC offers move-in-ready furnished apartments for stays of 30 days or more and 12-month leases across Manhattan. We own and manage every building we rent — from Little Italy to the Upper East Side.",
};

const valueProps = [
  {
    icon: ShieldCheck,
    title: "We own our buildings",
    description:
      "The team you reach is the team that owns and manages your building.",
  },
  {
    icon: Sparkles,
    title: "Furnished apartments",
    description:
      "Furniture, linens, and a full kitchen, with Wi-Fi set up before you move in.",
  },
  {
    icon: CalendarClock,
    title: "30 days to 12 months",
    description:
      "Furnished stays from a 30-day minimum, or settle in on a 12-month lease.",
  },
  {
    icon: PawPrint,
    title: "Pets welcome",
    description: "Subject to building policy and application approval.",
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
            description="We own and operate our buildings, so we know every unit firsthand."
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
            title="In every furnished unit"
            description="What's in place when you move in. Electricity is billed separately."
          />
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <AmenityItem key={amenity.label} {...amenity} />
            ))}
          </div>
        </Container>
      </Section>

      <HomepageBuildings />

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Resident reviews"
            title="What residents say"
            align="center"
            className="mx-auto"
          />
          <TestimonialCarousel testimonials={testimonials} />
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
