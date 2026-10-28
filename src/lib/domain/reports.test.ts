import { describe, expect, it } from 'vitest';
import { isValidReportReason, isValidResolution } from './reports';
import { isBadgeValid } from './verification';

describe('report validation', () => {
  it('accepts known reasons and resolutions, rejects others', () => {
    expect(isValidReportReason('Duplicate listing')).toBe(true);
    expect(isValidReportReason('made up reason')).toBe(false);
    expect(isValidResolution('placed_under_review')).toBe(true);
    expect(isValidResolution('delete_everything')).toBe(false);
  });
});

describe('isBadgeValid (I3/I4)', () => {
  const now = new Date('2026-07-21T12:00:00.000Z');

  it('is valid only when active, not revoked, not expired', () => {
    expect(isBadgeValid({ status: 'active', expiresAtISO: null, revokedAtISO: null }, now)).toBe(
      true,
    );
  });

  it('a pending (e.g. paid-but-unreviewed) record is never valid (I4)', () => {
    expect(isBadgeValid({ status: 'pending', expiresAtISO: null, revokedAtISO: null }, now)).toBe(
      false,
    );
  });

  it('revoked or expired records are invalid (I3)', () => {
    expect(
      isBadgeValid({ status: 'active', expiresAtISO: null, revokedAtISO: '2026-01-01' }, now),
    ).toBe(false);
    expect(
      isBadgeValid({ status: 'active', expiresAtISO: '2020-01-01', revokedAtISO: null }, now),
    ).toBe(false);
  });
});
