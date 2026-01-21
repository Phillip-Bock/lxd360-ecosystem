'use client';

import { AlertTriangle, Brain, Coffee, Sparkles } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface CognitiveMeterProps {
  level: number; // 0-100
  sessionTime: number; // in minutes
  lessonProgress: number; // 0-100
  showRecommendation?: boolean;
  className?: string;
}

export function CognitiveMeter({
  level,
  sessionTime,
  lessonProgress,
  showRecommendation = true,
  className,
}: CognitiveMeterProps): React.JSX.Element {
  // Determine cognitive state
  const getState = (): {
    label: string;
    color: string;
    icon: typeof Sparkles | typeof Brain | typeof AlertTriangle;
  } => {
    if (level < 30) return { label: 'Fresh', color: 'emerald', icon: Sparkles };
    if (level < 60) return { label: 'Engaged', color: 'blue', icon: Brain };
    if (level < 80) return { label: 'Working Hard', color: 'amber', icon: Brain };
    return { label: 'Take a Break', color: 'red', icon: AlertTriangle };
  };

  const state = getState();

  // Color mappings
  const colorClasses = {
    emerald: {
      bg: 'bg-brand-success',
      bgLight: 'bg-brand-success/20',
      text: 'text-brand-success',
      border: 'border-emerald-500/30',
    },
    blue: {
      bg: 'bg-[var(--studio-accent)]',
      bgLight: 'bg-[var(--studio-accent)]/20',
      text: 'text-[var(--studio-accent)]',
      border: 'border-[var(--studio-accent)]/30',
    },
    amber: {
      bg: 'bg-brand-warning',
      bgLight: 'bg-brand-warning/20',
      text: 'text-brand-warning',
      border: 'border-amber-500/30',
    },
    red: {
      bg: 'bg-brand-error',
      bgLight: 'bg-brand-error/20',
      text: 'text-brand-error',
      border: 'border-brand-error/30',
    },
  };

  const colors = colorClasses[state.color as keyof typeof colorClasses];
  const Icon = state.icon;

  // Recommendation based on state
  const getRecommendation = (): string => {
    if (level < 30) return "You're in the optimal learning zone. Keep going!";
    if (level < 60) return 'Good focus! Consider a short break in 15 minutes.';
    if (level < 80) return 'Your cognitive load is increasing. A break soon would help.';
    return 'Time for a 5-10 minute break to refresh your mind.';
  };

  return (
    <div
      className={cn(
        'bg-[var(--studio-bg)] rounded-xl border border-[var(--lxd-dark-surface-alt)]/50 p-4',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bgLight)}
          >
            <Icon className={cn('w-4 h-4', colors.text)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cognitive Load</p>
            <p className={cn('text-sm font-semibold', colors.text)}>{state.label}</p>
          </div>
        </div>
        <span className={cn('text-2xl font-bold', colors.text)}>{level}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-[var(--lxd-dark-surface-alt)]/30 rounded-full overflow-hidden mb-4">
        <div
          className={cn('absolute h-full rounded-full transition-all duration-500', colors.bg)}
          style={{ width: `${level}%` }}
        />
        {/* Zone indicators */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-[var(--studio-bg-dark)]" /> {/* 0-30: Fresh */}
          <div className="flex-1 border-r border-[var(--studio-bg-dark)]" /> {/* 30-60: Engaged */}
          <div className="flex-1 border-r border-[var(--studio-bg-dark)]" /> {/* 60-80: Working */}
          <div className="flex-1" /> {/* 80-100: Break needed */}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--studio-bg-dark)] rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Session Time</p>
          <p className="text-sm font-semibold text-brand-primary">{sessionTime} min</p>
        </div>
        <div className="bg-[var(--studio-bg-dark)] rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Lesson Progress</p>
          <p className="text-sm font-semibold text-brand-primary">{lessonProgress}%</p>
        </div>
      </div>

      {/* Recommendation */}
      {showRecommendation && (
        <div className={cn('rounded-lg p-3 border', colors.bgLight, colors.border)}>
          <p className={cn('text-xs', colors.text)}>{getRecommendation()}</p>
          {level >= 80 && (
            <button
              type="button"
              className={cn(
                'mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
                colors.bg,
                'text-brand-primary hover:opacity-90 transition-opacity',
              )}
            >
              <Coffee className="w-3.5 h-3.5" />
              Take a Break
            </button>
          )}
        </div>
      )}
    </div>
  );
}
