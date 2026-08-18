/**
 * All money in this app is stored and computed in integer KOBO to avoid
 * floating-point errors. ₦1 = 100 kobo. Convert to naira only at the display edge.
 */

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

const nairaFmt = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Format kobo as a naira currency string, e.g. 15000000 -> "₦150,000". */
export function formatKobo(kobo: number): string {
  return nairaFmt.format(koboToNaira(kobo));
}

/** Short form for cards, e.g. 120000000 kobo -> "₦1.2M/yr". */
export function formatRentShort(kobo: number): string {
  const naira = koboToNaira(kobo);
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(naira % 1_000_000 === 0 ? 0 : 1)}M`;
  if (naira >= 1_000) return `₦${Math.round(naira / 1_000)}k`;
  return `₦${naira}`;
}
