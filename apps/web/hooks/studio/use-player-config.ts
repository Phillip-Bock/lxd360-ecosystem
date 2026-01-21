/**
 * usePlayerConfig - Phase 12
 * Hook for managing player configuration
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  AccessibilityConfig,
  BrandingConfig,
  ChromeConfig,
  NavigationConfig,
  NeuroConfig,
  PlayerConfig,
  ProgressConfig,
} from '@/types/studio/player-config';

// Re-export the default config
export { DEFAULT_PLAYER_CONFIG } from '@/types/studio/player-config';

// =============================================================================
// TYPES
// =============================================================================

interface UsePlayerConfigOptions {
  /** Initial configuration */
  initialConfig?: Partial<PlayerConfig>;
  /** Local storage key for persistence */
  storageKey?: string;
  /** Callback when config changes */
  onConfigChange?: (config: PlayerConfig) => void;
}

interface UsePlayerConfigReturn {
  config: PlayerConfig;

  // Section updaters
  updateChrome: (updates: Partial<ChromeConfig>) => void;
  updateAccessibility: (updates: Partial<AccessibilityConfig>) => void;
  updateNeuro: (updates: Partial<NeuroConfig>) => void;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  updateNavigation: (updates: Partial<NavigationConfig>) => void;
  updateProgress: (updates: Partial<ProgressConfig>) => void;

  // Full config updater
  setConfig: (config: PlayerConfig) => void;

  // Reset to defaults
  resetToDefaults: () => void;
  resetSection: (section: keyof PlayerConfig) => void;

  // Presets
  applyPreset: (preset: ConfigPreset) => void;

  // Export/Import
  exportConfig: () => string;
  importConfig: (json: string) => boolean;

  // Validation
  validateConfig: () => ValidationResult;

  // Helpers
  isDirty: boolean;
  lastSaved: Date | null;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

type ConfigPreset =
  | 'default'
  | 'minimal'
  | 'accessibility-first'
  | 'neuro-friendly'
  | 'corporate'
  | 'immersive';

// =============================================================================
// DEFAULT CONFIG (Inline to avoid circular dependency)
// =============================================================================

const DEFAULT_CONFIG: PlayerConfig = {
  chrome: {
    layout: 'standard',
    theme: 'dark',
    showHeader: true,
    showFooter: true,
    showSidebar: true,
    showMinimap: false,
    borderRadius: 'md',
    animations: 'standard',
    header: {
      showTitle: true,
      showProgress: true,
      showMenu: true,
      showClose: true,
      showSettings: true,
      logoPosition: 'left',
      height: 48,
    },
    footer: {
      showNavigation: true,
      showSlideCounter: true,
      showPlayPause: true,
      showVolume: true,
      showFullscreen: true,
      showCaptions: true,
      showSpeed: false,
      height: 56,
    },
    sidebar: {
      position: 'left',
      defaultState: 'auto',
      showTOC: true,
      showResources: true,
      showGlossary: false,
      showNotes: true,
      showBookmarks: true,
      showSearch: true,
      width: 280,
    },
  },
  accessibility: {
    text: {
      fontSize: 100,
      allowFontResize: true,
      minFontSize: 75,
      maxFontSize: 200,
      fontFamily: 'default',
      lineHeight: 1.5,
      letterSpacing: 'normal',
      wordSpacing: 'normal',
    },
    visual: {
      highContrast: false,
      reduceMotion: false,
      reduceTransparency: false,
      colorBlindMode: 'none',
      focusIndicator: 'default',
      alwaysShowFocus: false,
      showImageDescriptions: false,
    },
    audio: {
      defaultVolume: 80,
      autoPlay: false,
      showCaptions: false,
      captionStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 100,
        textColor: '#ffffff',
        backgroundColor: '#000000',
        backgroundOpacity: 0.75,
        edgeStyle: 'none',
        position: 'bottom',
      },
      audioDescriptions: false,
      signLanguage: false,
      textToSpeech: false,
      ttsRate: 1,
    },
    navigation: {
      keyboardNav: true,
      skipLinks: true,
      customTabOrder: false,
      screenReaderMode: false,
      announcePageChanges: true,
      announceInteractions: false,
    },
    timing: {
      allowExtendedTime: false,
      timeMultiplier: 1,
      pauseOnFocusLoss: false,
      disableAutoAdvance: false,
      timeoutWarning: true,
      timeoutWarningSeconds: 30,
    },
  },
  neuro: {
    focusMode: {
      enabled: false,
      hideDistractions: true,
      dimNonFocused: true,
      dimOpacity: 0.3,
      highlightCurrent: true,
      singleColumn: true,
      hideSidebar: true,
      hideDecorative: true,
    },
    readingMode: {
      enabled: false,
      readingRuler: false,
      rulerColor: '#ffff00',
      rulerOpacity: 0.2,
      bionicReading: false,
      textMask: false,
      maxContentWidth: 720,
      paragraphSpacing: 1.5,
    },
    cognitiveLoad: {
      simplifyLanguage: false,
      showDefinitions: true,
      chunkContent: false,
      chunkSize: 5,
      showMicroProgress: true,
      showTimeEstimates: true,
      autoSummarize: false,
    },
    breaks: {
      enabled: false,
      intervalMinutes: 25,
      breakDurationMinutes: 5,
      showStretchSuggestions: true,
      showBreathingExercises: true,
      enforceBreaks: false,
    },
    mentor: {
      enabled: false,
      persona: 'supportive',
      name: 'Neuro-naut',
      proactiveHints: true,
      navigationHelp: true,
      conceptExplanation: true,
      encouragement: true,
      voiceEnabled: false,
    },
  },
  branding: {
    primaryColor: '#0072f5',
    secondaryColor: '#8b5cf6',
  },
  navigation: {
    mode: 'free',
    visitedOnly: false,
    requireCompletion: false,
    showDisabledMessage: true,
    swipeNavigation: true,
    keyboardShortcuts: {
      enabled: true,
      next: 'ArrowRight',
      previous: 'ArrowLeft',
      playPause: 'Space',
      menu: 'm',
      fullscreen: 'f',
      focusMode: 'Escape',
    },
  },
  progress: {
    showProgressBar: true,
    progressBarStyle: 'linear',
    showPercentage: true,
    showTimeSpent: false,
    showEstimatedTime: true,
    trackInteractions: true,
    resumePosition: true,
  },
};

// =============================================================================
// PRESETS
// =============================================================================

const PRESETS: Record<ConfigPreset, Partial<PlayerConfig>> = {
  default: {},
  minimal: {
    chrome: {
      ...DEFAULT_CONFIG.chrome,
      layout: 'minimal',
      showSidebar: false,
      showMinimap: false,
    },
  },
  'accessibility-first': {
    accessibility: {
      ...DEFAULT_CONFIG.accessibility,
      text: {
        ...DEFAULT_CONFIG.accessibility.text,
        fontSize: 110,
        lineHeight: 1.8,
        letterSpacing: 'wide',
      },
      visual: {
        ...DEFAULT_CONFIG.accessibility.visual,
        highContrast: true,
        alwaysShowFocus: true,
        showImageDescriptions: true,
      },
      audio: {
        ...DEFAULT_CONFIG.accessibility.audio,
        showCaptions: true,
      },
    },
  },
  'neuro-friendly': {
    neuro: {
      ...DEFAULT_CONFIG.neuro,
      focusMode: {
        ...DEFAULT_CONFIG.neuro.focusMode,
        enabled: true,
      },
      readingMode: {
        ...DEFAULT_CONFIG.neuro.readingMode,
        enabled: true,
        bionicReading: true,
      },
      cognitiveLoad: {
        ...DEFAULT_CONFIG.neuro.cognitiveLoad,
        showDefinitions: true,
        showMicroProgress: true,
        showTimeEstimates: true,
      },
      breaks: {
        ...DEFAULT_CONFIG.neuro.breaks,
        enabled: true,
      },
    },
  },
  corporate: {
    chrome: {
      ...DEFAULT_CONFIG.chrome,
      layout: 'standard',
      theme: 'light',
      animations: 'subtle',
    },
  },
  immersive: {
    chrome: {
      ...DEFAULT_CONFIG.chrome,
      layout: 'immersive',
      showHeader: false,
      showFooter: false,
      showSidebar: false,
    },
  },
};

// =============================================================================
// HOOK
// =============================================================================

export function usePlayerConfig(options: UsePlayerConfigOptions = {}): UsePlayerConfigReturn {
  const { initialConfig, storageKey, onConfigChange } = options;

  // Initialize state with defaults merged with initial config
  const [config, setConfigState] = useState<PlayerConfig>(() => {
    const merged = deepMerge(DEFAULT_CONFIG, initialConfig || {});

    // Try to load from storage
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return deepMerge(merged, parsed);
        }
      } catch {
        // Ignore storage errors
      }
    }

    return merged;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save to storage when config changes
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined' && isDirty) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(config));
        setLastSaved(new Date());
      } catch {
        // Ignore storage errors
      }
    }
  }, [config, storageKey, isDirty]);

  // Notify on change
  useEffect(() => {
    if (isDirty) {
      onConfigChange?.(config);
    }
  }, [config, isDirty, onConfigChange]);

  // Full config setter
  const setConfig = useCallback((newConfig: PlayerConfig) => {
    setConfigState(newConfig);
    setIsDirty(true);
  }, []);

  // Section updaters
  const updateChrome = useCallback((updates: Partial<ChromeConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      chrome: deepMerge(prev.chrome, updates),
    }));
    setIsDirty(true);
  }, []);

  const updateAccessibility = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      accessibility: deepMerge(prev.accessibility, updates),
    }));
    setIsDirty(true);
  }, []);

  const updateNeuro = useCallback((updates: Partial<NeuroConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      neuro: deepMerge(prev.neuro, updates),
    }));
    setIsDirty(true);
  }, []);

  const updateBranding = useCallback((updates: Partial<BrandingConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...updates },
    }));
    setIsDirty(true);
  }, []);

  const updateNavigation = useCallback((updates: Partial<NavigationConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      navigation: deepMerge(prev.navigation, updates),
    }));
    setIsDirty(true);
  }, []);

  const updateProgress = useCallback((updates: Partial<ProgressConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      progress: { ...prev.progress, ...updates },
    }));
    setIsDirty(true);
  }, []);

  // Reset functions
  const resetToDefaults = useCallback(() => {
    setConfigState(DEFAULT_CONFIG);
    setIsDirty(true);
  }, []);

  const resetSection = useCallback((section: keyof PlayerConfig) => {
    setConfigState((prev) => ({
      ...prev,
      [section]: DEFAULT_CONFIG[section],
    }));
    setIsDirty(true);
  }, []);

  // Presets
  const applyPreset = useCallback((preset: ConfigPreset) => {
    const presetConfig = PRESETS[preset];
    setConfigState((_prev) => deepMerge(DEFAULT_CONFIG, presetConfig));
    setIsDirty(true);
  }, []);

  // Export/Import
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importConfig = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      const merged = deepMerge(DEFAULT_CONFIG, parsed);
      setConfigState(merged);
      setIsDirty(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Validation
  const validateConfig = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate chrome
    if (config.chrome.header.height < 32) {
      errors.push('Header height is too small (minimum 32px)');
    }
    if (config.chrome.footer.height < 32) {
      errors.push('Footer height is too small (minimum 32px)');
    }
    if (config.chrome.sidebar.width < 150) {
      errors.push('Sidebar width is too small (minimum 150px)');
    }

    // Validate accessibility
    if (config.accessibility.text.fontSize < config.accessibility.text.minFontSize) {
      errors.push('Font size is below minimum');
    }
    if (config.accessibility.text.fontSize > config.accessibility.text.maxFontSize) {
      errors.push('Font size is above maximum');
    }

    // Warnings
    if (config.accessibility.audio.autoPlay) {
      warnings.push('Auto-play audio may cause accessibility issues');
    }
    if (!config.accessibility.navigation.keyboardNav) {
      warnings.push('Disabling keyboard navigation may cause accessibility issues');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }, [config]);

  return {
    config,
    updateChrome,
    updateAccessibility,
    updateNeuro,
    updateBranding,
    updateNavigation,
    updateProgress,
    setConfig,
    resetToDefaults,
    resetSection,
    applyPreset,
    exportConfig,
    importConfig,
    validateConfig,
    isDirty,
    lastSaved,
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Deep merge two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const sourceValue = source[key];
      const targetValue = (target as Record<string, unknown>)[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (output as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        );
      } else if (sourceValue !== undefined) {
        (output as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return output;
}

export default usePlayerConfig;
