import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { AVAILABILITY_COPY } from '@/lib/domain/availability';
import type { AvailabilityState, Freshness } from '@/lib/domain/types';

const AVAILABILITY_TONE: Record<AVForm, BadgeTone> = {
  positive: 'positive',
  neutral: 'neutral',
  caution: 'caution',
  closed: 'closed',
};
type AVForm = 'positive' | 'neutral' | 'caution' | 'closed';

export function AvailabilityBadge({ state }: { state: AvailabilityState }) {
  const copy = AVAILABILITY_COPY[state];
  return (
    <Badge tone={AVAILABILITY_TONE[copy.tone]} dot>
      {copy.label}
    </Badge>
  );
}

const FRESHNESS_TONE: Record<Freshness['status'], BadgeTone> = {
  fresh: 'positive',
  recent: 'neutral',
  overdue: 'caution',
  suppressed: 'caution',
};

export function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  return <Badge tone={FRESHNESS_TONE[freshness.status]}>{freshness.label}</Badge>;
}
