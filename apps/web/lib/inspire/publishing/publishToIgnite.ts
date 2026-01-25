/**
 * INSPIRE Studio - Publishing Bridge to Ignite LMS
 *
 * Handles validation, flattening, versioning, and dual-write publishing
 * of courses from Studio to the Ignite LMS.
 *
 * @module lib/inspire/publishing/publishToIgnite
 */

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { z } from 'zod';
import { requireDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';

const log = logger.scope('PublishToIgnite');

// =============================================================================
// Types
// =============================================================================

export interface CourseManifest {
  id: string;
  version: string;
  title: string;
  description?: string;
  tenantId: string;
  authorId: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  visibility: 'private' | 'tenant' | 'public';
  theme?: Record<string, unknown>;
  blocks: CourseBlock[];
  metadata: CourseMetadata;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp;
  publishedVersion?: string;
}

export interface CourseBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
  children?: CourseBlock[];
}

export interface CourseMetadata {
  estimatedDuration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  objectives?: string[];
  prerequisites?: string[];
  category?: string;
  language?: string;
  accessibilityFeatures?: string[];
}

export interface PublishResult {
  success: boolean;
  courseId: string;
  version: string;
  publishedAt: Date;
  error?: string;
}

export interface PublishOptions {
  /** Force publish even with warnings */
  force?: boolean;
  /** Custom version string (auto-increment if not provided) */
  version?: string;
  /** Whether to trigger LMS catalog refresh */
  refreshCatalog?: boolean;
}

// =============================================================================
// Validation Schemas
// =============================================================================

const CourseBlockSchema: z.ZodType<CourseBlock> = z.lazy(() =>
  z.object({
    id: z.string().min(1, 'Block ID required'),
    type: z.string().min(1, 'Block type required'),
    data: z.record(z.unknown()),
    children: z.array(CourseBlockSchema).optional(),
  }),
);

const CourseMetadataSchema = z.object({
  estimatedDuration: z.number().positive().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
});

const CourseManifestSchema = z.object({
  id: z.string().min(1, 'Course ID required'),
  version: z.string().regex(/^\d+\.\d+$/, 'Version must be in format X.Y'),
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  description: z.string().max(2000).optional(),
  tenantId: z.string().min(1, 'Tenant ID required'),
  authorId: z.string().min(1, 'Author ID required'),
  status: z.enum(['draft', 'review', 'published', 'archived']),
  visibility: z.enum(['private', 'tenant', 'public']),
  theme: z.record(z.unknown()).optional(),
  blocks: z.array(CourseBlockSchema).min(1, 'At least one block required'),
  metadata: CourseMetadataSchema,
});

// =============================================================================
// Version Utilities
// =============================================================================

/**
 * Parse version string to major.minor numbers
 */
function parseVersion(version: string): { major: number; minor: number } {
  const [major, minor] = version.split('.').map(Number);
  return { major: major ?? 1, minor: minor ?? 0 };
}

/**
 * Increment version (v1.0 -> v1.1, v1.9 -> v2.0)
 */
function incrementVersion(currentVersion: string): string {
  const { major, minor } = parseVersion(currentVersion);
  if (minor >= 9) {
    return `${major + 1}.0`;
  }
  return `${major}.${minor + 1}`;
}

// =============================================================================
// Flattening Utilities
// =============================================================================

/**
 * Editor-specific fields to remove during publish
 */
const EDITOR_FIELDS = [
  'isSelected',
  'isHovered',
  'isDragging',
  'history',
  'undoStack',
  'redoStack',
  '_temp',
  '__internal',
  'editorState',
] as const;

/**
 * Remove editor-specific state from blocks (recursive)
 */
function flattenBlock(block: CourseBlock): CourseBlock {
  const cleanData = { ...block.data };

  // Remove editor-specific fields
  for (const field of EDITOR_FIELDS) {
    delete cleanData[field];
  }

  return {
    id: block.id,
    type: block.type,
    data: cleanData,
    children: block.children?.map(flattenBlock),
  };
}

/**
 * Flatten manifest by removing editor-specific states
 */
function flattenManifest(manifest: CourseManifest): CourseManifest {
  return {
    ...manifest,
    blocks: manifest.blocks.map(flattenBlock),
  };
}

// =============================================================================
// Validation
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
}

/**
 * Validate course manifest before publishing
 */
export function validateManifest(manifest: CourseManifest): ValidationResult {
  const errors: Array<{ path: string; message: string }> = [];
  const warnings: Array<{ path: string; message: string }> = [];

  // Zod validation
  const zodResult = CourseManifestSchema.safeParse(manifest);
  if (!zodResult.success) {
    for (const issue of zodResult.error.issues) {
      errors.push({
        path: issue.path.join('.'),
        message: issue.message,
      });
    }
  }

  // Additional business logic checks
  if (!manifest.metadata.estimatedDuration) {
    warnings.push({
      path: 'metadata.estimatedDuration',
      message: 'Estimated duration not set',
    });
  }

  if (!manifest.metadata.objectives?.length) {
    warnings.push({
      path: 'metadata.objectives',
      message: 'No learning objectives defined',
    });
  }

  if (!manifest.description) {
    warnings.push({
      path: 'description',
      message: 'Course description is empty',
    });
  }

  // Check for empty blocks
  const emptyBlocks = manifest.blocks.filter((block) => Object.keys(block.data).length === 0);
  if (emptyBlocks.length > 0) {
    warnings.push({
      path: 'blocks',
      message: `${emptyBlocks.length} block(s) have no content`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// Publishing
// =============================================================================

/**
 * Publish a course from INSPIRE Studio to Ignite LMS
 *
 * This performs:
 * 1. Validation with Zod
 * 2. Flattening (remove editor states)
 * 3. Auto-version increment
 * 4. Dual-write to Firestore
 * 5. Trigger catalog refresh
 */
export async function publishToIgnite(
  manifest: CourseManifest,
  options: PublishOptions = {},
): Promise<PublishResult> {
  const { force = false, version: customVersion, refreshCatalog = true } = options;

  try {
    // Step 1: Validate
    const validation = validateManifest(manifest);

    if (!validation.valid) {
      return {
        success: false,
        courseId: manifest.id,
        version: manifest.version,
        publishedAt: new Date(),
        error: `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
      };
    }

    if (validation.warnings.length > 0 && !force) {
      return {
        success: false,
        courseId: manifest.id,
        version: manifest.version,
        publishedAt: new Date(),
        error: `Validation warnings (use force to override): ${validation.warnings.map((w) => w.message).join(', ')}`,
      };
    }

    // Step 2: Get current published version
    const courseRef = doc(requireDb(), 'tenants', manifest.tenantId, 'courses', manifest.id);
    const courseSnap = await getDoc(courseRef);
    const currentVersion = courseSnap.exists()
      ? ((courseSnap.data()?.publishedVersion as string | undefined) ?? '1.0')
      : '1.0';

    // Step 3: Calculate new version
    const newVersion = customVersion ?? incrementVersion(currentVersion);

    // Step 4: Flatten manifest
    const flattenedManifest = flattenManifest({
      ...manifest,
      version: newVersion,
      status: 'published',
    });

    // Step 5: Dual-write to Firestore
    const publishedData = {
      ...flattenedManifest,
      publishedAt: serverTimestamp(),
      publishedVersion: newVersion,
      updatedAt: serverTimestamp(),
    };

    await setDoc(courseRef, publishedData, { merge: true });

    // Step 6: Create version snapshot
    const versionRef = doc(
      requireDb(),
      'tenants',
      manifest.tenantId,
      'courses',
      manifest.id,
      'versions',
      newVersion,
    );
    await setDoc(versionRef, {
      ...flattenedManifest,
      snapshotAt: serverTimestamp(),
    });

    // Step 7: Trigger catalog refresh (via API)
    if (refreshCatalog) {
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paths: ['/ignite/learn/catalog', `/ignite/learn/course/${manifest.id}`],
          }),
        });
      } catch {
        // Non-fatal: catalog will refresh eventually
        log.warn('Failed to trigger catalog refresh');
      }
    }

    return {
      success: true,
      courseId: manifest.id,
      version: newVersion,
      publishedAt: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      courseId: manifest.id,
      version: manifest.version,
      publishedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown publishing error',
    };
  }
}

/**
 * Unpublish a course (set status back to draft)
 */
export async function unpublishCourse(
  tenantId: string,
  courseId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const courseRef = doc(requireDb(), 'tenants', tenantId, 'courses', courseId);
    await updateDoc(courseRef, {
      status: 'draft',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unpublish',
    };
  }
}

/**
 * Get course publish history
 */
export async function getPublishHistory(
  _tenantId: string,
  _courseId: string,
): Promise<Array<{ version: string; publishedAt: Date }>> {
  // This would query the versions subcollection
  // Simplified for now
  return [];
}

export default publishToIgnite;
