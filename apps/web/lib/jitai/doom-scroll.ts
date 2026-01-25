/**
 * Doom-Scroll Detector
 *
 * Implements Artemis vision: "AI detects when a user is 'clicking through'
 * without reading (speed vs. content length analysis)"
 */

import { logger } from '@/lib/logger';

import type { BehavioralSignal, ContentBlock, DoomScrollMetrics } from './types';

const log = logger.scope('DoomScrollDetector');

// =============================================================================
// CONSTANTS
// =============================================================================

/** Words per minute for average adult reading */
const AVERAGE_READING_WPM = 200;

/** Minimum engagement ratio before flagging (30% of expected time) */
const SKIM_THRESHOLD = 0.3;

/** Number of consecutive skipped blocks to trigger intervention */
const SKIP_STREAK_THRESHOLD = 3;

/** Multipliers for different content types */
const CONTENT_TIME_MULTIPLIERS: Record<ContentBlock['type'], number> = {
  text: 1.0,
  video: 1.2, // Videos may be paused/rewound
  interactive: 1.5, // Interactives require more engagement
  assessment: 2.0, // Assessments require thinking time
};

// =============================================================================
// SESSION STATE
// =============================================================================

interface DoomScrollSession {
  learnerId: string;
  sessionStart: Date;
  blocks: BlockEngagement[];
  currentSkipStreak: number;
}

interface BlockEngagement {
  blockId: string;
  expectedMs: number;
  actualMs: number;
  timestamp: Date;
  wasSkipped: boolean;
}

const sessions = new Map<string, DoomScrollSession>();

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate expected engagement time for a content block
 */
export function calculateExpectedTime(block: ContentBlock): number {
  const baseTime = block.estimatedDuration * 1000; // Convert to ms

  // For text blocks, calculate from word count if available
  if (block.type === 'text' && block.wordCount) {
    const readingTimeMs = (block.wordCount / AVERAGE_READING_WPM) * 60 * 1000;
    return Math.max(readingTimeMs, baseTime) * CONTENT_TIME_MULTIPLIERS[block.type];
  }

  return baseTime * CONTENT_TIME_MULTIPLIERS[block.type];
}

/**
 * Record time spent on a content block
 */
export function recordBlockEngagement(
  learnerId: string,
  block: ContentBlock,
  actualTimeMs: number,
): DoomScrollMetrics {
  // Get or create session
  let session = sessions.get(learnerId);
  if (!session) {
    session = {
      learnerId,
      sessionStart: new Date(),
      blocks: [],
      currentSkipStreak: 0,
    };
    sessions.set(learnerId, session);
  }

  const expectedMs = calculateExpectedTime(block);
  const wasSkipped = actualTimeMs < expectedMs * SKIM_THRESHOLD;

  // Update skip streak
  if (wasSkipped) {
    session.currentSkipStreak++;
  } else {
    session.currentSkipStreak = 0;
  }

  // Record engagement
  session.blocks.push({
    blockId: block.id,
    expectedMs,
    actualMs: actualTimeMs,
    timestamp: new Date(),
    wasSkipped,
  });

  // Calculate metrics
  const metrics = calculateMetrics(session);

  if (metrics.isSkimming) {
    log.warn('Doom-scroll behavior detected', {
      learnerId,
      engagementRatio: metrics.engagementRatio,
      skippedBlocks: metrics.skippedBlocks,
      skipStreak: session.currentSkipStreak,
    });
  }

  return metrics;
}

/**
 * Calculate doom-scroll metrics for a session
 */
function calculateMetrics(session: DoomScrollSession): DoomScrollMetrics {
  if (session.blocks.length === 0) {
    return {
      avgTimePerBlock: 0,
      expectedTimePerBlock: 0,
      engagementRatio: 1.0,
      blocksViewed: 0,
      skippedBlocks: 0,
      isSkimming: false,
    };
  }

  const totalActual = session.blocks.reduce((sum, b) => sum + b.actualMs, 0);
  const totalExpected = session.blocks.reduce((sum, b) => sum + b.expectedMs, 0);
  const skippedCount = session.blocks.filter((b) => b.wasSkipped).length;

  const avgTimePerBlock = totalActual / session.blocks.length;
  const expectedTimePerBlock = totalExpected / session.blocks.length;
  const engagementRatio = totalExpected > 0 ? totalActual / totalExpected : 1.0;

  // Detect skimming: low engagement OR high skip streak
  const isSkimming =
    engagementRatio < SKIM_THRESHOLD || session.currentSkipStreak >= SKIP_STREAK_THRESHOLD;

  return {
    avgTimePerBlock,
    expectedTimePerBlock,
    engagementRatio: Math.round(engagementRatio * 100) / 100,
    blocksViewed: session.blocks.length,
    skippedBlocks: skippedCount,
    isSkimming,
  };
}

/**
 * Get current doom-scroll metrics for a learner
 */
export function getMetrics(learnerId: string): DoomScrollMetrics | null {
  const session = sessions.get(learnerId);
  if (!session) return null;
  return calculateMetrics(session);
}

/**
 * Reset session (e.g., after intervention accepted)
 */
export function resetSession(learnerId: string): void {
  sessions.delete(learnerId);
  log.debug('Doom-scroll session reset', { learnerId });
}

/**
 * Generate behavioral signal for JITAI engine
 */
export function generateSignal(learnerId: string): BehavioralSignal | null {
  const metrics = getMetrics(learnerId);
  if (!metrics) return null;

  return {
    type: 'click_through_rate',
    timestamp: new Date(),
    value: 1 - metrics.engagementRatio, // Higher = more clicking through
    metadata: {
      blocksViewed: metrics.blocksViewed,
      skippedBlocks: metrics.skippedBlocks,
      isSkimming: metrics.isSkimming,
    },
  };
}
