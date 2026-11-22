import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PublicMedia } from '@/lib/domain/types';
import { Gallery } from './Gallery';

const placeholder: PublicMedia = {
  id: 'm1',
  kind: 'image',
  placeholderHue: 140,
  alt: 'Sitting room',
};

describe('Gallery', () => {
  it('shows a labelled layout sketch, never a fake photo, when nothing is uploaded', () => {
    const { container } = render(<Gallery media={[placeholder]} propertyType="mini_flat" />);

    expect(screen.getByText(/typical layout for a mini flat, not this property/)).toBeVisible();
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('[role="img"]')).toBeNull();
  });

  it('shows only uploaded photos when there are some', () => {
    const photo: PublicMedia = { ...placeholder, id: 'm2', url: '/api/media/m2', alt: 'Kitchen' };
    render(<Gallery media={[placeholder, photo]} propertyType="mini_flat" />);

    expect(screen.getByRole('img', { name: 'Kitchen' })).toHaveAttribute('src', '/api/media/m2');
    expect(screen.queryByText(/not this property/)).toBeNull();
  });

  it('loads the main photo eagerly at high priority and keeps thumbnails lazy', () => {
    const a: PublicMedia = { ...placeholder, id: 'a', url: '/api/media/a', alt: 'Kitchen' };
    const b: PublicMedia = { ...placeholder, id: 'b', url: '/api/media/b', alt: 'Bedroom' };
    const { container } = render(<Gallery media={[a, b]} propertyType="mini_flat" />);

    const main = screen.getByRole('img', { name: 'Kitchen' });
    expect(main).toHaveAttribute('loading', 'eager');
    expect(main).toHaveAttribute('fetchpriority', 'high');

    const thumbs = container.querySelectorAll('ul img');
    expect(thumbs).toHaveLength(2);
    thumbs.forEach((t) => {
      expect(t).toHaveAttribute('loading', 'lazy');
      expect(t).not.toHaveAttribute('fetchpriority');
    });
  });

  it('labels a sample stock photo and says it is not this property', () => {
    const sample: PublicMedia = {
      ...placeholder,
      id: 'm3',
      url: '/sample-photos/studio-room.jpg',
      isSample: true,
    };
    render(<Gallery media={[sample]} propertyType="self_contained" />);

    expect(screen.getByRole('img', { name: 'Sitting room (sample photo)' })).toBeVisible();
    expect(screen.getByText('Sample photo')).toBeVisible();
    expect(screen.getByText(/stock image standing in/)).toBeVisible();
  });
});
