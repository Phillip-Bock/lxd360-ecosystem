'use client';

import { cn } from '@/lib/utils';

// =============================================================================
// Base Scenario Node HOC
// =============================================================================
// Provides consistent styling and behavior for all scenario nodes.
// =============================================================================

interface BaseScenarioNodeProps {
  children: React.ReactNode;
  selected?: boolean;
  hasError?: boolean;
  className?: string;
  variant?: 'rectangle' | 'rounded' | 'diamond' | 'terminal';
}

export function BaseScenarioNode({
  children,
  selected,
  hasError,
  className,
  variant = 'rectangle',
}: BaseScenarioNodeProps) {
  const baseStyles = cn(
    'bg-lxd-dark-surface border-2 shadow-lg transition-all duration-200',
    'hover:shadow-xl',
    selected && 'ring-2 ring-lxd-cyan ring-offset-2 ring-offset-lxd-dark-bg',
    hasError && 'border-red-500 bg-red-500/10',
    !hasError && 'border-lxd-dark-border',
    className,
  );

  switch (variant) {
    case 'diamond':
      return (
        <div className={cn(baseStyles, 'rotate-45 p-4')}>
          <div className="-rotate-45">{children}</div>
        </div>
      );
    case 'terminal':
      return <div className={cn(baseStyles, 'rounded-full px-6 py-4')}>{children}</div>;
    case 'rounded':
      return <div className={cn(baseStyles, 'rounded-xl px-4 py-3')}>{children}</div>;
    default:
      return <div className={cn(baseStyles, 'rounded-lg px-4 py-3')}>{children}</div>;
  }
}

// =============================================================================
// Handle Components
// =============================================================================

interface HandleDotProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  type: 'source' | 'target';
  label?: string;
}

export function HandleDot({ position, type, label }: HandleDotProps) {
  const positionStyles: Record<string, string> = {
    top: '-top-2 left-1/2 -translate-x-1/2',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2',
    left: '-left-2 top-1/2 -translate-y-1/2',
    right: '-right-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={cn(
        'absolute w-4 h-4 rounded-full border-2',
        type === 'source' ? 'bg-lxd-cyan border-lxd-cyan' : 'bg-lxd-purple border-lxd-purple',
        positionStyles[position],
      )}
    >
      {label && (
        <span
          className={cn(
            'absolute whitespace-nowrap text-[10px] text-white/70',
            position === 'bottom' && 'top-full mt-1 left-1/2 -translate-x-1/2',
            position === 'top' && 'bottom-full mb-1 left-1/2 -translate-x-1/2',
            position === 'left' && 'right-full mr-1 top-1/2 -translate-y-1/2',
            position === 'right' && 'left-full ml-1 top-1/2 -translate-y-1/2',
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Node Type Badge
// =============================================================================

interface NodeTypeBadgeProps {
  type: string;
  className?: string;
}

const nodeTypeColors: Record<string, string> = {
  start: 'bg-green-500/20 text-green-400 border-green-500/50',
  dialogue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  action: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  logic_gate: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  end_state: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function NodeTypeBadge({ type, className }: NodeTypeBadgeProps) {
  const colorClass = nodeTypeColors[type] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/50';

  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 text-[10px] font-medium uppercase rounded border',
        colorClass,
        className,
      )}
    >
      {type.replace('_', ' ')}
    </span>
  );
}

export default BaseScenarioNode;
