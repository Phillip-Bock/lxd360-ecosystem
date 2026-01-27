'use client';

/**
 * PlayerNavigation Component
 * LXD-332: Bottom navigation bar with prev/next/mark complete
 */

import { ArrowLeft, ArrowRight, CheckCircle, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  LessonStatus,
  PlayerNavigation as PlayerNavigationState,
} from '@/types/player/course-player';

interface PlayerNavigationProps {
  navigation: PlayerNavigationState | null;
  lessonStatus: LessonStatus;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => Promise<void>;
  isLastLesson?: boolean;
}

export function CoursePlayerNavigation({
  navigation,
  lessonStatus,
  onPrevious,
  onNext,
  onMarkComplete,
  isLastLesson = false,
}: PlayerNavigationProps) {
  const [isMarking, setIsMarking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const isCompleted = lessonStatus === 'completed';
  const canGoBack = navigation?.hasPrevious ?? false;
  const canGoForward = navigation?.hasNext ?? false;

  const handleMarkComplete = async () => {
    if (isCompleted || isMarking) return;

    setIsMarking(true);
    try {
      await onMarkComplete();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <footer className="h-16 bg-card border-t border-border flex items-center justify-between px-4 shrink-0">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoBack}
        className="gap-2"
        aria-label="Go to previous lesson"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Mark Complete / Next Section */}
      <div className="flex items-center gap-3">
        {/* Mark Complete Button */}
        <Button
          variant={isCompleted ? 'outline' : 'default'}
          onClick={handleMarkComplete}
          disabled={isCompleted || isMarking}
          className={cn(
            'gap-2 relative overflow-hidden',
            isCompleted && 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100',
            showCelebration && 'animate-pulse',
          )}
          aria-label={isCompleted ? 'Lesson completed' : 'Mark lesson as complete'}
          aria-pressed={isCompleted}
        >
          {showCelebration ? (
            <>
              <PartyPopper className="h-4 w-4" />
              <span className="hidden sm:inline">Nice Work!</span>
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{isMarking ? 'Saving...' : 'Mark Complete'}</span>
            </>
          )}
        </Button>

        {/* Next Button */}
        {!isLastLesson && (
          <Button
            variant="default"
            onClick={onNext}
            disabled={!canGoForward}
            className="gap-2"
            aria-label="Go to next lesson"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {/* Finish Course Button (for last lesson) */}
        {isLastLesson && isCompleted && (
          <Button
            variant="default"
            onClick={() => {
              window.location.href = '/ignite/learn/my-learning';
            }}
            className="gap-2 bg-green-600 hover:bg-green-700"
            aria-label="Finish course and return to dashboard"
          >
            <PartyPopper className="h-4 w-4" />
            <span className="hidden sm:inline">Finish Course</span>
          </Button>
        )}
      </div>

      {/* Spacer for alignment when next is hidden */}
      {isLastLesson && !isCompleted && <div className="w-24" aria-hidden="true" />}
      {!isLastLesson && <div className="w-0" aria-hidden="true" />}
    </footer>
  );
}
