'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { CheckboxField } from '@/components/ui/Form';
import {
  deleteMyDataAction,
  updatePreferencesAction,
  type SeekerState,
} from '@/lib/seeker/actions';

export function PreferencesForm({ marketingEmails }: { marketingEmails: boolean }) {
  const [state, action, pending] = useActionState<SeekerState, FormData>(
    updatePreferencesAction,
    {},
  );
  const [delState, del, delPending] = useActionState<SeekerState, FormData>(deleteMyDataAction, {});

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: '52ch' }}>
      <form action={action} style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {state.message ? <Alert tone="positive">{state.message}</Alert> : null}
        {state.error ? <Alert tone="caution">{state.error}</Alert> : null}
        <CheckboxField
          id="marketingEmails"
          name="marketingEmails"
          defaultChecked={marketingEmails}
          label="Send me occasional marketing emails about JosHomes. Operational messages, such as inspection updates and saved-search alerts, are always sent and are not affected by this setting."
        />
        <Button type="submit" variant="primary" disabled={pending}>
          Save preferences
        </Button>
      </form>

      <form action={del} style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <h3 style={{ margin: 0 }}>Delete my data</h3>
        <p className="muted" style={{ margin: 0 }}>
          Permanently delete your saved homes, saved searches, and notifications. This cannot be
          undone.
        </p>
        {delState.message ? <Alert tone="positive">{delState.message}</Alert> : null}
        <Button type="submit" variant="danger" disabled={delPending}>
          Delete my saved data
        </Button>
      </form>
    </div>
  );
}
