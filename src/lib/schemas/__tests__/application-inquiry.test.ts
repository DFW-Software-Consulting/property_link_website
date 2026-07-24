import { describe, expect, it } from "vitest";

import { applicationInquirySchema } from "../application-inquiry";

const validInquiry = {
  fullName: "Ana García",
  email: "ana@example.com",
  phone: "+34 612 345 678",
  currentCountry: "Spain",
  moveInDate: "2026-09",
  message: "I am relocating to New York for work.",
};

describe("applicationInquirySchema", () => {
  it("accepts a complete international application inquiry", () => {
    expect(applicationInquirySchema.safeParse(validInquiry).success).toBe(true);
  });

  it("accepts optional fields when left empty", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validInquiry,
        phone: "",
        moveInDate: "",
        message: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing required fields, invalid email, phone, and move-in months", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validInquiry,
        fullName: "",
        email: "not-an-email",
        phone: "x",
        currentCountry: "",
        moveInDate: "0001-01",
      }).success,
    ).toBe(false);
  });

  it("rejects messages over 2000 characters", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validInquiry,
        message: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("allows the honeypot field through so the API can quietly drop bots", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validInquiry,
        website: "https://spam.example",
      }).success,
    ).toBe(true);
  });
});
