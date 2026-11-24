import type { PublicMedia } from '@/lib/domain/types';
import { PlaceholderTile } from './PlaceholderTile';
import styles from './MediaImage.module.css';

const SAMPLE_PHOTO = /^\/sample-photos\/([^/]+\.jpg)$/;

/**
 * The srcset for a sample photo: its 40% copy and the original. Both widths
 * are stated for a 1000px-wide original; portrait originals are narrower, but
 * their copies are scaled by the same 40%, so the browser still picks the
 * right one. Uploaded photos have no small copy yet, so they get none.
 */
export function sampleSrcSet(url: string): string | undefined {
  const match = SAMPLE_PHOTO.exec(url);
  if (!match) return undefined;
  return `/sample-photos/small/${match[1]} 400w, ${url} 1000w`;
}

/**
 * Renders an approved uploaded image, falling back to a safe placeholder tile
 * for seed/placeholder media. Uses a plain lazy-loaded <img> (not next/image)
 * so the dev media route needs no image-optimization configuration; responsive
 * sizing is handled by the container's aspect ratio and object-fit.
 *
 * Sample (stock) photos also come in a small copy (public/sample-photos/small,
 * made by scripts/make-sample-thumbs.mjs), offered through srcset so a phone
 * showing a 104px row thumbnail downloads that, not the 1000px original. The
 * `sizes` prop tells the browser how wide the image will be shown.
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
        srcSet={sampleSrcSet(media.url)}
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
