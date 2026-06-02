import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <span className="grid size-11 place-items-center rounded-lg bg-brand/15 text-brand-strong">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
