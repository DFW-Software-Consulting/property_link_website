import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addDaysIso,
  minMoveOutDate,
  parseIsoDate,
  todayInNewYork,
} from "@/lib/dates";

afterEach(() => {
  vi.useRealTimers();
});

describe("todayInNewYork", () => {
  it("returns the New York calendar date, not the UTC one", () => {
    // 01:30 UTC on Jun 2 is still 21:30 on Jun 1 in New York.
    expect(todayInNewYork(new Date("2026-06-02T01:30:00.000Z"))).toBe(
      "2026-06-01",
    );
  });

  it("uses the current clock by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T15:00:00.000Z"));
    expect(todayInNewYork()).toBe("2026-03-10");
  });
});

describe("parseIsoDate", () => {
  it("accepts a real calendar date", () => {
    expect(parseIsoDate("2026-10-01")?.toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
  });

  it.each([
    "2026-02-31",
    "2026-13-01",
    "01/10/2026",
    "September 2026",
    "",
    "2026-1-5",
  ])("rejects %s", (value) => {
    expect(parseIsoDate(value)).toBeNull();
  });
});

describe("addDaysIso", () => {
  it("adds days across month and year ends", () => {
    expect(addDaysIso("2026-01-20", 30)).toBe("2026-02-19");
    expect(addDaysIso("2026-12-20", 30)).toBe("2027-01-19");
  });

  it("stays on the same calendar day across a daylight-saving change", () => {
    // US clocks move forward on 2026-03-08.
    expect(addDaysIso("2026-03-01", 30)).toBe("2026-03-31");
  });

  it("returns null for an invalid date", () => {
    expect(addDaysIso("not-a-date", 30)).toBeNull();
  });
});

describe("minMoveOutDate", () => {
  it("counts 30 days from today when there is no move-in date", () => {
    expect(minMoveOutDate(undefined, "2026-05-01")).toBe("2026-05-31");
  });

  it("counts 30 days from a later move-in date", () => {
    expect(minMoveOutDate("2026-07-01", "2026-05-01")).toBe("2026-07-31");
  });

  it("ignores a move-in date in the past", () => {
    expect(minMoveOutDate("2026-04-01", "2026-05-01")).toBe("2026-05-31");
  });

  it("ignores a move-in date that isn't a real date", () => {
    expect(minMoveOutDate("September 2026", "2026-05-01")).toBe("2026-05-31");
  });
});
