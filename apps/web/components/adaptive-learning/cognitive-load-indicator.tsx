'use client';

import { cn } from '@/lib/utils';

export type CognitiveLoadLevel = 'low' | 'optimal' | 'high' | 'overload';

interface CognitiveLoadIndicatorProps {
  level: CognitiveLoadLevel;
  score?: number;
  topFactors?: Array<{ feature: string; contribution: number }>;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

const LOAD_CONFIG: Record<
  CognitiveLoadLevel,
  {
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  low: {
    label: 'Low',
    emoji: '🌊',
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-primary/20',
    borderColor: 'border-brand-primary/50',
    description: 'Content may be too easy',
  },
  optimal: {
    label: 'Optimal',
    emoji: '🎯',
    color: 'text-brand-success',
    bgColor: 'bg-brand-success/20',
    borderColor: 'border-brand-success/50',
    description: 'Perfect challenge level',
  },
  high: {
    label: 'High',
    emoji: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-brand-warning/20',
    borderColor: 'border-orange-500/50',
    description: 'Productive struggle',
  },
  overload: {
    label: 'Overload',
    emoji: '⚡',
    color: 'text-brand-error',
    bgColor: 'bg-brand-error/20',
    borderColor: 'border-brand-error/50',
    description: 'Consider taking a break',
  },
};

function formatFeatureName(feature: string): string {
  return feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CognitiveLoadIndicator({
  level,
  score,
  topFactors,
  compact = false,
  showLabel = true,
  className,
}: CognitiveLoadIndicatorProps): React.JSX.Element {
  const config = LOAD_CONFIG[level];

  // Compact mode - just show emoji and optional label
  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full',
          config.bgColor,
          config.borderColor,
          'border',
          className,
        )}
        title={`Cognitive Load: ${config.label} - ${config.description}`}
      >
        <span className="text-sm">{config.emoji}</span>
        {showLabel && (
          <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
        )}
      </div>
    );
  }

  // Expanded mode - show full details
  return (
    <div className={cn('rounded-lg border p-4', config.bgColor, config.borderColor, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <h4 className={cn('font-bold', config.color)}>{config.label} Load</h4>
            <p className="text-xs text-lxd-text-light-muted">{config.description}</p>
          </div>
        </div>
        {score !== undefined && (
          <div className="text-right">
            <div className={cn('text-2xl font-bold', config.color)}>{Math.round(score * 100)}%</div>
          </div>
        )}
      </div>

      {/* Load meter */}
      {score !== undefined && (
        <div className="mb-3">
          <div className="h-2 bg-lxd-dark-surface rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                level === 'low' && 'bg-brand-primary',
                level === 'optimal' && 'bg-brand-success',
                level === 'high' && 'bg-brand-warning',
                level === 'overload' && 'bg-brand-error',
              )}
              style={{ width: `${score * 100}%` }}
            />
          </div>
          {/* Threshold markers */}
          <div className="relative h-1 mt-1">
            <div
              className="absolute left-[25%] w-px h-full bg-lxd-text-light-muted/30"
              title="Low/Optimal threshold"
            />
            <div
              className="absolute left-[55%] w-px h-full bg-lxd-text-light-muted/30"
              title="Optimal/High threshold"
            />
            <div
              className="absolute left-[75%] w-px h-full bg-lxd-text-light-muted/30"
              title="High/Overload threshold"
            />
          </div>
        </div>
      )}

      {/* Contributing factors */}
      {topFactors && topFactors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-lxd-dark-surface">
          <h5 className="text-xs font-medium text-lxd-text-light-muted mb-2">
            Top Contributing Factors
          </h5>
          <div className="space-y-1">
            {topFactors.slice(0, 3).map((factor) => (
              <div key={factor.feature} className="flex items-center justify-between text-xs">
                <span className="text-lxd-text-light-secondary">
                  {formatFeatureName(factor.feature)}
                </span>
                <span
                  className={cn(
                    'font-medium',
                    factor.contribution > 0.15
                      ? 'text-brand-error'
                      : factor.contribution > 0.1
                        ? 'text-orange-400'
                        : 'text-lxd-text-light-muted',
                  )}
                >
                  +{Math.round(factor.contribution * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
