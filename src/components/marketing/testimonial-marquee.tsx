import { Marquee } from "@/components/marketing/marquee";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import type { Testimonial } from "@/lib/data/testimonials";

/** Resident reviews on a slow continuous scroll, paced for reading. */
export function TestimonialMarquee({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <Marquee
      label="Resident reviews"
      minItemsPerHalf={6}
      secondsPerItem={9}
      itemClassName="w-[19rem] pr-6 sm:w-[23rem]"
      items={testimonials.map((testimonial) => ({
        key: testimonial.quote,
        node: <TestimonialCard testimonial={testimonial} />,
      }))}
    />
  );
}
