import type { MinorAmount } from './types';

/**
 * Money helpers. All amounts are integer minor units (kobo; 100 kobo = NGN 1).
 * Never introduce floating-point arithmetic into totals.
 */

const MINOR_PER_MAJOR = 100;

/** Sum a set of minor amounts, ignoring nulls (unknown/not-stated values). */
export function sumMinor(amounts: Array<MinorAmount | null>): MinorAmount {
  return amounts.reduce<MinorAmount>((acc, value) => acc + (value ?? 0), 0);
}

/** Convert whole naira to minor units. Used only for constructing fixed seed data. */
export function nairaToMinor(naira: number): MinorAmount {
  if (!Number.isInteger(naira)) {
    throw new Error(`nairaToMinor expects an integer naira amount, received ${naira}`);
  }
  return naira * MINOR_PER_MAJOR;
}

/**
 * Format a minor amount as Nigerian naira, e.g. 85000000 -> "NGN 850,000".
 * Kobo are shown only when the amount is not a whole naira value.
 */
export function formatNaira(minor: MinorAmount): string {
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const major = Math.floor(abs / MINOR_PER_MAJOR);
  const kobo = abs % MINOR_PER_MAJOR;

  const majorText = major.toLocaleString('en-NG');
  const koboText = kobo > 0 ? `.${kobo.toString().padStart(2, '0')}` : '';

  return `${negative ? '-' : ''}NGN ${majorText}${koboText}`;
}
