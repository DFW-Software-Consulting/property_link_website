export type Testimonial = {
  quote: string;
  author: string;
  source: string;
};

/**
 * Drawn from PropertyLink's public reviews (Google / Yelp / Birdeye).
 * NOTE: wording is paraphrased and attribution is generic — exact quotes and
 * reviewer names are pending client verification before publishing.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "The best property management company I've ever rented from. They're attentive to tenant issues and genuinely easy to reach.",
    author: "Verified resident",
    source: "Yelp review",
  },
  {
    quote:
      "A great option for fairly priced, high-quality living space in Manhattan. Clean apartments and very responsive service.",
    author: "Verified resident",
    source: "Google review",
  },
  {
    quote:
      "Communication with the management team was excellent, and the application process was straightforward from start to finish.",
    author: "Verified resident",
    source: "Google review",
  },
];
