'use client';

import { Pause, Play, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

const PRESETS = [
  { label: '25m', seconds: 25 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '60m', seconds: 60 * 60 },
];

export default function TimerWidget() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60); // Default 25 min
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  const selectPreset = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Could add notification/sound here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  return (
    <WidgetWrapper title="Focus Timer" size={1}>
      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 mb-3">
          <svg aria-hidden="true" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-primary transition-all duration-300"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            />
          </svg>
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'text-lg font-mono font-semibold',
                remainingSeconds === 0 ? 'text-green-400' : 'text-white',
              )}
            >
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-1">
          {PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={() => selectPreset(preset.seconds)}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                totalSeconds === preset.seconds
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}
