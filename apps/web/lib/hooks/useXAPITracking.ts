/**
 * xAPI Statement Tracking Hook
 *
 * Provides methods to send xAPI statements to the LRS.
 * Implements xAPI 1.0.3 specification.
 */

import { useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'hooks-xapi-tracking' });

// xAPI Verbs
const VERBS = {
  initialized: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  launched: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  experienced: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  progressed: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  completed: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  passed: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  failed: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  answered: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  interacted: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  suspended: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },
  resumed: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
} as const;

// Activity types
const ACTIVITY_TYPES = {
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  interaction: 'http://adlnet.gov/expapi/activities/interaction',
  media: 'http://adlnet.gov/expapi/activities/media',
} as const;

interface Actor {
  objectType: 'Agent';
  name: string;
  mbox?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

interface UseXAPITrackingOptions {
  actor: Actor;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleName?: string;
  baseIRI?: string;
}

interface StatementResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;
}

interface UseXAPITrackingReturn {
  sendStatement: (
    verb: keyof typeof VERBS,
    activityId: string,
    activityName: string,
    activityType?: keyof typeof ACTIVITY_TYPES,
    result?: StatementResult,
    cognitiveLoadIndex?: number,
  ) => Promise<string | null>;
  trackProgress: (progress: number) => Promise<void>;
  trackCompletion: (score?: number, passed?: boolean) => Promise<void>;
  trackInteraction: (
    interactionId: string,
    interactionType: string,
    response: string,
    correct?: boolean,
  ) => Promise<void>;
  saveState: (stateId: string, state: unknown) => Promise<void>;
  loadState: (stateId: string) => Promise<unknown | null>;
}

export function useXAPITracking(options: UseXAPITrackingOptions): UseXAPITrackingReturn {
  const {
    actor,
    courseId,
    courseName,
    moduleId,
    moduleName,
    baseIRI = 'https://lxp360.com/activities',
  } = options;

  const sessionStart = useRef(Date.now());

  // Format ISO 8601 duration
  const formatDuration = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `PT${hours}H${minutes % 60}M${seconds % 60}S`;
    } else if (minutes > 0) {
      return `PT${minutes}M${seconds % 60}S`;
    }
    return `PT${seconds}S`;
  }, []);

  // Send xAPI statement
  const sendStatement = useCallback(
    async (
      verb: keyof typeof VERBS,
      activityId: string,
      activityName: string,
      activityType: keyof typeof ACTIVITY_TYPES = 'lesson',
      result?: StatementResult,
      cognitiveLoadIndex?: number,
    ): Promise<string | null> => {
      try {
        const statement = {
          actor,
          verb: VERBS[verb],
          object: {
            objectType: 'Activity' as const,
            id: `${baseIRI}/${activityId}`,
            definition: {
              type: ACTIVITY_TYPES[activityType],
              name: { 'en-US': activityName },
            },
          },
          result,
          context: moduleId
            ? {
                contextActivities: {
                  parent: [
                    {
                      objectType: 'Activity' as const,
                      id: `${baseIRI}/modules/${moduleId}`,
                      definition: {
                        type: ACTIVITY_TYPES.module,
                        name: { 'en-US': moduleName || moduleId },
                      },
                    },
                  ],
                  grouping: [
                    {
                      objectType: 'Activity' as const,
                      id: `${baseIRI}/courses/${courseId}`,
                      definition: {
                        type: ACTIVITY_TYPES.course,
                        name: { 'en-US': courseName },
                      },
                    },
                  ],
                },
              }
            : {
                contextActivities: {
                  grouping: [
                    {
                      objectType: 'Activity' as const,
                      id: `${baseIRI}/courses/${courseId}`,
                      definition: {
                        type: ACTIVITY_TYPES.course,
                        name: { 'en-US': courseName },
                      },
                    },
                  ],
                },
              },
          timestamp: new Date().toISOString(),
        };

        const response = await fetch('/api/lrs/statements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statement,
            courseId,
            moduleId,
            cognitiveLoadIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send statement: ${response.status}`);
        }

        const data = await response.json();
        return data.id;
      } catch (error) {
        log.error('Failed to send xAPI statement', { error });
        return null;
      }
    },
    [actor, courseId, courseName, moduleId, moduleName, baseIRI],
  );

  // Track progress
  const trackProgress = useCallback(
    async (progress: number) => {
      const duration = formatDuration(Date.now() - sessionStart.current);
      await sendStatement('progressed', `courses/${courseId}`, courseName, 'course', {
        score: { scaled: progress / 100 },
        duration,
      });
    },
    [courseId, courseName, formatDuration, sendStatement],
  );

  // Track completion
  const trackCompletion = useCallback(
    async (score?: number, passed?: boolean) => {
      const duration = formatDuration(Date.now() - sessionStart.current);
      const verb = passed === false ? 'failed' : passed === true ? 'passed' : 'completed';

      await sendStatement(verb, `courses/${courseId}`, courseName, 'course', {
        score:
          score !== undefined ? { scaled: score / 100, raw: score, max: 100, min: 0 } : undefined,
        success: passed,
        completion: true,
        duration,
      });
    },
    [courseId, courseName, formatDuration, sendStatement],
  );

  // Track interaction (quiz, exercise, etc.)
  const trackInteraction = useCallback(
    async (interactionId: string, interactionType: string, response: string, correct?: boolean) => {
      await sendStatement('answered', interactionId, interactionType, 'interaction', {
        response,
        success: correct,
      });
    },
    [sendStatement],
  );

  // Save activity state
  const saveState = useCallback(
    async (stateId: string, state: unknown) => {
      try {
        const agent = JSON.stringify(actor);
        const activityId = `${baseIRI}/courses/${courseId}`;

        const params = new URLSearchParams({
          activityId,
          agent,
          stateId,
        });

        await fetch(`/api/lrs/state?${params}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
      } catch (error) {
        log.error('Failed to save state', { error });
      }
    },
    [actor, baseIRI, courseId],
  );

  // Load activity state
  const loadState = useCallback(
    async (stateId: string): Promise<unknown | null> => {
      try {
        const agent = JSON.stringify(actor);
        const activityId = `${baseIRI}/courses/${courseId}`;

        const params = new URLSearchParams({
          activityId,
          agent,
          stateId,
        });

        const response = await fetch(`/api/lrs/state?${params}`);

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          throw new Error(`Failed to load state: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        log.error('Failed to load state', { error });
        return null;
      }
    },
    [actor, baseIRI, courseId],
  );

  return {
    sendStatement,
    trackProgress,
    trackCompletion,
    trackInteraction,
    saveState,
    loadState,
  };
}
