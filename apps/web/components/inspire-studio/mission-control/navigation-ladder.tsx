'use client';

import { Check, ChevronDown, ChevronRight, Circle, Lock } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type MissionPhase, useMissionStore } from '@/store/inspire';
import { useMissionControl } from './mission-control-provider';

// ============================================================================
// TYPES
// ============================================================================

interface PhaseStep {
  id: string;
  step: number;
  name: string;
  shortName: string;
  isComplete: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

interface PhaseSection {
  id: MissionPhase;
  name: string;
  icon: string;
  steps: PhaseStep[];
  isComplete: boolean;
  isCurrent: boolean;
  progress: number;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// ============================================================================
// PHASE CONFIGURATION
// ============================================================================

const PHASE_CONFIG: Record<
  MissionPhase,
  { name: string; icon: string; colorTheme: { primary: string; secondary: string; accent: string } }
> = {
  encoding: {
    name: 'Encoding',
    icon: 'search',
    colorTheme: { primary: '#1E40AF', secondary: 'var(--info)', accent: '#93C5FD' },
  },
  synthesization: {
    name: 'Synthesization',
    icon: 'pencil-ruler',
    colorTheme: { primary: '#7C3AED', secondary: '#A78BFA', accent: '#DDD6FE' },
  },
  assimilation: {
    name: 'Assimilation',
    icon: 'hammer',
    colorTheme: { primary: '#059669', secondary: '#34D399', accent: '#A7F3D0' },
  },
  audit: {
    name: 'Audit',
    icon: 'rocket',
    colorTheme: { primary: '#DC2626', secondary: '#F87171', accent: '#FECACA' },
  },
};

const STEP_NAMES: Record<MissionPhase, { name: string; shortName: string }[]> = {
  encoding: [
    { name: 'Research & Industry Analysis', shortName: '1.1 Research' },
    { name: 'Learner Persona Generator', shortName: '1.2 Persona' },
    { name: 'Activation Strategy (ITLA)', shortName: '1.3 ITLA' },
    { name: 'Modality Integrator (ILMI)', shortName: '1.4 ILMI' },
    { name: 'Engagement Spectrum (ICES)', shortName: '1.5 ICES' },
  ],
  synthesization: [
    { name: 'Performance Mapping (IPMG)', shortName: '2.1 IPMG' },
    { name: 'Cognitive Demand (ICDT)', shortName: '2.2 ICDT' },
    { name: 'Capability Progression (ICPF)', shortName: '2.3 ICPF' },
    { name: 'Competency Ladder (ICL)', shortName: '2.4 ICL' },
  ],
  assimilation: [
    { name: 'Adaptive Design Cycle (IADC)', shortName: '3.1 IADC' },
    { name: 'Learning Experience Matrix (ILEM)', shortName: '3.2 Canvas' },
    { name: 'Adaptive Measurement (IALM)', shortName: '3.3 IALM' },
    { name: 'Deployment & Launch', shortName: '3.4 Launch' },
  ],
  audit: [
    { name: 'Cognitive UX & WCAG Review', shortName: '4.1 QA' },
    { name: 'Final Publish', shortName: '4.2 Publish' },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

interface NavigationLadderProps {
  className?: string;
}

/**
 * NavigationLadder - Vertical progress tracker for INSPIRE phases
 *
 * Features:
 * - Collapsible phase sections
 * - Visual completion indicators
 * - Progress bars per phase
 * - Keyboard navigation
 * - Locked state for incomplete prerequisites
 */
export function NavigationLadder({ className }: NavigationLadderProps) {
  const { navigationCollapsed, toggleNavigation, isMobileView } = useMissionControl();
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const manifest = useMissionStore((state) => state.manifest);
  const setPhase = useMissionStore((state) => state.setPhase);
  const setStep = useMissionStore((state) => state.setStep);

  // Track which phases are expanded
  const [expandedPhases, setExpandedPhases] = useState<Set<MissionPhase>>(new Set([currentPhase]));

  // Toggle phase expansion
  const togglePhase = useCallback((phase: MissionPhase) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  }, []);

  // Navigate to step
  const navigateToStep = useCallback(
    (phase: MissionPhase, step: number, isLocked: boolean) => {
      if (isLocked) return;
      setPhase(phase);
      setStep(step);
    },
    [setPhase, setStep],
  );

  // Build phase sections with completion status
  const phases = useMemo<PhaseSection[]>(() => {
    const phaseOrder: MissionPhase[] = ['encoding', 'synthesization', 'assimilation', 'audit'];

    return phaseOrder.map((phase) => {
      const config = PHASE_CONFIG[phase];
      const stepNames = STEP_NAMES[phase];

      // Determine phase completion
      let phaseComplete = false;
      if (manifest) {
        switch (phase) {
          case 'encoding':
            phaseComplete = manifest.encoding?.isComplete ?? false;
            break;
          case 'synthesization':
            phaseComplete = manifest.synthesization?.isComplete ?? false;
            break;
          case 'assimilation':
            phaseComplete = manifest.assimilation?.isComplete ?? false;
            break;
          case 'audit':
            phaseComplete = false; // Audit is final
            break;
        }
      }

      // Calculate step completions (simplified - would be more detailed in production)
      const steps: PhaseStep[] = stepNames.map((stepName, idx) => {
        const stepNum = idx + 1;
        const isCurrent = currentPhase === phase && currentStep === stepNum;

        // Determine if step is complete based on manifest data
        let isComplete = false;
        if (manifest) {
          if (phase === 'encoding') {
            switch (stepNum) {
              case 1:
                isComplete = !!manifest.encoding?.industryAnalysis;
                break;
              case 2:
                isComplete = (manifest.encoding?.personas?.length ?? 0) > 0;
                break;
              case 3:
                isComplete = !!manifest.encoding?.activationStrategy;
                break;
              case 4:
                isComplete = !!manifest.encoding?.modalityPlan;
                break;
              case 5:
                isComplete = !!manifest.encoding?.engagementLevel;
                break;
            }
          } else if (phase === 'synthesization') {
            switch (stepNum) {
              case 1:
                isComplete = !!manifest.synthesization?.performanceMapping;
                break;
              case 2:
                isComplete = !!manifest.synthesization?.cognitiveDemand;
                break;
              case 3:
                isComplete = !!manifest.synthesization?.capabilityProgression;
                break;
              case 4:
                isComplete = !!manifest.synthesization?.competencyLadder;
                break;
            }
          } else if (phase === 'assimilation') {
            switch (stepNum) {
              case 1:
                isComplete = !!manifest.assimilation?.canvasConfig;
                break;
              case 2:
                isComplete = (manifest.assimilation?.blocks?.length ?? 0) > 0;
                break;
              case 3:
                isComplete = !!manifest.assimilation?.exportConfig;
                break;
              case 4:
                isComplete = manifest.assimilation?.isComplete ?? false;
                break;
            }
          }
        }

        // Determine if step is locked (previous phase not complete)
        const phaseIndex = phaseOrder.indexOf(phase);
        const isLocked =
          phaseIndex > 0 &&
          !phaseOrder.slice(0, phaseIndex).every((p) => {
            if (!manifest) return false;
            switch (p) {
              case 'encoding':
                return manifest.encoding?.isComplete;
              case 'synthesization':
                return manifest.synthesization?.isComplete;
              case 'assimilation':
                return manifest.assimilation?.isComplete;
              default:
                return false;
            }
          });

        return {
          id: `${phase}-${stepNum}`,
          step: stepNum,
          name: stepName.name,
          shortName: stepName.shortName,
          isComplete,
          isCurrent,
          isLocked,
        };
      });

      const completedSteps = steps.filter((s) => s.isComplete).length;
      const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

      return {
        id: phase,
        name: config.name,
        icon: config.icon,
        steps,
        isComplete: phaseComplete,
        isCurrent: currentPhase === phase,
        progress,
        colorTheme: config.colorTheme,
      };
    });
  }, [currentPhase, currentStep, manifest]);

  if (navigationCollapsed && isMobileView) {
    return (
      <div className={cn('w-12 border-r border-lxd-dark-border bg-lxd-dark-surface', className)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleNavigation}
          className="w-full h-12"
          aria-label="Expand navigation"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        {/* Minimal phase indicators */}
        <nav aria-label="Phase navigation (collapsed)">
          {phases.map((phase) => (
            <Tooltip key={phase.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => navigateToStep(phase.id, 1, false)}
                  className={cn(
                    'w-full h-12 flex items-center justify-center',
                    phase.isCurrent && 'bg-lxd-dark-hover',
                    phase.isComplete && 'text-green-500',
                  )}
                  aria-label={`Go to ${phase.name}`}
                  aria-current={phase.isCurrent ? 'step' : undefined}
                >
                  {phase.isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" style={{ color: phase.colorTheme.primary }} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {phase.name} - {Math.round(phase.progress)}%
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'w-64 border-r border-lxd-dark-border bg-lxd-dark-surface overflow-y-auto',
        className,
      )}
      aria-label="INSPIRE phase navigation"
    >
      {/* Header */}
      <div className="p-4 border-b border-lxd-dark-border">
        <h2 className="text-sm font-semibold text-lxd-white">Navigation Ladder</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {phases.filter((p) => p.isComplete).length} of {phases.length} phases complete
        </p>
      </div>

      {/* Phase list */}
      <nav className="p-2" aria-label="INSPIRE phases">
        {phases.map((phase) => (
          <Collapsible
            key={phase.id}
            open={expandedPhases.has(phase.id)}
            onOpenChange={() => togglePhase(phase.id)}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  'w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors',
                  'hover:bg-lxd-dark-hover focus:outline-hidden focus:ring-2 focus:ring-lxd-purple',
                  phase.isCurrent && 'bg-lxd-dark-hover',
                )}
                aria-expanded={expandedPhases.has(phase.id)}
              >
                {expandedPhases.has(phase.id) ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: phase.colorTheme.primary }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-sm font-medium">{phase.name}</span>
                {phase.isComplete && (
                  <Check className="h-4 w-4 text-green-500 shrink-0" aria-label="Complete" />
                )}
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              {/* Progress bar */}
              <div className="px-2 py-1">
                <Progress value={phase.progress} className="h-1" />
              </div>

              {/* Steps */}
              <ul className="ml-4 space-y-1 pb-2">
                {phase.steps.map((step) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => navigateToStep(phase.id, step.step, step.isLocked)}
                      disabled={step.isLocked}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors',
                        'hover:bg-lxd-dark-hover focus:outline-hidden focus:ring-2 focus:ring-lxd-purple',
                        step.isCurrent && 'bg-lxd-dark-hover ring-1 ring-lxd-purple',
                        step.isLocked && 'opacity-50 cursor-not-allowed',
                      )}
                      aria-current={step.isCurrent ? 'step' : undefined}
                      aria-disabled={step.isLocked}
                    >
                      {step.isLocked ? (
                        <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                      ) : step.isComplete ? (
                        <Check className="h-3 w-3 shrink-0 text-green-500" />
                      ) : (
                        <Circle
                          className="h-3 w-3 shrink-0"
                          style={{ color: phase.colorTheme.secondary }}
                        />
                      )}
                      <span
                        className={cn(
                          'flex-1',
                          step.isCurrent && 'font-medium',
                          step.isComplete && 'text-muted-foreground',
                        )}
                      >
                        {step.shortName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
    </aside>
  );
}
