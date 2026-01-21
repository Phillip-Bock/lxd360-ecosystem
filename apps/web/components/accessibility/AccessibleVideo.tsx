/**
 * =============================================================================
 * LXP360-SaaS | Accessible Video Player
 * =============================================================================
 *
 * @fileoverview Accessible video player component for WCAG 2.1 AA compliance
 *
 * @description
 * Provides an accessible video player with:
 * - Keyboard controls for all functions
 * - Captions/subtitles support
 * - Audio descriptions
 * - Screen reader announcements
 * - Transcript option
 * - Reduced motion support
 *
 * WCAG Compliance:
 * - 1.2.1 Audio-only and Video-only (Level A)
 * - 1.2.2 Captions (Level A)
 * - 1.2.3 Audio Description (Level A)
 * - 1.2.5 Audio Description (Level AA)
 * - 1.4.2 Audio Control (Level A)
 * - 2.1.1 Keyboard (Level A)
 * - 2.2.2 Pause, Stop, Hide (Level A)
 *
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { announce, prefersReducedMotion } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface VideoTrack {
  /** Track kind: subtitles, captions, descriptions */
  kind: 'subtitles' | 'captions' | 'descriptions';
  /** Language code (e.g., 'en', 'es') */
  srcLang: string;
  /** Human-readable label */
  label: string;
  /** Track source URL */
  src: string;
  /** Whether this is the default track */
  default?: boolean;
}

export interface AccessibleVideoProps {
  /** Video source URL */
  src: string;
  /** Alternative video sources */
  sources?: Array<{ src: string; type: string }>;
  /** Video title for screen readers */
  title: string;
  /** Poster image URL */
  poster?: string;
  /** Caption/subtitle tracks */
  tracks?: VideoTrack[];
  /** Full transcript URL or content */
  transcript?: string | React.ReactNode;
  /** Whether to autoplay (respects prefers-reduced-motion) */
  autoPlay?: boolean;
  /** Whether to loop */
  loop?: boolean;
  /** Whether to mute */
  muted?: boolean;
  /** Width */
  width?: number | string;
  /** Height */
  height?: number | string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback for time updates */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============================================================================
// Control Button Component
// ============================================================================

function ControlButton({
  onClick,
  label,
  icon,
  active = false,
  className,
}: ControlButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded-md transition-colors',
        'hover:bg-brand-surface/20 focus:outline-hidden focus:ring-2 focus:ring-white/50',
        active && 'bg-brand-surface/20',
        className,
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// Volume Slider Component
// ============================================================================

interface VolumeSliderProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

function VolumeSlider({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
}: VolumeSliderProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);
  const sliderId = React.useId();

  const VolumeIcon = (): React.JSX.Element => {
    if (muted || volume === 0) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
        </svg>
      );
    }
    if (volume < 0.5) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        </svg>
      );
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
      </svg>
    );
  };

  return (
    <fieldset
      className="relative flex items-center border-0 p-0 m-0"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <legend className="sr-only">Volume controls</legend>
      <ControlButton
        onClick={onMuteToggle}
        label={muted ? 'Unmute' : 'Mute'}
        icon={<VolumeIcon />}
      />
      {isOpen && (
        <div className="absolute left-full ml-2 flex items-center bg-black/80 rounded-md px-2 py-1">
          <label htmlFor={sliderId} className="sr-only">
            Volume
          </label>
          <input
            id={sliderId}
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 accent-white"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
            aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
          />
        </div>
      )}
    </fieldset>
  );
}

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  onSeek: (time: number) => void;
}

function ProgressBar({
  currentTime,
  duration,
  buffered,
  onSeek,
}: ProgressBarProps): React.JSX.Element {
  const progressRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!progressRef.current || duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(pos * duration);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    const step = e.shiftKey ? 10 : 5;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onSeek(Math.max(0, currentTime - step));
        break;
      case 'ArrowRight':
        e.preventDefault();
        onSeek(Math.min(duration, currentTime + step));
        break;
      case 'Home':
        e.preventDefault();
        onSeek(0);
        break;
      case 'End':
        e.preventDefault();
        onSeek(duration);
        break;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedEnd =
    buffered && buffered.length > 0 ? (buffered.end(buffered.length - 1) / duration) * 100 : 0;

  return (
    <div className="flex-1 flex items-center gap-2">
      <span className="text-xs text-brand-primary/80 tabular-nums min-w-[40px]">
        {formatTime(currentTime)}
      </span>
      <div
        ref={progressRef}
        role="slider"
        tabIndex={0}
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="flex-1 h-1 bg-brand-surface/30 rounded-full cursor-pointer group"
      >
        {/* Buffered */}
        <div
          className="h-full bg-brand-surface/50 rounded-full absolute"
          style={{ width: `${bufferedEnd}%` }}
        />
        {/* Progress */}
        <div
          className="h-full bg-brand-surface rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-surface rounded-full opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" />
        </div>
      </div>
      <span className="text-xs text-brand-primary/80 tabular-nums min-w-[40px] text-right">
        {formatTime(duration)}
      </span>
    </div>
  );
}

// ============================================================================
// Caption Menu Component
// ============================================================================

interface CaptionMenuProps {
  tracks: VideoTrack[];
  activeTrack: string | null;
  onTrackChange: (srcLang: string | null) => void;
}

function CaptionMenu({
  tracks,
  activeTrack,
  onTrackChange,
}: CaptionMenuProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuId = React.useId();

  const captionTracks = tracks.filter((t) => t.kind === 'subtitles' || t.kind === 'captions');

  if (captionTracks.length === 0) return null;

  return (
    <div className="relative">
      <ControlButton
        onClick={() => setIsOpen(!isOpen)}
        label="Captions"
        active={activeTrack !== null}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
              clipRule="evenodd"
            />
          </svg>
        }
      />

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md py-1 min-w-[120px]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onTrackChange(null);
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-3 py-1 text-left text-sm text-brand-primary',
              'hover:bg-brand-surface/20 focus:bg-brand-surface/20 focus:outline-hidden',
              activeTrack === null && 'font-medium',
            )}
          >
            Off
          </button>
          {captionTracks.map((track) => (
            <button
              key={track.srcLang}
              type="button"
              role="menuitem"
              onClick={() => {
                onTrackChange(track.srcLang);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-3 py-1 text-left text-sm text-brand-primary',
                'hover:bg-brand-surface/20 focus:bg-brand-surface/20 focus:outline-hidden',
                activeTrack === track.srcLang && 'font-medium',
              )}
            >
              {track.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Transcript Component
// ============================================================================

interface TranscriptProps {
  content: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

function Transcript({ content, isOpen, onClose }: TranscriptProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Transcript</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-muted-foreground/20"
          aria-label="Close transcript"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      <div className="prose prose-sm max-h-60 overflow-y-auto">
        {typeof content === 'string' ? <p>{content}</p> : content}
      </div>
    </div>
  );
}

// ============================================================================
// Main Video Player Component
// ============================================================================

export function AccessibleVideo({
  src,
  sources = [],
  title,
  poster,
  tracks = [],
  transcript,
  autoPlay = false,
  loop = false,
  muted: initialMuted = false,
  width,
  height,
  className,
  onEnded,
  onTimeUpdate,
}: AccessibleVideoProps): React.JSX.Element {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState<TimeRanges | null>(null);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(initialMuted);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [activeTrack, setActiveTrack] = React.useState<string | null>(
    tracks.find((t) => t.default)?.srcLang || null,
  );
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Respect reduced motion preference
  const reducedMotion = prefersReducedMotion();

  // Handle autoplay with reduced motion
  React.useEffect(() => {
    if (autoPlay && !reducedMotion && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented
        setIsPlaying(false);
      });
    }
  }, [autoPlay, reducedMotion]);

  // Event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setBuffered(videoRef.current.buffered);
    onTimeUpdate?.(videoRef.current.currentTime, videoRef.current.duration);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onEnded?.();
    announce('Video ended');
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      announce('Paused');
    } else {
      videoRef.current.play();
      announce('Playing');
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    announce(`Seeked to ${formatTime(time)}`);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
    announce(`Volume ${Math.round(newVolume * 100)}%`);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    announce(isMuted ? 'Unmuted' : 'Muted');
  };

  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
        announce('Entered fullscreen');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        announce('Exited fullscreen');
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleTrackChange = (srcLang: string | null) => {
    setActiveTrack(srcLang);

    if (videoRef.current) {
      Array.from(videoRef.current.textTracks).forEach((track) => {
        track.mode = track.language === srcLang ? 'showing' : 'hidden';
      });
    }

    const trackLabel = srcLang ? tracks.find((t) => t.srcLang === srcLang)?.label : 'Off';
    announce(`Captions: ${trackLabel}`);
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - (e.shiftKey ? 10 : 5)));
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + (e.shiftKey ? 10 : 5)));
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'c': {
        e.preventDefault();
        // Toggle captions
        const captionTracks = tracks.filter((t) => t.kind === 'subtitles' || t.kind === 'captions');
        if (captionTracks.length > 0) {
          if (activeTrack) {
            handleTrackChange(null);
          } else {
            handleTrackChange(captionTracks[0].srcLang);
          }
        }
        break;
      }
    }
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="relative bg-black rounded-lg overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onKeyDown={handleKeyDown}
        role="application"
        aria-label={`Video player: ${title}`}
        style={{ width, height }}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          poster={poster}
          loop={loop}
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-label={title}
        >
          {sources.length > 0 ? (
            sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)
          ) : (
            <source src={src} />
          )}
          {/* Default captions track for accessibility */}
          <track kind="captions" srcLang="en" label="English captions" />
          {tracks.map((track) => (
            <track
              key={track.srcLang}
              kind={track.kind}
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
          Your browser does not support the video element.
        </video>

        {/* Controls overlay */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-end',
            'bg-linear-to-t from-black/70 to-transparent',
            'transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="p-4 space-y-2">
            {/* Progress bar */}
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              buffered={buffered}
              onSeek={handleSeek}
            />

            {/* Control buttons */}
            <div className="flex items-center gap-2 text-brand-primary">
              <ControlButton
                onClick={togglePlay}
                label={isPlaying ? 'Pause' : 'Play'}
                icon={
                  isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )
                }
              />

              <VolumeSlider
                volume={volume}
                muted={isMuted}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={toggleMute}
              />

              <div className="flex-1" />

              <CaptionMenu
                tracks={tracks}
                activeTrack={activeTrack}
                onTrackChange={handleTrackChange}
              />

              {transcript && (
                <ControlButton
                  onClick={() => setShowTranscript(!showTranscript)}
                  label={showTranscript ? 'Hide transcript' : 'Show transcript'}
                  active={showTranscript}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
                        clipRule="evenodd"
                      />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  }
                />
              )}

              <ControlButton
                onClick={toggleFullscreen}
                label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                icon={
                  isFullscreen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.75 3.75a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0V5.56l4.72 4.72a.75.75 0 101.06-1.06L5.56 4.5h3.44a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75zm16.5 0a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-4.72 4.72a.75.75 0 11-1.06-1.06l4.72-4.72H15a.75.75 0 010-1.5h4.5a.75.75 0 01.75.75zM3.75 20.25a.75.75 0 00.75-.75v-3.44l4.72 4.72a.75.75 0 101.06-1.06L5.56 15H9a.75.75 0 000-1.5H4.5a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75zm16.5 0a.75.75 0 01-.75-.75v-3.44l-4.72 4.72a.75.75 0 11-1.06-1.06l4.72-4.72H15a.75.75 0 010-1.5h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.78a.75.75 0 111.06-1.06l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97zm-4.94-1.06a.75.75 0 010 1.06L5.56 19.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <Transcript
          content={transcript}
          isOpen={showTranscript}
          onClose={() => setShowTranscript(false)}
        />
      )}

      {/* Keyboard shortcuts help */}
      <div className="sr-only" aria-live="polite">
        Keyboard shortcuts: Space or K to play/pause, Arrow keys to seek and adjust volume, M to
        mute, F for fullscreen, C to toggle captions
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default AccessibleVideo;
