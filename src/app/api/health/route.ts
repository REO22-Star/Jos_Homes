import { usingDevAuth } from '@/lib/auth';
import { getListingRepository } from '@/lib/data';

/**
 * Lightweight health/uptime probe. Reports which backends are active so an
 * operator can confirm a deploy is wired to Supabase (not the dev fallbacks).
 * Returns no secrets and no user data.
 */
export async function GET() {
  return Response.json(
    {
      status: 'ok',
      service: 'joshomes',
      time: new Date().toISOString(),
      dataBackend: getListingRepository().name,
      auth: usingDevAuth() ? 'dev' : 'supabase',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
