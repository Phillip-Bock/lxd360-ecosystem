'use client';

import { nanoid } from 'nanoid';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('XAPIProvider');

// xAPI Statement types
interface Actor {
  objectType: 'Agent';
  name: string;
  mbox: string;
}

interface Verb {
  id: string;
  display: { 'en-US': string };
}

interface Activity {
  objectType: 'Activity';
  id: string;
  definition?: {
    name?: { 'en-US': string };
    description?: { 'en-US': string };
    type?: string;
  };
}

interface Result {
  score?: { scaled?: number; raw?: number; min?: number; max?: number };
  success?: boolean;
  completion?: boolean;
  duration?: string;
  response?: string;
  extensions?: Record<string, unknown>;
}

interface Context {
  registration?: string;
  contextActivities?: {
    parent?: Activity[];
    grouping?: Activity[];
    category?: Activity[];
  };
  extensions?: Record<string, unknown>;
}

interface Statement {
  id?: string;
  actor: Actor;
  verb: Verb;
  object: Activity;
  result?: Result;
  context?: Context;
  timestamp?: string;
}

// INSPIRE Extension IRIs
const INSPIRE_NS = 'https://lxd360.com/xapi/extensions';

export const INSPIRE_EXTENSIONS = {
  LATENCY: `${INSPIRE_NS}/latency`,
  COGNITIVE_LOAD: `${INSPIRE_NS}/cognitive-load`,
  HESITATION_COUNT: `${INSPIRE_NS}/hesitation-count`,
  FUNCTIONAL_STATE: `${INSPIRE_NS}/functional-state`,
  SESSION_ID: `${INSPIRE_NS}/session-id`,
  MODALITY: `${INSPIRE_NS}/modality`,
  BLOCK_ID: `${INSPIRE_NS}/block-id`,
  ENCODING_PHASE: `${INSPIRE_NS}/encoding-phase`,
  CONSENT_TIER: `${INSPIRE_NS}/consent-tier`,
} as const;

// Common verbs
export const VERBS = {
  LAUNCHED: { id: 'http://adlnet.gov/expapi/verbs/launched', display: { 'en-US': 'launched' } },
  COMPLETED: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
  ANSWERED: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
  PROGRESSED: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  INTERACTED: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  PASSED: { id: 'http://adlnet.gov/expapi/verbs/passed', display: { 'en-US': 'passed' } },
  FAILED: { id: 'http://adlnet.gov/expapi/verbs/failed', display: { 'en-US': 'failed' } },
  EXPERIENCED: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  SUSPENDED: { id: 'http://adlnet.gov/expapi/verbs/suspended', display: { 'en-US': 'suspended' } },
  RESUMED: { id: 'http://adlnet.gov/expapi/verbs/resumed', display: { 'en-US': 'resumed' } },
} as const;

interface XAPIContextValue {
  sessionId: string;
  sendStatement: (statement: Omit<Statement, 'id' | 'timestamp'>) => Promise<void>;
  trackInteraction: (params: {
    verb: Verb;
    objectId: string;
    objectName: string;
    objectType?: string;
    result?: Result;
    extensions?: Record<string, unknown>;
  }) => Promise<void>;
  trackProgress: (params: {
    courseId: string;
    lessonId: string;
    progress: number;
    blockId?: string;
  }) => Promise<void>;
  trackCompletion: (params: {
    courseId: string;
    lessonId: string;
    score?: number;
    success?: boolean;
    duration?: string;
  }) => Promise<void>;
}

const XAPIContext = createContext<XAPIContextValue | null>(null);

interface XAPIProviderProps {
  children: ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
  };
  consentTier?: number;
}

/**
 * XAPIProvider - Provides xAPI statement tracking throughout the application
 *
 * Features:
 * - Automatic session management
 * - Statement batching (future)
 * - INSPIRE extension support
 * - Consent tier handling
 */
export function XAPIProvider({ children, user, consentTier = 0 }: XAPIProviderProps) {
  const sessionId = useMemo(() => nanoid(), []);

  const createActor = useCallback(
    (): Actor => ({
      objectType: 'Agent',
      name: user.name,
      mbox: `mailto:${user.email}`,
    }),
    [user],
  );

  const sendStatement = useCallback(
    async (statement: Omit<Statement, 'id' | 'timestamp'>) => {
      const fullStatement: Statement = {
        ...statement,
        id: nanoid(),
        timestamp: new Date().toISOString(),
        context: {
          ...statement.context,
          extensions: {
            ...statement.context?.extensions,
            [INSPIRE_EXTENSIONS.SESSION_ID]: sessionId,
            [INSPIRE_EXTENSIONS.CONSENT_TIER]: consentTier,
          },
        },
      };

      try {
        const response = await fetch('/api/xapi/statements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullStatement),
        });

        if (!response.ok) {
          log.error('Failed to send xAPI statement', new Error(await response.text()));
        }
      } catch (error) {
        log.error(
          'Error sending xAPI statement',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    },
    [sessionId, consentTier],
  );

  const trackInteraction = useCallback(
    async ({
      verb,
      objectId,
      objectName,
      objectType = 'http://adlnet.gov/expapi/activities/interaction',
      result,
      extensions = {},
    }: {
      verb: Verb;
      objectId: string;
      objectName: string;
      objectType?: string;
      result?: Result;
      extensions?: Record<string, unknown>;
    }) => {
      await sendStatement({
        actor: createActor(),
        verb,
        object: {
          objectType: 'Activity',
          id: objectId,
          definition: {
            name: { 'en-US': objectName },
            type: objectType,
          },
        },
        result,
        context: {
          extensions,
        },
      });
    },
    [sendStatement, createActor],
  );

  const trackProgress = useCallback(
    async ({
      courseId,
      lessonId,
      progress,
      blockId,
    }: {
      courseId: string;
      lessonId: string;
      progress: number;
      blockId?: string;
    }) => {
      await sendStatement({
        actor: createActor(),
        verb: VERBS.PROGRESSED,
        object: {
          objectType: 'Activity',
          id: `https://lxd360.com/courses/${courseId}/lessons/${lessonId}`,
          definition: {
            name: { 'en-US': `Lesson ${lessonId}` },
            type: 'http://adlnet.gov/expapi/activities/lesson',
          },
        },
        result: {
          extensions: {
            'https://w3id.org/xapi/cmi5/result/extensions/progress': progress,
          },
        },
        context: {
          contextActivities: {
            parent: [
              {
                objectType: 'Activity',
                id: `https://lxd360.com/courses/${courseId}`,
              },
            ],
          },
          extensions: blockId ? { [INSPIRE_EXTENSIONS.BLOCK_ID]: blockId } : undefined,
        },
      });
    },
    [sendStatement, createActor],
  );

  const trackCompletion = useCallback(
    async ({
      courseId,
      lessonId,
      score,
      success,
      duration,
    }: {
      courseId: string;
      lessonId: string;
      score?: number;
      success?: boolean;
      duration?: string;
    }) => {
      await sendStatement({
        actor: createActor(),
        verb: VERBS.COMPLETED,
        object: {
          objectType: 'Activity',
          id: `https://lxd360.com/courses/${courseId}/lessons/${lessonId}`,
          definition: {
            name: { 'en-US': `Lesson ${lessonId}` },
            type: 'http://adlnet.gov/expapi/activities/lesson',
          },
        },
        result: {
          completion: true,
          success,
          score: score !== undefined ? { scaled: score / 100 } : undefined,
          duration,
        },
        context: {
          contextActivities: {
            parent: [
              {
                objectType: 'Activity',
                id: `https://lxd360.com/courses/${courseId}`,
              },
            ],
          },
        },
      });
    },
    [sendStatement, createActor],
  );

  const value = useMemo<XAPIContextValue>(
    () => ({
      sessionId,
      sendStatement,
      trackInteraction,
      trackProgress,
      trackCompletion,
    }),
    [sessionId, sendStatement, trackInteraction, trackProgress, trackCompletion],
  );

  return <XAPIContext.Provider value={value}>{children}</XAPIContext.Provider>;
}

/**
 * Hook to access xAPI tracking context
 */
export function useXAPI() {
  const context = useContext(XAPIContext);
  if (!context) {
    throw new Error('useXAPI must be used within an XAPIProvider');
  }
  return context;
}

/**
 * Hook to get xAPI verbs
 */
export function useXAPIVerbs() {
  return VERBS;
}
