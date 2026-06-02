import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Heading level — use h1 once per page, h2 for sections. */
  as?: "h1" | "h2";
  className?: string;
};

/** Eyebrow + heading + supporting copy block, reused across every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold tracking-[0.18em] text-brand-strong uppercase">
          {eyebrow}
        </span>
      ) : null}
      <Heading className="text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "text-base text-muted-foreground sm:text-lg",
            align === "center" ? "max-w-2xl text-pretty" : "max-w-3xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
