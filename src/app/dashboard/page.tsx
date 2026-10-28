import type { Metadata } from 'next';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { requireUser } from '@/lib/auth/current-actor';
import { usingDevAuth } from '@/lib/auth';
import { usingFictionalData } from '@/lib/data';
import { isStaff } from '@/lib/domain/authorization';
import styles from './dashboard.module.css';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await requireUser();
  const { denied } = await searchParams;

  return (
    <div className="stack">
      {denied ? (
        <Alert tone="caution" title="You do not have permission to open that page">
          Your account role ({user.role}) does not include that area.
        </Alert>
      ) : null}

      {usingDevAuth() || usingFictionalData() ? (
        <Alert tone="info" title="Prototype environment">
          {usingFictionalData()
            ? 'Listings are served from the fictional in-repo dataset because Supabase is not configured. '
            : ''}
          {usingDevAuth()
            ? 'Accounts are development-only and stored in memory; they reset when the server restarts.'
            : ''}
        </Alert>
      ) : null}

      <div className={styles.cards}>
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>Your role</h2>
          <p className={styles.stat}>{user.role}</p>
          <p className={styles.muted}>
            {user.role === 'seeker' && 'You can browse, save homes, and contact listers.'}
            {user.role === 'lister' && 'You can create and manage vacancies once submission opens.'}
            {user.role === 'moderator' &&
              'You can review listings and reports, but not identity evidence.'}
            {user.role === 'admin' &&
              'You have broad operational access. Sensitive actions are audited.'}
          </p>
        </Card>

        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>What you can do here</h2>
          <p className={styles.muted}>
            This milestone establishes accounts, roles, and the protected shell. Creating and
            submitting listings arrives in the next milestone.
          </p>
        </Card>

        {user.role === 'lister' ? (
          <Card className={styles.card}>
            <h2 className={styles.cardTitle}>My listings</h2>
            <p className={styles.stat}>0</p>
            <p className={styles.muted}>
              You have not listed a vacancy yet. Creating a draft opens in Milestone 2.
            </p>
          </Card>
        ) : null}

        {isStaff(user.role) ? (
          <Card className={styles.card}>
            <h2 className={styles.cardTitle}>Review queue</h2>
            <p className={styles.stat}>0</p>
            <p className={styles.muted}>
              Submitted listings awaiting review. The moderation workflow opens in Milestone 2.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
