import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { ListingWorkflowState } from '@/lib/domain/types';

const WORKFLOW_COPY: Record<ListingWorkflowState, { label: string; tone: BadgeTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  submitted: { label: 'In review', tone: 'brand' },
  changes_requested: { label: 'Changes requested', tone: 'caution' },
  approved: { label: 'Approved', tone: 'positive' },
  rejected: { label: 'Rejected', tone: 'closed' },
  suspended: { label: 'Suspended', tone: 'caution' },
  archived: { label: 'Archived', tone: 'closed' },
};

export function WorkflowBadge({ state }: { state: ListingWorkflowState }) {
  const copy = WORKFLOW_COPY[state];
  return <Badge tone={copy.tone}>{copy.label}</Badge>;
}
