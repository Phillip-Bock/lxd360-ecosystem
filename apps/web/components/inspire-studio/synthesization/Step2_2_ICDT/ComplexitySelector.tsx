'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ComplexityLevel } from '@/schemas/inspire';
import { COMPLEXITY_LEVEL_CATALOG } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface ComplexitySelectorProps {
  value: ComplexityLevel | undefined;
  onChange: (level: ComplexityLevel) => void;
  className?: string;
}

/**
 * ComplexitySelector - Visual selector for ICDT complexity levels
 * Displays as a horizontal scale with color-coded levels
 */
export function ComplexitySelector({ value, onChange, className }: ComplexitySelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-medium">Complexity Level</Label>

      {/* Horizontal Level Bar */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="h-2 rounded-full bg-gradient-to-r from-gray-500 via-cyan-500 via-purple-500 to-red-500" />

        {/* Level Buttons */}
        <div className="flex justify-between mt-3">
          {COMPLEXITY_LEVEL_CATALOG.map((level) => {
            const isSelected = value === level.value;

            return (
              <button
                key={level.value}
                type="button"
                onClick={() => onChange(level.value)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-1',
                  'hover:bg-lxd-dark-bg/50',
                  isSelected && 'bg-lxd-dark-bg ring-2 ring-lxd-purple',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    isSelected
                      ? 'bg-lxd-purple text-white'
                      : 'bg-lxd-dark-surface border border-lxd-dark-border',
                  )}
                >
                  {level.level}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center',
                    isSelected ? 'text-lxd-purple' : 'text-muted-foreground',
                  )}
                >
                  {level.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Level Details */}
      {value && (
        <div className="p-3 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          {(() => {
            const selected = COMPLEXITY_LEVEL_CATALOG.find((l) => l.value === value);
            if (!selected) return null;

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn('font-medium', selected.color)}>{selected.label}</span>
                  <span className="text-xs text-muted-foreground">
                    Cognitive Load: {selected.cognitiveLoadRange.min}-
                    {selected.cognitiveLoadRange.max}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
