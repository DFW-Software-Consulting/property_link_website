import type { Metadata } from "next";
import {
  BuildingListing,
  type ListingSearchParams,
} from "@/components/marketing/building-listing";

export const revalidate = 60;

const PAGE_DESCRIPTION =
  "Browse PropertyLink's furnished residences across Manhattan — 12-month leases in a building we own and manage, from Little Italy to the Upper East Side.";

export const metadata: Metadata = {
  title: "Residences",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/residences" },
  openGraph: {
    type: "website",
    title: "Residences",
    description: PAGE_DESCRIPTION,
    url: "/residences",
    images: ["/images/hero.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export default function LongTermRentalsPage({
  searchParams,
}: {
  searchParams: ListingSearchParams;
}) {
  return (
    <BuildingListing
      searchParams={searchParams}
      copy={{
        basePath: "/residences",
        eyebrow: "Residences",
        title: "Find your home in Manhattan",
        description:
          "Each building below is one we own and manage end-to-end, with 12-month leases and furnished stays of 30 days or more available. Explore a property to see its available layouts, then reach out and we'll match you to the right home.",
        includeJsonLd: true,
        emptyTitle: "No listings available right now",
        emptyDescription: (
          <>
            We don&apos;t have any residences to show at the moment. Reach out
            and we&apos;ll share what&apos;s available and match you to the
            right home.
          </>
        ),
      }}
    />
  );
}
