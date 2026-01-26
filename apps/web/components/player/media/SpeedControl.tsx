'use client';

import { Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from './types';

/**
 * =============================================================================
 * LXD360 | SpeedControl Component
 * =============================================================================
 *
 * Dropdown speed control for media playback with options:
 * 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
 *
 * @version 1.0.0
 * @updated 2026-01-26
 */

export interface SpeedControlProps {
  /** Current playback rate */
  playbackRate: number;
  /** Called when playback rate changes */
  onPlaybackRateChange: (rate: number) => void;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show current speed as text */
  showLabel?: boolean;
  /** Accessible label */
  label?: string;
}

export function SpeedControl({
  playbackRate,
  onPlaybackRateChange,
  size = 'md',
  className,
  showLabel = false,
  label = 'Playback speed',
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

  const formatSpeed = (speed: number): string => {
    if (speed === 1) return 'Normal';
    return `${speed}x`;
  };

  const isSelected = (speed: PlaybackSpeed): boolean => {
    return Math.abs(playbackRate - speed) < 0.01;
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
            showLabel && 'w-auto px-3 gap-2',
            className,
          )}
          aria-label={`${label}: ${formatSpeed(playbackRate)}`}
        >
          <Gauge className={iconSizes[size]} />
          {showLabel && (
            <span className="font-mono text-sm">
              {playbackRate === 1 ? '1x' : `${playbackRate}x`}
            </span>
          )}
          {playbackRate !== 1 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
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
        {PLAYBACK_SPEEDS.map((speed) => (
          <DropdownMenuItem
            key={speed}
            onClick={() => onPlaybackRateChange(speed)}
            className={cn(
              'cursor-pointer rounded-md px-3 py-2 font-mono text-sm',
              'transition-all duration-200',
              isSelected(speed)
                ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span>{speed}x</span>
              {speed === 1 && <span className="ml-2 text-xs text-white/50">Normal</span>}
              {isSelected(speed) && (
                <svg
                  className="ml-2 h-4 w-4 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Selected"
                >
                  <title>Selected</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SpeedControl;
