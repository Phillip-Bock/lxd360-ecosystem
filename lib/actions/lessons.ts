'use server';

import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'actions-lessons' });

export interface LessonBlockData {
  blockType: string;
  blockCategory: string;
  content: unknown;
  orderIndex: number;
  cognitiveLoadWeight?: number;
  estimatedTimeSeconds?: number;
}

// TODO(LXD-297): Implement with Firestore
export async function saveLesson(
  lessonId: string,
  _data: { title: string; blocks: LessonBlockData[] },
): Promise<{ error: string } | { success: boolean }> {
  log.warn('saveLesson: Database not configured', { lessonId });
  revalidatePath('/lesson');
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function getLesson(lessonId: string) {
  log.warn('getLesson: Database not configured', { lessonId });
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function getBlockLibrary() {
  log.warn('getBlockLibrary: Database not configured - returning empty array');
  return { error: 'Database not configured - migration in progress', data: [] };
}

// TODO(LXD-297): Implement with Firestore
export async function updateLesson(lessonId: string, _data: { title?: string }) {
  log.warn('updateLesson: Database not configured', { lessonId });
  revalidatePath('/lesson');
  revalidatePath('/course-creation');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function addBlockToLesson(
  lessonId: string,
  _blockData: {
    block_type: string;
    content: unknown;
    order_index: number;
    cognitive_load_weight?: number;
    estimated_time_seconds?: number;
  },
) {
  log.warn('addBlockToLesson: Database not configured', { lessonId });
  revalidatePath('/lesson');
  return null;
}

// TODO(LXD-297): Implement with Firestore
export async function updateBlock(blockId: string, _data: unknown) {
  log.warn('updateBlock: Database not configured', { blockId });
  revalidatePath('/lesson');
  return { error: 'Database not configured - migration in progress' };
}

// TODO(LXD-297): Implement with Firestore
export async function deleteBlock(blockId: string) {
  log.warn('deleteBlock: Database not configured', { blockId });
  revalidatePath('/lesson');
  return { error: 'Database not configured - migration in progress' };
}
