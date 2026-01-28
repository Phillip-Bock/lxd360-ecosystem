'use client';

import { Compass, Eye, Flame, Layers, Puzzle, Rocket, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { INSPIREStage } from '@/types/inspire-studio';

// Stage icon mapping
const STAGE_CONFIG = {
  ignite: { icon: Flame, color: '#f97316', letter: 'I', name: 'Ignite' },
  navigate: { icon: Compass, color: 'var(--info)', letter: 'N', name: 'Navigate' },
  scaffold: { icon: Layers, color: '#a855f7', letter: 'S', name: 'Scaffold' },
  practice: { icon: Target, color: 'var(--success)', letter: 'P', name: 'Practice' },
  integrate: { icon: Puzzle, color: '#06b6d4', letter: 'I', name: 'Integrate' },
  reflect: { icon: Eye, color: '#ec4899', letter: 'R', name: 'Reflect' },
  extend: { icon: Rocket, color: 'var(--warning)', letter: 'E', name: 'Extend' },
};

interface INSPIREBadgeProps {
  stage: INSPIREStage;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle' | 'icon-only' | 'letter-only';
  showLabel?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function INSPIREBadge({
  stage,
  size = 'sm',
  variant = 'subtle',
  showLabel = true,
  interactive = false,
  onClick,
  className,
}: INSPIREBadgeProps): React.JSX.Element {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;

  const sizeStyles = {
    xs: {
      badge: 'px-1.5 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3',
      iconOnly: 'w-5 h-5',
      letter: 'text-[10px]',
    },
    sm: {
      badge: 'px-2 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
      iconOnly: 'w-6 h-6',
      letter: 'text-xs',
    },
    md: {
      badge: 'px-2.5 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4',
      iconOnly: 'w-8 h-8',
      letter: 'text-sm',
    },
    lg: {
      badge: 'px-3 py-2 text-sm gap-2',
      icon: 'w-5 h-5',
      iconOnly: 'w-10 h-10',
      letter: 'text-base',
    },
  };

  const sizeConfig = sizeStyles[size];

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!interactive && !onClick}
        className={cn(
          'rounded-lg flex items-center justify-center transition-all',
          sizeConfig.iconOnly,
          interactive && 'hover:scale-110 cursor-pointer',
          !interactive && !onClick && 'cursor-default',
          className,
        )}
        style={{ backgroundColor: `${config.color}20` }}
        title={config.name}
      >
        <Icon className={sizeConfig.icon} style={{ color: config.color }} />
      </button>
    );
  }

  if (variant === 'letter-only') {
    return (
      <span
        className={cn('font-bold rounded px-1.5 py-0.5', sizeConfig.letter, className)}
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
        }}
        title={config.name}
      >
        {config.letter}
      </span>
    );
  }

  const variantStyles = {
    solid: {
      background: config.color,
      color: 'white',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: config.color,
      border: `1.5px solid ${config.color}`,
    },
    subtle: {
      background: `${config.color}15`,
      color: config.color,
      border: 'none',
    },
  };

  const style = variantStyles[variant];

  const Component = interactive || onClick ? 'button' : 'span';

  return (
    <Component
      type={interactive || onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={!interactive && !onClick}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all',
        sizeConfig.badge,
        interactive && 'hover:opacity-80 cursor-pointer',
        !interactive && !onClick && 'cursor-default',
        className,
      )}
      style={{
        backgroundColor: style.background,
        color: style.color,
        border: style.border,
      }}
    >
      <Icon className={sizeConfig.icon} />
      {showLabel && <span>{config.name}</span>}
    </Component>
  );
}

// Multiple badges display
interface INSPIREBadgeGroupProps {
  stages: INSPIREStage[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle' | 'icon-only';
  max?: number;
  className?: string;
}

export function INSPIREBadgeGroup({
  stages,
  size = 'sm',
  variant = 'icon-only',
  max = 7,
  className,
}: INSPIREBadgeGroupProps): React.JSX.Element {
  const displayStages = stages.slice(0, max);
  const remaining = stages.length - max;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displayStages.map((stage) => (
        <INSPIREBadge
          key={stage}
          stage={stage}
          size={size}
          variant={variant}
          showLabel={variant !== 'icon-only'}
        />
      ))}
      {remaining > 0 && <span className="text-xs text-muted-foreground ml-1">+{remaining}</span>}
    </div>
  );
}

// INSPIRE Timeline showing all 7 stages with progress
interface INSPIRETimelineProps {
  completedStages: INSPIREStage[];
  currentStage?: INSPIREStage;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function INSPIRETimeline({
  completedStages,
  currentStage,
  size = 'md',
  className,
}: INSPIRETimelineProps) {
  const stages: INSPIREStage[] = [
    'ignite',
    'navigate',
    'scaffold',
    'practice',
    'integrate',
    'reflect',
    'extend',
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stages.map((stage, index) => {
        const config = STAGE_CONFIG[stage];
        const Icon = config.icon;
        const isCompleted = completedStages.includes(stage);
        const isCurrent = currentStage === stage;

        const sizeConfig = {
          sm: { box: 'w-6 h-6', icon: 'w-3 h-3', line: 'h-0.5 w-2' },
          md: { box: 'w-8 h-8', icon: 'w-4 h-4', line: 'h-0.5 w-3' },
          lg: { box: 'w-10 h-10', icon: 'w-5 h-5', line: 'h-1 w-4' },
        }[size];

        return (
          <div key={stage} className="flex items-center">
            <div
              className={cn(
                'rounded-lg flex items-center justify-center transition-all',
                sizeConfig.box,
                isCurrent && 'ring-2 ring-offset-2 ring-offset-background',
                !isCompleted && !isCurrent && 'opacity-30',
              )}
              style={
                {
                  backgroundColor: isCompleted || isCurrent ? `${config.color}20` : 'transparent',
                  borderColor: config.color,
                  '--tw-ring-color': isCurrent ? config.color : undefined,
                } as React.CSSProperties
              }
              title={config.name}
            >
              <Icon
                className={sizeConfig.icon}
                style={{ color: isCompleted || isCurrent ? config.color : 'currentColor' }}
              />
            </div>
            {index < stages.length - 1 && (
              <div className={cn(sizeConfig.line, isCompleted ? 'bg-(--primary)' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STAGE_CONFIG };
export type { INSPIREBadgeProps, INSPIREBadgeGroupProps, INSPIRETimelineProps };
