import { describe, expect, it } from 'vitest';
import { hasEnoughImages, validateImageUpload } from './media';

const ok = { fileName: 'room.jpg', mimeType: 'image/jpeg', sizeBytes: 200_000 };

describe('validateImageUpload (H1)', () => {
  it('accepts a valid image within limits', () => {
    expect(validateImageUpload(ok, 0)).toBeNull();
  });

  it('rejects unsupported types', () => {
    expect(validateImageUpload({ ...ok, fileName: 'x.txt', mimeType: 'text/plain' }, 0)).toMatch(
      /not supported/i,
    );
  });

  it('rejects a mismatched extension (renamed file)', () => {
    expect(validateImageUpload({ ...ok, fileName: 'evil.png', mimeType: 'image/jpeg' }, 0)).toMatch(
      /does not match/i,
    );
  });

  it('rejects empty and oversized files', () => {
    expect(validateImageUpload({ ...ok, sizeBytes: 0 }, 0)).toMatch(/empty/i);
    expect(validateImageUpload({ ...ok, sizeBytes: 6 * 1024 * 1024 }, 0)).toMatch(/larger than/i);
  });

  it('rejects uploads beyond the per-listing cap', () => {
    expect(validateImageUpload(ok, 12)).toMatch(/at most 12/i);
  });
});

describe('hasEnoughImages (OQ-004)', () => {
  it('requires at least three images by default', () => {
    expect(hasEnoughImages(2)).toBe(false);
    expect(hasEnoughImages(3)).toBe(true);
  });
});
