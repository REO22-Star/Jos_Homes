'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Form';
import { updateInspectionStatusAction, type InspectionFormState } from '@/lib/engagement/actions';
import type { InspectionStatus } from '@/lib/data/engagement-store';

const STATUSES: InspectionStatus[] = [
  'new',
  'acknowledged',
  'scheduled',
  'completed',
  'cancelled',
  'spam',
];

export function InspectionStatusForm({ id, status }: { id: string; status: InspectionStatus }) {
  const [state, action, pending] = useActionState<InspectionFormState, FormData>(
    updateInspectionStatusAction.bind(null, id),
    {},
  );

  return (
    <form action={action} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
      <Select name="status" defaultValue={status} aria-label="Inspection status">
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        Update
      </Button>
      {state.message ? <span className="muted">{state.message}</span> : null}
      {state.error ? <span style={{ color: 'var(--danger)' }}>{state.error}</span> : null}
    </form>
  );
}
