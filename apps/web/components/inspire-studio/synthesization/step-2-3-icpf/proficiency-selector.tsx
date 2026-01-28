'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ProficiencyLevel } from '@/schemas/inspire';
import { PROFICIENCY_LEVEL_CATALOG } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface ProficiencySelectorProps {
  label: string;
  description?: string;
  value: ProficiencyLevel | undefined;
  onChange: (level: ProficiencyLevel) => void;
  minLevel?: ProficiencyLevel;
  variant?: 'start' | 'target';
  className?: string;
}

/**
 * ProficiencySelector - Visual selector for proficiency levels
 * Displays as a horizontal ladder with color-coded levels
 */
export function ProficiencySelector({
  label,
  description,
  value,
  onChange,
  minLevel,
  variant = 'target',
  className,
}: ProficiencySelectorProps) {
  const minIndex = minLevel ? PROFICIENCY_LEVEL_CATALOG.findIndex((p) => p.value === minLevel) : -1;

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>

      {/* Level Ladder */}
      <div className="flex items-end gap-1">
        {PROFICIENCY_LEVEL_CATALOG.map((level, index) => {
          const isSelected = value === level.value;
          const isDisabled = index < minIndex;
          const barHeight = 20 + index * 16; // Increasing height for ladder effect

          return (
            <button
              key={level.value}
              type="button"
              onClick={() => !isDisabled && onChange(level.value)}
              disabled={isDisabled}
              className={cn(
                'flex-1 rounded-t-lg transition-all relative group',
                'border border-b-0 border-lxd-dark-border',
                isDisabled && 'opacity-30 cursor-not-allowed',
                !isDisabled && 'hover:border-lxd-purple/50 cursor-pointer',
                isSelected && variant === 'target' && 'border-lxd-purple bg-lxd-purple/20',
                isSelected && variant === 'start' && 'border-lxd-cyan bg-lxd-cyan/20',
              )}
              style={{ height: barHeight }}
            >
              {/* Level Number */}
              <span
                className={cn(
                  'absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold',
                  isSelected && variant === 'target' && 'text-lxd-purple',
                  isSelected && variant === 'start' && 'text-lxd-cyan',
                  !isSelected && 'text-muted-foreground',
                )}
              >
                {level.level}
              </span>

              {/* Hover Tooltip */}
              <div
                className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-8 px-2 py-1 rounded text-xs',
                  'bg-lxd-dark-surface border border-lxd-dark-border shadow-lg',
                  'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  'whitespace-nowrap z-10',
                )}
              >
                <span className={cn('font-medium', level.color)}>{level.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs">
        {PROFICIENCY_LEVEL_CATALOG.map((level) => {
          const isSelected = value === level.value;
          return (
            <span
              key={level.value}
              className={cn(
                'flex-1 text-center truncate px-0.5',
                isSelected && variant === 'target' && 'text-lxd-purple font-medium',
                isSelected && variant === 'start' && 'text-lxd-cyan font-medium',
                !isSelected && 'text-muted-foreground',
              )}
            >
              {level.label}
            </span>
          );
        })}
      </div>

      {/* Selected Level Details */}
      {value && (
        <div
          className={cn(
            'p-3 rounded-lg border',
            variant === 'target'
              ? 'bg-lxd-purple/10 border-lxd-purple/30'
              : 'bg-lxd-cyan/10 border-lxd-cyan/30',
          )}
        >
          {(() => {
            const selected = PROFICIENCY_LEVEL_CATALOG.find((l) => l.value === value);
            if (!selected) return null;

            return (
              <div className="space-y-1">
                <span className={cn('font-medium', selected.color)}>{selected.label}</span>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
