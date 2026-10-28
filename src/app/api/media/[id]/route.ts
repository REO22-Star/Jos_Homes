import { getPublicBlob } from '@/lib/media/storage';

/**
 * Serves an uploaded image from the PUBLIC blob namespace only. Private
 * evidence lives in a separate namespace this route never reads, so it cannot
 * be fetched through a public media URL or a guessed path (acceptance H4).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stored = getPublicBlob(id);
  if (!stored) return new Response('Not found', { status: 404 });

  // The runtime Response accepts a Uint8Array body; the cast satisfies the DOM
  // BodyInit typing under TS's strict ArrayBufferLike generic.
  return new Response(stored.bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': stored.mimeType,
      'Content-Length': String(stored.bytes.byteLength),
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
