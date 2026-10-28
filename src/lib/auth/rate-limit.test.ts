import { afterEach, describe, expect, it } from 'vitest';
import { __resetAllRateLimits, checkRateLimit, resetRateLimit } from './rate-limit';

afterEach(() => __resetAllRateLimits());

const now = new Date('2026-07-19T12:00:00.000Z');

describe('checkRateLimit', () => {
  it('allows up to the limit then blocks (F7 — abuse control)', () => {
    const key = 'signin:test';
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3, 900, now).allowed).toBe(true);
    }
    expect(checkRateLimit(key, 3, 900, now).allowed).toBe(false);
  });

  it('resets after a successful action so honest users are not penalised', () => {
    const key = 'signin:test';
    checkRateLimit(key, 3, 900, now);
    resetRateLimit(key);
    expect(checkRateLimit(key, 3, 900, now).remaining).toBe(2);
  });

  it('starts a fresh window once the previous one has elapsed', () => {
    const key = 'signin:test';
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 900, now);
    const later = new Date(now.getTime() + 901 * 1000);
    expect(checkRateLimit(key, 3, 900, later).allowed).toBe(true);
  });
});
