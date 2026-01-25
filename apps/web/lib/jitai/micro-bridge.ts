/**
 * Micro-Bridge Generator
 *
 * Implements Artemis vision: "The system doesn't make them retake the whole course.
 * It dynamically generates a 2-minute 'Micro-Bridge' module containing only the
 * gaps they missed, then re-tests."
 */

import { v4 as uuid } from 'uuid';

import { logger } from '@/lib/logger';

import type { JITAISkillGap, MicroBridge, MicroBridgeBlock } from './types';

const log = logger.scope('MicroBridge');

// =============================================================================
// CONSTANTS
// =============================================================================

/** Target duration for a micro-bridge in seconds */
const TARGET_DURATION_SECONDS = 120; // 2 minutes

/** Maximum blocks in a micro-bridge */
const MAX_BLOCKS = 5;

/** Required score to pass verification quiz (0-1) */
const REQUIRED_VERIFICATION_SCORE = 0.8;

// =============================================================================
// CONTENT TEMPLATES
// =============================================================================

interface ContentTemplate {
  type: MicroBridgeBlock['contentType'];
  durationSeconds: number;
  template: (skillName: string, context?: string) => string;
}

/** Template lookup map for O(1) access */
const TEMPLATE_MAP: Record<MicroBridgeBlock['contentType'], ContentTemplate> = {
  explanation: {
    type: 'explanation',
    durationSeconds: 30,
    template: (skillName) =>
      `
## Quick Review: ${skillName}

Let's make sure you've got the key points:

**Why it matters:** Understanding ${skillName} is essential for your role.

**The core concept:** [AI-generated explanation based on skill definition]
    `.trim(),
  },
  example: {
    type: 'example',
    durationSeconds: 25,
    template: (skillName) =>
      `
## Real-World Example

Here's how ${skillName} shows up in practice:

**Scenario:** [Context-relevant example]

**What to notice:** The key takeaway here is...
    `.trim(),
  },
  practice: {
    type: 'practice',
    durationSeconds: 40,
    template: (skillName) =>
      `
## Quick Practice

Let's apply what you know about ${skillName}:

**Your turn:** [Interactive exercise or reflection prompt]
    `.trim(),
  },
  summary: {
    type: 'summary',
    durationSeconds: 15,
    template: (skillName) =>
      `
## Key Takeaways

${skillName} — Remember these points:
- Point 1
- Point 2
- Point 3
    `.trim(),
  },
};

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Generate a micro-bridge for a set of skill gaps
 */
export function generateMicroBridge(
  learnerId: string,
  gaps: JITAISkillGap[],
  maxDuration: number = TARGET_DURATION_SECONDS,
): MicroBridge {
  // Sort gaps by priority (lowest mastery first)
  const sortedGaps = [...gaps].sort((a, b) => a.currentMastery - b.currentMastery);

  // Select gaps that fit within duration
  const selectedGaps: JITAISkillGap[] = [];
  let totalDuration = 0;
  const durationPerSkill = Math.floor(maxDuration / Math.min(gaps.length, MAX_BLOCKS));

  for (const gap of sortedGaps) {
    if (selectedGaps.length >= MAX_BLOCKS) break;
    if (totalDuration + durationPerSkill > maxDuration) break;

    selectedGaps.push(gap);
    totalDuration += durationPerSkill;
  }

  // Generate content blocks
  const contentBlocks: MicroBridgeBlock[] = [];
  let blockOrder = 0;

  for (const gap of selectedGaps) {
    // Select 1-2 content types per skill based on gap severity
    const templates = selectTemplatesForGap(gap);

    for (const template of templates) {
      contentBlocks.push({
        id: uuid(),
        skillId: gap.skillId,
        contentType: template.type,
        content: template.template(gap.skillName),
        duration: template.durationSeconds,
        order: blockOrder++,
      });
    }
  }

  const microBridge: MicroBridge = {
    id: uuid(),
    learnerId,
    targetSkills: selectedGaps.map((g) => g.skillId),
    contentBlocks,
    estimatedDuration: contentBlocks.reduce((sum, b) => sum + b.duration, 0),
    verificationQuiz: {
      questionIds: [], // Would be populated from question bank
      requiredScore: REQUIRED_VERIFICATION_SCORE,
    },
    status: 'generated',
    createdAt: new Date(),
  };

  log.info('Micro-bridge generated', {
    learnerId,
    bridgeId: microBridge.id,
    skillCount: selectedGaps.length,
    blockCount: contentBlocks.length,
    duration: microBridge.estimatedDuration,
  });

  return microBridge;
}

/**
 * Select content templates based on gap severity
 */
function selectTemplatesForGap(gap: JITAISkillGap): ContentTemplate[] {
  const severity = 1 - gap.currentMastery; // Higher = worse gap

  if (severity > 0.7) {
    // Severe gap: full coverage
    return [TEMPLATE_MAP.explanation, TEMPLATE_MAP.example, TEMPLATE_MAP.practice];
  }

  if (severity > 0.4) {
    // Moderate gap: example + practice
    return [TEMPLATE_MAP.example, TEMPLATE_MAP.practice];
  }

  // Mild gap: just a summary
  return [TEMPLATE_MAP.summary];
}

/**
 * Mark micro-bridge as completed
 */
export function completeMicroBridge(bridge: MicroBridge, verificationScore?: number): MicroBridge {
  const passed =
    verificationScore === undefined || verificationScore >= REQUIRED_VERIFICATION_SCORE;

  return {
    ...bridge,
    status: passed ? 'completed' : 'in_progress',
    completedAt: passed ? new Date() : undefined,
  };
}

/**
 * Get Glass Box explanation for micro-bridge
 */
export function explainMicroBridge(bridge: MicroBridge, skillNames: string[]): string {
  const minutes = Math.round(bridge.estimatedDuration / 60);
  const skillList = skillNames.slice(0, 3).join(', ');

  return (
    `Based on your recent performance, I've created a ${minutes}-minute review ` +
    `focusing on: ${skillList}. This targeted practice addresses the specific gaps ` +
    `identified in your responses, rather than making you repeat the entire module. ` +
    `After completing this bridge, you'll take a quick verification quiz.`
  );
}

/**
 * Create a JITAI skill gap from knowledge state
 */
export function createSkillGapFromMastery(
  skillId: string,
  skillName: string,
  currentMastery: number,
  targetMastery: number = 0.8,
): JITAISkillGap {
  const gap = targetMastery - currentMastery;

  let priority: JITAISkillGap['priority'];
  if (gap > 0.5) {
    priority = 'critical';
  } else if (gap > 0.3) {
    priority = 'high';
  } else if (gap > 0.15) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    skillId,
    skillName,
    currentMastery,
    targetMastery,
    gap: Math.round(gap * 100) / 100,
    priority,
    estimatedTimeToClose: Math.round(gap * 300), // ~5 min per 0.1 mastery point
  };
}
