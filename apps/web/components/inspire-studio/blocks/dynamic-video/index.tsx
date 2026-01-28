'use client';

import {
  FileText,
  Maximize,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { BaseBlockProps, DynamicVideoConfig, DynamicVideoContent } from '../types';

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultConfig: DynamicVideoConfig = {
  autoplay: false,
  loop: false,
  muted: false,
  controls: true,
  showChapters: true,
  showOverlays: true,
  showTranscript: false,
  allowSkip: true,
  requiredWatchPercentage: 0,
  playbackRates: [0.5, 1, 1.25, 1.5, 2],
};

// ============================================================================
// COMPONENT
// ============================================================================

interface DynamicVideoBlockProps extends BaseBlockProps {
  content?: DynamicVideoContent;
  config?: DynamicVideoConfig;
}

/**
 * DynamicVideoBlock - Video with interactive overlays
 *
 * Features:
 * - Chapter markers for navigation
 * - Interactive overlays (hotspots, quizzes)
 * - Transcript sync
 * - Required watch percentage tracking
 */
export function DynamicVideoBlock({
  content,
  config = defaultConfig,
  isEditing = false,
  onContentChange,
  onConfigChange,
  className,
}: DynamicVideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(content?.duration ?? 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(config.muted ?? false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);

  const handleConfigChange = useCallback(
    (key: keyof DynamicVideoConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  const handleContentChange = useCallback(
    (updates: Partial<DynamicVideoContent>) => {
      onContentChange?.({ ...content, ...updates });
    },
    [content, onContentChange],
  );

  // Sync video time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setWatchedPercentage(Math.round((video.currentTime / video.duration) * 100));
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skip = useCallback(
    (seconds: number) => {
      if (!videoRef.current || !config.allowSkip) return;
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seek(newTime);
    },
    [currentTime, duration, seek, config.allowSkip],
  );

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const changeVolume = useCallback((vol: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current chapter
  const currentChapter = content?.chapters?.reduce((prev, curr) => {
    if (curr.timestamp <= currentTime) return curr;
    return prev;
  }, content.chapters[0]);

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Source */}
        <div className="space-y-2">
          <Label className="text-xs">Video Source URL</Label>
          <input
            type="text"
            value={content?.src ?? ''}
            onChange={(e) => handleContentChange({ src: e.target.value })}
            placeholder="Enter video URL..."
            className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <input
              type="text"
              value={content?.title ?? ''}
              onChange={(e) => handleContentChange({ title: e.target.value })}
              placeholder="Video title..."
              className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
            />
          </div>

          {/* Poster */}
          <div className="space-y-2">
            <Label className="text-xs">Poster Image URL</Label>
            <input
              type="text"
              value={content?.posterSrc ?? ''}
              onChange={(e) => handleContentChange({ posterSrc: e.target.value })}
              placeholder="Thumbnail URL..."
              className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
            />
          </div>
        </div>

        {/* Config Options */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lxd-dark-border">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.autoplay ?? false}
              onCheckedChange={(v) => handleConfigChange('autoplay', v)}
            />
            <Label className="text-xs">Autoplay</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.loop ?? false}
              onCheckedChange={(v) => handleConfigChange('loop', v)}
            />
            <Label className="text-xs">Loop</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.muted ?? false}
              onCheckedChange={(v) => handleConfigChange('muted', v)}
            />
            <Label className="text-xs">Start Muted</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showChapters ?? false}
              onCheckedChange={(v) => handleConfigChange('showChapters', v)}
            />
            <Label className="text-xs">Show Chapters</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showTranscript ?? false}
              onCheckedChange={(v) => handleConfigChange('showTranscript', v)}
            />
            <Label className="text-xs">Show Transcript</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.allowSkip ?? false}
              onCheckedChange={(v) => handleConfigChange('allowSkip', v)}
            />
            <Label className="text-xs">Allow Skip</Label>
          </div>
        </div>

        {/* Required Watch Percentage */}
        <div className="space-y-2">
          <Label className="text-xs">Required Watch % (0 = disabled)</Label>
          <Slider
            value={[config.requiredWatchPercentage ?? 0]}
            max={100}
            step={5}
            onValueChange={([v]) => handleConfigChange('requiredWatchPercentage', v)}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">
            {config.requiredWatchPercentage ?? 0}%
          </span>
        </div>

        {/* Preview */}
        {content?.src && (
          <div className="pt-4 border-t border-lxd-dark-border">
            <Label className="text-xs mb-2 block">Preview</Label>
            <video
              ref={videoRef}
              src={content.src}
              poster={content.posterSrc}
              controls
              className="w-full rounded-lg"
            >
              <track kind="captions" srcLang="en" label="English" default />
            </video>
          </div>
        )}
      </div>
    );
  }

  // Render display mode
  return (
    <div className={cn('space-y-4', className)}>
      {/* Title */}
      {content?.title && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{content.title}</h3>
          {config.requiredWatchPercentage && config.requiredWatchPercentage > 0 && (
            <Badge
              variant="outline"
              className={cn(
                watchedPercentage >= config.requiredWatchPercentage
                  ? 'text-green-400'
                  : 'text-yellow-400',
              )}
            >
              {watchedPercentage}% watched
            </Badge>
          )}
        </div>
      )}

      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative aspect-video rounded-lg overflow-hidden bg-black group"
      >
        <video
          ref={videoRef}
          src={content?.src}
          poster={content?.posterSrc}
          autoPlay={config.autoplay}
          loop={config.loop}
          muted={config.muted}
          className="w-full h-full object-contain"
          onClick={togglePlayPause}
        >
          <track kind="captions" srcLang="en" label="English" default />
        </video>

        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/70 via-transparent to-transparent">
          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={([v]) => seek(v)}
                className="w-full"
              />
              {/* Chapter Markers */}
              {config.showChapters &&
                content?.chapters?.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-lxd-purple rounded"
                    style={{ left: `${(chapter.timestamp / duration) * 100}%` }}
                    title={chapter.title}
                  />
                ))}
            </div>
            <div className="flex justify-between text-xs text-white/80 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {/* Skip */}
              {config.allowSkip && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(-10)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(10)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Volume */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={([v]) => changeVolume(v)}
                className="w-20"
              />

              {/* Current Chapter */}
              {currentChapter && (
                <span className="text-sm text-white/80 ml-4">{currentChapter.title}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Rate */}
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
                    <p className="text-xs text-muted-foreground mb-2">Speed</p>
                    <div className="flex gap-1">
                      {(config.playbackRates ?? [0.5, 1, 1.5, 2]).map((rate) => (
                        <Button
                          key={rate}
                          type="button"
                          variant={playbackRate === rate ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => changePlaybackRate(rate)}
                          className="h-6 px-2 text-xs"
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      {config.showChapters && content?.chapters && content.chapters.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Chapters</Label>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              {content.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => seek(chapter.timestamp)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                    'hover:bg-lxd-dark-bg',
                    currentChapter?.id === chapter.id && 'bg-lxd-purple/20',
                  )}
                >
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTime(chapter.timestamp)}
                  </span>
                  <span className="text-sm truncate">{chapter.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Transcript */}
      {config.showTranscript && content?.transcript && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs">Transcript</Label>
          </div>
          <ScrollArea className="h-40 rounded-lg bg-lxd-dark-bg border border-lxd-dark-border p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{content.transcript}</p>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default DynamicVideoBlock;
