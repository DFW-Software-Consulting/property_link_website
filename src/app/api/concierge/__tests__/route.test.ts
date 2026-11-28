import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/concierge/client", async importOriginal => {
  const actual = await importOriginal<typeof import("@/lib/concierge/client")>();
  return {
    ...actual,
    checkConciergeEnabled: vi.fn(),
    sendConciergeMessage: vi.fn(),
  };
});

import { checkConciergeEnabled, ConciergeApiError, sendConciergeMessage } from "@/lib/concierge/client";

import { GET, POST } from "../route";

describe("concierge API proxy route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when disabled and 200 when enabled on GET", async () => {
    vi.mocked(checkConciergeEnabled).mockResolvedValueOnce(false);
    expect((await GET()).status).toBe(404);

    vi.mocked(checkConciergeEnabled).mockResolvedValueOnce(true);
    expect((await GET()).status).toBe(200);
  });

  it("validates payload and proxies answers or errors on POST", async () => {
    const bad = await POST(
      new Request("http://localhost/api/concierge", {
        method: "POST",
        body: JSON.stringify({ message: "" }),
      }),
    );
    expect(bad.status).toBe(400);

    vi.mocked(sendConciergeMessage).mockResolvedValueOnce({
      answer: "We offer furnished stays across NYC.",
      buildingsReferenced: ["The Mercer"],
      leadCaptured: false,
      modelUsed: "gemini-2.5-flash",
    });
    const ok = await POST(
      new Request("http://localhost/api/concierge", {
        method: "POST",
        body: JSON.stringify({ message: "Where are your buildings?" }),
      }),
    );
    expect(ok.status).toBe(200);

    vi.mocked(sendConciergeMessage).mockRejectedValueOnce(new ConciergeApiError("Rate limited", 429));
    const limited = await POST(
      new Request("http://localhost/api/concierge", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
      }),
    );
    expect(limited.status).toBe(429);
  });
});
