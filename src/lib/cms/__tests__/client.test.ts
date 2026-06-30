import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cmsImageUrl, getCmsBuilding, listCmsBuildings } from "../client";

const buildingSummary = {
  slug: "138-bowery",
  name: "138 Bowery",
  neighborhood: "Bowery",
  address: "138 Bowery New York, NY 10013",
  hero: null,
  unitCount: 0,
};
const buildingDetail = { ...buildingSummary, description: null, units: [] };

function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

beforeEach(() => {
  // The client logs failures via console.error by design — keep test output clean.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("cmsImageUrl", () => {
  it("prepends the CMS origin to a relative path", () => {
    expect(cmsImageUrl("/api/public/cms/images/abc")).toBe(
      "https://emmut.dfwsc.com/api/public/cms/images/abc",
    );
  });
});

describe("listCmsBuildings", () => {
  it("unwraps the { data } envelope and returns the array", async () => {
    mockFetch(async () => okJson({ data: [buildingSummary] }));
    const result = await listCmsBuildings();
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("138-bowery");
  });

  it("returns [] when the response is not ok", async () => {
    mockFetch(async () => new Response("error", { status: 500 }));
    expect(await listCmsBuildings()).toEqual([]);
  });

  it("returns [] when the response shape is invalid", async () => {
    mockFetch(async () => okJson({ data: [{ slug: 123 }] }));
    expect(await listCmsBuildings()).toEqual([]);
  });

  it("returns [] on a network error", async () => {
    mockFetch(async () => {
      throw new Error("network down");
    });
    expect(await listCmsBuildings()).toEqual([]);
  });
});

describe("getCmsBuilding", () => {
  it("returns the validated building", async () => {
    mockFetch(async () => okJson({ data: buildingDetail }));
    const building = await getCmsBuilding("138-bowery");
    expect(building?.name).toBe("138 Bowery");
  });

  it("returns null when the shape is invalid", async () => {
    mockFetch(async () => okJson({ data: { slug: "x" } }));
    expect(await getCmsBuilding("x")).toBeNull();
  });

  it("returns null on a 404", async () => {
    mockFetch(async () => new Response("nope", { status: 404 }));
    expect(await getCmsBuilding("missing")).toBeNull();
  });
});
