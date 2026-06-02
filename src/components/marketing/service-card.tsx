import { Check } from "lucide-react";
import type { Service } from "@/lib/data/services";

export function ServiceCard({ service }: { service: Service }) {
  const { icon: Icon } = service;
  return (
    <article
      id={service.id}
      className="flex h-full scroll-mt-24 flex-col gap-5 rounded-xl bg-card p-7 ring-1 ring-foreground/10"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-xl font-semibold">{service.title}</h3>
        <p className="font-medium text-brand-strong">{service.tagline}</p>
        <p className="text-muted-foreground">{service.description}</p>
      </div>
      <ul className="mt-auto flex flex-col gap-2.5">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              className="mt-0.5 size-4 shrink-0 text-brand-strong"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
