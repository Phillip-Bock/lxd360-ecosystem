'use client';

import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type MissionPhase, useMissionStore } from '@/store/inspire';
import { useMissionControl } from './mission-control-provider';

// ============================================================================
// STEP VALIDATION
// ============================================================================

interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateStep(
  phase: MissionPhase,
  step: number,
  manifest: ReturnType<typeof useMissionStore.getState>['manifest'],
): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest) {
    return { isValid: false, errors: ['No mission loaded'], warnings: [] };
  }

  // Validate based on phase and step
  if (phase === 'encoding') {
    switch (step) {
      case 1: // Research & Industry
        if (!manifest.encoding?.industryAnalysis?.industry) {
          errors.push('Industry selection is required');
        }
        if (!manifest.encoding?.industryAnalysis?.topic) {
          warnings.push('Consider adding a topic for better guidance');
        }
        break;
      case 2: // Persona
        if ((manifest.encoding?.personas?.length ?? 0) === 0) {
          errors.push('At least one learner persona is required');
        }
        break;
      case 3: // ITLA
        if (!manifest.encoding?.activationStrategy) {
          errors.push('Activation strategy configuration is required');
        } else if ((manifest.encoding.activationStrategy.principles?.length ?? 0) < 2) {
          warnings.push('Consider selecting at least 2 neuroscience principles');
        }
        break;
      case 4: // ILMI
        if (!manifest.encoding?.modalityPlan) {
          errors.push('Modality plan is required');
        } else if (!manifest.encoding.modalityPlan.primaryModality) {
          errors.push('Primary modality must be selected');
        }
        break;
      case 5: // ICES
        if (!manifest.encoding?.engagementLevel) {
          errors.push('Engagement level configuration is required');
        }
        break;
    }
  } else if (phase === 'synthesization') {
    switch (step) {
      case 1: // IPMG
        if (!manifest.synthesization?.performanceMapping) {
          errors.push('Performance mapping is required');
        }
        break;
      case 2: // ICDT
        if (!manifest.synthesization?.cognitiveDemand) {
          warnings.push('Consider completing cognitive demand tagging');
        }
        break;
      case 3: // ICPF
        if (!manifest.synthesization?.capabilityProgression) {
          warnings.push('Capability progression helps with scaffolding');
        }
        break;
      case 4: // ICL
        if ((manifest.competencyLadder?.length ?? 0) === 0) {
          errors.push('At least one competency rung is required');
        }
        break;
    }
  } else if (phase === 'assimilation') {
    switch (step) {
      case 1: // Canvas setup
        if (!manifest.assimilation?.canvasConfig) {
          warnings.push('Canvas configuration recommended before adding blocks');
        }
        break;
      case 2: // Blocks
        if ((manifest.assimilation?.blocks?.length ?? 0) === 0) {
          errors.push('Add at least one content block');
        }
        break;
      case 3: // Export
        if (!manifest.assimilation?.exportConfig) {
          warnings.push('Configure export settings before publishing');
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

interface StepNavigationProps {
  className?: string;
  onSave?: () => Promise<void>;
}

/**
 * StepNavigation - Previous/Next step buttons with validation
 *
 * Features:
 * - Previous/Next navigation
 * - Step validation before progression
 * - Disabled states based on required fields
 * - Save button with loading state
 * - Progress indicator
 */
export function StepNavigation({ className, onSave }: StepNavigationProps) {
  const { wizardHintsVisible } = useMissionControl();
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const manifest = useMissionStore((state) => state.manifest);
  const isDirty = useMissionStore((state) => state.isDirty);
  const nextStep = useMissionStore((state) => state.nextStep);
  const prevStep = useMissionStore((state) => state.prevStep);
  const saveMission = useMissionStore((state) => state.saveMission);
  const getOverallProgress = useMissionStore((state) => state.getOverallProgress);

  const [isSaving, setIsSaving] = useState(false);

  // Get validation for current step
  const validation = useMemo(() => {
    return validateStep(currentPhase, currentStep, manifest);
  }, [currentPhase, currentStep, manifest]);

  // Check if we're on the first step
  const isFirstStep = useMemo(() => {
    return currentPhase === 'encoding' && currentStep === 1;
  }, [currentPhase, currentStep]);

  // Check if we're on the last step
  const isLastStep = useMemo(() => {
    return currentPhase === 'audit' && currentStep === 2;
  }, [currentPhase, currentStep]);

  // Get overall progress
  const progress = useMemo(() => getOverallProgress(), [getOverallProgress]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave();
      }
      saveMission();
    } finally {
      setIsSaving(false);
    }
  }, [onSave, saveMission]);

  // Handle next with validation
  const handleNext = useCallback(() => {
    if (validation.isValid) {
      nextStep();
    }
  }, [validation.isValid, nextStep]);

  return (
    <div className={cn('border-t border-lxd-dark-border bg-lxd-dark-surface', className)}>
      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Validation messages (if hints visible) */}
      {wizardHintsVisible && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="px-6 pt-3">
          {validation.errors.length > 0 && (
            <div className="text-sm text-red-500 space-y-1">
              {validation.errors.map((error, idx) => (
                <p key={idx}>• {error}</p>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="text-sm text-yellow-500 space-y-1 mt-1">
              {validation.warnings.map((warning, idx) => (
                <p key={idx}>• {warning}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side: Previous */}
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Center: Save */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isDirty ? (
                <Save className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {isSaving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isDirty ? 'Save your progress' : 'All changes saved'}</TooltipContent>
        </Tooltip>

        {/* Right side: Next / Complete */}
        {isLastStep ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validation.isValid}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Complete
              </Button>
            </TooltipTrigger>
            {!validation.isValid && (
              <TooltipContent>
                <p>Complete all required steps to finish</p>
              </TooltipContent>
            )}
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validation.isValid}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {!validation.isValid && (
              <TooltipContent>
                <p>Complete required fields to continue</p>
              </TooltipContent>
            )}
          </Tooltip>
        )}
      </div>
    </div>
  );
}
