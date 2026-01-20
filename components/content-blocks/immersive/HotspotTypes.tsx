'use client';

import {
  AlertTriangle,
  FileText,
  Info,
  Link as LinkIcon,
  type LucideIcon,
  Navigation,
  Play,
  Zap,
} from 'lucide-react';

// Base hotspot interface with pitch/yaw coordinate system
export interface BaseHotspot {
  id: string;
  pitch: number; // Vertical angle (-90 to 90 degrees)
  yaw: number; // Horizontal angle (0 to 360 degrees)
  type: HotspotType;
  tooltip?: string;
  cssClass?: string;
}

// Hotspot type enumeration
export type HotspotType = 'info' | 'scene' | 'link' | 'custom' | 'video' | 'document' | 'warning';

// Info hotspot - displays tooltip/modal with information
export interface InfoHotspot extends BaseHotspot {
  type: 'info';
  title: string;
  content: string;
  image?: string;
}

// Scene navigation hotspot - links to another panorama scene
export interface SceneHotspot extends BaseHotspot {
  type: 'scene';
  targetSceneId: string;
  targetPitch?: number;
  targetYaw?: number;
  transitionDuration?: number; // ms
}

// External link hotspot - opens URL
export interface LinkHotspot extends BaseHotspot {
  type: 'link';
  url: string;
  openInNewTab?: boolean;
  title: string;
}

// Custom callback hotspot - executes custom function
export interface CustomHotspot extends BaseHotspot {
  type: 'custom';
  title: string;
  callbackId: string;
  data?: Record<string, unknown>;
}

// Video hotspot - plays embedded video
export interface VideoHotspot extends BaseHotspot {
  type: 'video';
  title: string;
  videoUrl: string;
  autoplay?: boolean;
}

// Document hotspot - links to document/PDF
export interface DocumentHotspot extends BaseHotspot {
  type: 'document';
  title: string;
  documentUrl: string;
  documentType: 'pdf' | 'doc' | 'other';
}

// Warning hotspot - safety/warning information
export interface WarningHotspot extends BaseHotspot {
  type: 'warning';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  content: string;
}

// Union type of all hotspots
export type Hotspot =
  | InfoHotspot
  | SceneHotspot
  | LinkHotspot
  | CustomHotspot
  | VideoHotspot
  | DocumentHotspot
  | WarningHotspot;

// Hotspot icon mapping
export const hotspotIcons: Record<HotspotType, LucideIcon> = {
  info: Info,
  scene: Navigation,
  link: LinkIcon,
  custom: Zap,
  video: Play,
  document: FileText,
  warning: AlertTriangle,
};

// Hotspot color mapping
export const hotspotColors: Record<HotspotType, string> = {
  info: 'var(--brand-primary)',
  scene: 'var(--color-teal-400)',
  link: 'var(--brand-secondary)',
  custom: 'var(--color-lxd-warning)',
  video: 'var(--color-pink-500)',
  document: 'var(--color-indigo-500)',
  warning: 'var(--color-lxd-error)',
};

// Hotspot labels
export const hotspotLabels: Record<HotspotType, string> = {
  info: 'Information',
  scene: 'Navigate to Scene',
  link: 'External Link',
  custom: 'Custom Action',
  video: 'Video',
  document: 'Document',
  warning: 'Warning',
};

// Panorama scene interface
export interface PanoramaScene {
  id: string;
  name: string;
  imageUrl: string;
  thumbnail?: string;
  initialPitch?: number;
  initialYaw?: number;
  hotspots: Hotspot[];
  caption?: string;
  northOffset?: number; // Compass correction in degrees
}

// Tour configuration
export interface PanoramaTourConfig {
  id: string;
  name: string;
  description?: string;
  scenes: PanoramaScene[];
  startSceneId: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number; // degrees per second
  showCompass?: boolean;
  showControls?: boolean;
  enableVR?: boolean;
  fadeDuration?: number; // ms for scene transitions
}

// Viewer state
export interface PanoramaViewerState {
  currentSceneId: string;
  pitch: number;
  yaw: number;
  zoom: number;
  isAutoRotating: boolean;
  isVRMode: boolean;
  isFullscreen: boolean;
}

// Editor state
export interface PanoramaEditorState {
  isEditing: boolean;
  selectedHotspotId: string | null;
  isDraggingHotspot: boolean;
  previewScene: PanoramaScene | null;
}

// Hotspot creation helper
export function createHotspot(
  type: HotspotType,
  pitch: number,
  yaw: number,
  overrides: Partial<Hotspot> = {},
): Hotspot {
  const id = `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const base = { id, pitch, yaw, type };

  switch (type) {
    case 'info':
      return {
        ...base,
        type: 'info',
        title: 'New Info Point',
        content: 'Add description here',
        ...overrides,
      } as InfoHotspot;
    case 'scene':
      return {
        ...base,
        type: 'scene',
        targetSceneId: '',
        transitionDuration: 1000,
        ...overrides,
      } as SceneHotspot;
    case 'link':
      return {
        ...base,
        type: 'link',
        url: '',
        title: 'External Link',
        openInNewTab: true,
        ...overrides,
      } as LinkHotspot;
    case 'custom':
      return {
        ...base,
        type: 'custom',
        title: 'Custom Action',
        callbackId: '',
        ...overrides,
      } as CustomHotspot;
    case 'video':
      return {
        ...base,
        type: 'video',
        title: 'Video',
        videoUrl: '',
        autoplay: false,
        ...overrides,
      } as VideoHotspot;
    case 'document':
      return {
        ...base,
        type: 'document',
        title: 'Document',
        documentUrl: '',
        documentType: 'pdf',
        ...overrides,
      } as DocumentHotspot;
    case 'warning':
      return {
        ...base,
        type: 'warning',
        title: 'Warning',
        severity: 'medium',
        content: 'Safety information here',
        ...overrides,
      } as WarningHotspot;
  }
}

// Default tour configuration
export const defaultTourConfig: Partial<PanoramaTourConfig> = {
  autoRotate: false,
  autoRotateSpeed: 2,
  showCompass: true,
  showControls: true,
  enableVR: true,
  fadeDuration: 1000,
};

// Coordinate conversion utilities
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// Normalize yaw to 0-360 range
export function normalizeYaw(yaw: number): number {
  let normalized = yaw % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

// Clamp pitch to valid range
export function clampPitch(pitch: number): number {
  return Math.max(-90, Math.min(90, pitch));
}
