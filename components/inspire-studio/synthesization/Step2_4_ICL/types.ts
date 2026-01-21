'use client';

import type { BloomVerb, ComplexityLevel, LadderRung, ProficiencyLevel } from '@/schemas/inspire';

// ============================================================================
// FORM DATA
// ============================================================================

export interface RungFormData {
  objective: string;
  actionVerb?: BloomVerb;
  complexityLevel: ComplexityLevel;
  proficiencyTarget: ProficiencyLevel;
  taskIds: string[];
  prerequisites: string[];
  recommendedBlockTypes: string[];
  estimatedMinutes?: number;
}

// ============================================================================
// BLOCK TYPE RECOMMENDATIONS
// ============================================================================

export interface BlockTypeOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  recommendedFor: ComplexityLevel[];
}

export const BLOCK_TYPE_CATALOG: BlockTypeOption[] = [
  {
    value: 'text',
    label: 'Text',
    icon: 'file-text',
    description: 'Informational content blocks',
    recommendedFor: ['foundation', 'application'],
  },
  {
    value: 'video',
    label: 'Video',
    icon: 'video',
    description: 'Video content with optional interactions',
    recommendedFor: ['foundation', 'application', 'adaptive'],
  },
  {
    value: 'quiz',
    label: 'Quiz',
    icon: 'clipboard-check',
    description: 'Knowledge check questions',
    recommendedFor: ['foundation', 'application', 'adaptive'],
  },
  {
    value: 'scenario',
    label: 'Scenario',
    icon: 'git-branch',
    description: 'Branching decision scenarios',
    recommendedFor: ['adaptive', 'strategic', 'mastery'],
  },
  {
    value: 'simulation',
    label: 'Simulation',
    icon: 'box',
    description: 'Interactive simulations',
    recommendedFor: ['strategic', 'mastery', 'innovation'],
  },
  {
    value: 'hotspot',
    label: 'Hotspot',
    icon: 'mouse-pointer',
    description: 'Click-to-reveal interactions',
    recommendedFor: ['foundation', 'application'],
  },
  {
    value: 'drag-drop',
    label: 'Drag & Drop',
    icon: 'move',
    description: 'Sorting and matching activities',
    recommendedFor: ['application', 'adaptive'],
  },
  {
    value: 'reflection',
    label: 'Reflection',
    icon: 'message-circle',
    description: 'Self-assessment and journaling',
    recommendedFor: ['adaptive', 'strategic', 'mastery', 'innovation'],
  },
  {
    value: 'collaboration',
    label: 'Collaboration',
    icon: 'users',
    description: 'Peer interaction activities',
    recommendedFor: ['strategic', 'mastery', 'innovation'],
  },
  {
    value: 'assessment',
    label: 'Assessment',
    icon: 'check-circle',
    description: 'Formal evaluation blocks',
    recommendedFor: ['application', 'adaptive', 'strategic', 'mastery'],
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getRecommendedBlockTypes(complexityLevel: ComplexityLevel): string[] {
  return BLOCK_TYPE_CATALOG.filter((block) => block.recommendedFor.includes(complexityLevel)).map(
    (block) => block.value,
  );
}

export function buildPrerequisiteMap(rungs: LadderRung[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const rung of rungs) {
    map[rung.id] = rung.prerequisites;
  }
  return map;
}

export function identifyGaps(
  rungs: LadderRung[],
): { rungId: string; missingPrerequisites: string[]; recommendation: string }[] {
  const gaps: { rungId: string; missingPrerequisites: string[]; recommendation: string }[] = [];
  const rungIds = new Set(rungs.map((r) => r.id));

  for (const rung of rungs) {
    const missing = rung.prerequisites.filter((prereq) => !rungIds.has(prereq));
    if (missing.length > 0) {
      gaps.push({
        rungId: rung.id,
        missingPrerequisites: missing,
        recommendation: `Add prerequisite rungs or remove references to: ${missing.join(', ')}`,
      });
    }
  }

  return gaps;
}

export function calculateTotalDuration(rungs: LadderRung[]): number {
  return rungs.reduce((sum, rung) => sum + (rung.estimatedMinutes ?? 0), 0);
}

export function validateSMARTObjective(objective: string): {
  isValid: boolean;
  feedback: string[];
} {
  const feedback: string[] = [];

  // Check for action verb at start
  const startsWithVerb = /^[A-Z][a-z]+\s/.test(objective);
  if (!startsWithVerb) {
    feedback.push('Start with an action verb (e.g., "Identify", "Apply", "Analyze")');
  }

  // Check for measurable component
  const hasMeasurable = /\d+|all|each|every|accurately|correctly|successfully/i.test(objective);
  if (!hasMeasurable) {
    feedback.push('Include a measurable criterion (e.g., "accurately", "3 out of 5")');
  }

  // Check minimum length
  if (objective.length < 20) {
    feedback.push('Objective seems too brief - add more specific details');
  }

  // Check for context
  const hasContext = /when|given|in|during|after|before/i.test(objective);
  if (!hasContext) {
    feedback.push('Consider adding context (e.g., "when presented with...", "given...")');
  }

  return {
    isValid: feedback.length === 0,
    feedback,
  };
}

export function sortRungsByOrder(rungs: LadderRung[]): LadderRung[] {
  return [...rungs].sort((a, b) => a.order - b.order);
}

export function getNextOrder(rungs: LadderRung[]): number {
  if (rungs.length === 0) return 1;
  return Math.max(...rungs.map((r) => r.order)) + 1;
}

export function reorderRungs(
  rungs: LadderRung[],
  fromIndex: number,
  toIndex: number,
): LadderRung[] {
  const sorted = sortRungsByOrder(rungs);
  const [removed] = sorted.splice(fromIndex, 1);
  sorted.splice(toIndex, 0, removed);

  // Reassign order values
  return sorted.map((rung, index) => ({
    ...rung,
    order: index + 1,
  }));
}

export function getComplexityColor(level: ComplexityLevel): string {
  switch (level) {
    case 'foundation':
      return 'text-gray-400';
    case 'application':
      return 'text-blue-400';
    case 'adaptive':
      return 'text-cyan-400';
    case 'strategic':
      return 'text-purple-400';
    case 'mastery':
      return 'text-orange-400';
    case 'innovation':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function getProficiencyColor(level: ProficiencyLevel): string {
  switch (level) {
    case 'aware':
      return 'text-gray-400';
    case 'comprehend':
      return 'text-blue-400';
    case 'apply':
      return 'text-cyan-400';
    case 'adapt':
      return 'text-purple-400';
    case 'integrate':
      return 'text-orange-400';
    case 'elevate':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}
