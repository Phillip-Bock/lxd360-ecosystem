'use client';

import { Check, Clock, RotateCcw, Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrimControlsProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
  onApplyTrim: () => void;
  onReset: () => void;
}

/**
 * TrimControls - Start/end time controls for audio trimming
 */
export function TrimControls({
  duration,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  onApplyTrim,
  onReset,
}: TrimControlsProps) {
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const [mins, secsPart] = parts;
      const [secs, ms = '0'] = secsPart.split('.');
      return parseInt(mins, 10) * 60 + parseInt(secs, 10) + parseInt(ms, 10) / 100;
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
      <div className="space-y-4 p-4 bg-[#0d0d14] rounded-lg">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Scissors className="h-4 w-4" />
          <span>Trim Audio</span>
        </div>

        {/* Time Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Start: {formatTime(localStart)}</span>
            <span>End: {formatTime(localEnd)}</span>
          </div>

          <div className="relative pt-4 pb-2">
            <Slider
              value={[localStart, localEnd]}
              min={0}
              max={duration}
              step={0.01}
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
        </div>

        {/* Precise Time Inputs */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1 block">Start Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-zinc-600" />
              <Input
                value={formatTime(localStart)}
                onChange={(e) => handleStartInputChange(e.target.value)}
                className="bg-[#1a1a2e] border-white/10 text-sm font-mono"
                placeholder="0:00.00"
              />
            </div>
          </div>

          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1 block">End Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-zinc-600" />
              <Input
                value={formatTime(localEnd)}
                onChange={(e) => handleEndInputChange(e.target.value)}
                className="bg-[#1a1a2e] border-white/10 text-sm font-mono"
                placeholder="0:00.00"
              />
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/10"
                onClick={onReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to original length</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="flex-1"
                onClick={onApplyTrim}
                disabled={localStart === 0 && localEnd === duration}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Trim
              </Button>
            </TooltipTrigger>
            <TooltipContent>Apply trim to audio</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Quick trim presets for common operations
 */
export function TrimPresets({
  duration,
  onApplyPreset,
}: {
  duration: number;
  onApplyPreset: (start: number, end: number) => void;
}) {
  const presets = [
    { label: 'Trim Start 1s', start: 1, end: duration },
    { label: 'Trim End 1s', start: 0, end: Math.max(0, duration - 1) },
    { label: 'First Half', start: 0, end: duration / 2 },
    { label: 'Second Half', start: duration / 2, end: duration },
    { label: 'Middle 50%', start: duration * 0.25, end: duration * 0.75 },
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
