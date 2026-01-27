'use client';

/**
 * =============================================================================
 * LXD360 | AudioPlayer Component
 * =============================================================================
 *
 * Audio player component with waveform visualization.
 * Supports background playback and podcast mode.
 * Neural-futuristic theme, WCAG 2.2 AA compliant.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { AlertCircle, Headphones, Music2, Pause, Play, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * AudioPlayer component props
 */
export interface AudioPlayerProps {
  /** Audio source URL */
  src: string;
  /** Cover art image URL */
  coverArt?: string;
  /** Track title */
  title?: string;
  /** Artist name */
  artist?: string;
  /** Current playback time in seconds */
  currentTime: number;
  /** Playback speed multiplier */
  playbackSpeed: number;
  /** Whether audio is playing */
  isPlaying: boolean;
  /** Called when audio time updates */
  onTimeUpdate: (time: number) => void;
  /** Called when audio ends */
  onEnded: () => void;
  /** Called when audio can play */
  onCanPlay?: () => void;
  /** Called when audio is buffering */
  onBuffering?: () => void;
  /** Called when buffering ends */
  onBuffered?: () => void;
  /** Called when audio loads metadata */
  onLoadedMetadata?: (duration: number) => void;
  /** Called when progress changes (buffered) */
  onProgress?: (bufferedPercent: number) => void;
  /** Called on error */
  onError?: (message: string) => void;
  /** Show waveform visualization */
  showWaveform?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * AudioPlayer - Controlled audio player component
 *
 * Integrates with usePlayer() hook for state management.
 * Features background playback support and waveform visualization.
 */
export function AudioPlayer({
  src,
  coverArt,
  title = 'Untitled Track',
  artist = 'LXD360',
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
  showWaveform = true,
  className,
}: AudioPlayerProps): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sync play state with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Sync playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.playbackRate !== playbackSpeed) {
      audio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync current time
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Initialize waveform visualization
  useEffect(() => {
    if (!showWaveform || !audioRef.current || audioContextRef.current || prefersReducedMotion) {
      return;
    }

    const initVisualization = (): void => {
      const audio = audioRef.current;
      if (!audio || audioContextRef.current) return;

      try {
        const audioContext = new AudioContext();
        const analyzer = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);

        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzer.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
      } catch (err) {
        // Visualization failed, continue without it
        console.warn('Audio visualization not available:', err);
      }
    };

    const handlePlay = (): void => {
      initVisualization();
    };

    audioRef.current.addEventListener('play', handlePlay);

    return () => {
      audioRef.current?.removeEventListener('play', handlePlay);
    };
  }, [showWaveform, prefersReducedMotion]);

  // Draw waveform
  useEffect(() => {
    if (!showWaveform || !canvasRef.current || !analyzerRef.current || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (): void => {
      const analyzer = analyzerRef.current;
      if (!analyzer || !isPlaying) {
        // Draw static bars when not playing
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barCount = 32;
        const barWidth = (canvas.width / barCount) * 0.8;
        const gap = (canvas.width / barCount) * 0.2;

        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.random() * 10 + 5;
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
          ctx.fillStyle = gradient;
          ctx.fillRect(i * (barWidth + gap), canvas.height - barHeight, barWidth, barHeight);
        }

        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showWaveform, isPlaying, prefersReducedMotion]);

  // Event handlers
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      onTimeUpdate(audio.currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      onLoadedMetadata?.(audio.duration);
    }
  }, [onLoadedMetadata]);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    onBuffered?.();
    onCanPlay?.();
  }, [onBuffered, onCanPlay]);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
    onBuffering?.();
  }, [onBuffering]);

  const handleProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.buffered.length || !audio.duration) return;
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / audio.duration) * 100;
    onProgress?.(bufferedPercent);
  }, [onProgress]);

  const handleEnded = useCallback(() => {
    onEnded();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const audio = audioRef.current;
    const message = audio?.error?.message ?? 'An error occurred while playing the audio';
    setError(message);
    setIsBuffering(false);
    onError?.(message);
  }, [onError]);

  const handleRetry = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setError(null);
      audio.load();
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, []);

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden rounded-xl',
        'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        'border border-white/10 p-6',
        'focus-within:ring-2 focus-within:ring-cyan-500/50',
        className,
      )}
      aria-label={`Audio player: ${title}`}
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Cover art and info */}
        <div className="mb-6 flex items-center gap-6">
          <div
            className={cn(
              'relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg',
              'bg-gradient-to-br from-cyan-500/20 to-purple-500/20',
              'shadow-[0_0_30px_rgba(0,212,255,0.3)]',
              isPlaying && !prefersReducedMotion && 'animate-pulse',
            )}
          >
            {coverArt ? (
              <Image src={coverArt} alt={`Cover art for ${title}`} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music2 className="h-10 w-10 text-cyan-400/50" aria-hidden="true" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Headphones
                  className={cn('h-8 w-8 text-cyan-400', !prefersReducedMotion && 'animate-bounce')}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-white">{title}</h3>
            <p className="truncate text-sm text-cyan-400">{artist}</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/30">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Play/Pause button */}
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            disabled={!!error}
            className={cn(
              'h-14 w-14 rounded-full',
              'bg-gradient-to-r from-cyan-500 to-purple-500',
              'hover:from-cyan-400 hover:to-purple-400',
              'text-white shadow-[0_0_20px_rgba(0,212,255,0.4)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="ml-1 h-6 w-6" fill="currentColor" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Waveform visualization */}
        {showWaveform && !prefersReducedMotion && (
          <div className="mb-4 h-16 w-full overflow-hidden rounded-lg bg-black/30">
            <canvas ref={canvasRef} className="h-full w-full" width={600} height={64} />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-500/10 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
            <p className="flex-1 text-sm text-red-400">{error}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
              Retry
            </Button>
          </div>
        )}

        {/* Buffering indicator */}
        {isBuffering && (
          <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400">
            <div
              className={cn(
                'h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent',
                !prefersReducedMotion && 'animate-spin',
              )}
              aria-hidden="true"
            />
            <span className="text-sm">Buffering...</span>
          </div>
        )}

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onError={handleError}
        >
          <source src={src} type="audio/mpeg" />
          <track kind="captions" srcLang="en" label="English" default />
          Your browser does not support the audio element.
        </audio>
      </div>
    </section>
  );
}

export default AudioPlayer;
