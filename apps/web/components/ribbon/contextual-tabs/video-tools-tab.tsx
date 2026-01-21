'use client';

/**
 * VideoToolsTab - Contextual ribbon tab for video block editing
 * Provides Playback, Trim, Chapters, Hotspots, and Settings groups
 */

import {
  Clock,
  Copy,
  FastForward,
  Flag,
  ListOrdered,
  MapPin,
  Maximize,
  Minimize,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Rewind,
  Scissors,
  Settings,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RibbonGroup } from '../ribbon-group';

interface Chapter {
  id: string;
  title: string;
  startTime: number;
}

interface Hotspot {
  id: string;
  time: number;
  x: number;
  y: number;
  action: 'link' | 'popup' | 'quiz';
}

interface VideoToolsTabProps {
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
  /** Trim start point in seconds */
  trimStart?: number;
  /** Trim end point in seconds */
  trimEnd?: number;
  /** List of chapters */
  chapters?: Chapter[];
  /** List of hotspots */
  hotspots?: Hotspot[];
  /** Whether fullscreen is enabled */
  isFullscreen?: boolean;
  /** Playback speed */
  playbackSpeed?: number;
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
  /** Callback to open trim editor */
  onOpenTrimEditor?: () => void;
  /** Callback to set trim start at current time */
  onSetTrimStart?: () => void;
  /** Callback to set trim end at current time */
  onSetTrimEnd?: () => void;
  /** Callback to clear trim points */
  onClearTrim?: () => void;
  /** Callback to add chapter at current time */
  onAddChapter?: () => void;
  /** Callback to manage chapters */
  onManageChapters?: () => void;
  /** Callback to AI generate chapters */
  onGenerateChapters?: () => void;
  /** Callback to add hotspot at current time */
  onAddHotspot?: () => void;
  /** Callback to manage hotspots */
  onManageHotspots?: () => void;
  /** Callback to toggle fullscreen */
  onToggleFullscreen?: () => void;
  /** Callback to change playback speed */
  onPlaybackSpeedChange?: (speed: number) => void;
  /** Callback to duplicate block */
  onDuplicate?: () => void;
  /** Callback to delete block */
  onDelete?: () => void;
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
 * VideoToolsTab - Full contextual ribbon tab for video editing
 */
export function VideoToolsTab({
  isPlaying = false,
  isMuted = false,
  volume = 100,
  currentTime = 0,
  duration = 0,
  trimStart = 0,
  trimEnd,
  chapters = [],
  hotspots = [],
  isFullscreen = false,
  playbackSpeed = 1,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSkipToStart,
  onSkipToEnd,
  onRewind,
  onFastForward,
  onOpenTrimEditor,
  onSetTrimStart,
  onSetTrimEnd,
  onClearTrim,
  onAddChapter,
  onManageChapters,
  onGenerateChapters,
  onAddHotspot,
  onManageHotspots,
  onToggleFullscreen,
  onPlaybackSpeedChange,
  onDuplicate,
  onDelete,
  onOpenSettings,
}: VideoToolsTabProps) {
  const effectiveTrimEnd = trimEnd ?? duration;
  const hasTrim = trimStart > 0 || (trimEnd !== undefined && trimEnd < duration);

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

            {/* Volume */}
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

            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(val) => onVolumeChange?.(val[0])}
              className="w-16"
            />
          </div>
        </RibbonGroup>

        {/* Trim Group */}
        <RibbonGroup label="Trim">
          <div className="flex items-center gap-1 px-1">
            {/* Trim Editor */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 border-white/10',
                    hasTrim && 'border-cyan-500/50 text-cyan-400',
                  )}
                  onClick={onOpenTrimEditor}
                >
                  <Scissors className="h-4 w-4 mr-1" />
                  Trim
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open trim editor</TooltipContent>
            </Tooltip>

            {/* Set In/Out Points */}
            <div className="flex flex-col gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={onSetTrimStart}
                  >
                    <Flag className="h-3 w-3 mr-1 text-green-400" />
                    In: {formatTime(trimStart)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set trim start at current time</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={onSetTrimEnd}
                  >
                    <Flag className="h-3 w-3 mr-1 text-red-400" />
                    Out: {formatTime(effectiveTrimEnd)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set trim end at current time</TooltipContent>
              </Tooltip>
            </div>

            {/* Clear Trim */}
            {hasTrim && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400"
                    onClick={onClearTrim}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear trim points</TooltipContent>
              </Tooltip>
            )}
          </div>
        </RibbonGroup>

        {/* Chapters Group */}
        <RibbonGroup label="Chapters">
          <div className="flex items-center gap-1 px-1">
            {/* Add Chapter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onAddChapter}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add chapter at current time</TooltipContent>
            </Tooltip>

            {/* Manage Chapters */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onManageChapters}
                >
                  <ListOrdered className="h-4 w-4 mr-1" />
                  Manage
                  {chapters.length > 0 && (
                    <span className="ml-1 text-[10px] bg-cyan-500/20 text-cyan-400 px-1 rounded">
                      {chapters.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage video chapters</TooltipContent>
            </Tooltip>

            {/* AI Generate Chapters */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-primary/50 text-primary"
                  onClick={onGenerateChapters}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Auto
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI generate chapters from video</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Hotspots Group */}
        <RibbonGroup label="Hotspots">
          <div className="flex items-center gap-1 px-1">
            {/* Add Hotspot */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-amber-500/30"
                  onClick={onAddHotspot}
                >
                  <MapPin className="h-4 w-4 mr-1 text-amber-400" />
                  Add
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add interactive hotspot</TooltipContent>
            </Tooltip>

            {/* Manage Hotspots */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onManageHotspots}
                >
                  <MousePointer2 className="h-4 w-4 mr-1" />
                  Manage
                  {hotspots.length > 0 && (
                    <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">
                      {hotspots.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage interactive hotspots</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Playback Options Group */}
        <RibbonGroup label="Options">
          <div className="flex items-center gap-2 px-2">
            {/* Playback Speed */}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-400" />
              <select
                value={playbackSpeed}
                onChange={(e) => onPlaybackSpeedChange?.(Number(e.target.value))}
                className="h-7 text-xs bg-zinc-900 border border-white/10 rounded-sm px-1 text-white"
              >
                {playbackSpeeds.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>

            {/* Fullscreen Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', isFullscreen && 'bg-cyan-500/20 text-cyan-400')}
                  onClick={onToggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Block Actions Group */}
        <RibbonGroup label="Block">
          <div className="flex items-center gap-1 px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate Block</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Block</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video Settings</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>
      </div>
    </TooltipProvider>
  );
}
