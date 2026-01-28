'use client';

import {
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { usePersistentPlayer } from '@/hooks/use-persistent-player';
import { cn } from '@/lib/utils';
import {
  ModalitySwitcher,
  ModalitySwitcherCompact,
  type PlayerModality,
} from './modality-switcher';
import { SpeedControl } from './speed-control';

interface PersistentPlayerBarProps {
  /** Additional class names */
  className?: string;
  /** z-index for the bar */
  zIndex?: number;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * Persistent Player Bar Component
 *
 * A bottom bar that persists across navigation, showing:
 * - Thumbnail, title, and progress
 * - Play/pause and skip controls
 * - Modality switcher (Watch/Listen)
 * - Volume control
 * - Expand/collapse functionality
 *
 * Supports both minimized and expanded states with smooth animations.
 */
export function PersistentPlayerBar({
  className,
  zIndex = 50,
  onExpandedChange,
}: PersistentPlayerBarProps): React.JSX.Element | null {
  const player = usePersistentPlayer();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const previousVolume = React.useRef(1);
  const volumeTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const { contentAtom, modality, isPlaying, progress, formattedCurrentTime, formattedDuration } =
    player;

  // Handle expand/collapse
  const toggleExpanded = React.useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    player.setIsMinimized(!newExpanded);
    onExpandedChange?.(newExpanded);
  }, [isExpanded, player, onExpandedChange]);

  // Handle mute toggle
  const toggleMute = React.useCallback(() => {
    if (isMuted) {
      player.setVolume(previousVolume.current);
    } else {
      previousVolume.current = player.volume;
      player.setVolume(0);
    }
    setIsMuted(!isMuted);
  }, [isMuted, player]);

  // Volume slider hover handling
  const handleVolumeMouseEnter = React.useCallback(() => {
    if (volumeTimeout.current) {
      clearTimeout(volumeTimeout.current);
    }
    setShowVolumeSlider(true);
  }, []);

  const handleVolumeMouseLeave = React.useCallback(() => {
    volumeTimeout.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (volumeTimeout.current) {
        clearTimeout(volumeTimeout.current);
      }
    };
  }, []);

  // Don't render if no content or not visible
  if (!contentAtom || !player.isVisible) {
    return null;
  }

  return (
    <section
      className={cn(
        'fixed bottom-0 left-0 right-0 transition-all duration-300 ease-out',
        isExpanded ? 'h-auto' : 'h-20',
        className,
      )}
      style={{ zIndex }}
      aria-label="Media player"
    >
      {/* Backdrop blur background */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl border-t border-white/10" />

      {/* Progress bar (top edge) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-lxd-primary to-lxd-secondary transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Playback progress"
        />
      </div>

      <div className="relative h-full">
        {/* Minimized view */}
        <div
          className={cn(
            'flex h-20 items-center gap-4 px-4 transition-opacity duration-200',
            isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100',
          )}
        >
          {/* Thumbnail */}
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
            {contentAtom.thumbnail ? (
              <Image
                src={contentAtom.thumbnail}
                alt={contentAtom.title}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lxd-primary to-lxd-secondary">
                <Headphones className="h-7 w-7 text-white/80" aria-hidden="true" />
              </div>
            )}

            {/* Modality overlay for listen mode */}
            {modality === 'listen' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Headphones className="h-6 w-6 text-white animate-pulse" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Content info */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm font-medium text-white">{contentAtom.title}</span>
            {contentAtom.courseTitle && (
              <span className="truncate text-xs text-white/60">{contentAtom.courseTitle}</span>
            )}
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>{formattedCurrentTime}</span>
              <span>/</span>
              <span>{formattedDuration}</span>
            </div>
          </div>

          {/* Modality switcher (compact) */}
          <ModalitySwitcherCompact
            mode={modality === 'watch' ? 'video' : 'audio'}
            onModeChange={(m: PlayerModality) =>
              player.switchModality(m === 'video' ? 'watch' : 'listen')
            }
            hasAudio={!!contentAtom.audioSrc}
            hasVideo={!!contentAtom.videoSrc}
          />

          {/* Speed control */}
          <SpeedControl
            speed={player.playbackRate}
            onSpeedChange={(rate) => player.setPlaybackRate(rate)}
            size="sm"
          />

          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => player.seekRelative(-10)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => player.togglePlayPause()}
              className="rounded-full bg-white p-3 text-black transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => player.seekRelative(10)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Volume control */}
          <fieldset
            className="relative flex items-center border-0 p-0 m-0"
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
            aria-label="Volume controls"
          >
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || player.volume === 0 ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {/* Volume slider popup */}
            <div
              className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg bg-black/90 backdrop-blur-xl border border-white/10 transition-all duration-200',
                showVolumeSlider
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-2 pointer-events-none',
              )}
            >
              <Slider
                value={[player.volume * 100]}
                max={100}
                step={1}
                orientation="vertical"
                onValueChange={(value) => {
                  player.setVolume(value[0] / 100);
                  setIsMuted(value[0] === 0);
                }}
                className="h-24"
                aria-label="Volume"
              />
            </div>
          </fieldset>

          {/* Expand/Close buttons */}
          <button
            type="button"
            onClick={toggleExpanded}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Expand player"
          >
            <Maximize2 className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => player.close()}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close player"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Expanded view */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col p-4 transition-all duration-300',
            isExpanded
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none translate-y-4',
          )}
        >
          {/* Header with collapse button */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/60">Now Playing</span>
            <button
              type="button"
              onClick={toggleExpanded}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Minimize player"
            >
              <Minimize2 className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Main content */}
          <div className="flex items-start gap-6">
            {/* Large thumbnail */}
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-white/5 shadow-2xl">
              {contentAtom.thumbnail ? (
                <Image
                  src={contentAtom.thumbnail}
                  alt={contentAtom.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lxd-primary to-lxd-secondary">
                  <Headphones className="h-12 w-12 text-white/80" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Content info and controls */}
            <div className="flex flex-1 flex-col gap-4">
              {/* Title and course */}
              <div>
                <h3 className="text-lg font-semibold text-white">{contentAtom.title}</h3>
                {contentAtom.courseTitle && (
                  <p className="text-sm text-white/60">{contentAtom.courseTitle}</p>
                )}
              </div>

              {/* Modality switcher */}
              <ModalitySwitcher
                mode={modality === 'watch' ? 'video' : 'audio'}
                onModeChange={(m: PlayerModality) =>
                  player.switchModality(m === 'video' ? 'watch' : 'listen')
                }
                hasAudio={!!contentAtom.audioSrc}
                hasVideo={!!contentAtom.videoSrc}
                size="md"
              />

              {/* Progress slider */}
              <div className="flex items-center gap-3">
                <span className="w-12 text-xs text-white/60 text-right">
                  {formattedCurrentTime}
                </span>
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={(value) => {
                    const newTime = (value[0] / 100) * player.duration;
                    player.seek(newTime);
                  }}
                  className="flex-1"
                  aria-label="Seek"
                />
                <span className="w-12 text-xs text-white/60">{formattedDuration}</span>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                {/* Playback controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => player.seekRelative(-10)}
                    className="rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Skip backward 10 seconds"
                  >
                    <SkipBack className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => player.togglePlayPause()}
                    className="rounded-full bg-white p-4 text-black transition-transform hover:scale-105 active:scale-95"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Play className="h-6 w-6 translate-x-0.5" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => player.seekRelative(10)}
                    className="rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Speed control */}
                <SpeedControl
                  speed={player.playbackRate}
                  onSpeedChange={(rate) => player.setPlaybackRate(rate)}
                  size="md"
                  showLabel
                />

                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || player.volume === 0 ? (
                      <VolumeX className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  <Slider
                    value={[player.volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      player.setVolume(value[0] / 100);
                      setIsMuted(value[0] === 0);
                    }}
                    className="w-24"
                    aria-label="Volume"
                  />
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => player.close()}
                  className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close player"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

PersistentPlayerBar.displayName = 'PersistentPlayerBar';
