import type { AuthUser } from '@/lib/auth/types';
import { getPreferences } from '@/lib/data/seeker-store';
import {
  listNotifications,
  pushNotification,
  type Notification,
  type NotificationCategory,
} from '@/lib/data/notifications-store';

/**
 * Notification abstraction (Milestone 6).
 *
 * A message has a category: `operational` and `alert` messages are always
 * delivered; `marketing` requires an explicit opt-in. This keeps promotional
 * messages distinct from operational ones (acceptance: marketing preferences are
 * distinct). Delivery fans out to channels — an in-app inbox now, plus a
 * development "email" path — so a real email/SMS provider slots in later.
 */

export interface NotifyInput {
  recipientProfileId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  listingSlug?: string;
}

function devEmailChannel(input: NotifyInput): void {
  // Development email path — a real provider replaces this in Milestone 7.
  if (process.env.NODE_ENV !== 'test') {
    console.info(`[dev-email] (${input.category}) to ${input.recipientProfileId}: ${input.title}`);
  }
}

/** Deliver a notification. Returns false when suppressed by preferences. */
export function notify(input: NotifyInput, now: Date): boolean {
  if (input.category === 'marketing' && !getPreferences(input.recipientProfileId).marketingEmails) {
    return false; // no marketing without opt-in
  }
  pushNotification(
    {
      recipientProfileId: input.recipientProfileId,
      category: input.category,
      title: input.title,
      body: input.body,
      listingSlug: input.listingSlug ?? null,
    },
    now.getTime(),
  );
  devEmailChannel(input);
  return true;
}

/** A user's own in-app notifications (ownership enforced by profile id). */
export function listMyNotifications(user: AuthUser): Notification[] {
  return listNotifications(user.id);
}
