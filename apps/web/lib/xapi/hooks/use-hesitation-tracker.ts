// ============================================================================
// INSPIRE IGNITE — Hesitation Tracker Hook
// LRS-First Implementation: Step 3d
// Location: lib/xapi/hooks/use-hesitation-tracker.ts
// Version: 1.0.0
// ============================================================================
//
// PURPOSE: Track learner hesitation in real-time for cognitive load estimation
// USAGE: Wrap interactive content blocks to measure response latency
//
// ============================================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface HesitationEvent {
  timestamp: number;
  duration_ms: number;
  event_type: 'start' | 'pause' | 'resume' | 'complete' | 'abandon';
  context?: {
    element_id?: string;
    element_type?: string;
    interaction_count?: number;
  };
}

export interface HesitationMetrics {
  total_hesitation_ms: number;
  pause_count: number;
  avg_pause_duration_ms: number;
  longest_pause_ms: number;
  time_to_first_interaction_ms: number | null;
  total_active_time_ms: number;
  engagement_ratio: number; // active_time / total_time
}

export interface UseHesitationTrackerOptions {
  /** Minimum pause duration (ms) to count as hesitation */
  minPauseDuration?: number;
  /** Maximum tracking duration (ms) before auto-complete */
  maxDuration?: number;
  /** Callback when hesitation exceeds threshold */
  onHesitationThresholdExceeded?: (metrics: HesitationMetrics) => void;
  /** Threshold (ms) to trigger onHesitationThresholdExceeded */
  hesitationThreshold?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export interface UseHesitationTrackerReturn {
  /** Start tracking (call when content becomes visible) */
  startTracking: () => void;
  /** Stop tracking and return final metrics */
  stopTracking: () => HesitationMetrics;
  /** Record user interaction (click, keypress, etc.) */
  recordInteraction: (elementId?: string, elementType?: string) => void;
  /** Record pause start (blur, scroll away, etc.) */
  recordPause: () => void;
  /** Record pause end (focus, scroll back, etc.) */
  recordResume: () => void;
  /** Get current metrics */
  getMetrics: () => HesitationMetrics;
  /** Whether tracking is active */
  isTracking: boolean;
  /** Current hesitation duration */
  currentHesitation: number;
  /** Event history */
  events: HesitationEvent[];
}

// ----------------------------------------------------------------------------
// DEFAULT OPTIONS
// ----------------------------------------------------------------------------

const DEFAULT_OPTIONS: Required<UseHesitationTrackerOptions> = {
  minPauseDuration: 500, // 500ms minimum to count as pause
  maxDuration: 300000, // 5 minutes max tracking
  hesitationThreshold: 10000, // 10 seconds
  onHesitationThresholdExceeded: () => {},
  debug: false,
};

// ----------------------------------------------------------------------------
// HOOK IMPLEMENTATION
// ----------------------------------------------------------------------------

export function useHesitationTracker(
  options: UseHesitationTrackerOptions = {},
): UseHesitationTrackerReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [currentHesitation, setCurrentHesitation] = useState(0);
  const [events, setEvents] = useState<HesitationEvent[]>([]);

  // Refs for timing (avoid re-renders)
  const startTimeRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPauseTimeRef = useRef<number>(0);
  const interactionCountRef = useRef<number>(0);
  const pausesRef = useRef<number[]>([]);
  const thresholdTriggeredRef = useRef<boolean>(false);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTrackingRef = useRef<() => HesitationMetrics>(() => ({
    total_hesitation_ms: 0,
    pause_count: 0,
    avg_pause_duration_ms: 0,
    longest_pause_ms: 0,
    time_to_first_interaction_ms: null,
    total_active_time_ms: 0,
    engagement_ratio: 1,
  }));

  // Debug logger
  const log = useCallback((_message: string, _data?: unknown) => {
    // Debug logging disabled in production
    void _message;
    void _data;
  }, []);

  // Add event to history
  const addEvent = useCallback(
    (event_type: HesitationEvent['event_type'], context?: HesitationEvent['context']) => {
      const now = performance.now();
      const duration_ms = startTimeRef.current ? Math.round(now - startTimeRef.current) : 0;

      const event: HesitationEvent = {
        timestamp: Date.now(),
        duration_ms,
        event_type,
        context,
      };

      setEvents((prev) => [...prev, event]);
      log(`Event: ${event_type}`, { duration_ms, context });
    },
    [log],
  );

  // Calculate current metrics
  const getMetrics = useCallback((): HesitationMetrics => {
    const now = performance.now();
    const startTime = startTimeRef.current ?? now;
    const totalTime = now - startTime;

    // Calculate current pause if in pause state
    let currentPauseTime = 0;
    if (pauseStartRef.current !== null) {
      currentPauseTime = now - pauseStartRef.current;
    }

    const totalPauseTime = totalPauseTimeRef.current + currentPauseTime;
    const activeTime = totalTime - totalPauseTime;
    const pauses = pausesRef.current;

    // Time to first interaction
    const timeToFirstInteraction =
      lastInteractionRef.current !== null && startTimeRef.current !== null
        ? lastInteractionRef.current - startTimeRef.current
        : null;

    return {
      total_hesitation_ms: Math.round(totalPauseTime),
      pause_count: pauses.length + (pauseStartRef.current !== null ? 1 : 0),
      avg_pause_duration_ms:
        pauses.length > 0 ? Math.round(pauses.reduce((a, b) => a + b, 0) / pauses.length) : 0,
      longest_pause_ms: Math.round(Math.max(...pauses, currentPauseTime, 0)),
      time_to_first_interaction_ms:
        timeToFirstInteraction !== null ? Math.round(timeToFirstInteraction) : null,
      total_active_time_ms: Math.round(Math.max(0, activeTime)),
      engagement_ratio: totalTime > 0 ? activeTime / totalTime : 1,
    };
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;

    const now = performance.now();
    startTimeRef.current = now;
    lastInteractionRef.current = null;
    pauseStartRef.current = null;
    totalPauseTimeRef.current = 0;
    interactionCountRef.current = 0;
    pausesRef.current = [];
    thresholdTriggeredRef.current = false;

    setIsTracking(true);
    setCurrentHesitation(0);
    setEvents([]);

    addEvent('start');

    // Set max duration timer
    if (config.maxDuration > 0) {
      maxDurationTimerRef.current = setTimeout(() => {
        log('Max duration reached, auto-stopping');
        stopTrackingRef.current();
      }, config.maxDuration);
    }

    log('Tracking started');
  }, [isTracking, config.maxDuration, addEvent, log]);

  // Stop tracking
  const stopTracking = useCallback((): HesitationMetrics => {
    if (!isTracking) {
      return getMetrics();
    }

    // Clear max duration timer
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }

    // If in pause state, end the pause
    if (pauseStartRef.current !== null) {
      const pauseDuration = performance.now() - pauseStartRef.current;
      if (pauseDuration >= config.minPauseDuration) {
        pausesRef.current.push(pauseDuration);
        totalPauseTimeRef.current += pauseDuration;
      }
      pauseStartRef.current = null;
    }

    const finalMetrics = getMetrics();

    addEvent('complete', {
      interaction_count: interactionCountRef.current,
    });

    setIsTracking(false);

    log('Tracking stopped', finalMetrics);

    return finalMetrics;
  }, [isTracking, config.minPauseDuration, getMetrics, addEvent, log]);

  // Keep ref updated with latest stopTracking function
  stopTrackingRef.current = stopTracking;

  // Record user interaction
  const recordInteraction = useCallback(
    (elementId?: string, elementType?: string) => {
      if (!isTracking) return;

      const now = performance.now();

      // If this is first interaction, record it
      if (lastInteractionRef.current === null) {
        lastInteractionRef.current = now;
      }

      interactionCountRef.current++;

      // If in pause state, end the pause
      if (pauseStartRef.current !== null) {
        const pauseDuration = now - pauseStartRef.current;
        if (pauseDuration >= config.minPauseDuration) {
          pausesRef.current.push(pauseDuration);
          totalPauseTimeRef.current += pauseDuration;
        }
        pauseStartRef.current = null;

        addEvent('resume', { element_id: elementId, element_type: elementType });
      }

      // Update current hesitation
      setCurrentHesitation(totalPauseTimeRef.current);

      log('Interaction recorded', { elementId, elementType, count: interactionCountRef.current });
    },
    [isTracking, config.minPauseDuration, addEvent, log],
  );

  // Record pause start
  const recordPause = useCallback(() => {
    if (!isTracking || pauseStartRef.current !== null) return;

    pauseStartRef.current = performance.now();
    addEvent('pause');

    log('Pause started');
  }, [isTracking, addEvent, log]);

  // Record pause end
  const recordResume = useCallback(() => {
    if (!isTracking || pauseStartRef.current === null) return;

    const pauseDuration = performance.now() - pauseStartRef.current;

    if (pauseDuration >= config.minPauseDuration) {
      pausesRef.current.push(pauseDuration);
      totalPauseTimeRef.current += pauseDuration;
      setCurrentHesitation(totalPauseTimeRef.current);
    }

    pauseStartRef.current = null;
    addEvent('resume');

    log('Pause ended', { duration: pauseDuration });
  }, [isTracking, config.minPauseDuration, addEvent, log]);

  // Check threshold and trigger callback
  useEffect(() => {
    if (!isTracking || thresholdTriggeredRef.current) return;

    const checkThreshold = () => {
      const metrics = getMetrics();

      if (metrics.total_hesitation_ms >= config.hesitationThreshold) {
        thresholdTriggeredRef.current = true;
        config.onHesitationThresholdExceeded(metrics);
        log('Hesitation threshold exceeded', metrics);
      }
    };

    const interval = setInterval(checkThreshold, 1000);
    return () => clearInterval(interval);
  }, [
    isTracking,
    config.hesitationThreshold,
    config.onHesitationThresholdExceeded,
    getMetrics,
    log,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
    };
  }, []);

  return {
    startTracking,
    stopTracking,
    recordInteraction,
    recordPause,
    recordResume,
    getMetrics,
    isTracking,
    currentHesitation,
    events,
  };
}

// ----------------------------------------------------------------------------
// UTILITY HOOKS
// ----------------------------------------------------------------------------

/**
 * Hook to automatically track visibility-based pauses
 * Uses Intersection Observer to detect when content scrolls out of view
 */
export function useVisibilityHesitation(
  elementRef: React.RefObject<HTMLElement>,
  tracker: UseHesitationTrackerReturn,
  options: { threshold?: number } = {},
) {
  const { threshold = 0.5 } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !tracker.isTracking) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tracker.recordResume();
          } else {
            tracker.recordPause();
          }
        });
      },
      { threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, tracker, threshold]);
}

/**
 * Hook to track focus-based pauses
 * Pauses when window loses focus
 */
export function useFocusHesitation(tracker: UseHesitationTrackerReturn) {
  useEffect(() => {
    if (!tracker.isTracking) return;

    const handleBlur = () => tracker.recordPause();
    const handleFocus = () => tracker.recordResume();

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [tracker]);
}

/**
 * Hook to track idle-based pauses
 * Pauses when user stops interacting for specified duration
 */
export function useIdleHesitation(
  tracker: UseHesitationTrackerReturn,
  idleThreshold: number = 3000,
) {
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  useEffect(() => {
    if (!tracker.isTracking) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      if (isIdleRef.current) {
        isIdleRef.current = false;
        tracker.recordResume();
      }

      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        tracker.recordPause();
      }, idleThreshold);
    };

    // Events that reset idle
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Start initial timer
    resetIdleTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [tracker, idleThreshold]);
}

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export default useHesitationTracker;
