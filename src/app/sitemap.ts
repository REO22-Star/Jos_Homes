import type { MetadataRoute } from 'next';
import { getListingRepository } from '@/lib/data';
import { getNow } from '@/lib/now';
import { shouldIndex, siteUrl } from '@/lib/site';

// Regenerate hourly so new and expired listings show up without a redeploy.
export const revalidate = 3600;

const STATIC_PATHS = [
  '',
  '/search',
  '/how-it-works',
  '/safety',
  '/about',
  '/contact',
  '/list-a-property',
  '/terms',
  '/privacy',
];

/**
 * Sitemap of public pages. Listing entries use the public slug only — never a
 * private address — and include only listings visible in ordinary search, so
 * taken/paused/unpublished listings are excluded (docs SEO §24).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly',
  }));

  if (!shouldIndex()) return staticPages;

  // A data outage must not fail the build or the sitemap; fall back to the
  // static pages and let the next revalidation pick listings up again.
  let listings;
  try {
    listings = await getListingRepository().searchAvailable({}, getNow());
  } catch (err) {
    console.error('sitemap: could not load listings', err);
    return staticPages;
  }
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}/listing/${l.slug}`,
    lastModified: new Date(l.freshness.lastConfirmedAtISO),
    changeFrequency: 'daily',
  }));
  return [...staticPages, ...listingPages];
}
