'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Form';
import { moderateAction } from '@/lib/listings/actions';
import styles from './ModerationPanel.module.css';

/**
 * Moderation decision panel. One form, several submit buttons — each carries the
 * chosen action as its `value`. A reason is required for "request changes" and
 * "reject" (enforced server-side too).
 */
export function ModerationPanel({ id, canSuspend }: { id: string; canSuspend: boolean }) {
  const [state, action, pending] = useActionState(moderateAction.bind(null, id), {});

  return (
    <form action={action} className={styles.panel}>
      {state.error ? (
        <Alert tone="caution" title="Could not record the decision">
          {state.error}
        </Alert>
      ) : null}

      <Field
        label="Reason / feedback"
        htmlFor="reason"
        hint="Required when requesting changes or rejecting. Shared with the lister."
      >
        <Textarea id="reason" name="reason" />
      </Field>

      <div className={styles.buttons}>
        <Button type="submit" name="action" value="approve" variant="primary" disabled={pending}>
          Approve
        </Button>
        <Button
          type="submit"
          name="action"
          value="request_changes"
          variant="secondary"
          disabled={pending}
        >
          Request changes
        </Button>
        <Button type="submit" name="action" value="reject" variant="danger" disabled={pending}>
          Reject
        </Button>
        {canSuspend ? (
          <Button
            type="submit"
            name="action"
            value="suspend"
            variant="secondary"
            disabled={pending}
          >
            Suspend
          </Button>
        ) : null}
      </div>
    </form>
  );
}
