'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteSearchAction, toggleAlertsAction, type SeekerState } from '@/lib/seeker/actions';

export function SavedSearchControls({ id, alertsEnabled }: { id: string; alertsEnabled: boolean }) {
  const [delState, del, delPending] = useActionState<SeekerState, FormData>(
    deleteSearchAction.bind(null, id),
    {},
  );
  const [alertState, toggle, togglePending] = useActionState<SeekerState, FormData>(
    toggleAlertsAction.bind(null, id),
    {},
  );

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
      <form action={toggle}>
        <input type="hidden" name="enabled" value={String(!alertsEnabled)} />
        <Button type="submit" variant="secondary" size="sm" disabled={togglePending}>
          {alertsEnabled ? 'Turn alerts off' : 'Turn alerts on'}
        </Button>
      </form>
      <form action={del}>
        <Button type="submit" variant="danger" size="sm" disabled={delPending}>
          Delete
        </Button>
      </form>
      {alertState.message || delState.message ? (
        <span className="muted">{alertState.message ?? delState.message}</span>
      ) : null}
    </div>
  );
}
