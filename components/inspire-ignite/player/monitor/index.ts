import {
  type BandwidthContext,
  type CognitiveLoadIndex,
  calculateCognitiveLoadIndex,
  detectCognitiveFatigue,
} from '@/lib/inspire-ignite/cognitive-load';

// Re-export types for external use
export type { CognitiveLoadIndex, BandwidthContext };

export interface MonitorConfig {
  /** Check interval in milliseconds (default: 30000 = 30 seconds) */
  checkInterval?: number;
  /** Fatigue threshold to suggest break (0-100, default: 60) */
  fatigueThreshold?: number;
  /** Minimum session duration before suggesting breaks (minutes, default: 30) */
  minSessionBeforeBreak?: number;
  /** Callback when cognitive load is updated */
  onCognitiveLoadUpdate?: (load: CognitiveLoadIndex) => void;
  /** Callback when break is suggested */
  onBreakSuggested?: (params: { fatigueLevel: number; message: string }) => void;
}

/**
 * Cognitive Load Monitor
 * Continuously monitors learner state and suggests breaks when needed
 */
export class CognitiveMonitor {
  private config: MonitorConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private sessionStartTime: number;
  private accuracyHistory: number[] = [];
  private responseTimeHistory: number[] = [];
  private lastBreakSuggestionTime: number = 0;
  private breakCooldownMinutes: number = 15;

  constructor(config: MonitorConfig = {}) {
    this.config = {
      checkInterval: 30000,
      fatigueThreshold: 60,
      minSessionBeforeBreak: 30,
      ...config,
    };
    this.sessionStartTime = Date.now();
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkCognitiveState();
    }, this.config.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Record a learning event for monitoring
   */
  recordEvent(params: {
    accuracy?: number; // 0-1
    responseTimeSeconds?: number;
    intrinsicLoad?: number;
    extraneousLoad?: number;
    germaneLoad?: number;
  }): void {
    if (params.accuracy !== undefined) {
      this.accuracyHistory.push(params.accuracy);
      // Keep last 20 events
      if (this.accuracyHistory.length > 20) {
        this.accuracyHistory.shift();
      }
    }

    if (params.responseTimeSeconds !== undefined) {
      this.responseTimeHistory.push(params.responseTimeSeconds);
      if (this.responseTimeHistory.length > 20) {
        this.responseTimeHistory.shift();
      }
    }

    // Trigger immediate check if load data provided
    if (
      params.intrinsicLoad !== undefined ||
      params.extraneousLoad !== undefined ||
      params.germaneLoad !== undefined
    ) {
      this.checkCognitiveState({
        intrinsicLoad: params.intrinsicLoad,
        extraneousLoad: params.extraneousLoad,
        germaneLoad: params.germaneLoad,
      });
    }
  }

  /**
   * Check cognitive state and trigger callbacks
   */
  private checkCognitiveState(loadOverrides?: {
    intrinsicLoad?: number;
    extraneousLoad?: number;
    germaneLoad?: number;
  }): void {
    const sessionDurationMinutes = (Date.now() - this.sessionStartTime) / 60000;

    // Calculate fatigue
    const fatigueResult = detectCognitiveFatigue({
      sessionDurationMinutes,
      recentAccuracyTrend: this.accuracyHistory,
      averageResponseTimes: this.responseTimeHistory,
    });

    // Estimate cognitive load
    const bandwidthContext: Partial<BandwidthContext> = {
      sessionDuration: sessionDurationMinutes,
      fatigue: fatigueResult.fatigueLevel,
    };

    // Use provided load values or estimate from history
    const intrinsicLoad = loadOverrides?.intrinsicLoad ?? this.estimateIntrinsicLoad();
    const extraneousLoad = loadOverrides?.extraneousLoad ?? this.estimateExtraneousLoad();
    const germaneLoad = loadOverrides?.germaneLoad ?? this.estimateGermaneLoad();

    const cognitiveLoad = calculateCognitiveLoadIndex({
      intrinsicLoad,
      extraneousLoad,
      germaneLoad,
      bandwidthContext,
    });

    // Trigger cognitive load callback
    this.config.onCognitiveLoadUpdate?.(cognitiveLoad);

    // Check if break should be suggested
    const shouldSuggestBreak = this.shouldSuggestBreak(
      fatigueResult.fatigueLevel,
      sessionDurationMinutes,
      cognitiveLoad,
    );

    if (shouldSuggestBreak && fatigueResult.message) {
      this.lastBreakSuggestionTime = Date.now();
      this.config.onBreakSuggested?.({
        fatigueLevel: fatigueResult.fatigueLevel,
        message: fatigueResult.message,
      });
    }
  }

  /**
   * Determine if break should be suggested
   */
  private shouldSuggestBreak(
    fatigueLevel: number,
    sessionDurationMinutes: number,
    cognitiveLoad: CognitiveLoadIndex,
  ): boolean {
    // Don't suggest break too early in session
    if (sessionDurationMinutes < (this.config.minSessionBeforeBreak ?? 30)) {
      return false;
    }

    // Don't suggest break if recently suggested
    const minutesSinceLastSuggestion = (Date.now() - this.lastBreakSuggestionTime) / 60000;
    if (minutesSinceLastSuggestion < this.breakCooldownMinutes) {
      return false;
    }

    // Suggest break if fatigue is high
    if (fatigueLevel >= (this.config.fatigueThreshold ?? 60)) {
      return true;
    }

    // Suggest break if cognitive load is critical
    if (cognitiveLoad.overloadRisk === 'critical') {
      return true;
    }

    return false;
  }

  /**
   * Estimate intrinsic load from performance history
   */
  private estimateIntrinsicLoad(): number {
    if (this.accuracyHistory.length === 0) return 50;

    // Lower accuracy suggests higher intrinsic load
    const avgAccuracy =
      this.accuracyHistory.reduce((a, b) => a + b, 0) / this.accuracyHistory.length;
    return Math.round((1 - avgAccuracy) * 80 + 20); // 20-100 range
  }

  /**
   * Estimate extraneous load from response times
   */
  private estimateExtraneousLoad(): number {
    if (this.responseTimeHistory.length === 0) return 30;

    // Highly variable response times suggest UI friction
    const times = this.responseTimeHistory;
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + (t - mean) ** 2, 0) / times.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation

    return Math.min(100, Math.round(cv * 100));
  }

  /**
   * Estimate germane load (effort toward learning)
   */
  private estimateGermaneLoad(): number {
    if (this.accuracyHistory.length < 3) return 50;

    // Improving accuracy suggests good germane load
    const recent = this.accuracyHistory.slice(-3);
    const earlier = this.accuracyHistory.slice(0, 3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    const improvement = recentAvg - earlierAvg;
    return Math.min(100, Math.max(0, 50 + improvement * 100));
  }

  /**
   * Get current session duration in minutes
   */
  getSessionDuration(): number {
    return (Date.now() - this.sessionStartTime) / 60000;
  }

  /**
   * Reset session (e.g., after break)
   */
  resetSession(): void {
    this.sessionStartTime = Date.now();
    this.accuracyHistory = [];
    this.responseTimeHistory = [];
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
  }
}

/**
 * Create a new cognitive monitor
 */
export function createMonitor(config?: MonitorConfig): CognitiveMonitor {
  return new CognitiveMonitor(config);
}
