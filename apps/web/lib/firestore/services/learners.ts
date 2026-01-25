import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { requireDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';
import type { Learner, LearnerStatus } from '@/types/lms/learner';

const log = logger.scope('Learners');

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

const COLLECTION_NAME = 'learners';

function learnersCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, COLLECTION_NAME);
}

function learnerRef(organizationId: string, learnerId: string) {
  return doc(requireDb(), 'organizations', organizationId, COLLECTION_NAME, learnerId);
}

// =============================================================================
// TYPES
// =============================================================================

export interface LearnerFilters {
  status?: LearnerStatus;
  searchQuery?: string;
  teamIds?: string[];
  groupIds?: string[];
  managerId?: string;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get a single learner by ID
 */
export async function getLearner(
  organizationId: string,
  learnerId: string,
): Promise<Learner | null> {
  try {
    const docRef = learnerRef(organizationId, learnerId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Learner;
  } catch (error) {
    log.error('Failed to get learner', error, { organizationId, learnerId });
    throw new Error(`Failed to get learner: ${learnerId}`);
  }
}

/**
 * Get all learners for an organization
 */
export async function getLearners(
  organizationId: string,
  options: PaginationOptions = { limit: 50 },
): Promise<PaginatedResponse<Learner>> {
  try {
    const learnersRef = learnersCollection(organizationId);
    let q = query(
      learnersRef,
      orderBy(options.orderBy ?? 'lastActiveAt', options.orderDirection ?? 'desc'),
      limit((options.limit ?? 50) + 1),
    );

    if (options.cursor) {
      const cursorDoc = await getDoc(learnerRef(organizationId, options.cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }

    const snapshot = await getDocs(q);
    const learners = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Learner);

    const hasMore = learners.length > (options.limit ?? 50);
    if (hasMore) {
      learners.pop();
    }

    return {
      items: learners,
      hasMore,
      nextCursor: hasMore ? learners[learners.length - 1]?.id : undefined,
    };
  } catch (error) {
    log.error('Failed to get learners', error, { organizationId });
    throw new Error('Failed to get learners');
  }
}

/**
 * Get learners by status
 */
export async function getLearnersByStatus(
  organizationId: string,
  status: LearnerStatus,
  options: PaginationOptions = { limit: 50 },
): Promise<PaginatedResponse<Learner>> {
  try {
    const learnersRef = learnersCollection(organizationId);
    const q = query(
      learnersRef,
      where('status', '==', status),
      orderBy('lastActiveAt', 'desc'),
      limit((options.limit ?? 50) + 1),
    );

    const snapshot = await getDocs(q);
    const learners = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Learner);

    const hasMore = learners.length > (options.limit ?? 50);
    if (hasMore) {
      learners.pop();
    }

    return {
      items: learners,
      hasMore,
      nextCursor: hasMore ? learners[learners.length - 1]?.id : undefined,
    };
  } catch (error) {
    log.error('Failed to get learners by status', error, { organizationId, status });
    throw new Error(`Failed to get learners with status: ${status}`);
  }
}

/**
 * Get learners by manager
 */
export async function getLearnersByManager(
  organizationId: string,
  managerId: string,
): Promise<Learner[]> {
  try {
    const learnersRef = learnersCollection(organizationId);
    const q = query(
      learnersRef,
      where('managerId', '==', managerId),
      orderBy('displayName', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Learner);
  } catch (error) {
    log.error('Failed to get learners by manager', error, { organizationId, managerId });
    throw new Error(`Failed to get learners for manager: ${managerId}`);
  }
}

/**
 * Search learners by name or email
 */
export async function searchLearners(
  organizationId: string,
  searchQuery: string,
  options: PaginationOptions = { limit: 20 },
): Promise<Learner[]> {
  try {
    // Firestore doesn't support full-text search, so we do client-side filtering
    // In production, consider using Algolia or Elasticsearch
    const { items } = await getLearners(organizationId, { limit: 500 });

    const query = searchQuery.toLowerCase();
    const filtered = items.filter(
      (learner) =>
        learner.displayName.toLowerCase().includes(query) ||
        learner.email.toLowerCase().includes(query) ||
        learner.firstName.toLowerCase().includes(query) ||
        learner.lastName.toLowerCase().includes(query),
    );

    return filtered.slice(0, options.limit ?? 20);
  } catch (error) {
    log.error('Failed to search learners', error, { organizationId, searchQuery });
    throw new Error('Failed to search learners');
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Update learner status
 */
export async function updateLearnerStatus(
  organizationId: string,
  learnerId: string,
  status: LearnerStatus,
): Promise<void> {
  try {
    const docRef = learnerRef(organizationId, learnerId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    log.error('Failed to update learner status', error, { organizationId, learnerId, status });
    throw new Error(`Failed to update learner status: ${learnerId}`);
  }
}

/**
 * Update learner's last active timestamp
 */
export async function updateLearnerActivity(
  organizationId: string,
  learnerId: string,
): Promise<void> {
  try {
    const docRef = learnerRef(organizationId, learnerId);
    await updateDoc(docRef, {
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    log.error('Failed to update learner activity', error, { organizationId, learnerId });
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Increment learner XP
 */
export async function incrementLearnerXp(
  organizationId: string,
  learnerId: string,
  xpAmount: number,
): Promise<void> {
  try {
    const docRef = learnerRef(organizationId, learnerId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('Learner not found');
    }

    const currentXp = snapshot.data().xp ?? 0;

    // Simple leveling formula: 1000 XP per level
    const newXp = currentXp + xpAmount;
    const xpPerLevel = 1000;
    const newLevel = Math.floor(newXp / xpPerLevel) + 1;
    const xpToNextLevel = xpPerLevel - (newXp % xpPerLevel);

    await updateDoc(docRef, {
      xp: newXp,
      level: newLevel,
      xpToNextLevel,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    log.error('Failed to increment learner XP', error, { organizationId, learnerId, xpAmount });
    throw new Error(`Failed to increment XP for learner: ${learnerId}`);
  }
}
