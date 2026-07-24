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

const validFields = {
  fullName: "Ana García",
  email: "ana@example.com",
  phone: "+34 612 345 678",
  currentCountry: "Spain",
  moveInDate: "2026-09",
  message: "I am relocating to New York for work.",
  captchaToken: "captcha-token",
};

function createRequest(
  fields: Record<string, string>,
  ip: string,
): Request {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

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
        { ...validFields, fullName: "", currentCountry: "" },
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

  it("emails a valid inquiry through the configured office contact path", async () => {
    const response = await POST(createRequest(validFields, "198.51.100.5"));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.render).toHaveBeenCalledTimes(2);
    expect(mocks.sendContactNotification).toHaveBeenCalledWith({
      subject: "[Application Inquiry — International] Ana García, Spain",
      html: "<p>email</p>",
      text: "<p>email</p>",
      replyTo: "ana@example.com",
    });
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
