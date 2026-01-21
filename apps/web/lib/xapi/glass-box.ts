// ============================================================================
// INSPIRE IGNITE — Glass Box AI Explanation Generator
// LRS-First Implementation: Step 3b
// Location: lib/xapi/glass-box.ts
// Version: 1.0.0
// ============================================================================
//
// PURPOSE: Generate human-readable explanations for AI decisions
// COMPLIANCE: EU AI Act Article 13 (Transparency) requirements
//
// ============================================================================

import type { FluencyZone, ICDTLevel, Modality } from './cognitive-utils';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface GlassBoxExplanation {
  recommendation_id: string;

  // What was recommended
  recommendation: {
    type: 'content' | 'path' | 'intervention' | 'assessment' | 'modality_swap';
    item_id?: string;
    item_title?: string;
    confidence: number;
  };

  // Why it was recommended (human-readable)
  primary_reason: string;
  supporting_factors: string[];
  evidence: {
    factor: string;
    value: string;
    weight: number;
  }[];

  // Learner override options
  override_options: {
    can_skip: boolean;
    can_adjust_difficulty: boolean;
    can_change_modality: boolean;
    alternatives: {
      item_id: string;
      title: string;
      reason: string;
    }[];
  };

  // Audit trail
  audit: {
    model_version: string;
    feature_vector_hash: string;
    timestamp: string;
    decision_path: string[];
  };
}

export interface InterventionContext {
  type: 'modality_swap' | 'difficulty_adjust' | 'break_suggestion' | 'scaffold' | 'encouragement';
  reason: string;
  suggested_action?: string;
  suggested_modality?: Modality;
}

export interface ExplanationInput {
  cognitiveLoad: number;
  fluencyZone: FluencyZone;
  intervention?: InterventionContext;
  statement: {
    verb?: { id: string };
    result?: { success?: boolean; score?: { scaled?: number } };
    context?: {
      extensions?: Record<string, unknown>;
    };
  };
  learnerProfile?: {
    preferred_modality?: Modality;
    avg_cognitive_load?: number;
    streak_current?: number;
    is_cold_start?: boolean;
  };
  contentMetadata?: {
    title?: string;
    icdt_level?: ICDTLevel;
    modality?: Modality;
  };
}

// ----------------------------------------------------------------------------
// EXPLANATION TEMPLATES
// ----------------------------------------------------------------------------

const INTERVENTION_EXPLANATIONS: Record<string, (ctx: ExplanationInput) => string> = {
  modality_swap: (ctx) => {
    const currentModality = ctx.contentMetadata?.modality ?? 'textual';
    const suggestedModality = ctx.intervention?.suggested_modality ?? 'visual';
    return (
      `We noticed you're spending more time than usual on this ${currentModality} content. ` +
      `Research shows that switching to ${suggestedModality} learning can help when you're ` +
      `feeling stuck. Would you like to try a different approach?`
    );
  },

  difficulty_adjust: (ctx) => {
    const direction = ctx.cognitiveLoad > 7 ? 'easier' : 'more challenging';
    return (
      `Based on your responses, this content might be ${ctx.cognitiveLoad > 7 ? 'too challenging' : 'too easy'} ` +
      `right now. We can adjust to ${direction} material that better matches your current level.`
    );
  },

  break_suggestion: () =>
    `You've been learning intensely! Taking a short break can actually help your brain ` +
    `consolidate what you've learned. Research shows that spaced practice leads to better ` +
    `long-term retention.`,

  scaffold: (ctx) => {
    const topic = ctx.contentMetadata?.title ?? 'this topic';
    return (
      `Let's break down ${topic} into smaller steps. Sometimes complex ideas are easier ` +
      `to understand when we tackle them piece by piece.`
    );
  },

  encouragement: (ctx) => {
    const streak = ctx.learnerProfile?.streak_current ?? 0;
    if (streak > 5) {
      return `Great job! You're on a ${streak}-answer streak. Keep up the excellent work!`;
    }
    return (
      `Everyone encounters challenges while learning. Your effort is what matters most, ` +
      `and you're making progress!`
    );
  },
};

const FLUENCY_ZONE_EXPLANATIONS: Record<FluencyZone, string> = {
  too_fast:
    'Your quick response suggests you might be guessing. Take a moment to think through the answer.',
  fluency: 'You answered confidently and correctly — this indicates solid understanding.',
  thinking:
    'You took time to think through your answer, which is perfectly normal for this type of question.',
  struggle:
    'This question took longer than expected. Consider reviewing the foundational concepts.',
};

const COGNITIVE_LOAD_EXPLANATIONS: Record<number, string> = {
  1: 'This content is well within your comfort zone.',
  2: 'This content is well within your comfort zone.',
  3: 'This content is appropriately challenging for learning.',
  4: 'This content is appropriately challenging for learning.',
  5: 'This content is at an optimal difficulty level.',
  6: 'This content is at an optimal difficulty level.',
  7: 'This content is pushing your limits — great for growth!',
  8: 'This content requires significant mental effort.',
  9: 'This content may be overwhelming. Consider breaking it into smaller parts.',
  10: 'This content is very demanding. A different approach might help.',
};

// ----------------------------------------------------------------------------
// EXPLANATION GENERATORS
// ----------------------------------------------------------------------------

/**
 * Generate a human-readable Glass Box explanation for an AI decision
 *
 * This function creates transparent explanations that:
 * 1. Tell learners WHAT was decided
 * 2. Explain WHY in plain language
 * 3. Provide evidence supporting the decision
 * 4. Offer alternatives and override options
 *
 * @param input - Context for generating the explanation
 * @returns Complete Glass Box explanation
 */
export async function generateGlassBoxExplanation(
  input: ExplanationInput,
): Promise<GlassBoxExplanation> {
  const recommendationId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // Determine recommendation type
  const recommendationType =
    input.intervention?.type ?? (input.cognitiveLoad > 7 ? 'intervention' : 'assessment');

  // Generate primary reason
  const primaryReason = generatePrimaryReason(input);

  // Generate supporting factors
  const supportingFactors = generateSupportingFactors(input);

  // Build evidence array
  const evidence = buildEvidence(input);

  // Determine override options
  const overrideOptions = determineOverrideOptions(input);

  // Build decision path for audit
  const decisionPath = buildDecisionPath(input);

  return {
    recommendation_id: recommendationId,

    recommendation: {
      type: recommendationType as GlassBoxExplanation['recommendation']['type'],
      item_id: input.contentMetadata?.title ? crypto.randomUUID() : undefined,
      item_title: input.contentMetadata?.title,
      confidence: calculateConfidence(input),
    },

    primary_reason: primaryReason,
    supporting_factors: supportingFactors,
    evidence,

    override_options: overrideOptions,

    audit: {
      model_version: '1.0.0',
      feature_vector_hash: hashFeatures(input),
      timestamp,
      decision_path: decisionPath,
    },
  };
}

/**
 * Generate the primary reason for the recommendation
 */
function generatePrimaryReason(input: ExplanationInput): string {
  // If there's a specific intervention, use its template
  if (input.intervention) {
    const template = INTERVENTION_EXPLANATIONS[input.intervention.type];
    if (template) {
      return template(input);
    }
    return input.intervention.reason;
  }

  // Generate based on cognitive load
  const loadLevel = Math.round(input.cognitiveLoad);
  const loadExplanation = COGNITIVE_LOAD_EXPLANATIONS[loadLevel] ?? COGNITIVE_LOAD_EXPLANATIONS[5];

  // Add fluency context
  const fluencyExplanation = FLUENCY_ZONE_EXPLANATIONS[input.fluencyZone];

  return `${loadExplanation} ${fluencyExplanation}`;
}

/**
 * Generate supporting factors for the decision
 */
function generateSupportingFactors(input: ExplanationInput): string[] {
  const factors: string[] = [];

  // Cognitive load factor
  if (input.cognitiveLoad > 7) {
    factors.push('High cognitive load detected — you may benefit from a different approach');
  } else if (input.cognitiveLoad < 4) {
    factors.push('Low cognitive load — you might be ready for more challenging content');
  }

  // Fluency zone factor
  if (input.fluencyZone === 'struggle') {
    factors.push('Extended response times suggest this topic needs more review');
  } else if (input.fluencyZone === 'too_fast') {
    factors.push("Very quick responses — ensure you're reading questions carefully");
  }

  // Learning profile factors
  if (input.learnerProfile?.is_cold_start) {
    factors.push(
      "We're still learning your preferences — recommendations will improve with more interactions",
    );
  }

  if (input.learnerProfile?.preferred_modality && input.contentMetadata?.modality) {
    if (input.learnerProfile.preferred_modality !== input.contentMetadata.modality) {
      factors.push(
        `This content uses ${input.contentMetadata.modality} format, but you typically prefer ${input.learnerProfile.preferred_modality}`,
      );
    }
  }

  // Success/failure context
  if (input.statement.result?.success === false) {
    factors.push('Incorrect answer — reviewing related concepts may help');
  } else if (input.statement.result?.success === true) {
    factors.push('Correct answer — building on this success');
  }

  return factors;
}

/**
 * Build evidence array with weights
 */
function buildEvidence(input: ExplanationInput): GlassBoxExplanation['evidence'] {
  const evidence: GlassBoxExplanation['evidence'] = [];

  evidence.push({
    factor: 'Cognitive Load',
    value: `${input.cognitiveLoad.toFixed(1)}/10`,
    weight: 0.3,
  });

  evidence.push({
    factor: 'Fluency Zone',
    value: input.fluencyZone,
    weight: 0.25,
  });

  if (input.statement.result?.success !== undefined) {
    evidence.push({
      factor: 'Answer Correctness',
      value: input.statement.result.success ? 'Correct' : 'Incorrect',
      weight: 0.2,
    });
  }

  if (input.learnerProfile?.avg_cognitive_load) {
    evidence.push({
      factor: 'Historical Average Load',
      value: `${input.learnerProfile.avg_cognitive_load.toFixed(1)}/10`,
      weight: 0.15,
    });
  }

  if (input.contentMetadata?.icdt_level) {
    evidence.push({
      factor: 'Task Complexity',
      value: input.contentMetadata.icdt_level.toUpperCase(),
      weight: 0.1,
    });
  }

  return evidence;
}

/**
 * Determine what override options are available
 */
function determineOverrideOptions(
  input: ExplanationInput,
): GlassBoxExplanation['override_options'] {
  const alternatives: GlassBoxExplanation['override_options']['alternatives'] = [];

  // Always offer modality alternatives
  const modalities: Modality[] = ['visual', 'auditory', 'textual', 'kinesthetic'];
  const currentModality = input.contentMetadata?.modality ?? 'textual';

  for (const modality of modalities) {
    if (modality !== currentModality) {
      alternatives.push({
        item_id: `alt-${modality}`,
        title: `Switch to ${modality} version`,
        reason: `Try learning this content through ${modality} means`,
      });
    }
  }

  return {
    can_skip: true,
    can_adjust_difficulty: true,
    can_change_modality: true,
    alternatives: alternatives.slice(0, 3), // Limit to 3 alternatives
  };
}

/**
 * Build decision path for audit trail
 */
function buildDecisionPath(input: ExplanationInput): string[] {
  const path: string[] = [];

  path.push('RECEIVE_XAPI_STATEMENT');
  path.push(`CALCULATE_COGNITIVE_LOAD: ${input.cognitiveLoad.toFixed(2)}`);
  path.push(`CLASSIFY_FLUENCY_ZONE: ${input.fluencyZone}`);

  if (input.cognitiveLoad > 7) {
    path.push('THRESHOLD_EXCEEDED: cognitive_load > 7');
    path.push('EVALUATE_INTERVENTION_OPTIONS');
  }

  if (input.intervention) {
    path.push(`SELECT_INTERVENTION: ${input.intervention.type}`);
  } else {
    path.push('NO_INTERVENTION_REQUIRED');
  }

  path.push('GENERATE_EXPLANATION');
  path.push('RETURN_RESULT');

  return path;
}

/**
 * Calculate confidence score for the recommendation
 */
function calculateConfidence(input: ExplanationInput): number {
  let confidence = 0.5; // Base confidence

  // Higher confidence with more data
  if (input.learnerProfile && !input.learnerProfile.is_cold_start) {
    confidence += 0.2;
  }

  // Higher confidence with clear signals
  if (input.fluencyZone === 'struggle' || input.fluencyZone === 'fluency') {
    confidence += 0.15;
  }

  // Higher confidence with consistent patterns
  if (input.cognitiveLoad > 8 || input.cognitiveLoad < 3) {
    confidence += 0.1;
  }

  return Math.min(0.95, confidence);
}

/**
 * Hash input features for reproducibility verification
 */
function hashFeatures(input: ExplanationInput): string {
  const features = {
    cognitiveLoad: input.cognitiveLoad,
    fluencyZone: input.fluencyZone,
    hasIntervention: !!input.intervention,
    interventionType: input.intervention?.type,
    success: input.statement.result?.success,
    isColdStart: input.learnerProfile?.is_cold_start,
  };

  // Simple hash for demo - production would use proper hashing
  const str = JSON.stringify(features);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ----------------------------------------------------------------------------
// EXPLANATION FORMATTERS
// ----------------------------------------------------------------------------

/**
 * Format explanation for display in the HUD overlay
 */
export function formatForHUD(explanation: GlassBoxExplanation): {
  headline: string;
  detail: string;
  actions: { label: string; action: string }[];
} {
  const headline =
    explanation.recommendation.type === 'intervention'
      ? 'We have a suggestion for you'
      : 'Learning insight';

  const detail = explanation.primary_reason;

  const actions = [
    { label: 'Got it', action: 'dismiss' },
    { label: 'Tell me more', action: 'expand' },
  ];

  if (explanation.override_options.can_skip) {
    actions.push({ label: 'Skip this', action: 'skip' });
  }

  return { headline, detail, actions };
}

/**
 * Format explanation for accessibility (screen readers)
 */
export function formatForAccessibility(explanation: GlassBoxExplanation): string {
  const lines: string[] = [];

  lines.push(`AI Recommendation: ${explanation.recommendation.type}`);
  lines.push(`Reason: ${explanation.primary_reason}`);

  if (explanation.supporting_factors.length > 0) {
    lines.push('Supporting factors:');
    explanation.supporting_factors.forEach((factor, i) => {
      lines.push(`${i + 1}. ${factor}`);
    });
  }

  lines.push(`Confidence: ${(explanation.recommendation.confidence * 100).toFixed(0)}%`);
  lines.push('You can override this recommendation at any time.');

  return lines.join('. ');
}

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export const GlassBox = {
  generateGlassBoxExplanation,
  formatForHUD,
  formatForAccessibility,
};

export default GlassBox;
