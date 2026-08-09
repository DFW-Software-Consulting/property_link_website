import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isEmailConfigured: vi.fn(),
  render: vi.fn(),
  sendContactNotification: vi.fn(),
}));

vi.mock("@/lib/email/mailer", () => ({
  isEmailConfigured: mocks.isEmailConfigured,
  sendContactNotification: mocks.sendContactNotification,
}));

vi.mock("@react-email/render", () => ({ render: mocks.render }));

import { POST } from "./route";

const validBody = {
  name: "  Morgan Lee  ",
  email: "morgan@example.com",
  phone: "  +1 212 555 0110  ",
  inquiryType: "long_term",
  building: "  100 Main Street  ",
  company: "  Example Co  ",
  moveInDate: "  September 2026  ",
  message: "  I would like details about available apartments.  ",
  consent: true,
  website: "",
};

function createRequest(body: unknown, ip = "203.0.113.1"): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isEmailConfigured.mockReturnValue(true);
    mocks.render.mockResolvedValue("<p>email</p>");
    mocks.sendContactNotification.mockResolvedValue(undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a valid inquiry and returns created", async () => {
    const response = await POST(createRequest(validBody));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.render).toHaveBeenCalledTimes(2);
    const element = mocks.render.mock.calls[0]?.[0];
    expect(element.props).toMatchObject({
      name: "Morgan Lee",
      phone: "+1 212 555 0110",
      building: "100 Main Street",
      company: "Example Co",
      moveInDate: "September 2026",
    });
    expect(mocks.sendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "<p>email</p>",
        text: "<p>email</p>",
        replyTo: "morgan@example.com",
      }),
    );
  });

  it("rejects malformed JSON without rendering or sending", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.2",
      },
      body: "{not-json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
      issues: expect.any(Array),
    });
    expect(mocks.render).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("rejects missing and wrong-typed fields without sending", async () => {
    const response = await POST(
      createRequest(
        { ...validBody, name: undefined, consent: "true" },
        "203.0.113.3",
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toHaveProperty("issues");
    expect(mocks.render).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("quietly accepts honeypot submissions without sending", async () => {
    const response = await POST(
      createRequest(
        { ...validBody, website: "https://spam.example" },
        "203.0.113.4",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.isEmailConfigured).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("returns unavailable when email is not configured", async () => {
    mocks.isEmailConfigured.mockReturnValue(false);

    const response = await POST(createRequest(validBody, "203.0.113.5"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: expect.any(String) });
    expect(mocks.render).not.toHaveBeenCalled();
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("returns bad gateway when email delivery fails", async () => {
    mocks.sendContactNotification.mockRejectedValue(new Error("SMTP failure"));

    const response = await POST(createRequest(validBody, "203.0.113.6"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: expect.any(String) });
    expect(mocks.sendContactNotification).toHaveBeenCalledTimes(1);
  });

  it("returns bad gateway when email rendering fails", async () => {
    mocks.render.mockRejectedValue(new Error("Render failure"));

    const response = await POST(createRequest(validBody, "203.0.113.8"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: expect.any(String) });
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });

  it("rate limits the sixth request from one IP before sending", async () => {
    const ip = "203.0.113.7";
    for (let index = 0; index < 5; index += 1) {
      await POST(createRequest(validBody, ip));
    }
    mocks.sendContactNotification.mockClear();

    const response = await POST(createRequest(validBody, ip));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.sendContactNotification).not.toHaveBeenCalled();
  });
});
