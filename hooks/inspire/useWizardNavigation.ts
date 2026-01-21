'use client';

import { useCallback, useMemo } from 'react';
import {
  calculateProgress,
  type ExtendedWizardStep,
  getAvailableSteps,
  getPhaseForStep,
  WIZARD_STEPS,
} from '@/lib/inspire/types/wizard-config';
import { type MissionPhase, useMissionStore } from '@/store/inspire';

// ============================================================================
// TYPES
// ============================================================================

interface WizardNavigationState {
  /** Current phase */
  currentPhase: MissionPhase;

  /** Current step number within phase */
  currentStep: number;

  /** Global step number (1-17) */
  globalStepNumber: number;

  /** Current step configuration */
  currentStepConfig: ExtendedWizardStep | undefined;

  /** Can navigate to previous step */
  canGoPrev: boolean;

  /** Can navigate to next step (not locked) */
  canGoNext: boolean;

  /** Is next step disabled (validation failed) */
  isNextDisabled: boolean;

  /** Completed step numbers */
  completedSteps: number[];

  /** Available step numbers (prerequisites met) */
  availableSteps: number[];

  /** Overall progress percentage */
  progressPercentage: number;
}

interface WizardNavigationActions {
  /** Go to next step */
  goToNext: () => void;

  /** Go to previous step */
  goToPrev: () => void;

  /** Go to specific step */
  goToStep: (stepNumber: number) => void;

  /** Go to specific phase and step */
  goToPhaseStep: (phase: MissionPhase, step: number) => void;

  /** Check if step is complete */
  isStepComplete: (stepNumber: number) => boolean;

  /** Check if step is locked */
  isStepLocked: (stepNumber: number) => boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useWizardNavigation - Multi-step controller logic for INSPIRE wizard
 *
 * Provides:
 * - Current step/phase state
 * - Navigation actions
 * - Step validation
 * - Progress tracking
 */
export function useWizardNavigation(): WizardNavigationState & WizardNavigationActions {
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const manifest = useMissionStore((state) => state.manifest);
  const setPhase = useMissionStore((state) => state.setPhase);
  const setStep = useMissionStore((state) => state.setStep);
  const storeNextStep = useMissionStore((state) => state.nextStep);
  const storePrevStep = useMissionStore((state) => state.prevStep);

  // Calculate global step number from phase and local step
  const globalStepNumber = useMemo(() => {
    const phaseOffsets: Record<MissionPhase, number> = {
      encoding: 0,
      synthesization: 4,
      assimilation: 9,
      audit: 14,
    };
    return phaseOffsets[currentPhase] + currentStep;
  }, [currentPhase, currentStep]);

  // Get current step configuration
  const currentStepConfig = useMemo(() => {
    return WIZARD_STEPS.find((step) => step.stepNumber === globalStepNumber);
  }, [globalStepNumber]);

  // Determine completed steps from manifest
  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    if (!manifest) return completed;

    // Check encoding steps (1-5)
    if (manifest.encoding?.industryAnalysis) completed.push(1);
    if ((manifest.encoding?.personas?.length ?? 0) > 0) completed.push(2);
    if (manifest.encoding?.activationStrategy) completed.push(3);
    if (manifest.encoding?.modalityPlan) completed.push(4);
    if (manifest.encoding?.engagementLevel) completed.push(5);

    // Check synthesization steps (6-9) - mapped to local 1-4
    if (manifest.synthesization?.performanceMapping) completed.push(6);
    if (manifest.synthesization?.cognitiveDemand) completed.push(7);
    if (manifest.synthesization?.capabilityProgression) completed.push(8);
    if (manifest.synthesization?.competencyLadder) completed.push(9);

    // Check assimilation steps (10-14) - mapped to local 1-5
    if (manifest.assimilation?.canvasConfig) completed.push(10);
    if ((manifest.assimilation?.blocks?.length ?? 0) > 0) completed.push(11);
    if (manifest.assimilation?.exportConfig) completed.push(12);
    // Steps 13-14 are for review/launch

    // Audit steps (15-17) - typically final review
    // These are usually marked manually

    return completed;
  }, [manifest]);

  // Get available steps (prerequisites met)
  const availableSteps = useMemo(() => {
    return getAvailableSteps(completedSteps);
  }, [completedSteps]);

  // Check if we can go to previous
  const canGoPrev = useMemo(() => {
    return !(currentPhase === 'encoding' && currentStep === 1);
  }, [currentPhase, currentStep]);

  // Check if we can go to next (step exists)
  const canGoNext = useMemo(() => {
    return !(currentPhase === 'audit' && currentStep === 2);
  }, [currentPhase, currentStep]);

  // Check if next is disabled (validation)
  const isNextDisabled = useMemo(() => {
    // For now, just check if current step is complete or optional
    if (!currentStepConfig) return false;
    if (!currentStepConfig.required) return false;
    return !completedSteps.includes(globalStepNumber);
  }, [currentStepConfig, completedSteps, globalStepNumber]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    return calculateProgress(completedSteps);
  }, [completedSteps]);

  // Navigation actions
  const goToNext = useCallback(() => {
    if (canGoNext && !isNextDisabled) {
      storeNextStep();
    }
  }, [canGoNext, isNextDisabled, storeNextStep]);

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      storePrevStep();
    }
  }, [canGoPrev, storePrevStep]);

  const goToStep = useCallback(
    (stepNumber: number) => {
      const step = WIZARD_STEPS.find((s) => s.stepNumber === stepNumber);
      if (!step) return;

      const phase = getPhaseForStep(stepNumber);
      if (!phase) return;

      // Map phase number to MissionPhase
      const phaseMap: Record<number, MissionPhase> = {
        1: 'encoding',
        2: 'synthesization',
        3: 'assimilation',
        4: 'audit',
      };

      const missionPhase = phaseMap[phase.phaseNumber];
      if (!missionPhase) return;

      // Calculate local step within phase
      const phaseSteps = phase.steps;
      const localStep = phaseSteps.indexOf(stepNumber) + 1;

      setPhase(missionPhase);
      setStep(localStep);
    },
    [setPhase, setStep],
  );

  const goToPhaseStep = useCallback(
    (phase: MissionPhase, step: number) => {
      setPhase(phase);
      setStep(step);
    },
    [setPhase, setStep],
  );

  const isStepComplete = useCallback(
    (stepNumber: number) => {
      return completedSteps.includes(stepNumber);
    },
    [completedSteps],
  );

  const isStepLocked = useCallback(
    (stepNumber: number) => {
      const step = WIZARD_STEPS.find((s) => s.stepNumber === stepNumber);
      if (!step) return true;

      // Check prerequisites
      return !step.prerequisites.every((prereq) => completedSteps.includes(prereq));
    },
    [completedSteps],
  );

  return {
    // State
    currentPhase,
    currentStep,
    globalStepNumber,
    currentStepConfig,
    canGoPrev,
    canGoNext,
    isNextDisabled,
    completedSteps,
    availableSteps,
    progressPercentage,

    // Actions
    goToNext,
    goToPrev,
    goToStep,
    goToPhaseStep,
    isStepComplete,
    isStepLocked,
  };
}
