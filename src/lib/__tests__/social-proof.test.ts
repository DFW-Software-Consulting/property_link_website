import { describe, expect, it } from "vitest";
import type { Testimonial } from "@/lib/data/testimonials";
import { companyNamesFromCms, testimonialsFromCms } from "../social-proof";

const placeholder: Testimonial[] = [
  { quote: "Placeholder", author: "Verified resident", source: "Yelp review" },
];

describe("testimonialsFromCms", () => {
  it("keeps the built-in reviews until one is published", () => {
    expect(testimonialsFromCms([], placeholder)).toBe(placeholder);
  });

  it("shows published reviews word for word with their source and stars", () => {
    const result = testimonialsFromCms(
      [
        {
          quote: "Great stay.",
          author: "Jonathan S.",
          source: "yelp",
          rating: 5,
        },
        {
          quote: "Clean and quiet.",
          author: "Maria P.",
          source: "google",
          rating: 4,
        },
      ],
      placeholder,
    );

    expect(result).toEqual([
      {
        quote: "Great stay.",
        author: "Jonathan S.",
        source: "Yelp review",
        rating: 5,
      },
      {
        quote: "Clean and quiet.",
        author: "Maria P.",
        source: "Google review",
        rating: 4,
      },
    ]);
  });

  it("labels an unknown source as a plain review", () => {
    const [result] = testimonialsFromCms(
      [{ quote: "Nice.", author: "A. B.", source: "tripadvisor", rating: 5 }],
      placeholder,
    );

    expect(result?.source).toBe("Review");
  });
});

describe("companyNamesFromCms", () => {
  it("keeps the built-in names until one is added", () => {
    const fallback = ["Fastly"];
    expect(companyNamesFromCms([], fallback)).toBe(fallback);
  });

  it("uses the CMS names in the order the CMS sends them", () => {
    expect(
      companyNamesFromCms([{ name: "DO&CO" }, { name: "Fastly" }], ["Other"]),
    ).toEqual(["DO&CO", "Fastly"]);
  });
});
