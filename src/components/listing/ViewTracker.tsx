'use client';

import { useEffect, useRef } from 'react';

/**
 * Fires a qualified-view beacon after the page has been engaged for the
 * threshold time. A bare page load never counts as an inquiry (F1); the server
 * still excludes owners/staff/bots and de-duplicates by visitor (F3/F4).
 */
export function ViewTracker({
  listingId,
  thresholdSeconds = 5,
}: {
  listingId: string;
  thresholdSeconds?: number;
}) {
  const sent = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const timer = setTimeout(() => {
      if (sent.current) return;
      sent.current = true;
      const engagementSeconds = Math.round((Date.now() - start) / 1000);
      void fetch(`/api/listings/${listingId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagementSeconds }),
        keepalive: true,
      }).catch(() => {});
    }, thresholdSeconds * 1000);
    return () => clearTimeout(timer);
  }, [listingId, thresholdSeconds]);

  return null;
}
