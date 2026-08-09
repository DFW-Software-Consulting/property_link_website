import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  env: { TURNSTILE_SECRET_KEY: "turnstile-secret" as string | undefined },
}));

vi.mock("@/lib/env", () => ({ env: mocks.env }));

import { verifyCaptcha } from "../captcha";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("verifyCaptcha", () => {
  beforeEach(() => {
    mocks.env.TURNSTILE_SECRET_KEY = "turnstile-secret";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("submits the token, secret, and remote IP to Turnstile", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
        void _input;
        void _init;
        return jsonResponse({ success: true });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyCaptcha("token-value", "203.0.113.10")).resolves.toEqual({
      success: true,
      reason: undefined,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
    const request = fetchMock.mock.calls[0]?.[1];
    const body = request?.body;
    expect(body).toBeInstanceOf(URLSearchParams);
    if (!(body instanceof URLSearchParams)) throw new Error("Expected URLSearchParams");
    expect(body.toString()).toBe(
      "secret=turnstile-secret&response=token-value&remoteip=203.0.113.10",
    );
  });

  it("returns the provider rejection reason and rejects missing tokens before fetch", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ success: false, "error-codes": ["invalid-input-response"] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyCaptcha("bad-token")).resolves.toEqual({
      success: false,
      reason: "invalid-input-response",
    });
    await expect(verifyCaptcha(null)).resolves.toEqual({
      success: false,
      reason: "missing-token",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails closed for network errors and malformed provider responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("request timed out");
    }));
    await expect(verifyCaptcha("token")).resolves.toEqual({
      success: false,
      reason: "verify-request-failed",
    });

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(null)));
    await expect(verifyCaptcha("token")).resolves.toEqual({
      success: false,
      reason: "verify-request-failed",
    });
  });

  it("skips verification when no Turnstile secret is configured", async () => {
    mocks.env.TURNSTILE_SECRET_KEY = undefined;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyCaptcha(undefined)).resolves.toEqual({
      success: true,
      reason: "not-configured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("skipping verification"));
  });
});
