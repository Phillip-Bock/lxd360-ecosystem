/**
 * SM-2 Spaced Repetition Algorithm
 *
 * SuperMemo 2 implementation for optimal review scheduling.
 * Can be used standalone or integrated with BKT for mastery-aware scheduling.
 *
 * @see https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

import { logger } from '@/lib/logger';

const log = logger.scope('SM2');

// =============================================================================
// TYPES
// =============================================================================

/**
 * SM-2 item representing a learnable unit
 */
export interface SM2Item {
  /** Unique identifier for the item */
  itemId: string;
  /** Learner ID */
  learnerId: string;
  /** Easiness factor (minimum 1.3, default 2.5) */
  easinessFactor: number;
  /** Current interval in days */
  interval: number;
  /** Number of successful repetitions */
  repetitions: number;
  /** Next scheduled review date */
  nextReview: Date;
  /** Last review date */
  lastReview: Date | null;
}

/**
 * SM-2 quality response (0-5 scale)
 * 5 - Perfect response, no hesitation
 * 4 - Correct response after hesitation
 * 3 - Correct response with difficulty
 * 2 - Incorrect response, but close
 * 1 - Incorrect response, remembered after seeing answer
 * 0 - Complete blackout
 */
export type SM2Response = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Human-readable response descriptors
 */
export type SM2ResponseDescriptor =
  | 'perfect'
  | 'good'
  | 'hesitant'
  | 'difficult'
  | 'wrong'
  | 'blackout';

/**
 * Extended SM-2 item with optional metadata
 */
export interface SM2ItemWithMeta extends SM2Item {
  /** Item title for display */
  title?: string;
  /** Associated skill ID */
  skillId?: string;
  /** Priority override (higher = more urgent) */
  priorityBoost?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Minimum easiness factor (prevents items from becoming too hard) */
const MIN_EF = 1.3;

/** Default easiness factor for new items */
const DEFAULT_EF = 2.5;

/** Maximum reasonable interval (2 years) */
const MAX_INTERVAL_DAYS = 730;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Create a new SM-2 item with default parameters
 */
export function createSM2Item(itemId: string, learnerId: string): SM2Item {
  return {
    itemId,
    learnerId,
    easinessFactor: DEFAULT_EF,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
    lastReview: null,
  };
}

/**
 * Update SM-2 item based on response quality
 *
 * @param item - Current SM-2 item state
 * @param quality - Response quality (0-5)
 * @returns Updated SM-2 item
 */
export function updateSM2(item: SM2Item, quality: SM2Response): SM2Item {
  // Clamp quality to valid range
  const q = Math.max(0, Math.min(5, Math.round(quality))) as SM2Response;

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const newEF = Math.max(MIN_EF, item.easinessFactor + efDelta);

  let newInterval: number;
  let newRepetitions: number;

  if (q < 3) {
    // Incorrect response - reset to beginning
    newRepetitions = 0;
    newInterval = 1;
    log.debug('SM2 reset', { itemId: item.itemId, quality: q });
  } else {
    // Correct response - advance schedule
    newRepetitions = item.repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(item.interval * newEF);
    }

    // Cap at maximum interval
    newInterval = Math.min(newInterval, MAX_INTERVAL_DAYS);

    log.debug('SM2 advance', {
      itemId: item.itemId,
      quality: q,
      interval: newInterval,
    });
  }

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    ...item,
    easinessFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
    lastReview: now,
  };
}

/**
 * Get items that are due for review
 *
 * @param items - Array of SM-2 items
 * @param asOf - Reference date (defaults to now)
 * @returns Items that are due for review
 */
export function getDueItems<T extends SM2Item>(items: T[], asOf = new Date()): T[] {
  return items.filter((item) => item.nextReview <= asOf);
}

/**
 * Sort items by review priority (most overdue first)
 *
 * @param items - Array of SM-2 items
 * @returns Sorted items (most urgent first)
 */
export function sortByPriority<T extends SM2Item>(items: T[]): T[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    const aOverdue = now - a.nextReview.getTime();
    const bOverdue = now - b.nextReview.getTime();
    return bOverdue - aOverdue;
  });
}

/**
 * Sort items with priority boost support
 *
 * @param items - Array of SM-2 items with optional priority boost
 * @returns Sorted items
 */
export function sortByPriorityWithBoost<T extends SM2ItemWithMeta>(items: T[]): T[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    // Calculate base priority from overdue amount
    const aOverdue = now - a.nextReview.getTime();
    const bOverdue = now - b.nextReview.getTime();

    // Apply priority boost (default 0)
    const aBoost = (a.priorityBoost ?? 0) * 86400000; // Convert to ms (1 day equivalent)
    const bBoost = (b.priorityBoost ?? 0) * 86400000;

    return bOverdue + bBoost - (aOverdue + aBoost);
  });
}

/**
 * Convert human-readable descriptor to SM-2 quality rating
 *
 * @param descriptor - Response descriptor
 * @returns SM-2 quality rating (0-5)
 */
export function qualityFromDescriptor(descriptor: SM2ResponseDescriptor): SM2Response {
  const map: Record<SM2ResponseDescriptor, SM2Response> = {
    perfect: 5,
    good: 4,
    hesitant: 3,
    difficult: 2,
    wrong: 1,
    blackout: 0,
  };
  return map[descriptor];
}

/**
 * Convert SM-2 quality to human-readable descriptor
 *
 * @param quality - SM-2 quality rating (0-5)
 * @returns Human-readable descriptor
 */
export function descriptorFromQuality(quality: SM2Response): SM2ResponseDescriptor {
  const map: Record<SM2Response, SM2ResponseDescriptor> = {
    5: 'perfect',
    4: 'good',
    3: 'hesitant',
    2: 'difficult',
    1: 'wrong',
    0: 'blackout',
  };
  return map[quality];
}

// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================

/**
 * Calculate retention rate for a set of items
 *
 * @param items - Array of SM-2 items
 * @returns Estimated retention percentage (0-100)
 */
export function calculateRetentionRate(items: SM2Item[]): number {
  if (items.length === 0) return 0;

  const now = Date.now();
  let totalRetention = 0;

  for (const item of items) {
    const daysSinceReview = item.lastReview
      ? (now - item.lastReview.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    // Exponential decay model
    // R = e^(-t/S) where S is stability (approximated by interval * EF)
    const stability = item.interval * item.easinessFactor;
    const retention = stability > 0 ? Math.exp(-daysSinceReview / stability) : 0.5;

    totalRetention += retention;
  }

  return Math.round((totalRetention / items.length) * 100);
}

/**
 * Estimate study time needed for review session
 *
 * @param dueItems - Items due for review
 * @param avgSecondsPerItem - Average time per item (default 30s)
 * @returns Estimated minutes
 */
export function estimateStudyTime(dueItems: SM2Item[], avgSecondsPerItem = 30): number {
  return Math.ceil((dueItems.length * avgSecondsPerItem) / 60);
}

/**
 * Get statistics for a learner's items
 *
 * @param items - All items for a learner
 * @returns Statistics object
 */
export function getItemStatistics(items: SM2Item[]): {
  total: number;
  dueNow: number;
  dueToday: number;
  avgEasiness: number;
  avgInterval: number;
  estimatedRetention: number;
} {
  if (items.length === 0) {
    return {
      total: 0,
      dueNow: 0,
      dueToday: 0,
      avgEasiness: DEFAULT_EF,
      avgInterval: 0,
      estimatedRetention: 0,
    };
  }

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const dueNow = items.filter((i) => i.nextReview <= now).length;
  const dueToday = items.filter((i) => i.nextReview <= endOfDay).length;

  const avgEasiness = items.reduce((sum, i) => sum + i.easinessFactor, 0) / items.length;
  const avgInterval = items.reduce((sum, i) => sum + i.interval, 0) / items.length;

  return {
    total: items.length,
    dueNow,
    dueToday,
    avgEasiness: Math.round(avgEasiness * 100) / 100,
    avgInterval: Math.round(avgInterval * 10) / 10,
    estimatedRetention: calculateRetentionRate(items),
  };
}

// =============================================================================
// BKT INTEGRATION
// =============================================================================

/**
 * Convert BKT mastery probability to SM-2 quality
 * Useful for syncing mastery-based assessments with spaced repetition
 *
 * @param masteryProbability - BKT P(L) value (0-1)
 * @param correct - Whether the response was correct
 * @returns SM-2 quality rating
 */
export function masteryToQuality(masteryProbability: number, correct: boolean): SM2Response {
  if (!correct) {
    // Incorrect responses map to 0-2 based on mastery
    if (masteryProbability > 0.7) return 2; // Expected to know, close
    if (masteryProbability > 0.4) return 1; // Developing, remembered after
    return 0; // Novice, complete blackout
  }

  // Correct responses map to 3-5 based on mastery confidence
  if (masteryProbability > 0.9) return 5; // Mastered, perfect
  if (masteryProbability > 0.7) return 4; // Proficient, good
  return 3; // Developing/novice, hesitant but correct
}

/**
 * Adjust SM-2 interval based on BKT mastery
 * Higher mastery = can extend intervals more aggressively
 *
 * @param baseInterval - Standard SM-2 calculated interval
 * @param masteryProbability - BKT P(L) value (0-1)
 * @returns Adjusted interval in days
 */
export function adjustIntervalByMastery(baseInterval: number, masteryProbability: number): number {
  // Mastery > 0.95 can have 20% longer intervals
  // Mastery < 0.5 should have 20% shorter intervals
  const masteryFactor = 0.8 + masteryProbability * 0.4; // 0.8 to 1.2

  return Math.round(baseInterval * masteryFactor);
}
