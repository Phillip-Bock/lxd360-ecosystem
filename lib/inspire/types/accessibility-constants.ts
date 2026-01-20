import type { AccessibilitySettings } from './inspire-types';

// ============================================================================
// SECTION 1: DEFAULT ACCESSIBILITY SETTINGS
// ============================================================================

/**
 * Factory function to create default accessibility settings
 * These are the "standard" settings before unknown personalization
 *
 * @param userId - User ID to associate settings with
 * @returns Complete AccessibilitySettings object with defaults
 */
export function createDefaultAccessibilitySettings(userId: string): AccessibilitySettings {
  return {
    id: `accessibility-${userId}-default`,
    userId,
    profileName: 'Default',

    // Visual settings - minimal intervention, respects system preferences
    colorVision: {
      enabled: false,
      mode: 'none',
    },

    highContrast: {
      enabled: false,
      mode: 'increased',
      contrastRatio: 4.5, // WCAG AA minimum
    },

    // Typography - optimized for general readability
    typography: {
      fontFamily: 'system',
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
      wordSpacing: 0,
      paragraphSpacing: 1.5,
      maxLineLength: 70,
      textAlign: 'left',
    },

    // Motion - respects prefers-reduced-motion
    motion: {
      reduceMotion: false, // Will auto-detect from system
      disableAnimations: false,
      pauseAnimatedMedia: false,
      animationSpeed: 1,
      disableParallax: false,
      disableAutoplay: true, // Default to safer option
    },

    // Audio - captions enabled by default for inclusivity
    audio: {
      captionsEnabled: true, // Default ON for all users
      captionFontSize: 1,
      captionBackgroundOpacity: 0.75,
      captionPosition: 'bottom',
      audioDescriptions: false,
      visualAudioIndicators: false,
      monoAudio: false,
    },

    // Cognitive - balanced defaults
    cognitive: {
      simplifiedInterface: false,
      focusMode: false,
      readingGuide: false,
      readingMask: false,
      breakReminderInterval: 0, // Disabled
      showProgressIndicators: true,
      showTimeEstimates: true,
      maxItemsPerChunk: 7, // Miller's law
      tooltipDelay: 500,
      timeExtension: 1, // No extension
    },

    // Autism support - disabled by default, can be enabled
    autismSupport: {
      enabled: false,
      predictableLayouts: false,
      literalLanguage: false,
      socialStories: false,
      visualSchedules: false,
      sensoryFriendlyColors: false,
      changeWarnings: false,
      explicitInstructions: false,
      timerVisibility: 'on-demand',
      transitionWarnings: false,
    },

    // Dyslexia support - disabled by default, can be enabled
    dyslexiaSupport: {
      enabled: false,
      syllableHighlighting: false,
      colorCodedGrammar: false,
      textToSpeech: false,
      ttsSpeed: 150,
      highlightOnRead: false,
      bionicReading: false,
      screenTint: {
        enabled: false,
        color: '#FFFBEB', // Warm cream - common preference
        opacity: 0.3,
      },
    },

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// SECTION 2: PRESET ACCESSIBILITY PROFILES
// ============================================================================

/**
 * Pre-configured profile for dyslexia support
 * Based on British Dyslexia Association guidelines and research
 *
 * Key features:
 * - OpenDyslexic font (weighted bottoms reduce letter flipping)
 * - Increased letter/word spacing (reduces crowding)
 * - Cream-colored screen tint (reduces visual stress)
 * - Text-to-speech integration
 * - Bionic reading (bold first letters aids word recognition)
 */
export const DYSLEXIA_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Dyslexia Support',

  typography: {
    fontFamily: 'opendyslexic',
    fontSize: 18, // Slightly larger
    lineHeight: 1.8, // More space between lines
    letterSpacing: 0.12, // Recommended 0.12em
    wordSpacing: 0.16, // Increased word spacing
    paragraphSpacing: 2,
    maxLineLength: 60, // Shorter lines
    textAlign: 'left', // Never justify - uneven spacing is problematic
  },

  cognitive: {
    simplifiedInterface: false,
    focusMode: false,
    readingGuide: true, // Helpful for tracking
    readingMask: false,
    breakReminderInterval: 20, // Frequent breaks
    showProgressIndicators: true,
    showTimeEstimates: true,
    maxItemsPerChunk: 5, // Smaller chunks
    tooltipDelay: 750, // More time to process
    timeExtension: 1.5, // 50% more time on timed activities
  },

  dyslexiaSupport: {
    enabled: true,
    syllableHighlighting: true,
    colorCodedGrammar: false, // Can be overwhelming
    textToSpeech: true,
    ttsSpeed: 140, // Slightly slower
    highlightOnRead: true,
    bionicReading: true,
    screenTint: {
      enabled: true,
      color: '#FFFBEB', // Warm cream
      opacity: 0.25,
    },
  },
};

/**
 * Pre-configured profile for autism support
 * Based on autism accessibility research and neurodivergent feedback
 *
 * Key features:
 * - Predictable, consistent layouts
 * - Clear, literal language (no idioms)
 * - Transition warnings before changes
 * - Sensory-friendly color palette (muted, low saturation)
 * - Explicit instructions (nothing assumed)
 * - Visual schedules and checklists
 */
export const AUTISM_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Autism Support',

  typography: {
    fontFamily: 'atkinson-hyperlegible', // Clear, distinct letterforms
    fontSize: 17,
    lineHeight: 1.7,
    letterSpacing: 0.05,
    wordSpacing: 0.08,
    paragraphSpacing: 2,
    maxLineLength: 65,
    textAlign: 'left',
  },

  motion: {
    reduceMotion: true,
    disableAnimations: false, // Some can be helpful
    pauseAnimatedMedia: true,
    animationSpeed: 0.7, // Slower animations
    disableParallax: true,
    disableAutoplay: true,
  },

  cognitive: {
    simplifiedInterface: true,
    focusMode: true,
    readingGuide: false,
    readingMask: false,
    breakReminderInterval: 25,
    showProgressIndicators: true,
    showTimeEstimates: true,
    maxItemsPerChunk: 4, // Smaller chunks
    tooltipDelay: 300, // Quick access to info
    timeExtension: 1.25,
  },

  autismSupport: {
    enabled: true,
    predictableLayouts: true,
    literalLanguage: true,
    socialStories: true,
    visualSchedules: true,
    sensoryFriendlyColors: true,
    changeWarnings: true,
    explicitInstructions: true,
    timerVisibility: 'always', // Predictability
    transitionWarnings: true,
  },
};

/**
 * Pre-configured profile for ADHD support
 * Based on ADHD accessibility research and executive function support
 *
 * Key features:
 * - Focus mode (dims non-essential elements)
 * - Regular break reminders
 * - Progress indicators for motivation
 * - Reduced distractions
 * - Time estimates (helps with time blindness)
 */
export const ADHD_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'ADHD Support',

  typography: {
    fontFamily: 'system',
    fontSize: 17,
    lineHeight: 1.7,
    letterSpacing: 0.02,
    wordSpacing: 0.04,
    paragraphSpacing: 1.8,
    maxLineLength: 60, // Shorter for focus
    textAlign: 'left',
  },

  motion: {
    reduceMotion: true, // Reduce distractions
    disableAnimations: false,
    pauseAnimatedMedia: true,
    animationSpeed: 1,
    disableParallax: true,
    disableAutoplay: true,
  },

  cognitive: {
    simplifiedInterface: true,
    focusMode: true, // Key feature
    readingGuide: false,
    readingMask: false,
    breakReminderInterval: 15, // Pomodoro-style
    showProgressIndicators: true, // Dopamine from progress
    showTimeEstimates: true, // Helps with time blindness
    maxItemsPerChunk: 3, // Small chunks for focus
    tooltipDelay: 400,
    timeExtension: 1.5, // Extra time
  },
};

/**
 * Pre-configured profile for hearing impairment
 *
 * Key features:
 * - Always-on captions with customization
 * - Visual indicators for all audio cues
 * - Audio descriptions for visual content
 * - Sign language video option markers
 */
export const HEARING_IMPAIRMENT_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Hearing Impairment Support',

  audio: {
    captionsEnabled: true,
    captionFontSize: 1.2, // Larger captions
    captionBackgroundOpacity: 0.85, // Higher contrast
    captionPosition: 'bottom',
    audioDescriptions: true,
    visualAudioIndicators: true, // Critical
    monoAudio: false,
  },

  cognitive: {
    simplifiedInterface: false,
    focusMode: false,
    readingGuide: false,
    readingMask: false,
    breakReminderInterval: 0,
    showProgressIndicators: true,
    showTimeEstimates: true,
    maxItemsPerChunk: 7,
    tooltipDelay: 500,
    timeExtension: 1,
  },
};

/**
 * Pre-configured profile for low vision
 *
 * Key features:
 * - Maximum contrast mode
 * - Large fonts
 * - High-visibility focus indicators
 * - Screen reader optimization markers
 */
export const LOW_VISION_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Low Vision Support',

  highContrast: {
    enabled: true,
    mode: 'maximum',
    contrastRatio: 7, // WCAG AAA
  },

  typography: {
    fontFamily: 'atkinson-hyperlegible', // Designed for legibility
    fontSize: 22, // Large base font
    lineHeight: 1.8,
    letterSpacing: 0.05,
    wordSpacing: 0.08,
    paragraphSpacing: 2,
    maxLineLength: 50, // Very short lines
    textAlign: 'left',
  },

  cognitive: {
    simplifiedInterface: true,
    focusMode: false,
    readingGuide: false,
    readingMask: false,
    breakReminderInterval: 0,
    showProgressIndicators: true,
    showTimeEstimates: true,
    maxItemsPerChunk: 5,
    tooltipDelay: 300,
    timeExtension: 1.25,
  },
};

/**
 * Pre-configured profile for color blindness (protanopia - red weakness)
 */
export const PROTANOPIA_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Color Vision (Protanopia)',

  colorVision: {
    enabled: true,
    mode: 'protanopia',
  },

  highContrast: {
    enabled: true,
    mode: 'increased',
    contrastRatio: 5,
  },
};

/**
 * Pre-configured profile for color blindness (deuteranopia - green weakness)
 */
export const DEUTERANOPIA_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Color Vision (Deuteranopia)',

  colorVision: {
    enabled: true,
    mode: 'deuteranopia',
  },

  highContrast: {
    enabled: true,
    mode: 'increased',
    contrastRatio: 5,
  },
};

/**
 * Pre-configured profile for maximum cognitive load reduction
 * For learners who need the simplest possible interface
 */
export const COGNITIVE_EASE_PROFILE: Partial<AccessibilitySettings> = {
  profileName: 'Maximum Cognitive Ease',

  typography: {
    fontFamily: 'system',
    fontSize: 18,
    lineHeight: 2,
    letterSpacing: 0.05,
    wordSpacing: 0.1,
    paragraphSpacing: 2.5,
    maxLineLength: 50,
    textAlign: 'left',
  },

  motion: {
    reduceMotion: true,
    disableAnimations: true,
    pauseAnimatedMedia: true,
    animationSpeed: 0.5,
    disableParallax: true,
    disableAutoplay: true,
  },

  cognitive: {
    simplifiedInterface: true,
    focusMode: true,
    readingGuide: true,
    readingMask: false,
    breakReminderInterval: 10,
    showProgressIndicators: true,
    showTimeEstimates: true,
    maxItemsPerChunk: 3,
    tooltipDelay: 1000,
    timeExtension: 2,
  },
};

// ============================================================================
// SECTION 3: FONT DEFINITIONS
// ============================================================================

/**
 * Font family definitions with fallbacks
 * These are loaded dynamically based on user preferences
 */
export const FONT_FAMILIES = {
  system:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // OpenDyslexic - specifically designed for dyslexia
  // Weighted bottoms help prevent letter flipping
  opendyslexic: '"OpenDyslexic", "Comic Sans MS", Arial, sans-serif',

  // Atkinson Hyperlegible - designed by Braille Institute
  // Distinct letterforms for maximum legibility
  'atkinson-hyperlegible': '"Atkinson Hyperlegible", Arial, sans-serif',

  // Lexie Readable - another dyslexia-friendly font
  'lexie-readable': '"Lexie Readable", Georgia, serif',

  // Comic Sans - often preferred by dyslexic readers
  // Letters are more distinct and less symmetrical
  'comic-sans': '"Comic Sans MS", "Comic Sans", cursive',

  // Custom font - falls back to system if not configured
  custom: 'inherit',
} as const;

/**
 * Font loading URLs for dynamic loading
 */
export const FONT_URLS = {
  opendyslexic: 'https://fonts.cdnfonts.com/css/opendyslexic',
  'atkinson-hyperlegible':
    'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap',
  // Lexie Readable may need local hosting
};

// ============================================================================
// SECTION 4: COLOR PALETTES
// ============================================================================

/**
 * Sensory-friendly color palette for autism support
 * Muted, low-saturation colors that reduce visual overwhelm
 */
export const SENSORY_FRIENDLY_PALETTE = {
  // Backgrounds
  background: {
    primary: '#F5F5F0', // Warm off-white
    secondary: '#E8E8E3', // Soft gray
    accent: '#D4D4CF', // Muted accent
  },

  // Text
  text: {
    primary: '#2D2D2D', // Soft black (not pure black)
    secondary: '#5A5A5A', // Medium gray
    muted: '#8A8A8A', // Light gray
  },

  // Interactive elements
  interactive: {
    primary: '#5B7B8A', // Muted teal
    secondary: '#7A8B6D', // Muted sage
    success: '#6B8A6B', // Muted green
    warning: '#B5A36B', // Muted gold
    error: '#A67B7B', // Muted rose
  },

  // Focus indicators (must be visible)
  focus: {
    ring: '#4A6572', // Darker teal for visibility
    background: '#E0EBF0', // Light teal background
  },
};

/**
 * High contrast palette for low vision
 */
export const HIGH_CONTRAST_PALETTE = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    link: '#0000EE',
    linkVisited: '#551A8B',
    focus: '#000000',
    focusBackground: '#FFFF00',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    link: '#00FFFF',
    linkVisited: '#FF00FF',
    focus: '#FFFFFF',
    focusBackground: '#0000FF',
  },
};

/**
 * Color blind friendly palette
 * Uses colors that are distinguishable for all common types
 */
export const COLOR_BLIND_FRIENDLY_PALETTE = {
  // Based on Wong (2011) color-blind safe palette
  primary: '#0072B2', // Blue
  secondary: '#E69F00', // Orange
  success: '#009E73', // Teal (green substitute)
  warning: '#F0E442', // Yellow
  error: '#D55E00', // Vermillion (red substitute)
  info: '#56B4E9', // Sky blue
  muted: '#999999', // Gray
};

/**
 * Screen tint colors for dyslexia support
 * Different colors work for different individuals
 */
export const SCREEN_TINT_OPTIONS = [
  { name: 'Cream', color: '#FFFBEB', description: 'Warm cream - most common preference' },
  { name: 'Blue', color: '#E6F3FF', description: 'Cool blue - reduces visual stress' },
  { name: 'Pink', color: '#FFE6F0', description: 'Soft pink - another common preference' },
  { name: 'Green', color: '#E6FFE6', description: 'Soft green - calming effect' },
  { name: 'Yellow', color: '#FFFDE6', description: 'Pale yellow - increases contrast' },
  { name: 'Peach', color: '#FFE8D6', description: 'Warm peach - reduces glare' },
  { name: 'Lavender', color: '#F0E6FF', description: 'Soft lavender - reduces eye strain' },
];

// ============================================================================
// SECTION 5: ACCESSIBILITY CONSTANTS
// ============================================================================

/**
 * WCAG contrast ratio requirements
 */
export const CONTRAST_RATIOS = {
  // Level AA (minimum)
  AA: {
    normalText: 4.5,
    largeText: 3, // 18pt+ or 14pt+ bold
    uiComponents: 3,
  },
  // Level AAA (enhanced)
  AAA: {
    normalText: 7,
    largeText: 4.5,
    uiComponents: 4.5,
  },
};

/**
 * Animation timing for reduced motion preferences
 */
export const ANIMATION_TIMING = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

/**
 * Focus indicator styles
 */
export const FOCUS_STYLES = {
  default: {
    outline: '2px solid currentColor',
    outlineOffset: '2px',
  },
  highVisibility: {
    outline: '3px solid #000000',
    outlineOffset: '3px',
    boxShadow: '0 0 0 6px #FFFF00',
  },
};

/**
 * Reading guide dimensions
 */
export const READING_GUIDE_DIMENSIONS = {
  height: 40, // pixels
  opacity: 0.2,
  color: '#FFFF00',
};

/**
 * Reading mask dimensions
 */
export const READING_MASK_DIMENSIONS = {
  visibleLines: 3,
  maskOpacity: 0.8,
  maskColor: '#000000',
};

/**
 * Break reminder intervals (in minutes)
 */
export const BREAK_REMINDER_OPTIONS = [
  { value: 0, label: 'Disabled' },
  { value: 10, label: 'Every 10 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 20, label: 'Every 20 minutes' },
  { value: 25, label: 'Every 25 minutes (Pomodoro)' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 45, label: 'Every 45 minutes' },
  { value: 60, label: 'Every hour' },
];

/**
 * Time extension multipliers
 */
export const TIME_EXTENSION_OPTIONS = [
  { value: 1, label: 'Standard time' },
  { value: 1.25, label: '25% extra time' },
  { value: 1.5, label: '50% extra time' },
  { value: 1.75, label: '75% extra time' },
  { value: 2, label: 'Double time' },
  { value: 0, label: 'Unlimited time' },
];

/**
 * Text-to-speech speed options (words per minute)
 */
export const TTS_SPEED_OPTIONS = [
  { value: 100, label: 'Very slow' },
  { value: 120, label: 'Slow' },
  { value: 140, label: 'Slightly slow' },
  { value: 160, label: 'Normal' },
  { value: 180, label: 'Slightly fast' },
  { value: 200, label: 'Fast' },
  { value: 250, label: 'Very fast' },
];

// ============================================================================
// SECTION 6: ACCESSIBILITY HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.0 formula
 *
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns Contrast ratio (1 to 21)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB object
 *
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if a contrast ratio meets WCAG requirements
 *
 * @param ratio - The contrast ratio to check
 * @param level - WCAG level ('AA' or 'AAA')
 * @param textSize - Size of text ('normal' or 'large')
 * @returns Whether the ratio meets requirements
 */
export function meetsContrastRequirement(
  ratio: number,
  level: 'AA' | 'AAA',
  textSize: 'normal' | 'large' = 'normal',
): boolean {
  const requirement = CONTRAST_RATIOS[level][textSize === 'large' ? 'largeText' : 'normalText'];
  return ratio >= requirement;
}

/**
 * Generate CSS variables from accessibility settings
 * These can be applied to :root to affect the entire application
 *
 * @param settings - Accessibility settings object
 * @returns Object of CSS variable names to values
 */
export function generateAccessibilityCSSVariables(
  settings: AccessibilitySettings,
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Typography
  vars['--font-family'] = FONT_FAMILIES[settings.typography.fontFamily] || FONT_FAMILIES.system;
  vars['--font-size-base'] = `${settings.typography.fontSize}px`;
  vars['--line-height'] = `${settings.typography.lineHeight}`;
  vars['--letter-spacing'] = `${settings.typography.letterSpacing}em`;
  vars['--word-spacing'] = `${settings.typography.wordSpacing}em`;
  vars['--paragraph-spacing'] = `${settings.typography.paragraphSpacing}em`;
  vars['--max-line-length'] = `${settings.typography.maxLineLength}ch`;
  vars['--text-align'] = settings.typography.textAlign;

  // Animation
  vars['--animation-duration-multiplier'] = settings.motion.reduceMotion
    ? '0'
    : `${settings.motion.animationSpeed}`;
  vars['--animation-duration-fast'] =
    `${ANIMATION_TIMING.fast * (settings.motion.reduceMotion ? 0 : settings.motion.animationSpeed)}ms`;
  vars['--animation-duration-normal'] =
    `${ANIMATION_TIMING.normal * (settings.motion.reduceMotion ? 0 : settings.motion.animationSpeed)}ms`;
  vars['--animation-duration-slow'] =
    `${ANIMATION_TIMING.slow * (settings.motion.reduceMotion ? 0 : settings.motion.animationSpeed)}ms`;

  // Captions
  vars['--caption-font-size'] = `${settings.audio.captionFontSize}em`;
  vars['--caption-background-opacity'] = `${settings.audio.captionBackgroundOpacity}`;

  // Cognitive
  vars['--tooltip-delay'] = `${settings.cognitive.tooltipDelay}ms`;
  vars['--max-items-per-chunk'] = `${settings.cognitive.maxItemsPerChunk}`;

  // Dyslexia screen tint
  if (settings.dyslexiaSupport.enabled && settings.dyslexiaSupport.screenTint.enabled) {
    vars['--screen-tint-color'] = settings.dyslexiaSupport.screenTint.color;
    vars['--screen-tint-opacity'] = `${settings.dyslexiaSupport.screenTint.opacity}`;
  }

  return vars;
}

/**
 * Apply accessibility settings to document root
 * Call this when settings are loaded or changed
 *
 * @param settings - Accessibility settings to apply
 */
export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  const cssVars = generateAccessibilityCSSVariables(settings);
  const root = document.documentElement;

  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply classes for feature toggles
  root.classList.toggle('reduce-motion', settings.motion.reduceMotion);
  root.classList.toggle('high-contrast', settings.highContrast.enabled);
  root.classList.toggle('focus-mode', settings.cognitive.focusMode);
  root.classList.toggle('simplified-ui', settings.cognitive.simplifiedInterface);
  root.classList.toggle('dyslexia-support', settings.dyslexiaSupport.enabled);
  root.classList.toggle('autism-support', settings.autismSupport.enabled);
  root.classList.toggle('bionic-reading', settings.dyslexiaSupport.bionicReading);
  root.classList.toggle('reading-guide', settings.cognitive.readingGuide);
  root.classList.toggle('screen-tint', settings.dyslexiaSupport.screenTint.enabled);
}

// ============================================================================
// SECTION 7: ARIA LABELS & ANNOUNCEMENTS
// ============================================================================

/**
 * Standard ARIA live region announcement types
 */
export const ARIA_LIVE_PRIORITIES = {
  polite: 'polite', // Non-urgent, wait for pause
  assertive: 'assertive', // Important, interrupt current speech
} as const;

/**
 * Common accessibility announcements
 * These should be announced to screen readers at appropriate times
 */
export const A11Y_ANNOUNCEMENTS = {
  loading: 'Loading content, please wait.',
  loadingComplete: 'Content loaded.',
  formError: (count: number) =>
    `Form has ${count} ${count === 1 ? 'error' : 'errors'}. Please review and correct.`,
  saved: 'Your changes have been saved.',
  stepComplete: (step: number) => `Step ${step} complete. Moving to next step.`,
  timerWarning: (minutes: number) =>
    `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} remaining.`,
  breakReminder: 'Time for a break. Take a moment to rest your eyes and stretch.',
  sectionChange: (section: string) => `Now in ${section} section.`,
  progressUpdate: (percent: number) => `Progress: ${percent} percent complete.`,
};

// ============================================================================
// END OF ACCESSIBILITY CONSTANTS
// ============================================================================
