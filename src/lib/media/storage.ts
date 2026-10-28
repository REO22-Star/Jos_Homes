/**
 * Media storage abstraction (Milestone 3).
 *
 * Two separate namespaces:
 *  - `public`  — approved-eligible listing media, servable through /api/media.
 *  - `private` — verification evidence and the like. It is NEVER served by the
 *    public media route, so evidence cannot be fetched via a public media URL or
 *    a guessed path (acceptance H4).
 *
 * The development backend keeps bytes in memory on `globalThis` (same
 * cross-request reason as the auth and authoring stores). In a configured
 * environment these operations map to Supabase Storage buckets with matching
 * public/private policies; that wiring lands with the live-DB work (D-025).
 */

export type MediaNamespace = 'public' | 'private';

export interface StoredBlob {
  bytes: Uint8Array;
  mimeType: string;
}

interface MediaStore {
  public: Map<string, StoredBlob>;
  private: Map<string, StoredBlob>;
}

const globalRef = globalThis as unknown as { __joshomesMediaStore?: MediaStore };

function store(): MediaStore {
  return (globalRef.__joshomesMediaStore ??= { public: new Map(), private: new Map() });
}

export function putBlob(
  namespace: MediaNamespace,
  objectId: string,
  bytes: Uint8Array,
  mimeType: string,
): void {
  store()[namespace].set(objectId, { bytes, mimeType });
}

/** Read a blob from the PUBLIC namespace only. Used by the public serve route. */
export function getPublicBlob(objectId: string): StoredBlob | undefined {
  return store().public.get(objectId);
}

export function getBlob(namespace: MediaNamespace, objectId: string): StoredBlob | undefined {
  return store()[namespace].get(objectId);
}

export function deleteBlob(namespace: MediaNamespace, objectId: string): void {
  store()[namespace].delete(objectId);
}

/** Public URL for an object stored in the public namespace. */
export function mediaObjectUrl(objectId: string): string {
  return `/api/media/${objectId}`;
}

/** Test helper. */
export function __resetMediaStore(): void {
  store().public.clear();
  store().private.clear();
}
