/**
 * Glass Box AI - Explainable Recommendations
 *
 * Generates human-readable explanations for AI recommendations.
 * Required for EU AI Act compliance and learner transparency.
 *
 * The "Glass Box" approach ensures that all AI-driven decisions are:
 * 1. Transparent - Users can see why recommendations are made
 * 2. Auditable - Decisions are logged with full context
 * 3. Overridable - Users can adjust or skip recommendations
 */

import type { KnowledgeState } from '@/lib/adaptive-learning/bkt';
import type { SM2Item } from '@/lib/adaptive-learning/sm2';
import type { GapAnalysisResult, SkillGap } from '@/lib/onet/types';

// =============================================================================
// TYPES
// =============================================================================

/** Types of recommendations the system can make */
export type RecommendationType =
  | 'skill_practice'
  | 'review'
  | 'gap_analysis'
  | 'path_recommendation'
  | 'intervention'
  | 'content_suggestion';

/** Impact level for evidence factors */
export type EvidenceImpact = 'high' | 'medium' | 'low';

/**
 * A single piece of evidence contributing to a recommendation
 */
export interface EvidenceFactor {
  /** What this factor measures */
  factor: string;
  /** Current value (human-readable) */
  value: string;
  /** How much this factor influences the recommendation */
  impact: EvidenceImpact;
}

/**
 * User override options for a recommendation
 */
export interface OverrideOptions {
  /** Can the user skip this recommendation? */
  canSkip: boolean;
  /** Can the user defer to later? */
  canDefer: boolean;
  /** Can the user adjust difficulty? */
  canAdjustDifficulty: boolean;
  /** Alternative content/actions available */
  alternatives: Array<{ id: string; title: string }>;
}

/**
 * Audit information for compliance and debugging
 */
export interface AuditInfo {
  /** Version of the model/algorithm used */
  modelVersion: string;
  /** When this recommendation was generated */
  timestamp: Date;
  /** Confidence level (0-1) in the recommendation */
  confidence: number;
}

/**
 * Complete Glass Box explanation for a recommendation
 */
export interface GlassBoxExplanation {
  /** Unique identifier for this explanation */
  id: string;
  /** Type of recommendation */
  type: RecommendationType;
  /** The recommendation itself */
  recommendation: {
    itemId: string;
    itemTitle: string;
    action: string;
  };
  /** Human-readable rationale */
  rationale: {
    /** Primary reason for the recommendation */
    primary: string;
    /** Supporting reasons */
    supporting: string[];
  };
  /** Evidence factors that influenced this recommendation */
  evidence: EvidenceFactor[];
  /** User override options */
  overrides: OverrideOptions;
  /** Audit trail information */
  audit: AuditInfo;
}

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generate a unique explanation ID
 */
function generateExplanationId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// =============================================================================
// SKILL RECOMMENDATION EXPLANATIONS
// =============================================================================

/**
 * Generate explanation for a skill practice recommendation
 *
 * @param skill - The skill being recommended
 * @param bktState - Current BKT knowledge state
 * @param content - The recommended content
 * @returns Glass Box explanation
 */
export function explainSkillRecommendation(
  skill: { id: string; name: string },
  bktState: KnowledgeState,
  content: { id: string; title: string },
): GlassBoxExplanation {
  const masteryPercent = Math.round(bktState.masteryProbability * 100);
  const needsPractice = masteryPercent < 95;

  const evidence: EvidenceFactor[] = [
    {
      factor: 'Mastery level',
      value: `${masteryPercent}%`,
      impact: masteryPercent < 70 ? 'high' : 'medium',
    },
    {
      factor: 'Practice count',
      value: `${bktState.totalAttempts}`,
      impact: bktState.totalAttempts < 5 ? 'high' : 'low',
    },
    {
      factor: 'Streak',
      value: `${bktState.streakCorrect}`,
      impact: bktState.streakCorrect === 0 ? 'medium' : 'low',
    },
  ];

  // Add response time factor if available
  if (bktState.avgResponseTimeMs !== null) {
    evidence.push({
      factor: 'Avg response time',
      value: `${Math.round(bktState.avgResponseTimeMs / 1000)}s`,
      impact: 'low',
    });
  }

  return {
    id: generateExplanationId(),
    type: 'skill_practice',
    recommendation: {
      itemId: content.id,
      itemTitle: content.title,
      action: needsPractice ? 'Practice this skill' : 'Review for retention',
    },
    rationale: {
      primary: needsPractice
        ? `Your mastery of "${skill.name}" is at ${masteryPercent}%. More practice will solidify this skill.`
        : `You've mastered "${skill.name}"! This review maintains your knowledge.`,
      supporting: [
        `Based on ${bktState.totalAttempts} practice attempts`,
        bktState.streakCorrect > 0
          ? `Current streak: ${bktState.streakCorrect} correct`
          : 'Building consistency improves retention',
      ],
    },
    evidence,
    overrides: {
      canSkip: true,
      canDefer: true,
      canAdjustDifficulty: true,
      alternatives: [],
    },
    audit: {
      modelVersion: 'bkt-v1.0',
      timestamp: new Date(),
      confidence: 0.85,
    },
  };
}

// =============================================================================
// REVIEW RECOMMENDATION EXPLANATIONS
// =============================================================================

/**
 * Generate explanation for a spaced repetition review
 *
 * @param item - The SM-2 item due for review
 * @returns Glass Box explanation
 */
export function explainReviewRecommendation(
  item: SM2Item & { title: string },
): GlassBoxExplanation {
  const now = new Date();
  const isOverdue = item.nextReview < now;
  const daysOverdue = isOverdue
    ? Math.floor((now.getTime() - item.nextReview.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const evidence: EvidenceFactor[] = [
    {
      factor: 'Status',
      value: isOverdue ? `${daysOverdue} days overdue` : 'On schedule',
      impact: isOverdue ? 'high' : 'low',
    },
    {
      factor: 'Repetitions',
      value: `${item.repetitions}`,
      impact: item.repetitions < 3 ? 'medium' : 'low',
    },
    {
      factor: 'Interval',
      value: `${item.interval} days`,
      impact: 'low',
    },
    {
      factor: 'Easiness',
      value: item.easinessFactor.toFixed(2),
      impact: item.easinessFactor < 2.0 ? 'medium' : 'low',
    },
  ];

  return {
    id: generateExplanationId(),
    type: 'review',
    recommendation: {
      itemId: item.itemId,
      itemTitle: item.title,
      action: isOverdue ? `Review now (${daysOverdue} days overdue)` : 'Scheduled review',
    },
    rationale: {
      primary: isOverdue
        ? 'This item is overdue. Reviewing now prevents forgetting.'
        : 'Scheduled review optimizes long-term retention.',
      supporting: [
        `Review interval: ${item.interval} days`,
        `Memory strength: ${item.easinessFactor.toFixed(2)}`,
      ],
    },
    evidence,
    overrides: {
      canSkip: false,
      canDefer: true,
      canAdjustDifficulty: false,
      alternatives: [],
    },
    audit: {
      modelVersion: 'sm2-v1.0',
      timestamp: new Date(),
      confidence: 0.9,
    },
  };
}

// =============================================================================
// GAP ANALYSIS EXPLANATIONS
// =============================================================================

/**
 * Generate explanation for a gap analysis result
 *
 * @param result - The gap analysis result
 * @returns Glass Box explanation
 */
export function explainGapAnalysis(result: GapAnalysisResult): GlassBoxExplanation {
  const topMissing = result.missingSkills.slice(0, 3);
  const criticalCount = result.missingSkills.filter((s) => s.priority === 'critical').length;

  const evidence: EvidenceFactor[] = [
    {
      factor: 'Readiness score',
      value: `${result.readinessScore}%`,
      impact: result.readinessScore < 50 ? 'high' : 'medium',
    },
    {
      factor: 'Missing skills',
      value: `${result.missingSkills.length}`,
      impact: result.missingSkills.length > 5 ? 'high' : 'medium',
    },
    {
      factor: 'Critical gaps',
      value: `${criticalCount}`,
      impact: criticalCount > 0 ? 'high' : 'low',
    },
    {
      factor: 'Transferable skills',
      value: `${result.transferableSkills.length}`,
      impact: result.transferableSkills.length > 0 ? 'medium' : 'low',
    },
    {
      factor: 'Training time',
      value: `~${result.estimatedTrainingHours} hours`,
      impact: 'medium',
    },
  ];

  const supporting: string[] = [
    `You already have ${result.masteredSkills.length} of the required skills`,
  ];

  if (result.transferableSkills.length > 0) {
    supporting.push(
      `${result.transferableSkills.length} skills can be transferred from your existing knowledge`,
    );
  }

  if (topMissing.length > 0) {
    supporting.push(`Top priority: ${topMissing.map((s) => s.skill.name).join(', ')}`);
  }

  return {
    id: generateExplanationId(),
    type: 'gap_analysis',
    recommendation: {
      itemId: result.targetOccupation.onetSocCode,
      itemTitle: result.targetOccupation.title,
      action:
        result.readinessScore >= 80
          ? 'You are ready for this role!'
          : 'Follow the recommended learning path',
    },
    rationale: {
      primary:
        result.readinessScore >= 80
          ? `You have ${result.readinessScore}% of the skills needed for ${result.targetOccupation.title}.`
          : `You need to develop ${result.missingSkills.length} skills to be ready for ${result.targetOccupation.title}.`,
      supporting,
    },
    evidence,
    overrides: {
      canSkip: true,
      canDefer: true,
      canAdjustDifficulty: false,
      alternatives: [],
    },
    audit: {
      modelVersion: 'gap-engine-v1.0',
      timestamp: new Date(),
      confidence: 0.8,
    },
  };
}

// =============================================================================
// PATH RECOMMENDATION EXPLANATIONS
// =============================================================================

/**
 * Generate explanation for a learning path recommendation
 *
 * @param gaps - The skill gaps to address
 * @param pathTitle - Title of the recommended path
 * @returns Glass Box explanation
 */
export function explainPathRecommendation(
  gaps: SkillGap[],
  pathTitle: string,
): GlassBoxExplanation {
  const totalHours = gaps.reduce((sum, g) => sum + g.estimatedHours, 0);
  const criticalGaps = gaps.filter((g) => g.priority === 'critical');
  const highGaps = gaps.filter((g) => g.priority === 'high');

  const evidence: EvidenceFactor[] = [
    {
      factor: 'Skills to develop',
      value: `${gaps.length}`,
      impact: gaps.length > 5 ? 'high' : 'medium',
    },
    {
      factor: 'Estimated time',
      value: `${totalHours} hours`,
      impact: totalHours > 50 ? 'high' : 'medium',
    },
    {
      factor: 'Critical skills',
      value: `${criticalGaps.length}`,
      impact: criticalGaps.length > 0 ? 'high' : 'low',
    },
    {
      factor: 'High priority skills',
      value: `${highGaps.length}`,
      impact: highGaps.length > 2 ? 'medium' : 'low',
    },
  ];

  return {
    id: generateExplanationId(),
    type: 'path_recommendation',
    recommendation: {
      itemId: `path_${Date.now()}`,
      itemTitle: pathTitle,
      action: 'Start this learning path',
    },
    rationale: {
      primary: `This path addresses ${gaps.length} skill gaps in approximately ${totalHours} hours of study.`,
      supporting: [
        `Skills are ordered by priority and prerequisite dependencies`,
        criticalGaps.length > 0
          ? `Includes ${criticalGaps.length} critical skills that should be addressed first`
          : 'No critical gaps - you can proceed at your own pace',
      ],
    },
    evidence,
    overrides: {
      canSkip: true,
      canDefer: true,
      canAdjustDifficulty: true,
      alternatives: [],
    },
    audit: {
      modelVersion: 'path-generator-v1.0',
      timestamp: new Date(),
      confidence: 0.75,
    },
  };
}

// =============================================================================
// INTERVENTION EXPLANATIONS
// =============================================================================

/**
 * Generate explanation for an intervention recommendation
 *
 * @param reason - Why the intervention is needed
 * @param action - The recommended action
 * @param severity - How urgent this intervention is
 * @returns Glass Box explanation
 */
export function explainIntervention(
  reason: string,
  action: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
): GlassBoxExplanation {
  const severityMessages: Record<typeof severity, string> = {
    critical: 'Immediate attention required',
    high: 'Should be addressed soon',
    medium: 'Consider addressing when convenient',
    low: 'Optional improvement opportunity',
  };

  return {
    id: generateExplanationId(),
    type: 'intervention',
    recommendation: {
      itemId: `intervention_${Date.now()}`,
      itemTitle: 'Learning Support',
      action,
    },
    rationale: {
      primary: reason,
      supporting: [severityMessages[severity]],
    },
    evidence: [
      {
        factor: 'Severity',
        value: severity,
        impact: severity === 'critical' || severity === 'high' ? 'high' : 'medium',
      },
    ],
    overrides: {
      canSkip: severity !== 'critical',
      canDefer: severity !== 'critical',
      canAdjustDifficulty: false,
      alternatives: [],
    },
    audit: {
      modelVersion: 'intervention-v1.0',
      timestamp: new Date(),
      confidence: 0.9,
    },
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format an explanation for display in UI
 *
 * @param explanation - The Glass Box explanation
 * @returns Formatted strings for display
 */
export function formatExplanationForUI(explanation: GlassBoxExplanation): {
  title: string;
  subtitle: string;
  body: string;
  factors: Array<{ label: string; value: string; highlighted: boolean }>;
} {
  return {
    title: explanation.recommendation.itemTitle,
    subtitle: explanation.recommendation.action,
    body: explanation.rationale.primary,
    factors: explanation.evidence.map((e) => ({
      label: e.factor,
      value: e.value,
      highlighted: e.impact === 'high',
    })),
  };
}

/**
 * Convert explanation to audit log format
 *
 * @param explanation - The Glass Box explanation
 * @param userId - The user who received this recommendation
 * @returns Audit log entry
 */
export function toAuditLog(
  explanation: GlassBoxExplanation,
  userId: string,
): {
  timestamp: string;
  userId: string;
  explanationId: string;
  type: RecommendationType;
  recommendation: string;
  rationale: string;
  confidence: number;
  modelVersion: string;
} {
  return {
    timestamp: explanation.audit.timestamp.toISOString(),
    userId,
    explanationId: explanation.id,
    type: explanation.type,
    recommendation: `${explanation.recommendation.action}: ${explanation.recommendation.itemTitle}`,
    rationale: explanation.rationale.primary,
    confidence: explanation.audit.confidence,
    modelVersion: explanation.audit.modelVersion,
  };
}

/**
 * Check if an explanation allows skipping
 */
export function canSkip(explanation: GlassBoxExplanation): boolean {
  return explanation.overrides.canSkip;
}

/**
 * Check if an explanation allows deferring
 */
export function canDefer(explanation: GlassBoxExplanation): boolean {
  return explanation.overrides.canDefer;
}
