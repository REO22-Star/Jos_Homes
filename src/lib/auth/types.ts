import type { AccountStatus, UserRole } from '@/lib/domain/authorization';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
}

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

/**
 * Roles a person may ever self-select at sign-up. Moderator and admin are
 * deliberately absent: elevated roles are only ever granted by an existing
 * administrator (acceptance C3).
 */
export const SELF_SERVICE_ROLES = ['seeker', 'lister'] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  role: SelfServiceRole;
}

/**
 * Authentication is kept behind this interface so the provider (development
 * mock today, Supabase Auth in a configured environment) can change without
 * touching pages or business rules.
 */
export interface AuthProvider {
  readonly name: 'dev' | 'supabase';
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(input: SignUpInput): Promise<AuthResult>;
  /** Resolve the current user from a session subject. Returns null if unknown. */
  getUserById(id: string): Promise<AuthUser | null>;
  /** Set an account's status (admin action: suspend/reactivate a lister). */
  setAccountStatus(id: string, status: AccountStatus): Promise<{ ok: boolean }>;
}
