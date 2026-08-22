import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { TrustBar } from "@/components/marketing/trust-bar";
import { LogoStrip } from "@/components/marketing/logo-strip";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/lib/data/testimonials";

export const metadata: Metadata = {
  title: "About",
  description:
    "Founded in 2015, PropertyLink Management NYC is a furnished-housing provider that owns every building it rents. Learn about our owner-operated approach and the companies that trust us.",
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
    name: "Midtown West",
    description: "Central to Broadway, major transit, and the West Side.",
  },
  {
    name: "Upper East Side",
    description: "Classic blocks beside Central Park and Museum Mile.",
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
      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow="About PropertyLink NYC"
            title="New York City's premier furnished housing provider"
            description="Since 2015, we've taken a different approach to renting in Manhattan: we only offer apartments in buildings we own. That means one team is responsible for your home — and your experience — from start to finish."
          />
        </Container>
      </Section>

      <TrustBar />

      <Section>
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <SectionHeading
              eyebrow="Owner-operated"
              title="Why owning our buildings matters"
            />
            <p className="text-muted-foreground">
              PropertyLink Management was founded on a simple idea: the best way
              to give residents a great experience is to own the buildings we
              rent. There&apos;s no third-party landlord and no leasing middleman —
              just one team that knows every unit and stands behind it.
            </p>
            <p className="text-muted-foreground">
              That ownership lets us keep our homes genuinely move-in ready, keep
              our prices fair, and respond quickly when something comes up. It&apos;s
              why residents and corporate partners alike keep coming back.
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
            description="Our buildings sit in five of Manhattan's most connected and characterful neighborhoods."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            eyebrow="Trusted partners"
            title="Companies and productions trust us with their people"
            description="We provide corporate and relocation housing for leading companies and entertainment productions working in New York."
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
