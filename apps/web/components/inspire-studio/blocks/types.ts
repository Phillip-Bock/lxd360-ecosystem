'use client';

import type { BlockA11yConfig, BlockInspireMeta, BlockXAPIConfig } from '@/schemas/inspire';

// ============================================================================
// SHARED BLOCK PROPS
// ============================================================================

export interface BaseBlockProps {
  id: string;
  isEditing?: boolean;
  isPreview?: boolean;
  onContentChange?: (content: Record<string, unknown>) => void;
  onConfigChange?: (config: Record<string, unknown>) => void;
  inspireMeta?: BlockInspireMeta;
  xapiConfig?: BlockXAPIConfig;
  a11yConfig?: BlockA11yConfig;
  className?: string;
}

// ============================================================================
// SMART TEXT TYPES
// ============================================================================

export interface SmartTextContent {
  html: string;
  plainText: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface SmartTextConfig {
  variant: 'paragraph' | 'heading' | 'callout' | 'quote' | 'code';
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  alignment: 'left' | 'center' | 'right' | 'justify';
  textSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  calloutType?: 'info' | 'warning' | 'success' | 'error' | 'tip';
  showReadingTime?: boolean;
  enableHighlighting?: boolean;
}

// ============================================================================
// UNIFIED MEDIA TYPES
// ============================================================================

export interface UnifiedMediaContent {
  mediaType: 'image' | 'video' | 'audio' | 'document' | 'embed';
  src: string;
  thumbnailSrc?: string;
  title?: string;
  description?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface UnifiedMediaConfig {
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
  fit: 'cover' | 'contain' | 'fill' | 'none';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  showCaption?: boolean;
  lightbox?: boolean;
  lazyLoad?: boolean;
}

// ============================================================================
// LOGIC QUIZ TYPES
// ============================================================================

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'matching'
  | 'ordering'
  | 'hotspot';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface LogicQuizContent {
  questionType: QuestionType;
  questionText: string;
  questionMedia?: UnifiedMediaContent;
  options: QuizOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  hints?: string[];
  points: number;
}

export interface LogicQuizConfig {
  shuffleOptions?: boolean;
  showFeedback: 'immediate' | 'on-submit' | 'never';
  allowRetry?: boolean;
  maxAttempts?: number;
  showHints?: boolean;
  hintPenalty?: number;
  timeLimit?: number;
  partialCredit?: boolean;
}

// ============================================================================
// CONTEXTUAL AUDIO TYPES
// ============================================================================

export interface AudioCue {
  id: string;
  timestamp: number;
  label: string;
  action?: 'pause' | 'highlight' | 'navigate';
  targetId?: string;
}

export interface ContextualAudioContent {
  src: string;
  title?: string;
  duration: number;
  transcript?: string;
  cues?: AudioCue[];
  waveformData?: number[];
}

export interface ContextualAudioConfig {
  autoplay?: boolean;
  loop?: boolean;
  showTranscript?: boolean;
  showWaveform?: boolean;
  showCues?: boolean;
  speed: number;
  volume: number;
}

// ============================================================================
// DYNAMIC VIDEO TYPES
// ============================================================================

export interface VideoOverlay {
  id: string;
  type: 'hotspot' | 'text' | 'button' | 'quiz';
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: Record<string, unknown>;
}

export interface ChapterMarker {
  id: string;
  timestamp: number;
  title: string;
  thumbnail?: string;
}

export interface DynamicVideoContent {
  src: string;
  posterSrc?: string;
  title?: string;
  duration: number;
  chapters?: ChapterMarker[];
  overlays?: VideoOverlay[];
  transcript?: string;
  captions?: { src: string; label: string; language: string }[];
}

export interface DynamicVideoConfig {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  showChapters?: boolean;
  showOverlays?: boolean;
  showTranscript?: boolean;
  allowSkip?: boolean;
  requiredWatchPercentage?: number;
  playbackRates?: number[];
}

// ============================================================================
// SPATIAL CONTAINER TYPES
// ============================================================================

export interface Model3D {
  src: string;
  format: 'gltf' | 'glb' | 'obj' | 'fbx';
  scale: number;
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
}

export interface Hotspot3D {
  id: string;
  position: { x: number; y: number; z: number };
  label: string;
  content?: string;
  targetId?: string;
}

export interface SpatialContainerContent {
  type: '3d-model' | '360-panorama' | 'ar-scene' | 'vr-environment';
  model?: Model3D;
  panoramaSrc?: string;
  environmentMap?: string;
  hotspots?: Hotspot3D[];
  annotations?: { id: string; position: { x: number; y: number; z: number }; text: string }[];
}

export interface SpatialContainerConfig {
  enableRotation?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showHotspots?: boolean;
  showAnnotations?: boolean;
  cameraPosition?: { x: number; y: number; z: number };
  backgroundColor?: string;
  lighting?: 'studio' | 'outdoor' | 'dramatic' | 'custom';
}

// ============================================================================
// SOCIAL HUB TYPES
// ============================================================================

export interface DiscussionThread {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  replies?: DiscussionThread[];
  likes?: number;
  isPinned?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface SocialHubContent {
  type: 'discussion' | 'poll' | 'peer-review' | 'collaboration';
  title?: string;
  description?: string;
  threads?: DiscussionThread[];
  pollQuestion?: string;
  pollOptions?: PollOption[];
  rubric?: { criteria: string; weight: number; description: string }[];
}

export interface SocialHubConfig {
  allowAnonymous?: boolean;
  moderationEnabled?: boolean;
  maxCharacters?: number;
  requireApproval?: boolean;
  notifyOnReply?: boolean;
  showVotes?: boolean;
  allowAttachments?: boolean;
  closedAfter?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getDefaultSmartTextContent(): SmartTextContent {
  return {
    html: '',
    plainText: '',
    wordCount: 0,
    readingTimeMinutes: 0,
  };
}

export function getDefaultSmartTextConfig(): SmartTextConfig {
  return {
    variant: 'paragraph',
    alignment: 'left',
    textSize: 'base',
    showReadingTime: false,
    enableHighlighting: true,
  };
}

export function getDefaultUnifiedMediaConfig(): UnifiedMediaConfig {
  return {
    aspectRatio: '16:9',
    fit: 'contain',
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    showCaption: true,
    lightbox: false,
    lazyLoad: true,
  };
}

export function getDefaultLogicQuizConfig(): LogicQuizConfig {
  return {
    shuffleOptions: true,
    showFeedback: 'immediate',
    allowRetry: true,
    maxAttempts: 3,
    showHints: true,
    hintPenalty: 10,
    partialCredit: false,
  };
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
