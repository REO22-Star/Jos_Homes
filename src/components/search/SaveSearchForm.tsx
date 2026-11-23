'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { saveSearchAction, type SeekerState } from '@/lib/seeker/actions';
import type { SearchParams } from '@/lib/data/types';

/** Save the current search filters (signed-in users) so matches can alert them. */
export function SaveSearchForm({ params }: { params: SearchParams }) {
  const [state, action, pending] = useActionState<SeekerState, FormData>(saveSearchAction, {});

  return (
    <form
      action={action}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'flex-end' }}
    >
      {/* Carry the current filters as hidden fields. */}
      {params.area ? <input type="hidden" name="area" value={params.area} /> : null}
      {params.type ? <input type="hidden" name="type" value={params.type} /> : null}
      {params.minRent !== undefined ? (
        <input type="hidden" name="minRent" value={params.minRent} />
      ) : null}
      {params.maxRent !== undefined ? (
        <input type="hidden" name="maxRent" value={params.maxRent} />
      ) : null}
      {params.beds !== undefined ? <input type="hidden" name="beds" value={params.beds} /> : null}
      {params.furnished ? <input type="hidden" name="furnished" value="true" /> : null}
      {params.directLandlord ? <input type="hidden" name="directLandlord" value="true" /> : null}
      {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}

      <div style={{ flex: 1, minWidth: 180 }}>
        <Field label="Search name" htmlFor="save-search-name">
          <Input id="save-search-name" name="name" placeholder="e.g. Rayfield 2-bed" />
        </Field>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        Save search
      </Button>
      {state.message ? <Alert tone="positive">{state.message}</Alert> : null}
      {state.error ? <Alert tone="caution">{state.error}</Alert> : null}
    </form>
  );
}
