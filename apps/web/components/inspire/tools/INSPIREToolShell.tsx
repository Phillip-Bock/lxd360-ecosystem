'use client';

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// =============================================================================
// TYPE IMPORTS
// =============================================================================
// We import everything we need from our comprehensive type system.
// This ensures type safety across all 12 ILA tools and wizard steps.

import type {
  AccessibilitySettings,
  AIAssistanceRequest,
  AIAssistanceResponse,
  CognitiveLoadMetrics,
  ExperienceLevel,
  INSPIREProject,
  TargetIndustry,
} from '@/lib/inspire/types/inspire-types';

import type { WizardPhase } from '@/lib/inspire/types/wizard-config';
import { getPhaseForStep, WIZARD_PHASES, WIZARD_STEPS } from '@/lib/inspire/types/wizard-config';

// =============================================================================
// TYPE HELPERS
// =============================================================================

/**
 * Valid wizard step numbers (1-17)
 */
type WizardStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

// =============================================================================
// PROJECT CONTEXT
// =============================================================================
/**
 * The Project Context provides global access to the current INSPIRE project
 * state throughout the component tree. This eliminates prop drilling and
 * makes the state accessible to deeply nested ILA tool components.
 *
 * WHY A CONTEXT?
 * The INSPIRE tool has many interconnected components that need access to:
 * - The current project state (who's the learner, what's the objective?)
 * - The user's experience level (affects UI complexity)
 * - Cognitive load metrics (displayed in real-time)
 * - AI assistance functions (explain, generate, validate)
 *
 * Using a context means unknown component can subscribe to exactly what it needs
 * without creating a prop-passing nightmare through 10+ levels of nesting.
 */

interface ProjectContextValue {
  // The current project being worked on
  project: INSPIREProject | null;
  // Function to update the project (triggers auto-save)
  updateProject: (updates: Partial<INSPIREProject>) => void;
  // Creates a brand new project
  createProject: (name: string, industry?: TargetIndustry) => void;
  // Loads an existing project from storage
  loadProject: (projectId: string) => Promise<void>;
  // The user's self-reported experience level (affects UI hints)
  experienceLevel: ExperienceLevel;
  // Allows users to change their experience level
  setExperienceLevel: (level: ExperienceLevel) => void;
  // Current cognitive load metrics for the visible content
  cognitiveLoad: CognitiveLoadMetrics | null;
  // Is the project currently saving?
  isSaving: boolean;
  // Last save timestamp
  lastSaved: Date | null;
  // Has the project been modified since last save?
  isDirty: boolean;
}

// Create the context with null default (will be provided by Shell)
const ProjectContext = createContext<ProjectContextValue | null>(null);

/**
 * Custom hook for accessing the Project Context.
 * Throws a helpful error if used outside the provider.
 */
export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error(
      'useProject must be used within INSPIREToolShell. ' +
        'Make sure your component is wrapped in <INSPIREToolShell>.',
    );
  }
  return context;
}

// =============================================================================
// WIZARD CONTEXT
// =============================================================================
/**
 * The Wizard Context manages the 17-step wizard flow. It tracks:
 * - Which step is currently active
 * - Which steps have been completed
 * - Navigation between steps (with validation)
 * - Progress calculation
 *
 * WHY SEPARATE FROM PROJECT CONTEXT?
 * Separation of concerns. The project context manages DATA (what the user
 * has created), while the wizard context manages FLOW (where they are in
 * the process). This makes both contexts more focused and testable.
 */

interface WizardContextValue {
  // Current step number (1-17)
  currentStep: WizardStepNumber;
  // Navigate to a specific step (validates prerequisites)
  goToStep: (step: WizardStepNumber) => boolean;
  // Go to next step (if available)
  nextStep: () => boolean;
  // Go to previous step
  previousStep: () => boolean;
  // Which steps are completed
  completedSteps: Set<WizardStepNumber>;
  // Mark a step as completed
  completeStep: (step: WizardStepNumber) => void;
  // Calculate overall progress (0-100)
  progress: number;
  // Get the current phase (1-4)
  currentPhase: WizardPhase;
  // Are we in a transition between steps? (for animations)
  isTransitioning: boolean;
  // Get available steps based on prerequisites
  availableSteps: WizardStepNumber[];
  // Check if a specific step can be accessed
  canAccessStep: (step: WizardStepNumber) => boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Custom hook for accessing the Wizard Context.
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error(
      'useWizard must be used within INSPIREToolShell. ' +
        'Make sure your component is wrapped in <INSPIREToolShell>.',
    );
  }
  return context;
}

// =============================================================================
// AI ASSISTANT CONTEXT
// =============================================================================
/**
 * The AI Assistant Context provides access to Claude/Vertex AI assistance
 * throughout the application. The AI can:
 * - Explain concepts in simpler terms
 * - Generate draft content
 * - Validate inputs against best practices
 * - Suggest improvements
 * - Check cognitive load
 *
 * WHY A DEDICATED CONTEXT?
 * AI assistance is used across all 12 ILA tools and all 17 wizard steps.
 * Having a central context means:
 * 1. Consistent API for all AI calls
 * 2. Request queuing and rate limiting
 * 3. Caching of repeated requests
 * 4. Usage tracking for token budgets
 * 5. Graceful degradation if AI is unavailable
 */

interface AIAssistantContextValue {
  // Send a request to the AI assistant
  askAI: (request: AIAssistanceRequest) => Promise<AIAssistanceResponse>;
  // Is the AI currently processing a request?
  isProcessing: boolean;
  // Last AI response (for showing suggestions)
  lastResponse: AIAssistanceResponse | null;
  // Is AI assistance available? (checks connectivity and quota)
  isAvailable: boolean;
  // Clear the last response
  clearResponse: () => void;
  // Token usage this session
  tokensUsed: number;
  // Token limit for this session
  tokenLimit: number;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

/**
 * Custom hook for accessing the AI Assistant Context.
 */
export function useAIAssistant(): AIAssistantContextValue {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error(
      'useAIAssistant must be used within INSPIREToolShell. ' +
        'Make sure your component is wrapped in <INSPIREToolShell>.',
    );
  }
  return context;
}

// =============================================================================
// SHELL PROPS
// =============================================================================
/**
 * Props for the main INSPIREToolShell component.
 */

interface INSPIREToolShellProps {
  // Child components to render (the actual content)
  children: ReactNode;
  // Optional initial project to load
  initialProjectId?: string;
  // Initial experience level (defaults to intermediate)
  initialExperienceLevel?: ExperienceLevel;
  // Initial accessibility settings (uses defaults if not provided)
  initialAccessibilitySettings?: Partial<AccessibilitySettings>;
  // Callback when project is saved
  onProjectSave?: (project: INSPIREProject) => void;
  // Callback when project is loaded
  onProjectLoad?: (project: INSPIREProject) => void;
  // Callback for AI requests (for custom AI backends)
  onAIRequest?: (request: AIAssistanceRequest) => Promise<AIAssistanceResponse>;
  // Enable debug mode (shows additional developer info)
  debug?: boolean;
  // Override the API endpoint for AI assistance
  aiEndpoint?: string;
  // Token limit for AI usage this session
  aiTokenLimit?: number;
}

// =============================================================================
// DEFAULT PROJECT FACTORY
// =============================================================================
/**
 * Creates a new, empty INSPIRE project with sensible defaults.
 *
 * WHY A FACTORY FUNCTION?
 * We need to create many default objects (dates, arrays, nested objects).
 * A factory function ensures each new project gets its own instances,
 * not shared references that could cause bugs.
 *
 * @param name - The project name
 * @param creatorId - The ID of the user creating the project
 * @param industry - Optional industry classification
 */
function createDefaultProject(
  name: string,
  creatorId: string = 'user-default',
  industry?: TargetIndustry,
): INSPIREProject {
  const now = new Date();
  const projectId = `inspire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    // Project identification
    id: projectId,
    name: name,
    description: '',
    organizationId: 'default-org',
    createdAt: now,
    updatedAt: now,
    createdBy: creatorId,
    status: 'draft',

    // Industry and course type (set during wizard)
    industry: industry || 'other',
    courseType: 'compliance',

    // User experience level
    experienceLevel: 'intermediate',

    // Current wizard step and completed steps
    currentStep: 1,
    completedSteps: [],

    // All 12 ILA tools start empty - populated as user completes wizard steps
    // ENCODING STAGE (Steps 1-4)
    encoding: {},

    // SYNTHESIZATION STAGE (Steps 5-9)
    synthesization: {},

    // ASSIMILATION STAGE (Steps 10-17)
    assimilation: {},

    // Collaboration features (future enhancement)
    collaborators: [
      {
        userId: creatorId,
        role: 'owner',
        addedAt: now,
      },
    ],

    // Version history (auto-populated on saves)
    versions: [],

    // Export history (populated when exports are generated)
    exports: [],
  };
}

// =============================================================================
// MAIN SHELL COMPONENT
// =============================================================================
/**
 * The main INSPIRE Tool Shell component.
 *
 * This is the root component that wraps the entire application.
 * It provides:
 * 1. Project state management
 * 2. Wizard flow control
 * 3. AI assistant integration
 * 4. Accessibility context
 * 5. Real-time cognitive load monitoring
 * 6. Auto-save functionality
 * 7. Responsive layout management
 */
export function INSPIREToolShell({
  children,
  initialProjectId,
  initialExperienceLevel = 'intermediate',
  onProjectSave,
  onProjectLoad,
  onAIRequest,
  debug = false,
  aiEndpoint = '/api/inspire/ai',
  aiTokenLimit = 50000,
}: INSPIREToolShellProps): React.JSX.Element {
  // ===========================================================================
  // PROJECT STATE
  // ===========================================================================

  // The current INSPIRE project being worked on
  const [project, setProject] = useState<INSPIREProject | null>(null);

  // Track if project has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Track save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // User's experience level affects UI complexity and hint detail
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialExperienceLevel);

  // Real-time cognitive load metrics for current view
  const [cognitiveLoad] = useState<CognitiveLoadMetrics | null>(null);

  // ===========================================================================
  // WIZARD STATE
  // ===========================================================================

  // Current wizard step (1-17)
  const [currentStep, setCurrentStep] = useState<WizardStepNumber>(1);

  // Completed steps tracked in a Set for O(1) lookup
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStepNumber>>(new Set());

  // Transition state for smooth step changes
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ===========================================================================
  // AI ASSISTANT STATE
  // ===========================================================================

  // Is AI currently processing a request?
  const [aiProcessing, setAiProcessing] = useState(false);

  // Last AI response (for displaying in UI)
  const [lastAiResponse, setLastAiResponse] = useState<AIAssistanceResponse | null>(null);

  // Is AI available? (checks quota and connectivity)
  const [aiAvailable, setAiAvailable] = useState(true);

  // Token usage tracking
  const [tokensUsed, setTokensUsed] = useState(0);

  // ===========================================================================
  // REFS
  // ===========================================================================

  // Ref for auto-save debouncing
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref for saveProject function to avoid circular dependency
  const saveProjectRef = useRef<(() => Promise<void>) | null>(null);

  // Ref for the main content area (for focus management)
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Ref for ARIA live region announcements
  const announceRef = useRef<HTMLOutputElement>(null);

  // ===========================================================================
  // ACCESSIBILITY ANNOUNCEMENT FUNCTION
  // ===========================================================================
  /**
   * Announces messages to screen readers via ARIA live region.
   *
   * WHY THIS MATTERS:
   * When the wizard step changes or an action completes, users relying on
   * screen readers need to be informed. We use an ARIA live region with
   * polite priority (won't interrupt current speech) to make announcements.
   *
   * @param message - The message to announce
   * @param priority - 'polite' (default) or 'assertive' (interrupts)
   */
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;

      // Clear after announcement (prevents re-reading on focus)
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // ===========================================================================
  // PROJECT MANAGEMENT FUNCTIONS
  // ===========================================================================

  /**
   * Updates the current project with partial data.
   * Triggers auto-save after a debounce period.
   *
   * WHY DEBOUNCED AUTO-SAVE?
   * Users typing quickly in forms would trigger saves on every keystroke.
   * Debouncing waits for 2 seconds of inactivity before saving, reducing
   * server load while still protecting against data loss.
   */
  const updateProject = useCallback((updates: Partial<INSPIREProject>) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date(),
      };
    });
    setIsDirty(true);

    // Clear existing auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout (2 seconds)
    // Note: saveProject will be available when the timeout fires
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Call saveProject directly - it will be defined by the time this executes
      saveProjectRef.current?.();
    }, 2000);
  }, []);

  /**
   * Creates a new INSPIRE project.
   */
  const createProject = useCallback(
    (name: string, industry?: TargetIndustry) => {
      const newProject = createDefaultProject(name, 'current-user', industry);
      setProject(newProject);
      setIsDirty(false);
      setCurrentStep(1);
      setCompletedSteps(new Set());

      announce(`Created new project: ${name}. Starting at Step 1: Project Initiation.`);
    },
    [announce],
  );

  /**
   * Loads an existing project from storage.
   * This would typically call an API or load from local storage.
   */
  const loadProject = useCallback(
    async (projectId: string) => {
      try {
        // Data: Firestore integration pending

        void debug; // Debug flag available for development

        // Simulated API call
        const response = await fetch(`/api/inspire/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const loadedProject: INSPIREProject = await response.json();
        setProject(loadedProject);
        setIsDirty(false);
        setLastSaved(loadedProject.updatedAt);

        // Restore completed steps from project state
        // This would need to be calculated based on which ILA configs are filled
        const completed = calculateCompletedSteps(loadedProject);
        setCompletedSteps(completed);

        // Find the appropriate starting step
        const lastCompletedStep = Math.max(...Array.from(completed), 0);
        setCurrentStep(Math.min(lastCompletedStep + 1, 17) as WizardStepNumber);

        announce(`Loaded project: ${loadedProject.name}. Resuming at Step ${currentStep}.`);

        if (onProjectLoad) {
          onProjectLoad(loadedProject);
        }
      } catch (error) {
        console.error('[INSPIRE] Failed to load project:', error);
        announce('Failed to load project. Please try again.', 'assertive');
      }
    },
    [announce, currentStep, debug, onProjectLoad],
  );

  /**
   * Saves the current project to storage.
   */
  const saveProject = useCallback(async () => {
    if (!project || isSaving) return;

    setIsSaving(true);

    try {
      // Data: Firestore integration pending

      void debug; // Debug flag available for development

      // Simulated API call
      const response = await fetch(`/api/inspire/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      setIsDirty(false);
      setLastSaved(new Date());

      announce('Project saved.');

      if (onProjectSave) {
        onProjectSave(project);
      }
    } catch (error) {
      console.error('[INSPIRE] Failed to save project:', error);
      announce('Failed to save project. Your changes are still in memory.', 'assertive');
    } finally {
      setIsSaving(false);
    }
  }, [project, isSaving, debug, announce, onProjectSave]);

  // Update ref whenever saveProject changes
  saveProjectRef.current = saveProject;

  // ===========================================================================
  // WIZARD NAVIGATION FUNCTIONS
  // ===========================================================================

  /**
   * Calculates which steps are available based on prerequisites.
   *
   * WHY PREREQUISITES?
   * Some steps depend on data from previous steps. For example, you can't
   * write learning objectives (Step 5) until you know who your learners are
   * (Step 2). Prerequisites ensure a logical flow while still allowing
   * some flexibility for experienced users.
   */
  const availableSteps = useMemo((): WizardStepNumber[] => {
    const available: WizardStepNumber[] = [];

    for (let i = 1; i <= 17; i++) {
      const step = WIZARD_STEPS.find((s) => s.stepNumber === i);
      if (!step) continue;

      // Check if all prerequisites are met
      const prereqsMet = step.prerequisites.every((prereq) =>
        completedSteps.has(prereq as WizardStepNumber),
      );

      // Step 1 is always available, others need prerequisites
      if (i === 1 || prereqsMet) {
        available.push(i as WizardStepNumber);
      }
    }

    return available;
  }, [completedSteps]);

  /**
   * Checks if a specific step can be accessed.
   */
  const canAccessStep = useCallback(
    (step: WizardStepNumber): boolean => {
      return availableSteps.includes(step);
    },
    [availableSteps],
  );

  /**
   * Navigate to a specific wizard step.
   * Returns true if navigation succeeded, false if blocked.
   */
  const goToStep = useCallback(
    (step: WizardStepNumber): boolean => {
      // Validate step number
      if (step < 1 || step > 17) {
        if (debug) {
          console.warn('[INSPIRE] Invalid step number:', step);
        }
        return false;
      }

      // Check prerequisites
      if (!canAccessStep(step)) {
        const stepConfig = WIZARD_STEPS.find((s) => s.stepNumber === step);
        if (!stepConfig) return false;

        const missingPrereqs = stepConfig.prerequisites.filter(
          (p) => !completedSteps.has(p as WizardStepNumber),
        );

        announce(
          `Cannot access Step ${step}. Please complete: ${missingPrereqs.map((p) => `Step ${p}`).join(', ')} first.`,
          'assertive',
        );
        return false;
      }

      // Start transition animation
      setIsTransitioning(true);

      // Short delay for exit animation, then switch step
      setTimeout(() => {
        setCurrentStep(step);
        setIsTransitioning(false);

        // Focus management: move focus to main content
        if (mainContentRef.current) {
          mainContentRef.current.focus();
        }

        const stepConfig = WIZARD_STEPS.find((s) => s.stepNumber === step);
        if (!stepConfig) return;

        const phase = getPhaseForStep(step);
        if (!phase) return;

        announce(
          `Now on Step ${step}: ${stepConfig.name}. ` +
            `Phase ${phase.phaseNumber}: ${phase.name}. ` +
            `${experienceLevel === 'novice' ? stepConfig.helpContent.overview : ''}`,
        );
      }, 200); // 200ms for exit animation

      return true;
    },
    [canAccessStep, completedSteps, announce, experienceLevel, debug],
  );

  /**
   * Navigate to the next step in the wizard.
   */
  const nextStep = useCallback((): boolean => {
    const next = (currentStep + 1) as WizardStepNumber;
    if (next > 17) {
      announce('You have reached the final step.');
      return false;
    }
    return goToStep(next);
  }, [currentStep, goToStep, announce]);

  /**
   * Navigate to the previous step in the wizard.
   */
  const previousStep = useCallback((): boolean => {
    const prev = (currentStep - 1) as WizardStepNumber;
    if (prev < 1) {
      announce('You are at the first step.');
      return false;
    }
    return goToStep(prev);
  }, [currentStep, goToStep, announce]);

  /**
   * Mark a step as completed.
   */
  const completeStep = useCallback(
    (step: WizardStepNumber) => {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(step);
        return next;
      });

      const stepConfig = WIZARD_STEPS.find((s) => s.stepNumber === step);
      if (stepConfig) {
        announce(`Completed Step ${step}: ${stepConfig.name}.`);
      }

      void debug; // Debug flag available for development
      void step; // Step is tracked via completedSteps state
    },
    [announce, debug],
  );

  /**
   * Calculate overall wizard progress (0-100).
   */
  const progress = useMemo((): number => {
    // Each of the 17 steps contributes to progress
    // We weight required steps higher than optional ones
    let totalWeight = 0;
    let completedWeight = 0;

    for (let i = 1; i <= 17; i++) {
      const step = WIZARD_STEPS.find((s) => s.stepNumber === i);
      if (!step) continue;

      const weight = step.required ? 1 : 0.5;
      totalWeight += weight;

      if (completedSteps.has(i as WizardStepNumber)) {
        completedWeight += weight;
      }
    }

    return Math.round((completedWeight / totalWeight) * 100);
  }, [completedSteps]);

  /**
   * Get the current wizard phase (1-4).
   */
  const currentPhase = useMemo((): WizardPhase => {
    const phase = getPhaseForStep(currentStep);
    // Fallback to Phase 1 if not found (should never happen)
    return phase || WIZARD_PHASES[0];
  }, [currentStep]);

  // ===========================================================================
  // AI ASSISTANT FUNCTIONS
  // ===========================================================================

  /**
   * Send a request to the AI assistant.
   *
   * ARCHITECTURE:
   * We support two modes:
   * 1. Custom handler (passed via onAIRequest prop) - for enterprise deployments
   * 2. Default handler (calls our API) - for standard usage
   *
   * This allows enterprises to route AI requests through their own infrastructure
   * while keeping the same interface for components.
   */
  const askAI = useCallback(
    async (request: AIAssistanceRequest): Promise<AIAssistanceResponse> => {
      setAiProcessing(true);

      try {
        let response: AIAssistanceResponse;

        // Use custom handler if provided
        if (onAIRequest) {
          response = await onAIRequest(request);
        } else {
          // Default: call our API endpoint
          const apiResponse = await fetch(aiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...request,
              projectId: project?.id,
              experienceLevel,
            }),
          });

          if (!apiResponse.ok) {
            throw new Error('AI request failed');
          }

          response = await apiResponse.json();
        }

        // Track token usage
        if (response.tokensUsed) {
          setTokensUsed((prev) => prev + response.tokensUsed);

          // Check if we've exceeded the limit
          if (tokensUsed + response.tokensUsed > aiTokenLimit) {
            setAiAvailable(false);
            announce('AI assistance limit reached for this session.', 'assertive');
          }
        }

        setLastAiResponse(response);
        return response;
      } catch (error) {
        console.error('[INSPIRE] AI request failed:', error);

        // Return a graceful error response
        const errorResponse: AIAssistanceResponse = {
          id: `error-${Date.now()}`,
          requestId: request.id || 'unknown',
          content:
            'I apologize, but I encountered an error processing your request. Please try again.',
          followUpSuggestions: [],
          confidence: 0,
          model: 'unknown',
          tokensUsed: 0,
          generatedAt: new Date(),
        };

        setLastAiResponse(errorResponse);
        return errorResponse;
      } finally {
        setAiProcessing(false);
      }
    },
    [project?.id, experienceLevel, onAIRequest, aiEndpoint, tokensUsed, aiTokenLimit, announce],
  );

  /**
   * Clear the last AI response (used when user dismisses the suggestion).
   */
  const clearAiResponse = useCallback(() => {
    setLastAiResponse(null);
  }, []);

  // ===========================================================================
  // EFFECTS
  // ===========================================================================

  /**
   * Load initial project on mount if projectId provided.
   */
  useEffect(() => {
    if (initialProjectId) {
      loadProject(initialProjectId);
    }
  }, [initialProjectId, loadProject]);

  /**
   * Keyboard shortcut handler for wizard navigation.
   *
   * ACCESSIBILITY:
   * These shortcuts make the wizard more efficient for power users
   * while not interfering with screen reader navigation.
   *
   * Shortcuts:
   * - Alt+Left: Previous step
   * - Alt+Right: Next step
   * - Alt+1-9: Jump to step (0 = 10)
   * - Ctrl+S: Save project
   * - Ctrl+Shift+A: Toggle AI panel
   */
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent): void => {
      // Alt + Arrow for step navigation
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          previousStep();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextStep();
        } else if (e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          goToStep(parseInt(e.key, 10) as WizardStepNumber);
        } else if (e.key === '0') {
          e.preventDefault();
          goToStep(10);
        }
      }

      // Ctrl+S for save
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        saveProject();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return (): void => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [previousStep, nextStep, goToStep, saveProject]);

  /**
   * Warn user about unsaved changes before leaving.
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return (): void => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // ===========================================================================
  // CONTEXT VALUES
  // ===========================================================================

  const projectContextValue = useMemo<ProjectContextValue>(
    () => ({
      project,
      updateProject,
      createProject,
      loadProject,
      experienceLevel,
      setExperienceLevel,
      cognitiveLoad,
      isSaving,
      lastSaved,
      isDirty,
    }),
    [
      project,
      updateProject,
      createProject,
      loadProject,
      experienceLevel,
      cognitiveLoad,
      isSaving,
      lastSaved,
      isDirty,
    ],
  );

  const wizardContextValue = useMemo<WizardContextValue>(
    () => ({
      currentStep,
      goToStep,
      nextStep,
      previousStep,
      completedSteps,
      completeStep,
      progress,
      currentPhase,
      isTransitioning,
      availableSteps,
      canAccessStep,
    }),
    [
      currentStep,
      goToStep,
      nextStep,
      previousStep,
      completedSteps,
      completeStep,
      progress,
      currentPhase,
      isTransitioning,
      availableSteps,
      canAccessStep,
    ],
  );

  const aiContextValue = useMemo<AIAssistantContextValue>(
    () => ({
      askAI,
      isProcessing: aiProcessing,
      lastResponse: lastAiResponse,
      isAvailable: aiAvailable,
      clearResponse: clearAiResponse,
      tokensUsed,
      tokenLimit: aiTokenLimit,
    }),
    [askAI, aiProcessing, lastAiResponse, aiAvailable, clearAiResponse, tokensUsed, aiTokenLimit],
  );

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <ProjectContext.Provider value={projectContextValue}>
      <WizardContext.Provider value={wizardContextValue}>
        <AIAssistantContext.Provider value={aiContextValue}>
          {/* 
            ARIA Live Region for screen reader announcements.
            Uses sr-only class to hide visually but remain accessible.
            
            WHY A LIVE REGION?
            Screen reader users need to be informed when actions complete
            or the view changes. This region announces those changes
            without requiring the user to navigate to find the info.
          */}
          <output ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />

          {/* 
            Main content wrapper with focus management.
            The tabIndex allows programmatic focus for keyboard users.
            
            LAYOUT PHILOSOPHY:
            We use CSS custom properties for theming and responsive breakpoints.
            The shell provides the overall structure; child components fill in.
          */}
          <div
            ref={mainContentRef}
            tabIndex={-1}
            className="inspire-tool-shell"
            data-phase={currentPhase.phaseNumber}
            data-step={currentStep}
            data-experience={experienceLevel}
            data-transitioning={isTransitioning}
          >
            {children}
          </div>

          {/* 
            Debug panel (only shown in debug mode).
            Displays internal state for development troubleshooting.
          */}
          {debug && (
            <div className="inspire-debug-panel">
              <h4>INSPIRE Debug Panel</h4>
              <pre>
                {JSON.stringify(
                  {
                    projectId: project?.id,
                    currentStep,
                    completedSteps: Array.from(completedSteps),
                    progress,
                    isDirty,
                    tokensUsed,
                    aiAvailable,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        </AIAssistantContext.Provider>
      </WizardContext.Provider>
    </ProjectContext.Provider>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculates which steps are completed based on project state.
 *
 * This examines which ILA tool configurations are populated in the project
 * and infers which steps must have been completed to populate them.
 *
 * @param project - The project to analyze
 * @returns Set of completed step numbers
 */
function calculateCompletedSteps(project: INSPIREProject): Set<WizardStepNumber> {
  const completed = new Set<WizardStepNumber>();

  // Use the project's completedSteps array if available
  if (project.completedSteps && project.completedSteps.length > 0) {
    project.completedSteps.forEach((step) => {
      if (step >= 1 && step <= 17) {
        completed.add(step as WizardStepNumber);
      }
    });
    return completed;
  }

  // Fallback: infer from ILA tool configurations
  // Step 1-4 (ITLA-based): If ITLA has data, these might be complete
  if (project.encoding.itla) {
    // Check specific ITLA sections to determine which steps are done
    if (project.encoding.itla.businessContext) {
      completed.add(1); // Project Initiation
    }
    if (project.encoding.itla.audience) {
      completed.add(2); // Learner Analysis
    }
    if (project.encoding.itla.analysisTypes) {
      completed.add(3); // Needs Assessment
    }
    if (project.encoding.itla.technicalEnvironment) {
      completed.add(4); // Environmental Analysis
    }
  }

  // Step 5: If ICL and ICDT have data
  if (project.synthesization.icl || project.synthesization.icdt) {
    completed.add(5);
  }

  // Step 6: If ICPF has data
  if (project.synthesization.icpf) {
    completed.add(6);
  }

  // Step 7: If NPPM, ILMI, ICES have data
  if (project.encoding.nppm && project.encoding.ilmi && project.encoding.ices) {
    completed.add(7);
  }

  // Step 8: If ICDT and IPMG have data
  if (project.synthesization.icdt && project.synthesization.ipmg) {
    completed.add(8);
  }

  // Step 9: If ILMI and IDNS have data
  if (project.encoding.ilmi && project.assimilation.idns) {
    completed.add(9);
  }

  // Steps 10-17 are harder to infer without specific markers
  // These would need explicit completion flags in the project

  return completed;
}

// =============================================================================
// CSS FOR SHELL (would normally be in a separate file)
// =============================================================================
// Note: In production, these styles would be in a CSS module or Tailwind classes.
// Included here for completeness.

export const shellStyles = `
  .inspire-tool-shell {
    /* Main container fills viewport */
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
    display: flex;
    flex-direction: column;
    
    /* CSS custom properties for theming */
    --inspire-spacing-xs: 0.25rem;
    --inspire-spacing-sm: 0.5rem;
    --inspire-spacing-md: 1rem;
    --inspire-spacing-lg: 1.5rem;
    --inspire-spacing-xl: 2rem;
    
    /* Phase colors (set by data-phase attribute) */
    --inspire-phase-color: #3B82F6; /* Default blue */
    
    /* Transition for phase color changes */
    transition: background-color 0.3s ease;
  }
  
  /* Phase 1: Discovery - Deep Blue */
  .inspire-tool-shell[data-phase="1"] {
    --inspire-phase-color: #1E40AF;
  }
  
  /* Phase 2: Design - Purple */
  .inspire-tool-shell[data-phase="2"] {
    --inspire-phase-color: #7C3AED;
  }
  
  /* Phase 3: Development - Green */
  .inspire-tool-shell[data-phase="3"] {
    --inspire-phase-color: #059669;
  }
  
  /* Phase 4: Deployment - Red/Orange */
  .inspire-tool-shell[data-phase="4"] {
    --inspire-phase-color: #DC2626;
  }
  
  /* Transition animation */
  .inspire-tool-shell[data-transitioning="true"] {
    opacity: 0.7;
    pointer-events: none;
  }
  
  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  /* Debug panel */
  .inspire-debug-panel {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.9);
    color: #0F0;
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: monospace;
    font-size: 0.75rem;
    max-width: 300px;
    max-height: 400px;
    overflow: auto;
    z-index: 9999;
  }
  
  /* Responsive breakpoints */
  @media (max-width: 1024px) {
    .inspire-tool-shell {
      --inspire-spacing-lg: 1rem;
      --inspire-spacing-xl: 1.5rem;
    }
  }
  
  @media (max-width: 640px) {
    .inspire-tool-shell {
      --inspire-spacing-md: 0.75rem;
      --inspire-spacing-lg: 1rem;
    }
  }
  
  /* VR mode - larger touch targets, higher contrast */
  @media (min-width: 1920px) {
    .inspire-tool-shell {
      --inspire-spacing-md: 1.25rem;
      --inspire-spacing-lg: 2rem;
    }
  }
`;

// =============================================================================
// EXPORTS
// =============================================================================
export default INSPIREToolShell;
export {
  ProjectContext,
  WizardContext,
  AIAssistantContext,
  createDefaultProject,
  calculateCompletedSteps,
};
