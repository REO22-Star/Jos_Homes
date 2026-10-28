/**
 * In-memory notifications (Milestone 6). Category distinguishes operational and
 * alert messages (always delivered) from marketing (opt-in only). This mirrors
 * the `notifications` table and its preference controls.
 */
export type NotificationCategory = 'operational' | 'alert' | 'marketing';

export interface Notification {
  id: string;
  recipientProfileId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Optional deep link to a public listing. */
  listingSlug: string | null;
  createdAtMs: number;
  read: boolean;
}

interface NotificationsDB {
  items: Notification[];
  seq: number;
}

const globalRef = globalThis as unknown as { __joshomesNotificationsDB?: NotificationsDB };

function db(): NotificationsDB {
  return (globalRef.__joshomesNotificationsDB ??= { items: [], seq: 0 });
}

export function pushNotification(
  data: Omit<Notification, 'id' | 'createdAtMs' | 'read'>,
  atMs: number,
): Notification {
  const store = db();
  store.seq += 1;
  const record: Notification = { ...data, id: `ntf-${store.seq}`, createdAtMs: atMs, read: false };
  store.items.push(record);
  return record;
}

export function listNotifications(profileId: string): Notification[] {
  return db()
    .items.filter((n) => n.recipientProfileId === profileId)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function unreadCount(profileId: string): number {
  return db().items.filter((n) => n.recipientProfileId === profileId && !n.read).length;
}

/** Erase all notifications for one recipient. */
export function clearNotifications(profileId: string): void {
  const store = db();
  store.items = store.items.filter((n) => n.recipientProfileId !== profileId);
}

export function __resetNotificationsDB(): void {
  const store = db();
  store.items = [];
  store.seq = 0;
}
