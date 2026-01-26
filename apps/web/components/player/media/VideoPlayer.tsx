'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import type { CaptionTrack, MediaPlayerMachine, VideoSource } from './types';
import { formatTime, KEYBOARD_SHORTCUTS } from './types';

/**
 * =============================================================================
 * LXD360 | VideoPlayer Component
 * =============================================================================
 *
 * HTML5 video player with custom controls, neural-futuristic theme styling,
 * and full keyboard accessibility.
 *
 * @version 1.0.0
 * @updated 2026-01-26
 */

export interface VideoPlayerProps {
  /** Video source(s) */
  src: string | VideoSource[];
  /** Optional poster image */
  poster?: string;
  /** Caption tracks */
  captions?: CaptionTrack[];
  /** Player machine from usePlayer hook */
  machine?: MediaPlayerMachine;
  /** Auto-play video on mount */
  autoPlay?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Show controls */
  showControls?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Called when video ends */
  onEnded?: () => void;
  /** Called when video time updates */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Called when video can play */
  onCanPlay?: () => void;
  /** Accessible title for the video */
  title?: string;
}

export function VideoPlayer({
  src,
  poster,
  captions = [],
  machine,
  autoPlay = false,
  loop = false,
  showControls = true,
  className,
  onEnded,
  onTimeUpdate,
  onCanPlay,
  title = 'Video player',
}: VideoPlayerProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [internalState, setInternalState] = useState({
    isPlaying: false,
    isPaused: true,
    isMuted: false,
    isBuffering: false,
    isEnded: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    buffered: 0,
    isFullscreen: false,
    error: null as string | null,
  });

  const state = machine ?? {
    ...internalState,
    play: () => {
      void videoRef.current?.play();
    },
    pause: () => {
      videoRef.current?.pause();
    },
    togglePlayPause: () => {
      if (videoRef.current?.paused) {
        void videoRef.current.play();
      } else {
        videoRef.current?.pause();
      }
    },
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    setVolume: (volume: number) => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
        setInternalState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
      }
    },
    toggleMute: () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setInternalState((prev) => ({ ...prev, isMuted: videoRef.current?.muted ?? false }));
      }
    },
    setPlaybackRate: (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setInternalState((prev) => ({ ...prev, playbackRate: rate }));
      }
    },
    toggleFullscreen: async () => {
      if (!containerRef.current) return;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    },
    skipForward: (seconds = 10) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          videoRef.current.currentTime + seconds,
          videoRef.current.duration,
        );
      }
    },
    skipBackward: (seconds = 10) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - seconds, 0);
      }
    },
  };

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setInternalState((prev) => ({
      ...prev,
      currentTime: video.currentTime,
      duration: video.duration || 0,
    }));
    onTimeUpdate?.(video.currentTime, video.duration || 0);
  }, [onTimeUpdate]);

  const handlePlay = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isPlaying: true, isPaused: false, isEnded: false }));
  }, []);

  const handlePause = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
  }, []);

  const handleEnded = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isPlaying: false, isPaused: true, isEnded: true }));
    onEnded?.();
  }, [onEnded]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setInternalState((prev) => ({ ...prev, duration: video.duration }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isBuffering: false }));
    onCanPlay?.();
  }, [onCanPlay]);

  const handleWaiting = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isBuffering: true }));
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.buffered.length) return;
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / video.duration) * 100;
    setInternalState((prev) => ({ ...prev, buffered: bufferedPercent }));
  }, []);

  const handleVolumeChange = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setInternalState((prev) => ({ ...prev, volume: video.volume, isMuted: video.muted }));
  }, []);

  const handleError = useCallback(() => {
    const video = videoRef.current;
    const error = video?.error?.message ?? 'An error occurred while playing the video';
    setInternalState((prev) => ({ ...prev, error, isBuffering: false }));
  }, []);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setInternalState((prev) => ({
        ...prev,
        isFullscreen: document.fullscreenElement === containerRef.current,
      }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      switch (e.key) {
        case KEYBOARD_SHORTCUTS.TOGGLE_PLAY:
        case KEYBOARD_SHORTCUTS.TOGGLE_PLAY_K:
          e.preventDefault();
          state.togglePlayPause();
          break;
        case KEYBOARD_SHORTCUTS.SEEK_FORWARD:
          e.preventDefault();
          state.skipForward(e.shiftKey ? 30 : 10);
          break;
        case KEYBOARD_SHORTCUTS.SEEK_BACKWARD:
          e.preventDefault();
          state.skipBackward(e.shiftKey ? 30 : 10);
          break;
        case KEYBOARD_SHORTCUTS.VOLUME_UP:
          e.preventDefault();
          state.setVolume(Math.min(state.volume + 0.1, 1));
          break;
        case KEYBOARD_SHORTCUTS.VOLUME_DOWN:
          e.preventDefault();
          state.setVolume(Math.max(state.volume - 0.1, 0));
          break;
        case KEYBOARD_SHORTCUTS.TOGGLE_MUTE:
          e.preventDefault();
          state.toggleMute();
          break;
        case KEYBOARD_SHORTCUTS.TOGGLE_FULLSCREEN:
          e.preventDefault();
          void state.toggleFullscreen();
          break;
        case KEYBOARD_SHORTCUTS.DECREASE_SPEED:
          e.preventDefault();
          state.setPlaybackRate(Math.max(state.playbackRate - 0.25, 0.25));
          break;
        case KEYBOARD_SHORTCUTS.INCREASE_SPEED:
          e.preventDefault();
          state.setPlaybackRate(Math.min(state.playbackRate + 0.25, 2));
          break;
        case KEYBOARD_SHORTCUTS.SEEK_TO_START:
          e.preventDefault();
          state.seek(0);
          break;
        case KEYBOARD_SHORTCUTS.SEEK_TO_END:
          e.preventDefault();
          state.seek(state.duration);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state]);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (state.isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [state.isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying) {
      setControlsVisible(false);
    }
  }, [state.isPlaying]);

  useEffect(() => {
    if (!state.isPlaying) {
      setControlsVisible(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }
  }, [state.isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const sources = typeof src === 'string' ? [{ src, type: 'video/mp4' }] : src;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg bg-black',
        'focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:ring-offset-2 focus-within:ring-offset-black',
        state.isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label={title}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onProgress={handleProgress}
        onVolumeChange={handleVolumeChange}
        onError={handleError}
        aria-label={title}
      >
        {sources.map((source, index) => (
          <source key={`${source.src}-${index}`} src={source.src} type={source.type} />
        ))}
        {captions.map((track) => (
          <track
            key={track.srclang}
            kind="captions"
            src={track.src}
            srcLang={track.srclang}
            label={track.label}
            default={track.default}
          />
        ))}
        <track kind="captions" src="data:text/vtt,WEBVTT" srcLang="en" label="English (default)" />
        Your browser does not support the video tag.
      </video>

      {state.isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      )}

      {state.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <svg
            className="mb-4 h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-label="Error"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      {!state.isPlaying && !state.isBuffering && !state.error && (
        <button
          type="button"
          onClick={state.togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
          aria-label="Play video"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/80 shadow-[0_0_40px_rgba(0,212,255,0.5)] backdrop-blur-sm transition-transform hover:scale-110">
            <svg
              className="ml-1 h-10 w-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Play"
            >
              <title>Play</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      <div
        className={cn(
          'absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-sm text-white backdrop-blur-sm transition-opacity',
          controlsVisible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {formatTime(state.currentTime)} / {formatTime(state.duration)}
      </div>

      {showControls && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300',
            controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ProgressBar
            currentTime={state.currentTime}
            duration={state.duration}
            buffered={state.buffered}
            onSeek={state.seek}
          />
          <div className="mt-3">
            <PlayerControls
              machine={state}
              showSkipButtons
              showVolumeControl
              showSpeedControl
              showFullscreenButton
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
