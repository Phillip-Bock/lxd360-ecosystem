'use client';

import { ChevronRight, Clock, HelpCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMissionStore } from '@/store/inspire';
import { useMissionControl } from './MissionControlProvider';

// ============================================================================
// COMPONENT
// ============================================================================

interface PhaseHeaderProps {
  className?: string;
}

/**
 * PhaseHeader - Current phase/step title with breadcrumb navigation
 *
 * Features:
 * - Breadcrumb navigation
 * - Current step title and description
 * - Time estimate display
 * - Quick help button
 */
export function PhaseHeader({ className }: PhaseHeaderProps) {
  const {
    currentPhaseConfig,
    currentStepConfig,
    experienceLevel,
    openCoPilotWithContext,
    wizardHintsVisible,
  } = useMissionControl();
  const manifest = useMissionStore((state) => state.manifest);
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const setPhase = useMissionStore((state) => state.setPhase);

  // Calculate time estimate
  const timeEstimate = useMemo(() => {
    if (!currentStepConfig) return null;
    const times = currentStepConfig.timeByLevel[experienceLevel];
    return { min: times.min, max: times.max };
  }, [currentStepConfig, experienceLevel]);

  // Format phase name for display
  const phaseName = useMemo(() => {
    const names: Record<string, string> = {
      encoding: 'Encoding',
      synthesization: 'Synthesization',
      assimilation: 'Assimilation',
      audit: 'Audit',
    };
    return names[currentPhase] ?? currentPhase;
  }, [currentPhase]);

  // Handle help click
  const handleHelpClick = () => {
    if (currentStepConfig) {
      openCoPilotWithContext(
        `Help me with step ${currentStepConfig.stepNumber}: ${currentStepConfig.name}`,
      );
    }
  };

  return (
    <header
      className={cn(
        'flex flex-col gap-2 px-6 py-4 border-b border-lxd-dark-border bg-lxd-dark-surface',
        className,
      )}
    >
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPhase('encoding');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              INSPIRE Studio
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              {phaseName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">Step {currentStep}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title and metadata row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Step title */}
          <h1 className="text-xl font-semibold text-lxd-white truncate">
            {currentStepConfig?.name ?? `Step ${currentStep}`}
          </h1>

          {/* Step description (if wizard hints visible) */}
          {wizardHintsVisible && currentStepConfig?.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {currentStepConfig.description}
            </p>
          )}

          {/* Mission title */}
          {manifest?.metadata?.title && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {manifest.metadata.title}
              </Badge>
              {manifest.metadata.industry && (
                <Badge variant="secondary" className="text-xs">
                  {manifest.metadata.industry}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right side: time estimate and help */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Time estimate */}
          {timeEstimate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {timeEstimate.min}-{timeEstimate.max} min
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated time for {experienceLevel} level</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Help button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleHelpClick}
                className="shrink-0"
                aria-label="Get help for this step"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get help with this step</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Phase color indicator bar */}
      {currentPhaseConfig && (
        <div
          className="h-1 rounded-full mt-2"
          style={{
            background: `linear-gradient(to right, ${currentPhaseConfig.colorTheme.primary}, ${currentPhaseConfig.colorTheme.secondary})`,
          }}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
