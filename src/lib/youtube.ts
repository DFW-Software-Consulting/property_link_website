/**
 * Turn a YouTube link (watch / youtu.be / embed / shorts) into an embeddable
 * URL, or return null when the input isn't a recognizable YouTube video. Pure —
 * safe to use server- or client-side.
 */
const PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
  /youtube\.com\/shorts\/([\w-]{11})/,
];

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  for (const pattern of PATTERNS) {
    const id = trimmed.match(pattern)?.[1];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  return null;
}
