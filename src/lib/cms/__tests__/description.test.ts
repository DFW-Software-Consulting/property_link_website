import { describe, expect, it } from "vitest";

import { descriptionToPlainText } from "../description";

describe("descriptionToPlainText", () => {
  it("returns an empty string for null/undefined/empty input", () => {
    expect(descriptionToPlainText(null)).toBe("");
    expect(descriptionToPlainText(undefined)).toBe("");
    expect(descriptionToPlainText("")).toBe("");
  });

  it("strips tags and joins block elements with a single space", () => {
    expect(
      descriptionToPlainText(
        "<h2>Highlights</h2><ul><li>Roof deck</li><li>In-unit laundry</li></ul><p>Walk to transit</p>"
      )
    ).toBe("Highlights Roof deck In-unit laundry Walk to transit");
  });

  it("turns <br> into a space so words on separate lines don't fuse", () => {
    expect(descriptionToPlainText("<p>Sunlit living room<br />Walkable neighborhood</p>")).toBe(
      "Sunlit living room Walkable neighborhood"
    );
  });

  it("decodes the entities the sanitizer emits", () => {
    expect(descriptionToPlainText("<p>Cats &amp; dogs welcome &mdash; ask us</p>")).toBe(
      "Cats & dogs welcome &mdash; ask us"
    );
  });

  it("collapses surrounding and internal whitespace", () => {
    expect(descriptionToPlainText("<p>  Bright   home  </p>")).toBe("Bright home");
  });

  it("passes plain text through unchanged", () => {
    expect(descriptionToPlainText("Just a plain description")).toBe("Just a plain description");
  });
});
