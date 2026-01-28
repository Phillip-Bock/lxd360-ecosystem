'use client';

import { Headphones, Music2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerControls } from './player-controls';
import { ProgressBar } from './progress-bar';
import type { AudioSource, MediaPlayerMachine } from './types';
import { formatTime, KEYBOARD_SHORTCUTS } from './types';

/**
 * =============================================================================
 * LXD360 | AudioPlayer Component
 * =============================================================================
 *
 * Audio-only player for podcast mode with waveform visualization,
 * cover art display, and neural-futuristic theme styling.
 *
 * @version 1.0.0
 * @updated 2026-01-26
 */

export interface AudioPlayerProps {
  src: string | AudioSource[];
  coverArt?: string;
  title?: string;
  artist?: string;
  album?: string;
  machine?: MediaPlayerMachine;
  autoPlay?: boolean;
  loop?: boolean;
  showWaveform?: boolean;
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onCanPlay?: () => void;
}

export function AudioPlayer({
  src,
  coverArt,
  title = 'Untitled Track',
  artist,
  album,
  machine,
  autoPlay = false,
  loop = false,
  showWaveform = true,
  className,
  onEnded,
  onTimeUpdate,
  onCanPlay,
}: AudioPlayerProps): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      void audioRef.current?.play();
    },
    pause: () => {
      audioRef.current?.pause();
    },
    togglePlayPause: () => {
      if (audioRef.current?.paused) {
        void audioRef.current.play();
      } else {
        audioRef.current?.pause();
      }
    },
    seek: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    setVolume: (volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        setInternalState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
      }
    },
    toggleMute: () => {
      if (audioRef.current) {
        audioRef.current.muted = !audioRef.current.muted;
        setInternalState((prev) => ({ ...prev, isMuted: audioRef.current?.muted ?? false }));
      }
    },
    setPlaybackRate: (rate: number) => {
      if (audioRef.current) {
        audioRef.current.playbackRate = rate;
        setInternalState((prev) => ({ ...prev, playbackRate: rate }));
      }
    },
    toggleFullscreen: () => {},
    skipForward: (seconds = 10) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + seconds,
          audioRef.current.duration,
        );
      }
    },
    skipBackward: (seconds = 10) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seconds, 0);
      }
    },
  };

  useEffect(() => {
    if (!showWaveform || !audioRef.current || !canvasRef.current) return;

    const initializeVisualization = (): void => {
      if (audioContextRef.current) return;
      const audioElement = audioRef.current;
      if (!audioElement) return;

      const audioContext = new AudioContext();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioElement);

      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
    };

    const handlePlay = (): void => {
      initializeVisualization();
    };

    audioRef.current.addEventListener('play', handlePlay);

    return () => {
      audioRef.current?.removeEventListener('play', handlePlay);
    };
  }, [showWaveform]);

  useEffect(() => {
    if (!showWaveform || !canvasRef.current || !analyzerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (): void => {
      const analyzer = analyzerRef.current;
      if (!analyzer || !state.isPlaying) {
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
  }, [showWaveform, state.isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setInternalState((prev) => ({
      ...prev,
      currentTime: audio.currentTime,
      duration: audio.duration || 0,
    }));
    onTimeUpdate?.(audio.currentTime, audio.duration || 0);
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
    const audio = audioRef.current;
    if (!audio) return;
    setInternalState((prev) => ({ ...prev, duration: audio.duration }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isBuffering: false }));
    onCanPlay?.();
  }, [onCanPlay]);

  const handleWaiting = useCallback(() => {
    setInternalState((prev) => ({ ...prev, isBuffering: true }));
  }, []);

  const handleProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.buffered.length) return;
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / audio.duration) * 100;
    setInternalState((prev) => ({ ...prev, buffered: bufferedPercent }));
  }, []);

  const handleError = useCallback(() => {
    const audio = audioRef.current;
    const error = audio?.error?.message ?? 'An error occurred while playing the audio';
    setInternalState((prev) => ({ ...prev, error, isBuffering: false }));
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
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state]);

  const sources = typeof src === 'string' ? [{ src, type: 'audio/mpeg' }] : src;

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-xl',
        'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        'border border-white/10 p-6',
        'focus-within:ring-2 focus-within:ring-cyan-500/50',
        className,
      )}
      aria-label={`Audio player: ${title}`}
    >
      <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-6">
          <div
            className={cn(
              'relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg',
              'bg-gradient-to-br from-cyan-500/20 to-purple-500/20',
              'shadow-[0_0_30px_rgba(0,212,255,0.3)]',
              state.isPlaying && 'animate-pulse',
            )}
          >
            {coverArt ? (
              <Image src={coverArt} alt={`Cover art for ${title}`} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music2 className="h-10 w-10 text-cyan-400/50" />
              </div>
            )}
            {state.isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Headphones className="h-8 w-8 animate-bounce text-cyan-400" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-white">{title}</h3>
            {artist && <p className="truncate text-sm text-cyan-400">{artist}</p>}
            {album && <p className="truncate text-xs text-white/50">{album}</p>}
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-white/70">
              <span>{formatTime(state.currentTime)}</span>
              <span className="text-white/30">/</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>
        </div>

        {showWaveform && (
          <div className="mb-4 h-16 w-full overflow-hidden rounded-lg bg-black/30">
            <canvas ref={canvasRef} className="h-full w-full" width={600} height={64} />
          </div>
        )}

        <div className="mb-4">
          <ProgressBar
            currentTime={state.currentTime}
            duration={state.duration}
            buffered={state.buffered}
            onSeek={state.seek}
          />
        </div>

        <PlayerControls
          machine={state}
          showSkipButtons
          showVolumeControl
          showSpeedControl
          showFullscreenButton={false}
        />

        <audio
          ref={audioRef}
          autoPlay={autoPlay}
          loop={loop}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onProgress={handleProgress}
          onError={handleError}
        >
          {sources.map((source, index) => (
            <source key={`${source.src}-${index}`} src={source.src} type={source.type} />
          ))}
          <track kind="captions" srcLang="en" label="English" default />
          Your browser does not support the audio element.
        </audio>

        {state.error && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {state.error}
          </div>
        )}
      </div>
    </section>
  );
}

export default AudioPlayer;
