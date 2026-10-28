import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { __resetSeekerDB, setPreferences } from '@/lib/data/seeker-store';
import { __resetNotificationsDB } from '@/lib/data/notifications-store';
import { listMyNotifications, notify } from './service';

const now = new Date('2026-07-23T12:00:00.000Z');
const user = (id: string): AuthUser => ({
  id,
  email: `${id}@example.test`,
  displayName: id,
  role: 'seeker',
  accountStatus: 'active',
});

afterEach(() => {
  __resetSeekerDB();
  __resetNotificationsDB();
});

describe('notify — category vs preference', () => {
  it('always delivers operational and alert messages', () => {
    expect(
      notify({ recipientProfileId: 'u1', category: 'operational', title: 'Op', body: 'b' }, now),
    ).toBe(true);
    expect(
      notify({ recipientProfileId: 'u1', category: 'alert', title: 'Al', body: 'b' }, now),
    ).toBe(true);
    expect(listMyNotifications(user('u1'))).toHaveLength(2);
  });

  it('suppresses marketing unless the seeker opted in', () => {
    expect(
      notify({ recipientProfileId: 'u2', category: 'marketing', title: 'M', body: 'b' }, now),
    ).toBe(false);
    expect(listMyNotifications(user('u2'))).toHaveLength(0);

    setPreferences('u2', { marketingEmails: true });
    expect(
      notify({ recipientProfileId: 'u2', category: 'marketing', title: 'M', body: 'b' }, now),
    ).toBe(true);
    expect(listMyNotifications(user('u2'))).toHaveLength(1);
  });

  it('a user only sees their own notifications', () => {
    notify({ recipientProfileId: 'a', category: 'operational', title: 'A', body: 'b' }, now);
    notify({ recipientProfileId: 'b', category: 'operational', title: 'B', body: 'b' }, now);
    expect(listMyNotifications(user('a'))).toHaveLength(1);
    expect(listMyNotifications(user('a'))[0]!.title).toBe('A');
  });
});
