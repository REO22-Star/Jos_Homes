import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container section" aria-busy="true" aria-label="Loading">
      <Skeleton width="60%" height="2.2rem" />
      <div style={{ height: 'var(--space-4)' }} />
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton height="170px" radius="var(--radius-lg)" />
            <div style={{ height: 'var(--space-3)' }} />
            <Skeleton width="80%" />
            <div style={{ height: 'var(--space-2)' }} />
            <Skeleton width="50%" />
          </div>
        ))}
      </div>
    </div>
  );
}
