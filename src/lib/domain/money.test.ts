import { describe, expect, it } from 'vitest';
import { formatNaira, nairaToMinor, sumMinor } from './money';

describe('money', () => {
  it('formats whole naira with thousands separators and no kobo', () => {
    expect(formatNaira(85_000_000)).toBe('NGN 850,000');
    expect(formatNaira(0)).toBe('NGN 0');
    expect(formatNaira(102_750_000)).toBe('NGN 1,027,500');
  });

  it('shows kobo only when present', () => {
    expect(formatNaira(85_000_050)).toBe('NGN 850,000.50');
    expect(formatNaira(99)).toBe('NGN 0.99');
  });

  it('formats negative amounts', () => {
    expect(formatNaira(-5000)).toBe('-NGN 50');
  });

  it('sums minor amounts and ignores nulls (unknown values)', () => {
    expect(sumMinor([100, 200, null, 50])).toBe(350);
    expect(sumMinor([])).toBe(0);
    expect(sumMinor([null, null])).toBe(0);
  });

  it('converts whole naira to minor units and rejects fractional input', () => {
    expect(nairaToMinor(850_000)).toBe(85_000_000);
    expect(() => nairaToMinor(1.5)).toThrow();
  });
});
