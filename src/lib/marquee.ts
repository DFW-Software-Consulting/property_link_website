/**
 * How many times a marquee renders its items so the looping track never shows
 * a gap. Always even: the track animates by half its width, so the second half
 * must mirror the first. Each half holds at least `minItemsPerHalf` items.
 */
export function marqueeCopies(
  itemCount: number,
  minItemsPerHalf: number,
): number {
  if (itemCount <= 0) return 0;
  return 2 * Math.max(1, Math.ceil(minItemsPerHalf / itemCount));
}

/**
 * Seconds for one loop (half the track), scaled by how many items that half
 * holds so the scroll speed stays the same as items are added.
 */
export function marqueeDurationSeconds(
  itemCount: number,
  copies: number,
  secondsPerItem: number,
): number {
  return ((itemCount * copies) / 2) * secondsPerItem;
}
