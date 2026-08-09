import { describe, expect, it } from "vitest";

import {
  contactInquirySchema,
  INQUIRY_TYPES,
  inquiryTypeLabels,
} from "../contact";

const validInquiry = {
  name: "Ana García",
  email: "ana@example.com",
  phone: "+1 212 555 0100",
  inquiryType: "long_term",
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
