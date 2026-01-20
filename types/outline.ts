/**
 * Course Outline Types
 * Types for course structure including modules, lessons, and assessments
 */

/** Theme options for the course outline */
export type CourseTheme =
  | 'neural-dark'
  | 'neural-light'
  | 'corporate-blue'
  | 'warm-earth'
  | 'vibrant-tech';

/** Export format options */
export type ExportFormat = 'scorm-1.2' | 'scorm-2004' | 'xapi' | 'cmi5' | 'html5' | 'pdf';

/** Author display mode options */
export type AuthorDisplayMode = 'avatar' | 'name-only' | 'none';

/** Title alignment options */
export type TitleAlignment = 'left' | 'center' | 'right';

/** Media source type for tracking where the media came from */
export type MediaSourceType = 'library' | 'upload' | 'url' | 'stock';

/** Stock media provider */
export type StockProvider = 'unsplash' | 'pexels' | 'pixabay';

/** Title background settings */
export interface TitleBackgroundSettings {
  /** Media type - derived from file extension, not user-selected */
  type: 'none' | 'image' | 'gif' | 'video';
  /** Source of the media */
  sourceType: MediaSourceType | null;
  /** Media URL */
  url: string;
  /** Original filename if uploaded */
  fileName?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Stock provider if from stock library */
  stockProvider?: StockProvider;
  /** Attribution text for stock media */
  stockAttribution?: string;
  /** Stock media ID for reference */
  stockId?: string;
  /** Image position X offset (-100 to 100, percentage from center) */
  positionX: number;
  /** Image position Y offset (-100 to 100, percentage from center) */
  positionY: number;
  /** Image scale/zoom (1.0 to 3.0) */
  scale: number;
  /** Brightness adjustment (0-200, default 100) */
  brightness: number;
  /** Contrast adjustment (0-200, default 100) */
  contrast: number;
  /** Overlay opacity (0-100, default 0) */
  overlayOpacity: number;
  /** Video autoplay setting */
  autoplay: boolean;
  /** Video loop setting */
  loop: boolean;
}

/** Base item type for all outline items */
export type OutlineItemType =
  | 'module'
  | 'lesson'
  | 'check-on-learning'
  | 'scenario'
  | 'assessment'
  | 'question-bank'
  | 'survey'
  | 'survey-bank';

/** Base interface for all outline items */
export interface OutlineItemBase {
  id: string;
  type: OutlineItemType;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Module - top level container (H3) */
export interface ModuleItem extends OutlineItemBase {
  type: 'module';
  children: ChildItem[];
}

/** Lesson - child of module (H4) */
export interface LessonItem extends OutlineItemBase {
  type: 'lesson';
  parentId: string;
  hasContent: boolean;
}

/** Check on Learning - child of module (H4) */
export interface CheckOnLearningItem extends OutlineItemBase {
  type: 'check-on-learning';
  parentId: string;
  questionCount: number;
}

/** Scenario Builder - child of module (H4) */
export interface ScenarioItem extends OutlineItemBase {
  type: 'scenario';
  parentId: string;
  scenarioType: 'branching' | 'linear' | 'adaptive';
}

/** Assessment - can be top-level or child */
export interface AssessmentItem extends OutlineItemBase {
  type: 'assessment';
  parentId: string | null;
  bankId: string | null;
  questionCount: number;
}

/** Question Bank reference */
export interface QuestionBankItem extends OutlineItemBase {
  type: 'question-bank';
  parentId: string | null;
  bankId: string;
  bankName: string;
  questionCount: number;
}

/** Survey */
export interface SurveyItem extends OutlineItemBase {
  type: 'survey';
  parentId: string | null;
  bankId: string | null;
  questionCount: number;
}

/** Survey Bank reference */
export interface SurveyBankItem extends OutlineItemBase {
  type: 'survey-bank';
  parentId: string | null;
  bankId: string;
  bankName: string;
  questionCount: number;
}

/** Union type for all child items (under modules) */
export type ChildItem =
  | LessonItem
  | CheckOnLearningItem
  | ScenarioItem
  | AssessmentItem
  | QuestionBankItem
  | SurveyItem
  | SurveyBankItem;

/** Union type for all outline items */
export type OutlineItem = ModuleItem | ChildItem;

/** Course objective */
export interface CourseObjective {
  id: string;
  text: string;
  order: number;
}

/** Course outline state */
export interface CourseOutline {
  id: string;
  theme: CourseTheme;
  title: string;
  titleAlignment: TitleAlignment;
  titleBackground: TitleBackgroundSettings;
  description: string;
  objectives: CourseObjective[];
  modules: ModuleItem[];
  /** Items that are not under any module (top-level assessments, etc.) */
  topLevelItems: ChildItem[];
  exportFormat: ExportFormat;
  authorDisplayMode: AuthorDisplayMode;
  authorName: string;
  authorAvatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Bank item for selector modal */
export interface BankOption {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  category: string;
}

/** Validation state for the outline */
export interface OutlineValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  itemId?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  itemId?: string;
}

/** Drag and drop types */
export interface DragItem {
  id: string;
  type: OutlineItemType;
  parentId: string | null;
}

export interface DropPosition {
  targetId: string;
  position: 'before' | 'after' | 'inside';
}
