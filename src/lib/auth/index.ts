import { isSupabaseConfigured } from '@/lib/db/supabase';
import { devAuthProvider } from './dev-provider';
import { supabaseAuthProvider } from './supabase-provider';
import type { AuthProvider } from './types';

/**
 * Provider selection and the development-only boundary.
 *
 * Order of precedence:
 *   1. Supabase, whenever it is configured.
 *   2. The in-memory development provider, but ONLY outside production (or when
 *      an operator has explicitly opted in for a non-public demo).
 *   3. Otherwise refuse to start an auth flow at all.
 *
 * Step 3 is the important one: a production deployment that is missing its
 * Supabase configuration must fail loudly rather than silently fall back to
 * mock authentication (AGENTS.md — "clear development-only boundary around
 * mock authentication").
 */

export function isDevAuthAllowed(): boolean {
  if (process.env.JOSHOMES_ALLOW_DEV_AUTH === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export function getAuthProvider(): AuthProvider {
  if (isSupabaseConfigured()) return supabaseAuthProvider;

  if (isDevAuthAllowed()) return devAuthProvider;

  throw new Error(
    'No authentication provider is configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY, or set JOSHOMES_ALLOW_DEV_AUTH=true for a ' +
      'non-public demo. Mock authentication is never used in production by default.',
  );
}

/** True when the running app is using the fictional in-memory accounts. */
export function usingDevAuth(): boolean {
  return !isSupabaseConfigured() && isDevAuthAllowed();
}

export * from './types';
