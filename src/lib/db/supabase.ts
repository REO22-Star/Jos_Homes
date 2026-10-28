import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client factories.
 *
 * Milestone 1 wires these behind environment variables. When they are absent
 * the application falls back to the development in-memory backends, so the
 * prototype runs with no external service (see src/lib/auth/index.ts and
 * src/lib/data/index.ts).
 *
 * The service-role key is read ONLY here and only on the server. It must never
 * be referenced from a client component or prefixed with NEXT_PUBLIC_.
 */

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined;
}

/** True when both public Supabase settings are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * Anon client. Subject to row level security — this is what public and ordinary
 * signed-in reads should use.
 */
export function createAnonClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error('Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and _ANON_KEY.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Service-role client. BYPASSES row level security — server-only, and only for
 * trusted operations such as resolving a session's profile or writing audit
 * logs. Never expose the resulting client or its key to the browser.
 */
export function createServiceClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase service role is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
