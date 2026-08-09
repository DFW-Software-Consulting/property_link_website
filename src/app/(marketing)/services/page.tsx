import type { Metadata } from "next";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/marketing/service-card";
import { AmenityItem } from "@/components/marketing/amenity-item";
import { CtaBand } from "@/components/marketing/cta-band";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { amenities } from "@/lib/data/amenities";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Furnished Housing Services",
  description:
    "Furnished stays of 30 days or more, 12-month leases, and corporate relocation housing across Manhattan — all in PropertyLink-owned buildings with Wi-Fi, utilities, linens, and full kitchens included.",
};

const steps = [
  {
    title: "Inquire",
    description: "Tell us your dates, preferred neighborhood, and what you need.",
  },
  {
    title: "Match & tour",
    description:
      "We match you to available units in our buildings and arrange a viewing.",
  },
  {
    title: "Apply",
    description:
      "A straightforward application — U.S. and international residents welcome.",
  },
  {
    title: "Move in",
    description: "Pick up the keys and settle into a move-in-ready home.",
  },
];

const faqs = [
  {
    question: "What's the minimum stay?",
    answer:
      "Short-term furnished stays start at 30 days. For those who want to settle in, 12-month leases are available.",
  },
  {
    question: "What's included in a furnished unit?",
    answer:
      "Wi-Fi, heat and hot water, air conditioning, fresh linens, and a full kitchen. Arrive with a suitcase — everything else is already there.",
  },
  {
    question: "Are pets allowed?",
    answer: "Yes. Our buildings are pet-friendly, so the whole household is welcome.",
  },
  {
    question: "Which neighborhoods do you cover?",
    answer:
      "Little Italy, Hell's Kitchen, Midtown West, and the Upper East Side — all in buildings we own and manage.",
  },
  {
    question: "How do I apply?",
    answer:
      "Reach out through our contact form or call 888-622-0772. We welcome both U.S. and international residents and respond within one business day.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow="Our services"
            title="Furnished housing for every kind of stay"
            description="Whether you're in town for a month or settling in for years, PropertyLink offers a move-in-ready home in a building we own and manage."
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="What's included"
            title="Every home comes ready for daily life"
            description="No setup, no separate utility accounts, no waiting — these come standard in every furnished unit."
          />
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <AmenityItem key={amenity.label} {...amenity} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="How it works"
            title="From inquiry to keys in four steps"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10"
              >
                <span className="grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex max-w-3xl flex-col gap-8">
          <SectionHeading
            eyebrow="Good to know"
            title="Frequently asked questions"
            align="center"
            className="mx-auto"
          />
          <Accordion className="rounded-xl bg-card px-6 ring-1 ring-foreground/10">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>

      <CtaBand
        title="Found a stay that fits?"
        description="Tell us your dates and what you're looking for — we'll match you to the right home and respond within one business day."
      />
    </>
  );
}
