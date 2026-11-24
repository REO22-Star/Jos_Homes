'use client';

import { useState } from 'react';
import { PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import type { PropertyType, PublicMedia } from '@/lib/domain/types';
import { LayoutSketch } from './LayoutSketch';
import { MediaImage } from './MediaImage';
import styles from './Gallery.module.css';

export function Gallery({
  media,
  propertyType,
}: {
  media: PublicMedia[];
  propertyType: PropertyType;
}) {
  const [active, setActive] = useState(0);
  // Fade only after the visitor picks a photo. The first photo must appear at
  // once: it is the page's main image and is loaded at high priority.
  const [switched, setSwitched] = useState(false);
  // Only photos with a URL are shown (uploaded, or labelled sample stock photos);
  // placeholder media is never presented as a photo.
  const photos = media.filter((m) => m.url);

  if (photos.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.sketch}>
          <LayoutSketch propertyType={propertyType} />
        </div>
        <p className={styles.caption}>
          No photos have been added yet. The sketch shows a typical layout for a{' '}
          {PROPERTY_TYPE_LABEL[propertyType].toLowerCase()}, not this property.
        </p>
      </div>
    );
  }

  const current = photos[active] ?? photos[0]!;

  return (
    <div className={styles.gallery}>
      <div
        // A new key per photo remounts the frame, so the fade replays each switch.
        key={switched ? current.id : undefined}
        className={switched ? `${styles.main} ${styles.fadeIn}` : styles.main}
      >
        <MediaImage
          media={current}
          ratio="16 / 10"
          sizes="(min-width: 960px) 620px, 100vw"
          priority
        />
      </div>
      {current.caption ? <p className={styles.caption}>{current.caption}</p> : null}
      {current.isSample ? (
        <p className={styles.caption}>
          Sample photo: a stock image standing in until the lister adds photos of this property.
        </p>
      ) : null}

      {photos.length > 1 ? (
        <ul className={styles.thumbs} aria-label="Property photos">
          {photos.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                className={styles.thumbButton}
                aria-pressed={i === active}
                aria-label={`Show photo ${i + 1}: ${m.alt}`}
                onClick={() => {
                  setActive(i);
                  setSwitched(true);
                }}
              >
                <MediaImage
                  media={{ ...m, alt: '' }}
                  ratio="1 / 1"
                  sizes="96px"
                  sampleLabel={false}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
