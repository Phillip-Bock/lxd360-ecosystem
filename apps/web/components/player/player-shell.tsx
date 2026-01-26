'use client';

import { AnimatePresence } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ContentFormat,
  useContentWrapper,
  type WrapperProgress,
  type WrapperResult,
} from '@/lib/player';
import { cn } from '@/lib/utils';
import type {
  CourseWithContent,
  DesignerTheme,
  LearnerPreferences,
  LearnerProfile,
  LearnerProgress,
  PlayerState,
} from '@/types/player';
import { AccessibilityPanel } from './accessibility-panel';
import { KeyboardShortcutsOverlay } from './keyboard-shortcuts-overlay';
import { NeuronautPanel } from './neuronaut-panel';
import { PlayerContent } from './player-content';
import { PlayerControls } from './player-controls';
import { PlayerHeader } from './player-header';
import { PlayerSidebar } from './player-sidebar';

/**
 * External content configuration for SCORM/xAPI/cmi5/AICC packages.
 */
interface ExternalContentConfig {
  /** Content URL (package base URL or single file URL) */
  contentUrl: string;
  /** Whether content is a single file (PDF, HTML) vs package */
  isSingleFile?: boolean;
  /** Tenant ID */
  tenantId: string;
  /** Enrollment ID */
  enrollmentId: string;
  /** LRS endpoint (for xAPI/cmi5) */
  lrsEndpoint?: string;
  /** LRS auth (for xAPI) */
  lrsAuth?: {
    type: 'basic' | 'oauth';
    username?: string;
    password?: string;
    token?: string;
  };
  /** cmi5 fetch URL */
  cmi5FetchUrl?: string;
  /** cmi5 auth token */
  cmi5AuthToken?: string;
  /** AICC URL */
  aiccUrl?: string;
  /** AICC session ID */
  aiccSessionId?: string;
  /** Learner actor info (for xAPI/cmi5) */
  actor?: {
    name: string;
    mbox?: string;
    account?: {
      homePage: string;
      name: string;
    };
  };
  /** Initial SCORM data for resume */
  initialScormData?: Record<string, unknown>;
  /** Callback when external content progress updates */
  onExternalProgress?: (progress: WrapperProgress) => void;
  /** Callback when external content completes */
  onExternalComplete?: (result: WrapperResult) => void;
  /** Callback to commit/persist external content data */
  onExternalCommit?: (data: {
    format: ContentFormat;
    cmiData?: Record<string, unknown>;
    statements?: unknown[];
    stateData?: Record<string, unknown>;
  }) => Promise<void>;
}

interface PlayerShellProps {
  course: CourseWithContent;
  progress?: LearnerProgress | null;
  profile?: LearnerProfile | null;
  userId?: string;
  isDemo?: boolean;
  designerTheme?: DesignerTheme | null;
  learnerPreferences?: LearnerPreferences | null;
  onPreferencesChange?: (prefs: Partial<LearnerPreferences>) => void;
  /** Configuration for external SCORM/xAPI/cmi5/AICC content */
  externalContent?: ExternalContentConfig | null;
}

export function PlayerShell({
  course,
  progress,
  profile,
  userId,
  isDemo = false,
  designerTheme,
  externalContent,
}: PlayerShellProps) {
  // Flatten slides for navigation
  const allSlides = course.chapters.flatMap((chapter) => chapter.slides);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentSlideIndex: progress?.current_slide_id
      ? allSlides.findIndex((s) => s.id === progress.current_slide_id)
      : 0,
    volume: 1,
    playbackSpeed: profile?.default_playback_speed ?? 1,
    isFullscreen: false,
    isMuted: false,
    showCaptions: profile?.show_captions ?? false,
    sidebarOpen: true,
    sidebarTab: 'menu',
    neuronautOpen: false,
  });

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    colorBlindMode: profile?.color_blind_mode ?? 'none',
    fontSizeMultiplier: profile?.font_size_multiplier ?? 1,
    reducedMotion: profile?.reduced_motion ?? false,
    highContrast: profile?.high_contrast ?? false,
  });
  const [currentSkinId, setCurrentSkinId] = useState(profile?.active_skin_id ?? 'default');
  const [skinCssVars, setSkinCssVars] = useState<Record<string, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ==========================================================================
  // CONTENT WRAPPER INTEGRATION
  // ==========================================================================
  // Initialize the content wrapper hook for external SCORM/xAPI/cmi5/AICC content
  const contentWrapperConfig = externalContent
    ? {
        contentUrl: externalContent.contentUrl,
        isSingleFile: externalContent.isSingleFile,
        tenantId: externalContent.tenantId,
        enrollmentId: externalContent.enrollmentId,
        learnerId: userId ?? 'anonymous',
        courseId: course.id,
        lrsEndpoint: externalContent.lrsEndpoint,
        lrsAuth: externalContent.lrsAuth,
        cmi5FetchUrl: externalContent.cmi5FetchUrl,
        cmi5AuthToken: externalContent.cmi5AuthToken,
        aiccUrl: externalContent.aiccUrl,
        aiccSessionId: externalContent.aiccSessionId,
        actor: externalContent.actor,
        initialScormData: externalContent.initialScormData,
        onProgress: externalContent.onExternalProgress,
        onComplete: externalContent.onExternalComplete,
        onCommit: externalContent.onExternalCommit,
      }
    : null;

  const {
    state: wrapperState,
    initializeWrapper,
    terminateWrapper,
    detectFormat,
  } = useContentWrapper(
    contentWrapperConfig ?? {
      contentUrl: '',
      tenantId: '',
      enrollmentId: '',
      learnerId: '',
      courseId: '',
    },
  );

  // Detect content format when external content is provided
  useEffect(() => {
    if (externalContent && !wrapperState.format && !wrapperState.isLoading) {
      detectFormat();
    }
  }, [externalContent, wrapperState.format, wrapperState.isLoading, detectFormat]);

  // Initialize wrapper when iframe loads
  const handleIframeLoad = useCallback(() => {
    if (iframeRef.current?.contentWindow && wrapperState.format && !wrapperState.isInitialized) {
      initializeWrapper(iframeRef.current.contentWindow);
    }
  }, [wrapperState.format, wrapperState.isInitialized, initializeWrapper]);

  // Terminate wrapper on unmount or when external content changes
  useEffect(() => {
    return () => {
      if (wrapperState.isInitialized && !wrapperState.isTerminated) {
        terminateWrapper();
      }
    };
  }, [wrapperState.isInitialized, wrapperState.isTerminated, terminateWrapper]);

  // Check if we should show external content instead of native slides
  const showExternalContent = externalContent && wrapperState.manifest;

  const currentSlide = allSlides[state.currentSlideIndex];
  const completionPercentage = ((state.currentSlideIndex + 1) / allSlides.length) * 100;

  // Navigation functions
  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < allSlides.length) {
        setState((prev) => ({ ...prev, currentSlideIndex: index }));
      }
    },
    [allSlides.length],
  );

  const nextSlide = useCallback(() => {
    goToSlide(state.currentSlideIndex + 1);
  }, [state.currentSlideIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(state.currentSlideIndex - 1);
  }, [state.currentSlideIndex, goToSlide]);

  // Toggle functions
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const toggleNeuronaut = useCallback(() => {
    setState((prev) => ({ ...prev, neuronautOpen: !prev.neuronautOpen }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const setSidebarTab = useCallback((tab: PlayerState['sidebarTab']) => {
    setState((prev) => ({
      ...prev,
      sidebarTab: tab,
      sidebarOpen: true,
    }));
  }, []);

  const handleAccessibilityChange = useCallback((settings: Partial<LearnerProfile>) => {
    setAccessibilitySettings({
      colorBlindMode: settings.color_blind_mode ?? 'none',
      fontSizeMultiplier: settings.font_size_multiplier ?? 1,
      reducedMotion: settings.reduced_motion ?? false,
      highContrast: settings.high_contrast ?? false,
    });
  }, []);

  const handleSkinChange = useCallback((skinId: string, cssVariables: Record<string, string>) => {
    setCurrentSkinId(skinId);
    setSkinCssVars(cssVariables);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case ' ':
          e.preventDefault();
          setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
          break;
        case 'm':
        case 'M':
          toggleSidebar();
          break;
        case 'n':
        case 'N':
          setSidebarTab('notes');
          break;
        case 'g':
        case 'G':
          setSidebarTab('glossary');
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'a':
        case 'A':
          toggleNeuronaut();
          break;
        case '?':
          setShowShortcuts((prev) => !prev);
          break;
        case 'Escape':
          setShowShortcuts(false);
          setShowAccessibility(false);
          setState((prev) => ({ ...prev, neuronautOpen: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, toggleSidebar, toggleFullscreen, toggleNeuronaut, setSidebarTab]);

  // ==========================================================================
  // TWO-LAYER THEMING: Apply designer theme as base, learner prefs as overlay
  // ==========================================================================
  const playerStyles = {
    // Layer 1: Designer Theme (base)
    '--designer-primary': designerTheme?.primaryColor ?? '#0056B8',
    '--designer-secondary': designerTheme?.secondaryColor ?? '#019EF3',
    '--designer-accent': designerTheme?.accentColor ?? '#00d4ff',
    // Layer 2: Learner Preferences (overlay)
    '--font-scale': accessibilitySettings.fontSizeMultiplier,
    '--color-filter':
      accessibilitySettings.colorBlindMode === 'none'
        ? 'none'
        : `url(#${accessibilitySettings.colorBlindMode})`,
    // Skin CSS Variables (learner customization)
    ...skinCssVars,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={cn(
        'inspire-player relative flex h-screen w-full flex-col overflow-hidden',
        'bg-[var(--hud-bg,#000205)] text-[var(--hud-text,#f0f8ff)]',
        accessibilitySettings.highContrast && 'high-contrast',
        accessibilitySettings.reducedMotion && 'reduce-motion',
      )}
      style={playerStyles}
    >
      {!accessibilitySettings.reducedMotion && <div className="hud-starfield" />}

      {/* SVG Filters for Color Blindness */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter id="protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"
            />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"
            />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"
            />
          </filter>
        </defs>
      </svg>

      {/* Header HUD */}
      <PlayerHeader
        course={course}
        currentSlide={currentSlide}
        slideIndex={state.currentSlideIndex}
        totalSlides={allSlides.length}
        completionPercentage={completionPercentage}
        onToggleSidebar={toggleSidebar}
        onToggleNeuronaut={toggleNeuronaut}
        sidebarOpen={state.sidebarOpen}
        onOpenAccessibility={() => setShowAccessibility(true)}
      />

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {state.sidebarOpen && (
            <PlayerSidebar
              course={course}
              currentSlideIndex={state.currentSlideIndex}
              activeTab={state.sidebarTab}
              onTabChange={setSidebarTab}
              onSlideSelect={goToSlide}
              onClose={toggleSidebar}
              userId={isDemo ? 'demo-user' : (userId ?? '')}
              allSlides={allSlides}
              currentSkinId={currentSkinId}
              onSkinChange={handleSkinChange}
              isDemo={isDemo}
            />
          )}
        </AnimatePresence>

        {/* Content Viewport */}
        {showExternalContent ? (
          // External content (SCORM/xAPI/cmi5/AICC/HTML5/PDF) in iframe
          <div className="relative flex-1 overflow-hidden">
            {wrapperState.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--hud-bg,#000205)]">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--designer-primary,#0056B8)] border-t-transparent" />
                  <p className="text-sm text-[var(--hud-text,#f0f8ff)]/70">
                    Loading {wrapperState.format?.replace('_', ' ').toUpperCase() ?? 'content'}...
                  </p>
                </div>
              </div>
            )}
            {wrapperState.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--hud-bg,#000205)]">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-red-500/20 p-4">
                    <svg
                      className="h-8 w-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      role="img"
                      aria-label="Error"
                    >
                      <title>Error</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-red-400">{wrapperState.error}</p>
                </div>
              </div>
            )}
            {wrapperState.manifest && (
              <iframe
                ref={iframeRef}
                src={wrapperState.manifest.entryPoint}
                className="h-full w-full border-0"
                title={wrapperState.manifest.title ?? 'Course content'}
                onLoad={handleIframeLoad}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                allow="fullscreen"
              />
            )}
            {/* Progress indicator for external content */}
            {wrapperState.progress && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--hud-bg,#000205)]/50">
                <div
                  className="h-full bg-[var(--designer-primary,#0056B8)] transition-all duration-300"
                  style={{ width: `${wrapperState.progress.percent}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          // Native INSPIRE content
          <PlayerContent
            slide={currentSlide}
            slideIndex={state.currentSlideIndex}
            totalSlides={allSlides.length}
            isPlaying={state.isPlaying}
            onNext={nextSlide}
            onPrev={prevSlide}
            reducedMotion={accessibilitySettings.reducedMotion}
          />
        )}

        {/* Neuronaut AI Panel */}
        <AnimatePresence>
          {state.neuronautOpen && (
            <NeuronautPanel
              courseId={course.id}
              currentSlide={currentSlide}
              onClose={toggleNeuronaut}
              userId={isDemo ? 'demo-user' : (userId ?? '')}
              isDemo={isDemo}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <PlayerControls
        state={state}
        setState={setState}
        currentSlideIndex={state.currentSlideIndex}
        totalSlides={allSlides.length}
        onPrev={prevSlide}
        onNext={nextSlide}
        onGoToSlide={goToSlide}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Keyboard Shortcuts Overlay */}
      <AnimatePresence>
        {showShortcuts && <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      </AnimatePresence>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {showAccessibility && (
          <AccessibilityPanel
            profile={profile ?? null}
            userId={isDemo ? undefined : userId}
            onClose={() => setShowAccessibility(false)}
            onSettingsChange={handleAccessibilityChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
