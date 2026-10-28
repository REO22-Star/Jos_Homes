import type { ListingWorkflowState } from './types';

/**
 * Listing workflow state machine.
 *
 * This encodes which workflow transitions are STRUCTURALLY valid, independent of
 * who may perform them. Authorization ("may this actor do it") lives in
 * authorization.ts; a state change must satisfy BOTH. This directly backs the
 * acceptance requirement that invalid status transitions are rejected
 * (docs/ACCEPTANCE_TESTS.md D3).
 */

export const WORKFLOW_TRANSITIONS: Record<ListingWorkflowState, ListingWorkflowState[]> = {
  draft: ['submitted', 'archived'],
  submitted: ['approved', 'changes_requested', 'rejected'],
  changes_requested: ['submitted', 'draft', 'archived'],
  approved: ['suspended', 'archived'],
  rejected: ['draft', 'archived'],
  suspended: ['approved', 'archived'],
  archived: [], // terminal
};

export function canTransitionWorkflow(
  from: ListingWorkflowState,
  to: ListingWorkflowState,
): boolean {
  return WORKFLOW_TRANSITIONS[from].includes(to);
}

export class WorkflowError extends Error {
  readonly status = 409;
  constructor(from: ListingWorkflowState, to: ListingWorkflowState) {
    super(`A listing cannot move from "${from}" to "${to}".`);
    this.name = 'WorkflowError';
  }
}

export function assertWorkflowTransition(
  from: ListingWorkflowState,
  to: ListingWorkflowState,
): void {
  if (!canTransitionWorkflow(from, to)) throw new WorkflowError(from, to);
}

/**
 * The lifecycle actions and the workflow state each moves a listing into. The
 * service maps a requested action to its target state, then checks both the
 * transition (here) and the actor's permission (authorization.ts).
 */
export type WorkflowAction =
  | 'submit_for_review'
  | 'approve'
  | 'request_changes'
  | 'reject'
  | 'suspend'
  | 'reinstate'
  | 'archive';

export const ACTION_TARGET: Record<WorkflowAction, ListingWorkflowState> = {
  submit_for_review: 'submitted',
  approve: 'approved',
  request_changes: 'changes_requested',
  reject: 'rejected',
  suspend: 'suspended',
  reinstate: 'approved',
  archive: 'archived',
};
