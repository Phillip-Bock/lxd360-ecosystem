/**
 * INSPIRE Studio - Asset Command Center
 *
 * Centralized media management for INSPIRE Studio content authoring.
 * Includes upload, organization, AI tagging, and library browsing.
 *
 * @module components/inspire-studio/assets
 */

// =============================================================================
// Components
// =============================================================================

export { AIAutoTagger, default as AIAutoTaggerComponent, useAIAutoTagger } from './ai-auto-tagger';
export { AssetGrid, default as AssetGridComponent } from './asset-grid';
export { AssetLibraryModal, default as AssetLibraryModalComponent } from './asset-library-modal';
export { AssetMetadataPanel, default as AssetMetadataPanelComponent } from './asset-metadata-panel';
export { AssetUploader, default as AssetUploaderComponent } from './asset-uploader';

// =============================================================================
// Re-export Types from lib/assets
// =============================================================================

export type {
  AllowedMimeType,
  AssetCategory,
} from '@/lib/assets/mimeTypes';
export type {
  AssetMetadata,
  UploadProgress,
  UploadResult,
} from '@/lib/assets/storage';

// =============================================================================
// Re-export Utilities from lib/assets
// =============================================================================

export {
  type OptimizationOptions,
  type OptimizationResult,
  optimizeImage,
} from '@/lib/assets/imageOptimizer';

export {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  FILE_SIZE_LIMITS,
  formatFileSize,
  getAssetCategory,
  getSizeLimit,
  isAllowedMimeType,
  isAudioMimeType,
  isImageMimeType,
  isVideoMimeType,
  isWithinSizeLimit,
} from '@/lib/assets/mimeTypes';
export {
  deleteAsset,
  updateAssetMetadata,
  uploadAsset,
} from '@/lib/assets/storage';
