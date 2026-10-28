'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { captureError } from '@/lib/observability/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to the monitoring seam — never render the stack to the user (L5).
    captureError(error, { digest: error.digest, boundary: 'app/error' });
  }, [error]);

  return (
    <div className="container section">
      <EmptyState
        title="This page did not load"
        description="The server could not fetch what this page needs. This is usually temporary, so try again in a moment. If it keeps happening, browse available homes instead."
      >
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/search" variant="secondary">
          Browse available homes
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
