import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PublicMedia } from '@/lib/domain/types';
import { MediaImage, sampleSrcSet } from './MediaImage';

const base: PublicMedia = { id: 'm1', kind: 'image', placeholderHue: 140, alt: 'Kitchen' };

describe('sampleSrcSet', () => {
  it('offers the small copy and the original for a sample photo', () => {
    expect(sampleSrcSet('/sample-photos/studio-room.jpg')).toBe(
      '/sample-photos/small/studio-room.jpg 400w, /sample-photos/studio-room.jpg 1000w',
    );
  });

  it('offers nothing for uploaded photos, which have no small copy', () => {
    expect(sampleSrcSet('/api/media/abc')).toBeUndefined();
    expect(sampleSrcSet('/sample-photos/small/studio-room.jpg')).toBeUndefined();
  });

  it('has a small copy for every sample photo (run scripts/make-sample-thumbs.mjs)', () => {
    const dir = path.join(process.cwd(), 'public', 'sample-photos');
    const originals = readdirSync(dir).filter((f) => f.endsWith('.jpg'));
    const small = new Set(readdirSync(path.join(dir, 'small')));
    expect(originals.length).toBeGreaterThan(0);
    expect(originals.filter((f) => !small.has(f))).toEqual([]);
  });
});

describe('MediaImage', () => {
  it('lets the browser choose the small copy of a sample photo for a small slot', () => {
    const media = { ...base, url: '/sample-photos/studio-room.jpg', isSample: true };
    render(<MediaImage media={media} sizes="104px" />);

    const img = screen.getByRole('img', { name: 'Kitchen (sample photo)' });
    expect(img).toHaveAttribute('srcset', sampleSrcSet('/sample-photos/studio-room.jpg'));
    expect(img).toHaveAttribute('sizes', '104px');
    expect(img).toHaveAttribute('src', '/sample-photos/studio-room.jpg');
  });

  it('keeps a single source for uploaded photos', () => {
    render(<MediaImage media={{ ...base, url: '/api/media/m1' }} />);
    expect(screen.getByRole('img', { name: 'Kitchen' })).not.toHaveAttribute('srcset');
  });
});
