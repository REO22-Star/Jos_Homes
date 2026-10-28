import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Random anonymous visitor id for privacy-conscious view/inquiry deduplication
 * (docs/DATA_MODEL.md #9). It is a random opaque cookie — NOT device
 * fingerprinting — and carries no personal data.
 */
export const VISITOR_COOKIE = 'joshomes_vid';

export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
