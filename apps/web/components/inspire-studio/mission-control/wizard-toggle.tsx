'use client';

import { GraduationCap, Rocket, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useMissionStore } from '@/store/inspire';
import { useMissionControl } from './mission-control-provider';

// ============================================================================
// TYPES
// ============================================================================

type ExperienceLevel = 'novice' | 'intermediate' | 'advanced' | 'expert';

interface ExperienceLevelOption {
  value: ExperienceLevel;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const EXPERIENCE_LEVELS: ExperienceLevelOption[] = [
  {
    value: 'novice',
    label: 'Novice',
    description: 'New to instructional design',
    icon: GraduationCap,
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some ID experience',
    icon: Sparkles,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced designer',
    icon: Rocket,
  },
  {
    value: 'expert',
    label: 'Expert',
    description: 'Senior architect level',
    icon: Rocket,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface WizardToggleProps {
  className?: string;
}

/**
 * WizardToggle - "NASA Toggle" for Novice/Senior Architect mode
 *
 * Features:
 * - Toggle wizard hints on/off
 * - Select experience level for time estimates
 * - Persists preferences to localStorage
 */
export function WizardToggle({ className }: WizardToggleProps) {
  const { wizardHintsVisible, toggleWizardHints, experienceLevel, setExperienceLevel } =
    useMissionControl();
  const wizardEnabled = useMissionStore((state) => state.wizardEnabled);
  const toggleWizard = useMissionStore((state) => state.toggleWizard);

  // Current experience level config
  const currentLevel = useMemo(
    () => EXPERIENCE_LEVELS.find((l) => l.value === experienceLevel) ?? EXPERIENCE_LEVELS[1],
    [experienceLevel],
  );

  const CurrentIcon = currentLevel.icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('gap-2', className)}
          aria-label="Wizard settings"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLevel.label}</span>
          {wizardEnabled && (
            <span className="h-2 w-2 rounded-full bg-lxd-purple" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-semibold">Wizard Settings</h3>
            <p className="text-sm text-muted-foreground">Customize your learning experience</p>
          </div>

          <Separator />

          {/* Wizard mode toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="wizard-mode" className="text-sm font-medium">
                Wizard Mode
              </Label>
              <p className="text-xs text-muted-foreground">Enable guided step-by-step experience</p>
            </div>
            <Switch
              id="wizard-mode"
              checked={wizardEnabled}
              onCheckedChange={toggleWizard}
              aria-describedby="wizard-mode-description"
            />
          </div>

          {/* Hints toggle (only when wizard enabled) */}
          {wizardEnabled && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="wizard-hints" className="text-sm font-medium">
                  Show Hints
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display helpful tips and descriptions
                </p>
              </div>
              <Switch
                id="wizard-hints"
                checked={wizardHintsVisible}
                onCheckedChange={toggleWizardHints}
                aria-describedby="wizard-hints-description"
              />
            </div>
          )}

          <Separator />

          {/* Experience level selector */}
          <div className="space-y-2">
            <Label htmlFor="experience-level" className="text-sm font-medium">
              Experience Level
            </Label>
            <p className="text-xs text-muted-foreground">
              Adjusts time estimates and AI suggestions
            </p>
            <Select
              value={experienceLevel}
              onValueChange={(value) => setExperienceLevel(value as ExperienceLevel)}
            >
              <SelectTrigger id="experience-level" className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => {
                  const Icon = level.icon;
                  return (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <span className="font-medium">{level.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {level.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Current mode indicator */}
          <div className="bg-lxd-dark-hover rounded-md p-3 text-center">
            <p className="text-sm">
              {wizardEnabled ? (
                <>
                  <span className="text-lxd-purple font-medium">Wizard Mode Active</span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {currentLevel.description} - Full guidance enabled
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium">Expert Mode</span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Minimal guidance - for experienced designers
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
