import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { CMS_API_URL: "https://emmut.example.com/" },
}));

import { checkConciergeEnabled, ConciergeApiError, sendConciergeMessage } from "../client";

describe("concierge client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("checks whether AI concierge is enabled and fails closed when disabled or offline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ data: { enabled: true } }) }),
    );
    expect(await checkConciergeEnabled()).toBe(true);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }));
    expect(await checkConciergeEnabled()).toBe(false);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("timeout")));
    expect(await checkConciergeEnabled()).toBe(false);
  });

  it("forwards questions cleanly and throws ConciergeApiError on upstream error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              answer: "The Mercer has 4 furnished units.",
              buildingsReferenced: ["The Mercer"],
              leadCaptured: true,
              modelUsed: "gemini-2.5-flash",
            },
          }),
        })
        .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ error: "Disabled" }) }),
    );

    const reply = await sendConciergeMessage({
      message: "Do you have Mercer apartments?",
      lead: { email: "guest@example.com" },
    });
    expect(reply.leadCaptured).toBe(true);
    expect(reply.buildingsReferenced).toEqual(["The Mercer"]);

    await expect(sendConciergeMessage({ message: "Hello" })).rejects.toBeInstanceOf(ConciergeApiError);
  });
});
