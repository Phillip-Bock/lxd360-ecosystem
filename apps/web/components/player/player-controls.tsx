'use client';

import { motion } from 'framer-motion';
import {
  Captions,
  Check,
  Gauge,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { PlayerState } from '@/types/player';

interface PlayerControlsProps {
  state: PlayerState;
  setState: React.Dispatch<React.SetStateAction<PlayerState>>;
  currentSlideIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToSlide: (index: number) => void;
  onToggleFullscreen: () => void;
  /** Whether the current slide is marked as complete */
  isSlideCompleted?: boolean;
  /** Callback when mark complete button is clicked */
  onMarkComplete?: () => void;
}

export function PlayerControls({
  state,
  setState,
  currentSlideIndex,
  totalSlides,
  onPrev,
  onNext,
  onGoToSlide,
  onToggleFullscreen,
  isSlideCompleted = false,
  onMarkComplete,
}: PlayerControlsProps) {
  const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="relative z-20 border-t border-[var(--hud-border)] bg-[var(--hud-glass-bg)] px-4 py-3 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-transparent via-[var(--hud-accent)]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] energy-bar" />

      <div className="mb-3">
        <div className="group relative h-2 w-full cursor-pointer rounded-full bg-[var(--hud-bg-secondary)]/80 border border-[var(--hud-border)] backdrop-blur-xs overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-linear-to-r from-[var(--hud-accent)]/10 via-[var(--hud-accent-green)]/10 to-[var(--hud-accent)]/10 blur-sm" />

          <motion.div
            className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-[var(--hud-accent)] via-[var(--hud-accent-bright)] to-[var(--hud-accent-green)]" />
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <div className="absolute inset-0 shadow-[0_0_20px_rgba(0,229,255,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]" />
          </motion.div>

          {/* Clickable Segments */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => onGoToSlide(i)}
                className="flex-1 hover:bg-[var(--hud-accent)]/20 transition-colors"
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <motion.div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-brand-surface border-2 border-[var(--hud-accent)] opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${progressPercentage}%`,
              marginLeft: '-8px',
              boxShadow: '0 0 20px rgba(0,229,255,0.8), 0 0 40px rgba(0,229,255,0.4)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 15px rgba(0,229,255,0.6)',
                '0 0 30px rgba(0,229,255,1)',
                '0 0 15px rgba(0,229,255,0.6)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
              className="relative text-[var(--hud-text)] hover:bg-[var(--hud-accent)]/20 hover:text-[var(--hud-accent-bright)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>
          </motion.div>

          {/* Skip Controls */}
          <motion.div whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              disabled={currentSlideIndex === 0}
              className="text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-accent-bright)] disabled:opacity-20 transition-all duration-300"
              aria-label="Previous slide"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1, x: 2 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={currentSlideIndex === totalSlides - 1}
              className="text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-accent-bright)] disabled:opacity-20 transition-all duration-300"
              aria-label="Next slide"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="ml-3 flex items-center gap-1.5 rounded-full glass-panel px-3 py-1 border border-[var(--hud-border)]">
            <span className="text-sm font-bold text-gradient-cyan font-mono tracking-wider">
              {currentSlideIndex + 1}
            </span>
            <span className="text-xs text-[var(--hud-text-muted)]">/</span>
            <span className="text-sm font-mono text-[var(--hud-text-muted)]">{totalSlides}</span>
          </div>
        </div>

        {/* Center - Mark Complete Button */}
        <div className="flex items-center gap-4">
          {onMarkComplete && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkComplete}
                disabled={isSlideCompleted}
                className={cn(
                  'gap-2 font-medium transition-all duration-300',
                  isSlideCompleted
                    ? 'bg-[var(--hud-accent-green,#22c55e)]/20 text-[var(--hud-accent-green,#22c55e)] border border-[var(--hud-accent-green,#22c55e)]/30 cursor-default'
                    : 'bg-[var(--hud-accent)]/10 text-[var(--hud-accent-bright)] hover:bg-[var(--hud-accent)]/20 border border-[var(--hud-accent)]/20',
                )}
                aria-label={isSlideCompleted ? 'Slide completed' : 'Mark slide as complete'}
              >
                <Check
                  className={cn(
                    'h-4 w-4',
                    isSlideCompleted && 'text-[var(--hud-accent-green,#22c55e)]',
                  )}
                />
                <span className="hidden sm:inline">
                  {isSlideCompleted ? 'Completed' : 'Mark Complete'}
                </span>
              </Button>
            </motion.div>
          )}

          {/* Time/Duration (hidden on mobile) */}
          <div className="hidden text-sm font-mono text-[var(--hud-text-muted)] md:flex items-center gap-2 glass-panel px-3 py-1 rounded-full border border-[var(--hud-border)]">
            <span className="text-[var(--hud-accent-bright)]">--:--</span>
            <span className="text-[var(--hud-accent)]/50">•</span>
            <span>--:--</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          {/* Volume */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-accent-bright)] transition-all duration-300"
                  aria-label="Volume"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent
              className="w-40 border-[var(--hud-border)] bg-[var(--hud-glass-bg)] backdrop-blur-xl glass-panel"
              align="end"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setState((prev) => ({ ...prev, isMuted: !prev.isMuted }))}
                  className="h-8 w-8 text-[var(--hud-text-muted)] hover:text-[var(--hud-accent-bright)]"
                >
                  {state.isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[state.isMuted ? 0 : state.volume * 100]}
                  onValueChange={([v]) =>
                    setState((prev) => ({ ...prev, volume: v / 100, isMuted: false }))
                  }
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Playback Speed */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-accent-bright)] transition-all duration-300"
                  aria-label="Playback speed"
                >
                  <Gauge className="h-4 w-4" />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent
              className="w-32 border-[var(--hud-border)] bg-[var(--hud-glass-bg)] backdrop-blur-xl glass-panel p-1"
              align="end"
            >
              {playbackSpeeds.map((speed) => (
                <motion.button
                  key={speed}
                  onClick={() => setState((prev) => ({ ...prev, playbackSpeed: speed }))}
                  className={cn(
                    'w-full rounded px-3 py-2 text-left text-sm transition-all duration-200 font-mono',
                    state.playbackSpeed === speed
                      ? 'bg-[var(--hud-accent)]/30 text-[var(--hud-accent-bright)] font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-text)]',
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {speed}x
                </motion.button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Captions */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setState((prev) => ({ ...prev, showCaptions: !prev.showCaptions }))}
              className={cn(
                'text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-accent-bright)] transition-all duration-300',
                state.showCaptions &&
                  'bg-[var(--hud-accent)]/25 text-[var(--hud-accent-bright)] shadow-[0_0_15px_rgba(0,229,255,0.3)]',
              )}
              aria-label="Toggle captions"
            >
              <Captions className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Fullscreen */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/15 hover:text-[var(--hud-accent-bright)] transition-all duration-300"
              aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {state.isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
