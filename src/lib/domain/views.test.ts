import { describe, expect, it } from 'vitest';
import { looksLikeBot, qualifiesAsView } from './views';

const base = { isOwner: false, isStaff: false, isBot: false, engagementSeconds: 10 };

describe('qualifiesAsView (F2/F4)', () => {
  it('qualifies an engaged, non-owner, non-staff, non-bot visit', () => {
    expect(qualifiesAsView(base).qualified).toBe(true);
  });

  it('excludes bots, owners, and staff', () => {
    expect(qualifiesAsView({ ...base, isBot: true })).toEqual({ qualified: false, reason: 'bot' });
    expect(qualifiesAsView({ ...base, isOwner: true })).toEqual({
      qualified: false,
      reason: 'owner',
    });
    expect(qualifiesAsView({ ...base, isStaff: true })).toEqual({
      qualified: false,
      reason: 'staff',
    });
  });

  it('excludes visits below the engagement threshold (default 5s)', () => {
    expect(qualifiesAsView({ ...base, engagementSeconds: 2 })).toEqual({
      qualified: false,
      reason: 'engagement',
    });
    expect(qualifiesAsView({ ...base, engagementSeconds: 5 }).qualified).toBe(true);
  });
});

describe('looksLikeBot', () => {
  it('flags missing UA and known automation', () => {
    expect(looksLikeBot(undefined)).toBe(true);
    expect(looksLikeBot('Googlebot/2.1')).toBe(true);
    expect(looksLikeBot('HeadlessChrome/120')).toBe(true);
    expect(looksLikeBot('Mozilla/5.0 (iPhone) Safari')).toBe(false);
  });
});
