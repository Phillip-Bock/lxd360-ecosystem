'use client';

import { ArrowDown, ArrowRight, ArrowUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './progress-bar';

export interface SkillMasteryCardProps {
  /** Name of the skill */
  skillName: string;
  /** Mastery level from 0 to 100 */
  masteryLevel: number;
  /** Number of practice sessions */
  practiceCount: number;
  /** Date of last practice session */
  lastPracticed?: Date;
  /** Trend direction indicating skill trajectory */
  trend?: 'improving' | 'stable' | 'declining';
  /** Additional class names */
  className?: string;
}

const trendConfig = {
  improving: {
    icon: ArrowUp,
    label: 'Improving',
    colorClass: 'text-success',
    bgClass: 'bg-success/10',
  },
  stable: {
    icon: ArrowRight,
    label: 'Stable',
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/10',
  },
  declining: {
    icon: ArrowDown,
    label: 'Needs Practice',
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10',
  },
} as const;

function getMasteryLabel(level: number): string {
  if (level >= 90) return 'Expert';
  if (level >= 70) return 'Proficient';
  if (level >= 50) return 'Intermediate';
  if (level >= 25) return 'Beginner';
  return 'Novice';
}

function getMasteryVariant(level: number): 'success' | 'default' | 'warning' | 'danger' {
  if (level >= 70) return 'success';
  if (level >= 40) return 'default';
  if (level >= 20) return 'warning';
  return 'danger';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

/**
 * SkillMasteryCard - Displays individual skill progress with trends
 *
 * Features:
 * - Visual mastery level indicator
 * - Trend direction with icon
 * - Practice count and last practiced date
 * - Dynamic mastery labels (Novice → Expert)
 * - Motion-safe animations
 *
 * @example
 * ```tsx
 * <SkillMasteryCard
 *   skillName="React Hooks"
 *   masteryLevel={75}
 *   practiceCount={12}
 *   lastPracticed={new Date('2026-01-20')}
 *   trend="improving"
 * />
 * ```
 */
export function SkillMasteryCard({
  skillName,
  masteryLevel,
  practiceCount,
  lastPracticed,
  trend = 'stable',
  className,
}: SkillMasteryCardProps): React.JSX.Element {
  const clampedLevel = Math.min(100, Math.max(0, masteryLevel));
  const trendInfo = trendConfig[trend];
  const TrendIcon = trendInfo.icon;
  const masteryLabel = getMasteryLabel(clampedLevel);
  const masteryVariant = getMasteryVariant(clampedLevel);

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4',
        'hover:border-border/80 hover:shadow-md transition-all duration-300',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lxd-primary/10 shrink-0">
            <Target className="h-4 w-4 text-lxd-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate">{skillName}</h4>
            <p className="text-xs text-muted-foreground">{masteryLabel}</p>
          </div>
        </div>

        {/* Trend Badge */}
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
            trendInfo.bgClass,
            trendInfo.colorClass,
          )}
        >
          <TrendIcon className="h-3 w-3" />
          <span className="sr-only">{trendInfo.label}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={clampedLevel}
        showPercentage
        size="sm"
        variant={masteryVariant}
        className="mb-3"
      />

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{practiceCount} practice sessions</span>
        {lastPracticed && <span>Last: {formatRelativeTime(lastPracticed)}</span>}
      </div>
    </div>
  );
}
