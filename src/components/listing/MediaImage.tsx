import type { PublicMedia } from '@/lib/domain/types';
import { PlaceholderTile } from './PlaceholderTile';

/**
 * Renders an approved uploaded image, falling back to a safe placeholder tile
 * for seed/placeholder media. Uses a plain lazy-loaded <img> (not next/image)
 * so the dev media route needs no image-optimization configuration; responsive
 * sizing is handled by the container's aspect ratio and object-fit.
 */
export function MediaImage({
  media,
  ratio = '4 / 3',
  className,
  sizes,
}: {
  media: PublicMedia;
  ratio?: string;
  className?: string;
  sizes?: string;
}) {
  if (media.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.url}
        alt={media.alt}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        className={className}
        style={{ width: '100%', aspectRatio: ratio, objectFit: 'cover', display: 'block' }}
      />
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
