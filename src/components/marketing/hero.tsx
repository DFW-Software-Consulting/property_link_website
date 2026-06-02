import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary">
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/55"
        aria-hidden
      />
      <Container className="flex flex-col justify-center gap-6 py-24 text-primary-foreground sm:py-32 lg:py-40">
        <Badge className="w-fit gap-1.5 bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          Owner-operated since 2015
        </Badge>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
          Furnished Manhattan apartments, in buildings we own.
        </h1>
        <p className="max-w-xl text-lg text-primary-foreground/85">
          Move-in-ready short- and long-term homes across Little Italy, Hell&apos;s
          Kitchen, Midtown West, and the Upper East Side — managed end-to-end by
          the people who own the building.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            variant="brand"
            size="xl"
          >
            Check Availability
            <ArrowRight aria-hidden />
          </Button>
          <Button
            render={<Link href="#properties" />}
            nativeButton={false}
            size="xl"
            className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            View our buildings
          </Button>
        </div>
      </Container>
    </section>
  );
}
