import { Marquee } from "@/components/marketing/marquee";

export function LogoStrip({
  companies,
  heading,
}: {
  companies: string[];
  heading?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {heading ? (
        <p className="text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {heading}
        </p>
      ) : null}
      <Marquee
        label="Client companies"
        minItemsPerHalf={10}
        secondsPerItem={3.5}
        itemClassName="pr-12"
        items={companies.map((client) => ({
          key: client,
          node: (
            <span className="font-heading text-lg font-medium whitespace-nowrap text-foreground/55">
              {client}
            </span>
          ),
        }))}
      />
    </div>
  );
}
