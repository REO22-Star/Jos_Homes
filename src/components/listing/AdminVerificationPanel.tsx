'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import {
  issueVerificationAction,
  revokeVerificationAction,
  type ModState,
} from '@/lib/moderation/actions';
import { ISSUABLE_VERIFICATIONS } from '@/lib/domain/verification';
import { VERIFICATION_LABEL } from '@/lib/domain/labels';

export interface AdminVerificationItem {
  id: string;
  type: string;
  status: string;
}

export function AdminVerificationPanel({
  subjectId,
  subjectName,
  records,
}: {
  subjectId: string;
  subjectName: string;
  records: AdminVerificationItem[];
}) {
  const [state, issue] = useActionState<ModState, FormData>(
    issueVerificationAction.bind(null, subjectId),
    {},
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <p className="muted">Verification records for {subjectName}.</p>

      <ul
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-2)' }}
      >
        {records.map((r) => (
          <li
            key={r.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
            }}
          >
            <span>
              <Badge tone={r.status === 'active' ? 'positive' : 'closed'}>{r.status}</Badge>{' '}
              {VERIFICATION_LABEL[r.type as keyof typeof VERIFICATION_LABEL] ?? r.type}
            </span>
            {r.status === 'active' ? (
              <form action={(fd) => void revokeVerificationAction(r.id, {}, fd)}>
                <Button type="submit" variant="danger" size="sm">
                  Revoke
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      <form action={issue} style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {state.message ? <Alert tone="positive">{state.message}</Alert> : null}
        {state.error ? <Alert tone="caution">{state.error}</Alert> : null}
        <Field label="Verification type" htmlFor="ver-type">
          <Select id="ver-type" name="type" defaultValue="phone">
            {ISSUABLE_VERIFICATIONS.map((t) => (
              <option key={t} value={t}>
                {VERIFICATION_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Evidence summary"
          htmlFor="ver-summary"
          hint="What was checked (not the evidence file)."
        >
          <Input id="ver-summary" name="summary" />
        </Field>
        <Button type="submit" variant="primary">
          Issue verification
        </Button>
      </form>
    </div>
  );
}
