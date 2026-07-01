"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/** A gallery image with URLs already resolved server-side (client-safe). */
export type GalleryImage = {
  id: string;
  src: string;
  thumbSrc: string;
  alt: string;
  blurDataUrl: string | null;
  width: number | null;
  height: number | null;
};

export type GalleryLayout = "grid" | "carousel";

/** Thumbnail button that opens the lightbox at `index`. */
function GalleryThumb({
  image,
  index,
  count,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  count: number;
  onOpen: (index: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`View photo ${index + 1} of ${count}${image.alt ? `: ${image.alt}` : ""}`}
      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Image
        src={image.thumbSrc}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 288px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        {...(image.blurDataUrl
          ? { placeholder: "blur" as const, blurDataURL: image.blurDataUrl }
          : {})}
      />
    </button>
  );
}

/**
 * Building photo gallery with an accessible lightbox. `layout` renders either a
 * responsive grid or a horizontal auto-scrolling carousel. base-ui's Dialog
 * provides the focus trap, Escape-to-close, scroll lock, and aria-modal; we add
 * left/right arrow-key navigation and prev/next controls.
 *
 * The carousel auto-advances but pauses on hover/focus, when the lightbox is
 * open, and entirely under `prefers-reduced-motion` — and is always manually
 * scrollable — to satisfy the "pause auto-moving content" accessibility rule.
 */
export function BuildingGallery({
  images,
  buildingName,
  layout = "grid",
}: {
  images: GalleryImage[];
  buildingName: string;
  layout?: GalleryLayout;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const count = images.length;

  const scrollRef = useRef<HTMLUListElement>(null);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % count)),
    [count],
  );
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + count) % count)),
    [count],
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    // Capture phase: base-ui's Dialog stops arrow-key propagation in the bubble
    // phase, so a normal (bubble) window listener never sees ArrowLeft/Right.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, next, prev]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (layout !== "carousel" || carouselPaused || reducedMotion || isOpen || count <= 1) {
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({
        left: nearEnd ? 0 : el.scrollLeft + el.clientWidth * 0.8,
        behavior: "smooth",
      });
    }, 3500);
    return () => window.clearInterval(id);
  }, [layout, carouselPaused, reducedMotion, isOpen, count]);

  if (count === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      {layout === "carousel" ? (
        <ul
          ref={scrollRef}
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
          onFocusCapture={() => setCarouselPaused(true)}
          onBlurCapture={() => setCarouselPaused(false)}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
        >
          {images.map((image, i) => (
            <li key={image.id} className="w-64 shrink-0 snap-start sm:w-72">
              <GalleryThumb image={image} index={i} count={count} onOpen={setOpenIndex} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, i) => (
            <li key={image.id}>
              <GalleryThumb image={image} index={i} count={count} onOpen={setOpenIndex} />
            </li>
          ))}
        </ul>
      )}

      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 focus:outline-none">
            <Dialog.Title className="sr-only">{buildingName} photos</Dialog.Title>

            {/* Always-mounted live region so screen readers reliably announce the
                photo change as the visitor pages through the gallery. */}
            <div aria-live="polite" className="sr-only">
              {active ? `Photo ${(openIndex ?? 0) + 1} of ${count}${active.alt ? `, ${active.alt}` : ""}` : ""}
            </div>

            {active ? (
              <figure className="flex max-h-full max-w-5xl flex-col items-center">
                <Image
                  key={active.id}
                  src={active.src}
                  alt={active.alt}
                  width={active.width ?? 1200}
                  height={active.height ?? 800}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="max-h-[80vh] w-auto rounded-lg"
                  {...(active.blurDataUrl
                    ? { placeholder: "blur" as const, blurDataURL: active.blurDataUrl }
                    : {})}
                />
                <figcaption className="mt-3 text-center text-sm text-white/80">
                  {(openIndex ?? 0) + 1} / {count}
                  {active.alt ? ` — ${active.alt}` : ""}
                </figcaption>
              </figure>
            ) : null}

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-4 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-4 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            ) : null}

            <Dialog.Close
              aria-label="Close gallery"
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
