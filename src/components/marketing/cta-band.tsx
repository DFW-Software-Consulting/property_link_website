import Link from "next/link";
import { Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

type CtaBandProps = {
  title?: string;
  description?: string;
  /** Destination for the primary CTA button (defaults to the contact page). */
  ctaHref?: string;
};

export function CtaBand({ title, description, ctaHref = "/contact" }: CtaBandProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <h2 className="max-w-2xl font-heading text-3xl font-semibold text-balance sm:text-4xl">
          {title ?? "Ready to find your New York home?"}
        </h2>
        <p className="max-w-2xl text-primary-foreground/80">
          {description ??
            "Tell us your dates and what you're looking for — we respond within one business day."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href={ctaHref} />}
            nativeButton={false}
            variant="brand"
            size="xl"
          >
            Check Availability
          </Button>
          <Button
            render={<a href={siteConfig.phone.href} />}
            nativeButton={false}
            size="xl"
            className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Phone aria-hidden />
            {siteConfig.phone.display}
          </Button>
        </div>
      </Container>
    </section>
  );
}
