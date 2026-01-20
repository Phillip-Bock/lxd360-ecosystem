/**
 * Question Randomizer - Phase 11
 * Handles random selection and ordering of questions from pools
 */

import type {
  DrawResult,
  LearnerMastery,
  PoolSource,
  Question,
  QuestionBank,
  QuestionPool,
  ReviewItem,
} from '@/types/studio/question-bank';

// =============================================================================
// SEEDED RANDOM NUMBER GENERATOR
// =============================================================================

/**
 * Mulberry32 - Fast, high-quality 32-bit PRNG
 * Produces deterministic sequence from seed for reproducible randomization
 */
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /** Generate random float [0, 1) */
  next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Generate random integer [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Fisher-Yates shuffle with seeded random */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /** Select n items from array */
  sample<T>(array: T[], n: number): T[] {
    if (n >= array.length) return this.shuffle(array);
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, n);
  }

  /** Weighted random selection */
  weightedSelect<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = this.next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }

    return items[items.length - 1];
  }
}

// =============================================================================
// QUESTION FILTER
// =============================================================================

/**
 * Filter questions based on pool source criteria
 */
function filterQuestions(questions: Question[], source: PoolSource): Question[] {
  return questions.filter((q) => {
    // Filter by category
    if (source.categoryIds && source.categoryIds.length > 0) {
      // Questions need categoryId in metadata for this to work
      const questionCategory = (q.metadata?.categoryId as string) || '';
      if (!source.categoryIds.includes(questionCategory)) {
        return false;
      }
    }

    // Filter by tags
    if (source.tags && source.tags.length > 0) {
      if (!q.tags || !source.tags.some((tag) => q.tags?.includes(tag))) {
        return false;
      }
    }

    // Filter by difficulty
    if (source.difficultyRange && q.difficulty) {
      if (q.difficulty < source.difficultyRange.min || q.difficulty > source.difficultyRange.max) {
        return false;
      }
    }

    // Filter by question type
    if (source.questionTypes && source.questionTypes.length > 0) {
      if (!source.questionTypes.includes(q.type)) {
        return false;
      }
    }

    return true;
  });
}

// =============================================================================
// SELECTION STRATEGIES
// =============================================================================

/**
 * Random selection - Pure random from available questions
 */
function selectRandom(questions: Question[], count: number, rng: SeededRandom): Question[] {
  return rng.sample(questions, count);
}

/**
 * Weighted random selection - Respects source weights
 */
function selectWeightedRandom(
  questionsBySource: Map<string, Question[]>,
  sourceWeights: Map<string, number>,
  count: number,
  rng: SeededRandom,
): Question[] {
  const selected: Question[] = [];
  const available = new Map<string, Question[]>();

  // Clone available questions per source
  for (const [sourceId, questions] of questionsBySource) {
    available.set(sourceId, [...questions]);
  }

  while (selected.length < count) {
    // Get sources that still have questions
    const activeSources: string[] = [];
    const activeWeights: number[] = [];

    for (const [sourceId, questions] of available) {
      if (questions.length > 0) {
        activeSources.push(sourceId);
        activeWeights.push(sourceWeights.get(sourceId) || 1);
      }
    }

    if (activeSources.length === 0) break;

    // Select source based on weight
    const selectedSource = rng.weightedSelect(activeSources, activeWeights);
    const sourceQuestions = available.get(selectedSource);

    if (sourceQuestions && sourceQuestions.length > 0) {
      // Pick random question from source
      const idx = rng.nextInt(0, sourceQuestions.length - 1);
      selected.push(sourceQuestions[idx]);
      sourceQuestions.splice(idx, 1);
    }
  }

  return selected;
}

/**
 * Sequential selection - Take questions in order
 */
function selectSequential(questions: Question[], count: number): Question[] {
  return questions.slice(0, count);
}

/**
 * Adaptive selection - Based on learner mastery
 */
function selectAdaptive(
  questions: Question[],
  count: number,
  mastery: LearnerMastery,
  rng: SeededRandom,
): Question[] {
  // Score each question based on learner needs
  const scored = questions.map((q) => {
    let score = 0.5; // Base score

    // Increase score for weak areas
    if (q.tags) {
      for (const tag of q.tags) {
        const tagMastery = mastery.tagMastery[tag];
        if (tagMastery) {
          // Lower mastery = higher priority
          score += (1 - tagMastery.score) * 0.3;
        } else {
          // Never attempted = high priority
          score += 0.4;
        }
      }
    }

    // Type mastery consideration
    const typeMastery = mastery.typeMastery[q.type];
    if (typeMastery) {
      score += (1 - typeMastery.score) * 0.2;
    }

    // Avoid recently asked questions
    if (mastery.recentQuestions.includes(q.id)) {
      score -= 0.5;
    }

    // Add small random factor
    score += rng.next() * 0.1;

    return { question: q, score };
  });

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.question);
}

/**
 * Spaced repetition selection - SM-2 algorithm inspired
 */
function selectSpacedRepetition(
  questions: Question[],
  count: number,
  mastery: LearnerMastery,
  rng: SeededRandom,
): Question[] {
  const now = new Date();
  const selected: Question[] = [];

  // First, prioritize items due for review
  const dueForReview = mastery.reviewQueue
    .filter((item) => new Date(item.nextReview) <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

  for (const reviewItem of dueForReview) {
    if (selected.length >= count) break;
    const question = questions.find((q) => q.id === reviewItem.questionId);
    if (question && !selected.includes(question)) {
      selected.push(question);
    }
  }

  // Fill remaining with adaptive selection
  if (selected.length < count) {
    const remaining = questions.filter((q) => !selected.includes(q));
    const additionalCount = count - selected.length;
    const additional = selectAdaptive(remaining, additionalCount, mastery, rng);
    selected.push(...additional);
  }

  return selected;
}

// =============================================================================
// MAIN DRAW FUNCTION
// =============================================================================

export interface DrawOptions {
  /** Banks to draw from (keyed by bank ID) */
  banks: Map<string, QuestionBank>;
  /** Pool configuration */
  pool: QuestionPool;
  /** Learner mastery data (for adaptive/spaced-repetition) */
  mastery?: LearnerMastery;
  /** Override seed (for testing or resuming) */
  overrideSeed?: number;
  /** Learner ID for per-learner seed locking */
  learnerId?: string;
}

/**
 * Draw questions from a pool based on configuration
 */
export function drawQuestions(options: DrawOptions): DrawResult {
  const { banks, pool, mastery, overrideSeed, learnerId } = options;

  // Generate or use seed
  let seed: number;
  if (overrideSeed !== undefined) {
    seed = overrideSeed;
  } else if (pool.randomization.seed !== undefined) {
    seed = pool.randomization.seed;
    // Modify seed per learner if locked
    if (pool.randomization.lockSeedPerLearner && learnerId) {
      seed = hashString(learnerId) ^ seed;
    }
  } else {
    seed = Date.now();
  }

  const rng = new SeededRandom(seed);

  // Collect questions from all sources
  const allQuestions: Question[] = [];
  const questionsBySource = new Map<string, Question[]>();
  const sourceWeights = new Map<string, number>();
  const sourceMap: Record<string, { bankId: string; categoryId?: string }> = {};

  for (const source of pool.sources) {
    const bank = banks.get(source.bankId);
    if (!bank) continue;

    const filtered = filterQuestions(bank.questions, source);
    const limited = source.maxFromSource ? filtered.slice(0, source.maxFromSource) : filtered;

    questionsBySource.set(source.bankId, limited);
    sourceWeights.set(source.bankId, source.weight || 1);
    allQuestions.push(...limited);

    // Track source for each question
    for (const q of limited) {
      sourceMap[q.id] = {
        bankId: source.bankId,
        categoryId: source.categoryIds?.[0],
      };
    }
  }

  // Select questions based on strategy
  let selected: Question[];

  switch (pool.selectionStrategy) {
    case 'random':
      selected = selectRandom(allQuestions, pool.drawCount, rng);
      break;

    case 'weighted-random':
      selected = selectWeightedRandom(questionsBySource, sourceWeights, pool.drawCount, rng);
      break;

    case 'sequential':
      selected = selectSequential(allQuestions, pool.drawCount);
      break;

    case 'adaptive':
      if (!mastery) {
        console.warn('Adaptive selection requires mastery data, falling back to random');
        selected = selectRandom(allQuestions, pool.drawCount, rng);
      } else {
        selected = selectAdaptive(allQuestions, pool.drawCount, mastery, rng);
      }
      break;

    case 'spaced-repetition':
      if (!mastery) {
        console.warn('Spaced repetition requires mastery data, falling back to random');
        selected = selectRandom(allQuestions, pool.drawCount, rng);
      } else {
        selected = selectSpacedRepetition(allQuestions, pool.drawCount, mastery, rng);
      }
      break;

    default:
      selected = selectRandom(allQuestions, pool.drawCount, rng);
  }

  // Shuffle questions if enabled
  if (pool.randomization.shuffleQuestions) {
    selected = rng.shuffle(selected);
  }

  // Shuffle choices within questions if enabled
  if (pool.randomization.shuffleChoices) {
    selected = selected.map((q) => shuffleQuestionChoices(q, rng));
  }

  return {
    questions: selected,
    seed,
    sourceMap,
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simple string hash for learner ID seeding
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Shuffle choices within a question
 */
function shuffleQuestionChoices(question: Question, rng: SeededRandom): Question {
  switch (question.type) {
    case 'multiple-choice':
      return {
        ...question,
        choices: rng.shuffle(question.choices),
      };

    case 'multiple-select':
      return {
        ...question,
        choices: rng.shuffle(question.choices),
      };

    case 'matching':
      return {
        ...question,
        leftItems: rng.shuffle(question.leftItems),
        rightItems: rng.shuffle(question.rightItems),
      };

    case 'ordering':
      return {
        ...question,
        items: rng.shuffle(question.items),
      };

    case 'ranking':
      return {
        ...question,
        items: rng.shuffle(question.items),
      };

    default:
      return question;
  }
}

// =============================================================================
// SPACED REPETITION HELPERS
// =============================================================================

/**
 * Update review schedule after answering (SM-2 inspired)
 */
export function updateReviewSchedule(
  reviewItem: ReviewItem | undefined,
  questionId: string,
  _wasCorrect: boolean,
  quality: number, // 0-5 (0 = complete blackout, 5 = perfect recall)
): ReviewItem {
  const now = new Date();
  const defaultItem: ReviewItem = {
    questionId,
    nextReview: now.toISOString(),
    interval: 1,
    easeFactor: 2.5,
  };

  const item = reviewItem || defaultItem;

  if (quality < 3) {
    // Failed - reset interval
    return {
      ...item,
      interval: 1,
      nextReview: addDays(now, 1).toISOString(),
      easeFactor: Math.max(1.3, item.easeFactor - 0.2),
    };
  }

  // Success - increase interval
  const newEaseFactor = Math.max(
    1.3,
    item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  let newInterval: number;
  if (item.interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(item.interval * newEaseFactor);
  }

  return {
    ...item,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReview: addDays(now, newInterval).toISOString(),
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// =============================================================================
// MASTERY CALCULATION
// =============================================================================

/**
 * Calculate mastery score from attempts
 */
export function calculateMastery(correct: number, total: number): number {
  if (total === 0) return 0;

  // Weighted average giving more weight to recent performance
  // Simple implementation - could be enhanced with decay
  const rawScore = correct / total;

  // Apply minimum threshold - need at least 3 attempts for high confidence
  const confidence = Math.min(1, total / 3);

  // Return weighted score
  return rawScore * confidence;
}

/**
 * Update mastery after answering a question
 */
export function updateMastery(
  mastery: LearnerMastery,
  question: Question,
  wasCorrect: boolean,
): LearnerMastery {
  const newMastery = { ...mastery };

  // Update tag mastery
  if (question.tags) {
    const newTagMastery = { ...mastery.tagMastery };
    for (const tag of question.tags) {
      const current = newTagMastery[tag] || { score: 0, attempts: 0, correct: 0 };
      const newAttempts = current.attempts + 1;
      const newCorrect = current.correct + (wasCorrect ? 1 : 0);
      newTagMastery[tag] = {
        score: calculateMastery(newCorrect, newAttempts),
        attempts: newAttempts,
        correct: newCorrect,
        lastAttempt: new Date().toISOString(),
      };
    }
    newMastery.tagMastery = newTagMastery;
  }

  // Update type mastery
  const currentType = mastery.typeMastery[question.type] || {
    score: 0,
    attempts: 0,
    correct: 0,
  };
  const newTypeAttempts = currentType.attempts + 1;
  const newTypeCorrect = currentType.correct + (wasCorrect ? 1 : 0);
  newMastery.typeMastery = {
    ...mastery.typeMastery,
    [question.type]: {
      score: calculateMastery(newTypeCorrect, newTypeAttempts),
      attempts: newTypeAttempts,
      correct: newTypeCorrect,
      lastAttempt: new Date().toISOString(),
    },
  };

  // Update recent questions (keep last 20)
  const recentQuestions = [
    question.id,
    ...mastery.recentQuestions.filter((id) => id !== question.id),
  ];
  newMastery.recentQuestions = recentQuestions.slice(0, 20);

  return newMastery;
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create empty mastery record for a learner
 */
export function createEmptyMastery(learnerId: string): LearnerMastery {
  return {
    learnerId,
    tagMastery: {},
    typeMastery: {} as Record<string, { score: number; attempts: number; correct: number }>,
    recentQuestions: [],
    reviewQueue: [],
  };
}

/**
 * Create a new seeded random instance for testing
 */
export function createSeededRandom(seed: number): SeededRandom {
  return new SeededRandom(seed);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { SeededRandom };
