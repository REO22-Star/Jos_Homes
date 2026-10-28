import { getCurrentUser } from '@/lib/auth/current-actor';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { isStaff } from '@/lib/domain/authorization';
import { looksLikeBot } from '@/lib/domain/views';
import { getRecord } from '@/lib/data/authoring-store';
import { recordView } from '@/lib/data/engagement';
import { getOrCreateVisitorId } from '@/lib/engagement/visitor';

/**
 * Qualified-view beacon. The client posts this only after the page has been
 * engaged for the threshold time, so a bare page load is never counted as an
 * inquiry (F1). Owners, staff, and bots are excluded (F4); the same visitor is
 * de-duplicated within the window by the store (F3).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let engagementSeconds = 0;
  try {
    const body = (await req.json()) as { engagementSeconds?: number };
    engagementSeconds = Number(body?.engagementSeconds) || 0;
  } catch {
    engagementSeconds = 0;
  }

  const visitorId = await getOrCreateVisitorId();

  // Basic abuse control on the beacon.
  const limit = checkRateLimit(`view:${visitorId}:${id}`, 20, 60);
  if (!limit.allowed) return new Response(null, { status: 429 });

  const user = await getCurrentUser();
  const record = getRecord(id);
  const isOwner = Boolean(user && record && record.assignedListerId === user.id);
  const staff = Boolean(user && isStaff(user.role));
  const bot = looksLikeBot(req.headers.get('user-agent'));

  recordView(id, visitorId, { isOwner, isStaff: staff, isBot: bot }, engagementSeconds, new Date());
  return new Response(null, { status: 204 });
}
