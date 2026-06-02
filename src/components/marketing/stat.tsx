import type { Stat as StatType } from "@/lib/data/stats";

export function Stat({ value, label }: StatType) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-heading text-3xl font-semibold text-primary sm:text-4xl">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
