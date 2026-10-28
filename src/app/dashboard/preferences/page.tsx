import type { Metadata } from 'next';
import { PreferencesForm } from '@/components/search/PreferencesForm';
import { requireUser } from '@/lib/auth/current-actor';
import { getMyPreferences } from '@/lib/data/seeker';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Preferences' };

export default async function PreferencesPage() {
  const user = await requireUser('/dashboard/preferences');
  const prefs = getMyPreferences(user);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Contact preferences</h2>
      <p className={styles.role}>
        Choose whether to receive marketing messages. Operational messages are always sent.
      </p>
      <PreferencesForm marketingEmails={prefs.marketingEmails} />
    </div>
  );
}
