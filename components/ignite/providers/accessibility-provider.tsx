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

// Accessibility preferences following WCAG 2.2 AA
interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  darkMode: boolean;

  // Reading
  dyslexiaFriendlyFont: boolean;
  lineSpacing: 'normal' | 'wide' | 'extra-wide';
  letterSpacing: 'normal' | 'wide' | 'extra-wide';

  // Interaction
  keyboardNavigation: boolean;
  focusIndicator: 'default' | 'enhanced' | 'high-visibility';
  clickTargetSize: 'default' | 'large' | 'extra-large';

  // Audio/Video
  closedCaptions: boolean;
  audioDescriptions: boolean;
  autoplayMedia: boolean;

  // Cognitive
  simplifiedUI: boolean;
  extendedTimeouts: boolean;
  confirmationDialogs: boolean;

  // Screen Reader
  screenReaderOptimized: boolean;
  announcementVerbosity: 'minimal' | 'normal' | 'verbose';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  darkMode: true, // Default to dark mode for the app
  dyslexiaFriendlyFont: false,
  lineSpacing: 'normal',
  letterSpacing: 'normal',
  keyboardNavigation: true,
  focusIndicator: 'default',
  clickTargetSize: 'default',
  closedCaptions: false,
  audioDescriptions: false,
  autoplayMedia: false,
  simplifiedUI: false,
  extendedTimeouts: false,
  confirmationDialogs: true,
  screenReaderOptimized: false,
  announcementVerbosity: 'normal',
};

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;

  // Utility functions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  prefersReducedMotion: () => boolean;
  getContrastRatio: () => 'normal' | 'high';

  // Focus management
  focusElement: (selector: string) => void;
  trapFocus: (containerId: string) => () => void;

  // Skip links
  registerSkipTarget: (id: string, label: string) => void;
  unregisterSkipTarget: (id: string) => void;
  skipTargets: Array<{ id: string; label: string }>;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = 'ignite-accessibility-settings';

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * AccessibilityProvider - Manages accessibility settings and utilities
 *
 * Features:
 * - WCAG 2.2 AA compliant settings
 * - Persistent preferences
 * - Live announcements for screen readers
 * - Focus management
 * - Skip link registration
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [skipTargets, setSkipTargets] = useState<Array<{ id: string; label: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // Invalid stored settings, use defaults
      }
    }

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

    setSettings((prev) => ({
      ...prev,
      reducedMotion: stored ? prev.reducedMotion : prefersReducedMotion,
      darkMode: stored ? prev.darkMode : prefersDark,
      highContrast: stored ? prev.highContrast : prefersHighContrast,
    }));

    setIsInitialized(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, isInitialized]);

  // Apply settings to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Visual settings
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('large-text', settings.largeText);
    root.classList.toggle('dyslexia-font', settings.dyslexiaFriendlyFont);
    root.classList.toggle('simplified-ui', settings.simplifiedUI);

    // Line spacing
    root.setAttribute('data-line-spacing', settings.lineSpacing);

    // Letter spacing
    root.setAttribute('data-letter-spacing', settings.letterSpacing);

    // Focus indicator
    root.setAttribute('data-focus-indicator', settings.focusIndicator);

    // Click target size
    root.setAttribute('data-click-target', settings.clickTargetSize);

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof document === 'undefined') return;

    // Create or get live region
    let liveRegion = document.getElementById('a11y-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    } else {
      liveRegion.setAttribute('aria-live', priority);
    }

    // Clear and set message (triggers announcement)
    liveRegion.textContent = '';
    setTimeout(() => {
      if (liveRegion) liveRegion.textContent = message;
    }, 100);
  }, []);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [settings.reducedMotion]);

  const getContrastRatio = useCallback(
    () => (settings.highContrast ? 'high' : 'normal'),
    [settings.highContrast],
  );

  const focusElement = useCallback((selector: string) => {
    if (typeof document === 'undefined') return;
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const trapFocus = useCallback((containerId: string) => {
    if (typeof document === 'undefined') return () => {};

    const container = document.getElementById(containerId);
    if (!container) return () => {};

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first element
    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const registerSkipTarget = useCallback((id: string, label: string) => {
    setSkipTargets((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [...prev, { id, label }];
    });
  }, []);

  const unregisterSkipTarget = useCallback((id: string) => {
    setSkipTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      announce,
      prefersReducedMotion,
      getContrastRatio,
      focusElement,
      trapFocus,
      registerSkipTarget,
      unregisterSkipTarget,
      skipTargets,
    }),
    [
      settings,
      updateSettings,
      resetSettings,
      announce,
      prefersReducedMotion,
      getContrastRatio,
      focusElement,
      trapFocus,
      registerSkipTarget,
      unregisterSkipTarget,
      skipTargets,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip links */}
      {skipTargets.length > 0 && (
        <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only">
          <ul className="fixed top-0 left-0 z-[100] bg-lxd-dark-surface p-2">
            {skipTargets.map((target) => (
              <li key={target.id}>
                <a
                  href={`#${target.id}`}
                  className="block px-4 py-2 text-lxd-purple hover:underline focus:outline-hidden focus:ring-2 focus:ring-lxd-purple"
                >
                  Skip to {target.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility settings and utilities
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Hook to register a skip link target
 */
export function useSkipTarget(id: string, label: string) {
  const { registerSkipTarget, unregisterSkipTarget } = useAccessibility();

  useEffect(() => {
    registerSkipTarget(id, label);
    return () => unregisterSkipTarget(id);
  }, [id, label, registerSkipTarget, unregisterSkipTarget]);
}
