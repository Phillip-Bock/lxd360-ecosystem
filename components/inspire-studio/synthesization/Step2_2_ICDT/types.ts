'use client';

import type { BloomVerb, ComplexityLevel, LearningDomain } from '@/schemas/inspire';

// ============================================================================
// COMPLEXITY LEVEL OPTIONS
// ============================================================================

export interface ComplexityLevelOption {
  value: ComplexityLevel;
  label: string;
  level: number;
  description: string;
  color: string;
  cognitiveLoadRange: { min: number; max: number };
}

export const COMPLEXITY_LEVEL_CATALOG: ComplexityLevelOption[] = [
  {
    value: 'foundation',
    label: 'Foundation',
    level: 1,
    description: 'Recognize & Recall — Basic information retrieval',
    color: 'text-gray-400',
    cognitiveLoadRange: { min: 1, max: 2 },
  },
  {
    value: 'application',
    label: 'Application',
    level: 2,
    description: 'Apply in familiar contexts — Use knowledge in known situations',
    color: 'text-blue-400',
    cognitiveLoadRange: { min: 2, max: 4 },
  },
  {
    value: 'adaptive',
    label: 'Adaptive',
    level: 3,
    description: 'Modify approach — Adjust strategies for variations',
    color: 'text-cyan-400',
    cognitiveLoadRange: { min: 4, max: 6 },
  },
  {
    value: 'strategic',
    label: 'Strategic',
    level: 4,
    description: 'Multi-system coordination — Integrate across domains',
    color: 'text-purple-400',
    cognitiveLoadRange: { min: 5, max: 7 },
  },
  {
    value: 'mastery',
    label: 'Mastery',
    level: 5,
    description: 'Near-automaticity — Fluent execution with minimal effort',
    color: 'text-orange-400',
    cognitiveLoadRange: { min: 6, max: 8 },
  },
  {
    value: 'innovation',
    label: 'Innovation',
    level: 6,
    description: 'Novel problem-solving — Create new solutions',
    color: 'text-red-400',
    cognitiveLoadRange: { min: 7, max: 10 },
  },
];

// ============================================================================
// LEARNING DOMAIN OPTIONS
// ============================================================================

export interface LearningDomainOption {
  value: LearningDomain;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const LEARNING_DOMAIN_CATALOG: LearningDomainOption[] = [
  {
    value: 'cognitive',
    label: 'Cognitive',
    icon: 'brain',
    description: 'Knowledge, comprehension, mental skills',
    color: 'text-blue-400',
  },
  {
    value: 'affective',
    label: 'Affective',
    icon: 'heart',
    description: 'Attitudes, emotions, values',
    color: 'text-pink-400',
  },
  {
    value: 'psychomotor',
    label: 'Psychomotor',
    icon: 'hand',
    description: 'Physical skills, motor coordination',
    color: 'text-green-400',
  },
  {
    value: 'social',
    label: 'Social',
    icon: 'users',
    description: 'Interpersonal skills, collaboration',
    color: 'text-yellow-400',
  },
  {
    value: 'metacognitive',
    label: 'Metacognitive',
    icon: 'lightbulb',
    description: 'Self-awareness, learning strategies',
    color: 'text-purple-400',
  },
  {
    value: 'creative',
    label: 'Creative',
    icon: 'sparkles',
    description: 'Innovation, imagination, design thinking',
    color: 'text-orange-400',
  },
  {
    value: 'digital',
    label: 'Digital',
    icon: 'monitor',
    description: 'Technology proficiency, digital literacy',
    color: 'text-cyan-400',
  },
];

// ============================================================================
// BLOOM'S TAXONOMY VERBS
// ============================================================================

export interface BloomCategory {
  name: string;
  level: number;
  verbs: BloomVerb[];
  description: string;
  color: string;
}

export const BLOOM_TAXONOMY: BloomCategory[] = [
  {
    name: 'Remember',
    level: 1,
    verbs: ['define', 'identify', 'list', 'name', 'recall', 'recognize', 'state'],
    description: 'Retrieve relevant knowledge from long-term memory',
    color: 'text-gray-400',
  },
  {
    name: 'Understand',
    level: 2,
    verbs: ['classify', 'describe', 'discuss', 'explain', 'interpret', 'paraphrase', 'summarize'],
    description: 'Construct meaning from instructional messages',
    color: 'text-blue-400',
  },
  {
    name: 'Apply',
    level: 3,
    verbs: ['apply', 'demonstrate', 'execute', 'implement', 'operate', 'solve', 'use'],
    description: 'Carry out or use a procedure in a given situation',
    color: 'text-cyan-400',
  },
  {
    name: 'Analyze',
    level: 4,
    verbs: ['analyze', 'compare', 'contrast', 'differentiate', 'examine', 'organize', 'relate'],
    description: 'Break material into parts and determine relationships',
    color: 'text-purple-400',
  },
  {
    name: 'Evaluate',
    level: 5,
    verbs: ['appraise', 'assess', 'critique', 'evaluate', 'judge', 'justify', 'validate'],
    description: 'Make judgments based on criteria and standards',
    color: 'text-orange-400',
  },
  {
    name: 'Create',
    level: 6,
    verbs: ['compose', 'construct', 'create', 'design', 'develop', 'formulate', 'produce'],
    description: 'Put elements together to form a coherent whole',
    color: 'text-red-400',
  },
];

// ============================================================================
// FORM DATA
// ============================================================================

export interface ObjectiveFormData {
  objectiveText: string;
  complexityLevel: ComplexityLevel;
  domains: LearningDomain[];
  actionVerb?: BloomVerb;
  cognitiveLoadWeight: number;
  notes?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getComplexityLevelOption(
  level: ComplexityLevel,
): ComplexityLevelOption | undefined {
  return COMPLEXITY_LEVEL_CATALOG.find((c) => c.value === level);
}

export function getLearningDomainOption(domain: LearningDomain): LearningDomainOption | undefined {
  return LEARNING_DOMAIN_CATALOG.find((d) => d.value === domain);
}

export function getBloomCategory(verb: BloomVerb): BloomCategory | undefined {
  return BLOOM_TAXONOMY.find((cat) => cat.verbs.includes(verb));
}

export function getVerbLabel(verb: BloomVerb): string {
  return verb.charAt(0).toUpperCase() + verb.slice(1);
}

export function calculateAverageComplexity(
  objectives: { complexityLevel: ComplexityLevel }[],
): number {
  if (objectives.length === 0) return 1;

  const total = objectives.reduce((sum, obj) => {
    const level = COMPLEXITY_LEVEL_CATALOG.find((c) => c.value === obj.complexityLevel);
    return sum + (level?.level ?? 1);
  }, 0);

  return Math.round((total / objectives.length) * 10) / 10;
}

export function calculateCognitiveLoadDistribution(
  objectives: { complexityLevel: ComplexityLevel }[],
): Record<ComplexityLevel, number> {
  const distribution: Record<ComplexityLevel, number> = {
    foundation: 0,
    application: 0,
    adaptive: 0,
    strategic: 0,
    mastery: 0,
    innovation: 0,
  };

  for (const obj of objectives) {
    distribution[obj.complexityLevel]++;
  }

  return distribution;
}

export function getDomainCoverage(objectives: { domains: LearningDomain[] }[]): LearningDomain[] {
  const covered = new Set<LearningDomain>();
  for (const obj of objectives) {
    for (const domain of obj.domains) {
      covered.add(domain);
    }
  }
  return Array.from(covered);
}
