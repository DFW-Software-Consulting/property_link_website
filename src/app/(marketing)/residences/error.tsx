"use client";

import Link from "next/link";
import { Section } from "@/components/sections/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/** Branded recovery boundary for the long-term rentals routes. */
export default function LongTermRentalsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Section>
      <Container className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this page right now. Please try again, or reach
          out and we&apos;ll help you find the right home.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="brand" size="xl">
            Try again
          </Button>
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            size="xl"
            className="border border-foreground/15 bg-transparent"
          >
            Contact us
          </Button>
        </div>
      </Container>
    </Section>
  );
}
