'use server';

import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'actions-blocks' });

export interface BlockData {
  lessonId: string;
  blockType: string;
  blockCategory: string;
  content: Record<string, unknown>;
  orderIndex: number;
  cognitiveLoadWeight?: number;
  estimatedTimeSeconds?: number;
}

// TODO(LXD-297): Implement with Firestore
export async function createBlock(data: BlockData): Promise<{ error: string } | { data: unknown }> {
  log.warn('createBlock: Database not configured - returning mock data', {
    lessonId: data.lessonId,
  });
  revalidatePath('/lesson');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function updateBlock(blockId: string, _data: Partial<BlockData>) {
  log.warn('updateBlock: Database not configured - returning mock data', { blockId });
  revalidatePath('/lesson');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function deleteBlock(blockId: string) {
  log.warn('deleteBlock: Database not configured', { blockId });
  revalidatePath('/lesson');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function getLessonBlocks(lessonId: string) {
  log.warn('getLessonBlocks: Database not configured - returning empty array', { lessonId });
  return { data: [], error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function updateBlockStatus(
  blockId: string,
  status: 'incomplete' | 'in_progress' | 'complete' | 'qa_approved',
) {
  log.warn('updateBlockStatus: Database not configured', { blockId, status });
  revalidatePath('/lesson');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function getBlockLibrary() {
  log.warn('getBlockLibrary: Database not configured - returning empty array');
  return { data: [], error: 'Database not configured - migration in progress' };
}
