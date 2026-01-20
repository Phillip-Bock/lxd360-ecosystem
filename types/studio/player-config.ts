/**
 * Player Configuration Types - Phase 12
 * Defines player chrome, accessibility, and neuro-friendly settings
 */

// =============================================================================
// PLAYER CHROME CONFIGURATION
// =============================================================================

/**
 * Complete player configuration
 */
export interface PlayerConfig {
  /** Player chrome settings */
  chrome: ChromeConfig;
  /** Accessibility settings */
  accessibility: AccessibilityConfig;
  /** Neuro-friendly settings */
  neuro: NeuroConfig;
  /** Branding */
  branding: BrandingConfig;
  /** Navigation settings */
  navigation: NavigationConfig;
  /** Progress tracking display */
  progress: ProgressConfig;
}

/**
 * Chrome (UI shell) configuration
 */
export interface ChromeConfig {
  /** Layout style */
  layout: 'standard' | 'minimal' | 'immersive' | 'sidebar';
  /** Theme */
  theme: 'light' | 'dark' | 'system' | 'custom';
  /** Custom colors (when theme is custom) */
  customColors?: ThemeColors;
  /** Show/hide elements */
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  showMinimap: boolean;
  /** Header configuration */
  header: HeaderConfig;
  /** Footer configuration */
  footer: FooterConfig;
  /** Sidebar configuration */
  sidebar: SidebarConfig;
  /** Corner radius style */
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Animation style */
  animations: 'none' | 'subtle' | 'standard' | 'playful';
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface HeaderConfig {
  /** Show title */
  showTitle: boolean;
  /** Show progress bar */
  showProgress: boolean;
  /** Show menu button */
  showMenu: boolean;
  /** Show close button */
  showClose: boolean;
  /** Show settings button */
  showSettings: boolean;
  /** Custom logo URL */
  logoUrl?: string;
  /** Logo position */
  logoPosition: 'left' | 'center' | 'right';
  /** Height in pixels */
  height: number;
}

export interface FooterConfig {
  /** Show navigation buttons */
  showNavigation: boolean;
  /** Show slide counter */
  showSlideCounter: boolean;
  /** Show play/pause button */
  showPlayPause: boolean;
  /** Show volume control */
  showVolume: boolean;
  /** Show fullscreen button */
  showFullscreen: boolean;
  /** Show captions toggle */
  showCaptions: boolean;
  /** Show playback speed control */
  showSpeed: boolean;
  /** Height in pixels */
  height: number;
}

export interface SidebarConfig {
  /** Sidebar position */
  position: 'left' | 'right';
  /** Default state */
  defaultState: 'open' | 'closed' | 'auto';
  /** Show table of contents */
  showTOC: boolean;
  /** Show resources */
  showResources: boolean;
  /** Show glossary */
  showGlossary: boolean;
  /** Show notes */
  showNotes: boolean;
  /** Show bookmarks */
  showBookmarks: boolean;
  /** Show search */
  showSearch: boolean;
  /** Width in pixels */
  width: number;
}

// =============================================================================
// ACCESSIBILITY CONFIGURATION
// =============================================================================

/**
 * Accessibility settings
 */
export interface AccessibilityConfig {
  /** Text settings */
  text: TextAccessibilityConfig;
  /** Visual settings */
  visual: VisualAccessibilityConfig;
  /** Audio settings */
  audio: AudioAccessibilityConfig;
  /** Navigation settings */
  navigation: NavigationAccessibilityConfig;
  /** Timing settings */
  timing: TimingAccessibilityConfig;
}

export interface TextAccessibilityConfig {
  /** Base font size (percentage) */
  fontSize: number;
  /** Allow user font size adjustment */
  allowFontResize: boolean;
  /** Min font size percentage */
  minFontSize: number;
  /** Max font size percentage */
  maxFontSize: number;
  /** Font family preference */
  fontFamily: 'default' | 'dyslexic' | 'sans-serif' | 'serif' | 'monospace';
  /** Line height multiplier */
  lineHeight: number;
  /** Letter spacing */
  letterSpacing: 'normal' | 'wide' | 'wider';
  /** Word spacing */
  wordSpacing: 'normal' | 'wide' | 'wider';
}

export interface VisualAccessibilityConfig {
  /** High contrast mode */
  highContrast: boolean;
  /** Reduce motion */
  reduceMotion: boolean;
  /** Reduce transparency */
  reduceTransparency: boolean;
  /** Color blind mode */
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  /** Focus indicator style */
  focusIndicator: 'default' | 'high-visibility' | 'custom';
  /** Custom focus color */
  focusColor?: string;
  /** Always show focus outlines */
  alwaysShowFocus: boolean;
  /** Image descriptions enabled */
  showImageDescriptions: boolean;
}

export interface AudioAccessibilityConfig {
  /** Default audio volume */
  defaultVolume: number;
  /** Auto-play audio/video */
  autoPlay: boolean;
  /** Show captions by default */
  showCaptions: boolean;
  /** Caption style */
  captionStyle: CaptionStyle;
  /** Audio descriptions enabled */
  audioDescriptions: boolean;
  /** Sign language interpreter */
  signLanguage: boolean;
  /** Text-to-speech enabled */
  textToSpeech: boolean;
  /** TTS voice preference */
  ttsVoice?: string;
  /** TTS rate */
  ttsRate: number;
}

export interface CaptionStyle {
  /** Font family */
  fontFamily: string;
  /** Font size (percentage) */
  fontSize: number;
  /** Text color */
  textColor: string;
  /** Background color */
  backgroundColor: string;
  /** Background opacity */
  backgroundOpacity: number;
  /** Edge style */
  edgeStyle: 'none' | 'drop-shadow' | 'raised' | 'depressed' | 'uniform';
  /** Position */
  position: 'bottom' | 'top';
}

export interface NavigationAccessibilityConfig {
  /** Keyboard navigation enabled */
  keyboardNav: boolean;
  /** Skip links enabled */
  skipLinks: boolean;
  /** Tab order */
  customTabOrder: boolean;
  /** Screen reader optimization */
  screenReaderMode: boolean;
  /** Announce page changes */
  announcePageChanges: boolean;
  /** Announce interactions */
  announceInteractions: boolean;
}

export interface TimingAccessibilityConfig {
  /** Allow extended time */
  allowExtendedTime: boolean;
  /** Time multiplier for timed activities */
  timeMultiplier: number;
  /** Pause on focus loss */
  pauseOnFocusLoss: boolean;
  /** Auto-advance disabled */
  disableAutoAdvance: boolean;
  /** Warning before timeout */
  timeoutWarning: boolean;
  /** Seconds before timeout to warn */
  timeoutWarningSeconds: number;
}

// =============================================================================
// NEURO-FRIENDLY CONFIGURATION
// =============================================================================

/**
 * Neuro-friendly settings for diverse learning needs
 */
export interface NeuroConfig {
  /** Focus mode settings */
  focusMode: FocusModeConfig;
  /** Reading mode settings */
  readingMode: ReadingModeConfig;
  /** Cognitive load settings */
  cognitiveLoad: CognitiveLoadConfig;
  /** Break reminders */
  breaks: BreakConfig;
  /** AI mentor settings */
  mentor: MentorConfig;
}

export interface FocusModeConfig {
  /** Enable focus mode */
  enabled: boolean;
  /** Hide distractions */
  hideDistractions: boolean;
  /** Dim non-focused areas */
  dimNonFocused: boolean;
  /** Dim opacity (0-1) */
  dimOpacity: number;
  /** Highlight current element */
  highlightCurrent: boolean;
  /** Single column layout */
  singleColumn: boolean;
  /** Hide sidebar in focus mode */
  hideSidebar: boolean;
  /** Hide decorative elements */
  hideDecorative: boolean;
}

export interface ReadingModeConfig {
  /** Enable reading mode */
  enabled: boolean;
  /** Reading ruler enabled */
  readingRuler: boolean;
  /** Reading ruler color */
  rulerColor: string;
  /** Ruler opacity */
  rulerOpacity: number;
  /** Bionic reading (bold first letters) */
  bionicReading: boolean;
  /** Text mask (reveal line by line) */
  textMask: boolean;
  /** Max content width */
  maxContentWidth: number;
  /** Paragraph spacing multiplier */
  paragraphSpacing: number;
}

export interface CognitiveLoadConfig {
  /** Simplify language (show simplified versions) */
  simplifyLanguage: boolean;
  /** Show definitions on hover */
  showDefinitions: boolean;
  /** Chunk large content */
  chunkContent: boolean;
  /** Max items per chunk */
  chunkSize: number;
  /** Show progress indicators */
  showMicroProgress: boolean;
  /** Estimate completion time */
  showTimeEstimates: boolean;
  /** Summarize long content */
  autoSummarize: boolean;
}

export interface BreakConfig {
  /** Enable break reminders */
  enabled: boolean;
  /** Minutes between break reminders */
  intervalMinutes: number;
  /** Suggested break duration */
  breakDurationMinutes: number;
  /** Show stretch suggestions */
  showStretchSuggestions: boolean;
  /** Show breathing exercises */
  showBreathingExercises: boolean;
  /** Enforce breaks (pause content) */
  enforceBreaks: boolean;
}

export interface MentorConfig {
  /** Enable AI mentor */
  enabled: boolean;
  /** Mentor persona */
  persona: 'supportive' | 'professional' | 'casual' | 'academic';
  /** Mentor name */
  name: string;
  /** Mentor avatar URL */
  avatarUrl?: string;
  /** Show hints proactively */
  proactiveHints: boolean;
  /** Help with navigation */
  navigationHelp: boolean;
  /** Explain concepts */
  conceptExplanation: boolean;
  /** Provide encouragement */
  encouragement: boolean;
  /** Voice enabled */
  voiceEnabled: boolean;
}

// =============================================================================
// BRANDING CONFIGURATION
// =============================================================================

/**
 * Branding customization
 */
export interface BrandingConfig {
  /** Organization name */
  organizationName?: string;
  /** Logo URL */
  logoUrl?: string;
  /** Favicon URL */
  faviconUrl?: string;
  /** Primary color */
  primaryColor: string;
  /** Secondary color */
  secondaryColor: string;
  /** Custom CSS */
  customCss?: string;
  /** Custom JavaScript */
  customJs?: string;
  /** Watermark */
  watermark?: WatermarkConfig;
}

export interface WatermarkConfig {
  /** Enable watermark */
  enabled: boolean;
  /** Watermark type */
  type: 'text' | 'image';
  /** Watermark content (text or image URL) */
  content: string;
  /** Opacity (0-1) */
  opacity: number;
  /** Position */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

// =============================================================================
// NAVIGATION CONFIGURATION
// =============================================================================

/**
 * Navigation behavior settings
 */
export interface NavigationConfig {
  /** Navigation mode */
  mode: 'free' | 'linear' | 'restricted';
  /** Allow jumping to visited slides only */
  visitedOnly: boolean;
  /** Require completion before next */
  requireCompletion: boolean;
  /** Show navigation disabled message */
  showDisabledMessage: boolean;
  /** Custom disabled message */
  disabledMessage?: string;
  /** Swipe navigation on touch devices */
  swipeNavigation: boolean;
  /** Keyboard shortcuts */
  keyboardShortcuts: KeyboardShortcuts;
}

export interface KeyboardShortcuts {
  /** Enable keyboard shortcuts */
  enabled: boolean;
  /** Next slide key */
  next: string;
  /** Previous slide key */
  previous: string;
  /** Play/pause key */
  playPause: string;
  /** Menu key */
  menu: string;
  /** Fullscreen key */
  fullscreen: string;
  /** Focus mode key */
  focusMode: string;
}

// =============================================================================
// PROGRESS CONFIGURATION
// =============================================================================

/**
 * Progress display settings
 */
export interface ProgressConfig {
  /** Show progress bar */
  showProgressBar: boolean;
  /** Progress bar style */
  progressBarStyle: 'linear' | 'circular' | 'steps';
  /** Show completion percentage */
  showPercentage: boolean;
  /** Show time spent */
  showTimeSpent: boolean;
  /** Show estimated remaining time */
  showEstimatedTime: boolean;
  /** Track interactions */
  trackInteractions: boolean;
  /** Resume position on return */
  resumePosition: boolean;
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
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
