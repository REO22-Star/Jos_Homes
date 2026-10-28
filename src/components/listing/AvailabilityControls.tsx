'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  reconfirmAction,
  setAvailabilityAction,
  type ListingFormState,
} from '@/lib/listings/actions';
import { AVAILABILITY_COPY } from '@/lib/domain/availability';
import type { AvailabilityState } from '@/lib/domain/types';
import styles from './ModerationPanel.module.css';

/**
 * Lister availability controls for an approved listing: reconfirm freshness (E1)
 * and change the public status — mark available/paused/taken (E4).
 */
export function AvailabilityControls({ id, state }: { id: string; state: AvailabilityState }) {
  const [rState, reconfirm, rPending] = useActionState(reconfirmAction.bind(null, id), {});
  const [aState, setAvail, aPending] = useActionState<ListingFormState, FormData>(
    setAvailabilityAction.bind(null, id),
    {},
  );

  const message = rState.message ?? aState.message;
  const error = rState.error ?? aState.error;

  return (
    <div className={styles.panel}>
      <p className="muted">
        Current status: <strong>{AVAILABILITY_COPY[state].label}</strong>
      </p>
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
