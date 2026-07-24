import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, Landmark } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Rental Application",
  description:
    "Start your PropertyLink NYC rental application. U.S. residents can complete a secure online application, and international residents can send an inquiry for personalized next steps.",
};

const applicationPaths = [
  {
    title: "USA Local Residents",
    description:
      "Complete a secure online rental application and screening with Weimark.",
    href: "/residents/application/usa",
    action: "Start USA application",
    icon: Landmark,
  },
  {
    title: "International Residents",
    description:
      "Share a few details with our leasing team and we will follow up with the next steps.",
    href: "/residents/application/international",
    action: "Continue as an international applicant",
    icon: Globe2,
  },
] as const;

export default function ApplicationPage() {
  return (
    <>
      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-5 py-8">
          <SectionHeading
            as="h1"
            eyebrow="Residents"
            title="Start your rental application"
            description="Choose the option that matches your residency status. U.S. residents can apply online, while international residents can send an inquiry for help with next steps."
          />
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-6 md:grid-cols-2">
          {applicationPaths.map((path) => {
            const Icon = path.icon;
            return (
              <article
                key={path.href}
                className="flex flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
              >
                <span className="grid size-11 place-items-center rounded-full bg-secondary text-brand-strong">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-xl font-semibold">
                    {path.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {path.description}
                  </p>
                </div>
                <Button
                  render={<Link href={path.href} />}
                  nativeButton={false}
                  variant="brand"
                  size="xl"
                  className="mt-auto w-full sm:w-fit"
                >
                  {path.action}
                  <ArrowRight aria-hidden />
                </Button>
              </article>
            );
          })}
        </Container>
      </Section>
    </>
  );
}
