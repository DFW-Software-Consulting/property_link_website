import type { CmsReview, CmsTrustedCompany } from "@/lib/cms/types";
import type { Testimonial } from "@/lib/data/testimonials";

const REVIEW_SOURCE_LABELS: Record<string, string> = {
  google: "Google review",
  yelp: "Yelp review",
};

/**
 * Published CMS reviews as testimonial cards. Until the first review is
 * published, or when the CMS can't be reached, the built-in reviews show.
 */
export function testimonialsFromCms(
  reviews: CmsReview[],
  fallback: Testimonial[],
): Testimonial[] {
  if (reviews.length === 0) return fallback;
  return reviews.map((review) => ({
    quote: review.quote,
    author: review.author,
    source: REVIEW_SOURCE_LABELS[review.source] ?? "Review",
    rating: review.rating,
  }));
}

/**
 * "Trusted by" names from the CMS (already A to Z), or the built-in names
 * until the first one is added or when the CMS can't be reached.
 */
export function companyNamesFromCms(
  companies: CmsTrustedCompany[],
  fallback: string[],
): string[] {
  if (companies.length === 0) return fallback;
  return companies.map((company) => company.name);
}
