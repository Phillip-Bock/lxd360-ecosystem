'use client';

import type { NeuroPrinciple, NeuroPrincipleConfig } from '@/schemas/inspire';

// ============================================================================
// LOCAL UI TYPES
// ============================================================================

/**
 * Principle option for UI display
 */
export interface NeuroPrincipleOption {
  id: NeuroPrinciple;
  name: string;
  description: string;
  icon: string;
  color: string;
  techniques: string[];
  researchBasis: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const NEURO_PRINCIPLE_CATALOG: NeuroPrincipleOption[] = [
  {
    id: 'spaced-repetition',
    name: 'Spaced Repetition',
    description: 'Distribute learning over time with increasing intervals to strengthen memory',
    icon: 'calendar-clock',
    color: 'text-blue-500',
    techniques: [
      'Scheduled review sessions',
      'Expanding intervals (1-3-7-14-30 days)',
      'Adaptive spacing based on performance',
    ],
    researchBasis: 'Ebbinghaus forgetting curve, Leitner system',
  },
  {
    id: 'retrieval-practice',
    name: 'Retrieval Practice',
    description: 'Strengthen memory by actively recalling information rather than passive review',
    icon: 'brain',
    color: 'text-purple-500',
    techniques: [
      'Quiz-based assessments',
      'Free recall exercises',
      'Flashcard systems',
      'Practice tests',
    ],
    researchBasis: 'Testing effect, Roediger & Butler (2011)',
  },
  {
    id: 'emotional-arousal',
    name: 'Emotional Arousal',
    description: 'Engage emotions to enhance memory encoding and retention',
    icon: 'heart',
    color: 'text-red-500',
    techniques: [
      'Storytelling with emotional hooks',
      'Real-world consequence scenarios',
      'Personal relevance connections',
    ],
    researchBasis: 'Amygdala-hippocampus interaction, McGaugh (2004)',
  },
  {
    id: 'multisensory-integration',
    name: 'Multisensory Integration',
    description: 'Combine multiple sensory inputs to create richer memory traces',
    icon: 'layers',
    color: 'text-cyan-500',
    techniques: [
      'Audio + Visual combinations',
      'Haptic feedback',
      'Interactive 3D models',
      'Narrated animations',
    ],
    researchBasis: 'Dual coding theory, Paivio (1986)',
  },
  {
    id: 'novelty-curiosity',
    name: 'Novelty & Curiosity',
    description: 'Use novel stimuli and curiosity gaps to increase dopamine and attention',
    icon: 'sparkles',
    color: 'text-yellow-500',
    techniques: ['Surprise reveals', 'Mystery scenarios', 'Unexpected facts', 'Easter eggs'],
    researchBasis: 'Dopaminergic novelty response, Bunzeck & Düzel (2006)',
  },
  {
    id: 'cognitive-load-management',
    name: 'Cognitive Load Management',
    description: 'Optimize information presentation to prevent working memory overload',
    icon: 'gauge',
    color: 'text-green-500',
    techniques: [
      'Chunking (3-5 items)',
      'Progressive disclosure',
      'Worked examples',
      'Segmenting complex content',
    ],
    researchBasis: 'Cognitive Load Theory, Sweller (1988)',
  },
  {
    id: 'social-learning',
    name: 'Social Learning',
    description: 'Learn through observation, imitation, and social interaction',
    icon: 'users',
    color: 'text-indigo-500',
    techniques: [
      'Expert modeling videos',
      'Peer discussions',
      'Collaborative problem-solving',
      'Social proof elements',
    ],
    researchBasis: 'Social Learning Theory, Bandura (1977)',
  },
  {
    id: 'feedback-error-correction',
    name: 'Feedback & Error Correction',
    description: 'Provide timely, specific feedback to reinforce correct responses',
    icon: 'message-circle-warning',
    color: 'text-orange-500',
    techniques: [
      'Immediate feedback',
      'Elaborative feedback',
      'Error analysis',
      'Corrective scaffolding',
    ],
    researchBasis: 'Feedback research, Hattie & Timperley (2007)',
  },
  {
    id: 'metacognition-reflection',
    name: 'Metacognition & Reflection',
    description: "Build awareness of one's own thinking and learning processes",
    icon: 'lightbulb',
    color: 'text-amber-500',
    techniques: [
      'Self-assessment checkpoints',
      'Learning journals',
      'Confidence calibration',
      'Strategy reflection',
    ],
    researchBasis: 'Metacognitive research, Flavell (1979)',
  },
  {
    id: 'contextual-situated',
    name: 'Contextual/Situated Learning',
    description: 'Learn in contexts that match where knowledge will be applied',
    icon: 'map-pin',
    color: 'text-emerald-500',
    techniques: [
      'Realistic simulations',
      'Case studies',
      'On-the-job scenarios',
      'Environment matching',
    ],
    researchBasis: 'Situated cognition, Brown, Collins & Duguid (1989)',
  },
  {
    id: 'motivation-reward',
    name: 'Motivation & Reward',
    description: 'Use intrinsic and extrinsic rewards to sustain engagement',
    icon: 'trophy',
    color: 'text-pink-500',
    techniques: [
      'Achievement badges',
      'Progress visualization',
      'Leaderboards',
      'Unlockable content',
    ],
    researchBasis: 'Self-Determination Theory, Deci & Ryan (2000)',
  },
  {
    id: 'attention-management',
    name: 'Attention Management',
    description: 'Direct and sustain attention through strategic design',
    icon: 'focus',
    color: 'text-rose-500',
    techniques: [
      'Signaling/cueing',
      'Highlighting key info',
      'Removing distractions',
      'Attention resets',
    ],
    researchBasis: 'Attention research, Mayer (2009)',
  },
  {
    id: 'sleep-rest-integration',
    name: 'Sleep & Rest Integration',
    description: 'Design for memory consolidation during sleep and rest periods',
    icon: 'moon',
    color: 'text-slate-400',
    techniques: [
      'Pre-sleep review sessions',
      'Optimal session timing',
      'Microbreak scheduling',
      'Fatigue detection',
    ],
    researchBasis: 'Sleep and memory consolidation, Walker & Stickgold (2006)',
  },
];

/**
 * Get principle option by ID
 */
export function getPrincipleOption(id: NeuroPrinciple): NeuroPrincipleOption | undefined {
  return NEURO_PRINCIPLE_CATALOG.find((p) => p.id === id);
}

/**
 * Create default principle config
 */
export function createDefaultPrincipleConfig(
  principleId: NeuroPrinciple,
  enabled = true,
  priority = 5,
): NeuroPrincipleConfig {
  return {
    principle: principleId,
    enabled,
    priority,
    applicationNotes: undefined,
    techniques: [],
  };
}

/**
 * Get dopamine slider label
 */
export function getDopamineLabel(value: number): { label: string; description: string } {
  if (value <= 2) {
    return {
      label: 'Minimal',
      description: 'Traditional, low-stimulus approach. Suitable for expert audiences.',
    };
  }
  if (value <= 4) {
    return {
      label: 'Conservative',
      description: 'Light gamification with occasional rewards and progress indicators.',
    };
  }
  if (value <= 6) {
    return {
      label: 'Balanced',
      description: 'Moderate engagement mechanics blended with substantive content.',
    };
  }
  if (value <= 8) {
    return {
      label: 'Engaging',
      description: 'Rich gamification with achievements, challenges, and social features.',
    };
  }
  return {
    label: 'Immersive',
    description: 'Full gamification with story, competition, and continuous feedback loops.',
  };
}

/**
 * Get working memory guard description
 */
export function getWorkingMemoryDescription(value: number): string {
  if (value <= 3) {
    return 'Strict limit: Maximum 3 new concepts per segment. Best for complex topics or novice learners.';
  }
  if (value <= 4) {
    return 'Conservative: Maximum 4 new concepts per segment. Good balance for most content.';
  }
  if (value === 5) {
    return 'Standard: Maximum 5 new concepts per segment. Default for typical learning scenarios.';
  }
  if (value <= 6) {
    return 'Extended: Up to 6 concepts per segment. Suitable for experienced or motivated learners.';
  }
  return 'Maximum: Up to 7 concepts per segment. Only for expert audiences with high prior knowledge.';
}
