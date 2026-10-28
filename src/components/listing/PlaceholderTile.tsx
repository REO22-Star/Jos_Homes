import styles from './PlaceholderTile.module.css';

interface PlaceholderTileProps {
  hue: number;
  alt: string;
  /** aspect-ratio CSS value, e.g. "4 / 3". */
  ratio?: string;
  className?: string;
  eager?: boolean;
}

/**
 * A safe, generated placeholder standing in for property media in Milestone 0.
 * No real or copyrighted photos are used. Exposed to assistive tech as an image
 * with meaningful alt text, and clearly watermarked as a sample.
 */
export function PlaceholderTile({ hue, alt, ratio = '4 / 3', className }: PlaceholderTileProps) {
  const background = `linear-gradient(135deg, hsl(${hue} 42% 60%), hsl(${(hue + 45) % 360} 38% 42%))`;
  return (
    <div
      role="img"
      aria-label={alt}
      className={[styles.tile, className ?? ''].filter(Boolean).join(' ')}
      style={{ background, aspectRatio: ratio }}
    >
      <span className={styles.watermark} aria-hidden="true">
        Sample photo
      </span>
    </div>
  );
}
