import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Section } from "@/components/sections/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Container } from "@/components/layout/container";
import { ContactForm } from "@/components/contact/contact-form";
import {
  FacebookIcon,
  InstagramIcon,
} from "@/components/icons/social-icons";
import { INQUIRY_TYPES, type InquiryType } from "@/lib/schemas/contact";
import { getSiteContactInfo } from "@/lib/contact-info";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact PropertyLink NYC about furnished stays of 30 days or more, 12-month leases, and corporate housing in Manhattan. Call 888-622-0772 — we respond within one business day.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const contact = await getSiteContactInfo();
  const building =
    typeof params.building === "string" ? params.building : undefined;
  const buildingSlug =
    typeof params.buildingSlug === "string" ? params.buildingSlug : undefined;
  const requestedType =
    typeof params.inquiryType === "string" ? params.inquiryType : undefined;
  const initialInquiryType: InquiryType | undefined =
    requestedType && (INQUIRY_TYPES as readonly string[]).includes(requestedType)
      ? (requestedType as InquiryType)
      : undefined;

  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Let's find your New York home"
        />

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <ContactForm
            building={building}
            buildingSlug={buildingSlug}
            initialInquiryType={initialInquiryType}
          />

          <aside className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 rounded-xl bg-secondary/50 p-6 ring-1 ring-foreground/10 sm:p-8">
              <h2 className="font-heading text-lg font-semibold">
                Reach us directly
              </h2>
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 size-5 shrink-0 text-brand-strong"
                    aria-hidden
                  />
                  <span>{siteConfig.address.full}</span>
                </li>
                <li>
                  <a
                    href={contact.phone.href}
                    className="flex items-center gap-3 transition-colors hover:text-brand-strong"
                  >
                    <Phone
                      className="size-5 shrink-0 text-brand-strong"
                      aria-hidden
                    />
                    {contact.phone.display}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 transition-colors hover:text-brand-strong"
                  >
                    <Mail
                      className="size-5 shrink-0 text-brand-strong"
                      aria-hidden
                    />
                    {contact.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock
                    className="mt-0.5 size-5 shrink-0 text-brand-strong"
                    aria-hidden
                  />
                  <span className="flex flex-col gap-0.5">
                    {siteConfig.hours.map((entry) => (
                      <span key={entry.days}>
                        <span className="font-medium text-foreground">
                          {entry.days}:
                        </span>{" "}
                        {entry.time}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>

              <div className="flex items-center gap-2 border-t border-border pt-5">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="PropertyLink NYC on Instagram"
                  className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <InstagramIcon className="size-4" />
                </a>
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="PropertyLink NYC on Facebook"
                  className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <FacebookIcon className="size-4" />
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
              <h2 className="font-heading text-lg font-semibold">
                Prefer to call?
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Our team is available Monday–Friday, 9:00 AM–6:00 PM EST to talk
                through availability and next steps.
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
        </div>
      </Container>
    </Section>
  );
}
