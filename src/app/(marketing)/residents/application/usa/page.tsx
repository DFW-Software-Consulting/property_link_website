import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { WEIMARK_APPLICATION_URL } from "@/lib/application";

export const metadata: Metadata = {
  title: "USA Rental Application",
  description:
    "Complete PropertyLink NYC's secure online rental application for U.S. residents, powered by Weimark screening.",
};

export default function UsaApplicationPage() {
  return (
    <Section>
      <Container className="flex flex-col gap-8">
        <SectionHeading
          as="h1"
          eyebrow="Rental application"
          title="USA Local Residents"
          description="Complete the secure rental application below, powered by Weimark screening."
        />

        <p className="text-sm text-muted-foreground">
          Having trouble with the embedded application?{" "}
          <a
            href={WEIMARK_APPLICATION_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-medium text-brand-strong underline-offset-4 hover:underline"
          >
            Open the application in a new tab
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
          .
        </p>

        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <iframe
            src={WEIMARK_APPLICATION_URL}
            title="Secure Weimark rental application"
            loading="lazy"
            className="block min-h-[1800px] w-full border-0"
          />
        </div>
      </Container>
    </Section>
  );
}
