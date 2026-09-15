"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WheelEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { Button } from "@/components/ui/button";
import { carouselEdges, nextAutoAdvanceLeft } from "@/lib/carousel";
import type { Testimonial } from "@/lib/data/testimonials";

/** Long enough to read a review before the track moves on. */
const AUTO_ADVANCE_MS = 6000;

/**
 * Horizontally scrolling resident reviews. Auto-advances, but pauses on
 * hover/focus, stops for good once the visitor scrolls or uses the arrows,
 * and never moves under `prefers-reduced-motion`; the track is always
 * manually scrollable (the "pause auto-moving content" accessibility rule).
 */
export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [edges, setEdges] = useState({
    canScrollBack: false,
    canScrollForward: false,
  });
  const scrollable = edges.canScrollBack || edges.canScrollForward;

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (el) setEdges(carouselEdges(el));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  useEffect(() => {
    if (paused || stopped || reducedMotion || !scrollable) return;
    const el = trackRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      el.scrollTo({ left: nextAutoAdvanceLeft(el), behavior: "smooth" });
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, stopped, reducedMotion, scrollable]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    setStopped(true);
    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  // Only a horizontal wheel/trackpad gesture counts as the visitor taking over;
  // scrolling the page vertically past the carousel should not stop it.
  function onWheel(event: WheelEvent<HTMLUListElement>) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) setStopped(true);
  }

  if (testimonials.length === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Resident reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="flex flex-col gap-6"
    >
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        onPointerDown={() => setStopped(true)}
        onWheel={onWheel}
        // Inner padding (offset by a negative margin) keeps the cards' ring from being clipped by the scroll container.
        className="-mx-1 flex snap-x snap-mandatory scroll-px-1 gap-6 overflow-x-auto scroll-smooth px-1 pt-1 pb-2"
      >
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.quote}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]"
          >
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
      </ul>
      {scrollable ? (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => scrollByPage(-1)}
            disabled={!edges.canScrollBack}
            aria-label="Previous reviews"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => scrollByPage(1)}
            disabled={!edges.canScrollForward}
            aria-label="Next reviews"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
