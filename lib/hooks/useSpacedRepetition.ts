/**
 * Spaced Repetition Hook
 *
 * Implements the SM-2 algorithm for optimal review scheduling.
 * Tracks learning items and suggests reviews based on forgetting curve.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'hooks-spaced-repetition' });

// SM-2 Algorithm Parameters
const MIN_EASINESS = 1.3;
const DEFAULT_EASINESS = 2.5;
const MAX_EASINESS = 4.0;

// Review quality ratings (0-5)
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewItem {
  id: string;
  contentId: string;
  contentType: 'concept' | 'skill' | 'fact' | 'question';
  title: string;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  repetitions: number;
  easinessFactor: number;
  interval: number; // days until next review
  consecutiveCorrect: number;
  totalReviews: number;
  averageQuality: number;
}

export interface ReviewSession {
  items: ReviewItem[];
  currentIndex: number;
  startedAt: string;
  completedReviews: number;
}

interface UseSpacedRepetitionConfig {
  userId: string;
  courseId?: string;
  maxDailyReviews?: number;
  storageKey?: string;
}

interface UseSpacedRepetitionReturn {
  // Current state
  dueItems: ReviewItem[];
  reviewSession: ReviewSession | null;
  currentItem: ReviewItem | null;
  isLoading: boolean;

  // Actions
  startReviewSession: (limit?: number) => void;
  submitReview: (quality: ReviewQuality) => void;
  skipItem: () => void;
  endSession: () => void;

  // Item management
  addItem: (
    item: Omit<
      ReviewItem,
      | 'id'
      | 'lastReviewedAt'
      | 'nextReviewAt'
      | 'repetitions'
      | 'easinessFactor'
      | 'interval'
      | 'consecutiveCorrect'
      | 'totalReviews'
      | 'averageQuality'
    >,
  ) => void;
  removeItem: (itemId: string) => void;

  // Stats
  stats: {
    totalItems: number;
    dueToday: number;
    masteredItems: number;
    averageRetention: number;
    streakDays: number;
  };
}

/**
 * Calculate next review interval using SM-2 algorithm
 */
function calculateNextReview(item: ReviewItem, quality: ReviewQuality): Partial<ReviewItem> {
  // Calculate new easiness factor
  let newEasiness = item.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEasiness = Math.max(MIN_EASINESS, Math.min(MAX_EASINESS, newEasiness));

  let newInterval: number;
  let newRepetitions: number;
  let newConsecutiveCorrect: number;

  if (quality < 3) {
    // Failed review - reset progress
    newInterval = 1;
    newRepetitions = 0;
    newConsecutiveCorrect = 0;
  } else {
    // Successful review
    newConsecutiveCorrect = item.consecutiveCorrect + 1;
    newRepetitions = item.repetitions + 1;

    if (item.repetitions === 0) {
      newInterval = 1;
    } else if (item.repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(item.interval * newEasiness);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easinessFactor: newEasiness,
    interval: newInterval,
    repetitions: newRepetitions,
    consecutiveCorrect: newConsecutiveCorrect,
    totalReviews: item.totalReviews + 1,
    averageQuality: (item.averageQuality * item.totalReviews + quality) / (item.totalReviews + 1),
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: nextReviewDate.toISOString(),
  };
}

/**
 * Get items due for review
 */
function getDueItems(items: ReviewItem[], maxItems?: number): ReviewItem[] {
  const now = new Date();

  const due = items
    .filter((item) => new Date(item.nextReviewAt) <= now)
    .sort((a, b) => {
      // Priority: overdue items first, then by interval (shorter = higher priority)
      const aOverdue = now.getTime() - new Date(a.nextReviewAt).getTime();
      const bOverdue = now.getTime() - new Date(b.nextReviewAt).getTime();
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      return a.interval - b.interval;
    });

  return maxItems ? due.slice(0, maxItems) : due;
}

export function useSpacedRepetition(config: UseSpacedRepetitionConfig): UseSpacedRepetitionReturn {
  const {
    userId,
    courseId,
    maxDailyReviews = 20,
    storageKey = 'lxp360-spaced-repetition',
  } = config;

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load items from storage
  useEffect(() => {
    const loadItems = async () => {
      try {
        const key = `${storageKey}-${userId}${courseId ? `-${courseId}` : ''}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (error) {
        log.error('Failed to load spaced repetition data', { error });
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [userId, courseId, storageKey]);

  // Save items to storage (debounced)
  useEffect(() => {
    if (isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const key = `${storageKey}-${userId}${courseId ? `-${courseId}` : ''}`;
        localStorage.setItem(key, JSON.stringify(items));
      } catch (error) {
        log.error('Failed to save spaced repetition data', { error });
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [items, userId, courseId, storageKey, isLoading]);

  // Get due items
  const dueItems = getDueItems(items, maxDailyReviews);

  // Current item in review session
  const currentItem = reviewSession
    ? reviewSession.items[reviewSession.currentIndex] || null
    : null;

  // Start a new review session
  const startReviewSession = useCallback(
    (limit?: number) => {
      const itemsToReview = getDueItems(items, limit || maxDailyReviews);

      if (itemsToReview.length === 0) {
        return;
      }

      setReviewSession({
        items: itemsToReview,
        currentIndex: 0,
        startedAt: new Date().toISOString(),
        completedReviews: 0,
      });
    },
    [items, maxDailyReviews],
  );

  // Submit a review
  const submitReview = useCallback(
    (quality: ReviewQuality) => {
      if (!reviewSession || !currentItem) return;

      const updates = calculateNextReview(currentItem, quality);

      // Update item
      setItems((prev) =>
        prev.map((item) => (item.id === currentItem.id ? { ...item, ...updates } : item)),
      );

      // Move to next item or end session
      if (reviewSession.currentIndex + 1 < reviewSession.items.length) {
        setReviewSession((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                completedReviews: prev.completedReviews + 1,
              }
            : null,
        );
      } else {
        setReviewSession(null);
      }
    },
    [reviewSession, currentItem],
  );

  // Skip current item
  const skipItem = useCallback(() => {
    if (!reviewSession) return;

    if (reviewSession.currentIndex + 1 < reviewSession.items.length) {
      setReviewSession((prev) =>
        prev
          ? {
              ...prev,
              currentIndex: prev.currentIndex + 1,
            }
          : null,
      );
    } else {
      setReviewSession(null);
    }
  }, [reviewSession]);

  // End session early
  const endSession = useCallback(() => {
    setReviewSession(null);
  }, []);

  // Add a new item
  const addItem = useCallback(
    (
      item: Omit<
        ReviewItem,
        | 'id'
        | 'lastReviewedAt'
        | 'nextReviewAt'
        | 'repetitions'
        | 'easinessFactor'
        | 'interval'
        | 'consecutiveCorrect'
        | 'totalReviews'
        | 'averageQuality'
      >,
    ) => {
      const newItem: ReviewItem = {
        ...item,
        id: `${userId}-${item.contentId}-${Date.now()}`,
        lastReviewedAt: null,
        nextReviewAt: new Date().toISOString(), // Due immediately
        repetitions: 0,
        easinessFactor: DEFAULT_EASINESS,
        interval: 0,
        consecutiveCorrect: 0,
        totalReviews: 0,
        averageQuality: 0,
      };

      setItems((prev) => {
        // Don't add duplicates
        if (prev.some((i) => i.contentId === item.contentId)) {
          return prev;
        }
        return [...prev, newItem];
      });
    },
    [userId],
  );

  // Remove an item
  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // Calculate stats
  const stats = {
    totalItems: items.length,
    dueToday: dueItems.length,
    masteredItems: items.filter((i) => i.interval >= 21 && i.consecutiveCorrect >= 3).length,
    averageRetention:
      items.length > 0
        ? (items.reduce((acc, i) => acc + i.averageQuality, 0) / items.length / 5) * 100
        : 0,
    streakDays: calculateStreak(items),
  };

  return {
    dueItems,
    reviewSession,
    currentItem,
    isLoading,
    startReviewSession,
    submitReview,
    skipItem,
    endSession,
    addItem,
    removeItem,
    stats,
  };
}

/**
 * Calculate learning streak
 */
function calculateStreak(items: ReviewItem[]): number {
  if (items.length === 0) return 0;

  const reviewDates = new Set<string>();

  items.forEach((item) => {
    if (item.lastReviewedAt) {
      reviewDates.add(item.lastReviewedAt.split('T')[0]);
    }
  });

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (reviewDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

/**
 * Quality rating descriptions
 */
export const QUALITY_RATINGS: Record<
  ReviewQuality,
  { label: string; description: string; color: string }
> = {
  0: { label: 'Complete Blackout', description: 'No recall at all', color: 'bg-red-500' },
  1: { label: 'Incorrect', description: 'Wrong answer, recognized correct', color: 'bg-red-400' },
  2: { label: 'Incorrect', description: 'Wrong but seemed easy', color: 'bg-orange-400' },
  3: { label: 'Correct', description: 'With serious difficulty', color: 'bg-yellow-500' },
  4: { label: 'Correct', description: 'After some hesitation', color: 'bg-green-400' },
  5: { label: 'Perfect', description: 'Instant recall', color: 'bg-green-500' },
};
