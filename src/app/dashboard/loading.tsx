import { Skeleton } from '@/components/ui/Skeleton';
import styles from './loading.module.css';

/**
 * Placeholder for a dashboard page. It renders inside the dashboard layout,
 * which keeps the account header and navigation visible while it loads.
 */
export default function DashboardLoading() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <Skeleton width="40%" height="1.6rem" />
      <div className={styles.cards}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton width="50%" height="1.1rem" />
            <Skeleton width="80%" />
            <Skeleton width="35%" />
          </div>
        ))}
      </div>
    </div>
  );
}
