import { describe, expect, it } from 'vitest';
import {
  ACTION_TARGET,
  assertWorkflowTransition,
  canTransitionWorkflow,
  WorkflowError,
} from './workflow';

describe('workflow transitions', () => {
  it('allows the normal submission and moderation path', () => {
    expect(canTransitionWorkflow('draft', 'submitted')).toBe(true);
    expect(canTransitionWorkflow('submitted', 'approved')).toBe(true);
    expect(canTransitionWorkflow('submitted', 'changes_requested')).toBe(true);
    expect(canTransitionWorkflow('submitted', 'rejected')).toBe(true);
    expect(canTransitionWorkflow('changes_requested', 'submitted')).toBe(true);
    expect(canTransitionWorkflow('approved', 'suspended')).toBe(true);
    expect(canTransitionWorkflow('suspended', 'approved')).toBe(true);
  });

  it('rejects skipping review (D3): draft cannot jump to approved', () => {
    expect(canTransitionWorkflow('draft', 'approved')).toBe(false);
  });

  it('rejects reviving a rejected listing straight to approved', () => {
    expect(canTransitionWorkflow('rejected', 'approved')).toBe(false);
    // It must go back through draft -> submitted -> approved.
    expect(canTransitionWorkflow('rejected', 'draft')).toBe(true);
  });

  it('treats archived as terminal', () => {
    expect(canTransitionWorkflow('archived', 'draft')).toBe(false);
    expect(canTransitionWorkflow('archived', 'approved')).toBe(false);
  });

  it('does not allow submitted to drop back to draft directly', () => {
    expect(canTransitionWorkflow('submitted', 'draft')).toBe(false);
  });

  it('assertWorkflowTransition throws WorkflowError only on invalid moves', () => {
    expect(() => assertWorkflowTransition('draft', 'submitted')).not.toThrow();
    expect(() => assertWorkflowTransition('draft', 'approved')).toThrow(WorkflowError);
    try {
      assertWorkflowTransition('draft', 'approved');
    } catch (e) {
      expect((e as WorkflowError).status).toBe(409);
    }
  });

  it('maps actions to their target workflow state', () => {
    expect(ACTION_TARGET.submit_for_review).toBe('submitted');
    expect(ACTION_TARGET.approve).toBe('approved');
    expect(ACTION_TARGET.request_changes).toBe('changes_requested');
    expect(ACTION_TARGET.reject).toBe('rejected');
    expect(ACTION_TARGET.suspend).toBe('suspended');
    expect(ACTION_TARGET.archive).toBe('archived');
  });
});
