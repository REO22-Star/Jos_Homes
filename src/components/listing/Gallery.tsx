'use client';

import { useState } from 'react';
import type { PublicMedia } from '@/lib/domain/types';
import { MediaImage } from './MediaImage';
import styles from './Gallery.module.css';

export function Gallery({ media }: { media: PublicMedia[] }) {
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    return (
      <div
        className={styles.empty}
        role="img"
        aria-label="No photos are available for this listing yet"
      >
        No photos are available yet
      </div>
    );
  }

  const current = media[active] ?? media[0]!;

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <MediaImage media={current} ratio="16 / 10" sizes="(min-width: 960px) 620px, 100vw" />
      </div>
      {current.caption ? <p className={styles.caption}>{current.caption}</p> : null}

      {media.length > 1 ? (
        <ul className={styles.thumbs} aria-label="Property photos">
          {media.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                className={styles.thumbButton}
                aria-pressed={i === active}
                aria-label={`Show photo ${i + 1}: ${m.alt}`}
                onClick={() => setActive(i)}
              >
                <MediaImage media={{ ...m, alt: '' }} ratio="1 / 1" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
