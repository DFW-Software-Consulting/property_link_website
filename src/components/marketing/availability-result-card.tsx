import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bath,
  BedDouble,
  CalendarCheck,
  ImageOff,
  MapPin,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  availabilityLabel,
  bathroomLabel,
  bedroomLabel,
  requestHref,
} from "@/lib/availability";
import { cmsImageUrl } from "@/lib/cms/client";
import type { CmsAvailabilityResult, CmsImage } from "@/lib/cms/types";

/** One open apartment type from the Check Availability search. */
export function AvailabilityResultCard({
  result,
  hero,
  today,
}: {
  result: CmsAvailabilityResult;
  /** The building's cover photo from the CMS catalog, when it has one. */
  hero: CmsImage | null;
  /** Today in New York (YYYY-MM-DD). */
  today: string;
}) {
  const { building } = result;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
        {hero ? (
          <Image
            src={cmsImageUrl(hero.thumbUrl)}
            alt={hero.alt ?? building.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            className="object-cover"
            {...(hero.blurDataUrl
              ? { placeholder: "blur" as const, blurDataURL: hero.blurDataUrl }
              : {})}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff aria-hidden className="size-8" />
          </div>
        )}
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {building.neighborhood ? (
          <Badge variant="secondary" className="w-fit gap-1">
            <MapPin aria-hidden />
            {building.neighborhood}
          </Badge>
        ) : null}
        <h3 className="font-heading text-lg font-semibold">
          <Link
            href={`/residences/${building.slug}`}
            className="underline-offset-4 hover:text-brand-strong hover:underline"
          >
            {building.name}
          </Link>
        </h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <BedDouble aria-hidden className="size-4" />
            {bedroomLabel(result.bedrooms)}
          </li>
          {result.bathrooms != null ? (
            <li className="flex items-center gap-1.5">
              <Bath aria-hidden className="size-4" />
              {bathroomLabel(result.bathrooms)}
            </li>
          ) : null}
        </ul>
        <p className="flex items-center gap-1.5 text-sm font-medium text-brand-strong">
          <CalendarCheck aria-hidden className="size-4" />
          {availabilityLabel(result.availableFrom, today)}
        </p>
        <Button
          render={<Link href={requestHref(result, today)} />}
          nativeButton={false}
          variant="brand"
          className="mt-auto w-full"
        >
          Request this apartment
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </article>
  );
}
