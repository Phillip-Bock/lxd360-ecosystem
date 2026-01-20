'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TelemetryData {
  // Timing
  startTime: number;
  firstInteractionTime: number | null;
  totalTimeMs: number;

  // Interactions
  clickCount: number;
  rageClicks: number;
  revisionCount: number;

  // Focus/attention
  focusLossCount: number;
  totalFocusLostMs: number;

  // Scrolling
  scrollDepth: number;
  scrollEvents: number;

  // Typing (for free response)
  keystrokes: number;
  typingSpeedWpm: number | null;
  pauseCount: number;

  // Confidence
  confidenceRating: number | null;
}

export interface UseTelemetryOptions {
  onRageClickDetected?: () => void;
  onFocusLost?: () => void;
  onFocusRegained?: () => void;
  rageClickThreshold?: number;
  rageClickWindowMs?: number;
}

// ============================================================================
// RAGE CLICK DETECTION
// ============================================================================

const DEFAULT_RAGE_CLICK_THRESHOLD = 3;
const DEFAULT_RAGE_CLICK_WINDOW_MS = 750;

function createRageClickDetector(
  threshold: number = DEFAULT_RAGE_CLICK_THRESHOLD,
  windowMs: number = DEFAULT_RAGE_CLICK_WINDOW_MS,
) {
  const clickTimes: number[] = [];

  return {
    recordClick(): boolean {
      const now = Date.now();
      clickTimes.push(now);

      // Remove clicks outside window
      while (clickTimes.length > 0 && clickTimes[0] < now - windowMs) {
        clickTimes.shift();
      }

      return clickTimes.length >= threshold;
    },
    reset() {
      clickTimes.length = 0;
    },
  };
}

// ============================================================================
// MAIN TELEMETRY HOOK
// ============================================================================

/**
 * Hook to capture behavioral telemetry during a learning activity
 *
 * @example
 * ```tsx
 * function QuestionComponent({ onSubmit }) {
 *   const { telemetry, handlers, setConfidence, reset } = useTelemetry({
 *     onRageClickDetected: () => showFrustrationHelp(),
 *   })
 *
 *   const handleSubmit = (answer) => {
 *     onSubmit({
 *       answer,
 *       ...telemetry,
 *     })
 *     reset()
 *   }
 *
 *   return (
 *     <div {...handlers}>
 *       <input onChange={() => telemetry.revisionCount++} />
 *       <ConfidenceSlider onChange={setConfidence} />
 *       <button onClick={handleSubmit}>Submit</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useTelemetry(options: UseTelemetryOptions = {}) {
  const {
    onRageClickDetected,
    onFocusLost,
    onFocusRegained,
    rageClickThreshold = DEFAULT_RAGE_CLICK_THRESHOLD,
    rageClickWindowMs = DEFAULT_RAGE_CLICK_WINDOW_MS,
  } = options;

  // State
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => ({
    startTime: Date.now(),
    firstInteractionTime: null,
    totalTimeMs: 0,
    clickCount: 0,
    rageClicks: 0,
    revisionCount: 0,
    focusLossCount: 0,
    totalFocusLostMs: 0,
    scrollDepth: 0,
    scrollEvents: 0,
    keystrokes: 0,
    typingSpeedWpm: null,
    pauseCount: 0,
    confidenceRating: null,
  }));

  // Refs for mutable state
  const rageDetector = useRef(createRageClickDetector(rageClickThreshold, rageClickWindowMs));
  const focusLostAt = useRef<number | null>(null);
  const lastKeystrokeAt = useRef<number | null>(null);
  const keystrokeTimestamps = useRef<number[]>([]);
  const maxScrollDepth = useRef(0);

  // Update total time continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        totalTimeMs: Date.now() - prev.startTime,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Focus tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        focusLostAt.current = Date.now();
        setTelemetry((prev) => ({
          ...prev,
          focusLossCount: prev.focusLossCount + 1,
        }));
        onFocusLost?.();
      } else if (focusLostAt.current) {
        const lostDuration = Date.now() - focusLostAt.current;
        focusLostAt.current = null;
        setTelemetry((prev) => ({
          ...prev,
          totalFocusLostMs: prev.totalFocusLostMs + lostDuration,
        }));
        onFocusRegained?.();
      }
    };

    const handleBlur = () => {
      if (!focusLostAt.current) {
        focusLostAt.current = Date.now();
        setTelemetry((prev) => ({
          ...prev,
          focusLossCount: prev.focusLossCount + 1,
        }));
        onFocusLost?.();
      }
    };

    const handleFocus = () => {
      if (focusLostAt.current) {
        const lostDuration = Date.now() - focusLostAt.current;
        focusLostAt.current = null;
        setTelemetry((prev) => ({
          ...prev,
          totalFocusLostMs: prev.totalFocusLostMs + lostDuration,
        }));
        onFocusRegained?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onFocusLost, onFocusRegained]);

  // Handlers
  const handleClick = useCallback(() => {
    const now = Date.now();

    setTelemetry((prev) => {
      const newTelemetry = {
        ...prev,
        clickCount: prev.clickCount + 1,
        firstInteractionTime: prev.firstInteractionTime ?? now,
      };

      if (rageDetector.current.recordClick()) {
        newTelemetry.rageClicks = prev.rageClicks + 1;
        onRageClickDetected?.();
      }

      return newTelemetry;
    });
  }, [onRageClickDetected]);

  const handleKeyDown = useCallback(() => {
    const now = Date.now();
    keystrokeTimestamps.current.push(now);

    // Check for pause (3+ seconds since last keystroke)
    if (lastKeystrokeAt.current && now - lastKeystrokeAt.current > 3000) {
      setTelemetry((prev) => ({
        ...prev,
        pauseCount: prev.pauseCount + 1,
      }));
    }
    lastKeystrokeAt.current = now;

    // Calculate typing speed from recent keystrokes
    const recentKeystrokes = keystrokeTimestamps.current.filter((t) => t > now - 60000); // Last minute
    let wpm: number | null = null;
    if (recentKeystrokes.length >= 10) {
      const duration =
        (recentKeystrokes[recentKeystrokes.length - 1] - recentKeystrokes[0]) / 60000;
      if (duration > 0) {
        wpm = Math.round(recentKeystrokes.length / 5 / duration); // 5 chars per "word"
      }
    }

    setTelemetry((prev) => ({
      ...prev,
      keystrokes: prev.keystrokes + 1,
      firstInteractionTime: prev.firstInteractionTime ?? now,
      typingSpeedWpm: wpm,
    }));
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    const depth = Math.min(Math.round(scrollPercentage * 100), 100);

    if (depth > maxScrollDepth.current) {
      maxScrollDepth.current = depth;
      setTelemetry((prev) => ({
        ...prev,
        scrollDepth: depth,
        scrollEvents: prev.scrollEvents + 1,
      }));
    }
  }, []);

  const recordRevision = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      revisionCount: prev.revisionCount + 1,
    }));
  }, []);

  const setConfidence = useCallback((rating: number) => {
    setTelemetry((prev) => ({
      ...prev,
      confidenceRating: Math.max(0, Math.min(1, rating)),
    }));
  }, []);

  const reset = useCallback(() => {
    rageDetector.current.reset();
    focusLostAt.current = null;
    lastKeystrokeAt.current = null;
    keystrokeTimestamps.current = [];
    maxScrollDepth.current = 0;

    setTelemetry({
      startTime: Date.now(),
      firstInteractionTime: null,
      totalTimeMs: 0,
      clickCount: 0,
      rageClicks: 0,
      revisionCount: 0,
      focusLossCount: 0,
      totalFocusLostMs: 0,
      scrollDepth: 0,
      scrollEvents: 0,
      keystrokes: 0,
      typingSpeedWpm: null,
      pauseCount: 0,
      confidenceRating: null,
    });
  }, []);

  // Bundle handlers for easy spreading
  const handlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onScroll: handleScroll,
  };

  return {
    telemetry,
    handlers,
    recordRevision,
    setConfidence,
    reset,
  };
}

// ============================================================================
// CONFIDENCE SLIDER HOOK
// ============================================================================

/**
 * Hook specifically for confidence rating capture
 */
export function useConfidenceRating(initialValue: number = 0.5) {
  const [confidence, setConfidence] = useState(initialValue);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleChange = useCallback((value: number) => {
    setConfidence(Math.max(0, Math.min(1, value)));
    setHasInteracted(true);
  }, []);

  const reset = useCallback(() => {
    setConfidence(initialValue);
    setHasInteracted(false);
  }, [initialValue]);

  return {
    confidence,
    hasInteracted,
    setConfidence: handleChange,
    reset,
  };
}

// ============================================================================
// ACTIVITY SESSION HOOK
// ============================================================================

/**
 * Hook to manage a complete learning activity session
 */
export function useActivitySession(activityId: string, skillId: string) {
  const sessionId = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const {
    telemetry,
    handlers,
    recordRevision,
    setConfidence,
    reset: resetTelemetry,
  } = useTelemetry();
  const {
    confidence,
    hasInteracted: hasSetConfidence,
    setConfidence: updateConfidence,
    reset: resetConfidence,
  } = useConfidenceRating();

  // Sync confidence
  useEffect(() => {
    setConfidence(confidence);
  }, [confidence, setConfidence]);

  /**
   * Complete the activity and return all collected data
   */
  const complete = useCallback(
    (
      correct: boolean,
    ): {
      sessionId: string;
      activityId: string;
      skillId: string;
      correct: boolean;
      responseTimeMs: number;
      confidenceRating: number | null;
      revisionCount: number;
      rageClicks: number;
      focusLossCount: number;
      telemetry: TelemetryData;
    } => {
      return {
        sessionId: sessionId.current,
        activityId,
        skillId,
        correct,
        responseTimeMs: telemetry.totalTimeMs,
        confidenceRating: hasSetConfidence ? confidence : null,
        revisionCount: telemetry.revisionCount,
        rageClicks: telemetry.rageClicks,
        focusLossCount: telemetry.focusLossCount,
        telemetry,
      };
    },
    [activityId, skillId, telemetry, confidence, hasSetConfidence],
  );

  /**
   * Reset for a new activity
   */
  const reset = useCallback(() => {
    sessionId.current = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    resetTelemetry();
    resetConfidence();
  }, [resetTelemetry, resetConfidence]);

  return {
    sessionId: sessionId.current,
    telemetry,
    handlers,
    confidence,
    recordRevision,
    setConfidence: updateConfidence,
    complete,
    reset,
  };
}
