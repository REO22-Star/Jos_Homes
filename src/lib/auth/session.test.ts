import { describe, expect, it } from 'vitest';
import { createSessionToken, verifySessionToken, type SessionPayload } from './session';

const SECRET = 'test-secret-at-least-16-chars-long';
const now = new Date('2026-07-19T12:00:00.000Z');

function decodeBody(token: string): SessionPayload {
  const body = token.slice(0, token.indexOf('.'));
  const padded = body.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as SessionPayload;
}

describe('session token', () => {
  it('round-trips a valid token', () => {
    const token = createSessionToken('profile-1', SECRET, now);
    const payload = verifySessionToken(token, SECRET, now);
    expect(payload?.sub).toBe('profile-1');
  });

  it('carries only the subject id and expiry — never a role', () => {
    const token = createSessionToken('profile-1', SECRET, now);
    const body = decodeBody(token);
    expect(Object.keys(body).sort()).toEqual(['exp', 'sub']);
    expect(body).not.toHaveProperty('role');
  });

  it('rejects a tampered payload (C3 — a forged role/subject cannot be trusted)', () => {
    const token = createSessionToken('profile-1', SECRET, now);
    const forgedBody = Buffer.from(JSON.stringify({ sub: 'admin-1', exp: decodeBody(token).exp }))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const forged = `${forgedBody}.${token.slice(token.indexOf('.') + 1)}`;
    expect(verifySessionToken(forged, SECRET, now)).toBeNull();
  });

  it('rejects a wrong signature and a wrong secret', () => {
    const token = createSessionToken('profile-1', SECRET, now);
    expect(verifySessionToken(`${token}x`, SECRET, now)).toBeNull();
    expect(verifySessionToken(token, 'a-different-secret-value', now)).toBeNull();
  });

  it('rejects an expired token', () => {
    const token = createSessionToken('profile-1', SECRET, now, 60);
    const later = new Date(now.getTime() + 61 * 1000);
    expect(verifySessionToken(token, SECRET, later)).toBeNull();
  });

  it('never throws on malformed or missing input', () => {
    for (const bad of [undefined, null, '', 'no-dot', '.', 'a.', '.b']) {
      expect(verifySessionToken(bad, SECRET, now)).toBeNull();
    }
  });
});
