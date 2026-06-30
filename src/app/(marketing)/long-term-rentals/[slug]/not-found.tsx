import Link from "next/link";
import { Section } from "@/components/sections/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/** Shown when a building slug doesn't resolve to a published building. */
export default function BuildingNotFound() {
  return (
    <Section>
      <Container className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Property not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This listing may have been removed or isn&apos;t available right now.
          Browse our current long-term rentals instead.
        </p>
        <Button
          render={<Link href="/long-term-rentals" />}
          nativeButton={false}
          variant="brand"
          size="xl"
        >
          Browse all rentals
        </Button>
      </Container>
    </Section>
  );
}
