'use client';

import {
  FastForward,
  FileText,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { BaseBlockProps, ContextualAudioConfig, ContextualAudioContent } from '../types';

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultConfig: ContextualAudioConfig = {
  autoplay: false,
  loop: false,
  showTranscript: true,
  showWaveform: false,
  showCues: true,
  speed: 1,
  volume: 1,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ContextualAudioBlockProps extends BaseBlockProps {
  content?: ContextualAudioContent;
  config?: ContextualAudioConfig;
}

/**
 * ContextualAudioBlock - Audio with context awareness
 *
 * Features:
 * - Playback controls with speed adjustment
 * - Transcript display with sync
 * - Cue points for navigation
 * - Waveform visualization
 */
export function ContextualAudioBlock({
  content,
  config = defaultConfig,
  isEditing = false,
  onContentChange,
  onConfigChange,
  className,
}: ContextualAudioBlockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(content?.duration ?? 0);
  const [volume, setVolume] = useState(config.volume);
  const [isMuted, setIsMuted] = useState(false);

  const handleConfigChange = useCallback(
    (key: keyof ContextualAudioConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  const handleContentChange = useCallback(
    (updates: Partial<ContextualAudioContent>) => {
      onContentChange?.({ ...content, ...updates });
    },
    [content, onContentChange],
  );

  // Sync audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skip = useCallback(
    (seconds: number) => {
      if (!audioRef.current) return;
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seek(newTime);
    },
    [currentTime, duration, seek],
  );

  const changeSpeed = useCallback(
    (speed: number) => {
      if (!audioRef.current) return;
      audioRef.current.playbackRate = speed;
      handleConfigChange('speed', speed);
    },
    [handleConfigChange],
  );

  const changeVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Source */}
        <div className="space-y-2">
          <Label className="text-xs">Audio Source URL</Label>
          <input
            type="text"
            value={content?.src ?? ''}
            onChange={(e) => handleContentChange({ src: e.target.value })}
            placeholder="Enter audio URL..."
            className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label className="text-xs">Title</Label>
          <input
            type="text"
            value={content?.title ?? ''}
            onChange={(e) => handleContentChange({ title: e.target.value })}
            placeholder="Audio title..."
            className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
          />
        </div>

        {/* Transcript */}
        <div className="space-y-2">
          <Label className="text-xs">Transcript</Label>
          <textarea
            value={content?.transcript ?? ''}
            onChange={(e) => handleContentChange({ transcript: e.target.value })}
            placeholder="Enter transcript..."
            className="w-full min-h-[100px] p-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md resize-y"
          />
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
              checked={config.showTranscript ?? false}
              onCheckedChange={(v) => handleConfigChange('showTranscript', v)}
            />
            <Label className="text-xs">Show Transcript</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showCues ?? false}
              onCheckedChange={(v) => handleConfigChange('showCues', v)}
            />
            <Label className="text-xs">Show Cues</Label>
          </div>
        </div>

        {/* Preview */}
        {content?.src && (
          <div className="pt-4 border-t border-lxd-dark-border">
            <Label className="text-xs mb-2 block">Preview</Label>
            <audio ref={audioRef} src={content.src} controls className="w-full">
              <track kind="captions" srcLang="en" label="English" default />
            </audio>
          </div>
        )}
      </div>
    );
  }

  // Render display mode
  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={content?.src} autoPlay={config.autoplay} loop={config.loop}>
        <track kind="captions" srcLang="en" label="English" default />
      </audio>

      {/* Title */}
      {content?.title && <h3 className="font-medium text-lg">{content.title}</h3>}

      {/* Player Controls */}
      <div className="p-4 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([v]) => seek(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => seek(0)}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => skip(-10)}
            className="h-8 w-8"
          >
            <Rewind className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            onClick={togglePlayPause}
            className="h-12 w-12 rounded-full"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => skip(10)}
            className="h-8 w-8"
          >
            <FastForward className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => seek(duration)}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between mt-4">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
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
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            {[0.5, 1, 1.5, 2].map((speed) => (
              <Button
                key={speed}
                type="button"
                variant={config.speed === speed ? 'default' : 'ghost'}
                size="sm"
                onClick={() => changeSpeed(speed)}
                className="h-7 px-2 text-xs"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Cue Points */}
      {config.showCues && content?.cues && content.cues.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Chapters</Label>
          <div className="flex flex-wrap gap-2">
            {content.cues.map((cue) => (
              <Button
                key={cue.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => seek(cue.timestamp)}
                className={cn(
                  'text-xs',
                  currentTime >= cue.timestamp && 'bg-lxd-purple/20 border-lxd-purple',
                )}
              >
                {formatTime(cue.timestamp)} - {cue.label}
              </Button>
            ))}
          </div>
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

export default ContextualAudioBlock;
