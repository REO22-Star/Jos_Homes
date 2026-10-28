import { describe, expect, it } from 'vitest';
import { buildFreshness, classifyFreshness, freshnessLabel } from './freshness';

const now = new Date('2026-07-18T12:00:00.000Z');
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => hoursAgo(d * 24);

describe('classifyFreshness (defaults 72h / 7d / 7d / 14d)', () => {
  it('is fresh within 72 hours', () => {
    expect(classifyFreshness(hoursAgo(2), now)).toBe('fresh');
    expect(classifyFreshness(hoursAgo(72), now)).toBe('fresh');
  });

  it('is recent between 3 and 7 days', () => {
    expect(classifyFreshness(hoursAgo(80), now)).toBe('recent');
    expect(classifyFreshness(daysAgo(7), now)).toBe('recent');
  });

  it('is overdue after 7 days', () => {
    expect(classifyFreshness(daysAgo(8), now)).toBe('overdue');
    expect(classifyFreshness(daysAgo(13), now)).toBe('overdue');
  });

  it('is suppressed at or beyond 14 days', () => {
    expect(classifyFreshness(daysAgo(14), now)).toBe('suppressed');
    expect(classifyFreshness(daysAgo(40), now)).toBe('suppressed');
  });
});

describe('freshnessLabel', () => {
  it('reads confirmed today / yesterday / N days ago', () => {
    expect(freshnessLabel('fresh', hoursAgo(2), now)).toBe('Confirmed today');
    expect(freshnessLabel('fresh', hoursAgo(30), now)).toBe('Confirmed yesterday');
    expect(freshnessLabel('recent', daysAgo(4), now)).toBe('Last confirmed 4 days ago');
  });

  it('reads confirmation overdue for overdue and suppressed', () => {
    expect(freshnessLabel('overdue', daysAgo(9), now)).toBe('Confirmation overdue');
    expect(freshnessLabel('suppressed', daysAgo(20), now)).toBe('Confirmation overdue');
  });
});

describe('buildFreshness', () => {
  it('bundles status, label, and ISO timestamp', () => {
    const f = buildFreshness(hoursAgo(2), now);
    expect(f.status).toBe('fresh');
    expect(f.label).toBe('Confirmed today');
    expect(f.lastConfirmedAtISO).toBe(hoursAgo(2).toISOString());
  });
});
