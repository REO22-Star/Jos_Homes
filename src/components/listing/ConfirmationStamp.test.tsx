import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildFreshness } from '@/lib/domain/freshness';
import { ConfirmationStamp } from './ConfirmationStamp';

const now = new Date('2026-07-18T12:00:00.000Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

describe('ConfirmationStamp', () => {
  it('shows the freshness label and the short confirmation date', () => {
    render(<ConfirmationStamp freshness={buildFreshness(daysAgo(0.1), now)} />);

    expect(screen.getByText('Confirmed today')).toBeInTheDocument();
    const date = screen.getByText('18 Jul');
    expect(date.tagName).toBe('TIME');
    expect(date).toHaveAttribute('title', '18 July 2026');
  });

  it('states an overdue confirmation in words, not colour alone', () => {
    render(<ConfirmationStamp freshness={buildFreshness(daysAgo(9), now)} />);

    expect(screen.getByText('Confirmation overdue')).toBeInTheDocument();
    expect(screen.getByText('9 Jul')).toBeInTheDocument();
  });
});

describe('ConfirmationStamp press', () => {
  it('plays the press only when asked, right after a reconfirm', () => {
    const freshness = buildFreshness(now, now);
    const { container, rerender } = render(<ConfirmationStamp freshness={freshness} />);
    expect(container.firstElementChild?.className).not.toMatch(/pressed/);

    rerender(<ConfirmationStamp freshness={freshness} pressed />);
    expect(container.firstElementChild?.className).toMatch(/pressed/);
    expect(screen.getByText('Confirmed today')).toBeInTheDocument();
  });
});
