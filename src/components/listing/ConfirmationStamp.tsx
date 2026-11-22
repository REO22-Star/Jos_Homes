import { formatLongDate, formatShortDate } from '@/lib/domain/format';
import type { Freshness } from '@/lib/domain/types';
import styles from './ConfirmationStamp.module.css';

/**
 * The date availability was last confirmed, inked like an office date stamp.
 * This is the one emphatic element on a listing row: freshness is what
 * JosHomes promises. Overdue confirmations switch to a dashed laterite stamp,
 * and the label text always states the status, so colour is never the only cue.
 */
export function ConfirmationStamp({
  freshness,
  pressed = false,
}: {
  freshness: Freshness;
  /** Play the stamp-press once, right after the lister reconfirms. */
  pressed?: boolean;
}) {
  const overdue = freshness.status === 'overdue' || freshness.status === 'suppressed';
  const className = [styles.stamp, overdue ? styles.overdue : '', pressed ? styles.pressed : '']
    .filter(Boolean)
    .join(' ');
  return (
    <p className={className}>
      <span className={styles.label}>{freshness.label}</span>
      <time
        className={styles.date}
        dateTime={freshness.lastConfirmedAtISO}
        title={formatLongDate(freshness.lastConfirmedAtISO)}
      >
        {formatShortDate(freshness.lastConfirmedAtISO)}
      </time>
    </p>
  );
}
