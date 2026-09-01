import { afterEach, describe, expect, it, vi } from "vitest";

import { postFormRequest } from "../post-form-request";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("postFormRequest", () => {
  it("POSTs the form data and resolves with the parsed JSON on success", async () => {
    const json = vi.fn().mockResolvedValue({ ok: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    await expect(
      postFormRequest("/api/example", formData, "fallback message"),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith("/api/example", {
      method: "POST",
      body: formData,
    });
  });

  it("throws the server-provided error message on failure", async () => {
    const json = vi.fn().mockResolvedValue({ error: "Server said no" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json }),
    );

    await expect(
      postFormRequest("/api/example", new FormData(), "fallback message"),
    ).rejects.toThrow("Server said no");
  });

  it("falls back to the provided message when the error body is not JSON", async () => {
    const json = vi.fn().mockRejectedValue(new Error("not json"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json }),
    );

    await expect(
      postFormRequest("/api/example", new FormData(), "fallback message"),
    ).rejects.toThrow("fallback message");
  });
});
