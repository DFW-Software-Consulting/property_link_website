import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/data/testimonials";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating;
  return (
    <figure className="flex h-full flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      {rating ? (
        <div role="img" className="flex gap-0.5 text-brand" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={i < rating ? "size-4 fill-current" : "size-4 text-foreground/20"}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
      <blockquote className="flex-1 text-pretty text-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="text-sm">
        <span className="font-medium text-foreground">{testimonial.author}</span>
        <span className="text-muted-foreground"> · {testimonial.source}</span>
      </figcaption>
    </figure>
  );
}
