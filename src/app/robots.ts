import type { MetadataRoute } from 'next';
import { shouldIndex, siteUrl } from '@/lib/site';

/**
 * Indexing is opt-in. Until `JOSHOMES_ALLOW_INDEXING=true`, everything is
 * disallowed so a prototype/staging deploy never appears in search. When
 * enabled, private surfaces (dashboard, api, auth) stay disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (!shouldIndex()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api', '/sign-in', '/sign-up'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
