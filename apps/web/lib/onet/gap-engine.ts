/**
 * Gap Engine - Skill Gap Analysis
 *
 * Compares user mastery against O*NET role requirements
 * to generate personalized learning paths.
 */

import { logger } from '@/lib/logger';

import { getSkillById } from './seed-data';
import type {
  GapAnalysisResult,
  ONetOccupation,
  ONetSkill,
  SkillGap,
  SkillGapPriority,
  TransferableSkill,
  UserSkillMastery,
} from './types';

const log = logger.scope('GapEngine');

// =============================================================================
// CONSTANTS
// =============================================================================

/** Mastery threshold to consider a skill "acquired" (80%) */
const MASTERY_THRESHOLD = 0.8;

/** Similarity threshold for transferable skills (70%) */
const TRANSFERABILITY_THRESHOLD = 0.7;

/** Rough estimate of hours per skill level */
const HOURS_PER_SKILL_LEVEL = 10;

// =============================================================================
// CORE GAP ANALYSIS
// =============================================================================

/**
 * Analyze skill gaps between user mastery and target occupation requirements
 *
 * @param learnerId - The learner's user ID
 * @param targetOccupation - The target occupation to analyze against
 * @param userMasteries - User's current skill mastery scores
 * @param skillEmbeddings - Optional map of skill embeddings for transferability
 * @returns Complete gap analysis result
 */
export function analyzeGap(
  learnerId: string,
  targetOccupation: ONetOccupation,
  userMasteries: UserSkillMastery[],
  skillEmbeddings?: Map<string, number[]>,
): GapAnalysisResult {
  log.info('Analyzing skill gap', {
    learnerId,
    targetRole: targetOccupation.title,
    userSkillCount: userMasteries.length,
  });

  const masteryMap = new Map(userMasteries.map((m) => [m.skillId, m]));

  const missingSkills: SkillGap[] = [];
  const transferableSkills: TransferableSkill[] = [];
  const masteredSkills: ONetSkill[] = [];

  for (const requirement of targetOccupation.requiredSkills) {
    const skill = getSkillById(requirement.skillId);
    if (!skill) continue;

    const userMastery = masteryMap.get(requirement.skillId);
    const currentLevel = userMastery ? masteryToLevel(userMastery.masteryScore) : 0;

    // Check if user has sufficient mastery (80% of required level)
    if (currentLevel >= requirement.level * 0.8) {
      // User has this skill
      masteredSkills.push(skill);
    } else if (skillEmbeddings) {
      // Check for transferable skills
      const transferable = findTransferableSkill(
        requirement.skillId,
        userMasteries,
        skillEmbeddings,
      );
      if (transferable) {
        transferableSkills.push(transferable);
      } else {
        // Missing skill
        missingSkills.push(createSkillGap(skill, requirement, currentLevel));
      }
    } else {
      // No embeddings, just mark as missing
      missingSkills.push(createSkillGap(skill, requirement, currentLevel));
    }
  }

  // Sort missing skills by priority
  missingSkills.sort((a, b) => {
    const priorityOrder: Record<SkillGapPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Calculate overall readiness
  const totalRequired = targetOccupation.requiredSkills.length;
  const mastered = masteredSkills.length;
  const transferable = transferableSkills.length;
  const readinessScore = Math.round(((mastered + transferable * 0.5) / totalRequired) * 100);

  // Estimate training hours
  const estimatedTrainingHours =
    missingSkills.reduce((sum, gap) => sum + gap.estimatedHours, 0) +
    transferableSkills.reduce((sum, t) => sum + t.transferEffort * HOURS_PER_SKILL_LEVEL * 2, 0);

  // Generate recommended path (skills in order of priority)
  const recommendedPath = missingSkills.map((g) => g.skill.onetElementId);

  const result: GapAnalysisResult = {
    targetOccupation,
    learnerId,
    analyzedAt: new Date(),
    readinessScore,
    missingSkills,
    transferableSkills,
    masteredSkills,
    estimatedTrainingHours: Math.round(estimatedTrainingHours),
    recommendedPath,
  };

  log.info('Gap analysis complete', {
    learnerId,
    readinessScore,
    missingCount: missingSkills.length,
    transferableCount: transferableSkills.length,
    masteredCount: masteredSkills.length,
  });

  return result;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert 0-1 mastery score to 0-7 level scale
 */
function masteryToLevel(mastery: number): number {
  return Math.round(mastery * 7);
}

/**
 * Create a skill gap object from requirement and current level
 */
function createSkillGap(
  skill: ONetSkill,
  requirement: { importance: number; level: number },
  currentLevel: number,
): SkillGap {
  const gap = requirement.level - currentLevel;

  let priority: SkillGapPriority;
  if (requirement.importance >= 5 && gap >= 3) {
    priority = 'critical';
  } else if (requirement.importance >= 4 || gap >= 4) {
    priority = 'high';
  } else if (requirement.importance >= 3 || gap >= 2) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    skill,
    requiredLevel: requirement.level,
    currentLevel,
    gap,
    priority,
    estimatedHours: gap * HOURS_PER_SKILL_LEVEL,
  };
}

/**
 * Find a transferable skill from user's existing skills
 */
function findTransferableSkill(
  targetSkillId: string,
  userMasteries: UserSkillMastery[],
  embeddings: Map<string, number[]>,
): TransferableSkill | null {
  const targetEmbedding = embeddings.get(targetSkillId);
  if (!targetEmbedding) return null;

  const targetSkill = getSkillById(targetSkillId);
  if (!targetSkill) return null;

  let bestMatch: TransferableSkill | null = null;
  let bestSimilarity = 0;

  for (const mastery of userMasteries) {
    if (mastery.masteryScore < MASTERY_THRESHOLD) continue;

    const userEmbedding = embeddings.get(mastery.skillId);
    if (!userEmbedding) continue;

    const similarity = cosineSimilarity(userEmbedding, targetEmbedding);

    if (similarity >= TRANSFERABILITY_THRESHOLD && similarity > bestSimilarity) {
      const existingSkill = getSkillById(mastery.skillId);
      if (existingSkill) {
        bestSimilarity = similarity;
        bestMatch = {
          existingSkill,
          targetSkill,
          similarity,
          transferEffort: 1 - similarity,
          explanation: `Your ${existingSkill.name} skills are ${Math.round(similarity * 100)}% similar to ${targetSkill.name}. With focused practice, you can transfer this knowledge.`,
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// =============================================================================
// QUICK ACCESS FUNCTIONS
// =============================================================================

/**
 * Get a quick readiness check without full analysis
 *
 * @param targetOccupation - The target occupation
 * @param userMasteries - User's current skill mastery scores
 * @returns Quick readiness assessment
 */
export function quickReadinessCheck(
  targetOccupation: ONetOccupation,
  userMasteries: UserSkillMastery[],
): { ready: boolean; score: number; missingCount: number } {
  const masteryMap = new Map(userMasteries.map((m) => [m.skillId, m.masteryScore]));

  let matchedSkills = 0;
  for (const req of targetOccupation.requiredSkills) {
    const mastery = masteryMap.get(req.skillId) ?? 0;
    if (masteryToLevel(mastery) >= req.level * 0.8) {
      matchedSkills++;
    }
  }

  const score = Math.round((matchedSkills / targetOccupation.requiredSkills.length) * 100);

  return {
    ready: score >= 80,
    score,
    missingCount: targetOccupation.requiredSkills.length - matchedSkills,
  };
}

/**
 * Estimate time to reach role readiness
 *
 * @param gapAnalysis - The gap analysis result
 * @param hoursPerWeek - Estimated study hours per week
 * @returns Estimated weeks to readiness
 */
export function estimateTimeToReadiness(
  gapAnalysis: GapAnalysisResult,
  hoursPerWeek: number = 10,
): { weeks: number; months: number } {
  const weeks = Math.ceil(gapAnalysis.estimatedTrainingHours / hoursPerWeek);
  const months = Math.round(weeks / 4.33);
  return { weeks, months };
}

/**
 * Get priority-sorted learning recommendations
 *
 * @param gapAnalysis - The gap analysis result
 * @param maxItems - Maximum number of items to return
 * @returns Prioritized skill recommendations
 */
export function getTopRecommendations(
  gapAnalysis: GapAnalysisResult,
  maxItems: number = 5,
): Array<{
  skill: ONetSkill;
  priority: SkillGapPriority;
  estimatedHours: number;
  reason: string;
}> {
  return gapAnalysis.missingSkills.slice(0, maxItems).map((gap) => ({
    skill: gap.skill,
    priority: gap.priority,
    estimatedHours: gap.estimatedHours,
    reason: getRecommendationReason(gap),
  }));
}

/**
 * Generate a human-readable reason for a skill recommendation
 */
function getRecommendationReason(gap: SkillGap): string {
  const priorityReasons: Record<SkillGapPriority, string> = {
    critical: `${gap.skill.name} is a critical skill for this role with a significant gap to close.`,
    high: `${gap.skill.name} is highly important for success in this role.`,
    medium: `Developing ${gap.skill.name} will strengthen your qualifications.`,
    low: `${gap.skill.name} would be a nice addition to your skill set.`,
  };

  return priorityReasons[gap.priority];
}

// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================

/**
 * Calculate skill coverage across multiple occupations
 *
 * @param userMasteries - User's current skill mastery scores
 * @param occupations - List of occupations to check
 * @returns Coverage score for each occupation
 */
export function calculateMultiOccupationCoverage(
  userMasteries: UserSkillMastery[],
  occupations: ONetOccupation[],
): Array<{ occupation: ONetOccupation; coverage: number; missingCount: number }> {
  return occupations
    .map((occupation) => {
      const check = quickReadinessCheck(occupation, userMasteries);
      return {
        occupation,
        coverage: check.score,
        missingCount: check.missingCount,
      };
    })
    .sort((a, b) => b.coverage - a.coverage);
}

/**
 * Find the most impactful skills to develop
 * Skills that appear in multiple target occupations
 *
 * @param occupations - Target occupations
 * @param userMasteries - User's current masteries
 * @returns Skills sorted by impact (appearing in most occupations)
 */
export function findHighImpactSkills(
  occupations: ONetOccupation[],
  userMasteries: UserSkillMastery[],
): Array<{ skill: ONetSkill; occurrenceCount: number; occupations: string[] }> {
  const masteryMap = new Map(userMasteries.map((m) => [m.skillId, m.masteryScore]));

  // Count skill occurrences across occupations
  const skillOccurrences = new Map<string, { count: number; occupations: string[] }>();

  for (const occupation of occupations) {
    for (const req of occupation.requiredSkills) {
      const mastery = masteryMap.get(req.skillId) ?? 0;
      // Only count if user doesn't already have the skill
      if (masteryToLevel(mastery) < req.level * 0.8) {
        const existing = skillOccurrences.get(req.skillId) ?? {
          count: 0,
          occupations: [],
        };
        existing.count++;
        existing.occupations.push(occupation.title);
        skillOccurrences.set(req.skillId, existing);
      }
    }
  }

  // Convert to sorted array
  const results: Array<{
    skill: ONetSkill;
    occurrenceCount: number;
    occupations: string[];
  }> = [];

  for (const [skillId, data] of skillOccurrences) {
    const skill = getSkillById(skillId);
    if (skill) {
      results.push({
        skill,
        occurrenceCount: data.count,
        occupations: data.occupations,
      });
    }
  }

  return results.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

// =============================================================================
// VECTOR UTILITIES (for use with Vertex AI embeddings)
// =============================================================================

/**
 * Build embedding map from skills (requires Vertex AI)
 * This is a placeholder - actual implementation uses vertexAI.generateEmbeddings
 *
 * @param skills - Skills to embed
 * @returns Map of skill ID to embedding
 */
export async function buildSkillEmbeddingMap(skills: ONetSkill[]): Promise<Map<string, number[]>> {
  // This would call Vertex AI in production
  // For now, return empty map
  log.debug('buildSkillEmbeddingMap called', { skillCount: skills.length });
  return new Map(skills.map((s) => [s.onetElementId, []]));
}

/**
 * Pre-built embeddings cache for cold-start
 * In production, this would be populated from Firestore or GCS
 */
const EMBEDDING_CACHE: Map<string, number[]> = new Map();

/**
 * Get cached embedding for a skill
 */
export function getCachedEmbedding(skillId: string): number[] | undefined {
  return EMBEDDING_CACHE.get(skillId);
}

/**
 * Set cached embedding for a skill
 */
export function setCachedEmbedding(skillId: string, embedding: number[]): void {
  EMBEDDING_CACHE.set(skillId, embedding);
}

/**
 * Export cosine similarity for external use
 */
export { cosineSimilarity };
