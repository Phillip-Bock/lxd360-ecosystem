/**
 * Speed Bump Intervention Generator
 *
 * Implements Artemis vision: "triggers a 'Speed Bump' intervention from Cortex
 * ('Whoa, you're moving fast. Let's recap that last point.')"
 */

import { v4 as uuid } from 'uuid';

import { logger } from '@/lib/logger';

import type { DoomScrollMetrics, Intervention } from './types';

const log = logger.scope('SpeedBump');

// =============================================================================
// SPEED BUMP TEMPLATES
// =============================================================================

interface SpeedBumpTemplate {
  id: string;
  severity: 'mild' | 'moderate' | 'severe';
  messages: string[];
  actionLabel: string;
}

const SPEED_BUMP_TEMPLATES: SpeedBumpTemplate[] = [
  {
    id: 'gentle_reminder',
    severity: 'mild',
    messages: [
      "Hey there! You're moving pretty quick. Want to take a moment to review the last section?",
      "Just checking in — did you catch all of that? Let's do a quick recap.",
      "You're making great progress! Before we continue, let's make sure the key points stick.",
    ],
    actionLabel: 'Quick Recap',
  },
  {
    id: 'moderate_pause',
    severity: 'moderate',
    messages: [
      'Whoa, slow down! This section has some important details you might want to revisit.',
      "Hold up — there's some critical information in what you just passed. Let's review.",
      "Speed isn't everything! The concepts here build on each other. Let's take a moment.",
    ],
    actionLabel: 'Review Key Concepts',
  },
  {
    id: 'strong_intervention',
    severity: 'severe',
    messages: [
      "Full stop! You've skipped through several important sections. This could affect your assessment results.",
      "I need you to pause here. The material you're skipping is essential for compliance certification.",
      "Let's take a breath. Rushing through this content means you might miss critical safety information.",
    ],
    actionLabel: 'Review All Skipped Content',
  },
];

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Determine severity based on doom-scroll metrics
 */
function determineSeverity(metrics: DoomScrollMetrics): SpeedBumpTemplate['severity'] {
  if (metrics.engagementRatio < 0.1 || metrics.skippedBlocks > 5) {
    return 'severe';
  }
  if (metrics.engagementRatio < 0.2 || metrics.skippedBlocks > 3) {
    return 'moderate';
  }
  return 'mild';
}

/**
 * Select a random message from the template
 */
function selectMessage(template: SpeedBumpTemplate): string {
  const index = Math.floor(Math.random() * template.messages.length);
  return template.messages[index];
}

/**
 * Generate a speed bump intervention
 */
export function generateSpeedBump(
  learnerId: string,
  metrics: DoomScrollMetrics,
  recentBlockId?: string,
): Intervention {
  const severity = determineSeverity(metrics);
  const template =
    SPEED_BUMP_TEMPLATES.find((t) => t.severity === severity) || SPEED_BUMP_TEMPLATES[0];

  const intervention: Intervention = {
    id: uuid(),
    type: 'speed_bump',
    trigger: {
      signal: 'click_through_rate',
      condition: 'above',
      threshold: 1 - metrics.engagementRatio,
      windowMs: 60000, // Last minute
    },
    priority: severity === 'severe' ? 'high' : severity === 'moderate' ? 'medium' : 'low',
    message: selectMessage(template),
    actionLabel: template.actionLabel,
    targetContentId: recentBlockId,
    createdAt: new Date(),
  };

  log.info('Speed bump intervention generated', {
    learnerId,
    severity,
    interventionId: intervention.id,
    engagementRatio: metrics.engagementRatio,
  });

  return intervention;
}

/**
 * Check if speed bump should be triggered
 */
export function shouldTriggerSpeedBump(metrics: DoomScrollMetrics): boolean {
  return metrics.isSkimming;
}

/**
 * Get Glass Box explanation for the speed bump
 */
export function explainSpeedBump(metrics: DoomScrollMetrics): string {
  const avgSeconds = Math.round(metrics.avgTimePerBlock / 1000);
  const expectedSeconds = Math.round(metrics.expectedTimePerBlock / 1000);
  const percentEngaged = Math.round(metrics.engagementRatio * 100);

  return (
    `I noticed you spent an average of ${avgSeconds} seconds per section, ` +
    `but these sections typically take about ${expectedSeconds} seconds to fully absorb. ` +
    `That's ${percentEngaged}% of the expected engagement time. ` +
    `Taking a moment to review will help these concepts stick in long-term memory.`
  );
}
