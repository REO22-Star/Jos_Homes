'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  reconfirmAction,
  setAvailabilityAction,
  type ListingFormState,
  type ReconfirmState,
} from '@/lib/listings/actions';
import { AVAILABILITY_COPY } from '@/lib/domain/availability';
import type { AvailabilityState, Freshness } from '@/lib/domain/types';
import { ConfirmationStamp } from './ConfirmationStamp';
import styles from './ModerationPanel.module.css';
import own from './AvailabilityControls.module.css';

/**
 * Lister availability controls for an approved listing: reconfirm freshness (E1)
 * and change the public status — mark available/paused/taken (E4).
 */
export function AvailabilityControls({
  id,
  state,
  freshness,
}: {
  id: string;
  state: AvailabilityState;
  /** Last confirmation as rendered by the page; replaced after a reconfirm. */
  freshness: Freshness;
}) {
  const [rState, reconfirm, rPending] = useActionState<ReconfirmState, FormData>(
    reconfirmAction.bind(null, id),
    {},
  );
  // After a reconfirm, show the new date at once and press the stamp. Keyed by
  // timestamp, so every reconfirm remounts the stamp and replays the press.
  const shown = rState.freshness ?? freshness;
  const [aState, setAvail, aPending] = useActionState<ListingFormState, FormData>(
    setAvailabilityAction.bind(null, id),
    {},
  );

  const message = rState.message ?? aState.message;
  const error = rState.error ?? aState.error;

  return (
    <div className={styles.panel}>
      <div className={own.statusRow}>
        <p className="muted">
          Current status: <strong>{AVAILABILITY_COPY[state].label}</strong>
        </p>
        <ConfirmationStamp
          key={shown.lastConfirmedAtISO}
          freshness={shown}
          pressed={Boolean(rState.freshness)}
        />
      </div>
      {message ? <Alert tone="positive">{message}</Alert> : null}
      {error ? <Alert tone="caution">{error}</Alert> : null}

      <div className={styles.buttons}>
        <form action={reconfirm}>
          <Button type="submit" variant="primary" disabled={rPending}>
            Reconfirm availability
          </Button>
        </form>
        <form action={setAvail} className={styles.buttons}>
          {state !== 'available' ? (
            <Button
              type="submit"
              name="availability"
              value="available"
              variant="secondary"
              disabled={aPending}
            >
              Mark available
            </Button>
          ) : null}
          {state !== 'paused' ? (
            <Button
              type="submit"
              name="availability"
              value="paused"
              variant="secondary"
              disabled={aPending}
            >
              Pause
            </Button>
          ) : null}
          {state !== 'taken' ? (
            <Button
              type="submit"
              name="availability"
              value="taken"
              variant="danger"
              disabled={aPending}
            >
              Mark taken
            </Button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
