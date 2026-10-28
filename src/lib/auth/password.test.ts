import { describe, expect, it } from 'vitest';
import { hashPassword, validatePasswordStrength, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes to a salted scrypt format and verifies the correct password', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
  });

  it('rejects the wrong password', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(await verifyPassword('wrong password', stored)).toBe(false);
  });

  it('uses a unique salt so identical passwords hash differently', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
  });

  it('returns false for malformed stored values instead of throwing', async () => {
    for (const bad of ['', 'not-a-hash', 'scrypt$only-two', 'bcrypt$a$b']) {
      expect(await verifyPassword('x', bad)).toBe(false);
    }
  });
});

describe('validatePasswordStrength', () => {
  it('rejects short passwords and accepts adequate ones', () => {
    expect(validatePasswordStrength('short')).toMatch(/at least 8/);
    expect(validatePasswordStrength('longenough')).toBeNull();
  });
});
