import {
  addDoc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import type {
  ContentBlock,
  ContentBlockData,
  ContentBlockType,
  CreateContentBlockInput,
  UpdateContentBlockInput,
} from '@/types/firestore/cms';
import { COLLECTIONS, getContentBlockRef, getContentBlocksCollection } from '../collections';
import { contentBlockConverter } from '../converters';

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get a single content block by ID
 * @param blockId - The content block document ID
 * @returns The content block document or null if not found
 */
export async function getContentBlock(blockId: string): Promise<ContentBlock | null> {
  try {
    const docRef = getContentBlockRef(blockId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data();
  } catch (error) {
    console.error('Failed to get content block:', error);
    throw new Error(`Failed to get content block: ${blockId}`);
  }
}

/**
 * Get content blocks by lesson ID (ordered by block order)
 * @param lessonId - The lesson ID
 * @returns Ordered list of content blocks for the lesson
 */
export async function getBlocksByLesson(lessonId: string): Promise<ContentBlock[]> {
  try {
    const blocksRef = getContentBlocksCollection();
    const q = query(blocksRef, where('lessonId', '==', lessonId), orderBy('order', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get blocks by lesson:', error);
    throw new Error(`Failed to get blocks for lesson: ${lessonId}`);
  }
}

/**
 * Get published content blocks for a lesson
 * @param lessonId - The lesson ID
 * @returns Ordered list of published content blocks
 */
export async function getPublishedBlocks(lessonId: string): Promise<ContentBlock[]> {
  try {
    const blocksRef = getContentBlocksCollection();
    const q = query(
      blocksRef,
      where('lessonId', '==', lessonId),
      where('status', '==', 'published'),
      orderBy('order', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get published blocks:', error);
    throw new Error(`Failed to get published blocks for lesson: ${lessonId}`);
  }
}

/**
 * Get content blocks by type within a lesson
 * @param lessonId - The lesson ID
 * @param type - The content block type
 * @returns List of content blocks of specified type
 */
export async function getBlocksByType(
  lessonId: string,
  type: ContentBlockType,
): Promise<ContentBlock[]> {
  try {
    const blocksRef = getContentBlocksCollection();
    const q = query(
      blocksRef,
      where('lessonId', '==', lessonId),
      where('type', '==', type),
      orderBy('order', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Failed to get blocks by type:', error);
    throw new Error(`Failed to get blocks of type ${type} for lesson: ${lessonId}`);
  }
}

/**
 * Count content blocks in a lesson
 * @param lessonId - The lesson ID
 * @returns Number of content blocks
 */
export async function countBlocksInLesson(lessonId: string): Promise<number> {
  try {
    const blocks = await getBlocksByLesson(lessonId);
    return blocks.length;
  } catch (error) {
    console.error('Failed to count blocks:', error);
    throw new Error(`Failed to count blocks for lesson: ${lessonId}`);
  }
}

/**
 * Calculate total duration of content blocks in a lesson
 * @param lessonId - The lesson ID
 * @returns Total duration in seconds
 */
export async function calculateLessonDuration(lessonId: string): Promise<number> {
  try {
    const blocks = await getBlocksByLesson(lessonId);
    return blocks.reduce((total, block) => total + (block.durationSeconds ?? 0), 0);
  } catch (error) {
    console.error('Failed to calculate lesson duration:', error);
    throw new Error(`Failed to calculate duration for lesson: ${lessonId}`);
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create a new content block
 * @param orgId - The organization ID
 * @param userId - The creating user's ID
 * @param input - Content block creation data
 * @returns The created content block with ID
 */
export async function createContentBlock(
  orgId: string,
  userId: string,
  input: CreateContentBlockInput,
): Promise<ContentBlock> {
  try {
    // Use raw collection for write (serverTimestamp() returns FieldValue, not Timestamp)
    const blocksRef = collection(getFirebaseDb(), COLLECTIONS.CONTENT_BLOCKS);
    const now = serverTimestamp();

    const blockData = {
      ...input,
      organizationId: orgId,
      isRequired: input.isRequired ?? false,
      status: 'draft' as const,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(blocksRef, blockData);
    // Use converter for typed read
    const typedDocRef = docRef.withConverter(contentBlockConverter);
    const created = await getDoc(typedDocRef);

    if (!created.exists()) {
      throw new Error('Failed to retrieve created content block');
    }

    return created.data();
  } catch (error) {
    console.error('Failed to create content block:', error);
    throw new Error('Failed to create content block');
  }
}

/**
 * Create multiple content blocks at once
 * @param orgId - The organization ID
 * @param userId - The creating user's ID
 * @param inputs - Array of content block creation data
 * @returns Array of created content blocks
 */
export async function createContentBlocks(
  orgId: string,
  userId: string,
  inputs: CreateContentBlockInput[],
): Promise<ContentBlock[]> {
  try {
    // Create blocks sequentially (writeBatch doesn't support addDoc)
    const createdBlocks: ContentBlock[] = [];

    for (const input of inputs) {
      const block = await createContentBlock(orgId, userId, input);
      createdBlocks.push(block);
    }

    return createdBlocks;
  } catch (error) {
    console.error('Failed to create content blocks:', error);
    throw new Error('Failed to create content blocks');
  }
}

/**
 * Update an existing content block
 * @param blockId - The content block document ID
 * @param userId - The updating user's ID
 * @param input - Content block update data
 * @returns The updated content block
 */
export async function updateContentBlock(
  blockId: string,
  userId: string,
  input: UpdateContentBlockInput,
): Promise<ContentBlock> {
  try {
    const docRef = getContentBlockRef(blockId);

    await updateDoc(docRef, {
      ...input,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error('Content block not found after update');
    }

    return updated.data();
  } catch (error) {
    console.error('Failed to update content block:', error);
    throw new Error(`Failed to update content block: ${blockId}`);
  }
}

/**
 * Update content block content data
 * @param blockId - The content block document ID
 * @param userId - The updating user's ID
 * @param content - New content data
 * @returns The updated content block
 */
export async function updateBlockContent(
  blockId: string,
  userId: string,
  content: ContentBlockData,
): Promise<ContentBlock> {
  try {
    const docRef = getContentBlockRef(blockId);

    await updateDoc(docRef, {
      content,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error('Content block not found after update');
    }

    return updated.data();
  } catch (error) {
    console.error('Failed to update block content:', error);
    throw new Error(`Failed to update block content: ${blockId}`);
  }
}

/**
 * Delete a content block
 * @param blockId - The content block document ID
 */
export async function deleteContentBlock(blockId: string): Promise<void> {
  try {
    const docRef = getContentBlockRef(blockId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Failed to delete content block:', error);
    throw new Error(`Failed to delete content block: ${blockId}`);
  }
}

/**
 * Delete all content blocks for a lesson
 * @param lessonId - The lesson ID
 */
export async function deleteBlocksByLesson(lessonId: string): Promise<void> {
  try {
    const blocks = await getBlocksByLesson(lessonId);
    const batch = writeBatch(getFirebaseDb());

    for (const block of blocks) {
      const docRef = getContentBlockRef(block.id);
      batch.delete(docRef);
    }

    await batch.commit();
  } catch (error) {
    console.error('Failed to delete blocks by lesson:', error);
    throw new Error(`Failed to delete blocks for lesson: ${lessonId}`);
  }
}

/**
 * Reorder content blocks within a lesson
 * @param lessonId - The lesson ID
 * @param blockIds - Array of block IDs in new order
 */
export async function reorderBlocks(lessonId: string, blockIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(getFirebaseDb());

    blockIds.forEach((blockId, index) => {
      const docRef = getContentBlockRef(blockId);
      batch.update(docRef, {
        order: index,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Failed to reorder blocks:', error);
    throw new Error(`Failed to reorder blocks for lesson: ${lessonId}`);
  }
}

/**
 * Move a content block to a different position
 * @param blockId - The block ID to move
 * @param userId - The user performing the move
 * @param newOrder - The new order position
 * @returns The updated block
 */
export async function moveBlock(
  blockId: string,
  userId: string,
  newOrder: number,
): Promise<ContentBlock> {
  try {
    const block = await getContentBlock(blockId);
    if (!block) {
      throw new Error('Content block not found');
    }

    const oldOrder = block.order;
    const lessonId = block.lessonId;

    // Get all blocks in the lesson
    const allBlocks = await getBlocksByLesson(lessonId);

    // Reorder blocks
    const batch = writeBatch(getFirebaseDb());
    const now = serverTimestamp();

    for (const b of allBlocks) {
      let updatedOrder = b.order;

      if (b.id === blockId) {
        updatedOrder = newOrder;
      } else if (oldOrder < newOrder) {
        // Moving down: shift blocks between old and new position up
        if (b.order > oldOrder && b.order <= newOrder) {
          updatedOrder = b.order - 1;
        }
      } else if (oldOrder > newOrder) {
        // Moving up: shift blocks between new and old position down
        if (b.order >= newOrder && b.order < oldOrder) {
          updatedOrder = b.order + 1;
        }
      }

      if (updatedOrder !== b.order) {
        const docRef = getContentBlockRef(b.id);
        batch.update(docRef, {
          order: updatedOrder,
          updatedAt: now,
          updatedBy: userId,
        });
      }
    }

    await batch.commit();

    const updated = await getContentBlock(blockId);
    if (!updated) {
      throw new Error('Content block not found after move');
    }

    return updated;
  } catch (error) {
    console.error('Failed to move block:', error);
    throw new Error(`Failed to move block: ${blockId}`);
  }
}

/**
 * Publish a content block
 * @param blockId - The content block document ID
 * @param userId - The publishing user's ID
 * @returns The published content block
 */
export async function publishBlock(blockId: string, userId: string): Promise<ContentBlock> {
  try {
    const docRef = getContentBlockRef(blockId);

    await updateDoc(docRef, {
      status: 'published',
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const published = await getDoc(docRef);
    if (!published.exists()) {
      throw new Error('Content block not found after publish');
    }

    return published.data();
  } catch (error) {
    console.error('Failed to publish block:', error);
    throw new Error(`Failed to publish block: ${blockId}`);
  }
}

/**
 * Publish all content blocks for a lesson
 * @param lessonId - The lesson ID
 * @param userId - The publishing user's ID
 */
export async function publishAllBlocks(lessonId: string, userId: string): Promise<void> {
  try {
    const blocks = await getBlocksByLesson(lessonId);
    const batch = writeBatch(getFirebaseDb());
    const now = serverTimestamp();

    for (const block of blocks) {
      if (block.status !== 'published') {
        const docRef = getContentBlockRef(block.id);
        batch.update(docRef, {
          status: 'published',
          updatedAt: now,
          updatedBy: userId,
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('Failed to publish all blocks:', error);
    throw new Error(`Failed to publish all blocks for lesson: ${lessonId}`);
  }
}

/**
 * Duplicate a content block
 * @param blockId - The source block ID
 * @param userId - The duplicating user's ID
 * @param lessonId - Optional target lesson ID (defaults to same lesson)
 * @returns The duplicated content block
 */
export async function duplicateBlock(
  blockId: string,
  userId: string,
  lessonId?: string,
): Promise<ContentBlock> {
  try {
    const source = await getContentBlock(blockId);
    if (!source) {
      throw new Error('Source content block not found');
    }

    const targetLessonId = lessonId ?? source.lessonId;

    // Get the highest order in the target lesson
    const existingBlocks = await getBlocksByLesson(targetLessonId);
    const maxOrder = existingBlocks.reduce((max, b) => Math.max(max, b.order), -1);

    return createContentBlock(source.organizationId, userId, {
      lessonId: targetLessonId,
      type: source.type,
      order: maxOrder + 1,
      content: source.content,
      className: source.className,
      styles: source.styles,
      durationSeconds: source.durationSeconds,
      cognitiveLoadWeight: source.cognitiveLoadWeight,
      isRequired: source.isRequired,
      ariaLabel: source.ariaLabel,
    });
  } catch (error) {
    console.error('Failed to duplicate block:', error);
    throw new Error(`Failed to duplicate block: ${blockId}`);
  }
}

/**
 * Copy content blocks from one lesson to another
 * @param sourceLessonId - The source lesson ID
 * @param targetLessonId - The target lesson ID
 * @param userId - The copying user's ID
 * @returns Array of created content blocks
 */
export async function copyBlocksToLesson(
  sourceLessonId: string,
  targetLessonId: string,
  userId: string,
): Promise<ContentBlock[]> {
  try {
    const sourceBlocks = await getBlocksByLesson(sourceLessonId);

    if (sourceBlocks.length === 0) {
      return [];
    }

    // Get existing blocks in target to determine starting order
    const existingBlocks = await getBlocksByLesson(targetLessonId);
    const startOrder = existingBlocks.reduce((max, b) => Math.max(max, b.order), -1) + 1;

    const orgId = sourceBlocks[0].organizationId;
    const createdBlocks: ContentBlock[] = [];

    for (let i = 0; i < sourceBlocks.length; i++) {
      const source = sourceBlocks[i];
      const block = await createContentBlock(orgId, userId, {
        lessonId: targetLessonId,
        type: source.type,
        order: startOrder + i,
        content: source.content,
        className: source.className,
        styles: source.styles,
        durationSeconds: source.durationSeconds,
        cognitiveLoadWeight: source.cognitiveLoadWeight,
        isRequired: source.isRequired,
        ariaLabel: source.ariaLabel,
      });
      createdBlocks.push(block);
    }

    return createdBlocks;
  } catch (error) {
    console.error('Failed to copy blocks to lesson:', error);
    throw new Error(`Failed to copy blocks from ${sourceLessonId} to ${targetLessonId}`);
  }
}
