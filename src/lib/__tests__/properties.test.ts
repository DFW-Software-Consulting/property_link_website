import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { properties } from "@/lib/data/properties";

// The homepage shows this list only when the CMS is empty or unreachable. It has to say
// the same thing the live site says (Deck #573 and #608).

const ROOT = path.resolve(__dirname, "../../..");

describe("fallback building list", () => {
  it("does not feature 134 or 136 Bowery, which are not marketed", () => {
    const names = properties.map((property) => property.name);

    expect(names.filter((name) => /\b13[46]\b/.test(name))).toEqual([]);
    expect(
      properties
        .map((property) => property.slug)
        .filter((slug) => /13[46]/.test(slug)),
    ).toEqual([]);
  });

  it("features 138 Bowery as the only Bowery address", () => {
    const bowery = properties.filter((property) =>
      /bowery/i.test(property.name),
    );

    expect(bowery.map((property) => property.name)).toEqual(["138 Bowery"]);
  });

  it("features 45 West 81st Street in the Upper West Side", () => {
    const building = properties.find(
      (property) => property.name === "45 West 81st Street",
    );

    expect(building).toMatchObject({ neighborhood: "Upper West Side" });
    expect(building?.blurb.trim()).not.toBe("");
  });

  it("gives every building its own photo that exists in public/", () => {
    const missing = properties.filter(
      (property) => !existsSync(path.join(ROOT, "public", property.image)),
    );

    expect(missing.map((property) => property.name)).toEqual([]);
    expect(new Set(properties.map((property) => property.image)).size).toBe(
      properties.length,
    );
  });

  it("has a unique slug for every building", () => {
    const slugs = properties.map((property) => property.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
