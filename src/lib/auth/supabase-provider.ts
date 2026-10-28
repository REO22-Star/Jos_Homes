import { createAnonClient, createServiceClient } from '@/lib/db/supabase';
import { validatePasswordStrength } from './password';
import {
  SELF_SERVICE_ROLES,
  type AuthProvider,
  type AuthResult,
  type AuthUser,
  type SignUpInput,
} from './types';
import type { AccountStatus, UserRole } from '@/lib/domain/authorization';

/**
 * Supabase-backed authentication.
 *
 * The role is always read from the `profiles` table, never from client-supplied
 * data or user metadata, so a user cannot claim an elevated role (C3).
 */

interface ProfileRow {
  id: string;
  role: UserRole;
  display_name: string;
  email: string | null;
  account_status: AccountStatus;
}

async function loadProfile(id: string): Promise<AuthUser | null> {
  const service = createServiceClient();
  const { data, error } = await service
    .from('profiles')
    .select('id, role, display_name, email, account_status')
    .eq('id', id)
    .maybeSingle<ProfileRow>();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email ?? '',
    displayName: data.display_name,
    role: data.role,
    accountStatus: data.account_status,
  };
}

export const supabaseAuthProvider: AuthProvider = {
  name: 'supabase',

  async signIn(email, password): Promise<AuthResult> {
    const client = createAnonClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    // Generic message so the response cannot be used to enumerate accounts.
    if (error || !data.user) {
      return { ok: false, error: 'That email and password combination was not recognised.' };
    }
    const profile = await loadProfile(data.user.id);
    if (!profile) return { ok: false, error: 'This account has no profile record.' };
    if (profile.accountStatus !== 'active') {
      return { ok: false, error: 'This account is not active. Contact support.' };
    }
    return { ok: true, user: profile };
  },

  async signUp({ email, password, displayName, role }: SignUpInput): Promise<AuthResult> {
    const weak = validatePasswordStrength(password);
    if (weak) return { ok: false, error: weak };
    if (!(SELF_SERVICE_ROLES as readonly string[]).includes(role)) {
      return { ok: false, error: 'That account type cannot be selected.' };
    }

    const client = createAnonClient();
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? 'Could not create the account.' };
    }

    // The profile row carries the role. It is written server-side with the
    // service client so the role can never be supplied by the browser.
    const service = createServiceClient();
    const { error: profileError } = await service.from('profiles').insert({
      id: data.user.id,
      role,
      display_name: displayName.trim(),
      email: email.trim().toLowerCase(),
    });
    if (profileError) {
      return { ok: false, error: 'Could not create the account profile.' };
    }

    return {
      ok: true,
      user: {
        id: data.user.id,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role,
        accountStatus: 'active',
      },
    };
  },

  async getUserById(id) {
    return loadProfile(id);
  },

  async setAccountStatus(id, status): Promise<{ ok: boolean }> {
    const service = createServiceClient();
    const { error } = await service
      .from('profiles')
      .update({ account_status: status })
      .eq('id', id);
    return { ok: !error };
  },
};
