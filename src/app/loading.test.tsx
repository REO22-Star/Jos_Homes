import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLoading from './loading';
import ListingLoading from './listing/[slug]/loading';
import DashboardLoading from './dashboard/loading';

describe('loading screens', () => {
  it.each([
    ['site', RootLoading, 'Loading…'],
    ['listing', ListingLoading, 'Loading listing…'],
    ['dashboard', DashboardLoading, 'Loading…'],
  ])('the %s placeholder announces loading and marks itself busy', (_name, Loading, text) => {
    const { container } = render(<Loading />);
    expect(screen.getByRole('status')).toHaveTextContent(text);
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
  });
});
