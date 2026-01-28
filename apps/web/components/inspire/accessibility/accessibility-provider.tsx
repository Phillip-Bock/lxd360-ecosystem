'use client';

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ADHD_PROFILE,
  AUTISM_PROFILE,
  applyAccessibilitySettings,
  BREAK_REMINDER_OPTIONS,
  COGNITIVE_EASE_PROFILE,
  createDefaultAccessibilitySettings,
  DEUTERANOPIA_PROFILE,
  DYSLEXIA_PROFILE,
  FONT_URLS,
  generateAccessibilityCSSVariables,
  HEARING_IMPAIRMENT_PROFILE,
  LOW_VISION_PROFILE,
  PROTANOPIA_PROFILE,
  SCREEN_TINT_OPTIONS,
  TIME_EXTENSION_OPTIONS,
  TTS_SPEED_OPTIONS,
} from '@/lib/inspire/types/accessibility-constants';
import type { AccessibilitySettings } from '@/lib/inspire/types/inspire-types';
import { logger } from '@/lib/logger';

const log = logger.scope('AccessibilityProvider');

// ============================================================================
// SECTION 1: CONTEXT TYPES & CREATION
// ============================================================================

/**
 * Available preset profiles that users can select
 */
export type AccessibilityPreset =
  | 'default'
  | 'dyslexia'
  | 'autism'
  | 'adhd'
  | 'hearing-impairment'
  | 'low-vision'
  | 'protanopia'
  | 'deuteranopia'
  | 'cognitive-ease'
  | 'custom';

/**
 * Context value interface
 * Provides everything components need to work with accessibility
 */
interface AccessibilityContextValue {
  /** Current accessibility settings */
  settings: AccessibilitySettings;

  /** Currently applied preset (or 'custom' if manually modified) */
  currentPreset: AccessibilityPreset;

  /** Whether settings are currently loading from storage */
  isLoading: boolean;

  /** Any error that occurred loading/saving settings */
  error: Error | null;

  // ─────────────────────────────────────────────────────────────────────────
  // SETTINGS UPDATE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /** Update specific settings (partial update, deep merge) */
  updateSettings: (updates: DeepPartial<AccessibilitySettings>) => void;

  /** Apply a preset profile */
  applyPreset: (preset: AccessibilityPreset) => void;

  /** Reset all settings to defaults */
  resetToDefaults: () => void;

  /** Save current settings as a custom profile */
  saveAsCustomProfile: (profileName: string) => Promise<void>;

  /** Load a saved custom profile */
  loadCustomProfile: (profileId: string) => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // CONVENIENCE TOGGLE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /** Toggle high contrast mode */
  toggleHighContrast: () => void;

  /** Toggle reduced motion */
  toggleReducedMotion: () => void;

  /** Toggle focus mode */
  toggleFocusMode: () => void;

  /** Toggle dyslexia support */
  toggleDyslexiaSupport: () => void;

  /** Toggle autism support */
  toggleAutismSupport: () => void;

  /** Toggle captions */
  toggleCaptions: () => void;

  /** Toggle reading guide */
  toggleReadingGuide: () => void;

  /** Toggle bionic reading */
  toggleBionicReading: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // SPECIFIC SETTING FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /** Set font size (pixels) */
  setFontSize: (size: number) => void;

  /** Set font family */
  setFontFamily: (family: AccessibilitySettings['typography']['fontFamily']) => void;

  /** Set line height */
  setLineHeight: (height: number) => void;

  /** Set letter spacing */
  setLetterSpacing: (spacing: number) => void;

  /** Set screen tint color */
  setScreenTint: (color: string, opacity: number) => void;

  /** Set color vision mode */
  setColorVisionMode: (mode: AccessibilitySettings['colorVision']['mode']) => void;

  /** Set break reminder interval */
  setBreakReminderInterval: (minutes: number) => void;

  /** Set time extension multiplier */
  setTimeExtension: (multiplier: number) => void;

  /** Set TTS speed */
  setTTSSpeed: (speed: number) => void;

  /** Announce message to screen readers via live region */
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITY VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /** Available screen tint options */
  screenTintOptions: typeof SCREEN_TINT_OPTIONS;

  /** Available break reminder options */
  breakReminderOptions: typeof BREAK_REMINDER_OPTIONS;

  /** Available time extension options */
  timeExtensionOptions: typeof TIME_EXTENSION_OPTIONS;

  /** Available TTS speed options */
  ttsSpeedOptions: typeof TTS_SPEED_OPTIONS;

  /** CSS variables for current settings (for inline styles if needed) */
  cssVariables: Record<string, string>;
}

/**
 * Deep partial type for partial updates to nested objects
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Create the context with undefined default
 * (forces consumers to be within provider)
 */
const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

// ============================================================================
// SECTION 2: STORAGE & PERSISTENCE
// ============================================================================

const STORAGE_KEY = 'inspire-accessibility-settings';
const CUSTOM_PROFILES_KEY = 'inspire-accessibility-profiles';

/**
 * Load settings from localStorage
 */
function loadSettingsFromStorage(userId: string): AccessibilitySettings | null {
  // Only run on client
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Restore date objects
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.updatedAt = new Date(parsed.updatedAt);
      return parsed as AccessibilitySettings;
    }
  } catch (error) {
    log.error(
      'Error loading accessibility settings',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
  return null;
}

/**
 * Save settings to localStorage
 */
function saveSettingsToStorage(settings: AccessibilitySettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`${STORAGE_KEY}-${settings.userId}`, JSON.stringify(settings));
  } catch (error) {
    log.error(
      'Error saving accessibility settings',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

/**
 * Deep merge utility for nested objects
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const output = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        (output as Record<string, unknown>)[key] = deepMerge(
          targetValue as object,
          sourceValue as DeepPartial<object>,
        );
      } else {
        // Directly assign primitive values or arrays
        (output as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return output;
}

// ============================================================================
// SECTION 3: FONT LOADING
// ============================================================================

/**
 * Load accessibility fonts dynamically
 */
function loadAccessibilityFonts(fontFamily: string): void {
  if (typeof window === 'undefined') return;

  const fontUrl = FONT_URLS[fontFamily as keyof typeof FONT_URLS];
  if (!fontUrl) return;

  // Check if already loaded
  const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
  if (existingLink) return;

  // Create and append link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontUrl;
  document.head.appendChild(link);
}

// ============================================================================
// SECTION 4: PROVIDER COMPONENT
// ============================================================================

interface AccessibilityProviderProps {
  children: ReactNode;
  /** User ID for persistent storage (can be 'anonymous' for non-logged-in users) */
  userId?: string;
  /** Initial settings to use before loading from storage */
  initialSettings?: Partial<AccessibilitySettings>;
}

/**
 * Accessibility Provider Component
 *
 * Wrap your application with this provider to enable accessibility features
 * throughout the app. Settings are persisted to localStorage and applied
 * via CSS custom properties.
 *
 * @example
 * ```tsx
 * <AccessibilityProvider userId={user?.id || 'anonymous'}>
 *   <App />
 * </AccessibilityProvider>
 * ```
 */
export function AccessibilityProvider({
  children,
  userId = 'anonymous',
  initialSettings,
}: AccessibilityProviderProps): React.JSX.Element {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Start with defaults, merge unknown initial settings
    const defaults = createDefaultAccessibilitySettings(userId);
    return initialSettings ? deepMerge(defaults, initialSettings) : defaults;
  });

  const [currentPreset, setCurrentPreset] = useState<AccessibilityPreset>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD SETTINGS ON MOUNT
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Load from storage on client
    const stored = loadSettingsFromStorage(userId);
    if (stored) {
      setSettings(stored);
      // Determine if this matches a preset or is custom
      setCurrentPreset('custom'); // Assume custom if loaded from storage
    }
    setIsLoading(false);
  }, [userId]);

  // ─────────────────────────────────────────────────────────────────────────
  // APPLY SETTINGS TO DOM
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply CSS variables and classes
    applyAccessibilitySettings(settings);

    // Load special fonts if needed
    if (settings.typography.fontFamily !== 'system') {
      loadAccessibilityFonts(settings.typography.fontFamily);
    }

    // Save to storage
    saveSettingsToStorage(settings);

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && !settings.motion.reduceMotion) {
      // Respect system preference
      setSettings((prev) => ({
        ...prev,
        motion: { ...prev.motion, reduceMotion: true },
      }));
    }
  }, [settings]);

  // ─────────────────────────────────────────────────────────────────────────
  // GENERATE CSS VARIABLES
  // ─────────────────────────────────────────────────────────────────────────

  const cssVariables = useMemo(() => generateAccessibilityCSSVariables(settings), [settings]);

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Update settings with partial object (deep merge)
   */
  const updateSettings = useCallback((updates: DeepPartial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const merged = deepMerge(prev, updates);
      merged.updatedAt = new Date();
      return merged;
    });
    setCurrentPreset('custom');
  }, []);

  /**
   * Apply a preset profile
   */
  const applyPreset = useCallback(
    (preset: AccessibilityPreset) => {
      const presetMappings: Record<AccessibilityPreset, Partial<AccessibilitySettings> | null> = {
        default: null, // Will reset to defaults
        dyslexia: DYSLEXIA_PROFILE,
        autism: AUTISM_PROFILE,
        adhd: ADHD_PROFILE,
        'hearing-impairment': HEARING_IMPAIRMENT_PROFILE,
        'low-vision': LOW_VISION_PROFILE,
        protanopia: PROTANOPIA_PROFILE,
        deuteranopia: DEUTERANOPIA_PROFILE,
        'cognitive-ease': COGNITIVE_EASE_PROFILE,
        custom: null, // No action for custom
      };

      if (preset === 'default') {
        // Reset to defaults
        setSettings(createDefaultAccessibilitySettings(userId));
      } else if (preset !== 'custom' && presetMappings[preset]) {
        // Apply preset on top of defaults
        const defaults = createDefaultAccessibilitySettings(userId);
        const presetValues = presetMappings[preset];
        if (presetValues) {
          setSettings(deepMerge(defaults, presetValues) as AccessibilitySettings);
        }
      }

      setCurrentPreset(preset);
    },
    [userId],
  );

  /**
   * Reset to default settings
   */
  const resetToDefaults = useCallback(() => {
    setSettings(createDefaultAccessibilitySettings(userId));
    setCurrentPreset('default');
  }, [userId]);

  /**
   * Save current settings as custom profile
   */
  const saveAsCustomProfile = useCallback(
    async (profileName: string) => {
      if (typeof window === 'undefined') return;

      try {
        const profiles = JSON.parse(localStorage.getItem(CUSTOM_PROFILES_KEY) || '[]');

        const newProfile = {
          id: `profile-${Date.now()}`,
          name: profileName,
          settings: { ...settings },
          createdAt: new Date().toISOString(),
        };

        profiles.push(newProfile);
        localStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(profiles));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save profile'));
      }
    },
    [settings],
  );

  /**
   * Load a saved custom profile
   */
  const loadCustomProfile = useCallback(async (profileId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const profiles = JSON.parse(localStorage.getItem(CUSTOM_PROFILES_KEY) || '[]');

      const profile = profiles.find((p: { id: string }) => p.id === profileId);
      if (profile) {
        setSettings({
          ...profile.settings,
          updatedAt: new Date(),
        });
        setCurrentPreset('custom');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TOGGLE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const toggleHighContrast = useCallback(() => {
    updateSettings({
      highContrast: { enabled: !settings.highContrast.enabled },
    });
  }, [settings.highContrast.enabled, updateSettings]);

  const toggleReducedMotion = useCallback(() => {
    updateSettings({
      motion: { reduceMotion: !settings.motion.reduceMotion },
    });
  }, [settings.motion.reduceMotion, updateSettings]);

  const toggleFocusMode = useCallback(() => {
    updateSettings({
      cognitive: { focusMode: !settings.cognitive.focusMode },
    });
  }, [settings.cognitive.focusMode, updateSettings]);

  const toggleDyslexiaSupport = useCallback(() => {
    const enabling = !settings.dyslexiaSupport.enabled;
    if (enabling) {
      // Apply dyslexia preset when enabling
      applyPreset('dyslexia');
    } else {
      updateSettings({
        dyslexiaSupport: { enabled: false },
      });
    }
  }, [settings.dyslexiaSupport.enabled, updateSettings, applyPreset]);

  const toggleAutismSupport = useCallback(() => {
    const enabling = !settings.autismSupport.enabled;
    if (enabling) {
      // Apply autism preset when enabling
      applyPreset('autism');
    } else {
      updateSettings({
        autismSupport: { enabled: false },
      });
    }
  }, [settings.autismSupport.enabled, updateSettings, applyPreset]);

  const toggleCaptions = useCallback(() => {
    updateSettings({
      audio: { captionsEnabled: !settings.audio.captionsEnabled },
    });
  }, [settings.audio.captionsEnabled, updateSettings]);

  const toggleReadingGuide = useCallback(() => {
    updateSettings({
      cognitive: { readingGuide: !settings.cognitive.readingGuide },
    });
  }, [settings.cognitive.readingGuide, updateSettings]);

  const toggleBionicReading = useCallback(() => {
    updateSettings({
      dyslexiaSupport: { bionicReading: !settings.dyslexiaSupport.bionicReading },
    });
  }, [settings.dyslexiaSupport.bionicReading, updateSettings]);

  // ─────────────────────────────────────────────────────────────────────────
  // SPECIFIC SETTING FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const setFontSize = useCallback(
    (size: number) => {
      updateSettings({ typography: { fontSize: size } });
    },
    [updateSettings],
  );

  const setFontFamily = useCallback(
    (family: AccessibilitySettings['typography']['fontFamily']) => {
      updateSettings({ typography: { fontFamily: family } });
    },
    [updateSettings],
  );

  const setLineHeight = useCallback(
    (height: number) => {
      updateSettings({ typography: { lineHeight: height } });
    },
    [updateSettings],
  );

  const setLetterSpacing = useCallback(
    (spacing: number) => {
      updateSettings({ typography: { letterSpacing: spacing } });
    },
    [updateSettings],
  );

  const setScreenTint = useCallback(
    (color: string, opacity: number) => {
      updateSettings({
        dyslexiaSupport: {
          screenTint: { enabled: true, color, opacity },
        },
      });
    },
    [updateSettings],
  );

  const setColorVisionMode = useCallback(
    (mode: AccessibilitySettings['colorVision']['mode']) => {
      updateSettings({
        colorVision: { enabled: mode !== 'none', mode },
      });
    },
    [updateSettings],
  );

  const setBreakReminderInterval = useCallback(
    (minutes: number) => {
      updateSettings({
        cognitive: { breakReminderInterval: minutes },
      });
    },
    [updateSettings],
  );

  const setTimeExtension = useCallback(
    (multiplier: number) => {
      updateSettings({
        cognitive: { timeExtension: multiplier },
      });
    },
    [updateSettings],
  );

  const setTTSSpeed = useCallback(
    (speed: number) => {
      updateSettings({
        dyslexiaSupport: { ttsSpeed: speed },
      });
    },
    [updateSettings],
  );

  /**
   * Announce message to screen readers via ARIA live region
   */
  const announceToScreenReader = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (typeof window === 'undefined') return;

      // Create or get the live region element
      let liveRegion = document.getElementById('inspire-a11y-live-region');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'inspire-a11y-live-region';
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('role', 'status');
        liveRegion.style.cssText =
          'position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
        document.body.appendChild(liveRegion);
      }

      // Update the priority if needed
      liveRegion.setAttribute('aria-live', priority);

      // Clear and set the message (the clear forces re-announcement)
      liveRegion.textContent = '';
      const region = liveRegion;
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    },
    [],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────────────

  const contextValue: AccessibilityContextValue = useMemo(
    () => ({
      settings,
      currentPreset,
      isLoading,
      error,

      // Update functions
      updateSettings,
      applyPreset,
      resetToDefaults,
      saveAsCustomProfile,
      loadCustomProfile,

      // Toggle functions
      toggleHighContrast,
      toggleReducedMotion,
      toggleFocusMode,
      toggleDyslexiaSupport,
      toggleAutismSupport,
      toggleCaptions,
      toggleReadingGuide,
      toggleBionicReading,

      // Specific setters
      setFontSize,
      setFontFamily,
      setLineHeight,
      setLetterSpacing,
      setScreenTint,
      setColorVisionMode,
      setBreakReminderInterval,
      setTimeExtension,
      setTTSSpeed,

      // Screen reader announcements
      announceToScreenReader,

      // Utility values
      screenTintOptions: SCREEN_TINT_OPTIONS,
      breakReminderOptions: BREAK_REMINDER_OPTIONS,
      timeExtensionOptions: TIME_EXTENSION_OPTIONS,
      ttsSpeedOptions: TTS_SPEED_OPTIONS,
      cssVariables,
    }),
    [
      settings,
      currentPreset,
      isLoading,
      error,
      updateSettings,
      applyPreset,
      resetToDefaults,
      saveAsCustomProfile,
      loadCustomProfile,
      toggleHighContrast,
      toggleReducedMotion,
      toggleFocusMode,
      toggleDyslexiaSupport,
      toggleAutismSupport,
      toggleCaptions,
      toggleReadingGuide,
      toggleBionicReading,
      setFontSize,
      setFontFamily,
      setLineHeight,
      setLetterSpacing,
      setScreenTint,
      setColorVisionMode,
      setBreakReminderInterval,
      setTimeExtension,
      setTTSSpeed,
      announceToScreenReader,
      cssVariables,
    ],
  );

  return (
    <AccessibilityContext.Provider value={contextValue}>{children}</AccessibilityContext.Provider>
  );
}

// ============================================================================
// SECTION 5: HOOK FOR CONSUMING CONTEXT
// ============================================================================

/**
 * Hook to access accessibility settings and functions
 *
 * @throws Error if used outside of AccessibilityProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { settings, toggleHighContrast, setFontSize } = useAccessibility();
 *
 *   return (
 *     <div>
 *       <button type="button" onClick={toggleHighContrast}>
 *         High Contrast: {settings.highContrast.enabled ? 'On' : 'Off'}
 *       </button>
 *       <input
 *         type="range"
 *         min={12}
 *         max={32}
 *         value={settings.typography.fontSize}
 *         onChange={(e) => setFontSize(Number(e.target.value))}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);

  if (context === undefined) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider. ' +
        'Wrap your app with <AccessibilityProvider> to use accessibility features.',
    );
  }

  return context;
}

// ============================================================================
// SECTION 6: UTILITY HOOKS
// ============================================================================

/**
 * Hook that returns true if reduced motion is preferred
 * (either by user setting or system preference)
 */
export function useReducedMotion(): boolean {
  const { settings } = useAccessibility();
  const [systemPrefers, setSystemPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemPrefers(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent): void => setSystemPrefers(e.matches);
    mediaQuery.addEventListener('change', handler);
    return (): void => mediaQuery.removeEventListener('change', handler);
  }, []);

  return settings.motion.reduceMotion || systemPrefers;
}

/**
 * Hook that returns true if high contrast is enabled
 * (either by user setting or system preference)
 */
export function useHighContrast(): boolean {
  const { settings } = useAccessibility();
  const [systemPrefers, setSystemPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setSystemPrefers(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent): void => setSystemPrefers(e.matches);
    mediaQuery.addEventListener('change', handler);
    return (): void => mediaQuery.removeEventListener('change', handler);
  }, []);

  return settings.highContrast.enabled || systemPrefers;
}

/**
 * Hook for break reminders
 * Returns the time until next break and a function to dismiss
 */
export function useBreakReminder(): {
  showReminder: boolean;
  dismiss: () => void;
  minutesUntilBreak: number;
} {
  const { settings } = useAccessibility();
  const [showReminder, setShowReminder] = useState(false);
  const [lastBreak, setLastBreak] = useState(Date.now());

  const interval = settings.cognitive.breakReminderInterval;

  useEffect(() => {
    if (interval === 0) return;

    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastBreak) / 1000 / 60; // minutes
      if (elapsed >= interval) {
        setShowReminder(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [interval, lastBreak]);

  const dismiss = useCallback(() => {
    setShowReminder(false);
    setLastBreak(Date.now());
  }, []);

  const minutesUntilBreak = Math.max(
    0,
    interval - Math.floor((Date.now() - lastBreak) / 1000 / 60),
  );

  return { showReminder, dismiss, minutesUntilBreak };
}

/**
 * Hook for getting time with extension applied
 */
export function useExtendedTime(baseTimeMinutes: number): number {
  const { settings } = useAccessibility();

  // Extension of 0 means unlimited
  if (settings.cognitive.timeExtension === 0) {
    return Infinity;
  }

  return Math.round(baseTimeMinutes * settings.cognitive.timeExtension);
}

// ============================================================================
// END OF ACCESSIBILITY PROVIDER
// ============================================================================
