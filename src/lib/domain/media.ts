import { DEFAULT_MEDIA_CONFIG, type MediaConfig } from './config';

/**
 * Pure, server-side media validation. Kept free of storage/framework concerns so
 * it is unit-testable and identical across backends (acceptance H1).
 */

export interface UploadCandidate {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/**
 * Validate a single image upload. Returns an actionable message, or null when
 * the file is acceptable. Rejects unsupported types, a type/extension mismatch,
 * empty or oversized files, and uploads that would exceed the per-listing cap.
 */
export function validateImageUpload(
  candidate: UploadCandidate,
  existingCount: number,
  config: MediaConfig = DEFAULT_MEDIA_CONFIG,
): string | null {
  if (existingCount >= config.maxImagesPerListing) {
    return `You can attach at most ${config.maxImagesPerListing} images to a listing.`;
  }

  if (!config.allowedImageMimeTypes.includes(candidate.mimeType)) {
    return 'This file type is not supported. Upload a JPEG, PNG, or WebP image.';
  }

  // Guard against a mismatched extension (e.g. a script renamed to .png).
  const extMime = EXTENSION_MIME[extensionOf(candidate.fileName)];
  if (extMime && extMime !== candidate.mimeType) {
    return 'The file extension does not match its contents. Upload a genuine image file.';
  }

  if (candidate.sizeBytes <= 0) {
    return 'This file appears to be empty.';
  }
  if (candidate.sizeBytes > config.maxImageBytes) {
    const mb = Math.round(config.maxImageBytes / (1024 * 1024));
    return `This image is larger than the ${mb} MB limit.`;
  }

  return null;
}

/** Whether a listing has enough images to be submitted for review (OQ-004). */
export function hasEnoughImages(
  imageCount: number,
  config: MediaConfig = DEFAULT_MEDIA_CONFIG,
): boolean {
  return imageCount >= config.minImagesForSubmission;
}
