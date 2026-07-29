import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/** Brand logo lockup (house mark + wordmark). Server-safe so header and
    footer can share it. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.shortName} — home`}
      className={cn(
        "flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {/* Intrinsic artwork size, so layout space is reserved before load.
          Eager rather than priority: the header instance is above the fold,
          but the footer shares this component and must not preload offscreen. */}
      <Image
        src="/images/propertylink-logo.png"
        alt=""
        width={1307}
        height={294}
        loading="eager"
        sizes="180px"
        className="h-10 w-auto"
      />
    </Link>
  );
}
