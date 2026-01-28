'use client';

import {
  Brain,
  CalendarClock,
  Focus,
  Gauge,
  Heart,
  Layers,
  Lightbulb,
  MapPin,
  MessageCircleWarning,
  Moon,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { NeuroPrinciple, NeuroPrincipleConfig } from '@/schemas/inspire';
import { NEURO_PRINCIPLE_CATALOG, type NeuroPrincipleOption } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'calendar-clock': CalendarClock,
  brain: Brain,
  heart: Heart,
  layers: Layers,
  sparkles: Sparkles,
  gauge: Gauge,
  users: Users,
  'message-circle-warning': MessageCircleWarning,
  lightbulb: Lightbulb,
  'map-pin': MapPin,
  trophy: Trophy,
  focus: Focus,
  moon: Moon,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface PrincipleSelectorProps {
  selectedPrinciples: NeuroPrincipleConfig[];
  onPrinciplesChange: (principles: NeuroPrincipleConfig[]) => void;
  aiRecommendations?: NeuroPrinciple[];
  className?: string;
}

/**
 * PrincipleSelector - Grid selector for neuroscience principles
 */
export function PrincipleSelector({
  selectedPrinciples,
  onPrinciplesChange,
  aiRecommendations = [],
  className,
}: PrincipleSelectorProps) {
  const selectedIds = new Set(selectedPrinciples.filter((p) => p.enabled).map((p) => p.principle));

  const togglePrinciple = (principle: NeuroPrincipleOption) => {
    const existing = selectedPrinciples.find((p) => p.principle === principle.id);

    if (existing) {
      // Toggle enabled state
      onPrinciplesChange(
        selectedPrinciples.map((p) =>
          p.principle === principle.id ? { ...p, enabled: !p.enabled } : p,
        ),
      );
    } else {
      // Add new principle
      onPrinciplesChange([
        ...selectedPrinciples,
        {
          principle: principle.id,
          enabled: true,
          priority: 5,
          techniques: principle.techniques.slice(0, 2),
        },
      ]);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Neuroscience Principles</Label>
        <Badge variant="outline">
          {selectedIds.size} / {NEURO_PRINCIPLE_CATALOG.length} selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {NEURO_PRINCIPLE_CATALOG.map((principle) => {
          const Icon = ICON_MAP[principle.icon];
          const isSelected = selectedIds.has(principle.id);
          const isRecommended = aiRecommendations.includes(principle.id);

          return (
            <Card
              key={principle.id}
              className={cn(
                'relative cursor-pointer transition-all border-2',
                'bg-lxd-dark-surface hover:bg-lxd-dark-bg/50',
                isSelected ? 'border-lxd-purple bg-lxd-purple/5' : 'border-lxd-dark-border',
              )}
              onClick={() => togglePrinciple(principle)}
            >
              {isRecommended && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-lxd-cyan text-black text-xs">AI Pick</Badge>
                </div>
              )}

              <CardHeader className="p-4 pb-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => togglePrinciple(principle)}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {Icon && <Icon className={cn('h-4 w-4', principle.color)} />}
                      <span className="truncate">{principle.name}</span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <CardDescription className="text-xs line-clamp-2">
                  {principle.description}
                </CardDescription>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-lxd-dark-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-lxd-cyan">Techniques: </span>
                      {principle.techniques.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedIds.size > 0 && (
        <div className="p-3 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Active principles: </span>
            {Array.from(selectedIds)
              .map((id) => NEURO_PRINCIPLE_CATALOG.find((p) => p.id === id)?.name)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
