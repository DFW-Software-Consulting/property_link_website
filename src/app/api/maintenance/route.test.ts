import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  buildMaintenancePayload: vi.fn(),
  env: {
    CMS_API_URL: "https://cms.example.com/",
    MAINTENANCE_INTAKE_SHARED_SECRET: "shared-secret" as string | undefined,
  },
  fetch: vi.fn(),
  isMaintenanceIntakeConfigured: vi.fn(),
  render: vi.fn(),
  sendMaintenanceRequestEmail: vi.fn(),
  signMaintenancePayload: vi.fn(),
  verifyCaptcha: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env: mocks.env }));

vi.mock("@/lib/maintenance/captcha", () => ({
  verifyCaptcha: mocks.verifyCaptcha,
}));

vi.mock("@/lib/maintenance/payload", () => ({
  buildMaintenancePayload: mocks.buildMaintenancePayload,
  signMaintenancePayload: mocks.signMaintenancePayload,
}));

vi.mock("@/lib/email/mailer", () => ({
  isMaintenanceIntakeConfigured: mocks.isMaintenanceIntakeConfigured,
  sendMaintenanceRequestEmail: mocks.sendMaintenanceRequestEmail,
}));

vi.mock("@react-email/render", () => ({ render: mocks.render }));

import { POST } from "./route";

const validFields = {
  firstName: "Jamie",
  lastName: "Rivera",
  building: "100 Main Street",
  apartment: "4B",
  phone: "+1 212 555 0199",
  email: "jamie@example.com",
  message: "The kitchen sink has been leaking overnight.",
  permissionToEnter: "coordinate",
  petInResidence: "yes",
  captchaToken: "captcha-token",
};

const builtPayload = {
  formVersion: 1,
  submittedAt: "2026-08-09T12:00:00.000Z",
  contact: {
    firstName: "Jamie",
    lastName: "Rivera",
    email: "jamie@example.com",
    phone: "+1 212 555 0199",
  },
  building: "100 Main Street",
  apartment: "4B",
  message: "The kitchen sink has been leaking overnight.",
  permissionToEnter: "coordinate",
  petInResidence: true,
  photos: [],
};

function createRequest(
  fields: Record<string, string> = validFields,
  ip = "198.51.100.1",
  photos: File[] = [],
): Request {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  for (const photo of photos) form.append("photos", photo);

  return new Request("http://localhost/api/maintenance", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body: form,
  });
}

function directFailure(status = 500): Response {
  return new Response(null, { status });
}

describe("POST /api/maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.verifyCaptcha.mockResolvedValue({ success: true });
    mocks.fetch.mockResolvedValue(new Response(null, { status: 201 }));
    mocks.isMaintenanceIntakeConfigured.mockReturnValue(true);
    mocks.buildMaintenancePayload.mockImplementation((input) => ({
      ...builtPayload,
      contact: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
      },
      building: input.building,
      apartment: input.apartment,
      message: input.message,
      permissionToEnter: input.permissionToEnter,
      petInResidence: input.petInResidence,
      photos: input.photos,
    }));
    mocks.signMaintenancePayload.mockImplementation((payload) => ({
      ...payload,
      signature: "signed",
    }));
    mocks.render.mockResolvedValue("<p>email</p>");
    mocks.sendMaintenanceRequestEmail.mockResolvedValue(undefined);
    mocks.env.CMS_API_URL = "https://cms.example.com/";
    mocks.env.MAINTENANCE_INTAKE_SHARED_SECRET = "shared-secret";
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects a request that is not multipart without side effects", async () => {
    const request = new Request("http://localhost/api/maintenance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validFields),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("returns validation issues before CAPTCHA or delivery", async () => {
    const response = await POST(
      createRequest(
        { ...validFields, firstName: "", petInResidence: "sometimes" },
        "198.51.100.2",
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
      issues: expect.any(Array),
    });
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid photos before CAPTCHA or delivery", async () => {
    const response = await POST(
      createRequest(validFields, "198.51.100.3", [
        new File([new Uint8Array([1, 2])], "report.pdf", {
          type: "application/pdf",
        }),
      ]),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("quietly accepts honeypot submissions without CAPTCHA or delivery", async () => {
    const response = await POST(
      createRequest(
        { ...validFields, website: "https://spam.example" },
        "198.51.100.4",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.verifyCaptcha).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("rejects a failed CAPTCHA before delivery", async () => {
    mocks.verifyCaptcha.mockResolvedValue({ success: false });

    const response = await POST(createRequest(validFields, "198.51.100.5"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.verifyCaptcha).toHaveBeenCalledWith(
      "captcha-token",
      "198.51.100.5",
    );
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("propagates an unexpected CAPTCHA provider error", async () => {
    mocks.verifyCaptcha.mockRejectedValue(new Error("provider unavailable"));

    await expect(
      POST(createRequest(validFields, "198.51.100.6")),
    ).rejects.toThrow("provider unavailable");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("delivers a valid request directly with sanitized photo metadata", async () => {
    const photo = new File([new Uint8Array([1, 2, 3])], "../sink photo.jpg", {
      type: "image/jpeg",
    });

    const response = await POST(
      createRequest(validFields, "198.51.100.7", [photo]),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true, via: "direct" });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = mocks.fetch.mock.calls[0];
    expect(url).toBe("https://cms.example.com/api/public/maintenance-request");
    expect(options).toMatchObject({
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.7" },
      body: expect.any(FormData),
    });
    const forwarded = options.body as FormData;
    expect(forwarded.get("firstName")).toBe("Jamie");
    expect((forwarded.get("photos") as File).name).toBe("sink_photo.jpg");
    expect(mocks.buildMaintenancePayload).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("returns unavailable when direct delivery fails and email is not configured", async () => {
    mocks.fetch.mockResolvedValue(directFailure());
    mocks.isMaintenanceIntakeConfigured.mockReturnValue(false);

    const response = await POST(createRequest(validFields, "198.51.100.8"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.buildMaintenancePayload).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("returns unavailable when fallback signing has no shared secret", async () => {
    mocks.fetch.mockResolvedValue(directFailure());
    mocks.env.MAINTENANCE_INTAKE_SHARED_SECRET = undefined;

    const response = await POST(createRequest(validFields, "198.51.100.16"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.buildMaintenancePayload).not.toHaveBeenCalled();
    expect(mocks.signMaintenancePayload).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("falls back to signed email when the direct endpoint throws", async () => {
    mocks.fetch.mockRejectedValue(new Error("network failure"));

    const response = await POST(createRequest(validFields, "198.51.100.9"));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true, via: "email" });
    expect(mocks.buildMaintenancePayload).toHaveBeenCalledTimes(1);
    expect(mocks.signMaintenancePayload).toHaveBeenCalledWith(
      expect.any(Object),
      "shared-secret",
    );
    expect(mocks.sendMaintenanceRequestEmail).toHaveBeenCalledTimes(1);
  });

  it("builds, signs, and emails a fallback submission with unique attachments", async () => {
    mocks.fetch.mockResolvedValue(directFailure(502));
    const photos = [
      new File([new Uint8Array([1])], "same photo.jpg", { type: "image/jpeg" }),
      new File([new Uint8Array([2])], "same photo.jpg", { type: "image/jpeg" }),
      new File([new Uint8Array([3])], "same photo.jpg", { type: "image/jpeg" }),
    ];

    const response = await POST(
      createRequest(validFields, "198.51.100.10", photos),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true, via: "email" });
    expect(mocks.buildMaintenancePayload).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Jamie",
        petInResidence: true,
        photos: [
          { filename: "same_photo.jpg", contentType: "image/jpeg" },
          { filename: "same_photo-1.jpg", contentType: "image/jpeg" },
          { filename: "same_photo-2.jpg", contentType: "image/jpeg" },
        ],
      }),
    );
    expect(mocks.signMaintenancePayload).toHaveBeenCalledWith(
      expect.objectContaining({ photos: expect.any(Array) }),
      "shared-secret",
    );
    expect(mocks.render).toHaveBeenCalledTimes(2);
    const params = mocks.sendMaintenanceRequestEmail.mock.calls[0]?.[0];
    expect(params).toMatchObject({
      html: "<p>email</p>",
      text: "<p>email</p>",
      replyTo: "jamie@example.com",
      attachments: expect.any(Array),
    });
    expect(params.attachments.map((item: { filename: string }) => item.filename)).toEqual([
      "submission.json",
      "same_photo.jpg",
      "same_photo-1.jpg",
      "same_photo-2.jpg",
    ]);
    expect(Buffer.isBuffer(params.attachments[0].content)).toBe(true);
  });

  it("returns a gateway error when payload construction fails", async () => {
    mocks.fetch.mockResolvedValue(directFailure());
    mocks.buildMaintenancePayload.mockImplementation(() => {
      throw new Error("payload failure");
    });

    const response = await POST(createRequest(validFields, "198.51.100.11"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.signMaintenancePayload).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("returns a gateway error when signing fails", async () => {
    mocks.fetch.mockResolvedValue(directFailure());
    mocks.signMaintenancePayload.mockImplementation(() => {
      throw new Error("signing failure");
    });

    const response = await POST(createRequest(validFields, "198.51.100.12"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.render).not.toHaveBeenCalled();
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("returns a gateway error when email rendering fails", async () => {
    mocks.fetch.mockResolvedValue(directFailure());
    mocks.render.mockRejectedValue(new Error("render failure"));

    const response = await POST(createRequest(validFields, "198.51.100.13"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.sendMaintenanceRequestEmail).not.toHaveBeenCalled();
  });

  it("returns a gateway error when fallback email delivery fails", async () => {
    mocks.fetch.mockResolvedValue(directFailure());
    mocks.sendMaintenanceRequestEmail.mockRejectedValue(new Error("SMTP failure"));

    const response = await POST(createRequest(validFields, "198.51.100.14"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.sendMaintenanceRequestEmail).toHaveBeenCalledTimes(1);
  });

  it("rate limits the sixth request from one IP before delivery", async () => {
    const ip = "198.51.100.15";
    for (let index = 0; index < 5; index += 1) {
      await POST(createRequest(validFields, ip));
    }
    mocks.fetch.mockClear();

    const response = await POST(createRequest(validFields, ip));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
