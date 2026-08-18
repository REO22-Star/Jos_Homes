import type { MetadataRoute } from 'next';
import { getListings } from '@/lib/data/listings';

const STATIC_PATHS = [
  '',
  '/agents',
  '/privacy',
  '/terms',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jos-homes.vercel.app';
  const allowIndexing = process.env.JOSHOMES_ALLOW_INDEXING === 'true';

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  if (!allowIndexing) return staticPages;

  // Get all listings for sitemap
  const listings = await getListings({});
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${baseUrl}/listings/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...listingPages];
}
