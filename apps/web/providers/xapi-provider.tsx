'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as generateUUID } from 'uuid';
import { logger } from '@/lib/logger';
import {
  getLRSClient,
  hasLRSClient,
  type ILRSClient,
  initializeTrackingClient,
  queueStatement,
} from '@/lib/xapi/lrs-client';

const log = logger.scope('xAPIProvider');

import type { ActorOptions } from '@/lib/xapi/statement-builder';
import {
  type StatementBuilder as BaseStatementBuilder,
  createStatementBuilder,
} from '@/lib/xapi/statement-builder';
import type {
  ExternalTrackingConfig,
  InteractionType,
  LRSConfig,
  QueueStatus,
  TrackingConfig,
  TrackingSession,
  XAPIActor,
  XAPIProviderConfig,
  XAPIStatement,
} from '@/types/xapi';

// Helper function to format interaction responses for xAPI
function formatInteractionResponse(_interactionType: InteractionType, response: unknown): string {
  if (typeof response === 'string') return response;
  if (typeof response === 'boolean') return response ? 'true' : 'false';
  if (typeof response === 'number') return String(response);
  if (Array.isArray(response)) {
    return response.map((r) => String(r)).join('[,]');
  }
  return JSON.stringify(response);
}

/**
 * Extended StatementBuilder with convenience methods for the xAPI provider.
 * Wraps the base StatementBuilder to provide a fluent API for common operations.
 */
class StatementBuilder {
  private builder: BaseStatementBuilder;

  constructor() {
    this.builder = createStatementBuilder();
  }

  // Actor methods
  withActor(actor: ActorOptions | XAPIActor): this {
    if ('userId' in actor) {
      this.builder.withActor(actor);
    } else {
      // Convert XAPIActor to ActorOptions
      const actorOptions: ActorOptions = {
        userId: 'account' in actor && actor.account ? actor.account.name : 'unknown',
        email: 'mbox' in actor && actor.mbox ? actor.mbox.replace('mailto:', '') : undefined,
        name: actor.name,
      };
      this.builder.withActor(actorOptions);
    }
    return this;
  }

  // Verb methods - provide a fluent API that maps to withVerb
  // Accepts all ExtendedXAPIVerb types including lifecycle, assessment, media, and social verbs
  verb(
    verbKey:
      | 'initialized'
      | 'launched'
      | 'completed'
      | 'passed'
      | 'failed'
      | 'terminated'
      | 'progressed'
      | 'resumed'
      | 'suspended'
      | 'experienced'
      | 'interacted'
      | 'answered'
      | 'attempted'
      | 'played'
      | 'paused'
      | 'seeked'
      | 'mastered'
      | 'commented'
      | 'shared'
      | 'liked'
      | 'exited'
      | 'skipped'
      | 'satisfied'
      | 'waived'
      | 'scored'
      | 'asked',
  ): this {
    this.builder.withVerb(verbKey);
    return this;
  }

  // Activity methods
  lesson(lessonId: string, lessonName: string, _description?: string): this {
    this.builder.withActivity({
      id: `https://inspire.lxd360.com/activities/lesson/${lessonId}`,
      name: lessonName,
      type: 'lesson',
    });
    return this;
  }

  slide(slideId: string, slideName: string, _slideIndex?: number): this {
    this.builder.withActivity({
      id: `https://inspire.lxd360.com/activities/slide/${slideId}`,
      name: slideName,
      type: 'lesson', // Using lesson as slide type may not exist
    });
    return this;
  }

  video(videoId: string, videoName: string): this {
    this.builder.withActivity({
      id: `https://inspire.lxd360.com/activities/video/${videoId}`,
      name: videoName,
      type: 'video',
    });
    return this;
  }

  block(blockId: string, blockType: string, blockName: string): this {
    this.builder.withActivity({
      id: `https://inspire.lxd360.com/activities/block/${blockId}`,
      name: blockName,
      type: blockType as 'lesson', // Type casting for compatibility
    });
    return this;
  }

  question(questionId: string, questionText: string, _interactionType: InteractionType): this {
    this.builder.withActivity({
      id: `https://inspire.lxd360.com/activities/question/${questionId}`,
      name: questionText,
      type: 'quiz', // Using quiz as question type
    });
    return this;
  }

  activity(activityId: string, _activityType: string, activityName: string): this {
    this.builder.withActivity({
      id: activityId,
      name: activityName,
    });
    return this;
  }

  // Context methods
  withRegistration(registration: string): this {
    this.builder.withRegistration(registration);
    return this;
  }

  withSessionId(sessionId: string): this {
    this.builder.withSessionId(sessionId);
    return this;
  }

  withContextExtension(key: string, value: unknown): this {
    this.builder.withContextExtensions({ [key]: value });
    return this;
  }

  withCourse(courseId: string, courseName: string): this {
    this.builder.withGroupingActivity({
      id: courseId,
      name: courseName,
      type: 'course',
    });
    return this;
  }

  withParentLesson(lessonId: string, lessonName: string): this {
    this.builder.withParentActivity({
      id: `https://inspire.lxd360.com/activities/lesson/${lessonId}`,
      name: lessonName,
      type: 'lesson',
    });
    return this;
  }

  // Result methods
  withScore(raw: number, max: number): this {
    this.builder.withScore({ raw, max, scaled: max > 0 ? raw / max : 0 });
    return this;
  }

  withSuccess(success: boolean): this {
    this.builder.withSuccess(success);
    return this;
  }

  withCompletion(completion: boolean): this {
    this.builder.withCompletion(completion);
    return this;
  }

  withResponse(response: string): this {
    this.builder.withResponse(response);
    return this;
  }

  withDuration(seconds: number): this {
    this.builder.withDuration(seconds);
    return this;
  }

  withDurationMs(milliseconds: number): this {
    this.builder.withDuration(Math.round(milliseconds / 1000));
    return this;
  }

  withProgress(progress: number): this {
    this.builder.withResultExtensions({
      'https://w3id.org/xapi/cmi5/result/extensions/progress': progress,
    });
    return this;
  }

  // Build method
  build(): XAPIStatement {
    return this.builder.build() as XAPIStatement;
  }
}

// Factory function
function createStatement(): StatementBuilder {
  return new StatementBuilder();
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface XAPIContextValue {
  // Session
  session: TrackingSession | null;
  isInitialized: boolean;
  registration: string;

  // Core tracking
  trackInitialized: () => void;
  trackLaunched: () => void;
  trackCompleted: (options?: { score?: number; maxScore?: number; passed?: boolean }) => void;
  trackPassed: (score: number, maxScore: number) => void;
  trackFailed: (score: number, maxScore: number) => void;
  trackTerminated: () => void;

  // Progress tracking
  trackProgressed: (progress: number) => void;
  trackResumed: (bookmark?: string) => void;
  trackSuspended: (bookmark?: string) => void;

  // Slide tracking
  trackSlideViewed: (slideId: string, slideName: string, slideIndex: number) => void;
  trackSlideCompleted: (slideId: string, slideName: string, duration: number) => void;

  // Interaction tracking
  trackInteracted: (
    objectId: string,
    objectName: string,
    objectType: string,
    data?: Record<string, unknown>,
  ) => void;
  trackExperienced: (objectId: string, objectName: string, duration?: number) => void;

  // Assessment tracking
  trackQuestionAnswered: (
    questionId: string,
    questionText: string,
    interactionType: InteractionType,
    response: unknown,
    correct: boolean,
    score: number,
    maxScore: number,
    duration?: number,
  ) => void;
  trackQuizStarted: (quizId: string, quizName: string) => void;
  trackQuizCompleted: (
    quizId: string,
    quizName: string,
    score: number,
    maxScore: number,
    passed: boolean,
    duration: number,
  ) => void;

  // Media tracking
  trackMediaPlayed: (mediaId: string, mediaName: string, currentTime: number) => void;
  trackMediaPaused: (mediaId: string, mediaName: string, currentTime: number) => void;
  trackMediaSeeked: (mediaId: string, mediaName: string, fromTime: number, toTime: number) => void;
  trackMediaCompleted: (
    mediaId: string,
    mediaName: string,
    duration: number,
    progress?: number,
  ) => void;

  // Custom statement
  sendStatement: (statement: XAPIStatement) => void;
  createStatementBuilder: () => StatementBuilder;

  // Session management
  updateSession: (updates: Partial<TrackingSession>) => void;
  saveBookmark: (slideId: string, slideIndex: number, state?: Record<string, unknown>) => void;

  // Queue status
  queueStatus: QueueStatus;
  flushQueue: () => Promise<void>;
}

const XAPIContext = createContext<XAPIContextValue | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

interface XAPIProviderProps {
  children: ReactNode;

  // Tracking Configuration (new dual-mode)
  trackingConfig?: TrackingConfig;

  // LRS Configuration (legacy - deprecated, use trackingConfig instead)
  /** @deprecated Use trackingConfig instead */
  lrsConfig?: LRSConfig;
  config?: XAPIProviderConfig;

  // Lesson info
  lessonId: string;
  lessonName: string;
  lessonDescription?: string;

  // Course info (optional parent)
  courseId?: string;
  courseName?: string;

  // User info
  actor: {
    id: string;
    email?: string;
    name?: string;
  };

  // Session settings
  registration?: string; // Provide to resume existing attempt
  autoTrackLifecycle?: boolean;

  // Callbacks
  onSessionStart?: (session: TrackingSession) => void;
  onSessionEnd?: (session: TrackingSession) => void;
  onStatementSent?: (statement: XAPIStatement) => void;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function XAPIProvider({
  children,
  trackingConfig,
  lrsConfig,
  config,
  lessonId,
  lessonName,
  lessonDescription,
  courseId,
  courseName,
  actor,
  registration: providedRegistration,
  autoTrackLifecycle = true,
  onSessionStart,
  onSessionEnd,
  onStatementSent,
}: XAPIProviderProps) {
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    length: 0,
    pending: 0,
    failed: 0,
    isOnline: true,
    isFlushing: false,
  });

  const registration = useMemo(
    () => providedRegistration || generateUUID(),
    [providedRegistration],
  );

  const sessionRef = useRef<TrackingSession | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lrsClientRef = useRef<ILRSClient | null>(null);

  // Create xAPI actor
  const xapiActor: XAPIActor = useMemo(
    () => ({
      objectType: 'Agent',
      name: actor.name,
      ...(actor.email
        ? { mbox: `mailto:${actor.email}` }
        : {
            account: {
              homePage: 'https://inspire.lxd360.com',
              name: actor.id,
            },
          }),
    }),
    [actor],
  );

  // Initialize LRS client (supports both new trackingConfig and legacy lrsConfig)
  useEffect(() => {
    // Prefer new trackingConfig over legacy lrsConfig
    if (trackingConfig) {
      lrsClientRef.current = initializeTrackingClient(trackingConfig, config?.queueConfig);

      // Subscribe to status updates
      const unsubscribe = lrsClientRef.current.onStatusChange(setQueueStatus);

      return () => {
        unsubscribe();
      };
    }

    // Legacy fallback for lrsConfig
    if (lrsConfig) {
      // Convert legacy config to external tracking config
      const externalConfig: ExternalTrackingConfig = {
        mode: 'external',
        lrsEndpoint: lrsConfig.endpoint,
        lrsAuth:
          lrsConfig.auth ||
          (lrsConfig.username && lrsConfig.password
            ? `Basic ${btoa(`${lrsConfig.username}:${lrsConfig.password}`)}`
            : undefined),
        enableOfflineQueue: config?.queueConfig?.offlineStorage,
        offlineQueueSize: config?.queueConfig?.maxQueueSize,
      };

      lrsClientRef.current = initializeTrackingClient(externalConfig, config?.queueConfig);

      // Subscribe to status updates
      const unsubscribe = lrsClientRef.current.onStatusChange(setQueueStatus);

      return () => {
        unsubscribe();
      };
    }
  }, [trackingConfig, lrsConfig, config?.queueConfig]);

  // Update queue status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasLRSClient()) {
        setQueueStatus(getLRSClient().getQueueStatus());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Send statement helper
  const sendStatementInternal = useCallback(
    (statement: XAPIStatement) => {
      queueStatement(statement, 'normal');
      onStatementSent?.(statement);

      if (config?.debug) {
        log.debug('xAPI Statement sent', { statement });
      }
    },
    [onStatementSent, config?.debug],
  );

  // Create base context for statements
  const createBaseContext = useCallback(() => {
    const builder = createStatement();

    builder.withRegistration(registration);

    if (config?.platform) {
      builder.withContextExtension('https://lxd360.com/xapi/extensions/platform', config.platform);
    }

    if (config?.language) {
      builder.withContextExtension('https://lxd360.com/xapi/extensions/language', config.language);
    }

    if (sessionRef.current) {
      builder.withSessionId(sessionRef.current.id);
    }

    if (courseId && courseName) {
      builder.withCourse(courseId, courseName);
    }

    return builder;
  }, [registration, config?.platform, config?.language, courseId, courseName]);

  // Calculate progress
  const calculateProgress = useCallback(() => {
    if (!sessionRef.current) return 0;

    const { completedSlides, visitedSlides } = sessionRef.current;
    const total = Math.max(visitedSlides.length, 1);

    return completedSlides.length / total;
  }, []);

  // Update session duration
  const updateSessionDuration = useCallback(() => {
    if (sessionRef.current) {
      const now = Date.now();
      sessionRef.current.totalDuration = now - startTimeRef.current;
      sessionRef.current.lastActivityAt = new Date().toISOString();
      lastActivityRef.current = now;
    }
  }, []);

  // Initialize session
  useEffect(() => {
    const newSession: TrackingSession = {
      id: generateUUID(),
      lessonId,
      userId: actor.id,
      registration,

      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      totalDuration: 0,

      currentSlideIndex: 0,
      currentSlideId: '',
      completedSlides: [],
      visitedSlides: [],

      quizAttempts: {},
      questionAttempts: {},

      totalScore: 0,
      maxScore: 0,
      scaledScore: 0,

      status: 'active',
      completionStatus: false,
    };

    setSession(newSession);
    sessionRef.current = newSession;
    startTimeRef.current = Date.now();

    onSessionStart?.(newSession);

    // Auto track initialized
    if (autoTrackLifecycle) {
      const statement = createStatement()
        .withActor(xapiActor)
        .verb('initialized')
        .lesson(lessonId, lessonName, lessonDescription)
        .withRegistration(registration)
        .withSessionId(newSession.id)
        .build();

      sendStatementInternal(statement);
    }

    setIsInitialized(true);

    // Activity tracking timer
    activityTimerRef.current = setInterval(() => {
      updateSessionDuration();
    }, 10000);

    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }, [
    lessonId,
    lessonName,
    lessonDescription,
    actor.id,
    registration,
    xapiActor,
    autoTrackLifecycle,
    onSessionStart,
    sendStatementInternal,
    updateSessionDuration,
  ]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionRef.current && sessionRef.current.status === 'active') {
        const statement = createStatement()
          .withActor(xapiActor)
          .verb('suspended')
          .lesson(lessonId, lessonName, lessonDescription)
          .withRegistration(registration)
          .withDurationMs(Date.now() - startTimeRef.current)
          .withProgress(calculateProgress())
          .build();

        // Use sendBeacon for reliability on page unload (external mode only)
        const externalEndpoint =
          trackingConfig?.mode === 'external' ? trackingConfig.lrsEndpoint : lrsConfig?.endpoint;

        if (navigator.sendBeacon && externalEndpoint) {
          const url = `${externalEndpoint}/statements`;
          const blob = new Blob([JSON.stringify([statement])], {
            type: 'application/json',
          });
          navigator.sendBeacon(url, blob);
        } else {
          // Fallback - queue statement (works for both internal and external modes)
          queueStatement(statement, 'high');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    xapiActor,
    lessonId,
    lessonName,
    lessonDescription,
    registration,
    trackingConfig,
    lrsConfig,
    calculateProgress,
  ]);

  // ----------------------------------------
  // TRACKING METHODS
  // ----------------------------------------

  const trackInitialized = useCallback(() => {
    const statement = createBaseContext()
      .withActor(xapiActor)
      .verb('initialized')
      .lesson(lessonId, lessonName, lessonDescription)
      .build();

    sendStatementInternal(statement);
  }, [
    createBaseContext,
    xapiActor,
    lessonId,
    lessonName,
    lessonDescription,
    sendStatementInternal,
  ]);

  const trackLaunched = useCallback(() => {
    const statement = createBaseContext()
      .withActor(xapiActor)
      .verb('launched')
      .lesson(lessonId, lessonName, lessonDescription)
      .build();

    sendStatementInternal(statement);
  }, [
    createBaseContext,
    xapiActor,
    lessonId,
    lessonName,
    lessonDescription,
    sendStatementInternal,
  ]);

  const trackCompleted = useCallback(
    (options?: { score?: number; maxScore?: number; passed?: boolean }) => {
      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('completed')
        .lesson(lessonId, lessonName, lessonDescription)
        .withCompletion(true)
        .withDurationMs(Date.now() - startTimeRef.current);

      if (options?.score !== undefined && options?.maxScore !== undefined) {
        builder.withScore(options.score, options.maxScore);
      }

      if (options?.passed !== undefined) {
        builder.withSuccess(options.passed);
      }

      const statement = builder.build();
      sendStatementInternal(statement);

      // Update session
      if (sessionRef.current) {
        sessionRef.current.status = 'completed';
        sessionRef.current.completionStatus = true;
        if (options?.passed !== undefined) {
          sessionRef.current.successStatus = options.passed;
        }
        setSession({ ...sessionRef.current });
        onSessionEnd?.(sessionRef.current);
      }
    },
    [
      createBaseContext,
      xapiActor,
      lessonId,
      lessonName,
      lessonDescription,
      sendStatementInternal,
      onSessionEnd,
    ],
  );

  const trackPassed = useCallback(
    (score: number, maxScore: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('passed')
        .lesson(lessonId, lessonName, lessonDescription)
        .withScore(score, maxScore)
        .withSuccess(true)
        .withCompletion(true)
        .build();

      sendStatementInternal(statement);

      if (sessionRef.current) {
        sessionRef.current.status = 'passed';
        sessionRef.current.successStatus = true;
        sessionRef.current.totalScore = score;
        sessionRef.current.maxScore = maxScore;
        sessionRef.current.scaledScore = maxScore > 0 ? score / maxScore : 0;
        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, lessonDescription, sendStatementInternal],
  );

  const trackFailed = useCallback(
    (score: number, maxScore: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('failed')
        .lesson(lessonId, lessonName, lessonDescription)
        .withScore(score, maxScore)
        .withSuccess(false)
        .withCompletion(true)
        .build();

      sendStatementInternal(statement);

      if (sessionRef.current) {
        sessionRef.current.status = 'failed';
        sessionRef.current.successStatus = false;
        sessionRef.current.totalScore = score;
        sessionRef.current.maxScore = maxScore;
        sessionRef.current.scaledScore = maxScore > 0 ? score / maxScore : 0;
        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, lessonDescription, sendStatementInternal],
  );

  const trackTerminated = useCallback(() => {
    const statement = createBaseContext()
      .withActor(xapiActor)
      .verb('terminated')
      .lesson(lessonId, lessonName, lessonDescription)
      .withDurationMs(Date.now() - startTimeRef.current)
      .build();

    sendStatementInternal(statement);

    if (sessionRef.current) {
      onSessionEnd?.(sessionRef.current);
    }
  }, [
    createBaseContext,
    xapiActor,
    lessonId,
    lessonName,
    lessonDescription,
    sendStatementInternal,
    onSessionEnd,
  ]);

  const trackProgressed = useCallback(
    (progress: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('progressed')
        .lesson(lessonId, lessonName, lessonDescription)
        .withProgress(progress)
        .build();

      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, lessonDescription, sendStatementInternal],
  );

  const trackResumed = useCallback(
    (bookmark?: string) => {
      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('resumed')
        .lesson(lessonId, lessonName, lessonDescription);

      if (bookmark) {
        builder.withContextExtension('https://lxd360.com/xapi/extensions/bookmark', bookmark);
      }

      const statement = builder.build();
      sendStatementInternal(statement);

      if (sessionRef.current) {
        sessionRef.current.status = 'active';
        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, lessonDescription, sendStatementInternal],
  );

  const trackSuspended = useCallback(
    (bookmark?: string) => {
      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('suspended')
        .lesson(lessonId, lessonName, lessonDescription)
        .withDurationMs(Date.now() - startTimeRef.current)
        .withProgress(calculateProgress());

      if (bookmark) {
        builder.withContextExtension('https://lxd360.com/xapi/extensions/bookmark', bookmark);
      }

      const statement = builder.build();
      sendStatementInternal(statement);

      if (sessionRef.current) {
        sessionRef.current.status = 'suspended';
        setSession({ ...sessionRef.current });
      }
    },
    [
      createBaseContext,
      xapiActor,
      lessonId,
      lessonName,
      lessonDescription,
      calculateProgress,
      sendStatementInternal,
    ],
  );

  const trackSlideViewed = useCallback(
    (slideId: string, slideName: string, slideIndex: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('experienced')
        .slide(slideId, slideName, slideIndex)
        .withParentLesson(lessonId, lessonName)
        .build();

      sendStatementInternal(statement);

      // Update session
      if (sessionRef.current) {
        sessionRef.current.currentSlideId = slideId;
        sessionRef.current.currentSlideIndex = slideIndex;
        if (!sessionRef.current.visitedSlides.includes(slideId)) {
          sessionRef.current.visitedSlides.push(slideId);
        }
        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackSlideCompleted = useCallback(
    (slideId: string, slideName: string, duration: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('completed')
        .slide(slideId, slideName)
        .withParentLesson(lessonId, lessonName)
        .withDuration(duration)
        .withCompletion(true)
        .build();

      sendStatementInternal(statement);

      // Update session
      if (sessionRef.current && !sessionRef.current.completedSlides.includes(slideId)) {
        sessionRef.current.completedSlides.push(slideId);
        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackInteracted = useCallback(
    (objectId: string, objectName: string, objectType: string, data?: Record<string, unknown>) => {
      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('interacted')
        .block(objectId, objectType, objectName)
        .withParentLesson(lessonId, lessonName);

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          builder.withContextExtension(`https://lxd360.com/xapi/extensions/${key}`, value);
        });
      }

      const statement = builder.build();
      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackExperienced = useCallback(
    (objectId: string, objectName: string, duration?: number) => {
      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('experienced')
        .block(objectId, 'content', objectName)
        .withParentLesson(lessonId, lessonName);

      if (duration !== undefined) {
        builder.withDuration(duration);
      }

      const statement = builder.build();
      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackQuestionAnswered = useCallback(
    (
      questionId: string,
      questionText: string,
      interactionType: InteractionType,
      response: unknown,
      correct: boolean,
      score: number,
      maxScore: number,
      duration?: number,
    ) => {
      const formattedResponse = formatInteractionResponse(interactionType, response);

      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('answered')
        .question(questionId, questionText, interactionType)
        .withParentLesson(lessonId, lessonName)
        .withResponse(formattedResponse)
        .withScore(score, maxScore)
        .withSuccess(correct)
        .withCompletion(true);

      if (duration !== undefined) {
        builder.withDuration(duration);
      }

      const statement = builder.build();
      sendStatementInternal(statement);

      // Update session
      if (sessionRef.current) {
        const existing = sessionRef.current.questionAttempts[questionId];
        const attemptNumber = existing ? existing.attemptNumber + 1 : 1;

        sessionRef.current.questionAttempts[questionId] = {
          questionId,
          questionType: interactionType,
          attemptNumber,
          responses: [
            ...(existing?.responses || []),
            {
              response: formattedResponse,
              timestamp: new Date().toISOString(),
              correct,
              score,
            },
          ],
          finalResponse: formattedResponse,
          finalCorrect: correct,
          finalScore: score,
          maxScore,
          duration: duration || 0,
          hintsUsed: 0,
        };

        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackQuizStarted = useCallback(
    (quizId: string, quizName: string) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('attempted')
        .activity(
          `https://inspire.lxd360.com/activities/quiz/${quizId}`,
          'http://adlnet.gov/expapi/activities/assessment',
          quizName,
        )
        .withParentLesson(lessonId, lessonName)
        .build();

      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackQuizCompleted = useCallback(
    (
      quizId: string,
      quizName: string,
      score: number,
      maxScore: number,
      passed: boolean,
      duration: number,
    ) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb(passed ? 'passed' : 'failed')
        .activity(
          `https://inspire.lxd360.com/activities/quiz/${quizId}`,
          'http://adlnet.gov/expapi/activities/assessment',
          quizName,
        )
        .withParentLesson(lessonId, lessonName)
        .withScore(score, maxScore)
        .withSuccess(passed)
        .withCompletion(true)
        .withDuration(duration)
        .build();

      sendStatementInternal(statement);

      // Update session
      if (sessionRef.current) {
        const existing = sessionRef.current.quizAttempts[quizId];
        const attemptNumber = existing ? existing.attemptNumber + 1 : 1;

        sessionRef.current.quizAttempts[quizId] = {
          quizId,
          attemptNumber,
          startedAt: existing?.startedAt || new Date().toISOString(),
          completedAt: new Date().toISOString(),
          score,
          maxScore,
          scaledScore: maxScore > 0 ? score / maxScore : 0,
          passed,
          questionIds: [],
          duration,
        };

        // Update total score
        sessionRef.current.totalScore += score;
        sessionRef.current.maxScore += maxScore;
        sessionRef.current.scaledScore =
          sessionRef.current.maxScore > 0
            ? sessionRef.current.totalScore / sessionRef.current.maxScore
            : 0;

        setSession({ ...sessionRef.current });
      }
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackMediaPlayed = useCallback(
    (mediaId: string, mediaName: string, currentTime: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('played')
        .video(mediaId, mediaName)
        .withParentLesson(lessonId, lessonName)
        .withContextExtension('https://w3id.org/xapi/video/extensions/time', currentTime)
        .build();

      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackMediaPaused = useCallback(
    (mediaId: string, mediaName: string, currentTime: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('paused')
        .video(mediaId, mediaName)
        .withParentLesson(lessonId, lessonName)
        .withContextExtension('https://w3id.org/xapi/video/extensions/time', currentTime)
        .build();

      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackMediaSeeked = useCallback(
    (mediaId: string, mediaName: string, fromTime: number, toTime: number) => {
      const statement = createBaseContext()
        .withActor(xapiActor)
        .verb('seeked')
        .video(mediaId, mediaName)
        .withParentLesson(lessonId, lessonName)
        .withContextExtension('https://w3id.org/xapi/video/extensions/time-from', fromTime)
        .withContextExtension('https://w3id.org/xapi/video/extensions/time-to', toTime)
        .build();

      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const trackMediaCompleted = useCallback(
    (mediaId: string, mediaName: string, duration: number, progress?: number) => {
      const builder = createBaseContext()
        .withActor(xapiActor)
        .verb('completed')
        .video(mediaId, mediaName)
        .withParentLesson(lessonId, lessonName)
        .withDuration(duration)
        .withCompletion(true);

      if (progress !== undefined) {
        builder.withProgress(progress);
      }

      const statement = builder.build();
      sendStatementInternal(statement);
    },
    [createBaseContext, xapiActor, lessonId, lessonName, sendStatementInternal],
  );

  const sendStatement = useCallback(
    (statement: XAPIStatement) => {
      sendStatementInternal(statement);
    },
    [sendStatementInternal],
  );

  const createStatementBuilder = useCallback(() => {
    return createBaseContext().withActor(xapiActor);
  }, [createBaseContext, xapiActor]);

  const updateSession = useCallback((updates: Partial<TrackingSession>) => {
    if (sessionRef.current) {
      sessionRef.current = { ...sessionRef.current, ...updates };
      setSession({ ...sessionRef.current });
    }
  }, []);

  const saveBookmark = useCallback(
    (slideId: string, slideIndex: number, state?: Record<string, unknown>) => {
      if (sessionRef.current) {
        sessionRef.current.bookmark = {
          slideId,
          slideIndex,
          timestamp: Date.now(),
          state,
        };
        setSession({ ...sessionRef.current });
      }
    },
    [],
  );

  const flushQueue = useCallback(async () => {
    if (hasLRSClient()) {
      await getLRSClient().flush();
    }
  }, []);

  // ----------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------

  const contextValue: XAPIContextValue = useMemo(
    () => ({
      session,
      isInitialized,
      registration,

      trackInitialized,
      trackLaunched,
      trackCompleted,
      trackPassed,
      trackFailed,
      trackTerminated,

      trackProgressed,
      trackResumed,
      trackSuspended,

      trackSlideViewed,
      trackSlideCompleted,

      trackInteracted,
      trackExperienced,

      trackQuestionAnswered,
      trackQuizStarted,
      trackQuizCompleted,

      trackMediaPlayed,
      trackMediaPaused,
      trackMediaSeeked,
      trackMediaCompleted,

      sendStatement,
      createStatementBuilder,

      updateSession,
      saveBookmark,

      queueStatus,
      flushQueue,
    }),
    [
      session,
      isInitialized,
      registration,
      trackInitialized,
      trackLaunched,
      trackCompleted,
      trackPassed,
      trackFailed,
      trackTerminated,
      trackProgressed,
      trackResumed,
      trackSuspended,
      trackSlideViewed,
      trackSlideCompleted,
      trackInteracted,
      trackExperienced,
      trackQuestionAnswered,
      trackQuizStarted,
      trackQuizCompleted,
      trackMediaPlayed,
      trackMediaPaused,
      trackMediaSeeked,
      trackMediaCompleted,
      sendStatement,
      createStatementBuilder,
      updateSession,
      saveBookmark,
      queueStatus,
      flushQueue,
    ],
  );

  return <XAPIContext.Provider value={contextValue}>{children}</XAPIContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access xAPI tracking context.
 * @throws Error if used outside XAPIProvider
 */
export function useXAPIContext(): XAPIContextValue {
  const context = useContext(XAPIContext);

  if (!context) {
    throw new Error('useXAPIContext must be used within an XAPIProvider');
  }

  return context;
}

/**
 * Optional hook that returns null if outside provider.
 */
export function useXAPIContextOptional(): XAPIContextValue | null {
  return useContext(XAPIContext);
}
