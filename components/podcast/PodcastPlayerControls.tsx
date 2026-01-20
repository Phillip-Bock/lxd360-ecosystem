'use client';

import {
  Bookmark,
  Brain,
  Gauge,
  List,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface PodcastPlayerControlsProps {
  className?: string;
}

export function PodcastPlayerControls({ className }: PodcastPlayerControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(45 * 60 + 32); // 45:32 in seconds
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value) / 100;
    setVolume(newVolume);
    setIsMuted(false);
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  return (
    <div
      className={`bg-[var(--brand-surface)] border-t border-[var(--brand-border)] text-[var(--brand-text-primary)] p-4 ${className}`}
    >
      {/* Top Row - Now Playing Info & Quick Actions */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--brand-border)]/50">
        <div className="flex items-center space-x-4 min-w-[300px]">
          <Image
            src="/images/podcast/now-playing.jpg"
            width={56}
            height={56}
            alt="Now playing"
            className="w-14 h-14 rounded-lg"
          />
          <div>
            <p className="font-semibold">The Future of AI in Learning Design</p>
            <p className="text-sm text-[var(--brand-text-muted)]">
              Dr. Sarah Chen • EdTech Innovators
            </p>
            <div className="flex gap-2 mt-1">
              <Badge
                variant="secondary"
                className="text-xs bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]"
              >
                AI Enhanced
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-accent)]/20 hover:bg-[var(--brand-accent)]/30 transition-colors text-sm"
            title="AI Chapter Navigation"
          >
            <List size={16} />
            <span className="hidden lg:inline">Chapters</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-accent)]/20 hover:bg-[var(--brand-accent)]/30 transition-colors text-sm"
            title="AI Summary"
          >
            <Brain size={16} />
            <span className="hidden lg:inline">AI Summary</span>
          </button>
          <button
            type="button"
            onClick={cyclePlaybackSpeed}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-accent)]/20 hover:bg-[var(--brand-accent)]/30 transition-colors text-sm"
            title="Playback Speed"
          >
            <Gauge size={16} />
            <span className="hidden lg:inline">{playbackSpeed}x</span>
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-[var(--brand-accent)]/20 transition-colors"
            title="Bookmark This Moment"
          >
            <Bookmark
              size={18}
              className="text-[var(--brand-text-muted)] hover:text-[var(--brand-primary)]"
            />
          </button>
        </div>
      </div>

      {/* Bottom Row - Playback Controls */}
      <div className="flex items-center justify-between">
        <div className="min-w-[240px]"></div>

        {/* Center - Main Controls */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center space-x-6 mb-2">
            <button
              type="button"
              className="text-[var(--brand-text-muted)] hover:text-[var(--brand-text-primary)] transition-colors"
            >
              <Shuffle size={18} />
            </button>
            <button
              type="button"
              className="text-[var(--brand-text-muted)] hover:text-[var(--brand-text-primary)] transition-colors"
              onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
            >
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-[var(--brand-primary)] text-brand-primary rounded-full p-2 hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause fill="currentColor" size={20} />
              ) : (
                <Play fill="currentColor" size={20} />
              )}
            </button>
            <button
              type="button"
              className="text-[var(--brand-text-muted)] hover:text-[var(--brand-text-primary)] transition-colors"
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 15))}
            >
              <SkipForward size={18} />
            </button>
            <button
              type="button"
              className="text-[var(--brand-text-muted)] hover:text-[var(--brand-text-primary)] transition-colors"
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md flex items-center gap-2">
            <span className="text-xs text-[var(--brand-text-muted)]">
              {formatTime(currentTime)}
            </span>
            <div className="relative w-full">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleProgressChange}
                aria-label="Playback progress"
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                className="w-full h-1 bg-[var(--brand-border)] rounded-full appearance-none cursor-pointer accent-[var(--brand-primary)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--brand-primary)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--brand-primary)] [&::-moz-range-thumb]:border-0"
              />
              {/* Chapter markers (visual only) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-[20%] w-1 h-3 bg-[var(--brand-accent)] rounded-full opacity-60 pointer-events-none"
                aria-hidden="true"
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 left-[55%] w-1 h-3 bg-[var(--brand-accent)] rounded-full opacity-60 pointer-events-none"
                aria-hidden="true"
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 left-[80%] w-1 h-3 bg-[var(--brand-accent)] rounded-full opacity-60 pointer-events-none"
                aria-hidden="true"
              ></div>
            </div>
            <span className="text-xs text-[var(--brand-text-muted)]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right - Volume Control */}
        <div className="flex items-center space-x-3 min-w-[240px] justify-end">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-[var(--brand-text-muted)] hover:text-[var(--brand-text-primary)]"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            aria-label="Volume"
            aria-valuetext={isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
            className="w-24 h-1 bg-[var(--brand-border)] rounded-full appearance-none cursor-pointer accent-[var(--brand-primary)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--brand-primary)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--brand-primary)] [&::-moz-range-thumb]:border-0"
          />
        </div>
      </div>
    </div>
  );
}
