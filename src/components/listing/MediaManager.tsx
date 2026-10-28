'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  removeMediaAction,
  setCoverAction,
  uploadMediaAction,
  type ListingFormState,
} from '@/lib/listings/actions';
import styles from './MediaManager.module.css';

export interface MediaItem {
  id: string;
  url?: string;
  state: 'pending' | 'approved' | 'rejected' | 'quarantined';
}

const STATE_TONE: Record<MediaItem['state'], BadgeTone> = {
  pending: 'neutral',
  approved: 'positive',
  rejected: 'closed',
  quarantined: 'caution',
};
const STATE_LABEL: Record<MediaItem['state'], string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  quarantined: 'Quarantined',
};

export function MediaManager({ id, media }: { id: string; media: MediaItem[] }) {
  const [state, uploadForm, uploading] = useActionState<ListingFormState, FormData>(
    uploadMediaAction.bind(null, id),
    {},
  );
  const removeBound = removeMediaAction.bind(null, id);
  const coverBound = setCoverAction.bind(null, id);

  return (
    <div className={styles.wrap}>
      {media.length === 0 ? (
        <p className="muted">No images yet. Upload at least three usable property photos.</p>
      ) : (
        <ul className={styles.grid}>
          {media.map((m, i) => (
            <li key={m.id} className={styles.item}>
              {m.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className={styles.thumb} />
              ) : (
                <div className={styles.thumbEmpty}>Processing…</div>
              )}
              <div className={styles.meta}>
                <Badge tone={STATE_TONE[m.state]}>{STATE_LABEL[m.state]}</Badge>
                {i === 0 ? <span className={styles.cover}>Cover</span> : null}
              </div>
              <div className={styles.actions}>
                {i !== 0 ? (
                  <form action={(fd) => void coverBound({}, fd)}>
                    <input type="hidden" name="mediaId" value={m.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Make cover
                    </Button>
                  </form>
                ) : null}
                <form action={(fd) => void removeBound({}, fd)}>
                  <input type="hidden" name="mediaId" value={m.id} />
                  <Button type="submit" variant="danger" size="sm">
                    Remove
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={uploadForm} className={styles.uploader}>
        {state.message ? <Alert tone="positive">{state.message}</Alert> : null}
        {state.error ? (
          <Alert tone="caution" title="Some files were not uploaded">
            {state.error}
          </Alert>
        ) : null}
        <input
          type="file"
          name="files"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className={styles.file}
        />
        <Button type="submit" variant="secondary" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload images'}
        </Button>
        <p className="muted">JPEG, PNG, or WebP up to 5 MB each.</p>
      </form>
    </div>
  );
}
