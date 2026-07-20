import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cmsImageUrl,
  getCmsBuilding,
  getPublicMaintenanceUnitInventory,
  listCmsBuildings,
} from "../client";

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
  it("prepends an absolute origin to a relative path", () => {
    // Asserted structurally so the test doesn't depend on the ambient
    // CMS_API_URL (which dev setups override to e.g. http://localhost:3000).
    const url = cmsImageUrl("/api/public/cms/images/abc");
    expect(url).toMatch(/^https?:\/\/[^/]+\/api\/public\/cms\/images\/abc$/);
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

describe("getPublicMaintenanceUnitInventory", () => {
  it("returns the public inventory and caches it for five minutes", async () => {
    mockFetch(async () =>
      okJson({
        data: { buildings: [{ name: "Maple Court", units: ["1A", "2B"] }] },
      }),
    );

    await expect(getPublicMaintenanceUnitInventory()).resolves.toEqual({
      buildings: [{ name: "Maple Court", units: ["1A", "2B"] }],
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/public/maintenance-units"),
      expect.objectContaining({ next: { revalidate: 300 } }),
    );
  });

  it("returns null when the inventory request fails", async () => {
    mockFetch(async () => new Response("error", { status: 500 }));

    await expect(getPublicMaintenanceUnitInventory()).resolves.toBeNull();
  });
});
