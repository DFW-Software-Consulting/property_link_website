import { clients } from "@/lib/data/clients";

export function LogoStrip({ heading }: { heading?: string }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {heading ? (
        <p className="text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {heading}
        </p>
      ) : null}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {clients.map((client) => (
          <li
            key={client}
            className="font-heading text-lg font-medium text-foreground/55"
          >
            {client}
          </li>
        ))}
      </ul>
    </div>
  );
}
