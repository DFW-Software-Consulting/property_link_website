import { Section } from "@/components/sections/section";
import { Container } from "@/components/layout/container";

/** Skeleton shown while the long-term rentals listing fetches CMS data. */
export default function LongTermRentalsLoading() {
  return (
    <>
      <Section tone="muted" spacing="sm">
        <Container className="flex max-w-3xl flex-col gap-4 py-8">
          <div className="h-3 w-32 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-5 w-full animate-pulse rounded bg-muted-foreground/10" />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
              >
                <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
