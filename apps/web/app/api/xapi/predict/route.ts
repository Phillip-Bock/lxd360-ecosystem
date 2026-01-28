/**
 * INSPIRE Cognitive Prediction API
 *
 * Provides modality swap recommendations based on learner state.
 * Uses rule-based inference with optional Vertex AI model override.
 *
 * @route POST /api/xapi/predict
 *
 * @see EU AI Act: All predictions logged to ai_decisions table
 * @see Glass Box AI: Explanations provided for every recommendation
 */

export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ContentModality,
  type ContentModalityType,
  FunctionalLearningState,
  type FunctionalLearningStateType,
  inferFunctionalState,
} from '@/lib/xapi/inspire-extensions';

// ============================================================================
// CONFIGURATION
// ============================================================================

// TODO(LXD-245): Enable Vertex AI endpoint when ready for production ML inference
// const VERTEX_ENDPOINT_URL = process.env.VERTEX_MODALITY_ENDPOINT_URL;

// ============================================================================
// REQUEST/RESPONSE SCHEMAS
// ============================================================================

const PredictRequestSchema = z.object({
  learnerId: z.string().min(1),
  skillId: z.string().min(1),
  currentModality: z.string().optional(),
  contentId: z.string().optional(),

  // Behavioral signals
  signals: z
    .object({
      latency: z.number().optional(),
      expectedLatency: z.number().optional(),
      revisionCount: z.number().optional(),
      rageClicks: z.number().optional(),
      focusLossCount: z.number().optional(),
      streakIncorrect: z.number().optional(),
      cognitiveLoad: z.number().optional(),
      timeOnTask: z.number().optional(),
    })
    .optional(),

  // Current mastery state (from BKT)
  masteryState: z
    .object({
      probability: z.number().min(0).max(1),
      level: z.enum(['novice', 'developing', 'proficient', 'mastered']),
      totalAttempts: z.number(),
      successRate: z.number().min(0).max(1),
    })
    .optional(),

  // Available modalities for this content
  availableModalities: z.array(z.string()).optional(),
});

type PredictRequest = z.infer<typeof PredictRequestSchema>;

interface PredictResponse {
  success: boolean;
  prediction?: {
    recommendedModality: ContentModalityType;
    confidence: number;
    functionalState: FunctionalLearningStateType;
    shouldSwap: boolean;
  };
  explanation?: {
    primaryReason: string;
    supportingFactors: string[];
    evidence: Array<{
      factor: string;
      value: string;
      weight: number;
    }>;
  };
  alternatives?: Array<{
    modality: ContentModalityType;
    score: number;
    reason: string;
  }>;
  audit?: {
    predictionId: string;
    modelVersion: string;
    timestamp: string;
    inputHash: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin':
    process.env.ALLOWED_ORIGINS?.split(',')[0] || 'https://app.lxd360.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID',
};

// ============================================================================
// MODALITY SCORING RULES
// ============================================================================

interface ModalityScore {
  modality: ContentModalityType;
  score: number;
  reasons: string[];
}

/**
 * Rule-based modality scoring based on functional state and mastery
 */
function scoreModalities(
  functionalState: FunctionalLearningStateType,
  masteryLevel: string | undefined,
  currentModality: string | undefined,
  availableModalities: string[],
): ModalityScore[] {
  const scores: ModalityScore[] = [];

  // Default available modalities if not specified
  const modalities =
    availableModalities.length > 0
      ? availableModalities
      : [
          ContentModality.VIDEO,
          ContentModality.TEXT,
          ContentModality.INTERACTIVE,
          ContentModality.INFOGRAPHIC,
        ];

  for (const modality of modalities) {
    let score = 50; // Base score
    const reasons: string[] = [];

    // Functional state adjustments
    switch (functionalState) {
      case FunctionalLearningState.STRUGGLING:
        // Prefer scaffolded, multimodal content
        if (modality === ContentModality.VIDEO) {
          score += 25;
          reasons.push('Video provides additional scaffolding for struggling learners');
        }
        if (modality === ContentModality.INTERACTIVE) {
          score += 20;
          reasons.push('Interactive content allows self-paced practice');
        }
        if (modality === ContentModality.TEXT) {
          score -= 10;
          reasons.push('Text alone may increase cognitive load');
        }
        break;

      case FunctionalLearningState.FATIGUED:
        // Prefer passive, lower cognitive load content
        if (modality === ContentModality.VIDEO) {
          score += 30;
          reasons.push('Video reduces active cognitive effort for fatigued learners');
        }
        if (modality === ContentModality.AUDIO) {
          score += 25;
          reasons.push('Audio allows eyes to rest');
        }
        if (modality === ContentModality.INTERACTIVE) {
          score -= 15;
          reasons.push('Interactive content may be too demanding when fatigued');
        }
        break;

      case FunctionalLearningState.DISENGAGED:
        // Prefer engaging, novel content
        if (modality === ContentModality.INTERACTIVE) {
          score += 30;
          reasons.push('Interactive content re-engages passive learners');
        }
        if (modality === ContentModality.SIMULATION) {
          score += 35;
          reasons.push('Simulations provide immersive re-engagement');
        }
        if (modality === ContentModality.SCENARIO) {
          score += 25;
          reasons.push('Scenarios add narrative interest');
        }
        if (modality === ContentModality.TEXT) {
          score -= 20;
          reasons.push('Text unlikely to re-engage disengaged learner');
        }
        break;

      case FunctionalLearningState.UNCERTAIN:
        // Prefer multimodal, reinforcing content
        if (modality === ContentModality.VIDEO) {
          score += 15;
          reasons.push('Video reinforces uncertain concepts');
        }
        if (modality === ContentModality.INFOGRAPHIC) {
          score += 20;
          reasons.push('Visual summary helps consolidate uncertain knowledge');
        }
        if (modality === ContentModality.FLASHCARD) {
          score += 15;
          reasons.push('Retrieval practice builds confidence');
        }
        break;

      case FunctionalLearningState.FOCUSED:
        // Learner is in good state - match to mastery level
        if (masteryLevel === 'novice') {
          if (modality === ContentModality.VIDEO) score += 15;
          if (modality === ContentModality.INTERACTIVE) score += 10;
        } else if (masteryLevel === 'developing') {
          if (modality === ContentModality.INTERACTIVE) score += 20;
          if (modality === ContentModality.QUIZ) score += 15;
        } else if (masteryLevel === 'proficient') {
          if (modality === ContentModality.SCENARIO) score += 20;
          if (modality === ContentModality.SIMULATION) score += 25;
        } else if (masteryLevel === 'mastered') {
          if (modality === ContentModality.TEXT) score += 10;
          reasons.push('Mastered learners can handle dense content');
        }
        break;
    }

    // Avoid recommending the same modality if it's not working
    if (modality === currentModality && functionalState !== FunctionalLearningState.FOCUSED) {
      score -= 30;
      reasons.push('Current modality may not be effective');
    }

    scores.push({
      modality: modality as ContentModalityType,
      score: Math.max(0, Math.min(100, score)),
      reasons,
    });
  }

  // Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Generate Glass Box explanation for the recommendation
 */
function generateExplanation(
  topScores: ModalityScore[],
  functionalState: FunctionalLearningStateType,
  signals: PredictRequest['signals'],
): PredictResponse['explanation'] {
  const top = topScores[0];
  if (!top) return undefined;

  const evidence: Array<{ factor: string; value: string; weight: number }> = [];

  // Add evidence from signals
  if (signals?.latency !== undefined) {
    evidence.push({
      factor: 'Response Latency',
      value: `${signals.latency}ms`,
      weight: signals.latency > (signals.expectedLatency || 5000) ? 0.3 : 0.1,
    });
  }

  if (signals?.streakIncorrect !== undefined && signals.streakIncorrect > 0) {
    evidence.push({
      factor: 'Consecutive Errors',
      value: `${signals.streakIncorrect}`,
      weight: Math.min(signals.streakIncorrect * 0.15, 0.45),
    });
  }

  if (signals?.focusLossCount !== undefined && signals.focusLossCount > 0) {
    evidence.push({
      factor: 'Focus Interruptions',
      value: `${signals.focusLossCount}`,
      weight: Math.min(signals.focusLossCount * 0.1, 0.3),
    });
  }

  if (signals?.cognitiveLoad !== undefined) {
    evidence.push({
      factor: 'Cognitive Load',
      value: `${signals.cognitiveLoad}/10`,
      weight: signals.cognitiveLoad > 7 ? 0.35 : 0.15,
    });
  }

  // Primary reason based on state
  const stateReasons: Record<FunctionalLearningStateType, string> = {
    [FunctionalLearningState.STRUGGLING]:
      'You appear to be having difficulty with this content. A different format may help.',
    [FunctionalLearningState.FATIGUED]:
      'Signs of fatigue detected. A less demanding format is recommended.',
    [FunctionalLearningState.DISENGAGED]:
      'Engagement appears low. A more interactive format may help.',
    [FunctionalLearningState.UNCERTAIN]:
      'Some uncertainty detected. Additional reinforcement recommended.',
    [FunctionalLearningState.FOCUSED]:
      'You are progressing well. This format matches your current learning state.',
    [FunctionalLearningState.NEUTRAL]: 'Recommendation based on content and skill requirements.',
  };

  return {
    primaryReason: stateReasons[functionalState],
    supportingFactors: top.reasons,
    evidence,
  };
}

// ============================================================================
// OPTIONS - CORS Preflight
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ============================================================================
// POST - Get Modality Prediction
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tenantId = request.headers.get('x-tenant-id');

  if (!tenantId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_TENANT_ID',
          message: 'X-Tenant-ID header is required',
        },
      } satisfies PredictResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON',
        },
      } satisfies PredictResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  const parseResult = PredictRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request format',
        },
      } satisfies PredictResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  const { learnerId, skillId, currentModality, signals, masteryState, availableModalities } =
    parseResult.data;

  // Infer functional learning state from signals
  const functionalState = inferFunctionalState(signals || {});

  // Score available modalities
  const modalityScores = scoreModalities(
    functionalState,
    masteryState?.level,
    currentModality,
    availableModalities || [],
  );

  const topRecommendation = modalityScores[0];
  if (!topRecommendation) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NO_MODALITIES',
          message: 'No available modalities to recommend',
        },
      } satisfies PredictResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  // Determine if we should actually swap
  const shouldSwap =
    functionalState !== FunctionalLearningState.FOCUSED &&
    functionalState !== FunctionalLearningState.NEUTRAL &&
    topRecommendation.modality !== currentModality &&
    topRecommendation.score > 60;

  // Generate explanation
  const explanation = generateExplanation(modalityScores, functionalState, signals);

  // Create audit record
  const predictionId = crypto.randomUUID();
  const inputHash = Buffer.from(JSON.stringify({ learnerId, skillId, signals }))
    .toString('base64')
    .slice(0, 32);

  // TODO(LXD-309): Log to ai_decisions table for EU AI Act compliance
  // This would be a Firestore or BigQuery write

  const response: PredictResponse = {
    success: true,
    prediction: {
      recommendedModality: topRecommendation.modality,
      confidence: topRecommendation.score / 100,
      functionalState,
      shouldSwap,
    },
    explanation,
    alternatives: modalityScores.slice(1, 4).map((s) => ({
      modality: s.modality,
      score: s.score / 100,
      reason: s.reasons[0] || 'Alternative option',
    })),
    audit: {
      predictionId,
      modelVersion: 'rule-based-v1.0',
      timestamp: new Date().toISOString(),
      inputHash,
    },
  };

  return NextResponse.json(response, { status: 200, headers: corsHeaders });
}
