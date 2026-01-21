'use client';

import { RotateCcw, TrendingDown, TrendingUp, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VolumeControlsProps {
  volume: number;
  fadeIn: number;
  fadeOut: number;
  onVolumeChange: (volume: number) => void;
  onFadeInChange: (duration: number) => void;
  onFadeOutChange: (duration: number) => void;
  onReset: () => void;
  duration: number;
}

/**
 * VolumeControls - Volume, fade in, and fade out controls for audio
 */
export function VolumeControls({
  volume,
  fadeIn,
  fadeOut,
  onVolumeChange,
  onFadeInChange,
  onFadeOutChange,
  onReset,
  duration,
}: VolumeControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
    }
    setIsMuted(!isMuted);
  };

  const maxFade = duration / 2; // Max fade is half the duration
  const showMutedIcon = volume === 0 || isMuted;
  const showLowVolumeIcon = !showMutedIcon && volume < 0.5;

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Volume2 className="h-4 w-4" />
            <span>Volume & Fades</span>
          </div>
          <Button variant="ghost" size="sm" className="text-zinc-500 h-8" onClick={onReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Main Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-500">Volume</Label>
            <span className="text-xs text-zinc-400">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMuteToggle}>
                  {showMutedIcon && <VolumeX className="h-4 w-4 text-red-400" />}
                  {showLowVolumeIcon && <Volume1 className="h-4 w-4" />}
                  {!showMutedIcon && !showLowVolumeIcon && <Volume2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
            </Tooltip>

            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1.5}
              step={0.01}
              onValueChange={([v]) => {
                if (isMuted) setIsMuted(false);
                onVolumeChange(v);
              }}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-zinc-600">
            {volume > 1 ? 'Boosted' : volume < 1 ? 'Reduced' : 'Original'} volume
          </p>
        </div>

        {/* Fade Controls */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
          {/* Fade In */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <Label className="text-xs text-zinc-500">Fade In</Label>
            </div>
            <Slider
              value={[fadeIn]}
              min={0}
              max={maxFade}
              step={0.1}
              onValueChange={([v]) => onFadeInChange(v)}
            />
            <span className="text-xs text-zinc-400 block text-right">{fadeIn.toFixed(1)}s</span>
          </div>

          {/* Fade Out */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-orange-400" />
              <Label className="text-xs text-zinc-500">Fade Out</Label>
            </div>
            <Slider
              value={[fadeOut]}
              min={0}
              max={maxFade}
              step={0.1}
              onValueChange={([v]) => onFadeOutChange(v)}
            />
            <span className="text-xs text-zinc-400 block text-right">{fadeOut.toFixed(1)}s</span>
          </div>
        </div>

        {/* Fade Visualization */}
        <FadeVisualization duration={duration} fadeIn={fadeIn} fadeOut={fadeOut} volume={volume} />
      </div>
    </TooltipProvider>
  );
}

/**
 * Visual representation of fade curves
 */
function FadeVisualization({
  duration,
  fadeIn,
  fadeOut,
  volume,
}: {
  duration: number;
  fadeIn: number;
  fadeOut: number;
  volume: number;
}) {
  const height = 40;
  const width = 200;

  const fadeInWidth = (fadeIn / duration) * width;
  const fadeOutWidth = (fadeOut / duration) * width;
  const sustainWidth = width - fadeInWidth - fadeOutWidth;

  const volumeHeight = Math.min(volume, 1) * height;

  // SVG path for fade envelope
  const path = `
    M 0 ${height}
    L 0 ${height}
    L ${fadeInWidth} ${height - volumeHeight}
    L ${fadeInWidth + sustainWidth} ${height - volumeHeight}
    L ${width} ${height}
    L ${width} ${height}
    Z
  `;

  return (
    <div className="flex justify-center py-2">
      <svg
        aria-hidden="true"
        width={width}
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill="rgba(255,255,255,0.05)" rx={4} />

        {/* Fade envelope */}
        <path d={path} fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" strokeWidth={1} />

        {/* Center line */}
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="4 2"
        />

        {/* Fade markers */}
        {fadeIn > 0 && (
          <line
            x1={fadeInWidth}
            y1={0}
            x2={fadeInWidth}
            y2={height}
            stroke="rgba(0, 212, 255, 0.5)"
            strokeDasharray="2 2"
          />
        )}
        {fadeOut > 0 && (
          <line
            x1={width - fadeOutWidth}
            y1={0}
            x2={width - fadeOutWidth}
            y2={height}
            stroke="rgba(255, 152, 0, 0.5)"
            strokeDasharray="2 2"
          />
        )}
      </svg>
    </div>
  );
}

/**
 * Preset volume levels
 */
export function VolumePresets({
  onApply,
}: {
  onApply: (volume: number, fadeIn: number, fadeOut: number) => void;
}) {
  const presets = [
    { label: 'Quiet', volume: 0.5, fadeIn: 0, fadeOut: 0 },
    { label: 'Normal', volume: 1, fadeIn: 0, fadeOut: 0 },
    { label: 'Loud', volume: 1.25, fadeIn: 0, fadeOut: 0 },
    { label: 'Smooth', volume: 1, fadeIn: 1, fadeOut: 1 },
    { label: 'Dramatic', volume: 1, fadeIn: 2, fadeOut: 0.5 },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          className="text-xs border-white/10"
          onClick={() => onApply(preset.volume, preset.fadeIn, preset.fadeOut)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
