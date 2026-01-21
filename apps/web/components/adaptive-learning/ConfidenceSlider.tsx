'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceSliderProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showLabels?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CONFIDENCE_LEVELS = [
  { min: 0, max: 0.2, label: 'Just guessing', emoji: '🎲', color: 'bg-brand-error' },
  { min: 0.2, max: 0.4, label: 'Not sure', emoji: '🤔', color: 'bg-brand-warning' },
  { min: 0.4, max: 0.6, label: 'Somewhat confident', emoji: '😐', color: 'bg-brand-warning' },
  { min: 0.6, max: 0.8, label: 'Fairly confident', emoji: '🙂', color: 'bg-lime-500' },
  { min: 0.8, max: 1.0, label: 'Very confident', emoji: '😎', color: 'bg-brand-success' },
];

function getConfidenceLevel(value: number): {
  min: number;
  max: number;
  label: string;
  emoji: string;
  color: string;
} {
  return CONFIDENCE_LEVELS.find((l) => value >= l.min && value <= l.max) || CONFIDENCE_LEVELS[2];
}

export function ConfidenceSlider({
  value = 0.5,
  onChange,
  disabled = false,
  showLabels = true,
  showValue = true,
  size = 'md',
  className,
}: ConfidenceSliderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const level = getConfidenceLevel(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    },
    [onChange],
  );

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {showLabels && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-lxd-text-light-secondary">
            How confident are you?
          </span>
          {showValue && (
            <span className="text-sm font-bold flex items-center gap-1">
              <span>{level.emoji}</span>
              <span>{level.label}</span>
            </span>
          )}
        </div>
      )}

      {/* Slider container */}
      <div className="relative">
        {/* Track background with gradient */}
        <div
          className={cn(
            'w-full rounded-full overflow-hidden',
            sizeClasses[size],
            'bg-linear-to-r from-red-500 via-yellow-500 to-green-500',
          )}
        >
          {/* Overlay for unselected portion */}
          <div
            className="absolute inset-0 bg-lxd-dark-surface/60 rounded-full"
            style={{
              left: `${value * 100}%`,
              transition: isDragging ? 'none' : 'left 0.15s ease-out',
            }}
          />
        </div>

        {/* Native range input (invisible, for accessibility) */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className={cn(
            'absolute inset-0 w-full opacity-0 cursor-pointer',
            disabled && 'cursor-not-allowed',
          )}
          aria-label="Confidence level"
        />

        {/* Custom thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-lg',
            thumbSizeClasses[size],
            level.color,
            isDragging && 'scale-110',
            'transition-transform duration-150',
            disabled && 'opacity-50',
          )}
          style={{
            left: `${value * 100}%`,
            transition: isDragging ? 'none' : 'left 0.15s ease-out',
          }}
        />
      </div>

      {/* Min/Max labels */}
      {showLabels && (
        <div className="flex justify-between mt-1 text-xs text-lxd-text-light-muted">
          <span>Guessing</span>
          <span>Certain</span>
        </div>
      )}
    </div>
  );
}
