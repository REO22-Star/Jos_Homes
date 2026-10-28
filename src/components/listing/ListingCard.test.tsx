import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { memoryListingRepository } from '@/lib/data/memory-repository';
import type { PublicListing } from '@/lib/domain/types';
import { ListingCard } from './ListingCard';

const now = new Date('2026-07-18T12:00:00.000Z');

let rayfield: PublicListing;
let sponsored: PublicListing;

beforeAll(async () => {
  rayfield = (await memoryListingRepository.getBySlug('bright-2-bedroom-rayfield', now))!;
  sponsored = (await memoryListingRepository.getBySlug('furnished-mini-flat-tudun-wada', now))!;
});

describe('ListingCard', () => {
  it('renders title, rent, area, availability and freshness', () => {
    render(<ListingCard listing={rayfield} />);

    expect(screen.getByRole('link', { name: /Bright 2 bedroom flat/ })).toBeInTheDocument();
    expect(screen.getByText(/NGN 850,000/)).toBeInTheDocument();
    expect(screen.getByText(/Near Rayfield Resort/)).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Confirmed today')).toBeInTheDocument();
  });

  it('shows the sponsored label when a listing is sponsored', () => {
    render(<ListingCard listing={sponsored} />);
    expect(screen.getByText('Sponsored listing')).toBeInTheDocument();
  });

  it('never renders a private address', () => {
    const { container } = render(<ListingCard listing={rayfield} />);
    expect(container.textContent).not.toContain('Fictional Close');
  });
});
