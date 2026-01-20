// =============================================================================
// LAYER 1: DESIGNER THEME (Set by course designer, locked for learners)
// =============================================================================

export interface DesignerTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  animationStyle: 'subtle' | 'moderate' | 'dynamic';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
}

// =============================================================================
// LAYER 2: LEARNER PREFERENCES (Customizable by learners)
// =============================================================================

export interface LearnerPreferences {
  skinId: string;
  avatarUrl: string | null;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  captionsEnabled: boolean;
  captionFontSize: 'small' | 'medium' | 'large';
  captionBackground: 'transparent' | 'semi-transparent' | 'opaque';
  themeColorOverride: string | null;
}

// =============================================================================
// LEARNER PROFILE
// =============================================================================

export interface LearnerProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  color_blind_mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  font_size_multiplier: number;
  reduced_motion: boolean;
  high_contrast: boolean;
  active_skin_id: string;
  theme_mode: 'light' | 'dark' | 'system';
  default_playback_speed: number;
  auto_play_next: boolean;
  show_captions: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// COURSE TYPES
// =============================================================================

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  total_slides: number;
  estimated_duration_minutes: number | null;
  scorm_version: string | null;
  xapi_enabled: boolean;
  is_published: boolean;
  published_at: string | null;
  designer_theme: DesignerTheme | null;
  created_at: string;
  updated_at: string;
}

export interface CourseChapter {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface CourseSlide {
  id: string;
  course_id: string;
  chapter_id: string | null;
  title: string;
  content_type: 'slide' | 'video' | 'quiz' | 'interactive' | 'document';
  content_data: SlideContentData;
  sort_order: number;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface SlideContentData {
  heading?: string;
  subheading?: string;
  body?: string;
  image?: string;
  features?: string[];
  key_points?: string[];
  tips?: string[];
  examples?: string[];
  action_items?: string[];
  questions?: QuizQuestion[];
  resources?: Resource[];
  diagram?: string;
  interactive_type?: string;
  celebration?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface Resource {
  title: string;
  type: 'pdf' | 'document' | 'link' | 'video';
  url?: string;
}

// =============================================================================
// LEARNER PROGRESS & ACTIVITY
// =============================================================================

export interface LearnerProgress {
  id: string;
  learner_id: string;
  course_id: string;
  current_slide_id: string | null;
  completion_percentage: number;
  time_spent_seconds: number;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string;
  xapi_statements: unknown[];
  created_at: string;
  updated_at: string;
}

export interface LearnerNote {
  id: string;
  learner_id: string;
  course_id: string;
  slide_id: string | null;
  content: string;
  timestamp_seconds?: number | null;
  is_pinned: boolean;
  color?: string;
  created_at: string;
  updated_at?: string;
}

export interface LearnerBookmark {
  id: string;
  learner_id: string;
  course_id: string;
  slide_id: string;
  label: string | null;
  created_at: string;
}

// =============================================================================
// GLOSSARY
// =============================================================================

export interface GlossaryTerm {
  id: string;
  course_id: string;
  term: string;
  definition: string;
  pronunciation: string | null;
  related_terms: string[] | null;
  created_at: string;
}

// =============================================================================
// PLAYER SKINS & CUSTOMIZATION
// =============================================================================

export interface PlayerSkin {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_image_url: string | null;
  css_variables: Record<string, string>;
  is_free: boolean;
  price_credits: number | null;
  price_cents: number | null;
  is_premium: boolean;
  is_featured: boolean;
  unlock_requirement: string | null;
  created_at: string;
}

export interface LearnerInventoryItem {
  id: string;
  user_id: string;
  skin_id: string;
  acquired_at: string;
  acquisition_type: 'purchased' | 'earned' | 'gifted' | 'default';
}

// =============================================================================
// PLAYER STATE
// =============================================================================

export interface PlayerState {
  isPlaying: boolean;
  currentSlideIndex: number;
  volume: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  isMuted: boolean;
  showCaptions: boolean;
  sidebarOpen: boolean;
  sidebarTab: 'menu' | 'notes' | 'glossary' | 'resources' | 'settings' | 'skins';
  neuronautOpen: boolean;
}

export interface AccessibilitySettings {
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSizeMultiplier: number;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
}

// =============================================================================
// COURSE WITH CONTENT (Composite Type)
// =============================================================================

export interface CourseWithContent extends Course {
  chapters: (CourseChapter & { slides: CourseSlide[] })[];
  glossary: GlossaryTerm[];
}

// =============================================================================
// PLAYER SHELL PROPS (Two-Layer Theming)
// =============================================================================

export interface PlayerShellProps {
  course: CourseWithContent;
  progress?: LearnerProgress | null;
  profile?: LearnerProfile | null;
  userId?: string;
  isDemo?: boolean;
  designerTheme?: DesignerTheme | null;
  learnerPreferences?: LearnerPreferences | null;
  onPreferencesChange?: (prefs: Partial<LearnerPreferences>) => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_DESIGNER_THEME: DesignerTheme = {
  primaryColor: '#0056B8',
  secondaryColor: '#019EF3',
  accentColor: '#00d4ff',
  fontFamily: 'Inter, system-ui, sans-serif',
  buttonStyle: 'rounded',
  animationStyle: 'moderate',
  layoutDensity: 'comfortable',
};

export const DEFAULT_LEARNER_PREFERENCES: LearnerPreferences = {
  skinId: 'default',
  avatarUrl: null,
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  captionsEnabled: false,
  captionFontSize: 'medium',
  captionBackground: 'semi-transparent',
  themeColorOverride: null,
};
