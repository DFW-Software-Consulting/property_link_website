import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  contactInquirySchema,
  INQUIRY_TYPES,
  inquiryTypeLabels,
  UNIT_SIZES,
  unitSizeLabels,
} from "../contact";

/** A date the schema will accept today and in any future test run. */
function isoDaysFromToday(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

const validInquiry = {
  name: "Ana García",
  email: "ana@example.com",
  phone: "+1 212 555 0100",
  inquiryType: "long_term",
  unitSize: "two_bedroom",
  building: "Maple Court",
  buildingSlug: "maple-court",
  company: "Example Co.",
  moveInDate: "2026-10-01",
  message: "I would like to arrange a viewing.",
  consent: true,
};

describe("contactInquirySchema", () => {
  it("accepts a complete inquiry and trims the required name", () => {
    const result = contactInquirySchema.safeParse({
      ...validInquiry,
      name: "  Ana García  ",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Ana García");
  });

  it.each(["name", "email", "message"])("rejects a blank required %s", (key) => {
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, [key]: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid addresses, unknown inquiry types, and missing consent", () => {
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, email: "not-an-email" }).success,
    ).toBe(false);
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, inquiryType: "other" }).success,
    ).toBe(false);
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, consent: false }).success,
    ).toBe(false);
  });

  it("allows empty optional context but bounds optional values and messages", () => {
    expect(
      contactInquirySchema.safeParse({
        ...validInquiry,
        phone: "",
        building: "",
        buildingSlug: "",
        company: "",
        moveInDate: "",
      }).success,
    ).toBe(true);
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, phone: "x".repeat(31) }).success,
    ).toBe(false);
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, message: "x".repeat(2001) }).success,
    ).toBe(false);
  });

  it("keeps a non-empty display label for every supported inquiry type", () => {
    for (const type of INQUIRY_TYPES) {
      expect(typeof inquiryTypeLabels[type]).toBe("string");
      expect(inquiryTypeLabels[type].trim()).not.toBe("");
    }
  });
});

describe("apartment size", () => {
  it.each(["short_term", "long_term", "corporate"])(
    "requires a size for a %s inquiry",
    (inquiryType) => {
      const result = contactInquirySchema.safeParse({
        ...validInquiry,
        inquiryType,
        unitSize: "",
        moveOutDate: "",
        moveInDate: "",
        ...(inquiryType === "short_term" || inquiryType === "corporate"
          ? { moveOutDate: isoDaysFromToday(45) }
          : {}),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path[0] === "unitSize")).toBe(
          true,
        );
      }
    },
  );

  it("leaves the size optional for a general question", () => {
    expect(
      contactInquirySchema.safeParse({
        ...validInquiry,
        inquiryType: "general",
        unitSize: "",
      }).success,
    ).toBe(true);
  });

  it("rejects a size outside the offered list", () => {
    expect(
      contactInquirySchema.safeParse({ ...validInquiry, unitSize: "penthouse" }).success,
    ).toBe(false);
  });

  it("keeps a non-empty display label for every offered size", () => {
    for (const size of UNIT_SIZES) {
      expect(unitSizeLabels[size].trim()).not.toBe("");
    }
  });
});

describe("move-out date", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 11pm in New York, so UTC has already rolled over to the next day.
    vi.setSystemTime(new Date("2026-05-02T03:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const shortTerm = { ...validInquiry, inquiryType: "short_term", moveInDate: "" };

  it("accepts a move-out date exactly 30 days out, counted in New York", () => {
    expect(
      contactInquirySchema.safeParse({ ...shortTerm, moveOutDate: "2026-05-31" }).success,
    ).toBe(true);
  });

  it("rejects a move-out date inside the next 30 days", () => {
    const result = contactInquirySchema.safeParse({
      ...shortTerm,
      moveOutDate: "2026-05-30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("30 days from today");
    }
  });

  it("counts the 30 days from a later move-in date", () => {
    const base = { ...shortTerm, moveInDate: "2026-07-01" };

    expect(
      contactInquirySchema.safeParse({ ...base, moveOutDate: "2026-07-31" }).success,
    ).toBe(true);

    const tooSoon = contactInquirySchema.safeParse({
      ...base,
      moveOutDate: "2026-07-30",
    });
    expect(tooSoon.success).toBe(false);
    if (!tooSoon.success) {
      expect(tooSoon.error.issues[0]?.message).toContain("after your move-in date");
    }
  });

  it("ignores a move-in date that isn't a real calendar date", () => {
    expect(
      contactInquirySchema.safeParse({
        ...shortTerm,
        moveInDate: "September 2026",
        moveOutDate: "2026-05-31",
      }).success,
    ).toBe(true);
  });

  it("rejects a move-out date that isn't a real calendar date", () => {
    expect(
      contactInquirySchema.safeParse({ ...shortTerm, moveOutDate: "2026-02-31" }).success,
    ).toBe(false);
  });

  it.each(["short_term", "corporate"])(
    "requires a move-out date for a %s inquiry",
    (inquiryType) => {
      const result = contactInquirySchema.safeParse({
        ...validInquiry,
        inquiryType,
        moveOutDate: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path[0] === "moveOutDate"),
        ).toBe(true);
      }
    },
  );

  it.each(["long_term", "general"])(
    "leaves the move-out date optional for a %s inquiry",
    (inquiryType) => {
      expect(
        contactInquirySchema.safeParse({
          ...validInquiry,
          inquiryType,
          moveOutDate: "",
        }).success,
      ).toBe(true);
    },
  );
});
