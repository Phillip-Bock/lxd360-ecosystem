'use client';

/**
 * AudioToolsTab - Contextual ribbon tab for audio block editing
 * Provides Playback, Edit, and Settings groups for audio manipulation
 */

import {
  AudioWaveform,
  FastForward,
  Mic,
  Music,
  Pause,
  Play,
  Rewind,
  Scissors,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RibbonGroup } from '../ribbon-group';

interface AudioToolsTabProps {
  /** Current playback state */
  isPlaying?: boolean;
  /** Current mute state */
  isMuted?: boolean;
  /** Current volume (0-100) */
  volume?: number;
  /** Current playback time in seconds */
  currentTime?: number;
  /** Total duration in seconds */
  duration?: number;
  /** Callback for play/pause toggle */
  onPlayPause?: () => void;
  /** Callback for mute toggle */
  onMuteToggle?: () => void;
  /** Callback for volume change */
  onVolumeChange?: (volume: number) => void;
  /** Callback to skip to start */
  onSkipToStart?: () => void;
  /** Callback to skip to end */
  onSkipToEnd?: () => void;
  /** Callback to rewind 10 seconds */
  onRewind?: () => void;
  /** Callback to fast forward 10 seconds */
  onFastForward?: () => void;
  /** Callback to open trim tool */
  onOpenTrim?: () => void;
  /** Callback to open volume/fade controls */
  onOpenVolumeFades?: () => void;
  /** Callback to open full audio editor */
  onOpenFullEditor?: () => void;
  /** Callback to generate TTS */
  onGenerateTTS?: () => void;
  /** Callback to open settings */
  onOpenSettings?: () => void;
}

/**
 * Format seconds to MM:SS display
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * AudioToolsTab - Full contextual ribbon tab for audio editing
 */
export function AudioToolsTab({
  isPlaying = false,
  isMuted = false,
  volume = 100,
  currentTime = 0,
  duration = 0,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSkipToStart,
  onSkipToEnd,
  onRewind,
  onFastForward,
  onOpenTrim,
  onOpenVolumeFades,
  onOpenFullEditor,
  onGenerateTTS,
  onOpenSettings,
}: AudioToolsTabProps) {
  return (
    <TooltipProvider>
      <div className="flex items-stretch gap-1 px-2">
        {/* Playback Controls Group */}
        <RibbonGroup label="Playback">
          <div className="flex items-center gap-1 px-1">
            {/* Skip to Start */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkipToStart}>
                  <SkipBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip to Start</TooltipContent>
            </Tooltip>

            {/* Rewind 10s */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRewind}>
                  <Rewind className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rewind 10s</TooltipContent>
            </Tooltip>

            {/* Play/Pause - Primary Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className={cn(
                    'h-10 w-10',
                    isPlaying
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-primary hover:bg-primary/90',
                  )}
                  onClick={onPlayPause}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
            </Tooltip>

            {/* Fast Forward 10s */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFastForward}>
                  <FastForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward 10s</TooltipContent>
            </Tooltip>

            {/* Skip to End */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSkipToEnd}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip to End</TooltipContent>
            </Tooltip>

            {/* Time Display */}
            <div className="flex flex-col items-center px-2 min-w-16">
              <span className="text-xs font-mono text-white">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-zinc-500">/ {formatTime(duration)}</span>
            </div>
          </div>
        </RibbonGroup>

        {/* Volume Group */}
        <RibbonGroup label="Volume">
          <div className="flex items-center gap-2 px-2">
            {/* Mute Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', isMuted && 'text-red-400')}
                  onClick={onMuteToggle}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
            </Tooltip>

            {/* Volume Slider */}
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(val) => onVolumeChange?.(val[0])}
                className="w-full"
              />
            </div>

            {/* Volume Percentage */}
            <span className="text-xs text-zinc-400 w-8">{isMuted ? '0' : volume}%</span>
          </div>
        </RibbonGroup>

        {/* Edit Tools Group */}
        <RibbonGroup label="Edit">
          <div className="flex items-center gap-1 px-1">
            {/* Trim */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onOpenTrim}
                >
                  <Scissors className="h-4 w-4 mr-1" />
                  Trim
                </Button>
              </TooltipTrigger>
              <TooltipContent>Trim audio start/end points</TooltipContent>
            </Tooltip>

            {/* Volume & Fades */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onOpenVolumeFades}
                >
                  <AudioWaveform className="h-4 w-4 mr-1" />
                  Fades
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configure fade in/out</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* AI Generation Group */}
        <RibbonGroup label="AI Audio">
          <div className="flex items-center gap-1 px-1">
            {/* Generate TTS */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-primary/50 text-primary"
                  onClick={onGenerateTTS}
                >
                  <Mic className="h-4 w-4 mr-1" />
                  Generate TTS
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate text-to-speech narration</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Full Editor Group */}
        <RibbonGroup label="Editor">
          <div className="flex items-center gap-1 px-1">
            {/* Open Full Editor */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="sm" className="h-8" onClick={onOpenFullEditor}>
                  <Music className="h-4 w-4 mr-1" />
                  Full Editor
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open full audio editor</TooltipContent>
            </Tooltip>

            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Audio Settings</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>
      </div>
    </TooltipProvider>
  );
}
