import Image from "next/image";
import { Container } from "@/components/layout/container";

type VideoHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

/**
 * Same visual treatment as the Home hero (`hero.tsx`), but with a looping
 * background video instead of a static image. Falls back to a static poster
 * frame for users who've asked for reduced motion.
 */
export function VideoHero({ eyebrow, title, description }: VideoHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-primary">
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        poster="/images/hero.jpg"
        className="absolute inset-0 -z-10 size-full object-cover motion-reduce:hidden"
      >
        <source
          src="/video/make_an_ai_video_of_new_yourk.mp4"
          type="video/mp4"
        />
      </video>
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        sizes="100vw"
        className="hidden -z-10 object-cover motion-reduce:block"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/55"
        aria-hidden
      />
      <Container className="flex flex-col justify-center gap-5 py-24 text-primary-foreground sm:py-32 lg:py-40">
        {eyebrow ? (
          <span className="text-xs font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-3xl font-heading text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-xl text-lg text-primary-foreground/85">
          {description}
        </p>
      </Container>
    </section>
  );
}
