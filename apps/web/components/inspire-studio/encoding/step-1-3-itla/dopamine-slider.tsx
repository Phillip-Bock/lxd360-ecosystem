'use client';

import { Gamepad2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { getDopamineLabel } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface DopamineSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * DopamineSlider - Gamification intensity control
 *
 * Controls how much gamification/dopamine-triggering mechanics
 * to apply throughout the learning experience.
 */
export function DopamineSlider({ value, onChange, className }: DopamineSliderProps) {
  const { label, description } = getDopamineLabel(value);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-lxd-purple" />
          Gamification Intensity
        </Label>
        <span className="text-sm font-medium">
          <span className="text-lxd-cyan">{value}/10</span>
          <span className="text-muted-foreground ml-2">— {label}</span>
        </span>
      </div>

      <div className="space-y-3">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v ?? value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Traditional</span>
          <span>Balanced</span>
          <span>Gamified</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Visual Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-lxd-dark-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(value / 10) * 100}%`,
              background: `linear-gradient(90deg,
                hsl(210, 100%, 50%) 0%,
                hsl(280, 100%, 60%) 50%,
                hsl(320, 100%, 50%) 100%)`,
            }}
          />
        </div>
      </div>

      {/* Gamification Features by Level */}
      <div className="grid grid-cols-5 gap-1 text-xs">
        <GamificationFeature level={1} current={value} features={['Progress bars']} />
        <GamificationFeature level={3} current={value} features={['Badges', 'Points']} />
        <GamificationFeature level={5} current={value} features={['Achievements', 'Streaks']} />
        <GamificationFeature level={7} current={value} features={['Leaderboards', 'Challenges']} />
        <GamificationFeature level={9} current={value} features={['Story mode', 'Competitions']} />
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface GamificationFeatureProps {
  level: number;
  current: number;
  features: string[];
}

function GamificationFeature({ level, current, features }: GamificationFeatureProps) {
  const isActive = current >= level;

  return (
    <div
      className={cn(
        'p-2 rounded text-center transition-colors',
        isActive ? 'bg-lxd-purple/20 text-foreground' : 'bg-lxd-dark-bg/30 text-muted-foreground',
      )}
    >
      {features.map((f) => (
        <div key={f} className="truncate">
          {f}
        </div>
      ))}
    </div>
  );
}
