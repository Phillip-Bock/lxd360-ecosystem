/**
 * Cognitive Load Calculator - Core algorithms for load analysis
 * Implements NASA-TLX, Paas Scale, and Leppink's 3-Component Model
 */

import {
  type CognitiveLoadResult,
  type ContentMetrics,
  DEFAULT_THRESHOLDS,
  type InspireStage,
  type LeppinkComponents,
  type LoadLevel,
  type NasaTlxDimensions,
  type PaasScale,
  type Recommendation,
} from './types';

/** Weight factors for different content elements */
const ELEMENT_WEIGHTS = {
  word: 0.01,
  sentence: 0.1,
  paragraph: 0.3,
  image: 1.5,
  video: 3.0,
  audio: 2.0,
  interaction: 2.5,
  question: 2.0,
} as const;

/** Interactivity multipliers based on element relationships */
const INTERACTIVITY_MULTIPLIERS = {
  isolated: 1.0,
  sequential: 1.5,
  interconnected: 2.2,
} as const;

/**
 * Calculate intrinsic load based on content complexity
 * Intrinsic load = inherent difficulty of the material
 */
function calculateIntrinsicLoad(metrics: ContentMetrics): number {
  const baseComplexity =
    metrics.wordCount * ELEMENT_WEIGHTS.word +
    metrics.sentenceCount * ELEMENT_WEIGHTS.sentence +
    metrics.conceptDensity * 15;

  const interactivityMultiplier = INTERACTIVITY_MULTIPLIERS[metrics.elementInteractivity];

  const readabilityFactor = Math.max(0, (100 - metrics.readabilityScore) / 100);

  const rawScore = baseComplexity * interactivityMultiplier * (1 + readabilityFactor * 0.5);

  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Calculate extraneous load based on design elements
 * Extraneous load = cognitive burden from poor design
 */
function calculateExtraneousLoad(metrics: ContentMetrics): number {
  const mediaCount = metrics.imageCount + metrics.videoCount + metrics.audioCount;
  const contentToMediaRatio = metrics.wordCount > 0 ? mediaCount / (metrics.wordCount / 100) : 0;

  let designBurden = 0;

  // Too many media elements per content = visual clutter
  if (contentToMediaRatio > 0.5) {
    designBurden += (contentToMediaRatio - 0.5) * 20;
  }

  // Very long content without breaks
  if (metrics.paragraphCount > 0) {
    const avgWordsPerParagraph = metrics.wordCount / metrics.paragraphCount;
    if (avgWordsPerParagraph > 150) {
      designBurden += (avgWordsPerParagraph - 150) * 0.1;
    }
  }

  // Too many interactions can overwhelm
  if (metrics.interactionCount > 5) {
    designBurden += (metrics.interactionCount - 5) * 3;
  }

  // Duration mismatch with content
  const expectedDuration = metrics.wordCount / 200 + mediaCount * 2;
  const durationMismatch = Math.abs(expectedDuration - metrics.estimatedDurationMinutes);
  if (durationMismatch > 5) {
    designBurden += durationMismatch * 2;
  }

  return Math.min(100, Math.max(0, designBurden));
}

/**
 * Calculate germane load based on learning-productive elements
 * Germane load = effort directed toward schema construction
 */
function calculateGermaneLoad(metrics: ContentMetrics): number {
  let productiveEffort = 0;

  // Questions promote schema building
  productiveEffort += metrics.questionCount * 5;

  // Interactions that aren't overwhelming
  const effectiveInteractions = Math.min(metrics.interactionCount, 5);
  productiveEffort += effectiveInteractions * 4;

  // Balanced media supports learning
  const balancedMedia = Math.min(metrics.imageCount + metrics.videoCount, metrics.wordCount / 200);
  productiveEffort += balancedMedia * 3;

  // Good readability promotes schema integration
  if (metrics.readabilityScore > 60) {
    productiveEffort += (metrics.readabilityScore - 60) * 0.3;
  }

  return Math.min(100, Math.max(0, productiveEffort));
}

/**
 * Calculate Leppink's 3-Component Model scores
 */
function calculateLeppinkComponents(metrics: ContentMetrics): LeppinkComponents {
  return {
    intrinsicLoad: calculateIntrinsicLoad(metrics),
    extraneousLoad: calculateExtraneousLoad(metrics),
    germaneLoad: calculateGermaneLoad(metrics),
  };
}

/**
 * Predict NASA-TLX dimensions from content metrics
 */
function predictNasaTlx(metrics: ContentMetrics, leppink: LeppinkComponents): NasaTlxDimensions {
  const totalLoad = leppink.intrinsicLoad + leppink.extraneousLoad;

  return {
    mentalDemand: Math.min(100, leppink.intrinsicLoad * 1.2),
    physicalDemand: Math.min(100, metrics.interactionCount * 5),
    temporalDemand: Math.min(100, (metrics.wordCount / metrics.estimatedDurationMinutes) * 0.3),
    performance: Math.max(0, 100 - totalLoad * 0.8),
    effort: Math.min(100, totalLoad * 0.9),
    frustration: Math.min(100, leppink.extraneousLoad * 1.5),
  };
}

/**
 * Predict Paas Mental Effort Scale (1-9)
 */
function predictPaasScale(leppink: LeppinkComponents): PaasScale {
  const totalLoad = leppink.intrinsicLoad + leppink.extraneousLoad;

  return {
    mentalEffort: Math.min(9, Math.max(1, 1 + totalLoad * 0.08)),
    perceivedDifficulty: Math.min(9, Math.max(1, 1 + leppink.intrinsicLoad * 0.08)),
  };
}

/**
 * Determine load level from total score
 */
function determineLoadLevel(total: number): LoadLevel {
  if (total < DEFAULT_THRESHOLDS.optimal.min) return 'low';
  if (total <= DEFAULT_THRESHOLDS.optimal.max) return 'optimal';
  if (total <= DEFAULT_THRESHOLDS.high.max) return 'high';
  return 'overload';
}

/**
 * Generate actionable recommendations based on analysis
 */
function generateRecommendations(
  metrics: ContentMetrics,
  leppink: LeppinkComponents,
  inspireStage?: InspireStage,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // High extraneous load recommendations
  if (leppink.extraneousLoad > 30) {
    if (metrics.imageCount + metrics.videoCount > metrics.wordCount / 100) {
      recommendations.push({
        id: 'reduce-media',
        priority: 'high',
        category: 'design',
        message: 'Too many media elements may overwhelm learners',
        action: 'Consider removing decorative images or consolidating videos',
        impactScore: leppink.extraneousLoad * 0.4,
      });
    }

    if (metrics.paragraphCount > 0 && metrics.wordCount / metrics.paragraphCount > 150) {
      recommendations.push({
        id: 'break-paragraphs',
        priority: 'medium',
        category: 'content',
        message: 'Long text blocks increase cognitive burden',
        action: 'Break content into shorter paragraphs (aim for 3-4 sentences)',
        impactScore: 15,
      });
    }
  }

  // High intrinsic load recommendations
  if (leppink.intrinsicLoad > 50) {
    if (metrics.conceptDensity > 3) {
      recommendations.push({
        id: 'reduce-concepts',
        priority: 'high',
        category: 'content',
        message: 'High concept density may overwhelm working memory',
        action: 'Spread concepts across multiple lessons or add scaffolding',
        impactScore: leppink.intrinsicLoad * 0.3,
      });
    }

    if (metrics.elementInteractivity === 'interconnected') {
      recommendations.push({
        id: 'scaffold-complexity',
        priority: 'medium',
        category: 'interaction',
        message: 'Complex element relationships require scaffolding',
        action: 'Add worked examples or progressive disclosure',
        impactScore: 20,
      });
    }
  }

  // Low germane load recommendations
  if (leppink.germaneLoad < 20) {
    if (metrics.questionCount < 2) {
      recommendations.push({
        id: 'add-questions',
        priority: 'medium',
        category: 'interaction',
        message: 'Few knowledge checks limit schema building',
        action: 'Add 2-3 formative assessment questions',
        impactScore: 15,
      });
    }

    if (metrics.interactionCount < 2) {
      recommendations.push({
        id: 'add-interactions',
        priority: 'low',
        category: 'interaction',
        message: 'Limited interactivity may reduce engagement',
        action: 'Consider adding drag-drop, hotspots, or reveal interactions',
        impactScore: 10,
      });
    }
  }

  // INSPIRE stage-specific recommendations
  if (inspireStage) {
    const stageRecommendations = getStageRecommendations(inspireStage, metrics, leppink);
    recommendations.push(...stageRecommendations);
  }

  // Sort by priority and impact
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impactScore - a.impactScore;
  });

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Get INSPIRE stage-specific recommendations
 */
function getStageRecommendations(
  stage: InspireStage,
  metrics: ContentMetrics,
  leppink: LeppinkComponents,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  switch (stage) {
    case 'intrigue':
      if (metrics.wordCount > 200) {
        recommendations.push({
          id: 'intrigue-brevity',
          priority: 'medium',
          category: 'content',
          message: 'Intrigue stage should be brief and engaging',
          action: 'Reduce to hook statement and visual (under 100 words)',
          impactScore: 12,
        });
      }
      break;

    case 'scaffold':
      if (leppink.intrinsicLoad > 40 && metrics.interactionCount < 3) {
        recommendations.push({
          id: 'scaffold-support',
          priority: 'high',
          category: 'interaction',
          message: 'Complex content needs more scaffolding',
          action: 'Add guided examples, tooltips, or step-by-step reveals',
          impactScore: 25,
        });
      }
      break;

    case 'practice':
      if (metrics.questionCount < 3) {
        recommendations.push({
          id: 'practice-questions',
          priority: 'high',
          category: 'interaction',
          message: 'Practice stage requires active learning opportunities',
          action: 'Add at least 3 practice questions or scenarios',
          impactScore: 20,
        });
      }
      break;

    case 'reflect':
      if (metrics.interactionCount < 1) {
        recommendations.push({
          id: 'reflect-prompt',
          priority: 'medium',
          category: 'interaction',
          message: 'Reflection needs interactive prompts',
          action: 'Add reflection questions or journaling activity',
          impactScore: 15,
        });
      }
      break;
  }

  return recommendations;
}

/**
 * Main calculator function - analyzes content and returns full result
 */
export function calculateCognitiveLoad(
  metrics: ContentMetrics,
  inspireStage?: InspireStage,
): CognitiveLoadResult {
  const leppink = calculateLeppinkComponents(metrics);

  // Total load: intrinsic + extraneous (germane is productive)
  // Germane offsets some of the burden by making it worthwhile
  const total = Math.min(
    100,
    leppink.intrinsicLoad + leppink.extraneousLoad - leppink.germaneLoad * 0.3,
  );

  const nasaTlx = predictNasaTlx(metrics, leppink);
  const paas = predictPaasScale(leppink);
  const level = determineLoadLevel(total);

  const recommendations = generateRecommendations(metrics, leppink, inspireStage);

  // Calculate ratio (total load vs optimal capacity of ~60)
  const ratio = total / 60;

  return {
    intrinsic: Math.round(leppink.intrinsicLoad),
    extraneous: Math.round(leppink.extraneousLoad),
    germane: Math.round(leppink.germaneLoad),
    total: Math.round(total),
    ratio: Math.round(ratio * 100) / 100,
    level,
    recommendations,
    leppink,
    nasaTlx,
    paas,
    inspireStage,
    analyzedAt: new Date(),
  };
}

/**
 * Extract metrics from raw content (placeholder for integration)
 * In production, this would parse lesson blocks
 */
export function extractMetricsFromContent(content: {
  text?: string;
  blocks?: Array<{ type: string; content?: string }>;
}): ContentMetrics {
  const text = content.text || '';
  const blocks = content.blocks || [];

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const imageCount = blocks.filter((b) => b.type === 'image').length;
  const videoCount = blocks.filter((b) => b.type === 'video').length;
  const audioCount = blocks.filter((b) => b.type === 'audio').length;
  const interactionCount = blocks.filter((b) =>
    ['hotspot', 'dragdrop', 'reveal', 'tabs'].includes(b.type),
  ).length;
  const questionCount = blocks.filter((b) =>
    ['quiz', 'question', 'assessment'].includes(b.type),
  ).length;

  // Simple readability approximation (Flesch-Kincaid inspired)
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgSyllablesPerWord = 1.5; // Approximation
  const readabilityScore = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord),
  );

  // Concept density: unique terms / total words (simplified)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const conceptDensity = words.length > 0 ? (uniqueWords.size / words.length) * 10 : 0;

  // Estimate interactivity level
  let elementInteractivity: ContentMetrics['elementInteractivity'] = 'isolated';
  if (interactionCount > 3 || videoCount > 2) {
    elementInteractivity = 'interconnected';
  } else if (interactionCount > 0 || videoCount > 0) {
    elementInteractivity = 'sequential';
  }

  // Estimate duration: ~200 wpm reading + media time
  const estimatedDurationMinutes =
    words.length / 200 + videoCount * 3 + audioCount * 2 + interactionCount * 1;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    imageCount,
    videoCount,
    audioCount,
    interactionCount,
    questionCount,
    conceptDensity: Math.round(conceptDensity * 10) / 10,
    readabilityScore: Math.round(readabilityScore),
    elementInteractivity,
    estimatedDurationMinutes: Math.round(estimatedDurationMinutes * 10) / 10,
  };
}

/**
 * Quick load check for real-time feedback
 */
export function getQuickLoadLevel(metrics: ContentMetrics): LoadLevel {
  const result = calculateCognitiveLoad(metrics);
  return result.level;
}
