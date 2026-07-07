import { Section } from "@/components/sections/section";
import { Container } from "@/components/layout/container";

/** Skeleton shown while a building detail page fetches CMS data. */
export default function BuildingLoading() {
  return (
    <>
      <section className="bg-primary">
        <Container className="flex flex-col gap-4 py-20 sm:py-28">
          <div className="h-4 w-40 animate-pulse rounded bg-primary-foreground/20" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-primary-foreground/20" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-primary-foreground/20" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-primary-foreground/10" />
        </Container>
      </section>

      <Section>
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-32 animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted-foreground/20" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
              >
                <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
                <div className="flex flex-col gap-3 p-5">
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
