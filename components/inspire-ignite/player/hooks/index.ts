'use client';

// TODO(LXD-301): Replace with Firestore client type
// This interface defines the expected shape for database operations
interface LRSClientDatabase {
  from(table: string): {
    insert(data: Record<string, unknown> | Array<Record<string, unknown>>): Promise<{
      error: { message: string } | null;
    }>;
  };
}

type DatabaseClient = LRSClientDatabase;

import { useCallback, useEffect, useRef } from 'react';
import { createLRSClient } from '@/lib/inspire-ignite/client';
import type { MasteryScore } from '@/lib/inspire-ignite/mastery/types';
import {
  type CognitiveLoadIndex,
  type CognitiveMonitor,
  createMonitor,
  type MonitorConfig,
} from '../monitor';
import {
  type BlockInteraction,
  type BreakSuggestion,
  type PlayerSession,
  usePlayerStore,
} from '../store/player-store';
import { createTracker, type InspireTracker } from '../tracker';

export interface UseInspirePlayerConfig {
  db: DatabaseClient;
  userId: string;
  userEmail?: string;
  userName?: string;
  courseId: string;
  courseName: string;
  webhookUrl?: string;
  monitorConfig?: MonitorConfig;
}

/**
 * Main hook for the INSPIRE Player
 * Provides tracking, monitoring, and state management
 */
export function useInspirePlayer(config: UseInspirePlayerConfig): {
  session: PlayerSession | null;
  isInitialized: boolean;
  currentBlock: BlockInteraction | null;
  cognitiveLoad: CognitiveLoadIndex | null;
  fatigueLevel: number;
  breakSuggestion: BreakSuggestion | null;
  masteryScores: Map<string, MasteryScore>;
  start: () => Promise<void>;
  end: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  reset: () => void;
  trackBlockStart: (blockId: string, blockName: string, blockType: string) => Promise<void>;
  trackBlockComplete: (params: {
    blockId: string;
    blockName: string;
    isCorrect?: boolean;
    score?: number;
    response?: unknown;
  }) => Promise<void>;
  trackAssessmentAnswer: (params: {
    blockId: string;
    blockName: string;
    interactionType:
      | 'choice'
      | 'fill-in'
      | 'matching'
      | 'true-false'
      | 'sequencing'
      | 'likert'
      | 'long-fill-in';
    response: string;
    success: boolean;
    correctPattern?: string[];
    choices?: Array<{ id: string; description: string }>;
    numberOfChanges?: number;
    distractorType?: string;
  }) => Promise<void>;
  trackInteraction: (params: {
    blockId: string;
    blockName: string;
    interactionType: string;
    detail?: string;
  }) => Promise<void>;
  trackMedia: (params: {
    blockId: string;
    blockName: string;
    mediaType: 'video' | 'audio';
    event: 'played' | 'paused' | 'completed';
    currentTime?: number;
    duration?: number;
  }) => Promise<void>;
  trackProgress: (percent: number) => Promise<void>;
  handleBreakAccepted: () => Promise<void>;
  handleBreakDismissed: () => Promise<void>;
} {
  const trackerRef = useRef<InspireTracker | null>(null);
  const monitorRef = useRef<CognitiveMonitor | null>(null);

  const {
    session,
    isInitialized,
    currentBlock,
    cognitiveLoad,
    fatigueLevel,
    breakSuggestion,
    masteryScores,
    initSession,
    endSession,
    pauseSession,
    resumeSession,
    startBlock,
    completeBlock,
    recordAttempt,
    updateCognitiveLoad,
    updateFatigueLevel,
    suggestBreak,
    dismissBreak,
    reset,
  } = usePlayerStore();

  // Initialize tracker and monitor
  useEffect(() => {
    const lrsClient = createLRSClient({
      db: config.db,
      webhookUrl: config.webhookUrl,
      defaultActor: {
        objectType: 'Agent',
        name: config.userName,
        account: {
          homePage: 'https://lxp360.com',
          name: config.userId,
        },
        mbox: config.userEmail ? `mailto:${config.userEmail}` : undefined,
      },
    });

    trackerRef.current = createTracker({
      lrsClient,
      userId: config.userId,
      userEmail: config.userEmail,
      userName: config.userName,
      courseId: config.courseId,
      courseName: config.courseName,
    });

    monitorRef.current = createMonitor({
      ...config.monitorConfig,
      onCognitiveLoadUpdate: (load) => {
        updateCognitiveLoad(load);
        trackerRef.current?.trackCognitiveLoad(load);
      },
      onBreakSuggested: ({ fatigueLevel, message }) => {
        updateFatigueLevel(fatigueLevel);
        suggestBreak(message, fatigueLevel > 80 ? 15 : 5);
      },
    });

    return (): void => {
      monitorRef.current?.destroy();
      trackerRef.current = null;
    };
  }, [
    config.db,
    config.userId,
    config.courseId,
    config.courseName,
    config.userEmail,
    config.userName,
    config.webhookUrl,
    config.monitorConfig,
    updateCognitiveLoad,
    updateFatigueLevel,
    suggestBreak,
  ]);

  // Start session
  const start = useCallback(async () => {
    initSession({
      userId: config.userId,
      courseId: config.courseId,
    });
    monitorRef.current?.start();
    await trackerRef.current?.trackSessionStart();
  }, [config.userId, config.courseId, initSession]);

  // End session
  const end = useCallback(async () => {
    monitorRef.current?.stop();
    endSession();
    await trackerRef.current?.trackSessionEnd();
  }, [endSession]);

  // Pause/Resume
  const pause = useCallback(async () => {
    monitorRef.current?.stop();
    pauseSession();
    await trackerRef.current?.trackSessionEnd();
  }, [pauseSession]);

  const resume = useCallback(async () => {
    monitorRef.current?.start();
    resumeSession();
    await trackerRef.current?.trackSessionStart();
  }, [resumeSession]);

  // Block tracking
  const trackBlockStart = useCallback(
    async (blockId: string, blockName: string, blockType: string) => {
      startBlock(blockId, blockType);
      await trackerRef.current?.trackBlockStart(blockId, blockName, blockType);
    },
    [startBlock],
  );

  const trackBlockComplete = useCallback(
    async (params: {
      blockId: string;
      blockName: string;
      isCorrect?: boolean;
      score?: number;
      response?: unknown;
    }) => {
      const blockStartTime = currentBlock?.startedAt ?? Date.now();
      const durationSeconds = (Date.now() - blockStartTime) / 1000;

      completeBlock({
        isCorrect: params.isCorrect,
        score: params.score,
        response: params.response,
      });

      // Record for monitoring
      monitorRef.current?.recordEvent({
        accuracy: params.isCorrect !== undefined ? (params.isCorrect ? 1 : 0) : undefined,
        responseTimeSeconds: durationSeconds,
      });

      await trackerRef.current?.trackBlockCompletion({
        blockId: params.blockId,
        blockName: params.blockName,
        durationSeconds,
        score: params.score,
        success: params.isCorrect,
      });
    },
    [currentBlock, completeBlock],
  );

  // Assessment tracking
  const trackAssessmentAnswer = useCallback(
    async (params: {
      blockId: string;
      blockName: string;
      interactionType:
        | 'choice'
        | 'fill-in'
        | 'matching'
        | 'true-false'
        | 'sequencing'
        | 'likert'
        | 'long-fill-in';
      response: string;
      success: boolean;
      correctPattern?: string[];
      choices?: Array<{ id: string; description: string }>;
      numberOfChanges?: number;
      distractorType?: string;
    }) => {
      const blockStartTime = currentBlock?.startedAt ?? Date.now();
      const durationSeconds = (Date.now() - blockStartTime) / 1000;
      const attemptNumber = (currentBlock?.attempts ?? 0) + 1;

      recordAttempt(params.response);

      // Record for monitoring
      monitorRef.current?.recordEvent({
        accuracy: params.success ? 1 : 0,
        responseTimeSeconds: durationSeconds,
      });

      await trackerRef.current?.trackAssessmentAnswer({
        ...params,
        durationSeconds,
        attemptNumber,
        confidenceInterval: durationSeconds < 2 ? 0.3 : durationSeconds > 60 ? 0.5 : 0.8,
      });
    },
    [currentBlock, recordAttempt],
  );

  // Interaction tracking
  const trackInteraction = useCallback(
    async (params: {
      blockId: string;
      blockName: string;
      interactionType: string;
      detail?: string;
    }) => {
      await trackerRef.current?.trackInteraction(params);
    },
    [],
  );

  // Media tracking
  const trackMedia = useCallback(
    async (params: {
      blockId: string;
      blockName: string;
      mediaType: 'video' | 'audio';
      event: 'played' | 'paused' | 'completed';
      currentTime?: number;
      duration?: number;
    }) => {
      await trackerRef.current?.trackMediaPlayback(params);
    },
    [],
  );

  // Progress tracking
  const trackProgress = useCallback(async (percent: number) => {
    await trackerRef.current?.trackProgress(percent);
  }, []);

  // Break handling
  const handleBreakAccepted = useCallback(async () => {
    await trackerRef.current?.trackBreakSuggestion({
      fatigueLevel,
      accepted: true,
      suggestedDuration: breakSuggestion?.suggestedDuration ?? 5,
    });
    monitorRef.current?.resetSession();
    dismissBreak();
  }, [fatigueLevel, breakSuggestion, dismissBreak]);

  const handleBreakDismissed = useCallback(async () => {
    await trackerRef.current?.trackBreakSuggestion({
      fatigueLevel,
      accepted: false,
      suggestedDuration: breakSuggestion?.suggestedDuration ?? 5,
    });
    dismissBreak();
  }, [fatigueLevel, breakSuggestion, dismissBreak]);

  return {
    // State
    session,
    isInitialized,
    currentBlock,
    cognitiveLoad,
    fatigueLevel,
    breakSuggestion,
    masteryScores,

    // Session controls
    start,
    end,
    pause,
    resume,
    reset,

    // Block tracking
    trackBlockStart,
    trackBlockComplete,
    trackAssessmentAnswer,
    trackInteraction,
    trackMedia,
    trackProgress,

    // Break handling
    handleBreakAccepted,
    handleBreakDismissed,
  };
}

/**
 * Hook for just the cognitive monitoring features
 */
export function useCognitiveMonitor(config?: MonitorConfig): {
  cognitiveLoad: CognitiveLoadIndex | null;
  fatigueLevel: number;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  recordEvent: (params: {
    accuracy?: number;
    responseTimeSeconds?: number;
    intrinsicLoad?: number;
    extraneousLoad?: number;
    germaneLoad?: number;
  }) => void;
} {
  const monitorRef = useRef<CognitiveMonitor | null>(null);
  const { cognitiveLoad, fatigueLevel, updateCognitiveLoad, updateFatigueLevel, suggestBreak } =
    usePlayerStore();

  useEffect(() => {
    monitorRef.current = createMonitor({
      ...config,
      onCognitiveLoadUpdate: updateCognitiveLoad,
      onBreakSuggested: ({ fatigueLevel, message }) => {
        updateFatigueLevel(fatigueLevel);
        suggestBreak(message, fatigueLevel > 80 ? 15 : 5);
      },
    });

    return (): void => {
      monitorRef.current?.destroy();
    };
  }, [config, updateCognitiveLoad, updateFatigueLevel, suggestBreak]);

  const startMonitoring = useCallback(() => {
    monitorRef.current?.start();
  }, []);

  const stopMonitoring = useCallback(() => {
    monitorRef.current?.stop();
  }, []);

  const recordEvent = useCallback(
    (params: {
      accuracy?: number;
      responseTimeSeconds?: number;
      intrinsicLoad?: number;
      extraneousLoad?: number;
      germaneLoad?: number;
    }) => {
      monitorRef.current?.recordEvent(params);
    },
    [],
  );

  return {
    cognitiveLoad,
    fatigueLevel,
    startMonitoring,
    stopMonitoring,
    recordEvent,
  };
}

/**
 * Hook for break suggestion UI
 */
export function useBreakSuggestion(): {
  shouldShowBreak: boolean;
  breakReason: string | undefined;
  suggestedDuration: number;
  fatigueLevel: number;
  dismissBreak: () => void;
} {
  const { breakSuggestion, dismissBreak, fatigueLevel } = usePlayerStore();

  return {
    shouldShowBreak: breakSuggestion?.shouldBreak ?? false,
    breakReason: breakSuggestion?.reason,
    suggestedDuration: breakSuggestion?.suggestedDuration ?? 5,
    fatigueLevel,
    dismissBreak,
  };
}
