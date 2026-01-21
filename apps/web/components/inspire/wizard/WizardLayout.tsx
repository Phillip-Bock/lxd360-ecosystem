'use client';

import React, {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CognitiveLoadMetrics } from '@/lib/inspire/types/inspire-types';

// Types
import type { WizardStepNumber } from '@/lib/inspire/types/wizard-config';
import { getPhaseForStep, WIZARD_PHASES, WIZARD_STEPS } from '@/lib/inspire/types/wizard-config';
// Context hooks from our shell
import { useAIAssistant, useProject, useWizard } from '../tools/INSPIREToolShell';

// =============================================================================
// LAYOUT CONFIGURATION
// =============================================================================
/**
 * Configuration for responsive breakpoints.
 * These match Tailwind's default breakpoints for consistency.
 *
 * WHY THESE SPECIFIC VALUES?
 * - 640px (sm): Most phones in portrait
 * - 768px (md): Tablets in portrait, large phones in landscape
 * - 1024px (lg): Tablets in landscape, small laptops
 * - 1280px (xl): Standard laptops and desktops
 * - 1536px (2xl): Large desktops and 1080p monitors
 * - 1920px (3xl): Full HD and beyond, potential VR
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

/**
 * Panel widths at different breakpoints.
 * These are optimized for content readability and visual balance.
 *
 * WHY THESE WIDTHS?
 * - Navigation sidebar: 280px gives enough room for step names
 * - AI assistant panel: 320px accommodates chat-style interface
 * - Main content: Flexible but constrained to ~900px max for readability
 *
 * Research shows optimal line length is 50-75 characters (45-65 for body text).
 * At 16px font with average character width of ~8px, that's 400-600px.
 * We use ~800px to allow for headings, images, and form layouts.
 */
const PANEL_WIDTHS = {
  navigation: {
    desktop: 280,
    tablet: 260,
    collapsed: 64,
  },
  assistant: {
    desktop: 320,
    tablet: 300,
    collapsed: 64,
  },
  mainContent: {
    min: 480,
    ideal: 800,
    max: 1200,
  },
} as const;

// =============================================================================
// TYPES
// =============================================================================

interface WizardLayoutProps {
  // The content to render in the main area
  children: ReactNode;
  // Whether to show the navigation sidebar
  showNavigation?: boolean;
  // Whether to show the AI assistant sidebar
  showAssistant?: boolean;
  // Whether VR mode is enabled
  vrMode?: boolean;
  // Custom class name for additional styling
  className?: string;
  // Callback when step is clicked in navigation
  onStepClick?: (step: WizardStepNumber) => void;
  // Render prop for custom header content
  renderHeader?: () => ReactNode;
  // Render prop for custom footer content
  renderFooter?: () => ReactNode;
}

interface PanelState {
  navigation: 'open' | 'collapsed' | 'hidden';
  assistant: 'open' | 'collapsed' | 'hidden';
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Custom hook for responsive breakpoint detection.
 *
 * WHY A CUSTOM HOOK?
 * We need to know the current breakpoint to:
 * 1. Adjust layout structure (stacked vs side-by-side)
 * 2. Show/hide panels appropriately
 * 3. Adjust touch targets and spacing
 *
 * Using a custom hook centralizes this logic and ensures
 * consistent breakpoint detection across the application.
 */
function useBreakpoint(): { breakpoint: keyof typeof BREAKPOINTS | 'xs'; width: number } {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS | 'xs'>('lg');
  const [width, setWidth] = useState(1024);

  useEffect(() => {
    // Handler to update breakpoint
    const updateBreakpoint = (): void => {
      const w = window.innerWidth;
      setWidth(w);

      if (w >= BREAKPOINTS['3xl']) {
        setBreakpoint('3xl');
      } else if (w >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (w >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (w >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (w >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else if (w >= BREAKPOINTS.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    // Initial check
    updateBreakpoint();

    // Listen for resize
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: width < BREAKPOINTS.lg,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isLargeDesktop: width >= BREAKPOINTS['2xl'],
    isVRCapable: width >= BREAKPOINTS['3xl'],
  };
}

/**
 * Custom hook for panel state management.
 *
 * WHY MANAGE PANEL STATE?
 * Users have different preferences for their workspace:
 * - Some want everything visible at once
 * - Some want to focus on content with panels hidden
 * - Some want quick access via collapsed panels
 *
 * We persist these preferences in localStorage so the layout
 * remembers how the user likes to work.
 */
function usePanelState(
  isMobile: boolean,
  defaultState?: Partial<PanelState>,
): [PanelState, (panel: keyof PanelState, state: PanelState[keyof PanelState]) => void] {
  const [panelState, setPanelState] = useState<PanelState>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inspire-panel-state');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Silently ignore - invalid JSON in localStorage, use default panel state
        }
      }
    }

    // Default state based on device type
    return {
      navigation: isMobile ? 'hidden' : 'open',
      assistant: isMobile ? 'hidden' : 'collapsed',
      ...defaultState,
    };
  });

  // Update panel state
  const updatePanel = useCallback(
    (panel: keyof PanelState, state: PanelState[keyof PanelState]) => {
      setPanelState((prev) => {
        const next = { ...prev, [panel]: state };

        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('inspire-panel-state', JSON.stringify(next));
        }

        return next;
      });
    },
    [],
  );

  // Automatically adjust for mobile
  useEffect(() => {
    if (isMobile) {
      // On mobile, panels default to hidden (shown as drawers when opened)
      setPanelState((prev) => ({
        navigation: prev.navigation === 'open' ? 'hidden' : prev.navigation,
        assistant: prev.assistant === 'open' ? 'hidden' : prev.assistant,
      }));
    }
  }, [isMobile]);

  return [panelState, updatePanel];
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Header Component
 *
 * The header contains:
 * - Project name and status
 * - Save indicator
 * - Phase indicator
 * - Global actions (settings, export, help)
 *
 * NEURODIVERSITY NOTES:
 * - Always shows save status (reduces anxiety about data loss)
 * - Clear phase indicator (provides context and orientation)
 * - Consistent positioning (predictable layout)
 */
interface HeaderProps {
  vrMode: boolean;
  onToggleNavigation: () => void;
  onToggleAssistant: () => void;
  navigationOpen: boolean;
  assistantOpen: boolean;
  renderCustom?: () => ReactNode;
}

function Header({
  vrMode,
  onToggleNavigation,
  onToggleAssistant,
  navigationOpen,
  assistantOpen,
  renderCustom,
}: HeaderProps) {
  const { project, isSaving, lastSaved, isDirty, experienceLevel } = useProject();
  const { currentStep, progress, currentPhase } = useWizard();
  const { isAvailable: aiAvailable, tokensUsed, tokenLimit } = useAIAssistant();

  // Format last saved time
  const lastSavedText = useMemo(() => {
    if (!lastSaved) return 'Not saved yet';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();

    if (diff < 60000) return 'Saved just now';
    if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
    return `Saved ${Math.floor(diff / 3600000)}h ago`;
  }, [lastSaved]);

  return (
    <header
      className="inspire-header"
      // VR mode increases header height for easier interaction
      style={
        {
          '--header-height': vrMode ? '80px' : '60px',
        } as CSSProperties
      }
    >
      {/* Left section: Navigation toggle + Project info */}
      <div className="inspire-header__left">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inspire-header__menu-toggle"
          onClick={onToggleNavigation}
          aria-expanded={navigationOpen}
          aria-label={navigationOpen ? 'Close navigation' : 'Open navigation'}
          // Minimum 44px touch target for accessibility
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {/* Hamburger icon - changes to X when open */}
          <span className="inspire-header__menu-icon" data-open={navigationOpen} aria-hidden="true">
            {navigationOpen ? '✕' : '☰'}
          </span>
        </button>

        {/* Project name and status */}
        <div className="inspire-header__project">
          <h1 className="inspire-header__project-name">{project?.name || 'New INSPIRE Project'}</h1>

          {/* Save status indicator */}
          <div className="inspire-header__save-status" aria-live="polite">
            {isSaving ? (
              <span className="inspire-header__saving">
                <span className="inspire-header__saving-icon" aria-hidden="true">
                  ⟳
                </span>
                Saving...
              </span>
            ) : isDirty ? (
              <span className="inspire-header__unsaved">
                <span aria-hidden="true">•</span>
                Unsaved changes
              </span>
            ) : (
              <span className="inspire-header__saved">{lastSavedText}</span>
            )}
          </div>
        </div>
      </div>

      {/* Center section: Phase and progress */}
      <div className="inspire-header__center">
        {/* Phase indicator with color coding */}
        <div
          className="inspire-header__phase"
          style={
            {
              '--phase-color': currentPhase.primaryColor,
            } as CSSProperties
          }
        >
          <span className="inspire-header__phase-number">Phase {currentPhase.id}</span>
          <span className="inspire-header__phase-name">{currentPhase.name}</span>
        </div>

        {/* Progress bar */}
        <div
          className="inspire-header__progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Project progress: ${progress}% complete`}
        >
          <div className="inspire-header__progress-bar" style={{ width: `${progress}%` }} />
          <span className="inspire-header__progress-text">{progress}%</span>
        </div>

        {/* Current step indicator */}
        <div className="inspire-header__step">Step {currentStep} of 17</div>
      </div>

      {/* Right section: Actions and AI toggle */}
      <div className="inspire-header__right">
        {/* AI tokens remaining indicator */}
        {aiAvailable && (
          <div
            className="inspire-header__ai-quota"
            title={`AI tokens: ${tokensUsed.toLocaleString()} / ${tokenLimit.toLocaleString()} used`}
          >
            <span className="inspire-header__ai-icon" aria-hidden="true">
              ✨
            </span>
            <span className="inspire-header__ai-percent">
              {Math.round((1 - tokensUsed / tokenLimit) * 100)}%
            </span>
          </div>
        )}

        {/* Experience level indicator */}
        <div className="inspire-header__experience">
          {experienceLevel === 'novice' && '🌱'}
          {experienceLevel === 'intermediate' && '🌿'}
          {experienceLevel === 'advanced' && '🌳'}
          {experienceLevel === 'expert' && '🎓'}
        </div>

        {/* AI assistant toggle */}
        <button
          type="button"
          className="inspire-header__assistant-toggle"
          onClick={onToggleAssistant}
          aria-expanded={assistantOpen}
          aria-label={assistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <span aria-hidden="true">🤖</span>
        </button>

        {/* Custom header content slot */}
        {renderCustom?.()}
      </div>
    </header>
  );
}

/**
 * Navigation Sidebar Component
 *
 * Displays the 17-step wizard navigation with:
 * - Phase groupings
 * - Step completion status
 * - Current step highlight
 * - Prerequisite indicators
 *
 * ACCESSIBILITY:
 * - Full keyboard navigation (arrow keys within nav)
 * - Current step announced to screen readers
 * - Disabled steps explained (not just grayed out)
 *
 * NEURODIVERSITY:
 * - Visual progress through icons
 * - Consistent left-side positioning
 * - Phase colors match content phase
 */
interface NavigationSidebarProps {
  state: 'open' | 'collapsed' | 'hidden';
  onClose: () => void;
  onCollapse: () => void;
  isMobile: boolean;
}

function NavigationSidebar({ state, onClose, onCollapse, isMobile }: NavigationSidebarProps) {
  const { currentStep, goToStep, completedSteps, canAccessStep, progress } = useWizard();

  // Group steps by phase for rendering
  const stepsByPhase = useMemo(() => {
    const grouped: Record<number, WizardStepNumber[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    for (let i = 1; i <= 17; i++) {
      const step = i as WizardStepNumber;
      const phase = getPhaseForStep(step);
      grouped[phase.id].push(step);
    }

    return grouped;
  }, []);

  // Handle step click
  const handleStepClick = useCallback(
    (step: WizardStepNumber) => {
      if (canAccessStep(step)) {
        goToStep(step);
        if (isMobile) {
          onClose();
        }
      }
    },
    [canAccessStep, goToStep, isMobile, onClose],
  );

  // Handle keyboard navigation within the nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, step: WizardStepNumber) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStepClick(step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(step + 1, 17) as WizardStepNumber;
        document.getElementById(`nav-step-${next}`)?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(step - 1, 1) as WizardStepNumber;
        document.getElementById(`nav-step-${prev}`)?.focus();
      }
    },
    [handleStepClick],
  );

  if (state === 'hidden') {
    return null;
  }

  const isCollapsed = state === 'collapsed';

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isMobile && state === 'open' && (
        <div className="inspire-nav__overlay" onClick={onClose} aria-hidden="true" />
      )}

      <nav
        className={`inspire-nav ${isCollapsed ? 'inspire-nav--collapsed' : ''} ${isMobile ? 'inspire-nav--mobile' : ''}`}
        aria-label="Wizard navigation"
        style={{
          width: isCollapsed ? PANEL_WIDTHS.navigation.collapsed : PANEL_WIDTHS.navigation.desktop,
        }}
      >
        {/* Collapse/Expand toggle (desktop only) */}
        {!isMobile && (
          <button
            type="button"
            className="inspire-nav__collapse-toggle"
            onClick={onCollapse}
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        )}

        {/* Progress circle (shown when collapsed) */}
        {isCollapsed && (
          <div
            className="inspire-nav__progress-circle"
            role="img"
            aria-label={`Progress: ${progress}%`}
          >
            <svg aria-hidden="true" viewBox="0 0 36 36">
              <path
                className="inspire-nav__progress-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="inspire-nav__progress-fill"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="inspire-nav__progress-text">
                {progress}%
              </text>
            </svg>
          </div>
        )}

        {/* Full navigation (shown when expanded) */}
        {!isCollapsed && (
          <div className="inspire-nav__content">
            {/* Overall progress header */}
            <div className="inspire-nav__header">
              <h2 className="inspire-nav__title">Course Creation</h2>
              <div className="inspire-nav__progress-bar">
                <div className="inspire-nav__progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="inspire-nav__progress-label">{progress}% complete</span>
            </div>

            {/* Steps grouped by phase */}
            <div className="inspire-nav__phases">
              {WIZARD_PHASES.map((phase) => (
                <div
                  key={phase.id}
                  className="inspire-nav__phase"
                  style={
                    {
                      '--phase-color': phase.primaryColor,
                    } as CSSProperties
                  }
                >
                  {/* Phase header */}
                  <h3 className="inspire-nav__phase-title">
                    <span className="inspire-nav__phase-number">{phase.id}</span>
                    {phase.name}
                  </h3>

                  {/* Steps in this phase */}
                  <ul className="inspire-nav__steps">
                    {stepsByPhase[phase.id].map((stepNum) => {
                      const step = WIZARD_STEPS[stepNum];
                      const isCompleted = completedSteps.has(stepNum);
                      const isCurrent = stepNum === currentStep;
                      const isAccessible = canAccessStep(stepNum);

                      return (
                        <li key={stepNum}>
                          <button
                            type="button"
                            id={`nav-step-${stepNum}`}
                            className={`inspire-nav__step ${isCurrent ? 'inspire-nav__step--current' : ''} ${isCompleted ? 'inspire-nav__step--completed' : ''} ${!isAccessible ? 'inspire-nav__step--locked' : ''}`}
                            onClick={() => handleStepClick(stepNum)}
                            onKeyDown={(e) => handleKeyDown(e, stepNum)}
                            disabled={!isAccessible}
                            aria-current={isCurrent ? 'step' : undefined}
                            aria-disabled={!isAccessible}
                            tabIndex={isAccessible ? 0 : -1}
                          >
                            {/* Step number with status icon */}
                            <span className="inspire-nav__step-number">
                              {isCompleted ? '✓' : stepNum}
                            </span>

                            {/* Step name */}
                            <span className="inspire-nav__step-name">{step.shortName}</span>

                            {/* Optional indicator */}
                            {step.isOptional && (
                              <span className="inspire-nav__step-optional" title="Optional step">
                                opt
                              </span>
                            )}

                            {/* Lock indicator for inaccessible steps */}
                            {!isAccessible && (
                              <span
                                className="inspire-nav__step-lock"
                                role="img"
                                aria-label="Locked - complete prerequisites first"
                              >
                                🔒
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

/**
 * AI Assistant Sidebar Component
 *
 * The AI assistant panel provides:
 * - Chat-style interface for asking questions
 * - Contextual suggestions based on current step
 * - Cognitive load indicator
 * - Quick action buttons
 *
 * DESIGN PHILOSOPHY:
 * The AI assistant should feel like a helpful colleague, not
 * an intrusive popup. It's always available but never pushy.
 */
interface AssistantSidebarProps {
  state: 'open' | 'collapsed' | 'hidden';
  onClose: () => void;
  onExpand: () => void;
  isMobile: boolean;
}

function AssistantSidebar({ state, onClose, onExpand, isMobile }: AssistantSidebarProps) {
  const { cognitiveLoad } = useProject();
  const { currentStep } = useWizard();
  const { isProcessing, lastResponse, isAvailable, askAI, clearResponse } = useAIAssistant();

  const [inputValue, setInputValue] = useState('');

  const currentStepConfig = WIZARD_STEPS[currentStep];

  // Handle asking the AI a question
  const handleAsk = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    await askAI({
      requestId: `user-${Date.now()}`,
      assistanceType: 'explain-better',
      context: {
        currentStep,
        stepName: currentStepConfig.name,
        userQuestion: inputValue.trim(),
      },
    });

    setInputValue('');
  }, [inputValue, isProcessing, askAI, currentStep, currentStepConfig.name]);

  // Quick action buttons for common requests
  const quickActions = useMemo(
    () => [
      {
        id: 'explain',
        label: 'Explain this step',
        icon: '💡',
        type: 'explain-better' as const,
      },
      {
        id: 'example',
        label: 'Show me an example',
        icon: '📝',
        type: 'give-example' as const,
      },
      {
        id: 'help',
        label: "I'm stuck",
        icon: '🆘',
        type: 'help' as const,
      },
      {
        id: 'validate',
        label: 'Check my work',
        icon: '✅',
        type: 'validate' as const,
      },
    ],
    [],
  );

  const handleQuickAction = useCallback(
    async (actionType: (typeof quickActions)[number]['type']) => {
      await askAI({
        requestId: `quick-${actionType}-${Date.now()}`,
        assistanceType: actionType,
        context: {
          currentStep,
          stepName: currentStepConfig.name,
        },
      });
    },
    [askAI, currentStep, currentStepConfig.name],
  );

  if (state === 'hidden') {
    return null;
  }

  const isCollapsed = state === 'collapsed';

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isMobile && state === 'open' && (
        <div className="inspire-assistant__overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`inspire-assistant ${isCollapsed ? 'inspire-assistant--collapsed' : ''} ${isMobile ? 'inspire-assistant--mobile' : ''}`}
        aria-label="AI Assistant"
        style={{
          width: isCollapsed ? PANEL_WIDTHS.assistant.collapsed : PANEL_WIDTHS.assistant.desktop,
        }}
      >
        {/* Expand toggle (when collapsed) */}
        {isCollapsed && (
          <button
            type="button"
            className="inspire-assistant__expand"
            onClick={onExpand}
            aria-label="Expand AI assistant"
          >
            <span aria-hidden="true">🤖</span>
            {cognitiveLoad && (
              <span
                className="inspire-assistant__load-indicator"
                data-level={interpretCognitiveLoadLevel(cognitiveLoad.totalLoad)}
              />
            )}
          </button>
        )}

        {/* Full assistant panel (when expanded) */}
        {!isCollapsed && (
          <div className="inspire-assistant__content">
            {/* Header */}
            <div className="inspire-assistant__header">
              <h2 className="inspire-assistant__title">AI Assistant</h2>
              <button
                type="button"
                className="inspire-assistant__close"
                onClick={onClose}
                aria-label="Close AI assistant"
              >
                ✕
              </button>
            </div>

            {/* Cognitive load indicator */}
            {cognitiveLoad && (
              <div className="inspire-assistant__cognitive-load">
                <h3>Cognitive Load</h3>
                <CognitiveLoadMini metrics={cognitiveLoad} />
              </div>
            )}

            {/* Quick actions */}
            <div className="inspire-assistant__quick-actions">
              <h3>Quick Help</h3>
              <div className="inspire-assistant__action-grid">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.id}
                    className="inspire-assistant__action"
                    onClick={() => handleQuickAction(action.type)}
                    disabled={isProcessing || !isAvailable}
                  >
                    <span className="inspire-assistant__action-icon">{action.icon}</span>
                    <span className="inspire-assistant__action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Response display */}
            {lastResponse && (
              <div className="inspire-assistant__response">
                <div className="inspire-assistant__response-content">{lastResponse.content}</div>
                <button
                  type="button"
                  className="inspire-assistant__response-dismiss"
                  onClick={clearResponse}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="inspire-assistant__processing">
                <span className="inspire-assistant__spinner" />
                Thinking...
              </div>
            )}

            {/* Chat input */}
            <div className="inspire-assistant__input-area">
              <textarea
                className="inspire-assistant__input"
                placeholder="Ask me anything about this step..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                disabled={!isAvailable}
                rows={2}
              />
              <button
                type="button"
                className="inspire-assistant__send"
                onClick={handleAsk}
                disabled={!inputValue.trim() || isProcessing || !isAvailable}
                aria-label="Send message"
              >
                Send
              </button>
            </div>

            {/* Availability indicator */}
            {!isAvailable && (
              <div className="inspire-assistant__unavailable">
                AI assistance is currently unavailable. You can continue working manually.
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

/**
 * Mini cognitive load display for the assistant sidebar.
 */
function CognitiveLoadMini({ metrics }: { metrics: CognitiveLoadMetrics }) {
  const level = interpretCognitiveLoadLevel(metrics.totalLoad);

  return (
    <div className="inspire-cognitive-mini">
      <div
        className="inspire-cognitive-mini__bar"
        style={
          {
            '--load-percent': `${metrics.totalLoad}%`,
            '--load-color':
              level === 'optimal'
                ? 'var(--color-lxd-success)'
                : level === 'high'
                  ? 'var(--color-warning)'
                  : level === 'critical'
                    ? 'var(--color-error)'
                    : 'var(--color-studio-text-muted)',
          } as CSSProperties
        }
      >
        <div className="inspire-cognitive-mini__fill" />
      </div>
      <span className="inspire-cognitive-mini__label">
        {metrics.totalLoad}% ({level})
      </span>
    </div>
  );
}

/**
 * Interpret cognitive load level from numeric value.
 */
function interpretCognitiveLoadLevel(load: number): 'low' | 'optimal' | 'high' | 'critical' {
  if (load < 30) return 'low';
  if (load <= 70) return 'optimal';
  if (load <= 90) return 'high';
  return 'critical';
}

// =============================================================================
// MAIN LAYOUT COMPONENT
// =============================================================================

export function WizardLayout({
  children,
  showNavigation = true,
  showAssistant = true,
  vrMode = false,
  className = '',
  renderHeader,
  renderFooter,
}: WizardLayoutProps): React.JSX.Element {
  const { isMobile, isVRCapable } = useBreakpoint();
  const { currentStep, nextStep, previousStep, completedSteps, completeStep, canAccessStep } =
    useWizard();

  // Panel state management
  const [panelState, updatePanel] = usePanelState(isMobile);

  // Determine effective VR mode
  const effectiveVrMode = vrMode && isVRCapable;

  // Toggle handlers
  const toggleNavigation = useCallback(() => {
    updatePanel('navigation', panelState.navigation === 'open' ? 'hidden' : 'open');
  }, [panelState.navigation, updatePanel]);

  const toggleAssistant = useCallback(() => {
    updatePanel('assistant', panelState.assistant === 'open' ? 'hidden' : 'open');
  }, [panelState.assistant, updatePanel]);

  const collapseNavigation = useCallback(() => {
    updatePanel('navigation', panelState.navigation === 'collapsed' ? 'open' : 'collapsed');
  }, [panelState.navigation, updatePanel]);

  const expandAssistant = useCallback(() => {
    updatePanel('assistant', 'open');
  }, [updatePanel]);

  // Current step configuration
  const currentStepConfig = WIZARD_STEPS[currentStep];

  // Handle step completion and navigation
  const handleNext = useCallback(() => {
    // Mark current step as complete before moving on
    completeStep(currentStep);
    nextStep();
  }, [completeStep, currentStep, nextStep]);

  return (
    <div
      className={`inspire-layout ${className} ${effectiveVrMode ? 'inspire-layout--vr' : ''}`}
      data-vr-mode={effectiveVrMode}
    >
      {/* Header */}
      <Header
        vrMode={effectiveVrMode}
        onToggleNavigation={toggleNavigation}
        onToggleAssistant={toggleAssistant}
        navigationOpen={panelState.navigation === 'open'}
        assistantOpen={panelState.assistant === 'open'}
        renderCustom={renderHeader}
      />

      {/* Main content area with sidebars */}
      <div className="inspire-layout__body">
        {/* Navigation sidebar */}
        {showNavigation && (
          <NavigationSidebar
            state={panelState.navigation}
            onClose={() => updatePanel('navigation', 'hidden')}
            onCollapse={collapseNavigation}
            isMobile={isMobile}
          />
        )}

        {/* Main content */}
        <main
          className="inspire-layout__main"
          aria-label={`Step ${currentStep}: ${currentStepConfig.name}`}
        >
          {/* Step header */}
          <div className="inspire-layout__step-header">
            <span className="inspire-layout__step-number">Step {currentStep}</span>
            <h2 className="inspire-layout__step-name">{currentStepConfig.name}</h2>
            {currentStepConfig.isOptional && (
              <span className="inspire-layout__step-optional">Optional</span>
            )}
          </div>

          {/* Step description */}
          <p className="inspire-layout__step-description">{currentStepConfig.description}</p>

          {/* Actual step content */}
          <div className="inspire-layout__content">{children}</div>

          {/* Step footer with navigation */}
          <footer className="inspire-layout__footer">
            {/* Previous button */}
            <button
              type="button"
              className="inspire-layout__nav-button inspire-layout__nav-button--prev"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              ← Previous
            </button>

            {/* Custom footer content slot */}
            {renderFooter?.()}

            {/* Step completion status */}
            <div className="inspire-layout__step-status">
              {completedSteps.has(currentStep) ? (
                <span className="inspire-layout__completed">✓ Completed</span>
              ) : (
                <span className="inspire-layout__in-progress">In Progress</span>
              )}
            </div>

            {/* Next/Complete button */}
            {currentStep < 17 ? (
              <button
                type="button"
                className="inspire-layout__nav-button inspire-layout__nav-button--next"
                onClick={handleNext}
                disabled={!canAccessStep((currentStep + 1) as WizardStepNumber)}
              >
                {completedSteps.has(currentStep) ? 'Next' : 'Complete & Continue'} →
              </button>
            ) : (
              <button
                type="button"
                className="inspire-layout__nav-button inspire-layout__nav-button--finish"
                onClick={() => completeStep(17)}
              >
                Finish Project 🎉
              </button>
            )}
          </footer>
        </main>

        {/* AI Assistant sidebar */}
        {showAssistant && (
          <AssistantSidebar
            state={panelState.assistant}
            onClose={() => updatePanel('assistant', 'collapsed')}
            onExpand={expandAssistant}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// LAYOUT STYLES
// =============================================================================
// Note: In production, these would be in CSS modules or Tailwind.
// Included here for completeness and to show the responsive approach.

export const layoutStyles = `
  /* Main layout container */
  .inspire-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--inspire-bg, var(--color-bg-subtle));
  }
  
  /* Header */
  .inspire-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-height, 60px);
    padding: 0 1rem;
    background: white;
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .inspire-header__left,
  .inspire-header__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .inspire-header__center {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .inspire-header__project-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .inspire-header__save-status {
    font-size: 0.75rem;
    color: var(--color-studio-text-muted);
  }
  
  .inspire-header__phase {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: var(--phase-color, var(--color-primary));
    color: white;
    border-radius: 9999px;
    font-size: 0.875rem;
  }
  
  .inspire-header__progress {
    width: 120px;
    height: 8px;
    background: var(--color-bg-muted);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .inspire-header__progress-bar {
    height: 100%;
    background: var(--inspire-phase-color, var(--color-primary));
    transition: width 0.3s ease;
  }
  
  /* Body layout */
  .inspire-layout__body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  /* Navigation sidebar */
  .inspire-nav {
    display: flex;
    flex-direction: column;
    background: white;
    border-right: 1px solid var(--color-border);
    transition: width 0.3s ease;
    overflow-y: auto;
    shrink: 0;
  }
  
  .inspire-nav--collapsed {
    align-items: center;
    padding: 1rem 0;
  }
  
  .inspire-nav--mobile {
    position: fixed;
    left: 0;
    top: var(--header-height, 60px);
    bottom: 0;
    z-index: 50;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }
  
  .inspire-nav__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 40;
  }
  
  .inspire-nav__step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  
  .inspire-nav__step:hover:not(:disabled) {
    background: var(--color-bg-subtle);
  }

  .inspire-nav__step--current {
    background: var(--color-bg-accent-subtle);
    border-left: 3px solid var(--phase-color, var(--color-primary));
  }

  .inspire-nav__step--completed .inspire-nav__step-number {
    background: var(--color-lxd-success);
    color: white;
  }
  
  .inspire-nav__step--locked {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .inspire-nav__step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-muted);
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  /* Main content area */
  .inspire-layout__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 1.5rem;
    max-width: ${PANEL_WIDTHS.mainContent.max}px;
    margin: 0 auto;
  }
  
  .inspire-layout__step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .inspire-layout__step-number {
    font-size: 0.875rem;
    color: var(--color-studio-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .inspire-layout__step-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  .inspire-layout__step-description {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
  }
  
  .inspire-layout__content {
    flex: 1;
    min-height: 400px;
  }
  
  .inspire-layout__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1.5rem;
    margin-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }
  
  .inspire-layout__nav-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .inspire-layout__nav-button--prev {
    background: var(--color-bg-subtle);
    color: var(--color-text);
  }

  .inspire-layout__nav-button--next,
  .inspire-layout__nav-button--finish {
    background: var(--inspire-phase-color, var(--color-primary));
    color: white;
  }
  
  .inspire-layout__nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* AI Assistant sidebar */
  .inspire-assistant {
    display: flex;
    flex-direction: column;
    background: white;
    border-left: 1px solid var(--color-border);
    transition: width 0.3s ease;
    shrink: 0;
  }
  
  .inspire-assistant--collapsed {
    align-items: center;
    padding: 1rem 0;
  }
  
  .inspire-assistant--mobile {
    position: fixed;
    right: 0;
    top: var(--header-height, 60px);
    bottom: 0;
    z-index: 50;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  }
  
  .inspire-assistant__content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
  }
  
  .inspire-assistant__quick-actions {
    margin-bottom: 1rem;
  }
  
  .inspire-assistant__action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .inspire-assistant__action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem;
    background: var(--color-bg-subtle);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: background 0.15s ease;
  }

  .inspire-assistant__action:hover:not(:disabled) {
    background: var(--color-bg-muted);
  }
  
  .inspire-assistant__input-area {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .inspire-assistant__input {
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    resize: none;
    font-family: inherit;
  }

  .inspire-assistant__send {
    padding: 0.75rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  /* Cognitive load mini display */
  .inspire-cognitive-mini {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .inspire-cognitive-mini__bar {
    height: 8px;
    background: var(--color-bg-muted);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .inspire-cognitive-mini__fill {
    height: 100%;
    width: var(--load-percent);
    background: var(--load-color);
    transition: width 0.3s ease;
  }
  
  /* VR Mode adjustments */
  .inspire-layout--vr {
    --inspire-spacing-base: 1.5rem;
    font-size: 1.125rem;
  }
  
  .inspire-layout--vr .inspire-layout__nav-button {
    padding: 1rem 2rem;
    font-size: 1.125rem;
    min-height: 56px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .inspire-header__center {
      display: none;
    }
    
    .inspire-layout__main {
      padding: 1rem;
    }
  }
  
  @media (max-width: 640px) {
    .inspire-header__project-name {
      font-size: 1rem;
    }
    
    .inspire-layout__step-name {
      font-size: 1.25rem;
    }
    
    .inspire-layout__footer {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .inspire-layout__nav-button {
      flex: 1;
      min-width: 120px;
    }
  }
`;

// =============================================================================
// EXPORTS
// =============================================================================
export default WizardLayout;
export { useBreakpoint, usePanelState };
