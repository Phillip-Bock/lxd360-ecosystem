/**
 * useQuestionBank - Phase 11
 * Hook for managing question banks, pools, and draws
 */

'use client';

import { useCallback, useState } from 'react';
import { createEmptyMastery, drawQuestions, updateMastery } from '@/lib/studio/question-randomizer';
import type {
  BankCategory,
  DrawResult,
  LearnerMastery,
  PoolResults,
  Question,
  QuestionBank,
  QuestionPool,
  QuestionResponse,
  QuestionStats,
  QuestionType,
} from '@/types/studio/question-bank';

// =============================================================================
// TYPES
// =============================================================================

interface UseQuestionBankOptions {
  /** Initial banks */
  initialBanks?: QuestionBank[];
  /** Initial pools */
  initialPools?: QuestionPool[];
  /** Learner ID for mastery tracking */
  learnerId?: string;
  /** Callback when banks change */
  onBanksChange?: (banks: QuestionBank[]) => void;
  /** Callback when pools change */
  onPoolsChange?: (pools: QuestionPool[]) => void;
}

interface UseQuestionBankReturn {
  // Banks
  banks: QuestionBank[];
  createBank: (bank: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBank: (bankId: string, updates: Partial<QuestionBank>) => void;
  deleteBank: (bankId: string) => void;
  duplicateBank: (bankId: string) => string;
  getBankById: (bankId: string) => QuestionBank | undefined;

  // Questions
  addQuestion: (bankId: string, question: Omit<Question, 'id'>) => string;
  updateQuestion: (bankId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (bankId: string, questionId: string) => void;
  duplicateQuestion: (bankId: string, questionId: string) => string;
  moveQuestion: (fromBankId: string, toBankId: string, questionId: string) => void;
  getQuestionById: (bankId: string, questionId: string) => Question | undefined;

  // Categories
  addCategory: (bankId: string, category: Omit<BankCategory, 'id'>) => string;
  updateCategory: (bankId: string, categoryId: string, updates: Partial<BankCategory>) => void;
  deleteCategory: (bankId: string, categoryId: string) => void;
  assignQuestionToCategory: (bankId: string, questionId: string, categoryId: string) => void;

  // Pools
  pools: QuestionPool[];
  createPool: (pool: Omit<QuestionPool, 'id'>) => string;
  updatePool: (poolId: string, updates: Partial<QuestionPool>) => void;
  deletePool: (poolId: string) => void;
  getPoolById: (poolId: string) => QuestionPool | undefined;

  // Drawing
  drawFromPool: (poolId: string, options?: DrawOptions) => DrawResult | null;
  currentDraw: DrawResult | null;
  clearDraw: () => void;

  // Responses
  submitResponse: (questionId: string, response: unknown) => QuestionResponse;
  responses: QuestionResponse[];
  getResults: () => PoolResults | null;
  clearResponses: () => void;

  // Mastery
  mastery: LearnerMastery | null;
  getMasteryForTag: (tag: string) => number;
  getMasteryForType: (type: QuestionType) => number;

  // Stats
  getQuestionStats: (bankId: string, questionId: string) => QuestionStats | null;
  getBankStats: (bankId: string) => {
    totalQuestions: number;
    byType: Record<string, number>;
    byDifficulty: Record<number, number>;
    tags: string[];
  } | null;

  // Utility
  generateId: () => string;
  validatePool: (poolId: string) => string[];
}

interface DrawOptions {
  seed?: number;
}

// =============================================================================
// HOOK
// =============================================================================

export function useQuestionBank(options: UseQuestionBankOptions = {}): UseQuestionBankReturn {
  const { initialBanks = [], initialPools = [], learnerId, onBanksChange, onPoolsChange } = options;

  // State
  const [banks, setBanks] = useState<QuestionBank[]>(initialBanks);
  const [pools, setPools] = useState<QuestionPool[]>(initialPools);
  const [currentDraw, setCurrentDraw] = useState<DrawResult | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [mastery, setMastery] = useState<LearnerMastery | null>(
    learnerId ? createEmptyMastery(learnerId) : null,
  );
  const [startTime, setStartTime] = useState<string | null>(null);

  // ID generator
  const generateId = useCallback(() => {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ==========================================================================
  // BANK OPERATIONS
  // ==========================================================================

  const createBank = useCallback(
    (bank: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = generateId();
      const now = new Date().toISOString();
      const newBank: QuestionBank = {
        ...bank,
        id,
        createdAt: now,
        updatedAt: now,
      };
      setBanks((prev) => {
        const next = [...prev, newBank];
        onBanksChange?.(next);
        return next;
      });
      return id;
    },
    [generateId, onBanksChange],
  );

  const updateBank = useCallback(
    (bankId: string, updates: Partial<QuestionBank>) => {
      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b,
        );
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  const deleteBank = useCallback(
    (bankId: string) => {
      setBanks((prev) => {
        const next = prev.filter((b) => b.id !== bankId);
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  const duplicateBank = useCallback(
    (bankId: string) => {
      const bank = banks.find((b) => b.id === bankId);
      if (!bank) return '';

      const id = generateId();
      const now = new Date().toISOString();
      const duplicated: QuestionBank = {
        ...bank,
        id,
        name: `${bank.name} (Copy)`,
        questions: bank.questions.map((q) => ({ ...q, id: generateId() })),
        createdAt: now,
        updatedAt: now,
      };

      setBanks((prev) => {
        const next = [...prev, duplicated];
        onBanksChange?.(next);
        return next;
      });
      return id;
    },
    [banks, generateId, onBanksChange],
  );

  const getBankById = useCallback((bankId: string) => banks.find((b) => b.id === bankId), [banks]);

  // ==========================================================================
  // QUESTION OPERATIONS
  // ==========================================================================

  const addQuestion = useCallback(
    (bankId: string, question: Omit<Question, 'id'>) => {
      const id = generateId();
      const now = new Date().toISOString();
      const newQuestion = {
        ...question,
        id,
        createdAt: now,
        updatedAt: now,
      } as Question;

      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                questions: [...b.questions, newQuestion],
                updatedAt: now,
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
      return id;
    },
    [generateId, onBanksChange],
  );

  const updateQuestion = useCallback(
    (bankId: string, questionId: string, updates: Partial<Question>) => {
      const now = new Date().toISOString();
      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                questions: b.questions.map((q) =>
                  q.id === questionId ? ({ ...q, ...updates, updatedAt: now } as Question) : q,
                ),
                updatedAt: now,
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  const deleteQuestion = useCallback(
    (bankId: string, questionId: string) => {
      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                questions: b.questions.filter((q) => q.id !== questionId),
                updatedAt: new Date().toISOString(),
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  const duplicateQuestion = useCallback(
    (bankId: string, questionId: string) => {
      const bank = banks.find((b) => b.id === bankId);
      const question = bank?.questions.find((q) => q.id === questionId);
      if (!question) return '';

      const id = generateId();
      const now = new Date().toISOString();
      const duplicated = {
        ...question,
        id,
        text: `${question.text} (Copy)`,
        createdAt: now,
        updatedAt: now,
      } as Question;

      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                questions: [...b.questions, duplicated],
                updatedAt: now,
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
      return id;
    },
    [banks, generateId, onBanksChange],
  );

  const moveQuestion = useCallback(
    (fromBankId: string, toBankId: string, questionId: string) => {
      const fromBank = banks.find((b) => b.id === fromBankId);
      const question = fromBank?.questions.find((q) => q.id === questionId);
      if (!question) return;

      const now = new Date().toISOString();
      setBanks((prev) => {
        const next = prev.map((b) => {
          if (b.id === fromBankId) {
            return {
              ...b,
              questions: b.questions.filter((q) => q.id !== questionId),
              updatedAt: now,
            };
          }
          if (b.id === toBankId) {
            return {
              ...b,
              questions: [...b.questions, question],
              updatedAt: now,
            };
          }
          return b;
        });
        onBanksChange?.(next);
        return next;
      });
    },
    [banks, onBanksChange],
  );

  const getQuestionById = useCallback(
    (bankId: string, questionId: string) => {
      const bank = banks.find((b) => b.id === bankId);
      return bank?.questions.find((q) => q.id === questionId);
    },
    [banks],
  );

  // ==========================================================================
  // CATEGORY OPERATIONS
  // ==========================================================================

  const addCategory = useCallback(
    (bankId: string, category: Omit<BankCategory, 'id'>) => {
      const id = generateId();
      const newCategory: BankCategory = { ...category, id };

      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                categories: [...(b.categories || []), newCategory],
                updatedAt: new Date().toISOString(),
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
      return id;
    },
    [generateId, onBanksChange],
  );

  const updateCategory = useCallback(
    (bankId: string, categoryId: string, updates: Partial<BankCategory>) => {
      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                categories: b.categories?.map((c) =>
                  c.id === categoryId ? { ...c, ...updates } : c,
                ),
                updatedAt: new Date().toISOString(),
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  const deleteCategory = useCallback(
    (bankId: string, categoryId: string) => {
      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                categories: b.categories?.filter((c) => c.id !== categoryId),
                updatedAt: new Date().toISOString(),
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  const assignQuestionToCategory = useCallback(
    (bankId: string, questionId: string, categoryId: string) => {
      setBanks((prev) => {
        const next = prev.map((b) =>
          b.id === bankId
            ? {
                ...b,
                categories: b.categories?.map((c) => {
                  if (c.id === categoryId && !c.questionIds.includes(questionId)) {
                    return { ...c, questionIds: [...c.questionIds, questionId] };
                  }
                  if (c.id !== categoryId && c.questionIds.includes(questionId)) {
                    return { ...c, questionIds: c.questionIds.filter((id) => id !== questionId) };
                  }
                  return c;
                }),
                updatedAt: new Date().toISOString(),
              }
            : b,
        );
        onBanksChange?.(next);
        return next;
      });
    },
    [onBanksChange],
  );

  // ==========================================================================
  // POOL OPERATIONS
  // ==========================================================================

  const createPool = useCallback(
    (pool: Omit<QuestionPool, 'id'>) => {
      const id = generateId();
      const newPool: QuestionPool = { ...pool, id };
      setPools((prev) => {
        const next = [...prev, newPool];
        onPoolsChange?.(next);
        return next;
      });
      return id;
    },
    [generateId, onPoolsChange],
  );

  const updatePool = useCallback(
    (poolId: string, updates: Partial<QuestionPool>) => {
      setPools((prev) => {
        const next = prev.map((p) => (p.id === poolId ? { ...p, ...updates } : p));
        onPoolsChange?.(next);
        return next;
      });
    },
    [onPoolsChange],
  );

  const deletePool = useCallback(
    (poolId: string) => {
      setPools((prev) => {
        const next = prev.filter((p) => p.id !== poolId);
        onPoolsChange?.(next);
        return next;
      });
    },
    [onPoolsChange],
  );

  const getPoolById = useCallback((poolId: string) => pools.find((p) => p.id === poolId), [pools]);

  // ==========================================================================
  // DRAWING
  // ==========================================================================

  const drawFromPool = useCallback(
    (poolId: string, drawOptions?: DrawOptions) => {
      const pool = pools.find((p) => p.id === poolId);
      if (!pool) return null;

      const banksMap = new Map(banks.map((b) => [b.id, b]));

      const result = drawQuestions({
        banks: banksMap,
        pool,
        mastery: mastery || undefined,
        overrideSeed: drawOptions?.seed,
        learnerId,
      });

      setCurrentDraw(result);
      setResponses([]);
      setStartTime(new Date().toISOString());
      return result;
    },
    [pools, banks, mastery, learnerId],
  );

  const clearDraw = useCallback(() => {
    setCurrentDraw(null);
    setResponses([]);
    setStartTime(null);
  }, []);

  // ==========================================================================
  // RESPONSES
  // ==========================================================================

  const submitResponse = useCallback(
    (questionId: string, response: unknown): QuestionResponse => {
      const question = currentDraw?.questions.find((q) => q.id === questionId);
      if (!question) {
        throw new Error(`Question ${questionId} not found in current draw`);
      }

      // Calculate correctness based on question type
      const { isCorrect, score } = evaluateResponse(question, response);

      const existingResponses = responses.filter((r) => r.questionId === questionId);
      const attemptNumber = existingResponses.length + 1;

      const questionResponse: QuestionResponse = {
        questionId,
        response,
        isCorrect,
        score,
        pointsEarned: isCorrect ? (question.points || 1) * (score || 1) : 0,
        duration: startTime ? Date.now() - new Date(startTime).getTime() : 0,
        attemptNumber,
        timestamp: new Date().toISOString(),
      };

      setResponses((prev) => [...prev, questionResponse]);

      // Update mastery if we have a learner
      if (mastery && learnerId) {
        setMastery(updateMastery(mastery, question, isCorrect || false));
      }

      return questionResponse;
    },
    [currentDraw, responses, startTime, mastery, learnerId],
  );

  const getResults = useCallback((): PoolResults | null => {
    if (!currentDraw || responses.length === 0) return null;

    const pool = pools.find((p) =>
      p.sources.some((s) =>
        currentDraw.questions.some((q) => currentDraw.sourceMap[q.id]?.bankId === s.bankId),
      ),
    );
    if (!pool) return null;

    const latestResponses = new Map<string, QuestionResponse>();
    for (const r of responses) {
      latestResponses.set(r.questionId, r);
    }

    const finalResponses = Array.from(latestResponses.values());
    const totalScore = finalResponses.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);
    const maxScore = currentDraw.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = pool.scoring.passingScore ? percentage >= pool.scoring.passingScore : true;

    return {
      poolId: pool.id,
      learnerId: learnerId || 'anonymous',
      drawnQuestionIds: currentDraw.questions.map((q) => q.id),
      responses: finalResponses,
      totalScore,
      maxScore,
      percentage,
      passed,
      totalDuration: startTime ? Date.now() - new Date(startTime).getTime() : 0,
      startedAt: startTime || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attemptNumber: 1, // TODO(LXD-403): Track attempts per pool
    };
  }, [currentDraw, responses, pools, learnerId, startTime]);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  // ==========================================================================
  // MASTERY
  // ==========================================================================

  const getMasteryForTag = useCallback(
    (tag: string) => {
      if (!mastery) return 0;
      return mastery.tagMastery[tag]?.score || 0;
    },
    [mastery],
  );

  const getMasteryForType = useCallback(
    (type: QuestionType) => {
      if (!mastery) return 0;
      return mastery.typeMastery[type]?.score || 0;
    },
    [mastery],
  );

  // ==========================================================================
  // STATS
  // ==========================================================================

  const getQuestionStats = useCallback(
    (_bankId: string, _questionId: string): QuestionStats | null => {
      // TODO(LXD-403): Implement actual stats tracking
      return null;
    },
    [],
  );

  const getBankStats = useCallback(
    (bankId: string) => {
      const bank = banks.find((b) => b.id === bankId);
      if (!bank) return null;

      const byType: Record<string, number> = {};
      const byDifficulty: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const tagsSet = new Set<string>();

      for (const q of bank.questions) {
        byType[q.type] = (byType[q.type] || 0) + 1;
        if (q.difficulty) {
          byDifficulty[q.difficulty]++;
        }
        q.tags?.forEach((t) => {
          tagsSet.add(t);
        });
      }

      return {
        totalQuestions: bank.questions.length,
        byType,
        byDifficulty,
        tags: Array.from(tagsSet),
      };
    },
    [banks],
  );

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validatePool = useCallback(
    (poolId: string): string[] => {
      const pool = pools.find((p) => p.id === poolId);
      if (!pool) return ['Pool not found'];

      const issues: string[] = [];

      if (pool.sources.length === 0) {
        issues.push('Pool has no question sources');
      }

      let totalAvailable = 0;
      for (const source of pool.sources) {
        const bank = banks.find((b) => b.id === source.bankId);
        if (!bank) {
          issues.push(`Source bank not found: ${source.bankId}`);
        } else {
          totalAvailable += bank.questions.length;
        }
      }

      if (pool.drawCount > totalAvailable) {
        issues.push(
          `Draw count (${pool.drawCount}) exceeds available questions (${totalAvailable})`,
        );
      }

      if (pool.drawCount <= 0) {
        issues.push('Draw count must be greater than 0');
      }

      return issues;
    },
    [pools, banks],
  );

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    banks,
    createBank,
    updateBank,
    deleteBank,
    duplicateBank,
    getBankById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    getQuestionById,
    addCategory,
    updateCategory,
    deleteCategory,
    assignQuestionToCategory,
    pools,
    createPool,
    updatePool,
    deletePool,
    getPoolById,
    drawFromPool,
    currentDraw,
    clearDraw,
    submitResponse,
    responses,
    getResults,
    clearResponses,
    mastery,
    getMasteryForTag,
    getMasteryForType,
    getQuestionStats,
    getBankStats,
    generateId,
    validatePool,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Evaluate a response to determine correctness
 */
function evaluateResponse(
  question: Question,
  response: unknown,
): { isCorrect: boolean; score: number } {
  switch (question.type) {
    case 'multiple-choice': {
      const isCorrect = response === question.correctChoiceId;
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    case 'multiple-select': {
      const selected = response as string[];
      const correct = question.correctChoiceIds;
      if (question.scoringMode === 'all-or-nothing') {
        const isCorrect =
          selected.length === correct.length && selected.every((s) => correct.includes(s));
        return { isCorrect, score: isCorrect ? 1 : 0 };
      }
      // Partial credit
      const correctSelected = selected.filter((s) => correct.includes(s)).length;
      const incorrectSelected = selected.filter((s) => !correct.includes(s)).length;
      const score = Math.max(0, (correctSelected - incorrectSelected) / correct.length);
      return { isCorrect: score === 1, score };
    }

    case 'true-false': {
      const isCorrect = response === question.correctAnswer;
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    case 'fill-in-blank': {
      const answers = response as Record<string, string>;
      let correct = 0;
      for (const blank of question.blanks) {
        const answer = answers[blank.id]?.trim();
        const accepted = blank.acceptedAnswers.map((a) =>
          question.caseSensitive ? a : a.toLowerCase(),
        );
        const compareAnswer = question.caseSensitive ? answer : answer?.toLowerCase();
        if (accepted.includes(compareAnswer || '')) {
          correct++;
        }
      }
      const score = correct / question.blanks.length;
      return { isCorrect: score === 1, score };
    }

    case 'short-answer': {
      const answer = (response as string)?.trim();
      const accepted = question.acceptedAnswers.map((a) =>
        question.caseSensitive ? a : a.toLowerCase(),
      );
      const compareAnswer = question.caseSensitive ? answer : answer?.toLowerCase();
      const isCorrect = accepted.includes(compareAnswer || '');
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    case 'matching': {
      const pairs = response as Record<string, string>;
      let correct = 0;
      for (const [left, right] of Object.entries(question.correctPairs)) {
        if (pairs[left] === right) {
          correct++;
        }
      }
      const total = Object.keys(question.correctPairs).length;
      const score = total > 0 ? correct / total : 0;
      return { isCorrect: score === 1, score };
    }

    case 'ordering': {
      const order = response as string[];
      if (question.scoringMode === 'exact') {
        const isCorrect =
          order.length === question.correctOrder.length &&
          order.every((id, i) => id === question.correctOrder[i]);
        return { isCorrect, score: isCorrect ? 1 : 0 };
      }
      // Partial credit for adjacent pairs
      let correctPairs = 0;
      for (let i = 0; i < order.length - 1; i++) {
        const currentIdx = question.correctOrder.indexOf(order[i]);
        const nextIdx = question.correctOrder.indexOf(order[i + 1]);
        if (nextIdx === currentIdx + 1) {
          correctPairs++;
        }
      }
      const totalPairs = question.correctOrder.length - 1;
      const score = totalPairs > 0 ? correctPairs / totalPairs : 0;
      return { isCorrect: score === 1, score };
    }

    case 'hotspot': {
      const selected = response as string[];
      const correct = question.correctHotspotIds;
      if (!question.multiSelect) {
        const isCorrect = selected.length === 1 && correct.includes(selected[0]);
        return { isCorrect, score: isCorrect ? 1 : 0 };
      }
      const correctSelected = selected.filter((s) => correct.includes(s)).length;
      const score = correct.length > 0 ? correctSelected / correct.length : 0;
      return { isCorrect: score === 1, score };
    }

    case 'slider': {
      if (question.isSurvey || question.correctValue === undefined) {
        return { isCorrect: true, score: 1 };
      }
      const value = response as number;
      const tolerance = question.tolerance || 0;
      const isCorrect = Math.abs(value - question.correctValue) <= tolerance;
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    // Survey types (no correct answer)
    case 'likert':
    case 'ranking':
    case 'essay':
      return { isCorrect: true, score: 1 };

    default:
      return { isCorrect: false, score: 0 };
  }
}

export default useQuestionBank;
