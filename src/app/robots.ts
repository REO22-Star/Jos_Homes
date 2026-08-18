import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jos-homes.vercel.app';
  const allowIndexing = process.env.JOSHOMES_ALLOW_INDEXING === 'true';

  if (!allowIndexing) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/agents', '/api', '/privacy', '/terms'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
