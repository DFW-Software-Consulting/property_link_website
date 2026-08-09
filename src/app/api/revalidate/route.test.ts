import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  env: { CMS_REVALIDATE_SECRET: "expected-secret" as string | undefined },
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env: mocks.env }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { POST } from "./route";

function createRequest(token?: string, body?: unknown): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (token !== undefined) headers.set("x-revalidate-secret", token);

  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.CMS_REVALIDATE_SECRET = "expected-secret";
  });

  it("returns unavailable when webhook authentication is not configured", async () => {
    mocks.env.CMS_REVALIDATE_SECRET = undefined;

    const response = await POST(createRequest("expected-secret"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a missing secret without revalidating", async () => {
    const response = await POST(createRequest(undefined, { slug: "100-main" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a wrong same-length secret without revalidating", async () => {
    const response = await POST(
      createRequest("xxxxxxxxxxxxxxx", { slug: "100-main" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("revalidates shared paths and a normalized building slug", async () => {
    const response = await POST(
      createRequest("expected-secret", { slug: "  100-main  " }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      revalidated: ["/residences", "/sitemap.xml", "/residences/100-main"],
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ["/residences"],
      ["/sitemap.xml"],
      ["/residences/100-main"],
    ]);
  });

  it("revalidates every building page when the optional slug is invalid", async () => {
    const response = await POST(
      createRequest("expected-secret", { slug: 123 }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      revalidated: ["/residences", "/sitemap.xml", "/residences/[slug]"],
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ["/residences"],
      ["/sitemap.xml"],
      ["/residences/[slug]", "page"],
    ]);
  });

  it("treats malformed optional JSON as a request for all building pages", async () => {
    const response = await POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-revalidate-secret": "expected-secret",
        },
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      revalidated: ["/residences", "/sitemap.xml", "/residences/[slug]"],
    });
    expect(mocks.revalidatePath).toHaveBeenLastCalledWith(
      "/residences/[slug]",
      "page",
    );
  });

  it("propagates a cache revalidation failure", async () => {
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("cache unavailable");
    });

    await expect(
      POST(createRequest("expected-secret", { slug: "100-main" })),
    ).rejects.toThrow("cache unavailable");
  });
});
