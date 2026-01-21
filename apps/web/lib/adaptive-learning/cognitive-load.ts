import type { CognitiveLoadLevel } from './bkt';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Behavioral telemetry from xAPI extensions
 */
export interface BehavioralTelemetry {
  responseTimeMs: number;
  totalTimeMs?: number;
  revisionCount?: number;
  confidenceRating?: number;
  clickCount?: number;
  rageClicks?: number;
  scrollDepth?: number;
  typingSpeedWpm?: number;
  readingSpeedWpm?: number;
  pauseCount?: number;
  focusLossCount?: number;
  distractorInteractions?: string[];
}

/**
 * Features computed from telemetry window
 */
export interface CognitiveLoadFeatures {
  responseTimeMean: number;
  responseTimeVariance: number;
  responseTimeTrend: number;

  errorRate: number;
  errorRateTrend: number;
  streakLength: number;
  streakIsCorrect: boolean;

  rageClickCount: number;
  rageClickDensity: number;
  revisionRate: number;

  focusLossCount: number;
  focusLossRate: number;

  readingSpeedRatio: number;

  confidenceAccuracyGap: number;
  confidenceVariance: number;

  sessionDurationMinutes: number;
  activitiesCompleted: number;
}

/**
 * Cognitive load assessment result
 */
export interface CognitiveLoadAssessment {
  assessmentId: string;
  learnerId: string;
  sessionId: string;
  activityId?: string;

  loadLevel: CognitiveLoadLevel;
  loadScore: number; // 0-1 continuous score
  confidence: number; // Model prediction confidence

  topContributingFeatures: Array<{ feature: string; contribution: number }>;

  interventionTriggered: boolean;
  interventionType?: string;
  interventionMessage?: string;

  assessedAt: Date;
  features?: CognitiveLoadFeatures;
}

/**
 * Event for the telemetry window
 */
export interface TelemetryEvent {
  timestamp: Date;
  responseTimeMs?: number;
  correct?: boolean;
  confidenceRating?: number;
  revisionCount?: number;
  rageClicks?: number;
  focusLoss?: boolean;
  readingSpeedWpm?: number;
}

// ============================================================================
// TELEMETRY WINDOW
// ============================================================================

/**
 * Sliding window of recent telemetry for feature computation
 */
export class TelemetryWindow {
  private windowSizeMs: number;
  private events: TelemetryEvent[] = [];

  constructor(windowSizeSeconds: number = 300) {
    this.windowSizeMs = windowSizeSeconds * 1000;
  }

  addEvent(event: TelemetryEvent): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date(),
    });
    this.prune();
  }

  private prune(): void {
    const cutoff = Date.now() - this.windowSizeMs;
    this.events = this.events.filter((e) => e.timestamp.getTime() > cutoff);
  }

  getResponseTimes(): number[] {
    return this.events.reduce<number[]>((acc, e) => {
      if (e.responseTimeMs !== undefined) {
        acc.push(e.responseTimeMs);
      }
      return acc;
    }, []);
  }

  getCorrectness(): boolean[] {
    return this.events.reduce<boolean[]>((acc, e) => {
      if (e.correct !== undefined) {
        acc.push(e.correct);
      }
      return acc;
    }, []);
  }

  getConfidenceRatings(): number[] {
    return this.events.reduce<number[]>((acc, e) => {
      if (e.confidenceRating !== undefined) {
        acc.push(e.confidenceRating);
      }
      return acc;
    }, []);
  }

  getRageClicks(): number {
    return this.events.reduce((sum, e) => sum + (e.rageClicks ?? 0), 0);
  }

  getFocusLosses(): number {
    return this.events.filter((e) => e.focusLoss).length;
  }

  getWindowDurationMinutes(): number {
    if (this.events.length < 2) return 0;
    const first = this.events[0].timestamp.getTime();
    const last = this.events[this.events.length - 1].timestamp.getTime();
    return (last - first) / 60000;
  }

  getEventCount(): number {
    return this.events.length;
  }
}

// ============================================================================
// FEATURE COMPUTATION
// ============================================================================

/**
 * Compute cognitive load features from telemetry window
 */
export function computeFeatures(
  window: TelemetryWindow,
  currentEvent: TelemetryEvent,
): CognitiveLoadFeatures {
  const features: CognitiveLoadFeatures = {
    responseTimeMean: 0,
    responseTimeVariance: 0,
    responseTimeTrend: 0,
    errorRate: 0,
    errorRateTrend: 0,
    streakLength: 0,
    streakIsCorrect: true,
    rageClickCount: 0,
    rageClickDensity: 0,
    revisionRate: currentEvent.revisionCount ?? 0,
    focusLossCount: 0,
    focusLossRate: 0,
    readingSpeedRatio: 1.0,
    confidenceAccuracyGap: 0,
    confidenceVariance: 0,
    sessionDurationMinutes: 0,
    activitiesCompleted: 0,
  };

  // Response time features
  const times = window.getResponseTimes();
  if (times.length >= 2) {
    features.responseTimeMean = times.reduce((a, b) => a + b, 0) / times.length;

    const variance =
      times.reduce((sum, t) => sum + (t - features.responseTimeMean) ** 2, 0) / times.length;
    features.responseTimeVariance = Math.sqrt(variance) / (features.responseTimeMean + 1);

    // Trend: compare recent half to earlier half
    const mid = Math.floor(times.length / 2);
    if (mid > 0) {
      const earlyMean = times.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const lateMean = times.slice(mid).reduce((a, b) => a + b, 0) / (times.length - mid);
      features.responseTimeTrend = (lateMean - earlyMean) / (earlyMean + 1);
    }
  }

  // Performance features
  const correctness = window.getCorrectness();
  if (correctness.length >= 3) {
    const correctCount = correctness.filter((c) => c).length;
    features.errorRate = 1 - correctCount / correctness.length;

    // Error trend
    const mid = Math.floor(correctness.length / 2);
    if (mid > 0) {
      const earlyErrors = 1 - correctness.slice(0, mid).filter((c) => c).length / mid;
      const lateErrors =
        1 - correctness.slice(mid).filter((c) => c).length / (correctness.length - mid);
      features.errorRateTrend = lateErrors - earlyErrors;
    }

    // Streak calculation
    let streak = 1;
    const lastCorrect = correctness[correctness.length - 1];
    for (let i = correctness.length - 2; i >= 0; i--) {
      if (correctness[i] === lastCorrect) {
        streak++;
      } else {
        break;
      }
    }
    features.streakLength = streak;
    features.streakIsCorrect = lastCorrect;
  }

  // Frustration signals
  const windowMinutes = window.getWindowDurationMinutes();
  features.rageClickCount = window.getRageClicks();
  features.rageClickDensity = windowMinutes > 0 ? features.rageClickCount / windowMinutes : 0;

  features.focusLossCount = window.getFocusLosses();
  features.focusLossRate = windowMinutes > 0 ? features.focusLossCount / windowMinutes : 0;

  // Reading speed
  if (currentEvent.readingSpeedWpm) {
    features.readingSpeedRatio = currentEvent.readingSpeedWpm / 250; // 250 WPM baseline
  }

  // Confidence calibration
  const confidences = window.getConfidenceRatings();
  if (confidences.length >= 3 && correctness.length >= 3) {
    const recentConf = confidences.slice(-5);
    const recentAcc = correctness.slice(-5).map((c) => (c ? 1 : 0));

    const avgConf = recentConf.reduce((a: number, b: number) => a + b, 0) / recentConf.length;
    const avgAcc = recentAcc.reduce((a: number, b: number) => a + b, 0) / recentAcc.length;

    features.confidenceAccuracyGap = Math.abs(avgConf - avgAcc);

    const confVariance =
      recentConf.reduce((sum, c) => sum + (c - avgConf) ** 2, 0) / recentConf.length;
    features.confidenceVariance = Math.sqrt(confVariance);
  }

  // Session context
  features.sessionDurationMinutes = windowMinutes;
  features.activitiesCompleted = window.getEventCount();

  return features;
}

// ============================================================================
// COGNITIVE LOAD SCORING
// ============================================================================

/**
 * Feature weights for cognitive load scoring
 * Positive weights increase predicted load
 */
const FEATURE_WEIGHTS: Record<string, number> = {
  responseTimeVariance: 0.15,
  errorRate: 0.25,
  errorRateTrend: 0.2,
  rageClickDensity: 0.18,
  focusLossRate: 0.12,
  readingSpeedRatioInverse: 0.1,
  revisionRate: 0.08,
  sessionFatigue: 0.1,
  confidenceAccuracyGap: 0.15,
};

/**
 * Load level thresholds
 */
const THRESHOLD_LOW = 0.25;
const THRESHOLD_OPTIMAL_HIGH = 0.55;
const THRESHOLD_OVERLOAD = 0.75;

/**
 * Compute cognitive load score from features
 */
export function computeLoadScore(features: CognitiveLoadFeatures): {
  score: number;
  contributions: Array<{ feature: string; contribution: number }>;
} {
  const contributions: Array<{ feature: string; contribution: number }> = [];

  // Response time variance
  const rtVarContrib =
    Math.min(features.responseTimeVariance, 1.0) * FEATURE_WEIGHTS.responseTimeVariance;
  contributions.push({ feature: 'response_time_variance', contribution: rtVarContrib });

  // Error rate
  const errorContrib = features.errorRate * FEATURE_WEIGHTS.errorRate;
  contributions.push({ feature: 'error_rate', contribution: errorContrib });

  // Error trend (only if worsening)
  if (features.errorRateTrend > 0) {
    const trendContrib = Math.min(features.errorRateTrend, 0.5) * FEATURE_WEIGHTS.errorRateTrend;
    contributions.push({ feature: 'error_rate_trend', contribution: trendContrib });
  }

  // Rage clicks
  const rageContrib =
    Math.min(features.rageClickDensity / 2, 1.0) * FEATURE_WEIGHTS.rageClickDensity;
  contributions.push({ feature: 'rage_click_density', contribution: rageContrib });

  // Focus loss
  const focusContrib = Math.min(features.focusLossRate / 3, 1.0) * FEATURE_WEIGHTS.focusLossRate;
  contributions.push({ feature: 'focus_loss_rate', contribution: focusContrib });

  // Reading speed
  if (features.readingSpeedRatio < 0.5) {
    const readContrib =
      (1 - features.readingSpeedRatio * 2) * FEATURE_WEIGHTS.readingSpeedRatioInverse;
    contributions.push({ feature: 'slow_reading', contribution: readContrib });
  } else if (features.readingSpeedRatio > 2.0) {
    const readContrib =
      ((features.readingSpeedRatio - 2) / 2) * FEATURE_WEIGHTS.readingSpeedRatioInverse;
    contributions.push({ feature: 'fast_reading', contribution: readContrib });
  }

  // Revision rate
  const revContrib = Math.min(features.revisionRate / 3, 1.0) * FEATURE_WEIGHTS.revisionRate;
  contributions.push({ feature: 'revision_rate', contribution: revContrib });

  // Session fatigue
  if (features.sessionDurationMinutes > 30) {
    const fatigue = Math.min((features.sessionDurationMinutes - 30) / 60, 1.0);
    const fatigueContrib = fatigue * FEATURE_WEIGHTS.sessionFatigue;
    contributions.push({ feature: 'session_fatigue', contribution: fatigueContrib });
  }

  // Confidence calibration gap
  const calContrib = features.confidenceAccuracyGap * FEATURE_WEIGHTS.confidenceAccuracyGap;
  contributions.push({ feature: 'confidence_accuracy_gap', contribution: calContrib });

  // Total score
  const totalScore = contributions.reduce((sum, c) => sum + c.contribution, 0);
  const normalizedScore = Math.min(Math.max(totalScore, 0), 1);

  // Sort by contribution
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return { score: normalizedScore, contributions };
}

/**
 * Classify load level from score
 */
export function classifyLoadLevel(score: number): CognitiveLoadLevel {
  if (score < THRESHOLD_LOW) return 'low';
  if (score < THRESHOLD_OPTIMAL_HIGH) return 'optimal';
  if (score < THRESHOLD_OVERLOAD) return 'high';
  return 'overload';
}

/**
 * Compute prediction confidence based on data availability
 */
export function computeConfidence(eventCount: number): number {
  if (eventCount < 3) return 0.3;
  if (eventCount < 5) return 0.5;
  if (eventCount < 10) return 0.7;
  return 0.85;
}

// ============================================================================
// INTERVENTION LOGIC
// ============================================================================

interface LoadIntervention {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  action: string;
}

const INTERVENTION_COOLDOWN_MS = 300000; // 5 minutes

/**
 * Determine if intervention is needed based on load assessment
 */
export function determineIntervention(
  loadLevel: CognitiveLoadLevel,
  _loadScore: number,
  features: CognitiveLoadFeatures,
  contributions: Array<{ feature: string; contribution: number }>,
  lastInterventionTime?: Date,
): LoadIntervention | null {
  // Check cooldown
  if (lastInterventionTime) {
    const elapsed = Date.now() - lastInterventionTime.getTime();
    if (elapsed < INTERVENTION_COOLDOWN_MS) return null;
  }

  // No intervention for low/optimal
  if (loadLevel === 'low' || loadLevel === 'optimal') {
    // Special case: suggest difficulty increase if coasting
    if (loadLevel === 'low' && features.activitiesCompleted >= 5) {
      return {
        type: 'difficulty_adjustment',
        severity: 'low',
        message: "You're doing great! Would you like to try something more challenging?",
        action: 'suggest_harder_content',
      };
    }
    return null;
  }

  // High load + consecutive failures = wheel-spinning
  if (loadLevel === 'high' && features.streakLength >= 3 && !features.streakIsCorrect) {
    return {
      type: 'scaffolding',
      severity: 'medium',
      message:
        "Let's take a different approach. Would you like to see a worked example or break this down into smaller steps?",
      action: 'offer_scaffold',
    };
  }

  // Overload - determine cause and respond accordingly
  if (loadLevel === 'overload') {
    const topIssue = contributions[0]?.feature ?? 'general';

    const interventionMap: Record<string, LoadIntervention> = {
      rage_click_density: {
        type: 'frustration_support',
        severity: 'high',
        message:
          "I notice you might be feeling frustrated. Let's pause and work through this together. Would you like me to explain this concept in a different way?",
        action: 'offer_alternative_explanation',
      },
      error_rate_trend: {
        type: 'remediation',
        severity: 'high',
        message:
          "Let's take a step back and strengthen the foundation. I'll guide you through the prerequisite concepts.",
        action: 'prerequisite_review',
      },
      session_fatigue: {
        type: 'break_suggestion',
        severity: 'medium',
        message:
          "You've been working hard! Research shows taking a 5-minute break helps with learning and retention. Ready to pause?",
        action: 'suggest_break',
      },
      focus_loss_rate: {
        type: 'engagement_boost',
        severity: 'medium',
        message:
          "Let's try something more interactive to help you focus. Would you like to switch to a hands-on exercise?",
        action: 'switch_modality',
      },
      confidence_accuracy_gap: {
        type: 'metacognitive_support',
        severity: 'high',
        message:
          "I want to help you build accurate self-assessment. Let's review your reasoning together to identify unknown gaps.",
        action: 'reasoning_review',
      },
    };

    return (
      interventionMap[topIssue] ?? {
        type: 'general_support',
        severity: 'high',
        message:
          'This seems challenging. Would you like some help? I can provide a hint, show an example, or explain the concept differently.',
        action: 'offer_help_menu',
      }
    );
  }

  return null;
}

// ============================================================================
// MAIN DETECTOR CLASS
// ============================================================================

/**
 * Cognitive Load Detector
 * Manages telemetry windows and produces assessments
 */
export class CognitiveLoadDetector {
  private windows: Map<string, TelemetryWindow> = new Map();
  private lastInterventions: Map<string, Date> = new Map();

  constructor(private windowSizeSeconds: number = 300) {}

  /**
   * Process new telemetry and produce assessment
   */
  assess(
    learnerId: string,
    sessionId: string,
    event: TelemetryEvent,
    activityId?: string,
  ): CognitiveLoadAssessment {
    // Get or create window
    const windowKey = `${learnerId}:${sessionId}`;
    let window = this.windows.get(windowKey);
    if (!window) {
      window = new TelemetryWindow(this.windowSizeSeconds);
      this.windows.set(windowKey, window);
    }

    // Add event
    window.addEvent(event);

    // Compute features
    const features = computeFeatures(window, event);

    // Compute score
    const { score, contributions } = computeLoadScore(features);

    // Classify
    const loadLevel = classifyLoadLevel(score);

    // Check intervention
    const lastIntervention = this.lastInterventions.get(learnerId);
    const intervention = determineIntervention(
      loadLevel,
      score,
      features,
      contributions,
      lastIntervention,
    );

    if (intervention) {
      this.lastInterventions.set(learnerId, new Date());
    }

    return {
      assessmentId: `cla-${learnerId}-${Date.now()}`,
      learnerId,
      sessionId,
      activityId,
      loadLevel,
      loadScore: score,
      confidence: computeConfidence(window.getEventCount()),
      topContributingFeatures: contributions.slice(0, 5),
      interventionTriggered: intervention !== null,
      interventionType: intervention?.type,
      interventionMessage: intervention?.message,
      assessedAt: new Date(),
      features,
    };
  }

  /**
   * Clear session data
   */
  clearSession(learnerId: string, sessionId: string): void {
    this.windows.delete(`${learnerId}:${sessionId}`);
  }
}
