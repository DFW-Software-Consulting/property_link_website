import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { VideoHero } from "@/components/marketing/video-hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { LogoStrip } from "@/components/marketing/logo-strip";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/lib/data/testimonials";

export const metadata: Metadata = {
  title: "About",
  description:
    "PropertyLink Management NYC owns and manages every building it rents in Manhattan, with furnished stays of 30 days or more and 12-month leases.",
};

const differentiators = [
  "One accountable team owns, manages, and maintains every building.",
  "We know our inventory firsthand, so we match you to the right home.",
  "Direct answers on availability, pricing, and move-in timelines.",
];

const neighborhoods = [
  {
    name: "Little Italy",
    description:
      "Historic streets and cafés bordering SoHo, NoHo, and Tribeca.",
  },
  {
    name: "Hell's Kitchen",
    description:
      "Steps from the Theater District, Restaurant Row, and Midtown.",
  },
  {
    name: "Upper East Side",
    description: "Classic blocks beside Central Park and Museum Mile.",
  },
  {
    name: "Upper West Side",
    description: "Residential blocks between Central Park and Riverside Park.",
  },
  {
    name: "Bowery",
    description:
      "Galleries and historic tenements bordering NoHo, the East Village, and Chinatown.",
  },
];

export default function AboutPage() {
  return (
    <>
      <VideoHero
        eyebrow="About PropertyLink NYC"
        title="Owner-operated apartments in Manhattan"
        description="We only rent apartments in buildings we own, so the same team handles your lease, your building, and your maintenance requests."
      />

      <TrustBar />

      <Section>
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <SectionHeading
              eyebrow="Owner-operated"
              title="Why owning our buildings matters"
            />
            <p className="text-muted-foreground">
              PropertyLink Management owns the buildings it rents. There&apos;s no
              third-party landlord or leasing middleman: the same team handles
              leasing, management, and maintenance.
            </p>
            <p className="text-muted-foreground">
              We offer furnished stays of 30 days or more and 12-month leases, for
              individual residents and for companies housing their staff.
            </p>
          </div>
          <ul className="flex flex-col gap-4 rounded-xl bg-card p-7 ring-1 ring-foreground/10">
            {differentiators.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-strong">
                  <Check className="size-3.5" aria-hidden />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Where we are"
            title="Neighborhoods we serve"
            description="Our buildings are in five Manhattan neighborhoods."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {neighborhoods.map((neighborhood) => (
              <div
                key={neighborhood.name}
                className="flex flex-col gap-2 rounded-xl bg-card p-6 ring-1 ring-foreground/10"
              >
                <Badge variant="secondary" className="w-fit">
                  {neighborhood.name}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {neighborhood.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Corporate housing"
            title="Companies and productions we've housed"
            description="We provide corporate and relocation housing for companies and entertainment productions working in New York."
          />
          <LogoStrip />
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Resident reviews"
            title="What residents say"
            align="center"
            className="mx-auto"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.quote}
                testimonial={testimonial}
              />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
