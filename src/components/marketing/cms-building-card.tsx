import Link from "next/link";
import Image from "next/image";
import { ImageOff, MapPin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { cmsImageUrl } from "@/lib/cms/client";
import type { CmsBuildingSummary } from "@/lib/cms/types";

/** A building tile in the long-term rentals grid, linking to its detail page. */
export function CmsBuildingCard({
  building,
  priority = false,
}: {
  building: CmsBuildingSummary;
  /** Eagerly load the image for above-the-fold cards (improves LCP). */
  priority?: boolean;
}) {
  return (
    <Link
      href={`/long-term-rentals/${building.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <AspectRatio ratio={4 / 3} className="overflow-hidden bg-muted">
        {building.hero ? (
          <Image
            src={cmsImageUrl(building.hero.thumbUrl)}
            alt={
              building.hero.alt ??
              `${building.name}${building.neighborhood ? ` in ${building.neighborhood}` : ""}`
            }
            fill
            preload={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            {...(building.hero.blurDataUrl
              ? { placeholder: "blur" as const, blurDataURL: building.hero.blurDataUrl }
              : {})}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff aria-hidden className="size-8" />
          </div>
        )}
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {building.neighborhood ? (
          <Badge variant="secondary" className="w-fit gap-1">
            <MapPin aria-hidden />
            {building.neighborhood}
          </Badge>
        ) : null}
        <h3 className="font-heading text-lg font-semibold transition-colors group-hover:text-brand-strong">
          {building.name}
        </h3>
        <p className="text-sm text-muted-foreground">{building.address}</p>
        {building.unitCount > 0 ? (
          <p className="mt-auto pt-1 text-sm font-medium text-brand-strong">
            {building.unitCount}{" "}
            {building.unitCount === 1 ? "layout" : "layouts"} available
          </p>
        ) : null}
      </div>
    </Link>
  );
}
