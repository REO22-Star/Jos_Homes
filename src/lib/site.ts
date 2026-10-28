/** Central site configuration and public navigation. */
export const siteConfig = {
  name: 'JosHomes',
  tagline: 'Find a home that is actually available in Jos.',
  description:
    'Browse recently confirmed rental vacancies in Jos, Plateau State. See useful property media, understand the expected cost, and contact the responsible lister.',
  disclaimer:
    'JosHomes is a listing and communication platform. Verification labels describe limited checks and do not guarantee ownership, conduct, availability, or transaction outcome. Confirm the property, documents, authority, and charges before paying.',
} as const;

/** Canonical public origin, used for metadata/OG, robots, and the sitemap. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
}

/**
 * Whether search engines may index the site. Off by default so a prototype or
 * staging deploy is never indexed; the operator sets JOSHOMES_ALLOW_INDEXING=true
 * only for the real public pilot.
 */
export function shouldIndex(): boolean {
  return process.env.JOSHOMES_ALLOW_INDEXING === 'true';
}

export interface NavLink {
  href: string;
  label: string;
}

export const primaryNav: NavLink[] = [
  { href: '/search', label: 'Search homes' },
  { href: '/list-a-property', label: 'List a property' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/safety', label: 'Safety' },
];

export const footerNav: NavLink[] = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/safety', label: 'Safety guide' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact & complaints' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
];
