import type { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { shouldIndex, siteConfig, siteUrl } from '@/lib/site';
import './globals.css';

// One self-hosted family (D-046). `subsets` only chooses what is preloaded:
// every subset is still self-hosted, and the browser fetches latin-ext (Hausa
// ɓ ɗ ƙ, ₦, other accented letters) on demand via unicode-range when a page
// actually uses one, so only the basic Latin file is preloaded on every page.
// Leave `weight` unset so this loads the variable font (400 to 800). Requesting
// fixed weights makes Google Fonts return file URLs without a .woff2 extension,
// which crashes the next/font loader at build time.
const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    type: 'website',
  },
  // Indexing is opt-in via env, so staging/prototype deploys stay out of search.
  robots: shouldIndex() ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#24533a',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the session here makes public pages render per-request. That is a
  // deliberate Milestone 1 trade: the header must reflect real account state.
  const user = await getCurrentUser();

  return (
    // Browser extensions (e.g. Scribe on <html>, Grammarly on <body>) inject
    // attributes after SSR; suppress the resulting hydration attribute warning
    // for these two elements only. It does not affect the app's own markup.
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Header account={user ? { displayName: user.displayName } : null} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
