import { describe, expect, it } from "vitest";
import { marqueeCopies, marqueeDurationSeconds } from "@/lib/marquee";

describe("marqueeCopies", () => {
  it("renders nothing when there are no items", () => {
    expect(marqueeCopies(0, 6)).toBe(0);
  });

  it("repeats a short list until each half reaches the minimum", () => {
    // 3 reviews, at least 6 per half: 2 copies per half, 4 in total.
    expect(marqueeCopies(3, 6)).toBe(4);
    // 5 companies, at least 10 per half: 2 copies per half.
    expect(marqueeCopies(5, 10)).toBe(4);
  });

  it("rounds up when the items don't divide the minimum evenly", () => {
    expect(marqueeCopies(4, 10)).toBe(6);
  });

  it("uses two copies once one pass already fills a half", () => {
    expect(marqueeCopies(12, 6)).toBe(2);
    expect(marqueeCopies(6, 6)).toBe(2);
  });

  it("always returns an even count so the loop is seamless", () => {
    for (let count = 1; count <= 15; count += 1) {
      expect(marqueeCopies(count, 7) % 2).toBe(0);
    }
  });
});

describe("marqueeDurationSeconds", () => {
  it("times one loop by the number of items in half the track", () => {
    // 3 items x 4 copies = 12 rendered, 6 per half, 9s each.
    expect(marqueeDurationSeconds(3, 4, 9)).toBe(54);
  });

  it("keeps per-item speed constant as the list grows", () => {
    const short = marqueeDurationSeconds(5, marqueeCopies(5, 10), 3.5);
    const long = marqueeDurationSeconds(20, marqueeCopies(20, 10), 3.5);
    expect(short / 10).toBe(3.5);
    expect(long / 20).toBe(3.5);
  });
});
