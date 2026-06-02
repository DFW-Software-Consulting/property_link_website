import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Property } from "@/lib/data/properties";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg">
      <AspectRatio ratio={4 / 3} className="overflow-hidden">
        <Image
          src={property.image}
          alt={`${property.name} building exterior in ${property.neighborhood}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Badge variant="secondary" className="w-fit gap-1">
          <MapPin aria-hidden />
          {property.neighborhood}
        </Badge>
        <h3 className="font-heading text-lg font-semibold">{property.name}</h3>
        <p className="text-sm text-muted-foreground">{property.blurb}</p>
      </div>
    </article>
  );
}
