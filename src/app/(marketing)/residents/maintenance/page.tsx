import type { Metadata } from "next";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { getPublicMaintenanceUnitInventory } from "@/lib/cms/client";

export const metadata: Metadata = {
  title: "Maintenance Request",
  description:
    "Current PropertyLink NYC residents can submit a maintenance request online. Tell us what needs fixing, attach photos, and set your permission-to-enter preference — our team follows up promptly.",
};

export default async function MaintenanceRequestPage() {
  const unitInventory = await getPublicMaintenanceUnitInventory();

  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Residents"
          title="Submit a maintenance request"
          description="Let us know what needs attention in your apartment. Include photos and your access preferences so we can resolve it as quickly as possible."
        />

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          {/* DOM-first so mobile/tablet readers hit the 911 guidance before
              the form; lg:order-last restores the desktop sidebar spot. */}
          <aside className="flex flex-col gap-6 lg:order-last">
            <div className="flex flex-col gap-5 rounded-xl bg-secondary/50 p-6 ring-1 ring-foreground/10 sm:p-8">
              <h2 className="font-heading text-lg font-semibold">
                What happens next
              </h2>
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-brand-strong"
                    aria-hidden
                  />
                  <span>
                    Your request is logged and routed to the maintenance team
                    for your building.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock
                    className="mt-0.5 size-5 shrink-0 text-brand-strong"
                    aria-hidden
                  />
                  <span>
                    We aim to acknowledge non-urgent requests in a timely
                    manner.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
              <h2 className="font-heading text-lg font-semibold">Emergency?</h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Is there a fire, smoke, a gas leak, or a carbon monoxide alarm?
                Is someone hurt or in danger? Call 911. Do not use this form.
              </p>
              <a
                href="tel:911"
                className="mt-4 inline-flex items-center gap-2 font-heading text-xl font-semibold"
              >
                <Phone className="size-5" aria-hidden />
                911
              </a>
            </div>
          </aside>

          <MaintenanceForm unitInventory={unitInventory} />
        </div>
      </Container>
    </Section>
  );
}
