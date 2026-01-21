'use client';

import type { ModalityType } from '@/schemas/inspire';

// ============================================================================
// LOCAL UI TYPES
// ============================================================================

/**
 * Modality option for UI display
 */
export interface ModalityOption {
  id: ModalityType;
  name: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
  cognitiveChannel: 'visual' | 'auditory' | 'kinesthetic' | 'social';
  dualCodingPairs: ModalityType[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const MODALITY_CATALOG: ModalityOption[] = [
  {
    id: 'visual',
    name: 'Visual',
    description: 'Images, diagrams, animations, videos, charts, and infographics',
    icon: 'eye',
    color: 'text-blue-500',
    examples: ['Diagrams', 'Animations', 'Infographics', 'Screenshots'],
    cognitiveChannel: 'visual',
    dualCodingPairs: ['auditory', 'textual'],
  },
  {
    id: 'auditory',
    name: 'Auditory',
    description: 'Narration, podcasts, sound effects, music, and voice guidance',
    icon: 'volume-2',
    color: 'text-purple-500',
    examples: ['Narration', 'Podcasts', 'Sound effects', 'Ambient audio'],
    cognitiveChannel: 'auditory',
    dualCodingPairs: ['visual', 'kinesthetic'],
  },
  {
    id: 'textual',
    name: 'Textual',
    description: 'Written content, captions, instructions, and reading materials',
    icon: 'file-text',
    color: 'text-gray-400',
    examples: ['Articles', 'Instructions', 'Captions', 'Documentation'],
    cognitiveChannel: 'visual',
    dualCodingPairs: ['visual', 'auditory'],
  },
  {
    id: 'kinesthetic',
    name: 'Kinesthetic',
    description: 'Hands-on activities, simulations, drag-drop, and physical interaction',
    icon: 'hand',
    color: 'text-green-500',
    examples: ['Simulations', 'Drag & Drop', 'Interactive labs', 'VR/AR'],
    cognitiveChannel: 'kinesthetic',
    dualCodingPairs: ['visual', 'auditory'],
  },
  {
    id: 'social-async',
    name: 'Social/Async',
    description: 'Discussion forums, peer feedback, collaborative tasks, and social learning',
    icon: 'users',
    color: 'text-indigo-500',
    examples: ['Forums', 'Peer review', 'Group projects', 'Comments'],
    cognitiveChannel: 'social',
    dualCodingPairs: ['textual', 'visual'],
  },
  {
    id: 'gamified',
    name: 'Gamified',
    description: 'Game mechanics, challenges, rewards, leaderboards, and story elements',
    icon: 'gamepad-2',
    color: 'text-pink-500',
    examples: ['Quests', 'Badges', 'Leaderboards', 'Story mode'],
    cognitiveChannel: 'visual',
    dualCodingPairs: ['kinesthetic', 'auditory'],
  },
  {
    id: 'reflective',
    name: 'Reflective',
    description: 'Journals, self-assessment, metacognitive prompts, and reflection exercises',
    icon: 'brain',
    color: 'text-amber-500',
    examples: ['Learning journals', 'Self-quizzes', 'Reflection prompts'],
    cognitiveChannel: 'visual',
    dualCodingPairs: ['textual', 'social-async'],
  },
  {
    id: 'contextual-situated',
    name: 'Contextual/Situated',
    description: 'Real-world scenarios, job-embedded learning, and authentic contexts',
    icon: 'map-pin',
    color: 'text-emerald-500',
    examples: ['Case studies', 'Scenarios', 'On-the-job', 'Simulations'],
    cognitiveChannel: 'kinesthetic',
    dualCodingPairs: ['visual', 'kinesthetic'],
  },
];

/**
 * Get modality option by ID
 */
export function getModalityOption(id: ModalityType): ModalityOption | undefined {
  return MODALITY_CATALOG.find((m) => m.id === id);
}

/**
 * Calculate dual coding score
 * Based on Paivio's dual coding theory - combining visual + verbal channels is most effective
 */
export function calculateDualCodingScore(
  primary: ModalityType | undefined,
  secondary: ModalityType | undefined,
): { score: number; valid: boolean; recommendation: string } {
  if (!primary) {
    return { score: 0, valid: false, recommendation: 'Select a primary modality' };
  }

  if (!secondary) {
    return {
      score: 30,
      valid: false,
      recommendation: 'Add a secondary modality for dual coding benefits',
    };
  }

  const primaryOption = getModalityOption(primary);
  const secondaryOption = getModalityOption(secondary);

  if (!primaryOption || !secondaryOption) {
    return { score: 0, valid: false, recommendation: 'Invalid modality selection' };
  }

  // Check if they form a valid dual coding pair
  const isValidPair = primaryOption.dualCodingPairs.includes(secondary);

  // Check cognitive channels
  const differentChannels = primaryOption.cognitiveChannel !== secondaryOption.cognitiveChannel;

  // Optimal pair: Visual + Auditory
  const isOptimalPair =
    (primary === 'visual' && secondary === 'auditory') ||
    (primary === 'auditory' && secondary === 'visual');

  if (isOptimalPair) {
    return {
      score: 100,
      valid: true,
      recommendation: 'Optimal dual coding: Visual + Auditory engages both cognitive channels',
    };
  }

  if (isValidPair && differentChannels) {
    return {
      score: 85,
      valid: true,
      recommendation: 'Strong dual coding: Different cognitive channels engaged',
    };
  }

  if (isValidPair) {
    return {
      score: 70,
      valid: true,
      recommendation: 'Good combination, but both modalities use similar channels',
    };
  }

  if (differentChannels) {
    return {
      score: 50,
      valid: false,
      recommendation: 'Different channels but not an ideal pairing for this content type',
    };
  }

  return {
    score: 30,
    valid: false,
    recommendation: 'Consider selecting modalities from different cognitive channels',
  };
}

/**
 * Get recommended interactions based on modalities
 */
export function getRecommendedInteractions(
  primary: ModalityType | undefined,
  secondary: ModalityType | undefined,
): string[] {
  const interactions: string[] = [];

  if (primary === 'visual' || secondary === 'visual') {
    interactions.push('Interactive diagrams', 'Animated explainers', 'Visual quizzes');
  }

  if (primary === 'auditory' || secondary === 'auditory') {
    interactions.push('Narrated walkthroughs', 'Audio feedback', 'Podcast segments');
  }

  if (primary === 'kinesthetic' || secondary === 'kinesthetic') {
    interactions.push('Drag-drop activities', 'Simulations', 'Hands-on labs');
  }

  if (primary === 'gamified' || secondary === 'gamified') {
    interactions.push('Achievement unlocks', 'Challenge modes', 'Leaderboard tasks');
  }

  if (primary === 'social-async' || secondary === 'social-async') {
    interactions.push('Discussion prompts', 'Peer feedback', 'Collaborative tasks');
  }

  if (primary === 'reflective' || secondary === 'reflective') {
    interactions.push('Journal entries', 'Self-assessment', 'Metacognitive checkpoints');
  }

  return interactions.slice(0, 6);
}
