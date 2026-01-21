'use client';

import { Brain, Calendar, Check, RotateCcw, Target, X, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { ReviewItem, ReviewQuality } from '@/lib/hooks/useSpacedRepetition';

interface SpacedRepetitionCardProps {
  item: ReviewItem;
  onSubmit: (quality: ReviewQuality) => void;
  onSkip: () => void;
  showAnswer?: boolean;
  onReveal?: () => void;
}

export function SpacedRepetitionCard({
  item,
  onSubmit,
  onSkip,
  showAnswer: externalShowAnswer,
  onReveal,
}: SpacedRepetitionCardProps): React.JSX.Element {
  const [showAnswer, setShowAnswer] = useState(externalShowAnswer ?? false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleReveal = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowAnswer(true);
      setIsFlipping(false);
      onReveal?.();
    }, 150);
  }, [onReveal]);

  const handleSubmit = useCallback(
    (quality: ReviewQuality) => {
      setShowAnswer(false);
      onSubmit(quality);
    },
    [onSubmit],
  );

  const getIntervalText = (days: number): string => {
    if (days === 0) return 'New';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.round(days / 7)} weeks`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card */}
      <div
        className={`
          relative bg-lxd-light-card rounded-2xl shadow-lg border border-lxd-light-border
          transition-transform duration-300 preserve-3d
          ${isFlipping ? 'scale-95' : 'scale-100'}
        `}
      >
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-lxd-light-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
              p-2 rounded-lg
              ${
                item.contentType === 'concept'
                  ? 'bg-purple-100 text-purple-600'
                  : item.contentType === 'skill'
                    ? 'bg-blue-100 text-brand-blue'
                    : item.contentType === 'fact'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-amber-100 text-amber-600'
              }
            `}
            >
              {item.contentType === 'concept' ? (
                <Brain className="w-5 h-5" />
              ) : item.contentType === 'skill' ? (
                <Zap className="w-5 h-5" />
              ) : item.contentType === 'fact' ? (
                <Target className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-medium text-lxd-text-dark-muted uppercase tracking-wide">
                {item.contentType}
              </span>
              <p className="text-sm text-lxd-text-dark-body">
                {getIntervalText(item.interval)} • {item.repetitions} reviews
              </p>
            </div>
          </div>

          {/* Strength indicator */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-lxd-text-dark-muted">Strength</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-4 rounded-sm ${
                    level <= Math.ceil((item.easinessFactor / MAX_EASINESS) * 5)
                      ? 'bg-brand-success'
                      : 'bg-lxd-light-surface'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-8 min-h-[200px] flex items-center justify-center">
          {!showAnswer ? (
            // Question side
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-lxd-text-dark-heading mb-4">
                {item.title}
              </h3>
              <p className="text-lxd-text-dark-muted text-sm">
                Recall the answer, then tap to reveal
              </p>
            </div>
          ) : (
            // Answer side
            <div className="text-center w-full">
              <h3 className="text-xl font-medium text-lxd-text-dark-body mb-4">{item.title}</h3>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-lxd-text-dark-body text-sm mb-2">Expected recall:</p>
                <p className="text-lg text-lxd-text-dark-heading">
                  [Answer content would appear here based on item data]
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-lxd-light-border">
          {!showAnswer ? (
            // Reveal button
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSkip}
                className="flex items-center justify-center gap-2 px-4 py-3 text-lxd-text-dark-body hover:bg-lxd-light-card rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Skip
              </button>
              <button
                type="button"
                onClick={handleReveal}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-brand-primary rounded-xl font-medium hover:bg-brand-primary-hover transition-colors"
              >
                Reveal Answer
              </button>
            </div>
          ) : (
            // Rating buttons
            <div className="space-y-3">
              <p className="text-sm text-lxd-text-dark-muted text-center">
                How well did you recall?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* Fail options */}
                <button
                  type="button"
                  onClick={() => handleSubmit(0)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="text-xs font-medium">Blackout</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(2)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="text-xs font-medium">Wrong</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(3)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-xs font-medium">Hard</span>
                </button>
                {/* Pass options */}
                <button
                  type="button"
                  onClick={() => handleSubmit(4)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 transition-colors col-span-1"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-xs font-medium">Good</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(5)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-800 transition-colors col-span-2"
                >
                  <Check className="w-6 h-6" />
                  <span className="text-sm font-medium">Perfect!</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-center text-xs text-lxd-text-light-muted">
        {!showAnswer ? (
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-lxd-light-card rounded">Space</kbd> to reveal
          </span>
        ) : (
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-lxd-light-card rounded">1-5</kbd> to rate •{' '}
            <kbd className="px-1.5 py-0.5 bg-lxd-light-card rounded">S</kbd> to skip
          </span>
        )}
      </div>
    </div>
  );
}

const MAX_EASINESS = 4.0;

interface SpacedRepetitionStatsProps {
  stats: {
    totalItems: number;
    dueToday: number;
    masteredItems: number;
    averageRetention: number;
    streakDays: number;
  };
}

export function SpacedRepetitionStats({ stats }: SpacedRepetitionStatsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="p-4 bg-lxd-light-card rounded-xl border border-lxd-light-border text-center">
        <div className="text-2xl font-bold text-lxd-text-dark-heading">{stats.totalItems}</div>
        <div className="text-sm text-lxd-text-dark-muted">Total Items</div>
      </div>
      <div className="p-4 bg-lxd-light-card rounded-xl border border-lxd-light-border text-center">
        <div className="text-2xl font-bold text-brand-blue">{stats.dueToday}</div>
        <div className="text-sm text-lxd-text-dark-muted">Due Today</div>
      </div>
      <div className="p-4 bg-lxd-light-card rounded-xl border border-lxd-light-border text-center">
        <div className="text-2xl font-bold text-green-600">{stats.masteredItems}</div>
        <div className="text-sm text-lxd-text-dark-muted">Mastered</div>
      </div>
      <div className="p-4 bg-lxd-light-card rounded-xl border border-lxd-light-border text-center">
        <div className="text-2xl font-bold text-purple-600">
          {Math.round(stats.averageRetention)}%
        </div>
        <div className="text-sm text-lxd-text-dark-muted">Retention</div>
      </div>
      <div className="p-4 bg-lxd-light-card rounded-xl border border-lxd-light-border text-center">
        <div className="text-2xl font-bold text-amber-600">{stats.streakDays}</div>
        <div className="text-sm text-lxd-text-dark-muted">Day Streak</div>
      </div>
    </div>
  );
}
