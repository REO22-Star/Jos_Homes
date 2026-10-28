'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { resolveReportAction, type ModState } from '@/lib/moderation/actions';
import styles from './ModerationPanel.module.css';

/** Staff report triage. Each button carries the chosen resolution as its value. */
export function ReportTriage({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ModState, FormData>(
    resolveReportAction.bind(null, id),
    {},
  );

  return (
    <form action={action} className={styles.panel}>
      {state.message ? <Alert tone="positive">{state.message}</Alert> : null}
      {state.error ? <Alert tone="caution">{state.error}</Alert> : null}
      <div className={styles.buttons}>
        <Button
          type="submit"
          name="resolution"
          value="dismissed_no_issue"
          variant="ghost"
          size="sm"
          disabled={pending}
        >
          Dismiss
        </Button>
        <Button
          type="submit"
          name="resolution"
          value="placed_under_review"
          variant="secondary"
          size="sm"
          disabled={pending}
        >
          Place under review
        </Button>
        <Button
          type="submit"
          name="resolution"
          value="lister_warned"
          variant="secondary"
          size="sm"
          disabled={pending}
        >
          Warn lister
        </Button>
        <Button
          type="submit"
          name="resolution"
          value="lister_suspended"
          variant="danger"
          size="sm"
          disabled={pending}
        >
          Suspend lister
        </Button>
      </div>
    </form>
  );
}
