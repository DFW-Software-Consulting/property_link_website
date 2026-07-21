import type { Metadata } from "next";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { getSiteContactInfo } from "@/lib/contact-info";
import { getPublicMaintenanceUnitInventory } from "@/lib/cms/client";

export const metadata: Metadata = {
  title: "Maintenance Request",
  description:
    "Current PropertyLink NYC residents can submit a maintenance request online. Tell us what needs fixing, attach photos, and set your permission-to-enter preference — our team follows up promptly.",
};

export default async function MaintenanceRequestPage() {
  const [contact, unitInventory] = await Promise.all([
    getSiteContactInfo(),
    getPublicMaintenanceUnitInventory(),
  ]);

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
                    We aim to acknowledge non-urgent requests within one
                    business day.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
              <h2 className="font-heading text-lg font-semibold">
                Urgent issue?
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                If there&apos;s a fire, gas leak, smoke, or carbon monoxide
                alarm,{" "}
                <strong className="font-semibold text-primary-foreground">
                  call 911 first
                </strong>
                . For urgent building issues that aren&apos;t life-threatening —
                no heat, a major leak, a lockout — call us right away instead of
                using this form.
              </p>
              <a
                href={contact.phone.href}
                className="mt-4 inline-flex items-center gap-2 font-heading text-xl font-semibold"
              >
                <Phone className="size-5" aria-hidden />
                {contact.phone.display}
              </a>
            </div>
          </aside>

          <MaintenanceForm unitInventory={unitInventory} />
        </div>
      </Container>
    </Section>
  );
}
