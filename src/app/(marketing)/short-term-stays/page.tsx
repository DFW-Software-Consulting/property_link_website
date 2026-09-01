import type { Metadata } from "next";
import {
  BuildingListing,
  type ListingSearchParams,
} from "@/components/marketing/building-listing";

export const revalidate = 60;

const PAGE_DESCRIPTION =
  "Move-in-ready furnished stays of 30 days or more across Manhattan, with Wi-Fi, utilities, linens, and full kitchens included. Every home is in a building PropertyLink owns and manages.";

export const metadata: Metadata = {
  title: "Short-Term Stays",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/short-term-stays" },
  openGraph: {
    type: "website",
    title: "Short-Term Stays",
    description: PAGE_DESCRIPTION,
    url: "/short-term-stays",
    images: ["/images/hero.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export default function ShortTermStaysPage({
  searchParams,
}: {
  searchParams: ListingSearchParams;
}) {
  return (
    <BuildingListing
      searchParams={searchParams}
      copy={{
        basePath: "/short-term-stays",
        eyebrow: "Short-term stays",
        title: "Furnished short-term stays in Manhattan, 30+ days",
        description:
          "Fully furnished, move-in-ready homes for stays of 30 days or more — ideal for relocations, renovations, and extended visits. Every building below is one we own and manage end-to-end; explore a property and we'll match you to the right home for your dates.",
        emptyTitle: "No stays available right now",
        emptyDescription: (
          <>
            We don&apos;t have any short-term stays to show at the moment.
            Reach out with your dates and we&apos;ll share what&apos;s
            available and match you to the right home.
          </>
        ),
      }}
    />
  );
}
