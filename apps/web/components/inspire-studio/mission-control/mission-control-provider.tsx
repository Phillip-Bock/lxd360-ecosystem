'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type ExtendedWizardStep,
  WIZARD_PHASES,
  WIZARD_STEPS,
  type WizardPhase,
} from '@/lib/inspire/types/wizard-config';
import { type MissionPhase, useMissionStore } from '@/store/inspire';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface MissionControlContextValue {
  /** Current phase configuration */
  currentPhaseConfig: WizardPhase | undefined;

  /** Current step configuration */
  currentStepConfig: ExtendedWizardStep | undefined;

  /** All phases */
  phases: WizardPhase[];

  /** All steps */
  steps: ExtendedWizardStep[];

  /** Wizard hints visible */
  wizardHintsVisible: boolean;

  /** Toggle wizard hints */
  toggleWizardHints: () => void;

  /** Co-Pilot sidebar open */
  coPilotOpen: boolean;

  /** Toggle Co-Pilot sidebar */
  toggleCoPilot: () => void;

  /** Open Co-Pilot with context */
  openCoPilotWithContext: (context: string) => void;

  /** Current Co-Pilot context */
  coPilotContext: string | null;

  /** Continuity vault open */
  continuityVaultOpen: boolean;

  /** Toggle continuity vault */
  toggleContinuityVault: () => void;

  /** Experience level (for time estimates) */
  experienceLevel: 'novice' | 'intermediate' | 'advanced' | 'expert';

  /** Set experience level */
  setExperienceLevel: (level: 'novice' | 'intermediate' | 'advanced' | 'expert') => void;

  /** Get resume URL for current state */
  getResumeUrl: () => string;

  /** Is mobile view */
  isMobileView: boolean;

  /** Navigation ladder collapsed (mobile) */
  navigationCollapsed: boolean;

  /** Toggle navigation ladder */
  toggleNavigation: () => void;
}

const MissionControlContext = createContext<MissionControlContextValue | null>(null);

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  WIZARD_HINTS: 'inspire-wizard-hints',
  EXPERIENCE_LEVEL: 'inspire-experience-level',
  COPILOT_STATE: 'inspire-copilot-state',
} as const;

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface MissionControlProviderProps {
  children: ReactNode;
}

/**
 * MissionControlProvider - Manages wizard state and UI configuration
 *
 * Provides:
 * - Phase and step configuration access
 * - Wizard hints visibility
 * - Co-Pilot sidebar state
 * - Resume URL generation
 * - Experience level for time estimates
 */
export function MissionControlProvider({ children }: MissionControlProviderProps) {
  // Store state
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const wizardEnabled = useMissionStore((state) => state.wizardEnabled);
  const manifest = useMissionStore((state) => state.manifest);

  // Local state
  const [wizardHintsVisible, setWizardHintsVisible] = useState(true);
  const [coPilotOpen, setCoPilotOpen] = useState(false);
  const [coPilotContext, setCoPilotContext] = useState<string | null>(null);
  const [continuityVaultOpen, setContinuityVaultOpen] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<
    'novice' | 'intermediate' | 'advanced' | 'expert'
  >('intermediate');
  const [isMobileView, setIsMobileView] = useState(false);
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedHints = localStorage.getItem(STORAGE_KEYS.WIZARD_HINTS);
    if (storedHints !== null) {
      setWizardHintsVisible(storedHints === 'true');
    }

    const storedLevel = localStorage.getItem(STORAGE_KEYS.EXPERIENCE_LEVEL) as
      | 'novice'
      | 'intermediate'
      | 'advanced'
      | 'expert'
      | null;
    if (storedLevel) {
      setExperienceLevel(storedLevel);
    }
  }, []);

  // Persist wizard hints preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.WIZARD_HINTS, String(wizardHintsVisible));
  }, [wizardHintsVisible]);

  // Persist experience level
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE_LEVEL, experienceLevel);
  }, [experienceLevel]);

  // Detect mobile view
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setNavigationCollapsed(true);
      }
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Get current phase config
  const currentPhaseConfig = useMemo(() => {
    return WIZARD_PHASES.find((phase) => {
      const phaseMapping: Record<MissionPhase, number> = {
        encoding: 1,
        synthesization: 2,
        assimilation: 3,
        audit: 4,
      };
      return phase.phaseNumber === phaseMapping[currentPhase];
    });
  }, [currentPhase]);

  // Get current step config
  const currentStepConfig = useMemo(() => {
    const phaseStepOffset: Record<MissionPhase, number> = {
      encoding: 0,
      synthesization: 4,
      assimilation: 9,
      audit: 14,
    };
    const globalStep = phaseStepOffset[currentPhase] + currentStep;
    return WIZARD_STEPS.find((step) => step.stepNumber === globalStep);
  }, [currentPhase, currentStep]);

  // Callbacks
  const toggleWizardHints = useCallback(() => {
    setWizardHintsVisible((prev) => !prev);
  }, []);

  const toggleCoPilot = useCallback(() => {
    setCoPilotOpen((prev) => !prev);
    if (coPilotOpen) {
      setCoPilotContext(null);
    }
  }, [coPilotOpen]);

  const openCoPilotWithContext = useCallback((context: string) => {
    setCoPilotContext(context);
    setCoPilotOpen(true);
  }, []);

  const toggleContinuityVault = useCallback(() => {
    setContinuityVaultOpen((prev) => !prev);
  }, []);

  const handleSetExperienceLevel = useCallback(
    (level: 'novice' | 'intermediate' | 'advanced' | 'expert') => {
      setExperienceLevel(level);
    },
    [],
  );

  const toggleNavigation = useCallback(() => {
    setNavigationCollapsed((prev) => !prev);
  }, []);

  // Generate resume URL
  const getResumeUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';

    const params = new URLSearchParams();
    params.set('phase', currentPhase);
    params.set('step', String(currentStep));

    if (manifest?.metadata?.id) {
      params.set('mission', manifest.metadata.id);
    }

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${params.toString()}`;
  }, [currentPhase, currentStep, manifest?.metadata?.id]);

  // Context value
  const value = useMemo<MissionControlContextValue>(
    () => ({
      currentPhaseConfig,
      currentStepConfig,
      phases: WIZARD_PHASES,
      steps: WIZARD_STEPS,
      wizardHintsVisible: wizardEnabled && wizardHintsVisible,
      toggleWizardHints,
      coPilotOpen,
      toggleCoPilot,
      openCoPilotWithContext,
      coPilotContext,
      continuityVaultOpen,
      toggleContinuityVault,
      experienceLevel,
      setExperienceLevel: handleSetExperienceLevel,
      getResumeUrl,
      isMobileView,
      navigationCollapsed,
      toggleNavigation,
    }),
    [
      currentPhaseConfig,
      currentStepConfig,
      wizardEnabled,
      wizardHintsVisible,
      toggleWizardHints,
      coPilotOpen,
      toggleCoPilot,
      openCoPilotWithContext,
      coPilotContext,
      continuityVaultOpen,
      toggleContinuityVault,
      experienceLevel,
      handleSetExperienceLevel,
      getResumeUrl,
      isMobileView,
      navigationCollapsed,
      toggleNavigation,
    ],
  );

  return <MissionControlContext.Provider value={value}>{children}</MissionControlContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access Mission Control context
 */
export function useMissionControl() {
  const context = useContext(MissionControlContext);
  if (!context) {
    throw new Error('useMissionControl must be used within a MissionControlProvider');
  }
  return context;
}
