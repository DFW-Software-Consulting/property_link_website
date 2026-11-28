import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { CMS_API_URL: "https://emmut.example.com/" },
}));

import {
  checkResidentPortalEnabled,
  fetchPortalOverview,
  replyMaintenanceThread,
  requestLeaseRenewal,
  requestPortalMagicLink,
  ResidentPortalApiError,
  verifyPortalToken,
} from "../client";

describe("resident-portal client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("checks whether the resident portal feature flag is enabled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ data: { enabled: true } }) }),
    );
    expect(await checkResidentPortalEnabled()).toBe(true);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) }));
    expect(await checkResidentPortalEnabled()).toBe(false);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("timeout")));
    expect(await checkResidentPortalEnabled()).toBe(false);
  });

  it("sends magic link, verifies token, and loads overview", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { sent: true } }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { email: "r@example.com", sessionToken: "s1", expiresAt: "2030-01-01" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            residentEmail: "r@example.com",
            residentName: "Resident",
            stays: [],
            invoices: [],
            maintenanceRequests: [],
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    expect(await requestPortalMagicLink("r@example.com")).toEqual({ sent: true });
    expect((await verifyPortalToken("token-1234567890123456")).sessionToken).toBe("s1");
    expect((await fetchPortalOverview("s1")).residentEmail).toBe("r@example.com");
  });

  it("forwards maintenance replies, lease renewals, and propagates API errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { reservationId: 10 } }) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: "Expired" }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(replyMaintenanceThread("s1", 5, "Hello")).resolves.toEqual({ id: 1 });
    await expect(requestLeaseRenewal("s1", { reservationId: 10 })).resolves.toEqual({ reservationId: 10 });
    await expect(fetchPortalOverview("bad")).rejects.toBeInstanceOf(ResidentPortalApiError);
  });
});
