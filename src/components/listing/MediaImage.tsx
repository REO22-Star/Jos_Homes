import type { PublicMedia } from '@/lib/domain/types';
import { PlaceholderTile } from './PlaceholderTile';
import styles from './MediaImage.module.css';

/**
 * Renders an approved uploaded image, falling back to a safe placeholder tile
 * for seed/placeholder media. Uses a plain lazy-loaded <img> (not next/image)
 * so the dev media route needs no image-optimization configuration; responsive
 * sizing is handled by the container's aspect ratio and object-fit.
 *
 * Sample (stock) photos carry a visible "Sample photo" label, so a stand-in is
 * never mistaken for the property itself. Tiny thumbnails can opt out.
 */
export function MediaImage({
  media,
  ratio = '4 / 3',
  className,
  sizes,
  sampleLabel = true,
  priority = false,
}: {
  media: PublicMedia;
  ratio?: string;
  className?: string;
  sizes?: string;
  sampleLabel?: boolean;
  /**
   * Set for the one image that is the page's main visual above the fold (the
   * listing gallery's main photo): load it eagerly at high priority instead
   * of lazily, so it is not the slowest thing on the page.
   */
  priority?: boolean;
}) {
  if (media.url) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.url}
        alt={media.isSample ? `${media.alt} (sample photo)` : media.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        sizes={sizes}
        className={className}
        style={{ width: '100%', aspectRatio: ratio, objectFit: 'cover', display: 'block' }}
      />
    );
    if (!media.isSample || !sampleLabel) return img;
    return (
      <span className={styles.sample}>
        {img}
        <span className={styles.label} aria-hidden="true">
          Sample photo
        </span>
      </span>
    );
  }
  return (
    <PlaceholderTile
      hue={media.placeholderHue}
      alt={media.alt}
      ratio={ratio}
      className={className}
    />
  );
}
