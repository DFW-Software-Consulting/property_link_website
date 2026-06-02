import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/** Typographic wordmark + mark. Server-safe so header and footer can share it. */
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
      <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <Building2 className="size-5" aria-hidden />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        PropertyLink <span className="text-brand-strong">NYC</span>
      </span>
    </Link>
  );
}
