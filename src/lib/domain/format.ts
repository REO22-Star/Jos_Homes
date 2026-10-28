/**
 * Date formatting helpers. Uses a fixed en-GB day-month-year style to match
 * docs/CONTENT_AND_COPY.md (e.g. "17 July 2026").
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
});

export function formatLongDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Africa/Lagos',
});

/** Day and short month, e.g. "17 Jul". Used on the confirmation stamp. */
export function formatShortDate(iso: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(iso));
}

/** "Available now" if the move-in date has passed, otherwise the date. */
export function formatAvailableFrom(iso: string | null, now: Date): string {
  if (!iso) return 'Move-in date not stated';
  const date = new Date(iso);
  if (date.getTime() <= now.getTime()) return 'Available now';
  return `Available from ${formatLongDate(iso)}`;
}
