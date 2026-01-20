'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

interface Region {
  id: string;
  start: number;
  end: number;
  color: string;
}

interface WaveformEditorProps {
  audioUrl: string;
  onReady?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onRegionChange?: (region: { start: number; end: number }) => void;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  trimRegion?: { start: number; end: number };
  waveColor?: string;
  progressColor?: string;
  height?: number;
}

/**
 * WaveformEditor - WaveSurfer.js wrapper for audio visualization and editing
 */
export function WaveformEditor({
  audioUrl,
  onReady,
  onTimeUpdate,
  onRegionChange,
  isPlaying = false,
  onPlayStateChange,
  trimRegion,
  waveColor = '#8b5cf6',
  progressColor = '#00d4ff',
  height = 80,
}: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      height,
      cursorColor: '#fff',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      plugins: [regions],
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on('ready', () => {
      const audioDuration = wavesurfer.getDuration();
      setDuration(audioDuration);
      setIsLoaded(true);
      onReady?.(audioDuration);
    });

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    wavesurfer.on('play', () => {
      onPlayStateChange?.(true);
    });

    wavesurfer.on('pause', () => {
      onPlayStateChange?.(false);
    });

    wavesurfer.on('finish', () => {
      onPlayStateChange?.(false);
    });

    // Handle region updates
    regions.on('region-updated', (region: Region) => {
      onRegionChange?.({ start: region.start, end: region.end });
    });

    wavesurfer.load(audioUrl);

    return () => {
      wavesurfer.destroy();
    };
  }, [
    audioUrl,
    waveColor,
    progressColor,
    height,
    onReady,
    onTimeUpdate,
    onPlayStateChange,
    onRegionChange,
  ]);

  // Handle play state changes from parent
  useEffect(() => {
    if (!wavesurferRef.current || !isLoaded) return;

    if (isPlaying && !wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.play();
    } else if (!isPlaying && wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, isLoaded]);

  // Handle trim region
  useEffect(() => {
    if (!regionsRef.current || !isLoaded || !trimRegion) return;

    // Clear existing regions
    regionsRef.current.clearRegions();

    // Add trim region
    regionsRef.current.addRegion({
      start: trimRegion.start,
      end: trimRegion.end,
      color: 'rgba(0, 212, 255, 0.2)',
      drag: true,
      resize: true,
    });
  }, [trimRegion, isLoaded]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="space-y-2">
      {/* Waveform Container */}
      <div
        ref={containerRef}
        className="w-full bg-[#0d0d14] rounded-md overflow-hidden"
        style={{ minHeight: height }}
      />

      {/* Time Display */}
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

/**
 * Seek bar for precise time navigation
 */
export function AudioSeekBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <button
      type="button"
      className="h-2 w-full bg-zinc-800 rounded-full cursor-pointer group border-none"
      onClick={handleClick}
      aria-label="Seek audio position"
    >
      <div
        className="h-full bg-primary rounded-full relative transition-all"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}
