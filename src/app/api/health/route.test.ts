import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkCmsHealth: vi.fn(),
}));

vi.mock("@/lib/cms/client", () => ({
  checkCmsHealth: mocks.checkCmsHealth,
}));

import { GET } from "./route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a healthy contract when the CMS is reachable", async () => {
    mocks.checkCmsHealth.mockResolvedValue({ ok: true, latencyMs: 12 });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      cms: { ok: true, latencyMs: 12 },
      timestamp: "2026-08-09T12:00:00.000Z",
    });
  });

  it("returns degraded when the CMS reports an outage", async () => {
    mocks.checkCmsHealth.mockResolvedValue({
      ok: false,
      error: "unreachable",
    });

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "degraded",
      cms: { ok: false, error: "unreachable" },
      timestamp: "2026-08-09T12:00:00.000Z",
    });
  });

  it("propagates an unexpected CMS health-check failure", async () => {
    mocks.checkCmsHealth.mockRejectedValue(new Error("health check crashed"));

    await expect(GET()).rejects.toThrow("health check crashed");
  });
});
