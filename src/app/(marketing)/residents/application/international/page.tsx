import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { InternationalInquiryForm } from "@/components/application/international-inquiry-form";

export const metadata: Metadata = {
  title: "International Rental Application",
  description:
    "International residents can submit a PropertyLink NYC rental application online, including passport details and references, and our leasing team will follow up with the next steps.",
};

export default function InternationalApplicationPage() {
  return (
    <Section>
      <Container className="flex max-w-3xl flex-col gap-8">
        <SectionHeading
          as="h1"
          eyebrow="Rental application"
          title="International Residents"
          description="International applicants cannot complete U.S. credit screening online. Complete the application below — including a copy of your passport — and our leasing team will follow up with the next steps."
        />
        <InternationalInquiryForm />
      </Container>
    </Section>
  );
}
