'use client';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { moderateMediaAction } from '@/lib/listings/actions';
import type { MediaItem } from './MediaManager';
import styles from './MediaManager.module.css';

const TONE: Record<MediaItem['state'], BadgeTone> = {
  pending: 'neutral',
  approved: 'positive',
  rejected: 'closed',
  quarantined: 'caution',
};

/** Moderator media review: approve or reject each uploaded image. */
export function MediaReview({ id, media }: { id: string; media: MediaItem[] }) {
  const bound = moderateMediaAction.bind(null, id);

  if (media.length === 0) {
    return <p className="muted">No images were uploaded for this listing.</p>;
  }

  return (
    <ul className={styles.grid}>
      {media.map((m) => (
        <li key={m.id} className={styles.item}>
          {m.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url} alt="" className={styles.thumb} />
          ) : (
            <div className={styles.thumbEmpty}>No preview</div>
          )}
          <div className={styles.meta}>
            <Badge tone={TONE[m.state]}>{m.state}</Badge>
          </div>
          <div className={styles.actions}>
            <form action={(fd) => void bound({}, fd)}>
              <input type="hidden" name="mediaId" value={m.id} />
              <Button type="submit" name="decision" value="approve" variant="primary" size="sm">
                Approve image
              </Button>
            </form>
            <form action={(fd) => void bound({}, fd)}>
              <input type="hidden" name="mediaId" value={m.id} />
              <Button type="submit" name="decision" value="reject" variant="danger" size="sm">
                Reject image
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
