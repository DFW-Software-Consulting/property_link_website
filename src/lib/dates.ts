/** Calendar helpers for date-only form fields (YYYY-MM-DD, no clock time). */

const NEW_YORK = "America/New_York";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

const newYorkIsoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: NEW_YORK,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Today's date in New York, where the buildings are. Using the visitor's own
 * clock would move the 30-day cutoff by a day either side of midnight.
 */
export function todayInNewYork(now: Date = new Date()): string {
  return newYorkIsoFormatter.format(now);
}

/**
 * A YYYY-MM-DD string as a UTC midnight date, or null when it isn't a real
 * calendar date. The round-trip check rejects overflow like 2026-02-31.
 */
export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

/** The date `days` after an ISO date, still as YYYY-MM-DD. */
export function addDaysIso(value: string, days: number): string | null {
  const date = parseIsoDate(value);
  if (!date) return null;
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Earliest move-out we accept: 30 days out, counted from the move-in date when
 * there is one, otherwise from today. That covers both the client's rule (no
 * date within the next 30 days) and the 30-day minimum stay.
 */
export function minMoveOutDate(
  moveInDate?: string,
  today: string = todayInNewYork(),
): string {
  const moveIn = moveInDate ? parseIsoDate(moveInDate) : null;
  const base = moveIn && moveInDate! > today ? moveInDate! : today;
  return addDaysIso(base, 30) ?? today;
}
