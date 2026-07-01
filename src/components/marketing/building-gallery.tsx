"use client";

import { useCallback, useEffect, useState } from "react";
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

/**
 * Building photo grid with an accessible lightbox. base-ui's Dialog provides the
 * focus trap, Escape-to-close, scroll lock, and aria-modal; we add left/right
 * arrow-key navigation and prev/next controls.
 */
export function BuildingGallery({
  images,
  buildingName,
}: {
  images: GalleryImage[];
  buildingName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const count = images.length;

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

  if (count === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`View photo ${i + 1} of ${count}${image.alt ? `: ${image.alt}` : ""}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Image
                src={image.thumbSrc}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                {...(image.blurDataUrl
                  ? { placeholder: "blur" as const, blurDataURL: image.blurDataUrl }
                  : {})}
              />
            </button>
          </li>
        ))}
      </ul>

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
