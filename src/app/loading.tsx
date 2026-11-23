import { Skeleton } from '@/components/ui/Skeleton';

/** Placeholder shaped like the listing rows that usually follow. */
export default function Loading() {
  return (
    <div className="container section" aria-busy="true">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <Skeleton width="60%" height="2.2rem" />
      <div style={{ height: 'var(--space-5)' }} />
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{ display: 'grid', gridTemplateColumns: '104px 1fr', gap: 'var(--space-4)' }}
          >
            <Skeleton height="78px" />
            <div>
              <Skeleton width="80%" />
              <div style={{ height: 'var(--space-2)' }} />
              <Skeleton width="50%" />
              <div style={{ height: 'var(--space-2)' }} />
              <Skeleton width="35%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
