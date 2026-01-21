'use client';

import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { ExperienceLevel } from '@/lib/inspire/types/inspire-types';

import {
  calculateProgress,
  type ExtendedWizardStep,
  estimateTimeRemaining,
  getPhaseForStep,
  WIZARD_PHASES,
  WIZARD_STEPS,
  type WizardPhase,
} from '@/lib/inspire/types/wizard-config';
import { useAccessibility } from '../accessibility/AccessibilityProvider';

// ============================================================================
// SECTION 1: COMPONENT PROPS & TYPES
// ============================================================================

/**
 * Step completion status
 * Each step can be in one of these states
 */
export type StepStatus =
  | 'completed' // User has finished this step
  | 'current' // User is currently on this step
  | 'available' // Prerequisites met, can be started
  | 'locked' // Prerequisites not met
  | 'skipped'; // Optional step that was skipped

/**
 * Step status data for tracking completion
 */
export interface StepStatusData {
  stepNumber: number;
  status: StepStatus;
  completedAt?: Date;
  timeSpent?: number; // minutes
  notes?: string;
}

/**
 * Props for the WizardNavigation component
 */
interface WizardNavigationProps {
  /** Map of step numbers to their status */
  stepStatuses: Map<number, StepStatusData>;

  /** Currently active step number */
  currentStep: number;

  /** Callback when user clicks on a step */
  onStepClick: (stepNumber: number) => void;

  /** User's experience level (affects time estimates) */
  experienceLevel: ExperienceLevel;

  /** View mode for different UI contexts */
  viewMode?: 'full' | 'compact' | 'sidebar' | 'phases-only';

  /** Whether to show time estimates */
  showTimeEstimates?: boolean;

  /** Whether to show phase headers */
  showPhases?: boolean;

  /** Whether navigation is disabled (e.g., during save) */
  disabled?: boolean;

  /** Custom class name */
  className?: string;
}

/**
 * Color configurations for each phase
 * These colors are used consistently throughout the wizard
 */
const PHASE_COLORS: Record<
  number,
  {
    bg: string;
    bgLight: string;
    text: string;
    border: string;
    icon: string;
  }
> = {
  1: {
    // Discovery & Analysis - Deep Blue
    bg: 'bg-brand-primary',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-brand-primary',
    icon: '🔍',
  },
  2: {
    // Design & Architecture - Purple
    bg: 'bg-brand-secondary',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-brand-secondary',
    icon: '📐',
  },
  3: {
    // Development & Production - Green
    bg: 'bg-brand-success',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-brand-success',
    icon: '🛠️',
  },
  4: {
    // Deployment & Optimization - Red/Orange
    bg: 'bg-orange-600',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-500',
    icon: '🚀',
  },
};

/**
 * Status colors and icons
 * Designed for clear visual distinction and accessibility
 */
const STATUS_STYLES: Record<
  StepStatus,
  {
    bg: string;
    text: string;
    border: string;
    icon: string;
    label: string;
  }
> = {
  completed: {
    bg: 'bg-brand-success',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-brand-success',
    icon: '✓',
    label: 'Completed',
  },
  current: {
    bg: 'bg-brand-primary',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-brand-primary ring-4 ring-blue-200 dark:ring-blue-800',
    icon: '→',
    label: 'Current step',
  },
  available: {
    bg: 'bg-gray-200 dark:bg-gray-600',
    text: 'text-brand-secondary dark:text-brand-secondary',
    border: 'border-brand-strong dark:border-gray-500',
    icon: '',
    label: 'Available',
  },
  locked: {
    bg: 'bg-brand-surface dark:bg-brand-surface-hover',
    text: 'text-brand-muted dark:text-lxd-tertiary',
    border: 'border-brand-default dark:border-brand-default',
    icon: '🔒',
    label: 'Locked - complete prerequisites first',
  },
  skipped: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-400',
    icon: '⏭️',
    label: 'Skipped',
  },
};

// ============================================================================
// SECTION 2: HELPER FUNCTIONS
// ============================================================================

/**
 * Determines the status of a step based on completion data
 *
 * Why this logic?
 * - We need to check if prerequisites are met before allowing access
 * - Current step takes priority over other statuses
 * - Locked steps prevent learners from jumping ahead (scaffolding)
 */
function determineStepStatus(
  stepNumber: number,
  stepStatuses: Map<number, StepStatusData>,
  currentStep: number,
  stepConfig: ExtendedWizardStep,
): StepStatus {
  // Check if this is the current step
  if (stepNumber === currentStep) {
    return 'current';
  }

  // Check if we have explicit status data
  const statusData = stepStatuses.get(stepNumber);
  if (statusData?.status === 'completed') {
    return 'completed';
  }
  if (statusData?.status === 'skipped') {
    return 'skipped';
  }

  // Check prerequisites
  const prerequisitesMet = stepConfig.prerequisites.every((prereq: number) => {
    const prereqStatus = stepStatuses.get(prereq);
    return prereqStatus?.status === 'completed' || prereqStatus?.status === 'skipped';
  });

  if (!prerequisitesMet) {
    return 'locked';
  }

  return 'available';
}

/**
 * Calculate phase progress
 * Returns percentage of steps completed in a phase
 */
function calculatePhaseProgress(
  phase: WizardPhase,
  stepStatuses: Map<number, StepStatusData>,
): number {
  const phaseSteps = WIZARD_STEPS.filter((step) => step.phase === phase.phaseNumber);
  const completedSteps = phaseSteps.filter((step) => {
    const status = stepStatuses.get(step.stepNumber);
    return status?.status === 'completed' || status?.status === 'skipped';
  });

  return phaseSteps.length > 0 ? (completedSteps.length / phaseSteps.length) * 100 : 0;
}

/**
 * Convert step statuses map to completed steps array for helper functions
 */
function getCompletedStepsArray(stepStatuses: Map<number, StepStatusData>): number[] {
  const completed: number[] = [];
  stepStatuses.forEach((data, stepNum) => {
    if (data.status === 'completed' || data.status === 'skipped') {
      completed.push(stepNum);
    }
  });
  return completed;
}

// ============================================================================
// SECTION 3: SUB-COMPONENTS
// ============================================================================

/**
 * Individual Step Indicator
 * Shows the status of a single step with accessibility support
 */
interface StepIndicatorProps {
  step: ExtendedWizardStep;
  status: StepStatus;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  showLabel?: boolean;
  showTimeEstimate?: boolean;
  experienceLevel: ExperienceLevel;
  compact?: boolean;
}

function StepIndicator({
  step,
  status,
  isActive,
  onClick,
  disabled,
  showLabel = true,
  showTimeEstimate = false,
  experienceLevel,
  compact = false,
}: StepIndicatorProps): React.JSX.Element {
  const styles = STATUS_STYLES[status];
  const phase = getPhaseForStep(step.stepNumber);
  const phaseColors = PHASE_COLORS[phase?.phaseNumber || 1];

  // Determine if clickable
  const isClickable = !disabled && status !== 'locked';

  // Get time estimate for this step
  const timeEstimate = step.timeByLevel[experienceLevel];

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`
        group flex items-center gap-3 w-full p-3 rounded-lg
        transition-all duration-200
        ${isActive ? `${phaseColors.bgLight} ${phaseColors.border} border-2` : ''}
        ${isClickable ? 'hover:bg-brand-surface dark:hover:bg-brand-surface cursor-pointer' : 'cursor-not-allowed'}
        ${status === 'locked' ? 'opacity-60' : ''}
        focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
      `}
      aria-label={`Step ${step.stepNumber}: ${step.name}. ${styles.label}`}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Step number circle */}
      <div
        className={`
          shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          font-bold text-brand-primary
          ${status === 'completed' ? 'bg-brand-success' : ''}
          ${status === 'current' ? phaseColors.bg : ''}
          ${status === 'available' ? 'bg-gray-300 dark:bg-gray-600' : ''}
          ${status === 'locked' ? 'bg-gray-200 dark:bg-brand-surface-hover' : ''}
          ${status === 'skipped' ? 'bg-yellow-400' : ''}
          ${isActive ? 'ring-4 ring-offset-2 ring-blue-200 dark:ring-blue-800' : ''}
        `}
      >
        {status === 'completed' ? (
          <span aria-hidden="true">✓</span>
        ) : status === 'locked' ? (
          <span aria-hidden="true" className="text-brand-muted">
            🔒
          </span>
        ) : status === 'skipped' ? (
          <span aria-hidden="true">⏭️</span>
        ) : (
          <span>{step.stepNumber}</span>
        )}
      </div>

      {/* Step details */}
      {showLabel && (
        <div className="flex-1 text-left min-w-0">
          <div
            className={`
            font-medium truncate
            ${status === 'locked' ? 'text-brand-muted' : 'text-brand-primary dark:text-brand-primary'}
          `}
          >
            {step.name}
          </div>

          {!compact && (
            <div className="flex items-center gap-2 text-sm text-brand-muted dark:text-lxd-muted">
              {/* ILA Tools badge */}
              <span className="truncate">{step.tools.join(', ')}</span>

              {/* Time estimate */}
              {showTimeEstimate && (
                <span className="shrink-0">
                  • {timeEstimate.min}-{timeEstimate.max} min
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Optional indicator */}
      {!step.required && (
        <span
          className="px-2 py-1 text-xs bg-gray-200 dark:bg-brand-surface-hover rounded-full"
          title="This step is optional"
        >
          Optional
        </span>
      )}
    </button>
  );
}

/**
 * Phase Header Component
 * Shows the phase name, progress, and collapsible indicator
 */
interface PhaseHeaderProps {
  phase: WizardPhase;
  progress: number;
  isExpanded: boolean;
  onToggle: () => void;
  isCurrentPhase: boolean;
}

function PhaseHeader({
  phase,
  progress,
  isExpanded,
  onToggle,
  isCurrentPhase,
}: PhaseHeaderProps): React.JSX.Element {
  const colors = PHASE_COLORS[phase.phaseNumber];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-full flex items-center gap-3 p-4 rounded-lg
        transition-all duration-200
        ${colors.bgLight}
        hover:opacity-90
        focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        ${isCurrentPhase ? `border-2 ${colors.border}` : ''}
      `}
      aria-expanded={isExpanded}
      aria-controls={`phase-${phase.phaseNumber}-content`}
    >
      {/* Phase icon */}
      <span className="text-2xl" aria-hidden="true">
        {colors.icon}
      </span>

      {/* Phase info */}
      <div className="flex-1 text-left">
        <div className={`font-semibold ${colors.text}`}>
          Phase {phase.phaseNumber}: {phase.name}
        </div>
        <div className="text-sm text-brand-secondary dark:text-lxd-muted">
          Steps {phase.steps[0]} - {phase.steps[phase.steps.length - 1]}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-24">
        <div className="text-xs text-right text-brand-secondary dark:text-lxd-muted mb-1">
          {Math.round(progress)}%
        </div>
        <div className="h-2 bg-gray-200 dark:bg-brand-surface-hover rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Expand/collapse indicator */}
      <span
        className={`
          text-brand-muted transition-transform duration-200
          ${isExpanded ? 'rotate-180' : ''}
        `}
        aria-hidden="true"
      >
        ▼
      </span>
    </button>
  );
}

/**
 * Progress Summary Component
 * Shows overall progress and time estimates
 */
interface ProgressSummaryProps {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  timeRemaining: { min: number; max: number };
  experienceLevel: ExperienceLevel;
}

function ProgressSummary({
  totalSteps,
  completedSteps,
  currentStep,
  timeRemaining,
}: ProgressSummaryProps): React.JSX.Element {
  const progressPercent = (completedSteps / totalSteps) * 100;

  // Format time remaining
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="p-4 bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg">
      {/* Main progress */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-2xl font-bold text-brand-primary dark:text-brand-primary">
            {Math.round(progressPercent)}%
          </span>
          <span className="text-sm text-brand-secondary dark:text-lxd-muted ml-2">Complete</span>
        </div>

        <div className="text-right">
          <span className="text-sm text-brand-secondary dark:text-lxd-muted">
            Est. time remaining:
          </span>
          <div className="font-semibold text-brand-primary dark:text-brand-primary">
            {formatTime(timeRemaining.min)} - {formatTime(timeRemaining.max)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-brand-surface-hover rounded-full overflow-hidden">
        {/* Completed portion */}
        <div
          className="absolute h-full bg-brand-success transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Current step marker */}
        <div
          className="absolute h-full w-1 bg-brand-primary"
          style={{ left: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step count */}
      <div className="flex justify-between mt-2 text-xs text-brand-muted dark:text-lxd-muted">
        <span>
          {completedSteps} of {totalSteps} steps completed
        </span>
        <span>Currently on Step {currentStep}</span>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 4: MAIN COMPONENT
// ============================================================================

/**
 * WizardNavigation Component
 *
 * The main navigation component for the 17-step INSPIRE wizard.
 * Supports multiple view modes for different UI contexts:
 *
 * - full: Complete view with phases, steps, and progress
 * - compact: Condensed view for narrow sidebars
 * - sidebar: Optimized for side panel placement
 * - phases-only: Just phase headers with progress
 *
 * @example
 * ```tsx
 * <WizardNavigation
 *   stepStatuses={projectStatuses}
 *   currentStep={5}
 *   onStepClick={handleStepChange}
 *   experienceLevel="intermediate"
 *   viewMode="sidebar"
 *   showTimeEstimates={true}
 * />
 * ```
 */
export function WizardNavigation({
  stepStatuses,
  currentStep,
  onStepClick,
  experienceLevel,
  viewMode = 'full',
  showTimeEstimates = true,
  showPhases = true,
  disabled = false,
  className = '',
}: WizardNavigationProps): React.JSX.Element {
  // Accessibility settings
  const { settings } = useAccessibility();

  // Track which phases are expanded (for collapsible view)
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    // Default to expanding the current phase
    new Set([getPhaseForStep(currentStep)?.phaseNumber || 1]),
  );

  // Convert step statuses to completed array for helper functions
  const completedStepsArray = useMemo(() => getCompletedStepsArray(stepStatuses), [stepStatuses]);

  // Calculate overall progress
  const progress = useMemo(() => calculateProgress(completedStepsArray), [completedStepsArray]);

  // Calculate time remaining
  const timeRemaining = useMemo(
    () => estimateTimeRemaining(completedStepsArray, experienceLevel),
    [completedStepsArray, experienceLevel],
  );

  // Count completed steps
  const completedStepsCount = useMemo(() => {
    let count = 0;
    stepStatuses.forEach((status) => {
      if (status.status === 'completed' || status.status === 'skipped') {
        count++;
      }
    });
    return count;
  }, [stepStatuses]);

  // Toggle phase expansion
  const togglePhase = useCallback((phaseNumber: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseNumber)) {
        next.delete(phaseNumber);
      } else {
        next.add(phaseNumber);
      }
      return next;
    });
  }, []);

  // Expand all phases when autism support visual schedules is enabled
  // (Users benefit from seeing the complete picture)
  const showAllSteps = settings.autismSupport.visualSchedules || viewMode === 'full';

  // -------------------------------------------------------------------------
  // Render: Compact Mode
  // -------------------------------------------------------------------------
  if (viewMode === 'compact') {
    return (
      <nav className={`space-y-2 ${className}`} aria-label="Wizard progress">
        {/* Mini progress indicator */}
        <div className="flex items-center gap-2 p-2 bg-brand-surface dark:bg-brand-surface rounded-lg">
          <span className="text-lg font-bold text-brand-primary dark:text-brand-primary">
            {currentStep}/17
          </span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-brand-surface-hover rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Current and next step */}
        <div className="space-y-1">
          {WIZARD_STEPS.filter(
            (step) => step.stepNumber >= currentStep && step.stepNumber <= currentStep + 2,
          ).map((step) => (
            <StepIndicator
              key={step.stepNumber}
              step={step}
              status={determineStepStatus(step.stepNumber, stepStatuses, currentStep, step)}
              isActive={step.stepNumber === currentStep}
              onClick={() => onStepClick(step.stepNumber)}
              disabled={disabled}
              showLabel={true}
              showTimeEstimate={false}
              experienceLevel={experienceLevel}
              compact={true}
            />
          ))}
        </div>
      </nav>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Phases Only Mode
  // -------------------------------------------------------------------------
  if (viewMode === 'phases-only') {
    return (
      <nav className={`space-y-3 ${className}`} aria-label="Wizard phases">
        {WIZARD_PHASES.map((phase) => {
          const phaseProgress = calculatePhaseProgress(phase, stepStatuses);
          const currentPhase = getPhaseForStep(currentStep);

          return (
            <PhaseHeader
              key={phase.phaseNumber}
              phase={phase}
              progress={phaseProgress}
              isExpanded={false}
              onToggle={() => {}} // No-op in phases-only mode
              isCurrentPhase={currentPhase?.phaseNumber === phase.phaseNumber}
            />
          );
        })}
      </nav>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Full/Sidebar Mode (with collapsible phases)
  // -------------------------------------------------------------------------
  return (
    <nav className={`space-y-4 ${className}`} aria-label="INSPIRE Wizard Navigation">
      {/* Progress Summary */}
      <ProgressSummary
        totalSteps={WIZARD_STEPS.length}
        completedSteps={completedStepsCount}
        currentStep={currentStep}
        timeRemaining={timeRemaining}
        experienceLevel={experienceLevel}
      />

      {/* Phase-based navigation */}
      <div className="space-y-4">
        {WIZARD_PHASES.map((phase) => {
          const phaseProgress = calculatePhaseProgress(phase, stepStatuses);
          const currentPhase = getPhaseForStep(currentStep);
          const isCurrentPhase = currentPhase?.phaseNumber === phase.phaseNumber;
          const isExpanded = showAllSteps || expandedPhases.has(phase.phaseNumber);

          // Get steps in this phase
          const phaseSteps = WIZARD_STEPS.filter((step) => step.phase === phase.phaseNumber);

          return (
            <div key={phase.phaseNumber} className="space-y-2">
              {/* Phase header */}
              {showPhases && (
                <PhaseHeader
                  phase={phase}
                  progress={phaseProgress}
                  isExpanded={isExpanded}
                  onToggle={() => togglePhase(phase.phaseNumber)}
                  isCurrentPhase={isCurrentPhase}
                />
              )}

              {/* Steps in this phase */}
              {(isExpanded || !showPhases) && (
                <div
                  id={`phase-${phase.phaseNumber}-content`}
                  className={`
                    space-y-1 ${showPhases ? 'ml-4 pl-4 border-l-2' : ''}
                    ${PHASE_COLORS[phase.phaseNumber].border}
                  `}
                >
                  {phaseSteps.map((step) => {
                    const status = determineStepStatus(
                      step.stepNumber,
                      stepStatuses,
                      currentStep,
                      step,
                    );

                    return (
                      <StepIndicator
                        key={step.stepNumber}
                        step={step}
                        status={status}
                        isActive={step.stepNumber === currentStep}
                        onClick={() => onStepClick(step.stepNumber)}
                        disabled={disabled}
                        showLabel={true}
                        showTimeEstimate={showTimeEstimates}
                        experienceLevel={experienceLevel}
                        compact={viewMode === 'sidebar'}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="text-xs text-brand-muted dark:text-lxd-muted p-3 bg-brand-page dark:bg-brand-surface rounded-lg">
        <p className="flex items-center gap-2">
          <span aria-hidden="true">💡</span>
          Click on any completed or available step to navigate. Locked steps require completing
          prerequisites first.
        </p>
      </div>
    </nav>
  );
}

// ============================================================================
// SECTION 5: UTILITY EXPORTS
// ============================================================================

/**
 * Export sub-components for flexible composition
 */
export { StepIndicator, PhaseHeader, ProgressSummary };

/**
 * Export helper function for external use
 */
export { determineStepStatus };

// ============================================================================
// END OF WIZARD NAVIGATION COMPONENT
// ============================================================================
