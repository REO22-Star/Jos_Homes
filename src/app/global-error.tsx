'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { captureError } from '@/lib/observability/logger';
import './globals.css';

/**
 * Last-resort boundary for errors thrown by the root layout itself (for
 * example the header's session lookup). It replaces the whole document, so it
 * renders its own <html>/<body> and a plain wordmark instead of the header,
 * which may be what failed. Copy matches app/error.tsx (CONTENT_AND_COPY).
 */
export default function RootLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to the monitoring seam; never render the stack to the user (L5).
    captureError(error, { digest: error.digest, boundary: 'app/global-error' });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>This page did not load | JosHomes</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <header style={{ background: 'var(--paper)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ paddingBlock: 'var(--space-4)' }}>
            {/* A full page load on purpose: the root layout just failed, so
                client-side navigation through it is not trustworthy. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                color: 'var(--ink)',
                fontWeight: 800,
                fontSize: '1.2rem',
                textDecoration: 'none',
              }}
            >
              JosHomes
            </a>
          </div>
        </header>
        <main className="container section">
          <EmptyState
            title="This page did not load"
            description="The server could not fetch what this page needs. This is usually temporary, so try again in a moment. If it keeps happening, browse available homes instead."
          >
            <Button onClick={reset}>Try again</Button>
            <ButtonLink href="/search" variant="secondary">
              Browse available homes
            </ButtonLink>
          </EmptyState>
        </main>
      </body>
    </html>
  );
}
