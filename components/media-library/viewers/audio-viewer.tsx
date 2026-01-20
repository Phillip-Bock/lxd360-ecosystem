'use client';

import {
  Download,
  Music,
  Pause,
  Play,
  Repeat,
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

export interface AudioViewerProps {
  src: string;
  waveformData?: number[];
  duration?: number;
  title?: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioViewer({ src, waveformData, title }: AudioViewerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [waveform, setWaveform] = React.useState<number[]>(waveformData || []);

  // Generate waveform from audio if not provided
  React.useEffect(() => {
    if (waveformData && waveformData.length > 0) {
      setWaveform(waveformData);
      return;
    }

    // Generate placeholder waveform data
    const generateWaveform = async () => {
      try {
        const audioContext = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const rawData = audioBuffer.getChannelData(0);
        const samples = 100;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData: number[] = [];

        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }

        // Normalize
        const maxVal = Math.max(...filteredData);
        const normalized = filteredData.map((val) => val / maxVal);
        setWaveform(normalized);
        audioContext.close();
      } catch {
        // Silently ignore - failed to decode audio, generate random waveform as fallback
        const fallback = Array.from({ length: 100 }, () => Math.random() * 0.5 + 0.2);
        setWaveform(fallback);
      }
    };

    generateWaveform();
  }, [src, waveformData]);

  // Draw waveform
  React.useEffect(() => {
    if (!canvasRef.current || waveform.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveform.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    waveform.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height * 0.8);
      const y = (height - barHeight) / 2;

      // Determine if this bar is before or after progress
      const barProgress = index / waveform.length;

      if (barProgress < progress) {
        ctx.fillStyle = 'hsl(var(--primary))';
      } else {
        ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.3)';
      }

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveform, currentTime, duration]);

  // Audio event handlers
  const handleLoadedMetadata = React.useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = React.useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleEnded = React.useCallback(() => {
    if (!isLooping) {
      setIsPlaying(false);
    }
  }, [isLooping]);

  const handleError = React.useCallback(() => {
    setError('Failed to load audio');
    setIsLoading(false);
  }, []);

  // Playback controls
  const togglePlay = React.useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = React.useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleLoop = React.useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  }, [isLooping]);

  const handleVolumeChange = React.useCallback(
    (value: number[]) => {
      if (!audioRef.current) return;
      const newVolume = value[0];
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    },
    [isMuted],
  );

  const handleSeek = React.useCallback((value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleWaveformClick = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !audioRef.current || duration === 0) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = x / rect.width;
      const newTime = progress * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration],
  );

  const handleSpeedChange = React.useCallback((speed: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  const skip = React.useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds),
    );
  }, []);

  // Download
  const handleDownload = React.useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title || 'audio';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently ignore - download failed, fallback to opening in new tab
      window.open(src, '_blank');
    }
  }, [src, title]);

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
        case 'l':
        case 'L':
          toggleLoop();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleLoop, skip]);

  return (
    <ViewerContainer
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        setError(null);
        setIsLoading(true);
        audioRef.current?.load();
      }}
      className="min-h-[200px]"
    >
      <div ref={containerRef} className="relative w-full h-full flex flex-col p-6">
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={src}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          loop={isLooping}
          preload="metadata"
        >
          <track kind="captions" srcLang="en" label="English captions" />
        </audio>

        {/* Title and icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music className="h-8 w-8 text-primary" />
          </div>
          {title && (
            <div>
              <h3 className="font-medium text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{formatTime(duration)}</p>
            </div>
          )}
        </div>

        {/* Waveform */}
        <div className="flex-1 flex items-center mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-24 cursor-pointer"
            onClick={handleWaveformClick}
          />
        </div>

        {/* Progress slider (hidden, for accessibility) */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Skip backward */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => skip(-10)}
                className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-full transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>-10s</TooltipContent>
          </Tooltip>

          {/* Play/Pause */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={togglePlay}
                className="h-14 w-14 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? 'Pause' : 'Play'} (Space)</TooltipContent>
          </Tooltip>

          {/* Skip forward */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => skip(10)}
                className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-full transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>+10s</TooltipContent>
          </Tooltip>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {/* Volume */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? 'Unmute' : 'Mute'} (M)</TooltipContent>
            </Tooltip>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Loop toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded transition-colors',
                    isLooping ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                  )}
                >
                  <Repeat className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Loop {isLooping ? 'on' : 'off'} (L)</TooltipContent>
            </Tooltip>

            {/* Playback speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 px-2 flex items-center gap-1 hover:bg-accent rounded transition-colors text-sm"
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

            {/* Download */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </ViewerContainer>
  );
}
