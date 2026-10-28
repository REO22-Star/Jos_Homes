import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { shouldIndex, siteConfig, siteUrl } from '@/lib/site';
import './globals.css';

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
  themeColor: '#0f6e5f',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the session here makes public pages render per-request. That is a
  // deliberate Milestone 1 trade: the header must reflect real account state.
  const user = await getCurrentUser();

  return (
    <html lang="en">
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body> after
          SSR; suppress the resulting hydration attribute warning for this element
          only — it does not affect hydration of the app's own markup. */}
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
