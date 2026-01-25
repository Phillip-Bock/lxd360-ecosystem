import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { requireDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';
import type { AchievementType, Badge, Certificate, EarnedBadge } from '@/types/lms/achievement';

const log = logger.scope('Achievements');

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

function badgesCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, 'badges');
}

function earnedBadgesCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, 'earned_badges');
}

function certificatesCollection(organizationId: string) {
  return collection(requireDb(), 'organizations', organizationId, 'certificates');
}

// =============================================================================
// TYPES
// =============================================================================

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface AwardBadgeInput {
  badgeId: string;
  learnerId: string;
  source: {
    type: 'course' | 'quiz' | 'streak' | 'skill' | 'social' | 'manual';
    id?: string;
    title?: string;
  };
}

// =============================================================================
// BADGE OPERATIONS
// =============================================================================

/**
 * Get all available badges for an organization
 */
export async function getBadges(organizationId: string): Promise<Badge[]> {
  try {
    const badgesRef = badgesCollection(organizationId);
    const q = query(badgesRef, where('isActive', '==', true), orderBy('name', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Badge);
  } catch (error) {
    log.error('Failed to get badges', error, { organizationId });
    throw new Error('Failed to get badges');
  }
}

/**
 * Get a badge by ID
 */
export async function getBadge(organizationId: string, badgeId: string): Promise<Badge | null> {
  try {
    const docRef = doc(requireDb(), 'organizations', organizationId, 'badges', badgeId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Badge;
  } catch (error) {
    log.error('Failed to get badge', error, { organizationId, badgeId });
    throw new Error(`Failed to get badge: ${badgeId}`);
  }
}

/**
 * Get badges by category
 */
export async function getBadgesByCategory(
  organizationId: string,
  category: string,
): Promise<Badge[]> {
  try {
    const badgesRef = badgesCollection(organizationId);
    const q = query(
      badgesRef,
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('name', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Badge);
  } catch (error) {
    log.error('Failed to get badges by category', error, { organizationId, category });
    throw new Error(`Failed to get badges for category: ${category}`);
  }
}

/**
 * Get badges by type
 */
export async function getBadgesByType(
  organizationId: string,
  type: AchievementType,
): Promise<Badge[]> {
  try {
    const badgesRef = badgesCollection(organizationId);
    const q = query(
      badgesRef,
      where('type', '==', type),
      where('isActive', '==', true),
      orderBy('name', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Badge);
  } catch (error) {
    log.error('Failed to get badges by type', error, { organizationId, type });
    throw new Error(`Failed to get badges for type: ${type}`);
  }
}

// =============================================================================
// EARNED BADGE OPERATIONS
// =============================================================================

/**
 * Get all badges earned by a learner
 */
export async function getLearnerBadges(
  organizationId: string,
  learnerId: string,
): Promise<EarnedBadge[]> {
  try {
    const earnedRef = earnedBadgesCollection(organizationId);
    const q = query(earnedRef, where('learnerId', '==', learnerId), orderBy('earnedAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as EarnedBadge);
  } catch (error) {
    log.error('Failed to get learner badges', error, { organizationId, learnerId });
    throw new Error(`Failed to get badges for learner: ${learnerId}`);
  }
}

/**
 * Get recent badges earned by a learner
 */
export async function getRecentBadges(
  organizationId: string,
  learnerId: string,
  count: number = 5,
): Promise<EarnedBadge[]> {
  try {
    const earnedRef = earnedBadgesCollection(organizationId);
    const q = query(
      earnedRef,
      where('learnerId', '==', learnerId),
      orderBy('earnedAt', 'desc'),
      limit(count),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as EarnedBadge);
  } catch (error) {
    log.error('Failed to get recent badges', error, { organizationId, learnerId });
    throw new Error(`Failed to get recent badges for learner: ${learnerId}`);
  }
}

/**
 * Check if a learner has earned a specific badge
 */
export async function hasEarnedBadge(
  organizationId: string,
  learnerId: string,
  badgeId: string,
): Promise<boolean> {
  try {
    const earnedRef = earnedBadgesCollection(organizationId);
    const q = query(
      earnedRef,
      where('learnerId', '==', learnerId),
      where('badgeId', '==', badgeId),
      limit(1),
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    log.error('Failed to check earned badge', error, { organizationId, learnerId, badgeId });
    throw new Error('Failed to check if badge is earned');
  }
}

/**
 * Award a badge to a learner
 */
export async function awardBadge(
  organizationId: string,
  input: AwardBadgeInput,
): Promise<EarnedBadge> {
  try {
    // Check if already earned
    const alreadyEarned = await hasEarnedBadge(organizationId, input.learnerId, input.badgeId);

    // Get the badge to check if stackable
    const badge = await getBadge(organizationId, input.badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    if (alreadyEarned && !badge.isStackable) {
      throw new Error('Badge already earned and is not stackable');
    }

    const earnedRef = earnedBadgesCollection(organizationId);
    const earnedBadgeData = {
      badgeId: input.badgeId,
      badge,
      learnerId: input.learnerId,
      earnedAt: serverTimestamp(),
      source: input.source,
      stackCount: 1,
      isDisplayed: true,
    };

    const docRef = await addDoc(earnedRef, earnedBadgeData);
    const created = await getDoc(docRef);

    if (!created.exists()) {
      throw new Error('Failed to retrieve awarded badge');
    }

    return { id: created.id, ...created.data() } as EarnedBadge;
  } catch (error) {
    log.error('Failed to award badge', error, { organizationId, input });
    throw error;
  }
}

// =============================================================================
// CERTIFICATE OPERATIONS
// =============================================================================

/**
 * Get all certificates for a learner
 */
export async function getLearnerCertificates(
  organizationId: string,
  learnerId: string,
): Promise<Certificate[]> {
  try {
    const certsRef = certificatesCollection(organizationId);
    const q = query(certsRef, where('learnerId', '==', learnerId), orderBy('issuedAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Certificate);
  } catch (error) {
    log.error('Failed to get learner certificates', error, { organizationId, learnerId });
    throw new Error(`Failed to get certificates for learner: ${learnerId}`);
  }
}

/**
 * Get a certificate by ID
 */
export async function getCertificate(
  organizationId: string,
  certificateId: string,
): Promise<Certificate | null> {
  try {
    const docRef = doc(requireDb(), 'organizations', organizationId, 'certificates', certificateId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Certificate;
  } catch (error) {
    log.error('Failed to get certificate', error, { organizationId, certificateId });
    throw new Error(`Failed to get certificate: ${certificateId}`);
  }
}

/**
 * Get certificate by verification code
 */
export async function getCertificateByVerificationCode(
  organizationId: string,
  verificationCode: string,
): Promise<Certificate | null> {
  try {
    const certsRef = certificatesCollection(organizationId);
    const q = query(certsRef, where('verificationCode', '==', verificationCode), limit(1));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Certificate;
  } catch (error) {
    log.error('Failed to get certificate by verification code', error, {
      organizationId,
      verificationCode,
    });
    throw new Error('Failed to verify certificate');
  }
}

/**
 * Get certificates for a course
 */
export async function getCourseCertificates(
  organizationId: string,
  courseId: string,
): Promise<Certificate[]> {
  try {
    const certsRef = certificatesCollection(organizationId);
    const q = query(certsRef, where('courseId', '==', courseId), orderBy('issuedAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Certificate);
  } catch (error) {
    log.error('Failed to get course certificates', error, { organizationId, courseId });
    throw new Error(`Failed to get certificates for course: ${courseId}`);
  }
}
