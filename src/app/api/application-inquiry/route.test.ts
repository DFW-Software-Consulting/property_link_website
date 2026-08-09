import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isEmailConfigured: vi.fn(),
  render: vi.fn(),
  sendContactNotification: vi.fn(),
  verifyCaptcha: vi.fn(),
}));

vi.mock("@/lib/email/mailer", () => ({
  isEmailConfigured: mocks.isEmailConfigured,
  sendContactNotification: mocks.sendContactNotification,
}));

vi.mock("@/lib/maintenance/captcha", () => ({
  verifyCaptcha: mocks.verifyCaptcha,
}));

vi.mock("@react-email/render", () => ({ render: mocks.render }));

import { POST } from "./route";

/** Offset from today so fixtures never rot as the calendar moves. */
function isoDateOffset({
  years = 0,
  days = 0,
}: {
  years?: number;
  days?: number;
}): string {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear() + years,
      now.getUTCMonth(),
      now.getUTCDate() + days,
    ),
  )
    .toISOString()
    .slice(0, 10);
}

function isoMonthOffset(years: number): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear() + years, now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 7);
}

const validFields = {
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
  captchaToken: "captcha-token",
};

const PASSPORT_BYTES = new Uint8Array([1, 2, 3, 4]);

function createRequest(
  fields: Record<string, string>,
  ip: string,
  options: { passport?: File | null } = {},
): Request {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  const passport =
    options.passport === undefined
      ? new File([PASSPORT_BYTES], "my passport.jpg", { type: "image/jpeg" })
      : options.passport;
  if (passport) form.append("passport", passport);

  return new Request("http://localhost/api/application-inquiry", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body: form,
  });
}

describe("POST /api/application-inquiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isEmailConfigured.mockReturnValue(true);
    mocks.verifyCaptcha.mockResolvedValue({ success: true });
    mocks.render.mockResolvedValue("<p>email</p>");
    mocks.sendContactNotification.mockResolvedValue(undefined);
  });

  it("returns validation issues before verifying CAPTCHA or sending email", async () => {
    const response = await POST(
      createRequest(
        { ...validFields, firstName: "", countryOfCitizenship: "" },
        "198.51.100.1",
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
    });
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("quietly accepts honeypot submissions without verifying or emailing", async () => {
    const response = await POST(
      createRequest(
        { ...validFields, website: "https://spam.example" },
        "198.51.100.2",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("rejects a failed CAPTCHA before email delivery", async () => {
    mocks.verifyCaptcha.mockResolvedValue({ success: false });

    const response = await POST(createRequest(validFields, "198.51.100.3"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "CAPTCHA verification failed. Please try again.",
    });
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("returns unavailable when email is not configured without sending", async () => {
    mocks.isEmailConfigured.mockReturnValue(false);

    const response = await POST(createRequest(validFields, "198.51.100.4"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Application inquiries are temporarily unavailable.",
    });
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("rejects a missing passport before verifying CAPTCHA", async () => {
    const response = await POST(
      createRequest(validFields, "198.51.100.7", { passport: null }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please attach a copy of your passport.",
    });
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("rejects an unsupported passport file type", async () => {
    const response = await POST(
      createRequest(validFields, "198.51.100.8", {
        passport: new File([PASSPORT_BYTES], "passport.gif", {
          type: "image/gif",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("isn't a supported file"),
    });
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("emails a valid application with the passport attached", async () => {
    const response = await POST(createRequest(validFields, "198.51.100.5"));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.render).toHaveBeenCalledTimes(2);
    expect(mocks.sendContactNotification).toHaveBeenCalledTimes(1);

    const params = mocks.sendContactNotification.mock.calls[0]?.[0];
    expect(params).toMatchObject({
      subject: "[Rental Application — International] Ana García, Spain",
      html: "<p>email</p>",
      text: "<p>email</p>",
      replyTo: "ana@example.com",
    });
    expect(params.attachments).toHaveLength(1);
    // Spaces are sanitized out of the uploaded filename.
    expect(params.attachments[0]).toMatchObject({
      filename: "my_passport.jpg",
      contentType: "image/jpeg",
    });
    expect(Buffer.isBuffer(params.attachments[0].content)).toBe(true);
    expect(params.attachments[0].content.equals(Buffer.from(PASSPORT_BYTES))).toBe(
      true,
    );
  });

  it("rejects the sixth request from an IP without sending", async () => {
    const ip = "198.51.100.6";

    for (let index = 0; index < 5; index += 1) {
      await POST(createRequest(validFields, ip));
    }
    mocks.sendContactNotification.mockClear();

    const response = await POST(createRequest(validFields, ip));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many requests. Please try again later.",
    });
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });
});
