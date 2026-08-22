import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/maintenance/captcha", () => ({
  verifyCaptcha: vi.fn(),
}));

vi.mock("@/lib/email/mailer", () => ({
  isRentalApplicationConfigured: vi.fn(),
  sendRentalApplicationEmail: vi.fn(),
}));

import { POST, __resetRateLimiter } from "./route";
import { verifyCaptcha } from "@/lib/maintenance/captcha";
import {
  isRentalApplicationConfigured,
  sendRentalApplicationEmail,
} from "@/lib/email/mailer";

const mockVerifyCaptcha = vi.mocked(verifyCaptcha);
const mockIsConfigured = vi.mocked(isRentalApplicationConfigured);
const mockSendEmail = vi.mocked(sendRentalApplicationEmail);

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.append("fullName", overrides.fullName ?? "John Doe");
  form.append("email", overrides.email ?? "john@example.com");
  form.append("phone", overrides.phone ?? "212-555-1234");
  form.append("building", overrides.building ?? "521 West 48th");
  form.append("moveInDate", overrides.moveInDate ?? "2026-09");
  form.append("occupants", overrides.occupants ?? "");
  form.append("message", overrides.message ?? "");
  form.append("captchaToken", overrides.captchaToken ?? "tok-valid");
  form.append("website", overrides.website ?? "");
  return form;
}

function makeRequest(form: FormData, headers?: Record<string, string>): Request {
  return new Request("https://example.com/api/rental-application", {
    method: "POST",
    headers,
    body: form,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetRateLimiter();
  mockVerifyCaptcha.mockResolvedValue({ success: true });
  mockIsConfigured.mockReturnValue(true);
  mockSendEmail.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/rental-application", () => {
  it("returns 201 on a valid submission and sends the email", async () => {
    const res = await POST(makeRequest(makeForm()));
    expect(res.status).toBe(201);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "[Rental Application] John Doe — 521 West 48th",
        replyTo: "john@example.com",
      }),
    );
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest(makeForm({ fullName: "", email: "" })));
    expect(res.status).toBe(400);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 400 on an invalid email", async () => {
    const res = await POST(makeRequest(makeForm({ email: "nope" })));
    expect(res.status).toBe(400);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 429 after more than 5 submissions from the same IP", async () => {
    const form = makeForm();
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(form));
      expect(res.status).toBe(201);
    }
    const blocked = await POST(makeRequest(form));
    expect(blocked.status).toBe(429);
  });

  it("returns 403 when captcha verification fails", async () => {
    mockVerifyCaptcha.mockResolvedValue({ success: false });
    const res = await POST(makeRequest(makeForm()));
    expect(res.status).toBe(403);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 503 when email is not configured", async () => {
    mockIsConfigured.mockReturnValue(false);
    const res = await POST(makeRequest(makeForm()));
    expect(res.status).toBe(503);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 502 when the email send fails", async () => {
    mockSendEmail.mockRejectedValue(new Error("smtp boom"));
    const res = await POST(makeRequest(makeForm()));
    expect(res.status).toBe(502);
  });

  it("drops honeypot submissions with a 200 and sends nothing", async () => {
    const res = await POST(makeRequest(makeForm({ website: "https://bot" })));
    expect(res.status).toBe(200);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when the request body isn't parseable as form data", async () => {
    const res = await POST(
      new Request("https://example.com/api/rental-application", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not form data",
      }),
    );
    expect(res.status).toBe(400);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("accepts a minimal submission with every optional field blank", async () => {
    const res = await POST(
      makeRequest(
        makeForm({
          phone: "",
          building: "",
          moveInDate: "",
          captchaToken: "",
        }),
      ),
    );
    expect(res.status).toBe(201);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "[Rental Application] John Doe — NYC",
      }),
    );
  });

  it("includes occupants and message in the email when provided", async () => {
    const res = await POST(
      makeRequest(makeForm({ occupants: "3", message: "Looking forward to it" })),
    );
    expect(res.status).toBe(201);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("Looking forward to it"),
        text: expect.stringContaining("Occupants: 3"),
      }),
    );
  });

  it("tracks rate limits per IP from the x-forwarded-for header", async () => {
    const form = makeForm();
    for (let i = 0; i < 5; i++) {
      const res = await POST(
        makeRequest(form, { "x-forwarded-for": "203.0.113.5" }),
      );
      expect(res.status).toBe(201);
    }
    const blocked = await POST(
      makeRequest(form, { "x-forwarded-for": "203.0.113.5" }),
    );
    expect(blocked.status).toBe(429);

    const otherIp = await POST(
      makeRequest(form, { "x-forwarded-for": "203.0.113.9, 10.0.0.1" }),
    );
    expect(otherIp.status).toBe(201);
  });
});
