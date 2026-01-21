'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'actions-blocks' });

// ============================================================================
// Types
// ============================================================================

export interface BlockData {
  lessonId: string;
  blockType: string;
  blockCategory: string;
  content: Record<string, unknown>;
  orderIndex: number;
  cognitiveLoadWeight?: number;
  estimatedTimeSeconds?: number;
}

export type BlockStatus = 'incomplete' | 'in_progress' | 'complete' | 'qa_approved';

interface BlockDocument {
  id: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  blockType: string;
  blockCategory: string;
  content: Record<string, unknown>;
  orderIndex: number;
  cognitiveLoadWeight: number;
  estimatedTimeSeconds: number;
  status: BlockStatus;
  createdAt: FirebaseFirestore.Timestamp | FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FieldValue;
}

interface BlockLibraryItem {
  id: string;
  name: string;
  description: string;
  blockType: string;
  blockCategory: string;
  defaultContent: Record<string, unknown>;
  previewImageUrl?: string;
  cognitiveLoadWeight: number;
  estimatedTimeSeconds: number;
}

type ActionResult<T = unknown> = { error: string } | { data: T };

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthenticatedUser(): Promise<{ uid: string; tenantId: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      log.warn('No session cookie found');
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const tenantId = decodedToken.tenantId as string | undefined;

    if (!tenantId) {
      log.warn('User has no tenantId in token', { uid: decodedToken.uid });
      return null;
    }

    return { uid: decodedToken.uid, tenantId };
  } catch (error) {
    log.error('Failed to verify session', { error });
    return null;
  }
}

// ============================================================================
// Context Helper - Get lesson path info
// ============================================================================

interface LessonContext {
  tenantId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
}

async function getLessonContext(lessonId: string, tenantId: string): Promise<LessonContext | null> {
  // Search for the lesson in the tenant's courses
  // This is a nested structure: tenants/{tenantId}/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}

  const coursesSnapshot = await adminDb
    .collection('tenants')
    .doc(tenantId)
    .collection('courses')
    .get();

  for (const courseDoc of coursesSnapshot.docs) {
    const modulesSnapshot = await courseDoc.ref.collection('modules').get();

    for (const moduleDoc of modulesSnapshot.docs) {
      const lessonDoc = await moduleDoc.ref.collection('lessons').doc(lessonId).get();

      if (lessonDoc.exists) {
        return {
          tenantId,
          courseId: courseDoc.id,
          moduleId: moduleDoc.id,
          lessonId,
        };
      }
    }
  }

  return null;
}

// ============================================================================
// Block Actions
// ============================================================================

/**
 * Create a new content block within a lesson
 */
export async function createBlock(
  data: BlockData,
  context?: { courseId: string; moduleId: string; tenantId?: string },
): Promise<ActionResult<BlockDocument>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = context?.tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    let lessonContext: LessonContext | null = null;

    if (context?.courseId && context?.moduleId) {
      lessonContext = {
        tenantId: effectiveTenantId,
        courseId: context.courseId,
        moduleId: context.moduleId,
        lessonId: data.lessonId,
      };
    } else {
      // Search for the lesson context
      lessonContext = await getLessonContext(data.lessonId, effectiveTenantId);
    }

    if (!lessonContext) {
      return { error: 'Lesson not found' };
    }

    // Get the lesson reference
    const lessonRef = adminDb
      .collection('tenants')
      .doc(lessonContext.tenantId)
      .collection('courses')
      .doc(lessonContext.courseId)
      .collection('modules')
      .doc(lessonContext.moduleId)
      .collection('lessons')
      .doc(lessonContext.lessonId);

    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) {
      return { error: 'Lesson not found' };
    }

    // Create the block
    const blockRef = lessonRef.collection('blocks').doc();

    const blockDoc: BlockDocument = {
      id: blockRef.id,
      lessonId: lessonContext.lessonId,
      courseId: lessonContext.courseId,
      moduleId: lessonContext.moduleId,
      blockType: data.blockType,
      blockCategory: data.blockCategory,
      content: data.content,
      orderIndex: data.orderIndex,
      cognitiveLoadWeight: data.cognitiveLoadWeight ?? 1,
      estimatedTimeSeconds: data.estimatedTimeSeconds ?? 60,
      status: 'incomplete',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await blockRef.set(blockDoc);

    log.info('Block created', {
      blockId: blockRef.id,
      lessonId: lessonContext.lessonId,
      blockType: data.blockType,
    });

    revalidatePath('/lesson');
    revalidatePath('/course-creation');
    revalidatePath('/inspire-studio');

    return { data: blockDoc };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to create block', { lessonId: data.lessonId, error: errorMessage });
    return { error: `Failed to create block: ${errorMessage}` };
  }
}

/**
 * Update an existing block
 */
export async function updateBlock(
  blockId: string,
  data: Partial<BlockData>,
  context?: { courseId: string; moduleId: string; lessonId: string; tenantId?: string },
): Promise<ActionResult<BlockDocument>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = context?.tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    if (!context?.courseId || !context?.moduleId || !context?.lessonId) {
      return { error: 'Missing context: courseId, moduleId, and lessonId are required' };
    }

    const blockRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(context.courseId)
      .collection('modules')
      .doc(context.moduleId)
      .collection('lessons')
      .doc(context.lessonId)
      .collection('blocks')
      .doc(blockId);

    const blockDoc = await blockRef.get();
    if (!blockDoc.exists) {
      return { error: 'Block not found' };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.blockType !== undefined) updateData.blockType = data.blockType;
    if (data.blockCategory !== undefined) updateData.blockCategory = data.blockCategory;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;
    if (data.cognitiveLoadWeight !== undefined)
      updateData.cognitiveLoadWeight = data.cognitiveLoadWeight;
    if (data.estimatedTimeSeconds !== undefined)
      updateData.estimatedTimeSeconds = data.estimatedTimeSeconds;

    await blockRef.update(updateData);

    const updatedDoc = await blockRef.get();

    log.info('Block updated', { blockId, lessonId: context.lessonId });

    revalidatePath('/lesson');
    revalidatePath('/course-creation');
    revalidatePath('/inspire-studio');

    return { data: updatedDoc.data() as BlockDocument };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update block', { blockId, error: errorMessage });
    return { error: `Failed to update block: ${errorMessage}` };
  }
}

/**
 * Delete a block
 */
export async function deleteBlock(
  blockId: string,
  context?: { courseId: string; moduleId: string; lessonId: string; tenantId?: string },
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = context?.tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    if (!context?.courseId || !context?.moduleId || !context?.lessonId) {
      return { error: 'Missing context: courseId, moduleId, and lessonId are required' };
    }

    const blockRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(context.courseId)
      .collection('modules')
      .doc(context.moduleId)
      .collection('lessons')
      .doc(context.lessonId)
      .collection('blocks')
      .doc(blockId);

    const blockDoc = await blockRef.get();
    if (!blockDoc.exists) {
      return { error: 'Block not found' };
    }

    await blockRef.delete();

    log.info('Block deleted', { blockId, lessonId: context.lessonId });

    revalidatePath('/lesson');
    revalidatePath('/course-creation');

    return { data: { deleted: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to delete block', { blockId, error: errorMessage });
    return { error: `Failed to delete block: ${errorMessage}` };
  }
}

/**
 * Get all blocks for a lesson
 */
export async function getLessonBlocks(
  lessonId: string,
  context?: { courseId: string; moduleId: string; tenantId?: string },
): Promise<ActionResult<BlockDocument[]>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = context?.tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    let lessonContext: LessonContext | null = null;

    if (context?.courseId && context?.moduleId) {
      lessonContext = {
        tenantId: effectiveTenantId,
        courseId: context.courseId,
        moduleId: context.moduleId,
        lessonId,
      };
    } else {
      lessonContext = await getLessonContext(lessonId, effectiveTenantId);
    }

    if (!lessonContext) {
      return { error: 'Lesson not found' };
    }

    const blocksSnapshot = await adminDb
      .collection('tenants')
      .doc(lessonContext.tenantId)
      .collection('courses')
      .doc(lessonContext.courseId)
      .collection('modules')
      .doc(lessonContext.moduleId)
      .collection('lessons')
      .doc(lessonContext.lessonId)
      .collection('blocks')
      .orderBy('orderIndex')
      .get();

    const blocks = blocksSnapshot.docs.map((doc) => doc.data() as BlockDocument);

    log.info('Fetched lesson blocks', { lessonId, count: blocks.length });

    return { data: blocks };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get lesson blocks', { lessonId, error: errorMessage });
    return { error: `Failed to get lesson blocks: ${errorMessage}` };
  }
}

/**
 * Update block status (for QA workflow)
 */
export async function updateBlockStatus(
  blockId: string,
  status: BlockStatus,
  context?: { courseId: string; moduleId: string; lessonId: string; tenantId?: string },
): Promise<ActionResult<BlockDocument>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = context?.tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    if (!context?.courseId || !context?.moduleId || !context?.lessonId) {
      return { error: 'Missing context: courseId, moduleId, and lessonId are required' };
    }

    const blockRef = adminDb
      .collection('tenants')
      .doc(effectiveTenantId)
      .collection('courses')
      .doc(context.courseId)
      .collection('modules')
      .doc(context.moduleId)
      .collection('lessons')
      .doc(context.lessonId)
      .collection('blocks')
      .doc(blockId);

    const blockDoc = await blockRef.get();
    if (!blockDoc.exists) {
      return { error: 'Block not found' };
    }

    await blockRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await blockRef.get();

    log.info('Block status updated', { blockId, status });

    revalidatePath('/lesson');
    revalidatePath('/course-creation');

    return { data: updatedDoc.data() as BlockDocument };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update block status', { blockId, status, error: errorMessage });
    return { error: `Failed to update block status: ${errorMessage}` };
  }
}

/**
 * Get the block library (available block templates)
 * This is a tenant-level or global collection of block templates
 */
export async function getBlockLibrary(
  tenantId?: string,
): Promise<ActionResult<BlockLibraryItem[]>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = tenantId || authUser?.tenantId;

    // First try tenant-specific block library
    if (effectiveTenantId) {
      const tenantLibrarySnapshot = await adminDb
        .collection('tenants')
        .doc(effectiveTenantId)
        .collection('blockLibrary')
        .get();

      if (!tenantLibrarySnapshot.empty) {
        const blocks = tenantLibrarySnapshot.docs.map((doc) => doc.data() as BlockLibraryItem);
        log.info('Fetched tenant block library', {
          tenantId: effectiveTenantId,
          count: blocks.length,
        });
        return { data: blocks };
      }
    }

    // Fall back to global block library
    const globalLibrarySnapshot = await adminDb.collection('blockLibrary').get();

    if (!globalLibrarySnapshot.empty) {
      const blocks = globalLibrarySnapshot.docs.map((doc) => doc.data() as BlockLibraryItem);
      log.info('Fetched global block library', { count: blocks.length });
      return { data: blocks };
    }

    // Return default block types if no library exists
    const defaultBlocks: BlockLibraryItem[] = [
      {
        id: 'text-paragraph',
        name: 'Text Paragraph',
        description: 'A simple text block for content',
        blockType: 'text',
        blockCategory: 'content',
        defaultContent: { text: '' },
        cognitiveLoadWeight: 1,
        estimatedTimeSeconds: 30,
      },
      {
        id: 'heading',
        name: 'Heading',
        description: 'A heading or title block',
        blockType: 'heading',
        blockCategory: 'content',
        defaultContent: { text: '', level: 2 },
        cognitiveLoadWeight: 0.5,
        estimatedTimeSeconds: 10,
      },
      {
        id: 'image',
        name: 'Image',
        description: 'An image block with optional caption',
        blockType: 'image',
        blockCategory: 'media',
        defaultContent: { src: '', alt: '', caption: '' },
        cognitiveLoadWeight: 2,
        estimatedTimeSeconds: 45,
      },
      {
        id: 'video',
        name: 'Video',
        description: 'A video block with player controls',
        blockType: 'video',
        blockCategory: 'media',
        defaultContent: { src: '', poster: '', chapters: [] },
        cognitiveLoadWeight: 3,
        estimatedTimeSeconds: 180,
      },
      {
        id: 'quiz-multiple-choice',
        name: 'Multiple Choice Quiz',
        description: 'A multiple choice question block',
        blockType: 'quiz',
        blockCategory: 'assessment',
        defaultContent: { question: '', options: [], correctAnswer: 0 },
        cognitiveLoadWeight: 4,
        estimatedTimeSeconds: 60,
      },
      {
        id: 'accordion',
        name: 'Accordion',
        description: 'Expandable content sections',
        blockType: 'accordion',
        blockCategory: 'interactive',
        defaultContent: { items: [] },
        cognitiveLoadWeight: 2,
        estimatedTimeSeconds: 90,
      },
      {
        id: 'tabs',
        name: 'Tabs',
        description: 'Tabbed content sections',
        blockType: 'tabs',
        blockCategory: 'interactive',
        defaultContent: { tabs: [] },
        cognitiveLoadWeight: 2,
        estimatedTimeSeconds: 90,
      },
      {
        id: 'callout',
        name: 'Callout',
        description: 'Highlighted information box',
        blockType: 'callout',
        blockCategory: 'content',
        defaultContent: { text: '', type: 'info' },
        cognitiveLoadWeight: 1.5,
        estimatedTimeSeconds: 30,
      },
    ];

    log.info('Returning default block library', { count: defaultBlocks.length });
    return { data: defaultBlocks };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get block library', { error: errorMessage });
    return { error: `Failed to get block library: ${errorMessage}` };
  }
}

/**
 * Reorder blocks within a lesson
 */
export async function reorderBlocks(
  lessonId: string,
  blockIds: string[],
  context?: { courseId: string; moduleId: string; tenantId?: string },
): Promise<ActionResult<{ reordered: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    const effectiveTenantId = context?.tenantId || authUser?.tenantId;

    if (!effectiveTenantId) {
      return { error: 'Unauthorized: No tenant context' };
    }

    let lessonContext: LessonContext | null = null;

    if (context?.courseId && context?.moduleId) {
      lessonContext = {
        tenantId: effectiveTenantId,
        courseId: context.courseId,
        moduleId: context.moduleId,
        lessonId,
      };
    } else {
      lessonContext = await getLessonContext(lessonId, effectiveTenantId);
    }

    if (!lessonContext) {
      return { error: 'Lesson not found' };
    }

    const blocksRef = adminDb
      .collection('tenants')
      .doc(lessonContext.tenantId)
      .collection('courses')
      .doc(lessonContext.courseId)
      .collection('modules')
      .doc(lessonContext.moduleId)
      .collection('lessons')
      .doc(lessonContext.lessonId)
      .collection('blocks');

    const batch = adminDb.batch();

    blockIds.forEach((blockId, index) => {
      const blockRef = blocksRef.doc(blockId);
      batch.update(blockRef, {
        orderIndex: index,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    log.info('Blocks reordered', { lessonId, count: blockIds.length });

    revalidatePath('/lesson');
    revalidatePath('/course-creation');

    return { data: { reordered: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to reorder blocks', { lessonId, error: errorMessage });
    return { error: `Failed to reorder blocks: ${errorMessage}` };
  }
}
