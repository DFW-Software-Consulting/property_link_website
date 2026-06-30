import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/lib/seo/json-ld";

/**
 * Visible breadcrumb trail. The last item is the current page (not linked).
 * Drive it from the same array as `breadcrumbJsonLd` so the two never drift.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {isCurrent ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              )}
              {!isCurrent ? (
                <ChevronRight
                  aria-hidden
                  className={cn("size-3.5 text-muted-foreground/60")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
