'use client';

import {
  Maximize2,
  Minimize2,
  Pause,
  PictureInPicture2,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ViewerContainer } from './viewer-container';

export interface VideoViewerProps {
  src: string;
  poster?: string;
  duration?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoViewer({ src, poster, onTimeUpdate, onEnded }: VideoViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [showControls, setShowControls] = React.useState(true);
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);

  const hideControlsTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Video event handlers
  const handleLoadedMetadata = React.useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = React.useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);

      // Update buffered progress
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  }, [onTimeUpdate]);

  const handleEnded = React.useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleError = React.useCallback(() => {
    setError('Failed to load video');
    setIsLoading(false);
  }, []);

  // Playback controls
  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = React.useCallback(
    (value: number[]) => {
      if (!videoRef.current) return;
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    },
    [isMuted],
  );

  const handleSeek = React.useCallback((value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleProgressHover = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setHoverTime(pos * duration);
      setHoverPosition(e.clientX - rect.left);
    },
    [duration],
  );

  const handleProgressLeave = React.useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleSpeedChange = React.useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  // Skip forward/backward
  const skip = React.useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds),
    );
  }, []);

  // Fullscreen
  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Silently ignore - fullscreen not supported or user declined
    }
  }, []);

  // Picture-in-picture
  const togglePiP = React.useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // Silently ignore - Picture-in-Picture not supported or user declined
    }
  }, []);

  // Auto-hide controls
  const resetHideTimer = React.useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  React.useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange([Math.min(1, volume + 0.1)]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange([Math.max(0, volume - 0.1)]);
          break;
      }
      resetHideTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skip, volume, handleVolumeChange, resetHideTimer]);

  // Fullscreen change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <ViewerContainer
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        setError(null);
        setIsLoading(true);
        videoRef.current?.load();
      }}
      aspectRatio="video"
      fullscreen={isFullscreen}
    >
      <div
        ref={containerRef}
        role="application"
        aria-label="Video player"
        className={cn('relative w-full h-full group', isFullscreen && 'bg-black')}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        >
          <track kind="captions" srcLang="en" label="English captions" />
        </video>

        {/* Play/Pause overlay */}
        {!isPlaying && !isLoading && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
          >
            <div className="h-16 w-16 rounded-full bg-background/95 backdrop-blur-xs flex items-center justify-center shadow-lg">
              <Play className="h-8 w-8 ml-1" />
            </div>
          </button>
        )}

        {/* Controls */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            role="presentation"
            className="relative h-1 bg-brand-surface/20 rounded-full mb-3 cursor-pointer group/progress"
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            {/* Buffered progress */}
            <div
              className="absolute h-full bg-brand-surface/30 rounded-full"
              style={{ width: `${buffered}%` }}
            />

            {/* Current progress */}
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />

            {/* Slider overlay */}
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            {/* Hover preview */}
            {hoverTime !== null && (
              <div
                className="absolute -top-8 transform -translate-x-1/2 bg-background/95 backdrop-blur-xs px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ left: hoverPosition }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

            {/* Progress dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2 text-brand-primary">
            {/* Play/Pause */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="h-8 w-8 flex items-center justify-center hover:bg-brand-surface/20 rounded transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pause' : 'Play'} (Space)</TooltipContent>
            </Tooltip>

            {/* Skip backward */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => skip(-10)}
                  className="h-8 w-8 flex items-center justify-center hover:bg-brand-surface/20 rounded transition-colors"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>-10s</TooltipContent>
            </Tooltip>

            {/* Skip forward */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => skip(10)}
                  className="h-8 w-8 flex items-center justify-center hover:bg-brand-surface/20 rounded transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>+10s</TooltipContent>
            </Tooltip>

            {/* Volume */}
            <div className="flex items-center gap-1 group/volume">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="h-8 w-8 flex items-center justify-center hover:bg-brand-surface/20 rounded transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? 'Unmute' : 'Mute'} (M)</TooltipContent>
              </Tooltip>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Time display */}
            <span className="text-sm tabular-nums ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Playback speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 px-2 flex items-center gap-1 hover:bg-brand-surface/20 rounded transition-colors text-sm"
                >
                  <Settings className="h-4 w-4" />
                  {playbackSpeed}x
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={cn(speed === playbackSpeed && 'bg-accent')}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Picture-in-picture */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={togglePiP}
                  className="h-8 w-8 flex items-center justify-center hover:bg-brand-surface/20 rounded transition-colors"
                >
                  <PictureInPicture2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Picture in Picture</TooltipContent>
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 flex items-center justify-center hover:bg-brand-surface/20 rounded transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} (F)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </ViewerContainer>
  );
}
