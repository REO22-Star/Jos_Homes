import type { MetadataRoute } from 'next';
import { getListingRepository } from '@/lib/data';
import { getNow } from '@/lib/now';
import { shouldIndex, siteUrl } from '@/lib/site';

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

  const listings = await getListingRepository().searchAvailable({}, getNow());
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}/listing/${l.slug}`,
    lastModified: new Date(l.freshness.lastConfirmedAtISO),
    changeFrequency: 'daily',
  }));
  return [...staticPages, ...listingPages];
}
