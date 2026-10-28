import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { __resetEngagementDB } from './engagement-store';
import {
  createInspection,
  listInspections,
  metricsFor,
  recordContactInquiry,
  recordView,
  updateInspectionStatus,
} from './engagement';

const now = new Date('2026-07-21T12:00:00.000Z');
const later = (mins: number) => new Date(now.getTime() + mins * 60 * 1000);

const user = (id: string, role: AuthUser['role']): AuthUser => ({
  id,
  email: `${role}@example.test`,
  displayName: `${role}`,
  role,
  accountStatus: 'active',
});
const LISTER = 'lister-1';
const lister = user(LISTER, 'lister');
const otherLister = user('lister-2', 'lister');

const human = { isOwner: false, isStaff: false, isBot: false };

afterEach(() => __resetEngagementDB());

describe('qualified views (F3/F4)', () => {
  it('counts an engaged visit once per visitor within the dedupe window (F3)', () => {
    expect(recordView('L1', 'anon-a', human, 8, now)).toBe(true);
    // Same visitor again within 24h -> not counted again.
    expect(recordView('L1', 'anon-a', human, 8, later(30))).toBe(false);
    // A different visitor is counted.
    expect(recordView('L1', 'anon-b', human, 8, later(31))).toBe(true);
    expect(metricsFor('L1', later(60)).qualifiedViews7d).toBe(2);
  });

  it('never counts owners, staff, bots, or brief visits (F4)', () => {
    expect(recordView('L1', 'o', { ...human, isOwner: true }, 8, now)).toBe(false);
    expect(recordView('L1', 's', { ...human, isStaff: true }, 8, now)).toBe(false);
    expect(recordView('L1', 'b', { ...human, isBot: true }, 8, now)).toBe(false);
    expect(recordView('L1', 'q', human, 2, now)).toBe(false);
    expect(metricsFor('L1', now).qualifiedViews7d).toBe(0);
  });
});

describe('inquiries (F5/F6)', () => {
  it('records contact-click inquiries into the aggregate count', () => {
    recordContactInquiry('L1', 'call_click', now);
    recordContactInquiry('L1', 'whatsapp_click', later(1));
    expect(metricsFor('L1', later(2)).inquiries7d).toBe(2);
    // Views and inquiries are independent counters.
    expect(metricsFor('L1', later(2)).qualifiedViews7d).toBe(0);
  });
});

describe('inspection requests (G1/G2/G3)', () => {
  const input = { name: 'Amina', phone: '+2348000000001', consent: true };

  it('requires name, phone, and consent (G1)', () => {
    expect(createInspection('L1', 'A home', LISTER, { ...input, consent: false }, now).ok).toBe(
      false,
    );
    expect(createInspection('L1', 'A home', LISTER, { ...input, name: '' }, now).ok).toBe(false);
    expect(createInspection('L1', 'A home', LISTER, input, now).ok).toBe(true);
  });

  it('appears only in the assigned lister’s inbox (G2) and counts as an inquiry', () => {
    createInspection('L1', 'A home', LISTER, input, now);
    expect(listInspections(lister)).toHaveLength(1);
    expect(listInspections(otherLister)).toHaveLength(0);
    expect(metricsFor('L1', later(1)).inquiries7d).toBe(1);
  });

  it('only the assigned lister may update the status (G3)', () => {
    const created = createInspection('L1', 'A home', LISTER, input, now);
    if (!created.ok) throw new Error('create');
    expect(updateInspectionStatus(lister, created.record.id, 'acknowledged', now)).toEqual({
      ok: true,
    });
    expect(() => updateInspectionStatus(otherLister, created.record.id, 'spam', now)).toThrow(
      AuthorizationError,
    );
  });
});
