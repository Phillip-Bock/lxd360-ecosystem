'use client';

import type { LearningDomain, ProficiencyLevel, ScaffoldingConfig } from '@/schemas/inspire';

// ============================================================================
// PROFICIENCY LEVEL OPTIONS
// ============================================================================

export interface ProficiencyLevelOption {
  value: ProficiencyLevel;
  label: string;
  level: number;
  description: string;
  color: string;
  defaultHintVisibility: number;
  defaultSupportType: ScaffoldingConfig['supportType'];
}

export const PROFICIENCY_LEVEL_CATALOG: ProficiencyLevelOption[] = [
  {
    value: 'aware',
    label: 'Aware',
    level: 1,
    description: 'Recognizes information exists — knows where to find help',
    color: 'text-gray-400',
    defaultHintVisibility: 100,
    defaultSupportType: 'full-guidance',
  },
  {
    value: 'comprehend',
    label: 'Comprehend',
    level: 2,
    description: 'Understands concepts — can explain in own words',
    color: 'text-blue-400',
    defaultHintVisibility: 80,
    defaultSupportType: 'full-guidance',
  },
  {
    value: 'apply',
    label: 'Apply',
    level: 3,
    description: 'Uses in familiar contexts — follows procedures accurately',
    color: 'text-cyan-400',
    defaultHintVisibility: 60,
    defaultSupportType: 'partial-hints',
  },
  {
    value: 'adapt',
    label: 'Adapt',
    level: 4,
    description: 'Modifies for novel situations — troubleshoots variations',
    color: 'text-purple-400',
    defaultHintVisibility: 40,
    defaultSupportType: 'partial-hints',
  },
  {
    value: 'integrate',
    label: 'Integrate',
    level: 5,
    description: 'Combines multiple skills — handles complex scenarios',
    color: 'text-orange-400',
    defaultHintVisibility: 20,
    defaultSupportType: 'feedback-only',
  },
  {
    value: 'elevate',
    label: 'Elevate',
    level: 6,
    description: 'Innovates and teaches others — creates new approaches',
    color: 'text-red-400',
    defaultHintVisibility: 0,
    defaultSupportType: 'none',
  },
];

// ============================================================================
// SUPPORT TYPE OPTIONS
// ============================================================================

export interface SupportTypeOption {
  value: ScaffoldingConfig['supportType'];
  label: string;
  description: string;
}

export const SUPPORT_TYPE_OPTIONS: SupportTypeOption[] = [
  {
    value: 'full-guidance',
    label: 'Full Guidance',
    description: 'Step-by-step instructions visible at all times',
  },
  {
    value: 'partial-hints',
    label: 'Partial Hints',
    description: 'Hints available on request or after hesitation',
  },
  {
    value: 'feedback-only',
    label: 'Feedback Only',
    description: 'No hints, but feedback after actions',
  },
  {
    value: 'none',
    label: 'No Support',
    description: 'Independent performance, assessment mode',
  },
];

// ============================================================================
// FADE RATE OPTIONS
// ============================================================================

export interface FadeRateOption {
  value: ScaffoldingConfig['fadeRate'];
  label: string;
  description: string;
}

export const FADE_RATE_OPTIONS: FadeRateOption[] = [
  {
    value: 'slow',
    label: 'Slow',
    description: 'Gradual reduction over many attempts',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced reduction based on performance',
  },
  {
    value: 'fast',
    label: 'Fast',
    description: 'Rapid reduction for quick learners',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getProficiencyLevelOption(
  level: ProficiencyLevel,
): ProficiencyLevelOption | undefined {
  return PROFICIENCY_LEVEL_CATALOG.find((p) => p.value === level);
}

export function getDefaultScaffolding(level: ProficiencyLevel): ScaffoldingConfig {
  const option = getProficiencyLevelOption(level);
  return {
    level,
    hintVisibility: option?.defaultHintVisibility ?? 50,
    supportType: option?.defaultSupportType ?? 'partial-hints',
    fadeRate: 'medium',
  };
}

export function generateScaffoldingConfig(
  startLevel: ProficiencyLevel,
  targetLevel: ProficiencyLevel,
): ScaffoldingConfig[] {
  const startIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === startLevel);
  const targetIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === targetLevel);

  if (startIndex === -1 || targetIndex === -1 || startIndex > targetIndex) {
    return [];
  }

  const configs: ScaffoldingConfig[] = [];
  for (let i = startIndex; i <= targetIndex; i++) {
    const level = PROFICIENCY_LEVEL_CATALOG[i];
    configs.push(getDefaultScaffolding(level.value));
  }

  return configs;
}

export function calculateNeuroReadinessScore(
  scaffolding: ScaffoldingConfig[],
  targetLevel: ProficiencyLevel,
): number {
  if (scaffolding.length === 0) return 0;

  // Check if scaffolding covers all levels up to target
  const targetIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === targetLevel);
  const coveredLevels = scaffolding.map((s) =>
    PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === s.level),
  );

  // Score based on:
  // 1. Coverage completeness (40%)
  // 2. Hint visibility progression (30%)
  // 3. Support type appropriateness (30%)

  let coverageScore = 0;
  let hintScore = 0;
  let supportScore = 0;

  // Coverage
  const expectedLevels = targetIndex + 1;
  const actualCoverage = new Set(coveredLevels).size;
  coverageScore = (actualCoverage / expectedLevels) * 40;

  // Hint progression (should decrease as levels increase)
  let prevHint = 100;
  let hintProgressionValid = true;
  for (const config of scaffolding) {
    if (config.hintVisibility > prevHint) {
      hintProgressionValid = false;
    }
    prevHint = config.hintVisibility;
  }
  hintScore = hintProgressionValid ? 30 : 15;

  // Support appropriateness
  let supportAppropriate = 0;
  for (const config of scaffolding) {
    const levelOption = getProficiencyLevelOption(config.level);
    if (levelOption && config.supportType === levelOption.defaultSupportType) {
      supportAppropriate++;
    }
  }
  supportScore = (supportAppropriate / scaffolding.length) * 30;

  return Math.round(coverageScore + hintScore + supportScore);
}

export function getLevelGap(start: ProficiencyLevel, target: ProficiencyLevel): number {
  const startIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === start);
  const targetIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === target);
  return Math.max(0, targetIndex - startIndex);
}

export function getMilestoneTemplate(level: ProficiencyLevel): {
  milestone: string;
  celebration: string;
} {
  switch (level) {
    case 'aware':
      return {
        milestone: 'Recognizes key concepts and knows where to find resources',
        celebration: '🎯 Foundation laid!',
      };
    case 'comprehend':
      return {
        milestone: 'Can explain concepts in own words',
        celebration: '💡 Understanding unlocked!',
      };
    case 'apply':
      return {
        milestone: 'Successfully applies skills in familiar situations',
        celebration: '🚀 Skills in action!',
      };
    case 'adapt':
      return {
        milestone: 'Adapts approach for new situations',
        celebration: '🔧 Flexibility achieved!',
      };
    case 'integrate':
      return {
        milestone: 'Combines multiple skills for complex challenges',
        celebration: '⭐ Integration mastered!',
      };
    case 'elevate':
      return {
        milestone: 'Innovates and mentors others',
        celebration: '🏆 Expert status achieved!',
      };
    default:
      return { milestone: '', celebration: '' };
  }
}

export function getDomainBenchmarkSuggestions(
  domain: LearningDomain,
  level: ProficiencyLevel,
): string[] {
  // Simplified suggestions based on domain and level
  const baseSuggestions: Record<LearningDomain, string[]> = {
    cognitive: [
      'Recalls key facts accurately',
      'Explains reasoning clearly',
      'Analyzes complex scenarios',
    ],
    affective: [
      'Shows appropriate emotional response',
      'Demonstrates empathy in interactions',
      'Models positive attitude',
    ],
    psychomotor: [
      'Performs basic movements correctly',
      'Executes procedures smoothly',
      'Demonstrates precision and speed',
    ],
    social: [
      'Participates in group discussions',
      'Collaborates effectively with peers',
      'Leads team activities',
    ],
    metacognitive: [
      'Identifies own learning needs',
      'Monitors own progress',
      'Adjusts learning strategies',
    ],
    creative: [
      'Generates basic ideas',
      'Combines concepts in new ways',
      'Creates innovative solutions',
    ],
    digital: [
      'Navigates basic interfaces',
      'Uses tools effectively',
      'Troubleshoots technical issues',
    ],
  };

  const levelIndex = PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === level);
  const suggestions = baseSuggestions[domain] ?? [];

  // Return suggestions appropriate for the level
  return suggestions.slice(0, Math.min(levelIndex + 1, suggestions.length));
}
