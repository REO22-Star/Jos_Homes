import { describe, expect, it } from 'vitest';
import { buildFeeSummary } from './fees';
import { nairaToMinor } from './money';

describe('buildFeeSummary', () => {
  it('adds only known fees into the estimated move-in total', () => {
    const summary = buildFeeSummary({
      rentMinor: nairaToMinor(850_000),
      rentFrequency: 'annual',
      disclosure: 'fees_listed',
      agencyMinor: nairaToMinor(85_000),
      legalMinor: nairaToMinor(42_500),
      cautionMinor: nairaToMinor(50_000),
      serviceMinor: null, // not stated -> excluded from total
    });

    // 850,000 + 85,000 + 42,500 + 50,000 = 1,027,500
    expect(summary.estimatedMoveInTotalMinor).toBe(nairaToMinor(1_027_500));
  });

  it('treats a not-stated (null) fee differently from a real zero', () => {
    const summary = buildFeeSummary({
      rentMinor: nairaToMinor(600_000),
      rentFrequency: 'annual',
      disclosure: 'fees_listed',
      serviceMinor: null,
      cautionMinor: 0,
    });

    const service = summary.lines.find((l) => l.key === 'service');
    const caution = summary.lines.find((l) => l.key === 'caution');

    expect(service?.amountMinor).toBeNull();
    expect(service?.includedInTotal).toBe(false);
    expect(caution?.amountMinor).toBe(0);
    expect(caution?.includedInTotal).toBe(true);
    // Only rent contributes; a declared zero caution adds nothing.
    expect(summary.estimatedMoveInTotalMinor).toBe(nairaToMinor(600_000));
  });

  it('omits lines that are not applicable (undefined)', () => {
    const summary = buildFeeSummary({
      rentMinor: nairaToMinor(300_000),
      rentFrequency: 'annual',
      disclosure: 'none_known',
    });
    expect(summary.lines.map((l) => l.key)).toEqual(['rent']);
    expect(summary.estimatedMoveInTotalMinor).toBe(nairaToMinor(300_000));
  });

  it('uses a custom label for the other fee', () => {
    const summary = buildFeeSummary({
      rentMinor: nairaToMinor(300_000),
      rentFrequency: 'annual',
      disclosure: 'fees_listed',
      otherMinor: nairaToMinor(10_000),
      otherLabel: 'Refuse levy',
    });
    expect(summary.lines.find((l) => l.key === 'other')?.label).toBe('Refuse levy');
  });
});
