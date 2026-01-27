'use client';

/**
 * =============================================================================
 * LXD360 | VideoPlayer Component
 * =============================================================================
 *
 * Video player component that integrates with the player state machine.
 * Neural-futuristic theme with cyan/purple accents, WCAG 2.2 AA compliant.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { AlertCircle, Loader2, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * VideoPlayer component props
 */
export interface VideoPlayerProps {
  /** Video source URL */
  src: string;
  /** Optional poster image */
  poster?: string;
  /** Current playback time in seconds */
  currentTime: number;
  /** Playback speed multiplier */
  playbackSpeed: number;
  /** Whether video is playing */
  isPlaying: boolean;
  /** Called when video time updates */
  onTimeUpdate: (time: number) => void;
  /** Called when video ends */
  onEnded: () => void;
  /** Called when video can play */
  onCanPlay?: () => void;
  /** Called when video is buffering */
  onBuffering?: () => void;
  /** Called when buffering ends */
  onBuffered?: () => void;
  /** Called when video loads metadata */
  onLoadedMetadata?: (duration: number) => void;
  /** Called when video progress changes (buffered) */
  onProgress?: (bufferedPercent: number) => void;
  /** Called on error */
  onError?: (message: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Accessible title */
  title?: string;
}

/**
 * VideoPlayer - Controlled video player component
 *
 * Integrates with usePlayer() hook for state management.
 * Features neural-futuristic styling with keyboard accessibility.
 */
export function VideoPlayer({
  src,
  poster,
  currentTime,
  playbackSpeed,
  isPlaying,
  onTimeUpdate,
  onEnded,
  onCanPlay,
  onBuffering,
  onBuffered,
  onLoadedMetadata,
  onProgress,
  onError,
  className,
  title = 'Video player',
}: VideoPlayerProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Sync play state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        // Handle autoplay restrictions
        if (err.name === 'NotAllowedError') {
          setShowPlayButton(true);
        }
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Sync playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.playbackRate !== playbackSpeed) {
      video.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync current time (only if difference is significant to avoid loops)
  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // Event handlers
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      onTimeUpdate(video.currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      onLoadedMetadata?.(video.duration);
    }
  }, [onLoadedMetadata]);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    setShowPlayButton(!isPlaying);
    onBuffered?.();
    onCanPlay?.();
  }, [isPlaying, onBuffered, onCanPlay]);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
    onBuffering?.();
  }, [onBuffering]);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.buffered.length || !video.duration) return;
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / video.duration) * 100;
    onProgress?.(bufferedPercent);
  }, [onProgress]);

  const handleEnded = useCallback(() => {
    setShowPlayButton(true);
    onEnded();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const video = videoRef.current;
    const message = video?.error?.message ?? 'An error occurred while playing the video';
    setError(message);
    setIsBuffering(false);
    onError?.(message);
  }, [onError]);

  const handlePlay = useCallback(() => {
    setShowPlayButton(false);
    setError(null);
  }, []);

  const handlePause = useCallback(() => {
    setShowPlayButton(true);
  }, []);

  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        // Autoplay blocked, show play button
        setShowPlayButton(true);
      });
    } else {
      video.pause();
    }
  }, []);

  const handleRetry = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setError(null);
      video.load();
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg bg-black',
        'focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:ring-offset-2 focus-within:ring-offset-black',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        poster={poster}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
        <track kind="captions" src="data:text/vtt,WEBVTT" srcLang="en" label="English" default />
        Your browser does not support the video tag.
      </video>

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full',
              'bg-black/50 backdrop-blur-sm',
            )}
          >
            <Loader2
              className={cn('h-8 w-8 text-cyan-400', !prefersReducedMotion && 'animate-spin')}
              aria-hidden="true"
            />
            <span className="sr-only">Loading video</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" aria-hidden="true" />
          <p className="mb-4 text-sm text-white/80">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {/* Play button overlay */}
      {showPlayButton && !isBuffering && !error && (
        <button
          type="button"
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/30 transition-opacity hover:bg-black/40',
            prefersReducedMotion ? '' : 'duration-200',
          )}
          onClick={handleClick}
          aria-label="Play video"
        >
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full',
              'bg-cyan-500/80 shadow-[0_0_40px_rgba(0,212,255,0.5)] backdrop-blur-sm',
              !prefersReducedMotion && 'transition-transform hover:scale-110',
            )}
          >
            <Play className="ml-1 h-10 w-10 text-white" fill="currentColor" aria-hidden="true" />
          </div>
        </button>
      )}
    </section>
  );
}

export default VideoPlayer;
