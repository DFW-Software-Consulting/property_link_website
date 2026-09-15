import { describe, expect, it } from "vitest";
import { carouselEdges, nextAutoAdvanceLeft } from "@/lib/carousel";

describe("carouselEdges", () => {
  it("reports only forward scrolling at the start of an overflowing track", () => {
    expect(
      carouselEdges({ scrollLeft: 0, clientWidth: 400, scrollWidth: 1200 }),
    ).toEqual({
      canScrollBack: false,
      canScrollForward: true,
    });
  });

  it("reports both directions in the middle of the track", () => {
    expect(
      carouselEdges({ scrollLeft: 400, clientWidth: 400, scrollWidth: 1200 }),
    ).toEqual({
      canScrollBack: true,
      canScrollForward: true,
    });
  });

  it("reports only backward scrolling at the end of the track", () => {
    expect(
      carouselEdges({ scrollLeft: 800, clientWidth: 400, scrollWidth: 1200 }),
    ).toEqual({
      canScrollBack: true,
      canScrollForward: false,
    });
  });

  it("reports no scrolling when every item fits", () => {
    expect(
      carouselEdges({ scrollLeft: 0, clientWidth: 1200, scrollWidth: 1200 }),
    ).toEqual({
      canScrollBack: false,
      canScrollForward: false,
    });
  });

  it("treats sub-pixel offsets within the tolerance as being at the edge", () => {
    expect(
      carouselEdges({ scrollLeft: 795.5, clientWidth: 400, scrollWidth: 1200 }),
    ).toEqual({
      canScrollBack: true,
      canScrollForward: false,
    });
    expect(
      carouselEdges({ scrollLeft: 4, clientWidth: 400, scrollWidth: 1200 })
        .canScrollBack,
    ).toBe(false);
  });
});

describe("nextAutoAdvanceLeft", () => {
  it("advances by one visible width when more items are ahead", () => {
    expect(
      nextAutoAdvanceLeft({
        scrollLeft: 0,
        clientWidth: 400,
        scrollWidth: 1200,
      }),
    ).toBe(400);
    expect(
      nextAutoAdvanceLeft({
        scrollLeft: 400,
        clientWidth: 400,
        scrollWidth: 1200,
      }),
    ).toBe(800);
  });

  it("wraps back to the start once the end is reached", () => {
    expect(
      nextAutoAdvanceLeft({
        scrollLeft: 800,
        clientWidth: 400,
        scrollWidth: 1200,
      }),
    ).toBe(0);
  });

  it("stays at the start when nothing overflows", () => {
    expect(
      nextAutoAdvanceLeft({
        scrollLeft: 0,
        clientWidth: 1200,
        scrollWidth: 1200,
      }),
    ).toBe(0);
  });
});
