import { isConfigured } from "@/env";

/**
 * Media upload seam. Large files upload DIRECTLY from the browser to storage
 * via a presigned URL, so they never pass through the serverless function.
 *
 * Images  -> Cloudflare R2 (S3-compatible, zero egress) presigned PUT.
 * Video   -> Cloudflare Stream direct-creator-upload URL (auto HLS + poster).
 *
 * Phase 0 ships the interface; the R2/Stream calls below are filled in once
 * keys are provisioned (install @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner).
 */

export interface PresignedUpload {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
}

export async function presignImageUpload(_filename: string, _contentType: string): Promise<PresignedUpload> {
  if (!isConfigured.r2) {
    throw new Error("R2 storage not configured — set R2_* env vars to enable media uploads.");
  }
  // TODO(phase-1): use S3Client({ endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` })
  // + getSignedUrl(new PutObjectCommand({...})). Then an Inngest job runs `sharp`
  // to make AVIF/WebP variants + a ~20px LQIP blur and marks ListingMedia READY.
  throw new Error("presignImageUpload not yet implemented for this environment.");
}

/** Basic allowlist used by both client and server before requesting a presign. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_PHOTOS_PER_LISTING = 12;
