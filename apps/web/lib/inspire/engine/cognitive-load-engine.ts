import type {
  BloomsCognitiveLevel,
  CognitiveLoadMetrics,
  CognitiveLoadRecommendation,
  ICESLevel,
  ILMIModality,
} from '../types/inspire-types';

// ============================================================================
// SECTION 1: COGNITIVE LOAD CONSTANTS & THRESHOLDS
// ============================================================================

/**
 * Working memory capacity constraints
 * Based on Cowan (2001) - approximately 4 chunks, with individual variation
 */
export const WORKING_MEMORY = {
  /** Optimal number of new elements to present at once */
  OPTIMAL_CHUNKS: 4,

  /** Maximum before significant degradation */
  MAX_CHUNKS: 7,

  /** For novice learners, reduce further */
  NOVICE_CHUNKS: 3,

  /** Duration in seconds that working memory holds without rehearsal */
  RETENTION_SECONDS: 18,
};

/**
 * Cognitive load thresholds
 * These determine when warnings/recommendations are triggered
 */
export const LOAD_THRESHOLDS = {
  /** Below this, learning is likely not challenging enough */
  TOO_LOW: 30,

  /** Optimal range for learning */
  OPTIMAL_MIN: 40,
  OPTIMAL_MAX: 70,

  /** Above this, learners may struggle */
  HIGH: 80,

  /** Above this, learning likely breaks down */
  CRITICAL: 90,
};

/**
 * NASA-TLX dimension weights
 * Standard weights from Hart & Staveland (1988)
 * Scale: 0-100 for each dimension
 */
export const NASA_TLX_DIMENSIONS = {
  mentalDemand: {
    weight: 1.0,
    description: 'How mentally demanding is the task?',
  },
  physicalDemand: {
    weight: 0.3, // Lower weight for e-learning
    description: 'How physically demanding is the task?',
  },
  temporalDemand: {
    weight: 0.8,
    description: 'How hurried or rushed is the pace?',
  },
  performance: {
    weight: 0.9,
    description: 'How successful in accomplishing goals?',
  },
  effort: {
    weight: 1.0,
    description: 'How hard to work to achieve performance?',
  },
  frustration: {
    weight: 0.9,
    description: 'How insecure, discouraged, stressed?',
  },
};

/**
 * Paas Scale reference
 * 9-point scale for self-reported mental effort
 */
export const PAAS_SCALE = {
  1: 'Very, very low mental effort',
  2: 'Very low mental effort',
  3: 'Low mental effort',
  4: 'Rather low mental effort',
  5: 'Neither low nor high mental effort',
  6: 'Rather high mental effort',
  7: 'High mental effort',
  8: 'Very high mental effort',
  9: 'Very, very high mental effort',
};

/**
 * Intrinsic load factors based on content characteristics
 * These contribute to the inherent complexity of material
 */
export const INTRINSIC_LOAD_FACTORS = {
  /** Number of interacting elements in the content */
  elementInteractivity: {
    low: 10, // Independent elements (e.g., vocabulary)
    medium: 25, // Some interaction (e.g., simple procedures)
    high: 45, // Many interactions (e.g., complex systems)
    veryHigh: 65, // Highly integrated (e.g., troubleshooting)
  },

  /** Cognitive complexity per Bloom's Taxonomy */
  bloomsLevel: {
    remember: 5,
    understand: 15,
    apply: 30,
    analyze: 45,
    evaluate: 55,
    create: 65,
  },

  /** Prior knowledge modifier (reduces intrinsic load) */
  priorKnowledge: {
    none: 1.2, // Increases load
    basic: 1.0, // No modifier
    intermediate: 0.8,
    advanced: 0.6,
    expert: 0.4, // Significantly reduces load
  },
};

/**
 * Extraneous load factors based on design choices
 * These are things we can control and should minimize
 */
export const EXTRANEOUS_LOAD_FACTORS = {
  /** Split attention effect (Sweller) */
  splitAttention: {
    integrated: 0, // Text and graphics integrated
    adjacent: 10, // Near each other
    separated: 25, // On different parts of screen
    differentScreens: 40, // Must navigate between
  },

  /** Redundancy effect */
  redundancy: {
    none: 0, // Each element serves unique purpose
    some: 10, // Minor redundancy
    moderate: 20, // Same info in multiple formats unnecessarily
    high: 35, // Significant redundancy
  },

  /** Modality effect (using both visual and auditory channels) */
  modalityMismatch: {
    optimal: 0, // Narration + graphics (no text)
    good: 5, // Some text, some narration
    suboptimal: 15, // Text only when narration would help
    poor: 25, // Narration reading on-screen text
  },

  /** Navigation complexity */
  navigationComplexity: {
    linear: 0, // Simple linear flow
    minimal: 5, // Few choices
    moderate: 15, // Multiple options
    complex: 30, // Many branches, hard to follow
  },

  /** Visual clutter */
  visualClutter: {
    clean: 0, // Minimal, purposeful design
    acceptable: 10, // Some decoration
    cluttered: 25, // Too many elements
    overwhelming: 40, // Chaos
  },

  /** Instructions clarity */
  instructionClarity: {
    excellent: 0, // Crystal clear
    good: 5, // Clear with minor ambiguity
    fair: 15, // Some confusion likely
    poor: 30, // Unclear, frustrating
  },
};

/**
 * Germane load factors - productive learning effort
 * We want to maximize this while keeping total load manageable
 */
export const GERMANE_LOAD_FACTORS = {
  /** Active processing required */
  activeProcessing: {
    passive: 10, // Just reading/watching
    responsive: 25, // Answering questions
    constructive: 40, // Building/creating
    interactive: 55, // Collaborating, discussing
  },

  /** Schema formation support */
  schemaSupport: {
    none: 5, // No help connecting to prior knowledge
    examples: 15, // Examples provided
    analogies: 25, // Connections to familiar concepts
    scaffolded: 40, // Progressive building
  },

  /** Retrieval practice */
  retrievalPractice: {
    none: 0,
    occasional: 15,
    frequent: 30,
    spaced: 45, // Spaced retrieval (optimal)
  },

  /** Variability in practice */
  variability: {
    none: 5, // Same context always
    low: 15, // Some variation
    moderate: 25, // Good variation
    high: 35, // Diverse contexts (best for transfer)
  },
};

// ============================================================================
// SECTION 2: CONTENT ANALYSIS TYPES
// ============================================================================

/**
 * Input for cognitive load analysis
 * This describes the content/experience to be analyzed
 */
export interface ContentAnalysisInput {
  /** Unique identifier for the content */
  contentId: string;

  /** Content title */
  title: string;

  /** Duration in minutes */
  durationMinutes: number;

  /** Number of new concepts introduced */
  newConceptCount: number;

  /** Number of steps/procedures to learn */
  procedureStepCount: number;

  /** Bloom's Taxonomy level of objectives */
  bloomsLevel: BloomsCognitiveLevel;

  /** Element interactivity level */
  elementInteractivity: 'low' | 'medium' | 'high' | 'veryHigh';

  /** Learner's prior knowledge level */
  priorKnowledge: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';

  /** ICES engagement level */
  icesLevel: ICESLevel;

  /** Primary modality */
  primaryModality: ILMIModality;

  /** Secondary modality */
  secondaryModality?: ILMIModality;

  // Design factors (for extraneous load calculation)
  design: {
    /** Split attention factor */
    splitAttention: 'integrated' | 'adjacent' | 'separated' | 'differentScreens';

    /** Redundancy level */
    redundancy: 'none' | 'some' | 'moderate' | 'high';

    /** Modality match quality */
    modalityMatch: 'optimal' | 'good' | 'suboptimal' | 'poor';

    /** Navigation complexity */
    navigationComplexity: 'linear' | 'minimal' | 'moderate' | 'complex';

    /** Visual design quality */
    visualClutter: 'clean' | 'acceptable' | 'cluttered' | 'overwhelming';

    /** Instruction clarity */
    instructionClarity: 'excellent' | 'good' | 'fair' | 'poor';
  };

  // Engagement factors (for germane load calculation)
  engagement: {
    /** Level of active processing required */
    activeProcessing: 'passive' | 'responsive' | 'constructive' | 'interactive';

    /** Schema support provided */
    schemaSupport: 'none' | 'examples' | 'analogies' | 'scaffolded';

    /** Retrieval practice level */
    retrievalPractice: 'none' | 'occasional' | 'frequent' | 'spaced';

    /** Practice variability */
    variability: 'none' | 'low' | 'moderate' | 'high';
  };
}

// ============================================================================
// SECTION 3: COGNITIVE LOAD CALCULATION ENGINE
// ============================================================================

/**
 * Calculate intrinsic cognitive load
 * Intrinsic load is determined by content complexity and learner characteristics
 *
 * @param input - Content analysis input
 * @returns Intrinsic load score (0-100)
 */
export function calculateIntrinsicLoad(input: ContentAnalysisInput): number {
  // Base load from element interactivity
  let baseLoad = INTRINSIC_LOAD_FACTORS.elementInteractivity[input.elementInteractivity];

  // Add Bloom's level contribution (higher cognitive levels = more load)
  const bloomsContribution = INTRINSIC_LOAD_FACTORS.bloomsLevel[input.bloomsLevel];
  baseLoad += bloomsContribution * 0.4; // 40% weight for Bloom's level

  // Factor in number of new concepts
  // Each new concept beyond 4 adds to load (working memory limit)
  const conceptOverload = Math.max(0, input.newConceptCount - WORKING_MEMORY.OPTIMAL_CHUNKS);
  baseLoad += conceptOverload * 3;

  // Factor in procedure steps
  // Complex procedures with many steps increase load
  if (input.procedureStepCount > 5) {
    baseLoad += (input.procedureStepCount - 5) * 2;
  }

  // Apply prior knowledge modifier
  // Prior knowledge reduces the effective intrinsic load
  const priorKnowledgeModifier = INTRINSIC_LOAD_FACTORS.priorKnowledge[input.priorKnowledge];
  baseLoad *= priorKnowledgeModifier;

  // Duration factor - longer content accumulates more load
  // But this plateaus (fatigue is separate from instantaneous load)
  const durationFactor = Math.min(1.3, 1 + (input.durationMinutes / 60) * 0.3);
  baseLoad *= durationFactor;

  // Cap at 100
  return Math.min(100, Math.round(baseLoad));
}

/**
 * Calculate extraneous cognitive load
 * Extraneous load comes from poor design - we want to minimize this!
 *
 * @param input - Content analysis input
 * @returns Extraneous load score (0-100)
 */
export function calculateExtraneousLoad(input: ContentAnalysisInput): number {
  const { design } = input;

  // Sum up all extraneous load factors
  let load = 0;

  load += EXTRANEOUS_LOAD_FACTORS.splitAttention[design.splitAttention];
  load += EXTRANEOUS_LOAD_FACTORS.redundancy[design.redundancy];
  load += EXTRANEOUS_LOAD_FACTORS.modalityMismatch[design.modalityMatch];
  load += EXTRANEOUS_LOAD_FACTORS.navigationComplexity[design.navigationComplexity];
  load += EXTRANEOUS_LOAD_FACTORS.visualClutter[design.visualClutter];
  load += EXTRANEOUS_LOAD_FACTORS.instructionClarity[design.instructionClarity];

  // Normalize to 0-100 scale
  // Max possible from factors above is about 200, so we scale
  const normalizedLoad = Math.min(100, Math.round(load * 0.5));

  return normalizedLoad;
}

/**
 * Calculate germane cognitive load
 * Germane load is productive learning effort - we want to maximize this!
 *
 * @param input - Content analysis input
 * @returns Germane load score (0-100)
 */
export function calculateGermaneLoad(input: ContentAnalysisInput): number {
  const { engagement } = input;

  // Sum up germane load factors
  let load = 0;

  load += GERMANE_LOAD_FACTORS.activeProcessing[engagement.activeProcessing];
  load += GERMANE_LOAD_FACTORS.schemaSupport[engagement.schemaSupport];
  load += GERMANE_LOAD_FACTORS.retrievalPractice[engagement.retrievalPractice];
  load += GERMANE_LOAD_FACTORS.variability[engagement.variability];

  // ICES level contributes to germane load
  // Higher engagement levels facilitate more productive processing
  const icesContribution: Record<ICESLevel, number> = {
    passive: 5,
    reflective: 15,
    active: 25,
    collaborative: 35,
    exploratory: 45,
    immersive: 55,
  };
  load += icesContribution[input.icesLevel];

  // Multimodal learning can enhance germane processing (dual coding)
  if (input.secondaryModality && input.secondaryModality !== input.primaryModality) {
    load += 10;
  }

  // Normalize - max from above is about 200
  return Math.min(100, Math.round(load * 0.55));
}

/**
 * Calculate NASA-TLX prediction score
 * This predicts what learners would report on a NASA-TLX assessment
 *
 * @param intrinsic - Intrinsic load score
 * @param extraneous - Extraneous load score
 * @param germane - Germane load score
 * @param input - Additional content analysis input
 * @returns NASA-TLX prediction (0-100)
 */
export function calculateNASATLXPrediction(
  intrinsic: number,
  extraneous: number,
  germane: number,
  input: ContentAnalysisInput,
): number {
  // Mental Demand - influenced by intrinsic load and cognitive level
  const mentalDemand =
    intrinsic * 0.7 + INTRINSIC_LOAD_FACTORS.bloomsLevel[input.bloomsLevel] * 0.5;

  // Physical Demand - low for e-learning, but VR/kinesthetic has some
  let physicalDemand = 10;
  if (input.primaryModality === 'kinesthetic') {
    physicalDemand = 30;
  }

  // Temporal Demand - influenced by duration and pacing
  const temporalDemand = Math.min(80, 30 + (input.durationMinutes / 30) * 20);

  // Performance (inverted) - high germane = better perceived performance
  const performanceInverted = Math.max(0, 100 - germane);

  // Effort - combination of all loads
  const effort = (intrinsic + extraneous + germane) / 3;

  // Frustration - primarily from extraneous load
  const frustration = extraneous * 1.2;

  // Weighted average using NASA-TLX weights
  const weights = NASA_TLX_DIMENSIONS;
  const weightedSum =
    mentalDemand * weights.mentalDemand.weight +
    physicalDemand * weights.physicalDemand.weight +
    temporalDemand * weights.temporalDemand.weight +
    performanceInverted * weights.performance.weight +
    effort * weights.effort.weight +
    frustration * weights.frustration.weight;

  const totalWeight =
    weights.mentalDemand.weight +
    weights.physicalDemand.weight +
    weights.temporalDemand.weight +
    weights.performance.weight +
    weights.effort.weight +
    weights.frustration.weight;

  const tlxScore = weightedSum / totalWeight;

  return Math.min(100, Math.max(0, Math.round(tlxScore)));
}

/**
 * Calculate Paas Scale prediction
 * This predicts the 1-9 mental effort rating learners would report
 *
 * @param totalLoad - Total cognitive load (0-100)
 * @returns Paas Scale prediction (1-9)
 */
export function calculatePaasPrediction(totalLoad: number): number {
  // Map 0-100 total load to 1-9 Paas scale
  // Using a slightly non-linear mapping (low loads are easily distinguished,
  // high loads cluster together in experience)

  if (totalLoad < 15) return 1;
  if (totalLoad < 25) return 2;
  if (totalLoad < 35) return 3;
  if (totalLoad < 45) return 4;
  if (totalLoad < 55) return 5;
  if (totalLoad < 65) return 6;
  if (totalLoad < 75) return 7;
  if (totalLoad < 85) return 8;
  return 9;
}

/**
 * Generate cognitive load recommendations
 * These are actionable suggestions to optimize the learning experience
 *
 * @param intrinsic - Intrinsic load score
 * @param extraneous - Extraneous load score
 * @param germane - Germane load score
 * @param input - Content analysis input
 * @returns Array of recommendations
 */
export function generateRecommendations(
  intrinsic: number,
  extraneous: number,
  germane: number,
  input: ContentAnalysisInput,
): CognitiveLoadRecommendation[] {
  const recommendations: CognitiveLoadRecommendation[] = [];
  let recommendationId = 1;

  // ─────────────────────────────────────────────────────────────────────────
  // INTRINSIC LOAD RECOMMENDATIONS
  // ─────────────────────────────────────────────────────────────────────────

  if (intrinsic > LOAD_THRESHOLDS.HIGH) {
    // Too many new concepts at once
    if (input.newConceptCount > WORKING_MEMORY.OPTIMAL_CHUNKS) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'intrinsic',
        priority: 'critical',
        recommendation: 'Too many new concepts introduced at once.',
        action: `Split content into smaller chunks with ${WORKING_MEMORY.OPTIMAL_CHUNKS} or fewer new concepts per section. Consider creating prerequisite modules.`,
        expectedImpact: -15,
        autoFixAvailable: false,
      });
    }

    // Complex procedures need scaffolding
    if (input.procedureStepCount > 5) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'intrinsic',
        priority: 'high',
        recommendation: 'Complex procedure may overwhelm working memory.',
        action:
          'Break the procedure into sub-procedures of 3-5 steps each. Provide job aids or checklists for reference during practice.',
        expectedImpact: -10,
        autoFixAvailable: false,
      });
    }

    // High cognitive level without sufficient scaffolding
    if (
      ['analyze', 'evaluate', 'create'].includes(input.bloomsLevel) &&
      input.engagement.schemaSupport !== 'scaffolded'
    ) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'intrinsic',
        priority: 'high',
        recommendation: `High-level cognitive task (${input.bloomsLevel}) needs more scaffolding.`,
        action:
          'Add worked examples, provide step-by-step guidance initially, then gradually remove supports (fading). Use analogies to connect to prior knowledge.',
        expectedImpact: -12,
        autoFixAvailable: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXTRANEOUS LOAD RECOMMENDATIONS
  // ─────────────────────────────────────────────────────────────────────────

  if (extraneous > 20) {
    // Split attention issues
    if (
      input.design.splitAttention === 'separated' ||
      input.design.splitAttention === 'differentScreens'
    ) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'extraneous',
        priority: 'critical',
        recommendation:
          'Split attention effect detected - learners must mentally integrate separated information.',
        action:
          'Integrate related text and graphics. Place labels directly on diagrams rather than in a separate legend. Embed explanations within the relevant visual.',
        expectedImpact: -20,
        autoFixAvailable: true,
        autoFixId: 'integrate-split-content',
      });
    }

    // Redundancy issues
    if (input.design.redundancy === 'moderate' || input.design.redundancy === 'high') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'extraneous',
        priority: 'high',
        recommendation:
          'Redundant content detected - same information presented multiple times unnecessarily.',
        action:
          'Remove redundant text that duplicates narration. Use text OR audio, not both saying the same thing. Each element should serve a unique purpose.',
        expectedImpact: -15,
        autoFixAvailable: true,
        autoFixId: 'remove-redundancy',
      });
    }

    // Modality mismatch
    if (input.design.modalityMatch === 'poor') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'extraneous',
        priority: 'high',
        recommendation: 'Modality mismatch - narration is reading on-screen text verbatim.',
        action:
          'Use narration to explain visuals while keeping text minimal. Or use text only without narration. Avoid the "redundancy effect" of identical audio and visual text.',
        expectedImpact: -18,
        autoFixAvailable: false,
      });
    }

    // Visual clutter
    if (
      input.design.visualClutter === 'cluttered' ||
      input.design.visualClutter === 'overwhelming'
    ) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'extraneous',
        priority: 'high',
        recommendation: 'Visual clutter is overwhelming the content.',
        action:
          "Remove decorative elements that don't support learning. Use whitespace strategically. Apply the coherence principle - every element should serve the learning objective.",
        expectedImpact: -15,
        autoFixAvailable: true,
        autoFixId: 'reduce-clutter',
      });
    }

    // Unclear instructions
    if (input.design.instructionClarity === 'fair' || input.design.instructionClarity === 'poor') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'extraneous',
        priority: 'high',
        recommendation: 'Instructions are unclear and may cause confusion.',
        action:
          'Rewrite instructions using simple, direct language. Number sequential steps. Highlight key actions. Test with users unfamiliar with the content.',
        expectedImpact: -12,
        autoFixAvailable: false,
      });
    }

    // Complex navigation
    if (input.design.navigationComplexity === 'complex') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'extraneous',
        priority: 'medium',
        recommendation: 'Navigation is too complex - learners may get lost.',
        action:
          'Simplify navigation structure. Provide clear progress indicators. Add a sitemap or table of contents. Consider reducing branching or adding breadcrumbs.',
        expectedImpact: -10,
        autoFixAvailable: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GERMANE LOAD RECOMMENDATIONS (Opportunities to increase productive load)
  // ─────────────────────────────────────────────────────────────────────────

  if (germane < 40 && intrinsic + extraneous < LOAD_THRESHOLDS.OPTIMAL_MAX) {
    // Passive learning
    if (input.engagement.activeProcessing === 'passive') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'germane',
        priority: 'high',
        recommendation: 'Passive learning - learners are not actively processing.',
        action:
          'Add questions, interactions, or practice activities. Require learners to do something with the information, not just read/watch.',
        expectedImpact: 15,
        autoFixAvailable: false,
      });
    }

    // No retrieval practice
    if (input.engagement.retrievalPractice === 'none') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'germane',
        priority: 'high',
        recommendation: 'No retrieval practice - memory not being strengthened.',
        action:
          'Add frequent low-stakes quizzes or knowledge checks. Retrieval practice is one of the most powerful learning techniques. Consider spaced retrieval.',
        expectedImpact: 20,
        autoFixAvailable: false,
      });
    }

    // No schema support
    if (input.engagement.schemaSupport === 'none') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'germane',
        priority: 'medium',
        recommendation: 'No connections to prior knowledge.',
        action:
          'Add examples, analogies, or advance organizers that connect new content to what learners already know. This helps build mental schemas.',
        expectedImpact: 12,
        autoFixAvailable: false,
      });
    }

    // Low variability
    if (input.engagement.variability === 'none' || input.engagement.variability === 'low') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'germane',
        priority: 'medium',
        recommendation: 'Limited practice variability may reduce transfer.',
        action:
          'Vary practice contexts and examples. Interleave different types of problems. This improves ability to apply learning in new situations.',
        expectedImpact: 10,
        autoFixAvailable: false,
      });
    }

    // Could use higher ICES level
    if (input.icesLevel === 'passive' || input.icesLevel === 'reflective') {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        loadType: 'germane',
        priority: 'medium',
        recommendation: 'Cognitive engagement level is low - consider more active approaches.',
        action:
          'Consider adding active, collaborative, exploratory, or immersive elements where appropriate for the learning objectives.',
        expectedImpact: 15,
        autoFixAvailable: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOTAL LOAD WARNINGS
  // ─────────────────────────────────────────────────────────────────────────

  const totalLoad = intrinsic + extraneous + germane;

  if (totalLoad > LOAD_THRESHOLDS.CRITICAL) {
    recommendations.unshift({
      id: `rec-critical`,
      loadType: 'extraneous',
      priority: 'critical',
      recommendation:
        '⚠️ CRITICAL: Total cognitive load is extremely high. Learning will likely break down.',
      action:
        'Immediately reduce content complexity, simplify design, and/or break into smaller chunks. Consider whether all content is necessary for objectives.',
      expectedImpact: -30,
      autoFixAvailable: false,
    });
  } else if (totalLoad > LOAD_THRESHOLDS.HIGH) {
    recommendations.unshift({
      id: `rec-high`,
      loadType: 'extraneous',
      priority: 'high',
      recommendation: '⚠️ High cognitive load detected. Learners may struggle.',
      action:
        'Review recommendations below to reduce extraneous load and manage intrinsic load through scaffolding.',
      expectedImpact: -15,
      autoFixAvailable: false,
    });
  } else if (totalLoad < LOAD_THRESHOLDS.TOO_LOW) {
    recommendations.push({
      id: `rec-low`,
      loadType: 'germane',
      priority: 'low',
      recommendation: 'Cognitive load is very low - content may not be challenging enough.',
      action:
        'Consider whether objectives are appropriately challenging. Add productive struggle through problem-solving, application, or deeper analysis.',
      expectedImpact: 10,
      autoFixAvailable: false,
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

// ============================================================================
// SECTION 4: MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform complete cognitive load analysis
 * This is the main entry point for analyzing content
 *
 * @param input - Content analysis input
 * @returns Complete cognitive load metrics with recommendations
 */
export function analyzeCognitiveLoad(input: ContentAnalysisInput): CognitiveLoadMetrics {
  // Calculate the three types of cognitive load
  const intrinsicLoad = calculateIntrinsicLoad(input);
  const extraneousLoad = calculateExtraneousLoad(input);
  const germaneLoad = calculateGermaneLoad(input);

  // Total load (note: this can exceed 100 if design is very poor)
  // But working memory is a shared resource, so we cap display at 100
  const totalLoad = Math.min(100, intrinsicLoad + extraneousLoad);

  // Calculate predictive measures
  const nasaTlxPrediction = calculateNASATLXPrediction(
    intrinsicLoad,
    extraneousLoad,
    germaneLoad,
    input,
  );
  const paasScaleEstimate = calculatePaasPrediction(totalLoad);

  // Generate recommendations
  const recommendations = generateRecommendations(
    intrinsicLoad,
    extraneousLoad,
    germaneLoad,
    input,
  );

  return {
    intrinsicLoad,
    extraneousLoad,
    germaneLoad,
    totalLoad,
    nasaTlxPrediction,
    paasScaleEstimate,
    timestamp: new Date(),
    recommendations,
  };
}

// ============================================================================
// SECTION 5: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a human-readable interpretation of the cognitive load level
 *
 * @param totalLoad - Total cognitive load (0-100)
 * @returns Interpretation string
 */
export function interpretCognitiveLoad(totalLoad: number): {
  level: 'optimal' | 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  color: string;
} {
  if (totalLoad < LOAD_THRESHOLDS.TOO_LOW) {
    return {
      level: 'low',
      description: 'Cognitive load is low - may not be sufficiently challenging for learning.',
      color: '#60A5FA', // Blue
    };
  } else if (totalLoad <= LOAD_THRESHOLDS.OPTIMAL_MAX) {
    return {
      level: 'optimal',
      description: 'Cognitive load is in the optimal zone for effective learning.',
      color: '#34D399', // Green
    };
  } else if (totalLoad <= LOAD_THRESHOLDS.HIGH) {
    return {
      level: 'moderate',
      description: 'Cognitive load is moderate - some learners may find it challenging.',
      color: '#FBBF24', // Yellow
    };
  } else if (totalLoad < LOAD_THRESHOLDS.CRITICAL) {
    return {
      level: 'high',
      description: 'Cognitive load is high - many learners will struggle.',
      color: '#F97316', // Orange
    };
  } else {
    return {
      level: 'critical',
      description: 'Cognitive load is critical - learning will likely break down.',
      color: '#EF4444', // Red
    };
  }
}

/**
 * Get the Paas Scale description for a given score
 *
 * @param score - Paas scale score (1-9)
 * @returns Description string
 */
export function getPaasDescription(score: number): string {
  const normalizedScore = Math.max(1, Math.min(9, Math.round(score))) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9;
  return PAAS_SCALE[normalizedScore];
}

/**
 * Calculate the efficiency score
 * Higher is better - indicates good learning outcomes relative to effort
 * Based on Paas & van Merriënboer (1993)
 *
 * @param performance - Performance score (0-100)
 * @param mentalEffort - Mental effort score (0-100)
 * @returns Efficiency score (-3 to +3 range typically)
 */
export function calculateEfficiency(performance: number, mentalEffort: number): number {
  // Standardize to z-scores (assuming mean=50, sd=16.67 for 0-100 scale)
  const zPerformance = (performance - 50) / 16.67;
  const zEffort = (mentalEffort - 50) / 16.67;

  // Efficiency = (Performance - Effort) / sqrt(2)
  // Positive = good (high performance, low effort)
  // Negative = poor (low performance, high effort)
  return (zPerformance - zEffort) / Math.sqrt(2);
}

/**
 * Create a default/empty analysis input for initializing forms
 *
 * @param contentId - Content identifier
 * @param title - Content title
 * @returns Default ContentAnalysisInput
 */
export function createDefaultAnalysisInput(contentId: string, title: string): ContentAnalysisInput {
  return {
    contentId,
    title,
    durationMinutes: 15,
    newConceptCount: 3,
    procedureStepCount: 0,
    bloomsLevel: 'understand',
    elementInteractivity: 'medium',
    priorKnowledge: 'basic',
    icesLevel: 'active',
    primaryModality: 'visual',
    design: {
      splitAttention: 'adjacent',
      redundancy: 'none',
      modalityMatch: 'good',
      navigationComplexity: 'minimal',
      visualClutter: 'clean',
      instructionClarity: 'good',
    },
    engagement: {
      activeProcessing: 'responsive',
      schemaSupport: 'examples',
      retrievalPractice: 'occasional',
      variability: 'low',
    },
  };
}

// ============================================================================
// END OF COGNITIVE LOAD ENGINE
// ============================================================================
