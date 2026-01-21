'use client';

import { Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ScaffoldingConfig } from '@/schemas/inspire';
import {
  FADE_RATE_OPTIONS,
  getProficiencyLevelOption,
  PROFICIENCY_LEVEL_CATALOG,
  SUPPORT_TYPE_OPTIONS,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface ScaffoldingConfiguratorProps {
  scaffolding: ScaffoldingConfig[];
  onChange: (scaffolding: ScaffoldingConfig[]) => void;
  className?: string;
}

/**
 * ScaffoldingConfigurator - Configure scaffolding for each proficiency level
 * Shows hint visibility, support type, and fade rate per level
 */
export function ScaffoldingConfigurator({
  scaffolding,
  onChange,
  className,
}: ScaffoldingConfiguratorProps) {
  const updateConfig = (index: number, updates: Partial<ScaffoldingConfig>) => {
    const newScaffolding = [...scaffolding];
    newScaffolding[index] = { ...newScaffolding[index], ...updates };
    onChange(newScaffolding);
  };

  if (scaffolding.length === 0) {
    return (
      <div
        className={cn(
          'p-6 text-center border border-dashed border-lxd-dark-border rounded-lg',
          className,
        )}
      >
        <Settings2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          Select starting and target proficiency levels to configure scaffolding.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-lxd-purple" />
          Scaffolding Configuration
        </h4>
        <Badge variant="outline">{scaffolding.length} levels</Badge>
      </div>

      <div className="space-y-4">
        {scaffolding.map((config, index) => {
          const levelOption = getProficiencyLevelOption(config.level);

          return (
            <div
              key={config.level}
              className="p-4 rounded-lg bg-lxd-dark-bg/50 border border-lxd-dark-border"
            >
              {/* Level Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      'bg-lxd-dark-surface border border-lxd-dark-border',
                      levelOption?.color,
                    )}
                  >
                    {levelOption?.level ?? index + 1}
                  </div>
                  <div>
                    <p className={cn('font-medium', levelOption?.color)}>
                      {levelOption?.label ?? config.level}
                    </p>
                    <p className="text-xs text-muted-foreground">{levelOption?.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hint Visibility */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Hint Visibility</Label>
                    <span className="text-xs font-medium text-lxd-cyan">
                      {config.hintVisibility}%
                    </span>
                  </div>
                  <Slider
                    value={[config.hintVisibility]}
                    onValueChange={([v]) => updateConfig(index, { hintVisibility: v })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Support Type */}
                <div className="space-y-2">
                  <Label className="text-xs">Support Type</Label>
                  <Select
                    value={config.supportType}
                    onValueChange={(v) =>
                      updateConfig(index, { supportType: v as ScaffoldingConfig['supportType'] })
                    }
                  >
                    <SelectTrigger className="bg-lxd-dark-surface border-lxd-dark-border h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                      {SUPPORT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fade Rate */}
                <div className="space-y-2">
                  <Label className="text-xs">Fade Rate</Label>
                  <Select
                    value={config.fadeRate}
                    onValueChange={(v) =>
                      updateConfig(index, { fadeRate: v as ScaffoldingConfig['fadeRate'] })
                    }
                  >
                    <SelectTrigger className="bg-lxd-dark-surface border-lxd-dark-border h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
                      {FADE_RATE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Fade Preview */}
      <div className="p-3 rounded-lg bg-lxd-dark-bg/30 border border-lxd-dark-border">
        <p className="text-xs text-muted-foreground mb-2">Hint Visibility Progression</p>
        <div className="flex items-end gap-1 h-16">
          {scaffolding.map((config, index) => {
            const levelOption = getProficiencyLevelOption(config.level);
            return (
              <div key={config.level} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-lxd-purple/40 rounded-t transition-all"
                  style={{ height: `${Math.max(4, (config.hintVisibility / 100) * 64)}px` }}
                />
                <span className={cn('text-[10px]', levelOption?.color)}>
                  {PROFICIENCY_LEVEL_CATALOG[index]?.label.substring(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
