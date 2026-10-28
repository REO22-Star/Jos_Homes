import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { requireUser } from '@/lib/auth/current-actor';
import { listMyNotifications } from '@/lib/notifications/service';
import type { NotificationCategory } from '@/lib/data/notifications-store';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Notifications' };

const TONE: Record<NotificationCategory, BadgeTone> = {
  operational: 'neutral',
  alert: 'brand',
  marketing: 'sponsored',
};

export default async function NotificationsPage() {
  const user = await requireUser('/dashboard/notifications');
  const items = listMyNotifications(user);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Notifications</h2>
      {items.length === 0 ? (
        <EmptyState
          title="No notifications yet."
          description="Alerts and updates will appear here."
        />
      ) : (
        <div className={styles.cards} style={{ gridTemplateColumns: '1fr' }}>
          {items.map((n) => (
            <Card key={n.id} className={styles.card}>
              <div className={styles.head} style={{ marginBottom: 'var(--space-2)' }}>
                <h3 className={styles.cardTitle}>{n.title}</h3>
                <Badge tone={TONE[n.category]}>{n.category}</Badge>
              </div>
              <p style={{ margin: 0 }}>{n.body}</p>
              {n.listingSlug ? (
                <p style={{ margin: 'var(--space-2) 0 0' }}>
                  <Link href={`/listing/${n.listingSlug}`}>View the home →</Link>
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
