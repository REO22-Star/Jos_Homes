import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li';
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return <Tag className={[styles.card, className ?? ''].filter(Boolean).join(' ')}>{children}</Tag>;
}
