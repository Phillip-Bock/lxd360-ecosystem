/**
 * Lesson and content type definitions
 */

import type { CognitiveLoadLevel, ContentType, INSPIREStage } from './course';

export interface VideoContent {
  videoUrl: string;
  duration: number;
  provider: 'youtube' | 'vimeo' | 'bunny' | 'cloudflare' | 'custom';
  videoId?: string;
  thumbnailUrl?: string;
  chapters?: VideoChapter[];
  transcriptUrl?: string;
  captionsUrl?: string;
  playbackRate: number[];
  quality: VideoQuality[];
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number;
  description?: string;
}

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | '4k';

export interface SCORMContent {
  packageId: string;
  packageUrl: string;
  version: 'scorm12' | 'scorm2004';
  entryPoint: string;
  width?: number;
  height?: number;
  launchData?: string;
  completionThreshold?: number;
  masteryScore?: number;
}

export interface xAPIContent {
  activityId: string;
  activityType: string;
  launchUrl: string;
  endpoint: string;
  authToken?: string;
  registration?: string;
  extensions?: Record<string, unknown>;
}

export interface DocumentContent {
  documentUrl: string;
  documentType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx';
  pageCount?: number;
  allowDownload: boolean;
  watermark?: boolean;
}

export interface TextContent {
  html: string;
  readTime: number; // minutes
  wordCount: number;
}

export interface InteractiveContent {
  type: 'h5p' | 'storyline' | 'captivate' | 'rise' | 'custom';
  embedUrl: string;
  width: number;
  height: number;
  embedCode?: string;
}

export interface AudioContent {
  audioUrl: string;
  duration: number;
  format: 'mp3' | 'wav' | 'ogg' | 'm4a';
  transcriptUrl?: string;
  waveformUrl?: string;
}

export interface SimulationContent {
  simulationType: 'branching' | 'scenario' | 'vr' | 'ar' | 'game';
  launchUrl: string;
  instructions?: string;
  requiredTime?: number;
  attempts?: number;
}

export type LessonContent =
  | VideoContent
  | SCORMContent
  | xAPIContent
  | DocumentContent
  | TextContent
  | InteractiveContent
  | AudioContent
  | SimulationContent;

export interface LessonNote {
  id: string;
  lessonId: string;
  learnerId: string;
  content: string;
  timestamp?: number; // for video/audio - seconds
  pageNumber?: number; // for documents
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonBookmark {
  id: string;
  lessonId: string;
  learnerId: string;
  title: string;
  timestamp?: number;
  pageNumber?: number;
  createdAt: string;
}

export interface LessonHighlight {
  id: string;
  lessonId: string;
  learnerId: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  note?: string;
  position: {
    start: number;
    end: number;
    pageNumber?: number;
  };
  createdAt: string;
}

export interface LessonPlaybackState {
  lessonId: string;
  learnerId: string;
  position: number; // seconds or page number
  duration: number;
  playbackRate: number;
  volume: number;
  captionsEnabled: boolean;
  captionsLanguage: string;
  quality?: VideoQuality;
  lastUpdated: string;
}

export interface LessonInteraction {
  id: string;
  lessonId: string;
  learnerId: string;
  type:
    | 'pause'
    | 'play'
    | 'seek'
    | 'complete'
    | 'skip'
    | 'rewind'
    | 'note'
    | 'bookmark'
    | 'highlight';
  timestamp: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ContentBlock {
  id: string;
  type: ContentType;
  title: string;
  content: LessonContent;
  order: number;
  inspireStage: INSPIREStage;
  cognitiveLoad: CognitiveLoadLevel;
  estimatedTime: number;
  isRequired: boolean;
}
