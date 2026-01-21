import crypto from 'node:crypto';
import {
  FILE_SIZE_LIMITS,
  getAssetTypeFromMimeType,
  type MediaAssetMetadata,
  type MediaAssetType,
  SUPPORTED_FORMATS,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const THUMBNAIL_SIZE = 400;
const THUMBNAIL_QUALITY = 80;

// ============================================================================
// FILE VALIDATION
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  assetType?: MediaAssetType;
  error?: string;
}

/**
 * Validate a file for upload
 */
export function validateFile(
  filename: string,
  mimeType: string,
  size: number,
  targetType?: MediaAssetType,
): FileValidationResult {
  // Determine asset type
  const detectedType = getAssetTypeFromMimeType(mimeType);

  if (!detectedType) {
    // Try extension-based detection
    const ext = `.${filename.split('.').pop()?.toLowerCase()}`;
    for (const [type, formats] of Object.entries(SUPPORTED_FORMATS)) {
      if (formats.extensions.includes(ext)) {
        const assetType = type as MediaAssetType;
        const sizeLimit = FILE_SIZE_LIMITS[assetType];

        if (size > sizeLimit) {
          const maxMB = Math.round(sizeLimit / (1024 * 1024));
          return {
            valid: false,
            error: `File too large. Maximum size for ${assetType}: ${maxMB}MB`,
          };
        }

        return { valid: true, assetType };
      }
    }

    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  // If target type specified, verify match
  if (targetType && detectedType !== targetType) {
    return {
      valid: false,
      error: `File type mismatch. Expected ${targetType}, got ${detectedType}`,
    };
  }

  // Check size limit
  const sizeLimit = FILE_SIZE_LIMITS[detectedType];
  if (size > sizeLimit) {
    const maxMB = Math.round(sizeLimit / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum size for ${detectedType}: ${maxMB}MB`,
    };
  }

  return { valid: true, assetType: detectedType };
}

// ============================================================================
// FILENAME GENERATION
// ============================================================================

/**
 * Sanitize a filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  const ext = `.${filename.split('.').pop()?.toLowerCase()}` || '';
  let basename = filename.slice(0, filename.length - ext.length);

  // Remove or replace unsafe characters
  basename = basename
    .replace(/\s+/g, '_')
    .replace(/\.\./g, '')
    .replace(/\0/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!basename) {
    basename = 'file';
  }

  basename = basename.substring(0, 100);
  const safeExt = ext.replace(/[^a-z0-9.]/g, '');

  return `${basename}${safeExt}`;
}

/**
 * Generate a unique storage path for a file
 */
export function generateStoragePath(
  tenantId: string,
  assetType: MediaAssetType,
  originalFilename: string,
): string {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = sanitized.split('.').pop() || '';

  // Structure: tenant_id/asset_type/YYYY/MM/timestamp_random.ext
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${tenantId}/${assetType}/${year}/${month}/${timestamp}_${random}.${ext}`;
}

/**
 * Generate a thumbnail storage path
 */
export function generateThumbnailPath(originalPath: string): string {
  const parts = originalPath.split('/');
  const filename = parts.pop() || '';
  const nameWithoutExt = filename.split('.').slice(0, -1).join('.');

  return [...parts, 'thumbnails', `${nameWithoutExt}_thumb.webp`].join('/');
}

// ============================================================================
// IMAGE PROCESSING (Sharp-based)
// ============================================================================

/**
 * Process an image buffer and extract metadata
 * Note: Sharp must be installed: npm install sharp
 */
export async function processImage(buffer: Buffer): Promise<{
  metadata: MediaAssetMetadata;
  thumbnail: Buffer;
  blurhash?: string;
}> {
  // Dynamic import to avoid issues in edge runtime
  const sharp = (await import('sharp')).default;

  const image = sharp(buffer);
  const meta = await image.metadata();

  const metadata: MediaAssetMetadata = {
    width: meta.width,
    height: meta.height,
    aspectRatio: meta.width && meta.height ? meta.width / meta.height : undefined,
    colorSpace: meta.space,
    hasAlpha: meta.hasAlpha,
  };

  // Generate thumbnail
  const thumbnail = await image
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  // Generate blurhash
  let blurhash: string | undefined;
  try {
    const { encode } = await import('blurhash');
    const { data, info } = await image
      .resize(32, 32, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
  } catch {
    // Silently ignore - blurhash generation is optional
  }

  return { metadata, thumbnail, blurhash };
}

/**
 * Generate an image thumbnail
 */
export async function generateImageThumbnail(
  buffer: Buffer,
  maxSize: number = THUMBNAIL_SIZE,
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  return sharp(buffer)
    .resize(maxSize, maxSize, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();
}

// ============================================================================
// VIDEO PROCESSING
// ============================================================================

/**
 * Extract video metadata
 * Note: This requires ffprobe to be available on the system
 */
export async function extractVideoMetadata(): Promise<MediaAssetMetadata> {
  // For server-side video processing, we'd use ffprobe
  // This is a placeholder that returns minimal metadata
  // In production, integrate with a video processing service

  return {
    // Metadata would be extracted from ffprobe output
    duration: undefined,
    videoWidth: undefined,
    videoHeight: undefined,
    frameRate: undefined,
    codec: undefined,
    hasAudio: undefined,
  };
}

/**
 * Generate video thumbnail at specific timestamp
 * Note: This requires ffmpeg to be available on the system
 */
export async function generateVideoThumbnail(): Promise<Buffer | null> {
  // In production, this would use ffmpeg to extract a frame
  // For now, return null to indicate video thumbnails need async processing
  return null;
}

// ============================================================================
// AUDIO PROCESSING
// ============================================================================

/**
 * Extract audio metadata
 */
export async function extractAudioMetadata(): Promise<MediaAssetMetadata> {
  // For server-side audio processing, we'd use ffprobe
  // This is a placeholder that returns minimal metadata

  return {
    duration: undefined,
    sampleRate: undefined,
    channels: undefined,
    bitrate: undefined,
  };
}

/**
 * Generate audio waveform visualization
 * Returns a PNG buffer of the waveform
 */
export async function generateAudioWaveform(): Promise<Buffer | null> {
  // In production, this would use a waveform generation library
  // For now, return null to indicate waveforms need async processing
  return null;
}

// ============================================================================
// DOCUMENT PROCESSING
// ============================================================================

/**
 * Extract document metadata
 */
export async function extractDocumentMetadata(
  buffer: Buffer,
  mimeType: string,
): Promise<MediaAssetMetadata> {
  const metadata: MediaAssetMetadata = {};

  if (mimeType === 'application/pdf') {
    try {
      // Dynamic import for PDF parsing - handle both ESM and CommonJS exports
      const pdfParseModule = await import('pdf-parse');
      type PDFParseFunction = (buffer: Buffer) => Promise<{
        numpages: number;
        info?: { Title?: string; Author?: string };
      }>;
      const pdfParse: PDFParseFunction =
        'default' in pdfParseModule
          ? (pdfParseModule.default as unknown as PDFParseFunction)
          : (pdfParseModule as unknown as PDFParseFunction);
      const data = await pdfParse(buffer);

      metadata.pageCount = data.numpages;
      metadata.title = data.info?.Title;
      metadata.author = data.info?.Author;
    } catch {
      // Silently ignore - PDF parsing is optional
    }
  }

  return metadata;
}

/**
 * Generate document preview (first page as image)
 */
export async function generateDocumentPreview(): Promise<Buffer | null> {
  // In production, this would use a PDF rendering library
  // For now, return null to indicate document previews need async processing
  return null;
}

// ============================================================================
// 3D MODEL PROCESSING
// ============================================================================

/**
 * Extract 3D model metadata
 */
export async function extract3DModelMetadata(
  buffer: Buffer,
  mimeType: string,
): Promise<MediaAssetMetadata> {
  const metadata: MediaAssetMetadata = {};

  if (mimeType === 'model/gltf-binary' || mimeType === 'application/octet-stream') {
    try {
      // Basic GLB parsing - read header
      const magic = buffer.toString('utf8', 0, 4);
      if (magic === 'glTF') {
        // It's a valid GLB file
        // Full parsing would require a proper glTF library
        metadata.triangleCount = undefined;
        metadata.textureCount = undefined;
        metadata.animationCount = undefined;
      }
    } catch {
      // Silently ignore - GLB parsing is optional
    }
  }

  return metadata;
}

// ============================================================================
// AI CHARACTER PROCESSING
// ============================================================================

/**
 * Extract AI Character metadata
 */
export async function extractAICharacterMetadata(
  buffer: Buffer,
  mimeType: string,
): Promise<MediaAssetMetadata> {
  const metadata: MediaAssetMetadata = {};

  if (mimeType === 'application/json') {
    try {
      const json = JSON.parse(buffer.toString('utf8'));
      // Ready Player Me format detection
      if (json.outfitVersion || json.avatarId) {
        metadata.characterType = 'ready_player_me';
      }
    } catch {
      // JSON parsing is optional
    }
  } else if (mimeType === 'application/octet-stream') {
    // VRM format - would need proper VRM parsing
    const header = buffer.toString('utf8', 0, 4);
    if (header === 'glTF') {
      metadata.characterType = 'vrm';
      metadata.rigged = true;
    }
  }

  return metadata;
}

// ============================================================================
// UNIFIED PROCESSING
// ============================================================================

/**
 * Process media based on type and extract metadata
 */
export async function processMedia(
  buffer: Buffer,
  mimeType: string,
  assetType: MediaAssetType,
): Promise<{
  metadata: MediaAssetMetadata;
  thumbnail?: Buffer;
  blurhash?: string;
}> {
  switch (assetType) {
    case 'image':
    case 'icon':
      return processImage(buffer);

    case 'video':
      return {
        metadata: {}, // Video metadata requires async processing
        thumbnail: undefined,
      };

    case 'audio':
      return {
        metadata: {}, // Audio metadata requires async processing
        thumbnail: undefined,
      };

    case 'document':
      return {
        metadata: await extractDocumentMetadata(buffer, mimeType),
        thumbnail: undefined,
      };

    case '3d_model':
      return {
        metadata: await extract3DModelMetadata(buffer, mimeType),
        thumbnail: undefined,
      };

    case 'ai_character':
      return {
        metadata: await extractAICharacterMetadata(buffer, mimeType),
        thumbnail: undefined,
      };

    default:
      return {
        metadata: {},
        thumbnail: undefined,
      };
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export interface AssetUsageLocation {
  type: 'course' | 'lesson' | 'project' | 'template' | 'block';
  id: string;
  name: string;
}

/**
 * Find where an asset is being used
 * This is a placeholder - actual implementation would query related tables
 */
export async function findAssetUsage(): Promise<AssetUsageLocation[]> {
  // In production, this would query:
  // - courses for thumbnail/media references
  // - lessons for embedded media
  // - projects for content blocks
  // - templates for media references

  return [];
}
