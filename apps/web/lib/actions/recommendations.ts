'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import { analyzeGap, getTopRecommendations } from '@/lib/onet/gap-engine';
import { getOccupationByCode } from '@/lib/onet/seed-data';
import type { UserSkillMastery } from '@/lib/onet/types';
import {
  generateRecommendationsRequestSchema,
  type Recommendation,
  type RecommendationStats,
  type RecommendationWithDetails,
  recommendationApprovalSchema,
  recommendationResponseSchema,
  type SkillRecommendation,
} from '@/types/lms/recommendation';

const log = logger.child({ module: 'actions-recommendations' });

// ============================================================================
// Types
// ============================================================================

type ActionResult<T = unknown> = { error: string } | { data: T };

interface AuthUser {
  uid: string;
  tenantId: string;
  persona: string;
}

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      log.warn('No session cookie found');
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const tenantId = decodedToken.tenantId as string | undefined;
    const persona = (decodedToken.persona as string) || (decodedToken.role as string) || 'learner';

    if (!tenantId) {
      log.warn('User has no tenantId in token', { uid: decodedToken.uid });
      return null;
    }

    return { uid: decodedToken.uid, tenantId, persona };
  } catch (error) {
    log.error('Failed to verify session', { error });
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function firestoreToRecommendation(
  id: string,
  data: FirebaseFirestore.DocumentData,
): Recommendation {
  return {
    id,
    tenantId: data.tenantId,
    learnerId: data.learnerId,
    courseId: data.courseId,
    status: data.status,
    source: data.source,
    priority: data.priority,
    confidence: data.confidence,
    explanation: data.explanation,
    targetSkills: data.targetSkills || [],
    requiresApproval: data.requiresApproval || false,
    approvedBy: data.approvedBy,
    approvedAt: data.approvedAt?.toDate?.() || undefined,
    rejectedBy: data.rejectedBy,
    rejectedAt: data.rejectedAt?.toDate?.() || undefined,
    rejectionReason: data.rejectionReason,
    respondedAt: data.respondedAt?.toDate?.() || undefined,
    learnerFeedback: data.learnerFeedback,
    enrollmentId: data.enrollmentId,
    gapAnalysisId: data.gapAnalysisId,
    targetOccupation: data.targetOccupation,
    estimatedHours: data.estimatedHours || 0,
    expiresAt: data.expiresAt?.toDate?.() || undefined,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

// ============================================================================
// Recommendation Generation
// ============================================================================

/**
 * Generate recommendations for a learner based on O*NET skill gaps
 */
export async function generateRecommendations(
  learnerId: string,
  targetOccupation?: string,
  maxRecommendations: number = 5,
  minConfidence: number = 0.5,
): Promise<
  ActionResult<{
    recommendations: Recommendation[];
    totalGaps: number;
    readinessScore: number;
    totalEstimatedHours: number;
  }>
> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = generateRecommendationsRequestSchema.safeParse({
      learnerId,
      targetOccupation,
      maxRecommendations,
      minConfidence,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid request data',
      };
    }

    const { tenantId, uid, persona } = authUser;

    // RBAC: Learners can only generate for themselves
    const isSelf = learnerId === uid;
    const canManage = ['owner', 'manager'].includes(persona);

    if (!isSelf && !canManage) {
      return { error: 'Forbidden: You cannot generate recommendations for other users' };
    }

    // Get the target occupation
    const occupation = targetOccupation
      ? getOccupationByCode(targetOccupation)
      : getOccupationByCode('15-1252.00'); // Default: Software Developer

    if (!occupation) {
      return { error: 'Target occupation not found' };
    }

    // Get learner's current skill masteries from Firestore
    const masteriesSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('learner_masteries')
      .where('learnerId', '==', learnerId)
      .get();

    const userMasteries: UserSkillMastery[] = masteriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        learnerId: data.learnerId,
        skillId: data.skillId,
        masteryScore: data.masteryScore || 0,
        confidence: data.confidence || 0.5,
        evidenceSource: data.evidenceSource || 'inferred',
        lastVerified: data.lastVerified?.toDate() || new Date(),
        dataPoints: data.dataPoints || 0,
      };
    });

    // Run gap analysis
    const gapAnalysis = analyzeGap(learnerId, occupation, userMasteries);

    // Get top recommendations from gaps
    const topGaps = getTopRecommendations(gapAnalysis, maxRecommendations);

    // Get available courses that match the skill gaps
    const coursesSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .where('status', '==', 'published')
      .limit(100)
      .get();

    // Map skill gaps to courses
    const recommendations: Recommendation[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    for (const gap of topGaps) {
      // Find a course that addresses this skill
      // In production, this would use skill embeddings and course metadata
      const matchingCourse = coursesSnapshot.docs.find((doc) => {
        const courseData = doc.data();
        // Check if course skills include this gap skill
        const courseSkills = (courseData.skills || []) as Array<{
          skillId: string;
          skillName: string;
        }>;
        return courseSkills.some(
          (s) =>
            s.skillId === gap.skill.onetElementId ||
            s.skillName?.toLowerCase().includes(gap.skill.name.toLowerCase()),
        );
      });

      if (!matchingCourse) continue;

      // Calculate confidence based on skill match and gap priority
      const priorityConfidence: Record<string, number> = {
        critical: 0.95,
        high: 0.85,
        medium: 0.75,
        low: 0.65,
      };
      const confidence = priorityConfidence[gap.priority] || 0.7;

      if (confidence < minConfidence) continue;

      // Create skill recommendation
      const skillRec: SkillRecommendation = {
        skillId: gap.skill.onetElementId,
        skillName: gap.skill.name,
        currentLevel:
          gapAnalysis.missingSkills.find((g) => g.skill.onetElementId === gap.skill.onetElementId)
            ?.currentLevel || 0,
        targetLevel:
          gapAnalysis.missingSkills.find((g) => g.skill.onetElementId === gap.skill.onetElementId)
            ?.requiredLevel || 5,
        gap:
          gapAnalysis.missingSkills.find((g) => g.skill.onetElementId === gap.skill.onetElementId)
            ?.gap || 3,
        importance: 4, // From O*NET importance rating
      };

      // Create recommendation record
      const recRef = adminDb
        .collection('tenants')
        .doc(tenantId)
        .collection('recommendations')
        .doc();

      const recData = {
        tenantId,
        learnerId,
        courseId: matchingCourse.id,
        status: 'pending',
        source: 'onet_gap',
        priority: gap.priority,
        confidence,
        explanation: gap.reason,
        targetSkills: [skillRec],
        requiresApproval: persona === 'learner', // Learners need manager approval
        estimatedHours: gap.estimatedHours,
        gapAnalysisId: `gap-${learnerId}-${occupation.onetSocCode}-${now.getTime()}`,
        targetOccupation: {
          code: occupation.onetSocCode,
          title: occupation.title,
        },
        expiresAt,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await recRef.set(recData);

      recommendations.push({
        id: recRef.id,
        ...recData,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      } as Recommendation);
    }

    log.info('Recommendations generated', {
      learnerId,
      targetOccupation: occupation.title,
      recommendationCount: recommendations.length,
      totalGaps: gapAnalysis.missingSkills.length,
    });

    revalidatePath('/ignite/learn/recommendations');

    return {
      data: {
        recommendations,
        totalGaps: gapAnalysis.missingSkills.length,
        readinessScore: gapAnalysis.readinessScore,
        totalEstimatedHours: gapAnalysis.estimatedTrainingHours,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to generate recommendations', { error: errorMessage });
    return { error: `Failed to generate recommendations: ${errorMessage}` };
  }
}

// ============================================================================
// Learner Response Actions
// ============================================================================

/**
 * Accept or reject a recommendation as a learner
 */
export async function respondToRecommendation(
  recommendationId: string,
  accepted: boolean,
  feedback?: string,
): Promise<ActionResult<{ status: string; enrollmentId?: string }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = recommendationResponseSchema.safeParse({
      recommendationId,
      accepted,
      feedback,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid response data',
      };
    }

    const { tenantId, uid } = authUser;

    // Get recommendation
    const recRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('recommendations')
      .doc(recommendationId);

    const recDoc = await recRef.get();

    if (!recDoc.exists) {
      return { error: 'Recommendation not found' };
    }

    const recData = recDoc.data();

    // Verify ownership
    if (recData?.learnerId !== uid) {
      return { error: 'Forbidden: This recommendation belongs to another user' };
    }

    if (recData?.status !== 'pending') {
      return { error: `Recommendation already ${recData?.status}` };
    }

    if (!accepted) {
      // Learner rejected
      await recRef.update({
        status: 'rejected',
        respondedAt: FieldValue.serverTimestamp(),
        learnerFeedback: feedback || null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Recommendation rejected by learner', { recommendationId, learnerId: uid });

      revalidatePath('/ignite/learn/recommendations');
      return { data: { status: 'rejected' } };
    }

    // Learner accepted
    if (recData?.requiresApproval) {
      // Needs manager approval
      await recRef.update({
        status: 'pending_approval',
        respondedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Recommendation accepted, awaiting approval', { recommendationId, learnerId: uid });

      revalidatePath('/ignite/learn/recommendations');
      revalidatePath('/ignite/learners');

      return { data: { status: 'pending_approval' } };
    }

    // No approval needed - create enrollment directly
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc();

    const enrollmentData = {
      tenantId,
      learnerId: uid,
      courseId: recData.courseId,
      status: 'enrolled',
      source: 'recommendation',
      requiresApproval: false,
      progress: 0,
      recommendationId,
      requestedAt: FieldValue.serverTimestamp(),
      enrolledAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await enrollmentRef.set(enrollmentData);

    // Update recommendation
    await recRef.update({
      status: 'enrolled',
      respondedAt: FieldValue.serverTimestamp(),
      enrollmentId: enrollmentRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    log.info('Recommendation converted to enrollment', {
      recommendationId,
      enrollmentId: enrollmentRef.id,
      learnerId: uid,
    });

    revalidatePath('/ignite/learn/recommendations');
    revalidatePath('/ignite/learn');

    return { data: { status: 'enrolled', enrollmentId: enrollmentRef.id } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to respond to recommendation', { error: errorMessage });
    return { error: `Failed to respond: ${errorMessage}` };
  }
}

// ============================================================================
// Manager Approval Actions
// ============================================================================

/**
 * Approve or reject a recommendation as a manager
 */
export async function approveRecommendation(
  recommendationId: string,
  approved: boolean,
  reason?: string,
): Promise<ActionResult<{ status: string; enrollmentId?: string }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    // Validate input
    const validationResult = recommendationApprovalSchema.safeParse({
      recommendationId,
      approved,
      reason,
    });

    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid approval data',
      };
    }

    const { tenantId, uid, persona } = authUser;

    // RBAC: Only owners and managers can approve
    if (!['owner', 'manager'].includes(persona)) {
      return { error: 'Forbidden: You cannot approve recommendations' };
    }

    // Get recommendation
    const recRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('recommendations')
      .doc(recommendationId);

    const recDoc = await recRef.get();

    if (!recDoc.exists) {
      return { error: 'Recommendation not found' };
    }

    const recData = recDoc.data();

    if (recData?.status !== 'pending_approval') {
      return { error: `Recommendation is not pending approval. Status: ${recData?.status}` };
    }

    if (!approved) {
      if (!reason) {
        return { error: 'Rejection reason is required' };
      }

      await recRef.update({
        status: 'rejected',
        rejectedBy: uid,
        rejectedAt: FieldValue.serverTimestamp(),
        rejectionReason: reason,
        updatedAt: FieldValue.serverTimestamp(),
      });

      log.info('Recommendation rejected by manager', {
        recommendationId,
        rejectedBy: uid,
        reason,
      });

      revalidatePath('/ignite/learn/recommendations');
      revalidatePath('/ignite/learners');

      return { data: { status: 'rejected' } };
    }

    // Approved - create enrollment
    const enrollmentRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('enrollments')
      .doc();

    const enrollmentData = {
      tenantId,
      learnerId: recData.learnerId,
      courseId: recData.courseId,
      status: 'enrolled',
      source: 'recommendation',
      requiresApproval: false,
      progress: 0,
      recommendationId,
      approvedBy: uid,
      requestedAt: FieldValue.serverTimestamp(),
      enrolledAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await enrollmentRef.set(enrollmentData);

    // Update recommendation
    await recRef.update({
      status: 'enrolled',
      approvedBy: uid,
      approvedAt: FieldValue.serverTimestamp(),
      enrollmentId: enrollmentRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    log.info('Recommendation approved and enrolled', {
      recommendationId,
      enrollmentId: enrollmentRef.id,
      approvedBy: uid,
    });

    revalidatePath('/ignite/learn/recommendations');
    revalidatePath('/ignite/learn');
    revalidatePath('/ignite/learners');

    return { data: { status: 'enrolled', enrollmentId: enrollmentRef.id } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to approve recommendation', { error: errorMessage });
    return { error: `Failed to process approval: ${errorMessage}` };
  }
}

// ============================================================================
// Query Actions
// ============================================================================

/**
 * Get recommendations for the current user (learner view)
 */
export async function getMyRecommendations(): Promise<
  ActionResult<{ recommendations: RecommendationWithDetails[] }>
> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, uid } = authUser;

    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('recommendations')
      .where('learnerId', '==', uid)
      .where('status', 'in', ['pending', 'accepted', 'pending_approval'])
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const recommendations = snapshot.docs.map((doc) =>
      firestoreToRecommendation(doc.id, doc.data()),
    );

    // Enrich with course details
    const enrichedRecs: RecommendationWithDetails[] = [];
    for (const rec of recommendations) {
      const courseDoc = await adminDb
        .collection('tenants')
        .doc(tenantId)
        .collection('courses')
        .doc(rec.courseId)
        .get();

      if (courseDoc.exists) {
        const courseData = courseDoc.data();
        enrichedRecs.push({
          ...rec,
          courseName: courseData?.title,
          courseThumbnail: courseData?.thumbnailUrl,
          courseDescription: courseData?.shortDescription || courseData?.description,
          courseDuration: courseData?.durationMinutes,
        });
      } else {
        enrichedRecs.push(rec);
      }
    }

    return { data: { recommendations: enrichedRecs } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get my recommendations', { error: errorMessage });
    return { error: `Failed to get recommendations: ${errorMessage}` };
  }
}

/**
 * Get pending approval recommendations (manager view)
 */
export async function getPendingApprovalRecommendations(): Promise<
  ActionResult<{ recommendations: RecommendationWithDetails[]; total: number }>
> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, persona } = authUser;

    // RBAC: Only owners and managers can view pending approvals
    if (!['owner', 'manager'].includes(persona)) {
      return { error: 'Forbidden: You cannot view pending approvals' };
    }

    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('recommendations')
      .where('status', '==', 'pending_approval')
      .orderBy('respondedAt', 'asc')
      .limit(100)
      .get();

    const recommendations = snapshot.docs.map((doc) =>
      firestoreToRecommendation(doc.id, doc.data()),
    );

    // Enrich with course and learner details
    const enrichedRecs: RecommendationWithDetails[] = [];
    for (const rec of recommendations) {
      const [courseDoc, learnerDoc] = await Promise.all([
        adminDb.collection('tenants').doc(tenantId).collection('courses').doc(rec.courseId).get(),
        adminDb.collection('users').doc(rec.learnerId).get(),
      ]);

      const courseData = courseDoc.exists ? courseDoc.data() : undefined;
      const learnerData = learnerDoc.exists ? learnerDoc.data() : undefined;

      enrichedRecs.push({
        ...rec,
        courseName: courseData?.title,
        courseThumbnail: courseData?.thumbnailUrl,
        courseDescription: courseData?.shortDescription,
        courseDuration: courseData?.durationMinutes,
        learnerName: learnerData?.displayName || learnerData?.email?.split('@')[0],
        learnerEmail: learnerData?.email,
        learnerAvatar: learnerData?.photoURL,
      });
    }

    return { data: { recommendations: enrichedRecs, total: enrichedRecs.length } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get pending approval recommendations', { error: errorMessage });
    return { error: `Failed to get pending approvals: ${errorMessage}` };
  }
}

/**
 * Get recommendation statistics
 */
export async function getRecommendationStats(): Promise<ActionResult<RecommendationStats>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, persona } = authUser;

    // RBAC: Only non-learners can view stats
    if (persona === 'learner') {
      return { error: 'Forbidden: You cannot view recommendation statistics' };
    }

    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('recommendations')
      .get();

    let total = 0;
    let pending = 0;
    let accepted = 0;
    let rejected = 0;
    let pendingApproval = 0;
    let enrolled = 0;
    let expired = 0;
    let totalConfidence = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      total++;
      totalConfidence += data.confidence || 0;

      switch (data.status) {
        case 'pending':
          pending++;
          break;
        case 'accepted':
          accepted++;
          break;
        case 'rejected':
          rejected++;
          break;
        case 'pending_approval':
          pendingApproval++;
          break;
        case 'enrolled':
          enrolled++;
          break;
        case 'expired':
          expired++;
          break;
      }
    });

    const totalResponded = accepted + rejected + pendingApproval + enrolled;
    const stats: RecommendationStats = {
      total,
      pending,
      accepted,
      rejected,
      pendingApproval,
      enrolled,
      expired,
      averageConfidence: total > 0 ? Math.round((totalConfidence / total) * 100) / 100 : 0,
      acceptanceRate:
        totalResponded > 0
          ? Math.round(((accepted + pendingApproval + enrolled) / totalResponded) * 100)
          : 0,
      conversionRate: total > 0 ? Math.round((enrolled / total) * 100) : 0,
    };

    return { data: stats };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get recommendation stats', { error: errorMessage });
    return { error: `Failed to get statistics: ${errorMessage}` };
  }
}

/**
 * Dismiss/delete a recommendation
 */
export async function dismissRecommendation(
  recommendationId: string,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return { error: 'Unauthorized: No valid session' };
    }

    const { tenantId, uid, persona } = authUser;

    // Get recommendation
    const recRef = adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('recommendations')
      .doc(recommendationId);

    const recDoc = await recRef.get();

    if (!recDoc.exists) {
      return { error: 'Recommendation not found' };
    }

    const recData = recDoc.data();

    // RBAC: Learners can only dismiss their own pending recommendations
    const isOwner = recData?.learnerId === uid;
    const canManage = ['owner', 'manager'].includes(persona);

    if (!isOwner && !canManage) {
      return { error: 'Forbidden: You cannot dismiss this recommendation' };
    }

    // Only allow dismissing pending recommendations
    if (recData?.status !== 'pending') {
      return { error: `Cannot dismiss recommendation with status: ${recData?.status}` };
    }

    await recRef.update({
      status: 'expired',
      updatedAt: FieldValue.serverTimestamp(),
    });

    log.info('Recommendation dismissed', { recommendationId, dismissedBy: uid });

    revalidatePath('/ignite/learn/recommendations');

    return { data: { success: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to dismiss recommendation', { error: errorMessage });
    return { error: `Failed to dismiss: ${errorMessage}` };
  }
}
