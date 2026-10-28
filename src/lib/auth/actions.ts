'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthProvider } from './index';
import { checkRateLimit, resetRateLimit } from './rate-limit';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  getSessionSecret,
} from './session';
import { SELF_SERVICE_ROLES, type SelfServiceRole } from './types';

export interface AuthFormState {
  error?: string;
}

const SIGN_IN_LIMIT = 10;
const SIGN_IN_WINDOW_SECONDS = 15 * 60;

async function startSession(profileId: string): Promise<void> {
  const token = createSessionToken(profileId, getSessionSecret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Only allow relative in-app destinations, never an external redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  return '/dashboard';
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));

  if (!email || !password) {
    return { error: 'Enter your email address and password.' };
  }

  const limitKey = `signin:${email.toLowerCase()}`;
  const limit = checkRateLimit(limitKey, SIGN_IN_LIMIT, SIGN_IN_WINDOW_SECONDS);
  if (!limit.allowed) {
    return { error: 'Too many attempts were made in a short period. Please try again later.' };
  }

  const result = await getAuthProvider().signIn(email, password);
  if (!result.ok) return { error: result.error };

  resetRateLimit(limitKey);
  await startSession(result.user.id);
  redirect(next); // throws by design; must stay outside a try/catch
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();
  const requestedRole = String(formData.get('role') ?? 'seeker');

  // A submitted role outside the self-service set is rejected outright rather
  // than silently downgraded, so an escalation attempt is visible (C3).
  if (!(SELF_SERVICE_ROLES as readonly string[]).includes(requestedRole)) {
    return { error: 'That account type cannot be selected.' };
  }

  const result = await getAuthProvider().signUp({
    email,
    password,
    displayName,
    role: requestedRole as SelfServiceRole,
  });
  if (!result.ok) return { error: result.error };

  await startSession(result.user.id);
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/');
}
