'use client';

import { BookOpen, Brain, Compass, Glasses, MousePointerClick, Users } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { EngagementLevel } from '@/schemas/inspire';
import { ENGAGEMENT_LEVEL_CATALOG } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'book-open': BookOpen,
  brain: Brain,
  'mouse-pointer-click': MousePointerClick,
  users: Users,
  compass: Compass,
  vr: Glasses,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface EngagementSpectrumProps {
  value: EngagementLevel | undefined;
  onChange: (level: EngagementLevel) => void;
  className?: string;
}

/**
 * EngagementSpectrum - Visual selector for engagement levels
 * Displays as a spectrum from passive to immersive
 */
export function EngagementSpectrum({ value, onChange, className }: EngagementSpectrumProps) {
  const selectedLevel = ENGAGEMENT_LEVEL_CATALOG.find((e) => e.id === value);

  return (
    <div className={cn('space-y-4', className)}>
      <Label className="text-base font-medium">Engagement Level</Label>

      {/* Spectrum Visual */}
      <div className="relative">
        {/* Background Gradient Bar */}
        <div className="h-3 rounded-full bg-gradient-to-r from-gray-500 via-blue-500 via-indigo-500 via-emerald-500 to-purple-500" />

        {/* Level Buttons */}
        <div className="flex justify-between mt-2">
          {ENGAGEMENT_LEVEL_CATALOG.map((level) => {
            const Icon = ICON_MAP[level.icon];
            const isSelected = value === level.id;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onChange(level.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                  'hover:bg-lxd-dark-bg/50',
                  isSelected && 'bg-lxd-dark-bg ring-2 ring-lxd-purple',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-lxd-purple text-white'
                      : 'bg-lxd-dark-surface border border-lxd-dark-border',
                  )}
                >
                  {Icon && (
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-white' : level.color)} />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-lxd-purple' : 'text-muted-foreground',
                  )}
                >
                  {level.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cognitive Load Scale */}
        <div className="flex justify-between mt-1 px-4 text-xs text-muted-foreground">
          <span>Low Cognitive Load</span>
          <span>High Cognitive Load</span>
        </div>
      </div>

      {/* Selected Level Details */}
      {selectedLevel && (
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {(() => {
                  const Icon = ICON_MAP[selectedLevel.icon];
                  return Icon ? <Icon className={cn('h-5 w-5', selectedLevel.color)} /> : null;
                })()}
                {selectedLevel.name}
              </CardTitle>
              <Badge variant="outline">
                Load: {selectedLevel.cognitiveLoadRange.min}-{selectedLevel.cognitiveLoadRange.max}
              </Badge>
            </div>
            <CardDescription>{selectedLevel.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Examples */}
            <div>
              <h5 className="text-xs font-medium uppercase text-muted-foreground mb-2">Examples</h5>
              <div className="flex flex-wrap gap-1">
                {selectedLevel.examples.map((example) => (
                  <Badge key={example} variant="secondary" className="text-xs">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommended For */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium text-green-500 mb-2">Recommended For</h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {selectedLevel.recommendedFor.map((item) => (
                    <li key={item} className="flex items-start gap-1">
                      <span className="text-green-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-medium text-orange-500 mb-2">Not Recommended For</h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {selectedLevel.notRecommendedFor.map((item) => (
                    <li key={item} className="flex items-start gap-1">
                      <span className="text-orange-500">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
