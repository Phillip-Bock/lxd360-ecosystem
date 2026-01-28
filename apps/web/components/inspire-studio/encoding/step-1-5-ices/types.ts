'use client';

import type { EngagementLevel } from '@/schemas/inspire';

// ============================================================================
// LOCAL UI TYPES
// ============================================================================

/**
 * Engagement level option for UI display
 */
export interface EngagementLevelOption {
  id: EngagementLevel;
  name: string;
  description: string;
  icon: string;
  color: string;
  cognitiveLoadRange: { min: number; max: number };
  examples: string[];
  recommendedFor: string[];
  notRecommendedFor: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ENGAGEMENT_LEVEL_CATALOG: EngagementLevelOption[] = [
  {
    id: 'passive',
    name: 'Passive',
    description: 'Information absorption through reading, watching, or listening',
    icon: 'book-open',
    color: 'text-gray-400',
    cognitiveLoadRange: { min: 1, max: 3 },
    examples: ['Reading articles', 'Watching videos', 'Listening to podcasts'],
    recommendedFor: ['Awareness training', 'Onboarding overviews', 'Reference materials'],
    notRecommendedFor: ['Skill building', 'Complex procedures', 'High-stakes decisions'],
  },
  {
    id: 'reflective',
    name: 'Reflective',
    description: 'Self-paced thinking and metacognitive processing',
    icon: 'brain',
    color: 'text-amber-500',
    cognitiveLoadRange: { min: 2, max: 4 },
    examples: ['Journal prompts', 'Self-assessment', 'Case analysis'],
    recommendedFor: ['Leadership training', 'Ethics courses', 'Personal development'],
    notRecommendedFor: ['Procedural training', 'Time-sensitive skills', 'Compliance basics'],
  },
  {
    id: 'active',
    name: 'Active',
    description: 'Hands-on interaction with content through exercises and practice',
    icon: 'mouse-pointer-click',
    color: 'text-blue-500',
    cognitiveLoadRange: { min: 3, max: 6 },
    examples: ['Interactive quizzes', 'Drag-drop activities', 'Fill-in exercises'],
    recommendedFor: ['Knowledge application', 'Skill practice', 'Process training'],
    notRecommendedFor: ['Executive briefings', 'Quick reference', 'Awareness only'],
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    description: 'Learning with peers through discussion and group work',
    icon: 'users',
    color: 'text-indigo-500',
    cognitiveLoadRange: { min: 4, max: 7 },
    examples: ['Discussion forums', 'Peer review', 'Group projects', 'Cohort learning'],
    recommendedFor: ['Leadership development', 'Problem-solving', 'Organizational change'],
    notRecommendedFor: ['Individual compliance', 'Self-paced certification', 'Quick updates'],
  },
  {
    id: 'exploratory',
    name: 'Exploratory',
    description: 'Open-ended discovery and self-directed investigation',
    icon: 'compass',
    color: 'text-emerald-500',
    cognitiveLoadRange: { min: 5, max: 8 },
    examples: ['Sandbox environments', 'Research tasks', 'Open scenarios'],
    recommendedFor: ['Innovation training', 'Research skills', 'Advanced problem-solving'],
    notRecommendedFor: ['Compliance training', 'Standardized procedures', 'Novice learners'],
  },
  {
    id: 'immersive',
    name: 'Immersive',
    description: 'High-fidelity simulations with realistic stress and consequences',
    icon: 'vr',
    color: 'text-purple-500',
    cognitiveLoadRange: { min: 7, max: 10 },
    examples: ['VR simulations', 'High-stakes scenarios', 'Full procedure walkthroughs'],
    recommendedFor: ['Safety-critical training', 'Emergency response', 'High-stakes decisions'],
    notRecommendedFor: ['Awareness training', 'Cognitive overload risk', 'Limited time'],
  },
];

/**
 * Get engagement level option by ID
 */
export function getEngagementLevelOption(id: EngagementLevel): EngagementLevelOption | undefined {
  return ENGAGEMENT_LEVEL_CATALOG.find((e) => e.id === id);
}

/**
 * Get cognitive load description
 */
export function getCognitiveLoadDescription(value: number): {
  label: string;
  color: string;
  description: string;
} {
  if (value <= 3) {
    return {
      label: 'Low',
      color: 'text-green-500',
      description: 'Minimal mental effort required. Good for foundational content.',
    };
  }
  if (value <= 5) {
    return {
      label: 'Moderate',
      color: 'text-yellow-500',
      description: 'Balanced challenge level. Ideal for skill building.',
    };
  }
  if (value <= 7) {
    return {
      label: 'High',
      color: 'text-orange-500',
      description: 'Significant mental effort. Ensure proper scaffolding.',
    };
  }
  return {
    label: 'Very High',
    color: 'text-red-500',
    description: 'Maximum cognitive demand. Risk of overload for unprepared learners.',
  };
}

/**
 * Validate alignment between engagement level and modality
 */
export function validateModalityAlignment(
  engagementLevel: EngagementLevel,
  primaryModality?: string,
): { valid: boolean; message: string } {
  // Immersive requires kinesthetic or visual
  if (engagementLevel === 'immersive') {
    if (primaryModality === 'kinesthetic' || primaryModality === 'visual') {
      return { valid: true, message: 'Excellent alignment for immersive learning' };
    }
    return {
      valid: false,
      message: 'Immersive engagement works best with kinesthetic or visual modalities',
    };
  }

  // Collaborative requires social modality
  if (engagementLevel === 'collaborative') {
    if (primaryModality === 'social-async') {
      return { valid: true, message: 'Perfect alignment for collaborative learning' };
    }
    return {
      valid: false,
      message: 'Consider adding social/async modality for collaborative engagement',
    };
  }

  // Reflective pairs well with textual
  if (engagementLevel === 'reflective') {
    if (primaryModality === 'textual' || primaryModality === 'reflective') {
      return { valid: true, message: 'Good alignment for reflective learning' };
    }
  }

  // Default: valid but neutral
  return { valid: true, message: 'Modality and engagement level are compatible' };
}

/**
 * Get recommended block types based on engagement level
 */
export function getRecommendedBlockTypes(level: EngagementLevel): string[] {
  const blockMap: Record<EngagementLevel, string[]> = {
    passive: ['Text Block', 'Video Block', 'Image Block', 'Audio Block'],
    reflective: ['Journal Block', 'Self-Assessment', 'Case Study Block'],
    active: ['Quiz Block', 'Hotspot Block', 'Drag-Drop Block', 'Simulation Block'],
    collaborative: ['Discussion Block', 'Peer Review Block', 'Group Task Block'],
    exploratory: ['Sandbox Block', 'Research Task Block', 'Branching Scenario'],
    immersive: ['VR Scene Block', 'Full Simulation', 'Stress Scenario Block'],
  };

  return blockMap[level] || [];
}
