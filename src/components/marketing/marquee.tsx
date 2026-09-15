import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { marqueeCopies, marqueeDurationSeconds } from "@/lib/marquee";

export type MarqueeItem = {
  key: string;
  node: ReactNode;
};

/**
 * A row that scrolls horizontally on a continuous loop (CSS only, no client
 * JS). Items are repeated so the track never shows a gap, and the repeats are
 * hidden from screen readers. The loop pauses on hover or keyboard focus.
 * Under `prefers-reduced-motion` it never moves: only the original items
 * render, in a row the visitor can scroll by hand.
 *
 * Space items with right padding in `itemClassName` (not `gap`), so both
 * halves of the track are exactly the same width and the loop is seamless.
 */
export function Marquee({
  items,
  label,
  minItemsPerHalf,
  secondsPerItem,
  itemClassName,
}: {
  items: MarqueeItem[];
  label: string;
  /** Enough items per half to span the widest container without a gap. */
  minItemsPerHalf: number;
  /** Scroll pace: seconds each item takes to cross. */
  secondsPerItem: number;
  itemClassName?: string;
}) {
  const copies = marqueeCopies(items.length, minItemsPerHalf);
  if (copies === 0) return null;

  const style = {
    "--marquee-duration": `${marqueeDurationSeconds(items.length, copies, secondsPerItem)}s`,
  } as CSSProperties;

  return (
    <div
      role="region"
      aria-label={label}
      className="group w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%-3rem),transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"
    >
      <ul
        style={style}
        className="flex w-max animate-marquee py-1 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {Array.from({ length: copies }, (_, copy) =>
          items.map((item) => (
            <li
              key={`${copy}-${item.key}`}
              aria-hidden={copy > 0 ? true : undefined}
              className={cn(
                "shrink-0",
                itemClassName,
                copy > 0 && "motion-reduce:hidden",
              )}
            >
              {item.node}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
