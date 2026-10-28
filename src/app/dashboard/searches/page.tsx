import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { SavedSearchControls } from '@/components/search/SavedSearchControls';
import { requireUser } from '@/lib/auth/current-actor';
import { listMySearches } from '@/lib/data/seeker';
import { toQueryString } from '@/lib/data/search-params';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Saved searches' };

export default async function SearchesPage() {
  const user = await requireUser('/dashboard/searches');
  const searches = listMySearches(user);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Saved searches</h2>
      <p className={styles.role}>
        Re-run a search or get alerted when a new matching home is approved.
      </p>

      {searches.length === 0 ? (
        <EmptyState
          title="No saved searches yet."
          description="Save a search from the search page to get alerts about matching homes."
        >
          <ButtonLink href="/search">Start a search</ButtonLink>
        </EmptyState>
      ) : (
        <div className={styles.cards} style={{ gridTemplateColumns: '1fr' }}>
          {searches.map((s) => {
            const qs = toQueryString(s.filters);
            return (
              <Card key={s.id} className={styles.card}>
                <div className={styles.head} style={{ marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h3 className={styles.cardTitle}>{s.name}</h3>
                    <p className={styles.role}>
                      {qs ? qs.replace(/&/g, ', ') : 'All available homes'}
                    </p>
                  </div>
                  <Badge tone={s.alertsEnabled ? 'positive' : 'neutral'}>
                    {s.alertsEnabled ? 'Alerts on' : 'Alerts off'}
                  </Badge>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <ButtonLink href={`/search${qs ? `?${qs}` : ''}`} variant="secondary" size="sm">
                    Run search
                  </ButtonLink>
                  <SavedSearchControls id={s.id} alertsEnabled={s.alertsEnabled} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
