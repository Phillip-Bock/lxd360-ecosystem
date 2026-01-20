import type {
  BandwidthContext,
  CognitiveLoadIndex,
  ElementInteractivity,
  InstructionalEfficiency,
  LeppinkItem,
  NasaTlxRating,
  PaasRating,
} from './types';

/**
 * Calculate NASA-TLX weighted score
 * Formula: Score = Σ(rating × weight) / 15
 */
export function calculateNasaTlx(ratings: NasaTlxRating[]): number {
  if (ratings.length !== 6) {
    throw new Error('NASA-TLX requires exactly 6 dimension ratings');
  }

  const totalWeight = ratings.reduce((sum, r) => sum + (r.weight ?? 1), 0);
  const weightedSum = ratings.reduce((sum, r) => sum + r.rating * (r.weight ?? 1), 0);

  // If weights are provided (from pairwise comparison), divide by 15
  // Otherwise use simple average
  return totalWeight > 6 ? weightedSum / 15 : weightedSum / 6;
}

/**
 * Calculate Paas Mental Effort on 0-100 scale
 * Converts 1-9 scale to 0-100
 */
export function normalizePaasRating(rating: PaasRating): number {
  return ((rating - 1) / 8) * 100;
}

/**
 * Calculate Leppink's separated load scores
 * Returns intrinsic, extraneous, and germane load averages
 */
export function calculateLeppinkLoads(items: LeppinkItem[]): {
  intrinsic: number;
  extraneous: number;
  germane: number;
} {
  const grouped = items.reduce(
    (acc, item) => {
      acc[item.loadType].push(item.rating);
      return acc;
    },
    { intrinsic: [] as number[], extraneous: [] as number[], germane: [] as number[] },
  );

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  return {
    intrinsic: avg(grouped.intrinsic) * 10, // Scale 0-10 to 0-100
    extraneous: avg(grouped.extraneous) * 10,
    germane: avg(grouped.germane) * 10,
  };
}

/**
 * Estimate element interactivity for content
 * Based on Sweller's CLT theory
 */
export function estimateElementInteractivity(
  elementCount: number,
  interactionLevel: 'isolated' | 'sequential' | 'interconnected',
): ElementInteractivity {
  const multipliers = {
    isolated: 1,
    sequential: 1.5,
    interconnected: 2.5,
  };

  // Base load increases logarithmically with element count
  // Capped at working memory capacity (~7 items for isolated, less for complex)
  const baseLoad = Math.min(100, Math.log2(elementCount + 1) * 20);
  const estimatedLoad = Math.min(100, baseLoad * multipliers[interactionLevel]);

  return {
    elementCount,
    interactionLevel,
    estimatedLoad,
  };
}

/**
 * Calculate bandwidth penalty from context factors
 * Based on scarcity research - external stressors reduce available capacity
 */
export function calculateBandwidthPenalty(context: Partial<BandwidthContext>): number {
  const weights = {
    timePressure: 0.3,
    distractions: 0.25,
    fatigue: 0.35,
    sessionDuration: 0.1, // Penalty increases after 45 mins
  };

  let penalty = 0;

  if (context.timePressure) {
    penalty += (context.timePressure / 100) * weights.timePressure * 50;
  }

  if (context.distractions) {
    penalty += (context.distractions / 100) * weights.distractions * 50;
  }

  if (context.fatigue) {
    penalty += (context.fatigue / 100) * weights.fatigue * 50;
  }

  // Session duration penalty kicks in after 45 minutes
  if (context.sessionDuration && context.sessionDuration > 45) {
    const overTime = context.sessionDuration - 45;
    penalty += Math.min(overTime / 60, 1) * weights.sessionDuration * 50;
  }

  // Time of day adjustment
  if (context.timeOfDay) {
    const circadianPenalty: Record<string, number> = {
      morning: 0,
      midday: 5,
      afternoon: 10,
      evening: 15,
      night: 25,
    };
    penalty += circadianPenalty[context.timeOfDay] ?? 0;
  }

  return Math.min(50, penalty); // Cap at 50% penalty
}

/**
 * Calculate comprehensive Cognitive Load Index
 * Combines all measurements into unified assessment
 */
export function calculateCognitiveLoadIndex(params: {
  intrinsicLoad: number;
  extraneousLoad: number;
  germaneLoad: number;
  bandwidthContext?: Partial<BandwidthContext>;
  sessionId?: string;
  blockId?: string;
}): CognitiveLoadIndex {
  const { intrinsicLoad, extraneousLoad, germaneLoad, bandwidthContext, sessionId, blockId } =
    params;

  // Apply bandwidth penalty to available capacity
  const bandwidthPenalty = bandwidthContext ? calculateBandwidthPenalty(bandwidthContext) : 0;

  // Calculate composite scores
  const totalLoad = Math.min(100, intrinsicLoad + extraneousLoad + germaneLoad);
  const effectiveLoad = Math.min(100, intrinsicLoad + germaneLoad); // Learning-contributing load
  const wastedLoad = extraneousLoad; // Non-contributing load

  // Adjusted capacity (100 - penalty)
  const availableCapacity = 100 - bandwidthPenalty;

  // Determine overload risk
  const loadRatio = totalLoad / availableCapacity;
  let overloadRisk: 'low' | 'medium' | 'high' | 'critical';
  let recommendedAction: string | undefined;

  if (loadRatio < 0.6) {
    overloadRisk = 'low';
  } else if (loadRatio < 0.8) {
    overloadRisk = 'medium';
    recommendedAction = 'Consider reducing extraneous elements or chunking content';
  } else if (loadRatio < 1.0) {
    overloadRisk = 'high';
    recommendedAction = 'Simplify content structure or add scaffolding';
  } else {
    overloadRisk = 'critical';
    recommendedAction = 'Break content into smaller segments. Suggest learner take a break.';
  }

  return {
    intrinsicLoad,
    extraneousLoad,
    germaneLoad,
    totalLoad,
    effectiveLoad,
    wastedLoad,
    overloadRisk,
    recommendedAction,
    timestamp: new Date().toISOString(),
    sessionId,
    blockId,
  };
}

/**
 * Calculate Instructional Efficiency using Z-score formula
 * E = (Zp - Ze) / √2
 * Where Zp = performance Z-score, Ze = effort Z-score
 */
export function calculateInstructionalEfficiency(
  performanceScore: number,
  effortScore: number,
  populationMeans: { performance: number; effort: number },
  populationStdDevs: { performance: number; effort: number },
): InstructionalEfficiency {
  // Calculate Z-scores
  const performanceZScore =
    (performanceScore - populationMeans.performance) / populationStdDevs.performance;
  const effortZScore = (effortScore - populationMeans.effort) / populationStdDevs.effort;

  // Efficiency formula: (Performance Z - Effort Z) / sqrt(2)
  const efficiencyScore = (performanceZScore - effortZScore) / Math.sqrt(2);

  // Interpret the score
  let interpretation: InstructionalEfficiency['interpretation'];
  if (efficiencyScore > 1) {
    interpretation = 'highly_efficient';
  } else if (efficiencyScore > 0.3) {
    interpretation = 'efficient';
  } else if (efficiencyScore > -0.3) {
    interpretation = 'neutral';
  } else if (efficiencyScore > -1) {
    interpretation = 'inefficient';
  } else {
    interpretation = 'highly_inefficient';
  }

  return {
    performanceZScore,
    effortZScore,
    efficiencyScore,
    interpretation,
  };
}

/**
 * Detect cognitive fatigue based on session patterns
 * Returns fatigue level 0-100 and recommendation
 */
export function detectCognitiveFatigue(params: {
  sessionDurationMinutes: number;
  recentAccuracyTrend: number[]; // Last N accuracy scores
  averageResponseTimes: number[]; // Last N response times in seconds
}): { fatigueLevel: number; shouldBreak: boolean; message?: string } {
  const { sessionDurationMinutes, recentAccuracyTrend, averageResponseTimes } = params;

  let fatigueLevel = 0;

  // Duration factor (penalty after 45 mins)
  if (sessionDurationMinutes > 45) {
    fatigueLevel += Math.min(30, (sessionDurationMinutes - 45) * 0.5);
  }

  // Accuracy decline detection
  if (recentAccuracyTrend.length >= 3) {
    const recent = recentAccuracyTrend.slice(-3);
    const earlier = recentAccuracyTrend.slice(0, 3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    if (recentAvg < earlierAvg * 0.7) {
      // 30%+ drop
      fatigueLevel += 40;
    } else if (recentAvg < earlierAvg * 0.85) {
      // 15%+ drop
      fatigueLevel += 20;
    }
  }

  // Response time increase detection
  if (averageResponseTimes.length >= 3) {
    const recent = averageResponseTimes.slice(-3);
    const earlier = averageResponseTimes.slice(0, 3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    if (recentAvg > earlierAvg * 1.5) {
      // 50%+ slower
      fatigueLevel += 30;
    } else if (recentAvg > earlierAvg * 1.25) {
      // 25%+ slower
      fatigueLevel += 15;
    }
  }

  fatigueLevel = Math.min(100, fatigueLevel);

  const shouldBreak = fatigueLevel > 60;
  let message: string | undefined;

  if (fatigueLevel > 80) {
    message = "You've been working hard! Take a 10-15 minute break to recharge.";
  } else if (fatigueLevel > 60) {
    message = 'Consider taking a short 5-minute break to maintain focus.';
  } else if (fatigueLevel > 40) {
    message = "You're doing well. A break in the next 15 minutes might help.";
  }

  return { fatigueLevel, shouldBreak, message };
}
