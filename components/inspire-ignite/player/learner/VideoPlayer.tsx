'use client';

import { motion } from 'framer-motion';
import {
  Maximize,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgress: (progress: number) => void;
  onComplete: () => void;
  initialProgress?: number;
}

/**
 * VideoPlayer - Custom video player with progress tracking and controls
 * Features playback speed, volume control, and fullscreen support
 * Tracks viewing progress for xAPI/LRS integration
 */
export function VideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  initialProgress = 0,
}: VideoPlayerProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  // Track progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        onProgress(progress);

        // Mark as complete when 95% watched
        if (progress >= 95 && videoRef.current.currentTime > 0) {
          onComplete();
        }
      }
    }, 5000); // Report progress every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, onProgress, onComplete]);

  const togglePlay = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = (): void => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Resume from initial progress
      if (initialProgress > 0) {
        videoRef.current.currentTime = (initialProgress / 100) * videoRef.current.duration;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = (): void => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number): void => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds),
      );
    }
  };

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative bg-black rounded-[10px] overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      role="application"
      aria-label={`Video player: ${title}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        aria-label={title}
      >
        <source src={videoUrl} type="video/mp4" />
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>

      {/* Placeholder for when video URL is TODO */}
      {!videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-(--blue-dark-600) to-(--blue-light-600)">
          <div className="text-center text-brand-primary">
            <Play className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold">Video player placeholder</p>
            <p className="text-sm opacity-80 mt-2">Content will be loaded from LMS</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none"
      />

      {/* Play/Pause Center Button */}
      {!isPlaying && showControls && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-lxd-light-card/20 backdrop-blur-xs flex items-center justify-center hover:bg-lxd-light-card/30 transition-all pointer-events-auto"
          onClick={togglePlay}
          aria-label="Play video"
        >
          <Play className="w-10 h-10 text-brand-primary ml-1" />
        </motion.button>
      )}

      {/* Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto"
      >
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mb-3 h-1.5 bg-lxd-light-card/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lxd-light-card"
          aria-label="Video progress"
        />

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 hover:bg-lxd-light-card/20 rounded-[6px] transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-brand-primary" />
              ) : (
                <Play className="w-5 h-5 text-brand-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skip(-10)}
              className="p-2 hover:bg-lxd-light-card/20 rounded-[6px] transition-colors"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="w-5 h-5 text-brand-primary" />
            </button>

            <button
              type="button"
              onClick={() => skip(10)}
              className="p-2 hover:bg-lxd-light-card/20 rounded-[6px] transition-colors"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5 text-brand-primary" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 hover:bg-lxd-light-card/20 rounded-[6px] transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-brand-primary" />
                ) : (
                  <Volume2 className="w-5 h-5 text-brand-primary" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-lxd-light-card/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lxd-light-card"
                aria-label="Volume"
              />
            </div>

            <span className="text-brand-primary text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                if (videoRef.current) {
                  videoRef.current.playbackRate = rate;
                }
              }}
              className="px-3 py-1 bg-lxd-light-card/20 text-brand-primary rounded-[6px] text-sm font-medium cursor-pointer border-none outline-hidden"
              aria-label="Playback speed"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            <button
              type="button"
              className="p-2 hover:bg-lxd-light-card/20 rounded-[6px] transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-brand-primary" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 hover:bg-lxd-light-card/20 rounded-[6px] transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize className="w-5 h-5 text-brand-primary" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* TODO: Wire up to LRS for xAPI tracking - video view, progress, completion events */}
    </div>
  );
}
