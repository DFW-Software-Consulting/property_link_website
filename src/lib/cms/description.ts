/**
 * Building/unit descriptions from the Emmut public CMS are now sanitized
 * rich-text HTML (headings, lists, bold, links) rather than plain text. This
 * helper flattens that HTML into a single plain-text line for the contexts that
 * cannot contain markup: `<meta>`/OpenGraph descriptions and JSON-LD.
 *
 * The CMS sanitizes the HTML server-side before serving it, so this is a
 * formatting concern, not a security boundary — we only strip tags and decode
 * the handful of entities the sanitizer emits.
 */

/** Closing block tags and `<br>` become spaces so adjacent words don't fuse. */
const BLOCK_BOUNDARY = /<\/(?:p|h[1-6]|li|blockquote|pre|div|tr)>|<br\s*\/?>/gi;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Flatten sanitized description HTML to a trimmed, single-spaced plain string. */
export function descriptionToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(BLOCK_BOUNDARY, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/gi, (match) => ENTITIES[match.toLowerCase()] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}
