'use client';

import {
  FastForward,
  Maximize,
  Minimize,
  Pause,
  Play,
  Rewind,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  autoPlay = false,
  className,
}: VideoPlayerProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip forward/backward
  const skip = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          Math.max(videoRef.current.currentTime + seconds, 0),
          duration,
        );
      }
    },
    [duration],
  );

  // Fullscreen toggle - wrapped in useCallback to prevent recreation on every render
  const toggleFullscreen = useCallback((): void => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Playback speed
  const changePlaybackSpeed = (speed: number): void => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  // Show controls on mouse move
  const handleMouseMove = (): void => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Time update handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onProgress?.(progress);

      // Update buffered
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skip, togglePlay, toggleMute, toggleFullscreen]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <section
      ref={containerRef}
      className={cn('relative bg-black rounded-xl overflow-hidden group', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      aria-label={title ? `Video player: ${title}` : 'Video player'}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        autoPlay={autoPlay}
        playsInline
      >
        <track kind="captions" srcLang="en" label="English captions" />
      </video>

      {/* Play button overlay (shown when paused) */}
      {!isPlaying && (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-transparent border-none"
          onClick={togglePlay}
          aria-label="Play video"
        >
          <span className="w-20 h-20 rounded-full bg-[var(--studio-accent)]/90 flex items-center justify-center hover:bg-[var(--studio-accent)] transition-colors">
            <Play className="w-10 h-10 text-brand-primary ml-1" fill="white" aria-hidden="true" />
          </span>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1 bg-muted rounded-full cursor-pointer mb-4 group/progress"
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              skip(-5);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              skip(5);
            }
          }}
          role="slider"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          tabIndex={0}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-muted-foreground rounded-full"
            style={{ width: `${buffered}%` }}
          />
          {/* Progress */}
          <div
            className="absolute h-full bg-linear-to-r from-[var(--studio-accent)] to-[var(--lxd-purple-light)] rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Hover indicator */}
          <div
            className="absolute h-3 w-3 bg-brand-surface rounded-full -top-1 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="text-brand-primary hover:text-[var(--studio-accent)] transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Skip buttons */}
            <button
              type="button"
              onClick={() => skip(-10)}
              className="text-brand-primary hover:text-[var(--studio-accent)] transition-colors"
              title="Rewind 10s"
            >
              <Rewind className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => skip(10)}
              className="text-brand-primary hover:text-[var(--studio-accent)] transition-colors"
              title="Forward 10s"
            >
              <FastForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="text-brand-primary hover:text-[var(--studio-accent)] transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-[var(--studio-accent)]"
              />
            </div>

            {/* Time display */}
            <span className="text-brand-primary text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Settings (playback speed) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="text-brand-primary hover:text-[var(--studio-accent)] transition-colors flex items-center gap-1"
              >
                <Settings className="w-5 h-5" />
                {playbackSpeed !== 1 && <span className="text-xs">{playbackSpeed}x</span>}
              </button>

              {showSettings && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 bg-transparent border-none cursor-default"
                    onClick={() => setShowSettings(false)}
                    aria-label="Close settings menu"
                  />
                  <div className="absolute bottom-full right-0 mb-2 bg-[var(--studio-bg)] border border-[var(--lxd-dark-surface-alt)]/50 rounded-lg overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-[var(--lxd-dark-surface-alt)]/50 text-xs text-muted-foreground">
                      Playback Speed
                    </div>
                    {speedOptions.map((speed) => (
                      <button
                        type="button"
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className={cn(
                          'w-full px-4 py-2 text-sm text-left hover:bg-[var(--lxd-dark-surface-alt)]/30 transition-colors',
                          playbackSpeed === speed
                            ? 'text-[var(--studio-accent)] bg-[var(--studio-accent)]/10'
                            : 'text-brand-primary',
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-brand-primary hover:text-[var(--studio-accent)] transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/70 to-transparent p-4">
          <h3 className="text-brand-primary font-medium">{title}</h3>
        </div>
      )}
    </section>
  );
}
