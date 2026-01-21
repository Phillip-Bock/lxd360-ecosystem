'use client';

import type { BlockType, CanvasConfig, ContentBlock, GridType } from '@/schemas/inspire';

// ============================================================================
// CANVAS PRESETS
// ============================================================================

export interface CanvasPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  {
    id: 'hd-16-9',
    name: 'HD (16:9)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Standard HD resolution for desktop and web',
  },
  {
    id: 'hd-4-3',
    name: 'Standard (4:3)',
    width: 1440,
    height: 1080,
    aspectRatio: '4:3',
    description: 'Traditional presentation format',
  },
  {
    id: 'mobile-9-16',
    name: 'Mobile (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Vertical mobile-first design',
  },
  {
    id: 'square-1-1',
    name: 'Square (1:1)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Social media friendly format',
  },
];

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

export interface GridConfig {
  type: GridType;
  columns: number;
  rows: number;
  gap: number;
  color: string;
}

export const GRID_CONFIGS: Record<GridType, Omit<GridConfig, 'type'>> = {
  '12-column': {
    columns: 12,
    rows: 10,
    gap: 16,
    color: 'rgba(139, 92, 246, 0.1)',
  },
  '10x10-technical': {
    columns: 10,
    rows: 10,
    gap: 20,
    color: 'rgba(0, 212, 255, 0.1)',
  },
};

// ============================================================================
// BLOCK TYPE CATALOG
// ============================================================================

export interface BlockTypeOption {
  type: BlockType;
  name: string;
  icon: string;
  category: 'smart-suite' | 'basic' | 'interactive' | 'immersive' | 'social';
  description: string;
  defaultSize: { width: number; height: number };
}

export const BLOCK_TYPE_CATALOG: BlockTypeOption[] = [
  // Smart Suites
  {
    type: 'smart-text',
    name: 'Smart Text',
    icon: 'file-text',
    category: 'smart-suite',
    description: 'Adaptive text with rich formatting',
    defaultSize: { width: 6, height: 3 },
  },
  {
    type: 'unified-media',
    name: 'Unified Media',
    icon: 'image',
    category: 'smart-suite',
    description: 'Multi-format media container',
    defaultSize: { width: 8, height: 5 },
  },
  {
    type: 'logic-quiz',
    name: 'Logic Quiz',
    icon: 'clipboard-check',
    category: 'smart-suite',
    description: 'Intelligent assessment block',
    defaultSize: { width: 8, height: 4 },
  },
  {
    type: 'contextual-audio',
    name: 'Contextual Audio',
    icon: 'headphones',
    category: 'smart-suite',
    description: 'Audio with context awareness',
    defaultSize: { width: 6, height: 2 },
  },
  {
    type: 'dynamic-video',
    name: 'Dynamic Video',
    icon: 'video',
    category: 'smart-suite',
    description: 'Video with interactive overlays',
    defaultSize: { width: 10, height: 6 },
  },
  {
    type: 'spatial-container',
    name: 'Spatial Container',
    icon: 'box',
    category: 'smart-suite',
    description: '3D/XR content container',
    defaultSize: { width: 10, height: 8 },
  },
  {
    type: 'social-hub',
    name: 'Social Hub',
    icon: 'users',
    category: 'smart-suite',
    description: 'Collaborative interaction block',
    defaultSize: { width: 6, height: 4 },
  },
  // Basic blocks
  {
    type: 'heading',
    name: 'Heading',
    icon: 'heading',
    category: 'basic',
    description: 'Section title',
    defaultSize: { width: 12, height: 1 },
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    icon: 'align-left',
    category: 'basic',
    description: 'Body text',
    defaultSize: { width: 8, height: 2 },
  },
  {
    type: 'image',
    name: 'Image',
    icon: 'image',
    category: 'basic',
    description: 'Static image',
    defaultSize: { width: 6, height: 4 },
  },
  // Interactive blocks
  {
    type: 'hotspot',
    name: 'Hotspot',
    icon: 'mouse-pointer',
    category: 'interactive',
    description: 'Click-to-reveal interactions',
    defaultSize: { width: 8, height: 6 },
  },
  {
    type: 'accordion',
    name: 'Accordion',
    icon: 'layers',
    category: 'interactive',
    description: 'Expandable sections',
    defaultSize: { width: 6, height: 4 },
  },
  {
    type: 'tabs',
    name: 'Tabs',
    icon: 'folder',
    category: 'interactive',
    description: 'Tabbed content',
    defaultSize: { width: 8, height: 5 },
  },
  {
    type: 'flip-card',
    name: 'Flip Card',
    icon: 'refresh-cw',
    category: 'interactive',
    description: 'Two-sided card',
    defaultSize: { width: 4, height: 4 },
  },
  {
    type: 'drag-drop',
    name: 'Drag & Drop',
    icon: 'move',
    category: 'interactive',
    description: 'Sorting activity',
    defaultSize: { width: 8, height: 6 },
  },
  // Immersive blocks
  {
    type: 'simulation',
    name: 'Simulation',
    icon: 'monitor',
    category: 'immersive',
    description: 'Interactive simulation',
    defaultSize: { width: 12, height: 8 },
  },
  {
    type: '3d-model',
    name: '3D Model',
    icon: 'box',
    category: 'immersive',
    description: 'Interactive 3D object',
    defaultSize: { width: 8, height: 6 },
  },
  {
    type: 'branching-scenario',
    name: 'Branching Scenario',
    icon: 'git-branch',
    category: 'immersive',
    description: 'Decision-based pathway',
    defaultSize: { width: 12, height: 8 },
  },
  {
    type: '360-panorama',
    name: '360° Panorama',
    icon: 'compass',
    category: 'immersive',
    description: 'Panoramic environment',
    defaultSize: { width: 12, height: 8 },
  },
  // Social blocks
  {
    type: 'discussion',
    name: 'Discussion',
    icon: 'message-circle',
    category: 'social',
    description: 'Threaded discussion',
    defaultSize: { width: 6, height: 4 },
  },
  {
    type: 'poll',
    name: 'Poll',
    icon: 'bar-chart-2',
    category: 'social',
    description: 'Quick poll',
    defaultSize: { width: 4, height: 3 },
  },
  {
    type: 'peer-review',
    name: 'Peer Review',
    icon: 'users',
    category: 'social',
    description: 'Peer feedback activity',
    defaultSize: { width: 8, height: 5 },
  },
];

// ============================================================================
// BLOCK CATEGORIES
// ============================================================================

export const BLOCK_CATEGORIES = [
  { id: 'smart-suite', name: 'Smart Suites', color: 'text-lxd-purple' },
  { id: 'basic', name: 'Basic', color: 'text-gray-400' },
  { id: 'interactive', name: 'Interactive', color: 'text-lxd-cyan' },
  { id: 'immersive', name: 'Immersive', color: 'text-orange-400' },
  { id: 'social', name: 'Social', color: 'text-green-400' },
] as const;

// ============================================================================
// CANVAS TOOL TYPES
// ============================================================================

export type CanvasTool = 'select' | 'pan' | 'zoom' | 'add';

// ============================================================================
// HELPERS
// ============================================================================

export function getBlockTypeOption(type: BlockType): BlockTypeOption | undefined {
  return BLOCK_TYPE_CATALOG.find((b) => b.type === type);
}

export function getDefaultCanvasConfig(): CanvasConfig {
  return {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    gridType: '12-column',
    gridVisible: true,
    snapToGrid: true,
    rulersVisible: true,
    rulerUnit: 'pixels',
    safeZonesVisible: true,
    safeZoneMargin: 5,
    backgroundColor: '#0A0A0F',
    zoom: 100,
  };
}

export function calculateGridPosition(
  x: number,
  y: number,
  canvasConfig: CanvasConfig,
): { col: number; row: number } {
  const gridConfig = GRID_CONFIGS[canvasConfig.gridType];
  const cellWidth = canvasConfig.width / gridConfig.columns;
  const cellHeight = canvasConfig.height / gridConfig.rows;

  return {
    col: Math.floor(x / cellWidth),
    row: Math.floor(y / cellHeight),
  };
}

export function snapToGrid(
  x: number,
  y: number,
  canvasConfig: CanvasConfig,
): { x: number; y: number } {
  if (!canvasConfig.snapToGrid) return { x, y };

  const gridConfig = GRID_CONFIGS[canvasConfig.gridType];
  const cellWidth = canvasConfig.width / gridConfig.columns;
  const cellHeight = canvasConfig.height / gridConfig.rows;

  return {
    x: Math.round(x / cellWidth) * cellWidth,
    y: Math.round(y / cellHeight) * cellHeight,
  };
}

export function calculateCognitiveLoad(blocks: ContentBlock[]): number {
  if (blocks.length === 0) return 0;

  let totalWeight = 0;
  for (const block of blocks) {
    totalWeight += block.inspireMeta?.cognitiveLoadWeight ?? 1;
  }

  // Normalize to 0-100 scale (assuming max 30 blocks at weight 3 = 90)
  return Math.min(100, Math.round((totalWeight / 30) * 100));
}

export function estimateDuration(blocks: ContentBlock[]): number {
  // Rough estimate: 30 seconds per block base + multipliers
  let totalMinutes = 0;

  for (const block of blocks) {
    let baseMinutes = 0.5; // 30 seconds base

    // Adjust by block type
    const blockType = getBlockTypeOption(block.type);
    if (blockType) {
      switch (blockType.category) {
        case 'immersive':
          baseMinutes = 3;
          break;
        case 'interactive':
          baseMinutes = 1.5;
          break;
        case 'social':
          baseMinutes = 2;
          break;
        case 'smart-suite':
          baseMinutes = 1;
          break;
        default:
          baseMinutes = 0.5;
      }
    }

    // Adjust by cognitive load
    const weight = block.inspireMeta?.cognitiveLoadWeight ?? 1;
    totalMinutes += baseMinutes * weight;
  }

  return Math.round(totalMinutes);
}
