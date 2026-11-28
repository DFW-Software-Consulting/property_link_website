import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieGetMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: cookieGetMock })),
}));

vi.mock("@/lib/resident-portal/client", async importOriginal => {
  const actual = await importOriginal<typeof import("@/lib/resident-portal/client")>();
  return {
    ...actual,
    requestPortalMagicLink: vi.fn(),
    verifyPortalToken: vi.fn(),
    fetchPortalOverview: vi.fn(),
    replyMaintenanceThread: vi.fn(),
    requestLeaseRenewal: vi.fn(),
  };
});

import {
  fetchPortalOverview,
  replyMaintenanceThread,
  requestLeaseRenewal,
  requestPortalMagicLink,
  ResidentPortalApiError,
  verifyPortalToken,
} from "@/lib/resident-portal/client";

import { POST as LOGOUT_POST } from "../logout/route";
import { POST as REPLY_POST } from "../maintenance/[id]/reply/route";
import { GET as OVERVIEW_GET } from "../overview/route";
import { POST as RENEWAL_POST } from "../renewal-request/route";
import { POST as REQUEST_LINK_POST } from "../request-link/route";
import { POST as VERIFY_POST } from "../verify/route";

describe("resident portal proxy API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates request-link payload and forwards requests", async () => {
    const bad = await REQUEST_LINK_POST(
      new Request("http://localhost/api/resident-portal/request-link", {
        method: "POST",
        body: JSON.stringify({ email: "bad" }),
      }),
    );
    expect(bad.status).toBe(400);

    vi.mocked(requestPortalMagicLink).mockResolvedValue({ sent: true });
    const ok = await REQUEST_LINK_POST(
      new Request("http://localhost/api/resident-portal/request-link", {
        method: "POST",
        body: JSON.stringify({ email: "jane@example.com" }),
      }),
    );
    expect(ok.status).toBe(200);
  });

  it("sets httpOnly session cookie on verify and clears it on logout", async () => {
    vi.mocked(verifyPortalToken).mockResolvedValue({
      email: "jane@example.com",
      sessionToken: "sess-1",
      expiresAt: "2030-01-01",
    });

    const res = await VERIFY_POST(
      new Request("http://localhost/api/resident-portal/verify", {
        method: "POST",
        body: JSON.stringify({ token: "valid-token-123456789" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("plw_resident_session=sess-1");

    const logout = await LOGOUT_POST();
    expect(logout.status).toBe(200);
    expect(logout.headers.get("set-cookie")).toContain("plw_resident_session=");
  });

  it("requires session cookie on overview, reply, and renewal", async () => {
    cookieGetMock.mockReturnValue(undefined);
    expect((await OVERVIEW_GET()).status).toBe(401);
    expect(
      (
        await REPLY_POST(
          new Request("http://localhost/api/resident-portal/maintenance/5/reply", {
            method: "POST",
            body: JSON.stringify({ body: "hi" }),
          }),
          { params: Promise.resolve({ id: "5" }) },
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await RENEWAL_POST(
          new Request("http://localhost/api/resident-portal/renewal-request", {
            method: "POST",
            body: JSON.stringify({ reservationId: 10 }),
          }),
        )
      ).status,
    ).toBe(401);
  });

  it("forwards overview, maintenance reply, and renewal when authenticated", async () => {
    cookieGetMock.mockReturnValue({ value: "sess-1" });
    vi.mocked(fetchPortalOverview).mockResolvedValue({
      residentEmail: "jane@example.com",
      residentName: "Jane",
      stays: [],
      invoices: [],
      maintenanceRequests: [],
    });
    expect((await OVERVIEW_GET()).status).toBe(200);

    vi.mocked(replyMaintenanceThread).mockResolvedValue({ id: 2 });
    const replyRes = await REPLY_POST(
      new Request("http://localhost/api/resident-portal/maintenance/5/reply", {
        method: "POST",
        body: JSON.stringify({ body: "Please ring bell" }),
      }),
      { params: Promise.resolve({ id: "5" }) },
    );
    expect(replyRes.status).toBe(201);

    vi.mocked(requestLeaseRenewal).mockRejectedValueOnce(new ResidentPortalApiError("Forbidden", 403));
    const renewalErr = await RENEWAL_POST(
      new Request("http://localhost/api/resident-portal/renewal-request", {
        method: "POST",
        body: JSON.stringify({ reservationId: 10 }),
      }),
    );
    expect(renewalErr.status).toBe(403);
  });
});
