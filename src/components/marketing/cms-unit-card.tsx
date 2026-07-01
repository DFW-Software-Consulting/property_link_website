import Image from "next/image";
import { Bath, BedDouble, ImageOff } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cmsImageUrl } from "@/lib/cms/client";
import type { CmsUnitSummary } from "@/lib/cms/types";

/** A unit (layout) tile shown inline on a building's detail page. */
export function CmsUnitCard({ unit }: { unit: CmsUnitSummary }) {
  const hasSpecs = unit.beds != null || unit.baths != null;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <AspectRatio ratio={4 / 3} className="overflow-hidden bg-muted">
        {unit.hero ? (
          <Image
            src={cmsImageUrl(unit.hero.thumbUrl)}
            alt={unit.hero.alt ?? unit.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            {...(unit.hero.blurDataUrl
              ? { placeholder: "blur" as const, blurDataURL: unit.hero.blurDataUrl }
              : {})}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff aria-hidden className="size-8" />
          </div>
        )}
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-heading text-base font-semibold">{unit.title}</h3>
        {unit.layoutLabel ? (
          <p className="text-sm text-muted-foreground">{unit.layoutLabel}</p>
        ) : null}
        {hasSpecs ? (
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
            {unit.beds != null ? (
              <span className="flex items-center gap-1.5">
                <BedDouble aria-hidden className="size-4" />
                {unit.beds} {unit.beds === 1 ? "bed" : "beds"}
              </span>
            ) : null}
            {unit.baths != null ? (
              <span className="flex items-center gap-1.5">
                <Bath aria-hidden className="size-4" />
                {unit.baths} {unit.baths === 1 ? "bath" : "baths"}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
