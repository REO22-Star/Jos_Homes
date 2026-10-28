import { randomUUID } from 'node:crypto';
import { hashPassword, validatePasswordStrength, verifyPassword } from './password';
import {
  SELF_SERVICE_ROLES,
  type AuthProvider,
  type AuthResult,
  type AuthUser,
  type SignUpInput,
} from './types';

/**
 * DEVELOPMENT-ONLY authentication provider.
 *
 * Holds fictional accounts in memory so the prototype is runnable without a
 * live Supabase project. It is selected only by `getAuthProvider()` in
 * src/lib/auth/index.ts, which refuses to use it in production. It is not a
 * security boundary and must never back a real deployment.
 *
 * The account ids match the UUIDs in supabase/seed.sql so both backends agree.
 */

/** Shared password for every seeded fictional account. Development only. */
export const DEV_PASSWORD = 'joshomes-dev';

interface DevRecord extends AuthUser {
  passwordHash: string;
}

const SEED_ACCOUNTS: Array<Omit<DevRecord, 'passwordHash'>> = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    email: 'grace@example.test',
    displayName: 'Grace Estates (fictional)',
    role: 'lister',
    accountStatus: 'active',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    email: 'daniel@example.test',
    displayName: 'Daniel Danjuma (fictional)',
    role: 'lister',
    accountStatus: 'active',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000006',
    email: 'seeker@example.test',
    displayName: 'Amina Seeker (fictional)',
    role: 'seeker',
    accountStatus: 'active',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000007',
    email: 'mod@example.test',
    displayName: 'Moderator (fictional)',
    role: 'moderator',
    accountStatus: 'active',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000008',
    email: 'admin@example.test',
    displayName: 'Administrator (fictional)',
    role: 'admin',
    accountStatus: 'active',
  },
];

/**
 * The store is hung off `globalThis` on purpose. The Next.js server runtime may
 * evaluate a module more than once (server actions and RSC page code can resolve
 * separate module instances), so a bare module-level `Map` is NOT reliably
 * shared across requests. A runtime-created account would then be lost between
 * the sign-up POST and the next GET. A global singleton is shared by every
 * instance and fixes that. (This provider is development-only regardless.)
 */
interface DevStore {
  users: Map<string, DevRecord>; // key: lowercased email
  initialized: Promise<void> | null;
}

const globalRef = globalThis as unknown as { __joshomesDevStore?: DevStore };
const store: DevStore = (globalRef.__joshomesDevStore ??= { users: new Map(), initialized: null });
const users = store.users;

async function init(): Promise<void> {
  if (!store.initialized) {
    store.initialized = (async () => {
      const hash = await hashPassword(DEV_PASSWORD);
      for (const account of SEED_ACCOUNTS) {
        users.set(account.email.toLowerCase(), { ...account, passwordHash: hash });
      }
    })();
  }
  return store.initialized;
}

function publicUser(record: DevRecord): AuthUser {
  const { passwordHash: _passwordHash, ...user } = record;
  return user;
}

export const devAuthProvider: AuthProvider = {
  name: 'dev',

  async signIn(email, password): Promise<AuthResult> {
    await init();
    const record = users.get(email.trim().toLowerCase());
    // Same generic message whether the email is unknown or the password is
    // wrong, so the response cannot be used to enumerate accounts.
    const generic = 'That email and password combination was not recognised.';
    if (!record) return { ok: false, error: generic };
    if (!(await verifyPassword(password, record.passwordHash))) {
      return { ok: false, error: generic };
    }
    if (record.accountStatus !== 'active') {
      return { ok: false, error: 'This account is not active. Contact support.' };
    }
    return { ok: true, user: publicUser(record) };
  },

  async signUp({ email, password, displayName, role }: SignUpInput): Promise<AuthResult> {
    await init();
    const key = email.trim().toLowerCase();
    if (!key.includes('@')) return { ok: false, error: 'Enter a valid email address.' };
    if (!displayName.trim()) return { ok: false, error: 'Enter the name to show on your account.' };

    const weak = validatePasswordStrength(password);
    if (weak) return { ok: false, error: weak };

    // Never honour a role outside the self-service set (C3).
    if (!(SELF_SERVICE_ROLES as readonly string[]).includes(role)) {
      return { ok: false, error: 'That account type cannot be selected.' };
    }
    if (users.has(key)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }

    const record: DevRecord = {
      id: randomUUID(),
      email: key,
      displayName: displayName.trim(),
      role,
      accountStatus: 'active',
      passwordHash: await hashPassword(password),
    };
    users.set(key, record);
    return { ok: true, user: publicUser(record) };
  },

  async getUserById(id): Promise<AuthUser | null> {
    await init();
    for (const record of users.values()) {
      if (record.id === id) return publicUser(record);
    }
    return null;
  },

  async setAccountStatus(id, status): Promise<{ ok: boolean }> {
    await init();
    for (const record of users.values()) {
      if (record.id === id) {
        record.accountStatus = status;
        return { ok: true };
      }
    }
    return { ok: false };
  },
};

/** Test helper: reset the in-memory store. */
export function __resetDevProvider(): void {
  users.clear();
  store.initialized = null;
}
