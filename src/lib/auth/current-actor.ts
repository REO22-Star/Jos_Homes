import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GUEST, type Actor, type Role } from '@/lib/domain/authorization';
import { getAuthProvider } from './index';
import { SESSION_COOKIE, getSessionSecret, verifySessionToken } from './session';
import type { AuthUser } from './types';

/**
 * Resolve the current actor for a server request.
 *
 * The session cookie carries only a profile id; the role and account status are
 * re-read from the auth provider on every request, so a suspension or role
 * change takes effect immediately and the cookie can never assert a role.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  // Visitors without a session cookie never need the secret, so a missing
  // SESSION_SECRET cannot take down public pages.
  if (!token) return null;
  const payload = verifySessionToken(token, getSessionSecret());
  if (!payload) return null;

  try {
    return await getAuthProvider().getUserById(payload.sub);
  } catch {
    // A misconfigured provider must not crash a public page render.
    return null;
  }
}

export async function getActor(): Promise<Actor> {
  const user = await getCurrentUser();
  if (!user) return GUEST;
  return { id: user.id, role: user.role, accountStatus: user.accountStatus };
}

/** Require any signed-in account, or redirect to sign-in. */
export async function requireUser(returnTo = '/dashboard'): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Require one of the given roles, or send the user somewhere safe. */
export async function requireRole(roles: Role[], returnTo = '/dashboard'): Promise<AuthUser> {
  const user = await requireUser(returnTo);
  if (!roles.includes(user.role)) redirect('/dashboard?denied=1');
  return user;
}
