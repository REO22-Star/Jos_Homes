import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stateless signed session token.
 *
 * The token carries only the profile id and an expiry — never the role. The
 * role is resolved from the auth provider on every request so that a role
 * change or suspension takes effect immediately and a stale/forged role can
 * never be trusted from the cookie (acceptance C3).
 */

export const SESSION_COOKIE = 'joshomes_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  /** Profile id. */
  sub: string;
  /** Expiry, seconds since epoch. */
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

function sign(data: string, secret: string): string {
  return base64url(createHmac('sha256', secret).update(data).digest());
}

/** Create a signed token for a profile id. `now` is injected for testability. */
export function createSessionToken(
  profileId: string,
  secret: string,
  now: Date = new Date(),
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): string {
  const payload: SessionPayload = {
    sub: profileId,
    exp: Math.floor(now.getTime() / 1000) + maxAgeSeconds,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body, secret)}`;
}

/**
 * Verify a token. Returns the payload, or null when the token is malformed,
 * has a bad signature, or has expired. Never throws on untrusted input.
 */
export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  now: Date = new Date(),
): SessionPayload | null {
  if (!token) return null;

  const dot = token.indexOf('.');
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!body || !signature) return null;

  const expected = sign(body, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(fromBase64url(body).toString('utf8')) as SessionPayload;
  } catch {
    return null;
  }

  if (typeof payload?.sub !== 'string' || typeof payload?.exp !== 'number') return null;
  if (payload.exp * 1000 <= now.getTime()) return null;

  return payload;
}

/**
 * Resolve the signing secret. Production must supply SESSION_SECRET; a fixed
 * development fallback keeps local runs frictionless but is never used when
 * NODE_ENV is production.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET must be set to a value of at least 16 characters in production.',
    );
  }
  return 'joshomes-development-only-session-secret';
}
