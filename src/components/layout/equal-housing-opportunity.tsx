import { cn } from "@/lib/utils";

/**
 * Equal Housing Opportunity logotype (Fair Housing Act advertising, 24 CFR
 * part 110): the house-with-equals-sign mark plus the words. The mark is drawn
 * in `currentColor` so it keeps contrast on any background, and the words are
 * real text, so screen readers get the same statement sighted visitors do.
 */
export function EqualHousingOpportunity({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 100 90"
        aria-hidden="true"
        focusable="false"
        className="h-8 w-auto shrink-0"
      >
        {/* House outline: outer silhouette with the inner house cut out. */}
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M50 4 96 40H86v46H14V40H4Zm0 17L26 40v36h48V40Z"
        />
        {/* The equals sign. */}
        <rect x="36" y="46" width="28" height="8" fill="currentColor" />
        <rect x="36" y="60" width="28" height="8" fill="currentColor" />
      </svg>
      <span className="text-[0.6875rem] leading-tight font-semibold tracking-wide uppercase">
        Equal Housing
        <br />
        Opportunity
      </span>
    </div>
  );
}
