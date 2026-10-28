'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { submitAction } from '@/lib/listings/actions';

export function SubmitForReview({ id }: { id: string }) {
  const [state, action, pending] = useActionState(submitAction.bind(null, id), {});

  return (
    <form action={action}>
      {state.error ? (
        <Alert tone="caution" title="Not ready to submit">
          {state.error}
          {state.errors ? (
            <ul>
              {Object.values(state.errors).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit for review'}
      </Button>
    </form>
  );
}
