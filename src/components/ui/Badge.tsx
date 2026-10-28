import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'positive' | 'neutral' | 'caution' | 'closed' | 'sponsored' | 'brand';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  /** Render a small leading dot. Never rely on color alone — text is always present. */
  dot?: boolean;
  className?: string;
}

export function Badge({ tone = 'neutral', children, dot, className }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className ?? ''].filter(Boolean).join(' ')}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
