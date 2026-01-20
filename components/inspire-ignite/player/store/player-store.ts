import { create } from 'zustand';
import type { CognitiveLoadIndex } from '@/lib/inspire-ignite/cognitive-load';
import type { LearningEvent, MasteryScore } from '@/lib/inspire-ignite/mastery/types';

/**
 * Player session state
 */
export interface PlayerSession {
  sessionId: string;
  userId: string;
  courseId: string;
  startedAt: string;
  lastActivityAt: string;
  totalDuration: number; // seconds
  blocksCompleted: number;
  currentBlockIndex: number;
  isPaused: boolean;
}

/**
 * Block interaction state
 */
export interface BlockInteraction {
  blockId: string;
  blockType: string;
  startedAt: number; // timestamp
  completedAt?: number;
  attempts: number;
  responses: unknown[];
  isCorrect?: boolean;
  score?: number;
}

/**
 * Break suggestion state
 */
export interface BreakSuggestion {
  shouldBreak: boolean;
  reason?: string;
  suggestedDuration: number; // minutes
  dismissedAt?: number;
}

/**
 * Player store state
 */
export interface PlayerState {
  // Session
  session: PlayerSession | null;
  isInitialized: boolean;

  // Current block
  currentBlock: BlockInteraction | null;
  blockHistory: BlockInteraction[];

  // Cognitive monitoring
  cognitiveLoad: CognitiveLoadIndex | null;
  fatigueLevel: number;
  breakSuggestion: BreakSuggestion | null;

  // Mastery tracking
  masteryScores: Map<string, MasteryScore>;
  learningEvents: LearningEvent[];

  // Performance metrics
  accuracyHistory: number[];
  responseTimeHistory: number[];

  // Actions
  initSession: (params: { userId: string; courseId: string; sessionId?: string }) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;

  startBlock: (blockId: string, blockType: string) => void;
  completeBlock: (result: { isCorrect?: boolean; score?: number; response?: unknown }) => void;
  recordAttempt: (response: unknown) => void;

  updateCognitiveLoad: (load: CognitiveLoadIndex) => void;
  updateFatigueLevel: (level: number) => void;
  suggestBreak: (reason: string, duration: number) => void;
  dismissBreak: () => void;

  updateMasteryScore: (skillId: string, score: MasteryScore) => void;
  addLearningEvent: (event: LearningEvent) => void;

  reset: () => void;
}

const initialState = {
  session: null,
  isInitialized: false,
  currentBlock: null,
  blockHistory: [],
  cognitiveLoad: null,
  fatigueLevel: 0,
  breakSuggestion: null,
  masteryScores: new Map(),
  learningEvents: [],
  accuracyHistory: [],
  responseTimeHistory: [],
};

/**
 * Zustand store for player state
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,

  initSession: ({ userId, courseId, sessionId }): void => {
    const newSessionId = sessionId ?? crypto.randomUUID();
    const now = new Date().toISOString();

    set({
      session: {
        sessionId: newSessionId,
        userId,
        courseId,
        startedAt: now,
        lastActivityAt: now,
        totalDuration: 0,
        blocksCompleted: 0,
        currentBlockIndex: 0,
        isPaused: false,
      },
      isInitialized: true,
    });
  },

  endSession: (): void => {
    const { session, currentBlock, blockHistory } = get();
    if (!session) return;

    // Complete current block if still active
    if (currentBlock && !currentBlock.completedAt) {
      set({
        blockHistory: [...blockHistory, { ...currentBlock, completedAt: Date.now() }],
        currentBlock: null,
      });
    }

    set({
      session: { ...session, isPaused: true },
    });
  },

  pauseSession: (): void => {
    const { session } = get();
    if (!session) return;

    set({
      session: { ...session, isPaused: true },
    });
  },

  resumeSession: (): void => {
    const { session } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        isPaused: false,
        lastActivityAt: new Date().toISOString(),
      },
    });
  },

  startBlock: (blockId, blockType): void => {
    const { session, currentBlock, blockHistory } = get();
    if (!session) return;

    // Save previous block to history if exists
    if (currentBlock) {
      set({
        blockHistory: [
          ...blockHistory,
          { ...currentBlock, completedAt: currentBlock.completedAt ?? Date.now() },
        ],
      });
    }

    set({
      currentBlock: {
        blockId,
        blockType,
        startedAt: Date.now(),
        attempts: 0,
        responses: [],
      },
      session: {
        ...session,
        lastActivityAt: new Date().toISOString(),
        currentBlockIndex: session.currentBlockIndex + 1,
      },
    });
  },

  completeBlock: ({ isCorrect, score, response }): void => {
    const { session, currentBlock, blockHistory, accuracyHistory, responseTimeHistory } = get();
    if (!session || !currentBlock) return;

    const completedAt = Date.now();
    const duration = (completedAt - currentBlock.startedAt) / 1000;

    const completedBlock: BlockInteraction = {
      ...currentBlock,
      completedAt,
      isCorrect,
      score,
      responses:
        response !== undefined ? [...currentBlock.responses, response] : currentBlock.responses,
    };

    // Update accuracy history if this was a scored block
    const newAccuracyHistory =
      isCorrect !== undefined ? [...accuracyHistory, isCorrect ? 1 : 0] : accuracyHistory;

    // Update response time history
    const newResponseTimeHistory = [...responseTimeHistory, duration];

    set({
      currentBlock: null,
      blockHistory: [...blockHistory, completedBlock],
      session: {
        ...session,
        blocksCompleted: session.blocksCompleted + 1,
        totalDuration: session.totalDuration + duration,
        lastActivityAt: new Date().toISOString(),
      },
      accuracyHistory: newAccuracyHistory.slice(-20), // Keep last 20
      responseTimeHistory: newResponseTimeHistory.slice(-20),
    });
  },

  recordAttempt: (response): void => {
    const { currentBlock } = get();
    if (!currentBlock) return;

    set({
      currentBlock: {
        ...currentBlock,
        attempts: currentBlock.attempts + 1,
        responses: [...currentBlock.responses, response],
      },
    });
  },

  updateCognitiveLoad: (load): void => {
    set({ cognitiveLoad: load });
  },

  updateFatigueLevel: (level): void => {
    set({ fatigueLevel: level });
  },

  suggestBreak: (reason, duration): void => {
    set({
      breakSuggestion: {
        shouldBreak: true,
        reason,
        suggestedDuration: duration,
      },
    });
  },

  dismissBreak: (): void => {
    const { breakSuggestion } = get();
    if (!breakSuggestion) return;

    set({
      breakSuggestion: {
        ...breakSuggestion,
        shouldBreak: false,
        dismissedAt: Date.now(),
      },
    });
  },

  updateMasteryScore: (skillId, score): void => {
    const { masteryScores } = get();
    const newScores = new Map(masteryScores);
    newScores.set(skillId, score);
    set({ masteryScores: newScores });
  },

  addLearningEvent: (event): void => {
    const { learningEvents } = get();
    set({
      learningEvents: [...learningEvents, event].slice(-100), // Keep last 100
    });
  },

  reset: (): void => {
    set(initialState);
  },
}));
