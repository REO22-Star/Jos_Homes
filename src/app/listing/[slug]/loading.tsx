import { Skeleton } from '@/components/ui/Skeleton';
import styles from './loading.module.css';

/**
 * Placeholder shaped like a listing page (heading and stamp, gallery, details
 * beside the cost card), so nothing jumps when the real page arrives.
 */
export default function ListingLoading() {
  return (
    <div className="container section" aria-busy="true">
      <p role="status" className="sr-only">
        Loading listing…
      </p>
      <Skeleton width="11rem" height="0.9rem" />
      <div className={styles.header}>
        <div className={styles.heading}>
          <Skeleton width="7rem" height="1.6rem" />
          <Skeleton width="85%" height="2.2rem" />
          <Skeleton width="55%" />
        </div>
        <Skeleton width="132px" height="58px" />
      </div>
      <div className={styles.gallery}>
        <Skeleton height="100%" />
      </div>
      <div className={styles.layout}>
        <div className={styles.lines}>
          <Skeleton width="12rem" height="1.5rem" />
          <Skeleton />
          <Skeleton />
          <Skeleton width="70%" />
        </div>
        <Skeleton height="220px" />
      </div>
    </div>
  );
}
