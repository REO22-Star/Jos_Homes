import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const PREFIX = 'scrypt';

/**
 * Password hashing. Even the development-only auth provider stores hashes
 * rather than plaintext, so the prototype never models a bad practice.
 * Production auth is delegated to Supabase Auth, which does its own hashing.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${PREFIX}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/** Constant-time verification. Returns false on any malformed input. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== PREFIX) return false;

  const saltB64 = parts[1];
  const hashB64 = parts[2];
  if (!saltB64 || !hashB64) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltB64, 'base64');
    expected = Buffer.from(hashB64, 'base64');
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}

/** Minimum password policy for the prototype. */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Use a password of at least 8 characters.';
  if (password.length > 200) return 'Use a password shorter than 200 characters.';
  return null;
}
