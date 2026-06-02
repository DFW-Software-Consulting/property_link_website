import type { Amenity } from "@/lib/data/amenities";

export function AmenityItem({ icon: Icon, label, description }: Amenity) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand-strong">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
