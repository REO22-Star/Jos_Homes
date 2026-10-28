import { afterEach, describe, expect, it } from 'vitest';
import { __resetMediaStore, getBlob, getPublicBlob, putBlob } from './storage';

afterEach(() => __resetMediaStore());

describe('media storage namespaces (H4)', () => {
  it('never serves private (evidence) blobs through the public accessor', () => {
    putBlob('private', 'evidence-1', new Uint8Array([1, 2, 3]), 'image/jpeg');
    // The public serve route uses getPublicBlob — evidence must be unreachable.
    expect(getPublicBlob('evidence-1')).toBeUndefined();
    // It is still retrievable through the explicit private namespace (staff code).
    expect(getBlob('private', 'evidence-1')).toBeDefined();
  });

  it('serves public blobs through the public accessor', () => {
    putBlob('public', 'photo-1', new Uint8Array([9]), 'image/png');
    expect(getPublicBlob('photo-1')?.mimeType).toBe('image/png');
  });
});
