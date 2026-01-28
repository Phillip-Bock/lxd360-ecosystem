'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LearningState } from '@/components/ignite/player/cortex-hud/cortex-hud';

// ============================================================================
// TYPES
// ============================================================================

export interface CortexMetrics {
  /** Skill mastery percentage (0-100), calculated from BKT */
  skillMastery: number;
  /** Cognitive load level (0-100) */
  cognitiveLoad: number;
  /** Engagement score (0-100), based on interaction patterns */
  engagementScore: number;
  /** Time spent on current content in seconds */
  timeSpent: number;
  /** Time until recommended break (seconds), null if not needed */
  timeToBreak: number | null;
  /** Current learning state */
  learningState: LearningState;
  /** AI confidence in current assessment (0-1) */
  aiConfidence: number;
  /** Number of xAPI statements sent */
  xapiStatementCount: number;
}

export interface UseCortexMetricsOptions {
  /** Learner ID for personalized metrics */
  learnerId?: string;
  /** Course ID for context */
  courseId?: string;
  /** Initial BKT mastery estimate (0-1) */
  initialMastery?: number;
  /** Break reminder interval in minutes (default: 25 - Pomodoro) */
  breakIntervalMinutes?: number;
  /** Whether to auto-start the session timer */
  autoStart?: boolean;
  /** Callback when learning state changes */
  onLearningStateChange?: (state: LearningState) => void;
  /** Callback when break is recommended */
  onBreakRecommended?: () => void;
}

export interface UseCortexMetricsReturn extends CortexMetrics {
  /** Start tracking session */
  startSession: () => void;
  /** Pause tracking */
  pauseSession: () => void;
  /** Resume tracking */
  resumeSession: () => void;
  /** End session */
  endSession: () => void;
  /** Record a user interaction (affects engagement score) */
  recordInteraction: (type: 'click' | 'scroll' | 'answer' | 'navigation') => void;
  /** Record an answer attempt (affects mastery) */
  recordAnswer: (correct: boolean, difficulty?: number) => void;
  /** Manually set cognitive load (for external adaptive engine) */
  setCognitiveLoad: (load: number) => void;
  /** Reset break timer */
  resetBreakTimer: () => void;
  /** Whether session is active */
  isSessionActive: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BREAK_INTERVAL_MINUTES = 25; // Pomodoro technique
const INTERACTION_DECAY_RATE = 0.995; // Engagement decays over time
const MIN_CONFIDENCE = 0.5; // Minimum AI confidence
const BKT_LEARN_RATE = 0.3; // How fast mastery increases on correct
const BKT_SLIP_RATE = 0.1; // Probability of correct even when not mastered
const BKT_GUESS_RATE = 0.25; // Probability of correct from guessing

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing Cortex HUD learning metrics
 *
 * Tracks time spent, engagement, cognitive load, and skill mastery
 * using simplified BKT (Bayesian Knowledge Tracing) principles.
 *
 * @example
 * ```tsx
 * function CoursePlayer() {
 *   const metrics = useCortexMetrics({
 *     courseId: 'course-123',
 *     initialMastery: 0.3,
 *     onBreakRecommended: () => showBreakNotification(),
 *   });
 *
 *   return <CortexHUD {...metrics} />;
 * }
 * ```
 */
export function useCortexMetrics(options: UseCortexMetricsOptions = {}): UseCortexMetricsReturn {
  const {
    initialMastery = 0.3,
    breakIntervalMinutes = DEFAULT_BREAK_INTERVAL_MINUTES,
    autoStart = true,
    onLearningStateChange,
    onBreakRecommended,
  } = options;

  // State
  const [skillMastery, setSkillMastery] = useState(Math.round(initialMastery * 100));
  const [cognitiveLoad, setCognitiveLoadState] = useState(30);
  const [engagementScore, setEngagementScore] = useState(80);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeToBreak, setTimeToBreak] = useState<number | null>(breakIntervalMinutes * 60);
  const [learningState, setLearningState] = useState<LearningState>('engaged');
  const [aiConfidence, setAiConfidence] = useState(0.7);
  const [xapiStatementCount, setXapiStatementCount] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(autoStart);

  // Refs for tracking
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);
  const correctAnswersRef = useRef<number>(0);
  const totalAnswersRef = useRef<number>(0);

  // Callbacks refs
  const onLearningStateChangeRef = useRef(onLearningStateChange);
  const onBreakRecommendedRef = useRef(onBreakRecommended);
  const breakTriggeredRef = useRef(false);

  useEffect(() => {
    onLearningStateChangeRef.current = onLearningStateChange;
    onBreakRecommendedRef.current = onBreakRecommended;
  }, [onLearningStateChange, onBreakRecommended]);

  // Calculate learning state based on metrics
  const calculateLearningState = useCallback(
    (mastery: number, engagement: number, load: number): LearningState => {
      if (load > 80 || engagement < 30) {
        return 'struggling';
      }
      if (mastery >= 80 && engagement > 70) {
        return 'ready-to-challenge';
      }
      if (mastery >= 60) {
        return 'mastering';
      }
      return 'engaged';
    },
    [],
  );

  // Update learning state when metrics change
  useEffect(() => {
    const newState = calculateLearningState(skillMastery, engagementScore, cognitiveLoad);
    if (newState !== learningState) {
      setLearningState(newState);
      onLearningStateChangeRef.current?.(newState);
    }
  }, [skillMastery, engagementScore, cognitiveLoad, learningState, calculateLearningState]);

  // Session timer
  useEffect(() => {
    if (!isSessionActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      // Update time spent
      setTimeSpent((prev) => prev + 1);

      // Update time to break
      setTimeToBreak((prev) => {
        if (prev === null) return null;
        const newTime = prev - 1;
        if (newTime <= 0 && !breakTriggeredRef.current) {
          breakTriggeredRef.current = true;
          onBreakRecommendedRef.current?.();
          return 0;
        }
        return Math.max(0, newTime);
      });

      // Decay engagement over time if no interactions
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceInteraction > 30000) {
        // 30 seconds of no interaction
        setEngagementScore((prev) => Math.max(20, Math.round(prev * INTERACTION_DECAY_RATE)));
      }

      // Gradually increase AI confidence over time
      setAiConfidence((prev) => Math.min(0.95, prev + 0.001));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive]);

  // Start session
  const startSession = useCallback(() => {
    setIsSessionActive(true);
    setTimeSpent(0);
    setTimeToBreak(breakIntervalMinutes * 60);
    breakTriggeredRef.current = false;
    lastInteractionRef.current = Date.now();
  }, [breakIntervalMinutes]);

  // Pause session
  const pauseSession = useCallback(() => {
    setIsSessionActive(false);
  }, []);

  // Resume session
  const resumeSession = useCallback(() => {
    setIsSessionActive(true);
    lastInteractionRef.current = Date.now();
  }, []);

  // End session
  const endSession = useCallback(() => {
    setIsSessionActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Record interaction
  const recordInteraction = useCallback((type: 'click' | 'scroll' | 'answer' | 'navigation') => {
    lastInteractionRef.current = Date.now();
    interactionCountRef.current += 1;

    // Boost engagement based on interaction type
    const boosts: Record<string, number> = {
      click: 2,
      scroll: 1,
      answer: 5,
      navigation: 3,
    };

    setEngagementScore((prev) => Math.min(100, prev + boosts[type]));
    setXapiStatementCount((prev) => prev + 1);
  }, []);

  // Record answer (BKT update)
  const recordAnswer = useCallback(
    (correct: boolean, difficulty = 0.5) => {
      recordInteraction('answer');

      totalAnswersRef.current += 1;
      if (correct) {
        correctAnswersRef.current += 1;
      }

      // Simplified BKT update
      setSkillMastery((prev) => {
        const pKnown = prev / 100;

        if (correct) {
          // P(L|correct) = P(L) * (1-slip) / P(correct)
          const pCorrect = pKnown * (1 - BKT_SLIP_RATE) + (1 - pKnown) * BKT_GUESS_RATE;
          const pKnownGivenCorrect = (pKnown * (1 - BKT_SLIP_RATE)) / pCorrect;
          // Learning transition
          const newPKnown = pKnownGivenCorrect + (1 - pKnownGivenCorrect) * BKT_LEARN_RATE;
          return Math.min(100, Math.round(newPKnown * 100));
        } else {
          // P(L|incorrect) = P(L) * slip / P(incorrect)
          const pIncorrect = pKnown * BKT_SLIP_RATE + (1 - pKnown) * (1 - BKT_GUESS_RATE);
          const pKnownGivenIncorrect = (pKnown * BKT_SLIP_RATE) / pIncorrect;
          // Small decrease for incorrect answers
          return Math.max(0, Math.round(pKnownGivenIncorrect * 100));
        }
      });

      // Update cognitive load based on difficulty and correctness
      setCognitiveLoadState((prev) => {
        if (correct) {
          return Math.max(10, prev - 5);
        } else {
          return Math.min(100, prev + Math.round(difficulty * 15));
        }
      });

      // Update AI confidence based on answer history
      const accuracy = correctAnswersRef.current / totalAnswersRef.current;
      const newConfidence = MIN_CONFIDENCE + accuracy * (1 - MIN_CONFIDENCE);
      setAiConfidence(Math.round(newConfidence * 100) / 100);
    },
    [recordInteraction],
  );

  // Set cognitive load (for external adaptive engine)
  const setCognitiveLoad = useCallback((load: number) => {
    setCognitiveLoadState(Math.max(0, Math.min(100, Math.round(load))));
  }, []);

  // Reset break timer
  const resetBreakTimer = useCallback(() => {
    setTimeToBreak(breakIntervalMinutes * 60);
    breakTriggeredRef.current = false;
  }, [breakIntervalMinutes]);

  return {
    skillMastery,
    cognitiveLoad,
    engagementScore,
    timeSpent,
    timeToBreak,
    learningState,
    aiConfidence,
    xapiStatementCount,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    recordInteraction,
    recordAnswer,
    setCognitiveLoad,
    resetBreakTimer,
    isSessionActive,
  };
}

export default useCortexMetrics;
