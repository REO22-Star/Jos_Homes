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
        title="Something went wrong while loading this page"
        description="Try again, or return to available listings. No sensitive details are shown here."
      >
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/search" variant="secondary">
          Available listings
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
