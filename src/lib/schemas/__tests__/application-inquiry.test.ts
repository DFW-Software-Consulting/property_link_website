import { describe, expect, it } from "vitest";

import {
  applicationInquirySchema,
  validatePassportFile,
} from "../application-inquiry";

/** Offset from today so fixtures never rot as the calendar moves. */
function isoDateOffset({
  years = 0,
  days = 0,
}: {
  years?: number;
  days?: number;
}): string {
  const now = new Date();
  const date = new Date(
    Date.UTC(
      now.getUTCFullYear() + years,
      now.getUTCMonth(),
      now.getUTCDate() + days,
    ),
  );
  return date.toISOString().slice(0, 10);
}

function isoMonthOffset(years: number): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear() + years, now.getUTCMonth(), 1));
  return date.toISOString().slice(0, 7);
}

const validApplication = {
  firstName: "Ana",
  lastName: "García",
  email: "ana@example.com",
  phone: "+34 612 345 678",
  gender: "female",
  dateOfBirth: isoDateOffset({ years: -30 }),
  countryOfCitizenship: "Spain",
  passportIdNumber: "XDA123456",
  visaType: "H-1B",
  visaExpirationDate: isoDateOffset({ years: 2 }),
  landlordFirstName: "Marta",
  landlordLastName: "Ruiz",
  landlordPhone: "+34 911 222 333",
  relativeName: "Carlos García",
  relativePhone: "+34 622 111 000",
  relationship: "Brother",
  desiredAddress: "215 East 68th Street, Apt 4B, New York, NY",
  desiredMoveInDate: isoDateOffset({ days: 30 }),
  hasPets: "no",
  emergencyUsFirstName: "Julia",
  emergencyUsLastName: "Chen",
  emergencyUsPhone: "+1 212 555 0142",
  emergencyUsEmail: "julia@example.com",
  emergencyHomeFirstName: "Luis",
  emergencyHomeLastName: "García",
  emergencyHomePhone: "+34 655 444 333",
  emergencyHomeEmail: "luis@example.com",
  cardholderName: "Ana Garcia",
  creditCardNumber: "4111111111111111",
  cardExpirationDate: isoMonthOffset(2),
  securityCode: "123",
};

describe("applicationInquirySchema", () => {
  it("accepts a complete international application", () => {
    const result = applicationInquirySchema.safeParse(validApplication);
    expect(result.success).toBe(true);
  });

  it("allows the honeypot field through so the API can quietly drop bots", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        website: "https://spam.example",
      }).success,
    ).toBe(true);
  });

  it.each([
    "firstName",
    "lastName",
    "email",
    "phone",
    "countryOfCitizenship",
    "passportIdNumber",
    "visaType",
    "landlordFirstName",
    "landlordLastName",
    "landlordPhone",
    "relativeName",
    "relativePhone",
    "relationship",
    "desiredAddress",
    "emergencyUsFirstName",
    "emergencyUsPhone",
    "emergencyUsEmail",
    "emergencyHomeFirstName",
    "emergencyHomePhone",
    "emergencyHomeEmail",
    "cardholderName",
  ])("rejects a blank %s", (key) => {
    expect(
      applicationInquirySchema.safeParse({ ...validApplication, [key]: "" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid email addresses on every email field", () => {
    for (const key of [
      "email",
      "emergencyUsEmail",
      "emergencyHomeEmail",
    ] as const) {
      expect(
        applicationInquirySchema.safeParse({
          ...validApplication,
          [key]: "not-an-email",
        }).success,
      ).toBe(false);
    }
  });

  it("rejects an unknown gender and accepts prefer-not-to-say", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        gender: "unknown",
      }).success,
    ).toBe(false);
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        gender: "prefer-not-to-say",
      }).success,
    ).toBe(true);
  });

  it("rejects a hasPets value outside yes/no", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        hasPets: "maybe",
      }).success,
    ).toBe(false);
  });

  it("rejects applicants under 18", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        dateOfBirth: isoDateOffset({ years: -17 }),
      }).success,
    ).toBe(false);
  });

  it("rejects impossible calendar dates", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        dateOfBirth: "1990-02-31",
      }).success,
    ).toBe(false);
  });

  it("rejects an expired visa", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        visaExpirationDate: isoDateOffset({ days: -1 }),
      }).success,
    ).toBe(false);
  });

  it("requires a full YYYY-MM-DD move-in date within three years", () => {
    // Month-only was the old contract and must no longer parse.
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        desiredMoveInDate: "2026-09",
      }).success,
    ).toBe(false);
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        desiredMoveInDate: isoDateOffset({ days: -1 }),
      }).success,
    ).toBe(false);
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        desiredMoveInDate: isoDateOffset({ years: 4 }),
      }).success,
    ).toBe(false);
  });

  it("normalizes spaced or hyphenated card numbers", () => {
    const result = applicationInquirySchema.safeParse({
      ...validApplication,
      creditCardNumber: "4111 1111-1111 1111",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.creditCardNumber).toBe("4111111111111111");
    }
  });

  it("rejects card numbers that aren't 13-19 digits", () => {
    for (const value of ["411111", "4111a111111111111", "4".repeat(20)]) {
      expect(
        applicationInquirySchema.safeParse({
          ...validApplication,
          creditCardNumber: value,
        }).success,
      ).toBe(false);
    }
  });

  it("rejects an expired card", () => {
    expect(
      applicationInquirySchema.safeParse({
        ...validApplication,
        cardExpirationDate: isoMonthOffset(-1),
      }).success,
    ).toBe(false);
  });

  it("rejects security codes outside 3-4 digits", () => {
    for (const value of ["12", "12345", "abc"]) {
      expect(
        applicationInquirySchema.safeParse({
          ...validApplication,
          securityCode: value,
        }).success,
      ).toBe(false);
    }
  });
});

describe("validatePassportFile", () => {
  function file(name: string, type: string, size: number): File {
    const blob = new File([new Uint8Array(size)], name, { type });
    return blob;
  }

  it("accepts a reasonable passport scan", () => {
    expect(validatePassportFile(file("passport.jpg", "image/jpeg", 1024))).toEqual(
      { ok: true },
    );
  });

  it("accepts a PDF passport scan", () => {
    expect(
      validatePassportFile(file("passport.pdf", "application/pdf", 2048)).ok,
    ).toBe(true);
  });

  it("requires a file", () => {
    expect(validatePassportFile(null).ok).toBe(false);
    expect(validatePassportFile(file("empty.jpg", "image/jpeg", 0)).ok).toBe(
      false,
    );
  });

  it("rejects unsupported types", () => {
    expect(
      validatePassportFile(file("passport.gif", "image/gif", 1024)).ok,
    ).toBe(false);
  });

  it("rejects files over 8 MB", () => {
    expect(
      validatePassportFile(
        file("passport.jpg", "image/jpeg", 8 * 1024 * 1024 + 1),
      ).ok,
    ).toBe(false);
  });
});
