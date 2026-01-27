'use client';

/**
 * =============================================================================
 * LXD360 | SpeedControl Component
 * =============================================================================
 *
 * Dropdown for selecting playback speed.
 * Options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { Check, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Available playback speeds
 */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/**
 * SpeedControl component props
 */
export interface SpeedControlProps {
  /** Current playback speed */
  speed: number;
  /** Called when speed changes */
  onSpeedChange: (speed: number) => void;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show current speed as text label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SpeedControl - Playback speed selector dropdown
 *
 * Neural-futuristic styling with smooth animations.
 * WCAG 2.2 AA compliant.
 */
export function SpeedControl({
  speed,
  onSpeedChange,
  size = 'md',
  showLabel = false,
  className,
}: SpeedControlProps): React.JSX.Element {
  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const isSelected = (s: PlaybackSpeed): boolean => {
    return Math.abs(speed - s) < 0.01;
  };

  const formatSpeed = (s: number): string => {
    if (s === 1) return '1x';
    return `${s}x`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'relative transition-all duration-300',
            'text-white/70 hover:bg-white/10 hover:text-cyan-400',
            'focus-visible:ring-2 focus-visible:ring-cyan-500/50',
            buttonSizes[size],
            showLabel && 'w-auto gap-2 px-3',
            className,
          )}
          aria-label={`Playback speed: ${formatSpeed(speed)}`}
        >
          <Gauge className={iconSizes[size]} aria-hidden="true" />
          {showLabel && <span className="font-mono text-sm">{formatSpeed(speed)}</span>}
          {/* Indicator dot when not 1x */}
          {speed !== 1 && (
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.8)]"
              aria-hidden="true"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className={cn(
          'min-w-[120px] border-white/10 bg-black/90 p-1 backdrop-blur-xl',
          'shadow-[0_0_20px_rgba(0,212,255,0.2)]',
        )}
      >
        {PLAYBACK_SPEEDS.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              'cursor-pointer rounded-md px-3 py-2 font-mono text-sm',
              'transition-all duration-200',
              isSelected(s)
                ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2">
                <span>{s}x</span>
                {s === 1 && <span className="text-xs text-white/50">Normal</span>}
              </span>
              {isSelected(s) && <Check className="h-4 w-4 text-cyan-400" aria-hidden="true" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SpeedControl;
