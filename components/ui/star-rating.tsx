import { Star } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * =============================================================================
 * LXP360-SaaS | Star Rating Component
 * =============================================================================
 *
 * @fileoverview A visual star rating component with support for partial stars
 * and multiple sizes.
 *
 * @version      1.0.0
 * @updated      2025-12-20
 *
 * =============================================================================
 */

type StarRatingSize = 'sm' | 'md' | 'lg';
type StarRatingOrientation = 'vertical' | 'horizontal';

interface StarRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
  label?: string;
  size?: StarRatingSize;
  orientation?: StarRatingOrientation;
  allowPartial?: boolean;
  containerClassName?: string;
}

const sizeClasses: Record<StarRatingSize, string> = {
  sm: '[--star-size:0.75rem]',
  md: '[--star-size:1rem]',
  lg: '[--star-size:1.25rem]',
};

export function StarRating({
  value,
  max = 5,
  label,
  size = 'lg',
  orientation = 'vertical',
  allowPartial = true,
  className,
  containerClassName,
  ...props
}: StarRatingProps): React.JSX.Element {
  const safeMax = Math.max(1, Math.floor(max));
  const clampedValue = Math.max(0, Math.min(value, safeMax));

  return (
    <div
      data-slot="star-rating"
      className={cn(
        'flex flex-col items-center gap-1.5',
        orientation === 'horizontal' && 'flex-row',
        sizeClasses[size],
        containerClassName,
      )}
      aria-label={`${clampedValue} out of ${safeMax} stars`}
      role="img"
      {...props}
    >
      <div className={cn('flex items-center gap-0.5', className)}>
        {Array.from({ length: safeMax }).map((_, index) => {
          const filledRatio = allowPartial
            ? Math.max(0, Math.min(1, clampedValue - index))
            : clampedValue >= index + 1
              ? 1
              : 0;

          return (
            <span key={index} className="relative inline-flex text-primary" aria-hidden="true">
              <Star className="h-[var(--star-size)] w-[var(--star-size)] text-muted-foreground/30" />
              {filledRatio > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${filledRatio * 100}%` }}
                >
                  <Star fill="currentColor" className="h-[var(--star-size)] w-[var(--star-size)]" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {label && <span className="text-muted-foreground text-xs font-normal">{label}</span>}
    </div>
  );
}
