'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity, Actor, Context, InteractionType, Result, Statement, Verb } from './types';
import { buildActivity, formatDuration, VERBS, type VerbKey } from './vocabulary';

// ============================================================================
// TYPES
// ============================================================================

export interface UseXAPITrackerOptions {
  actor: Actor;
  endpoint?: string;
  courseId?: string;
  courseName?: string;
  moduleId?: string;
  moduleName?: string;
  batchSize?: number;
  flushInterval?: number;
  offlineSupport?: boolean;
}

export interface TrackStatementOptions {
  result?: Result;
  context?: Partial<Context>;
  timestamp?: string;
}

export interface UseXAPITrackerReturn {
  trackStatement: (
    verb: Verb | VerbKey,
    object: Activity,
    options?: TrackStatementOptions,
  ) => Promise<string | null>;
  trackCompletion: (
    activityId: string,
    success?: boolean,
    score?: number,
    duration?: number,
  ) => Promise<string | null>;
  trackProgress: (activityId: string, progress: number) => Promise<string | null>;
  trackInteraction: (
    activityId: string,
    response: string,
    correct?: boolean,
    interactionType?: string,
  ) => Promise<string | null>;
  trackMediaEvent: (
    activityId: string,
    action: 'played' | 'paused' | 'seeked',
    position?: number,
    duration?: number,
  ) => Promise<string | null>;
  flush: () => Promise<void>;
  pendingCount: number;
  isOnline: boolean;
}

export interface UseActivityStateOptions {
  actor: Actor;
  endpoint?: string;
  registration?: string;
}

export interface UseActivityStateReturn<T> {
  state: T | null;
  setState: (state: T) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseLearnerProgressOptions {
  endpoint?: string;
  refreshInterval?: number;
}

export interface LearnerProgressData {
  courseId: string;
  completions: number;
  averageScore: number;
  totalTimeSpent: number;
  lastActivity: string;
}

// ============================================================================
// STATEMENT TRACKING HOOK
// ============================================================================

const STORAGE_KEY = 'lxp360_xapi_queue';

/**
 * Hook for tracking xAPI statements
 *
 * @example
 * const { trackCompletion, trackProgress } = useXAPITracker({
 *   actor: { objectType: 'Agent', mbox: 'mailto:user@example.com', name: 'John' },
 *   courseId: 'safety-101',
 *   courseName: 'Safety Training 101',
 * })
 *
 * // Track progress
 * await trackProgress('lesson-1', 50)
 *
 * // Track completion
 * await trackCompletion('lesson-1', true, 85)
 */
export function useXAPITracker(options: UseXAPITrackerOptions): UseXAPITrackerReturn {
  const {
    actor,
    endpoint = '/api/lrs/statements',
    courseId,
    courseName,
    moduleId,
    moduleName,
    batchSize = 10,
    flushInterval = 5000,
    offlineSupport = true,
  } = options;

  const queueRef = useRef<Statement[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load offline queue on mount
  useEffect(() => {
    if (offlineSupport && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          queueRef.current = parsed;
          setPendingCount(parsed.length);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [offlineSupport]);

  // Online/offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Build context with course/module hierarchy
  const buildContext = useCallback(
    (additionalContext?: Partial<Context>): Context => {
      const contextActivities: Context['contextActivities'] = {};

      if (moduleId) {
        contextActivities.parent = [
          {
            objectType: 'Activity',
            id: `https://lxp360.com/xapi/activities/module/${moduleId}`,
            definition: {
              type: 'http://adlnet.gov/expapi/activities/module',
              name: moduleName ? { 'en-US': moduleName } : undefined,
            },
          },
        ];
      }

      if (courseId) {
        contextActivities.grouping = [
          {
            objectType: 'Activity',
            id: `https://lxp360.com/xapi/activities/course/${courseId}`,
            definition: {
              type: 'http://adlnet.gov/expapi/activities/course',
              name: courseName ? { 'en-US': courseName } : undefined,
            },
          },
        ];
      }

      return {
        ...additionalContext,
        contextActivities:
          Object.keys(contextActivities).length > 0 ? contextActivities : undefined,
        platform: 'LXP360',
      };
    },
    [courseId, courseName, moduleId, moduleName],
  );

  // Save queue to localStorage
  const saveQueue = useCallback(() => {
    if (offlineSupport && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queueRef.current));
      } catch {
        // Storage full, clear old items
        queueRef.current = queueRef.current.slice(-batchSize);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queueRef.current));
      }
    }
  }, [offlineSupport, batchSize]);

  // Flush statements to server
  const flush = useCallback(async (): Promise<void> => {
    if (queueRef.current.length === 0 || !isOnline) return;

    const statements = [...queueRef.current];
    queueRef.current = [];
    setPendingCount(0);
    saveQueue();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statements,
          courseId,
          moduleId,
        }),
      });

      if (!response.ok) {
        // Re-queue on failure
        queueRef.current = [...statements, ...queueRef.current];
        setPendingCount(queueRef.current.length);
        saveQueue();
      }
    } catch {
      // Re-queue on error
      queueRef.current = [...statements, ...queueRef.current];
      setPendingCount(queueRef.current.length);
      saveQueue();
    }
  }, [endpoint, courseId, moduleId, isOnline, saveQueue]);

  // Schedule flush
  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(flush, flushInterval);
  }, [flush, flushInterval]);

  // Queue a statement
  const queueStatement = useCallback(
    (statement: Statement) => {
      queueRef.current.push(statement);
      setPendingCount(queueRef.current.length);
      saveQueue();

      if (queueRef.current.length >= batchSize) {
        flush();
      } else {
        scheduleFlush();
      }
    },
    [batchSize, flush, scheduleFlush, saveQueue],
  );

  // Track a statement
  const trackStatement = useCallback(
    async (
      verb: Verb | VerbKey,
      object: Activity,
      trackOptions?: TrackStatementOptions,
    ): Promise<string | null> => {
      const verbObj = typeof verb === 'string' ? VERBS[verb] : verb;
      const statementId = crypto.randomUUID();

      const statement: Statement = {
        id: statementId,
        actor,
        verb: verbObj,
        object,
        result: trackOptions?.result,
        context: buildContext(trackOptions?.context),
        timestamp: trackOptions?.timestamp || new Date().toISOString(),
        version: '1.0.3',
      };

      queueStatement(statement);
      return statementId;
    },
    [actor, buildContext, queueStatement],
  );

  // Track completion
  const trackCompletion = useCallback(
    async (
      activityId: string,
      success?: boolean,
      score?: number,
      duration?: number,
    ): Promise<string | null> => {
      const verb =
        success === false ? VERBS.failed : success === true ? VERBS.passed : VERBS.completed;

      const result: Result = {
        completion: true,
      };

      if (success !== undefined) {
        result.success = success;
      }

      if (score !== undefined) {
        result.score = {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100,
        };
      }

      if (duration !== undefined) {
        result.duration = formatDuration(duration);
      }

      return trackStatement(verb, buildActivity(activityId, activityId, 'lesson'), { result });
    },
    [trackStatement],
  );

  // Track progress
  const trackProgress = useCallback(
    async (activityId: string, progress: number): Promise<string | null> => {
      return trackStatement(VERBS.progressed, buildActivity(activityId, activityId, 'lesson'), {
        result: {
          score: { scaled: progress / 100 },
        },
      });
    },
    [trackStatement],
  );

  // Track interaction (quiz, exercise)
  const trackInteraction = useCallback(
    async (
      activityId: string,
      response: string,
      correct?: boolean,
      interactionType?: string,
    ): Promise<string | null> => {
      const activity: Activity = {
        objectType: 'Activity',
        id: `https://lxp360.com/xapi/activities/interaction/${activityId}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
          interactionType: (interactionType as InteractionType) || 'other',
        },
      };

      return trackStatement(VERBS.answered, activity, {
        result: {
          response,
          success: correct,
        },
      });
    },
    [trackStatement],
  );

  // Track media event
  const trackMediaEvent = useCallback(
    async (
      activityId: string,
      action: 'played' | 'paused' | 'seeked',
      position?: number,
      duration?: number,
    ): Promise<string | null> => {
      const verb = VERBS[action];

      const activity: Activity = {
        objectType: 'Activity',
        id: `https://lxp360.com/xapi/activities/video/${activityId}`,
        definition: {
          type: 'https://w3id.org/xapi/video/activity-type/video',
        },
      };

      const extensions: Record<string, unknown> = {};
      if (position !== undefined) {
        extensions['https://w3id.org/xapi/video/extensions/time'] = position;
      }
      if (duration !== undefined) {
        extensions['https://w3id.org/xapi/video/extensions/length'] = duration;
      }

      return trackStatement(verb, activity, {
        result: Object.keys(extensions).length > 0 ? { extensions } : undefined,
      });
    },
    [trackStatement],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      // Final flush
      if (queueRef.current.length > 0) {
        flush();
      }
    };
  }, [flush]);

  return {
    trackStatement,
    trackCompletion,
    trackProgress,
    trackInteraction,
    trackMediaEvent,
    flush,
    pendingCount,
    isOnline,
  };
}

// ============================================================================
// ACTIVITY STATE HOOK
// ============================================================================

/**
 * Hook for managing activity state (bookmarks, progress, etc.)
 *
 * @example
 * const { state, setState, isLoading } = useActivityState<{ page: number }>({
 *   activityId: 'course-safety-101',
 *   actor: { objectType: 'Agent', mbox: 'mailto:user@example.com' },
 * })
 *
 * // Resume from state
 * if (state?.page) {
 *   goToPage(state.page)
 * }
 *
 * // Save state
 * await setState({ page: 5 })
 */
export function useActivityState<T>(
  activityId: string,
  options: UseActivityStateOptions,
): UseActivityStateReturn<T> {
  const { actor, endpoint = '/api/lrs/state', registration } = options;

  const [state, setStateValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          activityId,
          agent: JSON.stringify(actor),
          stateId: 'resume',
        });

        if (registration) {
          params.set('registration', registration);
        }

        const response = await fetch(`${endpoint}?${params}`);

        if (response.status === 404) {
          setStateValue(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load state: ${response.status}`);
        }

        const data = await response.json();
        setStateValue(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [activityId, actor, endpoint, registration]);

  // Save state
  const setState = useCallback(
    async (newState: T): Promise<void> => {
      try {
        setError(null);

        const params = new URLSearchParams({
          activityId,
          agent: JSON.stringify(actor),
          stateId: 'resume',
        });

        if (registration) {
          params.set('registration', registration);
        }

        const response = await fetch(`${endpoint}?${params}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newState),
        });

        if (!response.ok) {
          throw new Error(`Failed to save state: ${response.status}`);
        }

        setStateValue(newState);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      }
    },
    [activityId, actor, endpoint, registration],
  );

  return { state, setState, isLoading, error };
}

// ============================================================================
// LEARNER PROGRESS HOOK
// ============================================================================

/**
 * Hook for fetching aggregated learner progress
 *
 * @example
 * const { progress, isLoading } = useLearnerProgress('course-safety-101')
 *
 * // Display progress
 * <ProgressBar value={progress?.completionRate || 0} />
 */
export function useLearnerProgress(
  activityId?: string,
  options: UseLearnerProgressOptions = {},
): {
  progress: LearnerProgressData[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const { endpoint = '/api/lrs/statements', refreshInterval } = options;

  const [progress, setProgress] = useState<LearnerProgressData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        verb: 'http://adlnet.gov/expapi/verbs/completed',
        limit: '100',
      });

      if (activityId) {
        params.set('activity', activityId);
      }

      const response = await fetch(`${endpoint}?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.status}`);
      }

      const data = await response.json();

      // Aggregate by course
      const byActivity = new Map<string, LearnerProgressData>();

      for (const statement of data.statements) {
        const courseId =
          statement.context?.contextActivities?.grouping?.[0]?.id || statement.object.id;
        const existing = byActivity.get(courseId) || {
          courseId,
          completions: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          lastActivity: '',
        };

        existing.completions++;
        if (statement.result?.score?.scaled) {
          existing.averageScore =
            (existing.averageScore * (existing.completions - 1) +
              statement.result.score.scaled * 100) /
            existing.completions;
        }
        if (!existing.lastActivity || statement.timestamp > existing.lastActivity) {
          existing.lastActivity = statement.timestamp;
        }

        byActivity.set(courseId, existing);
      }

      setProgress(Array.from(byActivity.values()));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, activityId]);

  useEffect(() => {
    fetchProgress();

    if (refreshInterval) {
      const interval = setInterval(fetchProgress, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchProgress, refreshInterval]);

  return { progress, isLoading, error, refresh: fetchProgress };
}
