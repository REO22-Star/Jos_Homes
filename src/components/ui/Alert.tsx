import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertTone = 'info' | 'caution' | 'positive';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  /** icon glyph is decorative; the tone is always conveyed by text too */
  className?: string;
}

const ICON: Record<AlertTone, string> = {
  info: 'ⓘ',
  caution: '⚠',
  positive: '✓',
};

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[tone], className ?? ''].filter(Boolean).join(' ')}
      role="note"
    >
      <span className={styles.icon} aria-hidden="true">
        {ICON[tone]}
      </span>
      <div>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
