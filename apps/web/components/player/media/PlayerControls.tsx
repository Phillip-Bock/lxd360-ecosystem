'use client';

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SpeedControl } from './SpeedControl';
import type { MediaPlayerMachine } from './types';

/**
 * =============================================================================
 * LXD360 | PlayerControls Component
 * =============================================================================
 *
 * Unified control bar for media playback with:
 * - Play/Pause button
 * - Skip forward/backward buttons
 * - Volume control with slider
 * - Playback speed control
 * - Fullscreen toggle
 *
 * @version 1.0.0
 * @updated 2026-01-26
 */

export interface PlayerControlsProps {
  /** Player machine from usePlayer hook */
  machine: MediaPlayerMachine;
  /** Show skip forward/backward buttons */
  showSkipButtons?: boolean;
  /** Show volume control */
  showVolumeControl?: boolean;
  /** Show playback speed control */
  showSpeedControl?: boolean;
  /** Show fullscreen button */
  showFullscreenButton?: boolean;
  /** Skip amount in seconds */
  skipAmount?: number;
  /** Compact mode (smaller buttons) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

export function PlayerControls({
  machine,
  showSkipButtons = true,
  showVolumeControl = true,
  showSpeedControl = true,
  showFullscreenButton = true,
  skipAmount = 10,
  compact = false,
  className,
  label = 'Media player controls',
}: PlayerControlsProps): React.JSX.Element {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const buttonSize = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
  const playIconSize = compact ? 'h-5 w-5' : 'h-6 w-6';

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      machine.setVolume(value[0] / 100);
    },
    [machine],
  );

  const handleVolumeButtonClick = useCallback(() => {
    machine.toggleMute();
  }, [machine]);

  const handleVolumeButtonMouseEnter = useCallback(() => {
    setShowVolumeSlider(true);
  }, []);

  const handleVolumeContainerMouseLeave = useCallback(() => {
    setShowVolumeSlider(false);
  }, []);

  return (
    <div
      className={cn('flex items-center justify-between gap-2', className)}
      role="toolbar"
      aria-label={label}
    >
      {/* Left Controls */}
      <div className="flex items-center gap-1">
        {showSkipButtons && (
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'text-white/70 hover:bg-white/10 hover:text-cyan-400 transition-all duration-300',
              'focus-visible:ring-2 focus-visible:ring-cyan-500/50',
              buttonSize,
            )}
            onClick={() => machine.skipBackward(skipAmount)}
            aria-label={`Skip backward ${skipAmount} seconds`}
          >
            <SkipBack className={iconSize} />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          className={cn(
            'relative text-white hover:bg-cyan-500/20 hover:text-cyan-400 transition-all duration-300',
            'focus-visible:ring-2 focus-visible:ring-cyan-500/50',
            'shadow-[0_0_15px_rgba(0,212,255,0.3)]',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}
          onClick={machine.togglePlayPause}
          aria-label={machine.isPlaying ? 'Pause' : 'Play'}
        >
          {machine.isPlaying ? (
            <Pause className={cn(playIconSize, 'fill-current')} />
          ) : (
            <Play className={cn(playIconSize, 'fill-current')} />
          )}
        </Button>

        {showSkipButtons && (
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'text-white/70 hover:bg-white/10 hover:text-cyan-400 transition-all duration-300',
              'focus-visible:ring-2 focus-visible:ring-cyan-500/50',
              buttonSize,
            )}
            onClick={() => machine.skipForward(skipAmount)}
            aria-label={`Skip forward ${skipAmount} seconds`}
          >
            <SkipForward className={iconSize} />
          </Button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {showVolumeControl && (
          <div
            className="relative flex items-center"
            onMouseLeave={handleVolumeContainerMouseLeave}
          >
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                showVolumeSlider ? 'w-24 opacity-100 mr-2' : 'w-0 opacity-0',
              )}
            >
              <Slider
                value={[machine.isMuted ? 0 : machine.volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className={cn(
                  'w-full',
                  '[&_[data-slot=slider-track]]:bg-white/20',
                  '[&_[data-slot=slider-range]]:bg-cyan-500',
                  '[&_[data-slot=slider-thumb]]:border-cyan-500 [&_[data-slot=slider-thumb]]:bg-white',
                )}
                aria-label="Volume"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              className={cn(
                'text-white/70 hover:bg-white/10 hover:text-cyan-400 transition-all duration-300',
                'focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                buttonSize,
              )}
              onClick={handleVolumeButtonClick}
              onMouseEnter={handleVolumeButtonMouseEnter}
              aria-label={machine.isMuted ? 'Unmute' : 'Mute'}
            >
              {machine.isMuted || machine.volume === 0 ? (
                <VolumeX className={iconSize} />
              ) : (
                <Volume2 className={iconSize} />
              )}
            </Button>
          </div>
        )}

        {showSpeedControl && (
          <SpeedControl
            playbackRate={machine.playbackRate}
            onPlaybackRateChange={machine.setPlaybackRate}
            size={compact ? 'sm' : 'md'}
          />
        )}

        {showFullscreenButton && (
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'text-white/70 hover:bg-white/10 hover:text-cyan-400 transition-all duration-300',
              'focus-visible:ring-2 focus-visible:ring-cyan-500/50',
              buttonSize,
            )}
            onClick={() => void machine.toggleFullscreen()}
            aria-label={machine.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {machine.isFullscreen ? (
              <Minimize className={iconSize} />
            ) : (
              <Maximize className={iconSize} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default PlayerControls;
