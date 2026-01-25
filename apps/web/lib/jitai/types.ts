/**
 * JITAI — Just-In-Time Adaptive Intervention Types
 *
 * Based on Artemis vision: behavioral intelligence that triggers
 * contextual interventions during learning.
 */

// =============================================================================
// BEHAVIORAL SIGNALS
// =============================================================================

export interface BehavioralSignal {
  type: BehavioralSignalType;
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export type BehavioralSignalType =
  | 'scroll_velocity'
  | 'time_on_content'
  | 'click_through_rate'
  | 'hesitation_latency'
  | 'answer_changes'
  | 'hint_requests'
  | 'navigation_depth';

// =============================================================================
// INTERVENTION TYPES
// =============================================================================

export type InterventionType =
  | 'speed_bump' // "Whoa, let's recap"
  | 'micro_bridge' // Gap-filling mini-module
  | 'confidence_check' // Self-assessment prompt
  | 'encouragement' // Positive reinforcement
  | 'modality_switch' // Change content format
  | 'break_suggestion' // Cognitive load too high
  | 'retrieval_probe'; // Spaced practice prompt

export interface Intervention {
  id: string;
  type: InterventionType;
  trigger: InterventionTrigger;
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Content
  message: string;
  actionLabel?: string;

  // Targeting
  targetContentId?: string;
  targetSkillIds?: string[];

  // Timing
  delayMs?: number;
  expiresAt?: Date;

  // Tracking
  createdAt: Date;
  dismissedAt?: Date;
  acceptedAt?: Date;
}

export interface InterventionTrigger {
  signal: BehavioralSignalType;
  condition: 'above' | 'below' | 'equals' | 'between';
  threshold: number | [number, number];
  windowMs: number; // Time window for signal aggregation
}

// =============================================================================
// DOOM-SCROLL DETECTION
// =============================================================================

export interface DoomScrollMetrics {
  /** Average time spent per content block (ms) */
  avgTimePerBlock: number;
  /** Expected time based on content length */
  expectedTimePerBlock: number;
  /** Ratio of actual to expected (< 0.3 = doom scrolling) */
  engagementRatio: number;
  /** Number of blocks viewed in current session */
  blocksViewed: number;
  /** Blocks that were viewed too quickly */
  skippedBlocks: number;
  /** Whether doom-scroll behavior is detected */
  isSkimming: boolean;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'interactive' | 'assessment';
  /** Estimated read/watch time in seconds */
  estimatedDuration: number;
  /** Word count for text blocks */
  wordCount?: number;
  /** Actual time spent (tracked) */
  actualTimeSpent?: number;
}

// =============================================================================
// FALSE CONFIDENCE
// =============================================================================

export interface FalseConfidenceSignal {
  learnerId: string;
  skillId: string;

  /** Learner's self-reported confidence (0-1) */
  selfReportedConfidence: number;
  /** BKT mastery estimate (0-1) */
  bktMastery: number;
  /** Hesitation-based confidence penalty (0-0.3) */
  hesitationPenalty: number;

  /** Divergence score: self - (bkt - penalty) */
  divergence: number;

  /** Whether false confidence is detected */
  isFalseConfidence: boolean;

  /** Severity of the discrepancy */
  severity: 'mild' | 'moderate' | 'severe';
}

// =============================================================================
// MICRO-BRIDGE
// =============================================================================

export interface MicroBridge {
  id: string;
  learnerId: string;

  /** Skills this bridge addresses */
  targetSkills: string[];

  /** Content blocks assembled for the bridge */
  contentBlocks: MicroBridgeBlock[];

  /** Estimated duration in seconds */
  estimatedDuration: number;

  /** Assessment to verify gap closure */
  verificationQuiz?: {
    questionIds: string[];
    requiredScore: number;
  };

  /** Status */
  status: 'generated' | 'in_progress' | 'completed' | 'skipped';

  createdAt: Date;
  completedAt?: Date;
}

export interface MicroBridgeBlock {
  id: string;
  skillId: string;
  contentType: 'explanation' | 'example' | 'practice' | 'summary';
  content: string; // Markdown or HTML
  duration: number; // seconds
  order: number;
}

// =============================================================================
// JITAI SKILL GAP (Simplified for Micro-Bridge)
// =============================================================================

/**
 * Simplified skill gap for JITAI micro-bridge generation.
 * Different from O*NET SkillGap which uses level-based requirements.
 */
export interface JITAISkillGap {
  skillId: string;
  skillName: string;
  /** Current mastery from BKT (0-1) */
  currentMastery: number;
  /** Target mastery threshold (0-1) */
  targetMastery: number;
  /** Gap: target - current */
  gap: number;
  /** Priority for addressing */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Estimated seconds to close gap */
  estimatedTimeToClose: number;
}
