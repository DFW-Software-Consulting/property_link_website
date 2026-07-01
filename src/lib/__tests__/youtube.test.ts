import { describe, expect, it } from "vitest";

import { getYouTubeEmbedUrl } from "../youtube";

describe("getYouTubeEmbedUrl", () => {
  it("handles watch, youtu.be, embed, and shorts URLs", () => {
    const embed = "https://www.youtube.com/embed/dQw4w9WgXcQ";
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(embed);
    expect(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(embed);
    expect(getYouTubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(embed);
    expect(getYouTubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(embed);
  });

  it("handles extra query params on a watch URL", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?list=abc&v=dQw4w9WgXcQ&t=5s")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("returns null for empty, nullish, or non-YouTube input", () => {
    expect(getYouTubeEmbedUrl(null)).toBeNull();
    expect(getYouTubeEmbedUrl(undefined)).toBeNull();
    expect(getYouTubeEmbedUrl("   ")).toBeNull();
    expect(getYouTubeEmbedUrl("https://vimeo.com/12345")).toBeNull();
    expect(getYouTubeEmbedUrl("not a url")).toBeNull();
  });
});
