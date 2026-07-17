import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/* PropertyLink Mgmt house outline (pentagon + chimney on the right roof
   slope), drawn around the origin. Recreated from the brand PDF
   (PropertyLink_logo_color.pdf). The back (teal) house uses the same shape
   split into open subpaths, leaving gaps where the front house's outline
   crosses it so the two marks read as interlocked. */
const FRONT_HOUSE_PATH =
  "M -32 36 L -32 -8 L 0 -34 L 11.2 -24.9 L 11.2 -40 L 20.2 -40 L 20.2 -17.6 L 32 -8 L 32 36 Z";
const BACK_HOUSE_PATH =
  "M -7.3 36 L -32 36 L -32 -8 L 0 -34 L 11.2 -24.9 L 11.2 -40 L 20.2 -40 L 20.2 -17.6 L 29.6 -9.9 M 32 3.7 L 32 36 L 5.7 36";
const BACK_HOUSE_TRANSFORM = "translate(52 50) rotate(-14) scale(0.98)";
const FRONT_HOUSE_TRANSFORM = "translate(88 66) rotate(-4) scale(0.92)";

/** Two interlocking house outlines from the brand mark. Colors come from the
    theme tokens so the mark stays on-palette. */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="14 0 112 108" aria-hidden="true" className={className}>
      <path
        d={BACK_HOUSE_PATH}
        transform={BACK_HOUSE_TRANSFORM}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={7.3}
      />
      <path
        d={FRONT_HOUSE_PATH}
        transform={FRONT_HOUSE_TRANSFORM}
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth={7.8}
      />
    </svg>
  );
}

/** Brand logo: house mark + stacked wordmark. Server-safe so header and
    footer can share it. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.shortName} — home`}
      className={cn(
        "flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark className="h-10 w-auto shrink-0" />
      <span className="flex flex-col">
        <span className="text-[13px] leading-none font-bold tracking-[0.26em] text-brand uppercase">
          Property
        </span>
        <span className="mt-1 flex items-baseline gap-1.5 leading-none">
          <span className="text-[17px] font-bold tracking-[0.08em] text-foreground uppercase">
            Link
          </span>
          <span className="text-[9px] font-semibold tracking-[0.24em] text-foreground uppercase">
            Mgmt
          </span>
        </span>
      </span>
    </Link>
  );
}
