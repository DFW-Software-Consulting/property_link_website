import { describe, expect, it } from "vitest";

import { rentalApplicationSchema } from "../rental-application";

const validApplication = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "212-555-1234",
  building: "521 West 48th",
  moveInDate: "2026-09",
  occupants: 2,
  message: "Looking for a 2-bedroom.",
};

describe("rentalApplicationSchema", () => {
  it("accepts a complete rental application", () => {
    expect(rentalApplicationSchema.safeParse(validApplication).success).toBe(
      true,
    );
  });

  it("accepts optional fields when left empty", () => {
    expect(
      rentalApplicationSchema.safeParse({
        fullName: "John Doe",
        email: "john@example.com",
        phone: "",
        building: "",
        moveInDate: "",
        message: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing fullName", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        fullName: "",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("normalizes email to lowercase", () => {
    const result = rentalApplicationSchema.safeParse({
      ...validApplication,
      email: "JOHN@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("trims fullName", () => {
    const result = rentalApplicationSchema.safeParse({
      ...validApplication,
      fullName: "  John Doe  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe("John Doe");
    }
  });

  it("accepts a numeric occupants value", () => {
    const result = rentalApplicationSchema.safeParse({
      ...validApplication,
      occupants: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occupants).toBe(3);
    }
  });

  it("rejects occupants over 20", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        occupants: 21,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive occupants", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        occupants: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid move-in month format", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        moveInDate: "09-2026",
      }).success,
    ).toBe(false);
  });

  it("rejects messages over 2000 characters", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        message: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("allows the honeypot field through so the API can quietly drop bots", () => {
    expect(
      rentalApplicationSchema.safeParse({
        ...validApplication,
        website: "https://spam.example",
      }).success,
    ).toBe(true);
  });

  it("excludes the honeypot from the parsed application fields", () => {
    const result = rentalApplicationSchema.safeParse({
      ...validApplication,
      website: "https://spam.example",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("website" in result.data).toBe(true);
      const { website: _, ...applicationFields } = result.data;
      expect(applicationFields).not.toHaveProperty("website");
    }
  });
});
