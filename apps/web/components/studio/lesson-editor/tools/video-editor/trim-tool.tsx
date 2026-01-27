'use client';

import {
  Check,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoTrimToolProps {
  duration: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  isPlaying: boolean;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onApplyTrim: () => void;
  onReset: () => void;
}

/**
 * VideoTrimTool - Start/end time controls for video trimming with preview
 */
export function VideoTrimTool({
  duration,
  startTime,
  endTime,
  currentTime,
  isPlaying,
  onStartChange,
  onEndChange,
  onSeek,
  onPlayPause,
  onApplyTrim,
  onReset,
}: VideoTrimToolProps) {
  const [localStart, setLocalStart] = useState(startTime);
  const [localEnd, setLocalEnd] = useState(endTime);

  useEffect(() => {
    // Wrap in setTimeout to avoid React 19 sync setState warning
    const timeout = setTimeout(() => {
      setLocalStart(startTime);
      setLocalEnd(endTime);
    }, 0);
    return () => clearTimeout(timeout);
  }, [startTime, endTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const [mins, secsPart] = parts;
      const [secs, ms = '0'] = secsPart.split('.');
      return parseInt(mins, 10) * 60 + parseInt(secs, 10) + parseInt(ms, 10) / 100;
    }
    if (parts.length === 3) {
      const [hrs, mins, secs] = parts;
      return parseInt(hrs, 10) * 3600 + parseInt(mins, 10) * 60 + parseInt(secs, 10);
    }
    return 0;
  };

  const handleStartInputChange = (value: string) => {
    const time = parseTime(value);
    if (!Number.isNaN(time) && time >= 0 && time < localEnd) {
      setLocalStart(time);
      onStartChange(time);
    }
  };

  const handleEndInputChange = (value: string) => {
    const time = parseTime(value);
    if (!Number.isNaN(time) && time > localStart && time <= duration) {
      setLocalEnd(time);
      onEndChange(time);
    }
  };

  const trimmedDuration = localEnd - localStart;
  const trimPercentage = ((duration - trimmedDuration) / duration) * 100;

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-(--studio-bg) rounded-lg">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Scissors className="h-4 w-4" />
          <span>Trim Video</span>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-2">
          {/* Full timeline */}
          <div className="relative h-12 bg-zinc-800 rounded-md overflow-hidden">
            {/* Trimmed region highlight */}
            <div
              className="absolute top-0 bottom-0 bg-primary/20 border-l-2 border-r-2 border-primary"
              style={{
                left: `${(localStart / duration) * 100}%`,
                width: `${((localEnd - localStart) / duration) * 100}%`,
              }}
            />

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </div>

            {/* Time markers */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-1 text-[10px] text-zinc-500">
              <span>0:00</span>
              <span>{formatTime(duration / 4)}</span>
              <span>{formatTime(duration / 2)}</span>
              <span>{formatTime((duration * 3) / 4)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Range slider */}
          <Slider
            value={[localStart, localEnd]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={([start, end]) => {
              if (start < end) {
                setLocalStart(start);
                setLocalEnd(end);
                onStartChange(start);
                onEndChange(end);
              }
            }}
            className="w-full"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSeek(localStart)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to start</TooltipContent>
          </Tooltip>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-white/10"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSeek(localEnd)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to end</TooltipContent>
          </Tooltip>

          <span className="text-xs text-zinc-400 ml-4">{formatTime(currentTime)}</span>
        </div>

        {/* Precise Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Start Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-zinc-600" />
              <Input
                value={formatTime(localStart)}
                onChange={(e) => handleStartInputChange(e.target.value)}
                className="bg-(--studio-surface) border-white/10 text-sm font-mono"
                placeholder="0:00.00"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setLocalStart(currentTime);
                  onStartChange(currentTime);
                }}
              >
                Set
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">End Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-zinc-600" />
              <Input
                value={formatTime(localEnd)}
                onChange={(e) => handleEndInputChange(e.target.value)}
                className="bg-(--studio-surface) border-white/10 text-sm font-mono"
                placeholder="0:00.00"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setLocalEnd(currentTime);
                  onEndChange(currentTime);
                }}
              >
                Set
              </Button>
            </div>
          </div>
        </div>

        {/* Trim Info */}
        <div className="flex items-center justify-between text-xs text-zinc-500 py-2 border-t border-white/5">
          <span>Trimmed duration: {formatTime(trimmedDuration)}</span>
          <span className={trimPercentage > 0 ? 'text-orange-400' : ''}>
            {trimPercentage > 0 ? `-${trimPercentage.toFixed(1)}%` : 'No trim'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 border-white/10" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onApplyTrim}
            disabled={localStart === 0 && localEnd === duration}
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Trim
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Quick trim presets
 */
export function VideoTrimPresets({
  duration,
  onApplyPreset,
}: {
  duration: number;
  onApplyPreset: (start: number, end: number) => void;
}) {
  const presets = [
    { label: 'First 30s', start: 0, end: Math.min(30, duration) },
    { label: 'Last 30s', start: Math.max(0, duration - 30), end: duration },
    { label: 'First Half', start: 0, end: duration / 2 },
    { label: 'Second Half', start: duration / 2, end: duration },
    { label: 'Skip Intro (5s)', start: 5, end: duration },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          className="text-xs border-white/10"
          onClick={() => onApplyPreset(preset.start, preset.end)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
