/**
 * AI Decision Logging for EU AI Act Article 12 Compliance
 *
 * This module provides types and utilities for logging AI decisions
 * to meet EU AI Act record-keeping requirements for high-risk AI systems.
 *
 * @see docs/ai/compliance/audit-log-retention.md
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Types of AI decisions that require audit logging
 */
export type AIDecisionType =
  | 'mastery_assessment' // BKT mastery probability update
  | 'content_recommendation' // Next content suggestion
  | 'path_assignment' // Learning path modification
  | 'intervention_recommendation' // Support intervention
  | 'review_scheduling' // Spaced repetition scheduling
  | 'cognitive_load_assessment'; // Cognitive state detection

/**
 * Learner action taken in response to AI decision
 */
export type LearnerAction = 'accepted' | 'overridden' | 'ignored' | 'dismissed' | 'pending';

/**
 * EU AI Act Article 12 compliant decision log entry
 */
export interface AIDecisionLog {
  /** Unique identifier for this log entry */
  logId: string;

  /** When the decision was made */
  timestamp: Date;

  /** Version of the LXD360 system */
  systemVersion: string;

  /** Version/identifier of the model/algorithm used */
  modelVersion: string;

  /** Algorithm that produced this decision */
  algorithmUsed:
    | 'bkt'
    | 'sm2'
    | 'cognitive_load'
    | 'zpd_recommender'
    | 'intervention_rules'
    | 'gpai';

  /** Type of decision */
  decisionType: AIDecisionType;

  /** Pseudonymized user identifier (NOT raw user ID) */
  userId: string;

  /** Organization/tenant context */
  tenantId: string;

  /** Input features used for this decision (anonymized) */
  inputFeatures: AIDecisionInputFeatures;

  /** The decision output */
  outputDecision: AIDecisionOutput;

  /** Confidence score for this decision (0-1) */
  confidenceScore: number;

  /** Whether human oversight was invoked */
  humanOversightInvoked: boolean;

  /** What action the learner took (if applicable) */
  learnerAction?: LearnerAction;

  /** Session identifier for grouping related decisions */
  sessionId?: string;

  /** Related content/skill identifiers */
  contextIds?: {
    skillId?: string;
    contentId?: string;
    courseId?: string;
    lessonId?: string;
  };
}

/**
 * Anonymized input features for audit trail
 */
export interface AIDecisionInputFeatures {
  /** For mastery assessment */
  mastery?: {
    priorMastery: number;
    attemptCorrect: boolean;
    responseTimeMs: number;
    confidenceRating?: number;
    totalAttempts: number;
    streakCorrect: number;
    streakIncorrect: number;
  };

  /** For content recommendation */
  recommendation?: {
    availableContentCount: number;
    masteredSkillCount: number;
    developingSkillCount: number;
    reviewDueCount: number;
  };

  /** For intervention */
  intervention?: {
    triggerType: string;
    severity: string;
    consecutiveFailures?: number;
    masteryLevel?: string;
  };

  /** For cognitive load */
  cognitiveLoad?: {
    responseTimeRatio: number;
    errorRate: number;
    engagementScore: number;
  };
}

/**
 * Decision output for audit trail
 */
export interface AIDecisionOutput {
  /** For mastery assessment */
  mastery?: {
    newMastery: number;
    masteryChange: number;
    newLevel: string;
    guessDetected: boolean;
  };

  /** For content recommendation */
  recommendation?: {
    contentId: string;
    score: number;
    reason: string;
  };

  /** For intervention */
  intervention?: {
    type: string;
    severity: string;
    action: string;
    message: string;
  };

  /** For path assignment */
  pathAssignment?: {
    previousPath: string;
    newPath: string;
    reason: string;
  };

  /** For review scheduling */
  reviewSchedule?: {
    nextReviewDate: string;
    intervalDays: number;
    repetitions: number;
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate a unique log ID
 */
export function generateLogId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `aidec_${timestamp}_${random}`;
}

/**
 * Pseudonymize a user ID for GDPR/privacy compliance
 * Uses one-way hashing so original cannot be recovered from logs
 */
export async function pseudonymizeUserId(userId: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `pseu_${hashHex.substring(0, 16)}`;
}

/**
 * Create an AI decision log entry
 */
export function createAIDecisionLog(params: {
  decisionType: AIDecisionType;
  algorithmUsed: AIDecisionLog['algorithmUsed'];
  userId: string; // Should already be pseudonymized
  tenantId: string;
  inputFeatures: AIDecisionInputFeatures;
  outputDecision: AIDecisionOutput;
  confidenceScore: number;
  humanOversightInvoked?: boolean;
  sessionId?: string;
  contextIds?: AIDecisionLog['contextIds'];
}): AIDecisionLog {
  return {
    logId: generateLogId(),
    timestamp: new Date(),
    systemVersion: process.env.npm_package_version || '2.6.0',
    modelVersion: getModelVersion(params.algorithmUsed),
    algorithmUsed: params.algorithmUsed,
    decisionType: params.decisionType,
    userId: params.userId,
    tenantId: params.tenantId,
    inputFeatures: params.inputFeatures,
    outputDecision: params.outputDecision,
    confidenceScore: params.confidenceScore,
    humanOversightInvoked: params.humanOversightInvoked ?? false,
    sessionId: params.sessionId,
    contextIds: params.contextIds,
  };
}

/**
 * Get the model version for an algorithm
 */
function getModelVersion(algorithm: AIDecisionLog['algorithmUsed']): string {
  const versions: Record<AIDecisionLog['algorithmUsed'], string> = {
    bkt: 'bkt-1.0.0',
    sm2: 'sm2-1.0.0',
    cognitive_load: 'cogload-1.0.0',
    zpd_recommender: 'zpd-1.0.0',
    intervention_rules: 'intv-1.0.0',
    gpai: 'gpai-multi-1.0.0',
  };
  return versions[algorithm];
}

/**
 * Validate that a decision log meets EU AI Act requirements
 */
export function validateDecisionLog(log: AIDecisionLog): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!log.logId) errors.push('Missing logId');
  if (!log.timestamp) errors.push('Missing timestamp');
  if (!log.systemVersion) errors.push('Missing systemVersion');
  if (!log.modelVersion) errors.push('Missing modelVersion');
  if (!log.algorithmUsed) errors.push('Missing algorithmUsed');
  if (!log.decisionType) errors.push('Missing decisionType');
  if (!log.userId) errors.push('Missing userId');
  if (!log.tenantId) errors.push('Missing tenantId');
  if (log.confidenceScore < 0 || log.confidenceScore > 1) {
    errors.push('confidenceScore must be between 0 and 1');
  }

  // Check for raw user IDs (compliance violation)
  if (log.userId && !log.userId.startsWith('pseu_')) {
    errors.push('userId must be pseudonymized (should start with pseu_)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * EU AI Act mandated retention period for high-risk AI decision logs
 */
export const AI_DECISION_LOG_RETENTION_YEARS = 10;

/**
 * Fields that must be present for regulatory audit
 */
export const REQUIRED_AUDIT_FIELDS: (keyof AIDecisionLog)[] = [
  'logId',
  'timestamp',
  'systemVersion',
  'modelVersion',
  'algorithmUsed',
  'decisionType',
  'userId',
  'tenantId',
  'inputFeatures',
  'outputDecision',
  'confidenceScore',
  'humanOversightInvoked',
];
