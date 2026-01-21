'use client';

import { Bot, Folder, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  ContinuityVault,
  CoPilotSidebar,
  MissionControlProvider,
  NavigationLadder,
  PhaseHeader,
  StepNavigation,
  useMissionControl,
  WizardToggle,
} from '@/components/inspire-studio/mission-control';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';

// ============================================================================
// INNER LAYOUT (uses context)
// ============================================================================

interface InnerLayoutProps {
  children: ReactNode;
}

function InnerLayout({ children }: InnerLayoutProps) {
  const { toggleCoPilot, toggleContinuityVault, toggleNavigation, isMobileView } =
    useMissionControl();

  return (
    <div className="flex h-screen bg-lxd-dark-bg overflow-hidden">
      {/* Left Sidebar: Navigation Ladder */}
      <NavigationLadder />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-lxd-dark-border bg-lxd-dark-surface">
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            {isMobileView && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleNavigation}
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <span className="text-sm font-medium text-muted-foreground">
              INSPIRE Course Builder
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wizard toggle */}
            <WizardToggle />

            {/* Continuity vault */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleContinuityVault}
              aria-label="Open continuity vault"
            >
              <Folder className="h-5 w-5" />
            </Button>

            {/* Co-Pilot toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCoPilot}
              aria-label="Toggle AI Co-Pilot"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Phase Header */}
        <PhaseHeader />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>

        {/* Step Navigation */}
        <StepNavigation />
      </div>

      {/* Right Sidebar: Co-Pilot (Sheet) */}
      <CoPilotSidebar />

      {/* Bottom Sheet: Continuity Vault */}
      <ContinuityVault />
    </div>
  );
}

// ============================================================================
// ROOT LAYOUT
// ============================================================================

interface LayoutProps {
  children: ReactNode;
}

/**
 * INSPIRE Course Builder Layout
 *
 * Root layout for the INSPIRE wizard-based course creation.
 * Provides the Mission Control Dashboard shell with:
 * - Navigation Ladder (left sidebar)
 * - Phase Header (breadcrumbs, title, time)
 * - Wizard Toggle (experience level)
 * - Co-Pilot Sidebar (AI assistant)
 * - Continuity Vault (export/import)
 * - Step Navigation (prev/next, save)
 */
export default function InspireCourseBuilderLayout({ children }: LayoutProps) {
  return (
    <TooltipProvider>
      <MissionControlProvider>
        <InnerLayout>{children}</InnerLayout>
      </MissionControlProvider>
    </TooltipProvider>
  );
}
