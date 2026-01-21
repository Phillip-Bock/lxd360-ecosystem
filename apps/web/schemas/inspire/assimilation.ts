/**
 * INSPIRE Assimilation Phase Schemas
 *
 * Schemas for the Assimilation phase (Phase 3) of the INSPIRE methodology:
 * - Content Blocks
 * - Canvas Layout
 * - Export Configuration
 *
 * @module schemas/inspire/assimilation
 */

import { z } from 'zod';

// ============================================================================
// BLOCK TYPES
// ============================================================================

export const BlockTypeSchema = z.enum([
  // Smart Text Suite
  'smart-text',
  // Unified Media Suite
  'unified-media',
  // Logic Quiz Suite
  'logic-quiz',
  // Contextual Audio Suite
  'contextual-audio',
  // Dynamic Video Suite
  'dynamic-video',
  // Spatial Container Suite
  'spatial-container',
  // Social Hub Suite
  'social-hub',
  // Legacy/specific types
  'heading',
  'paragraph',
  'image',
  'video',
  'audio',
  'quiz-mc',
  'quiz-tf',
  'quiz-fitb',
  'hotspot',
  'accordion',
  'tabs',
  'timeline',
  'process',
  'flip-card',
  'drag-drop',
  'slider',
  'simulation',
  '3d-model',
  'ar-experience',
  'vr-scene',
  'branching-scenario',
  '360-panorama',
  'discussion',
  'poll',
  'peer-review',
]);
export type BlockType = z.infer<typeof BlockTypeSchema>;

// ============================================================================
// XAPI CONFIGURATION
// ============================================================================

export const BlockXAPIConfigSchema = z.object({
  /** Tracking enabled */
  enabled: z.boolean().default(true),
  /** Default verb ID */
  verbId: z.string().optional(),
  /** Default verb display */
  verbDisplay: z.string().optional(),
  /** Object type */
  objectType: z.string().default('Activity'),
  /** Custom extensions */
  extensions: z.record(z.string(), z.unknown()).default({}),
  /** Latency alert threshold (ms) */
  latencyThreshold: z.number().min(0).optional(),
});
export type BlockXAPIConfig = z.infer<typeof BlockXAPIConfigSchema>;

// ============================================================================
// ACCESSIBILITY CONFIGURATION
// ============================================================================

export const BlockA11yConfigSchema = z.object({
  /** Alt text for images/media */
  altText: z.string().optional(),
  /** Long description */
  longDescription: z.string().optional(),
  /** Transcript (for audio/video) */
  transcript: z.string().optional(),
  /** ARIA label */
  ariaLabel: z.string().optional(),
  /** ARIA described by */
  ariaDescribedBy: z.string().optional(),
  /** Tab index */
  tabIndex: z.number().int().optional(),
  /** Keyboard navigable */
  keyboardNavigable: z.boolean().default(true),
});
export type BlockA11yConfig = z.infer<typeof BlockA11yConfigSchema>;

// ============================================================================
// INSPIRE METADATA
// ============================================================================

export const BlockInspireMetaSchema = z.object({
  /** INSPIRE phase alignment */
  phase: z
    .enum(['ignite', 'navigate', 'scaffold', 'practice', 'integrate', 'reflect', 'evolve'])
    .optional(),
  /** Cognitive load weight (1-3) */
  cognitiveLoadWeight: z.number().min(1).max(3).default(1),
  /** Target proficiency level */
  targetProficiency: z
    .enum(['aware', 'comprehend', 'apply', 'adapt', 'integrate', 'elevate'])
    .optional(),
  /** ICES engagement level */
  engagementLevel: z
    .enum(['passive', 'reflective', 'active', 'collaborative', 'exploratory', 'immersive'])
    .optional(),
  /** Primary modality */
  modality: z
    .enum([
      'visual',
      'auditory',
      'textual',
      'kinesthetic',
      'social-async',
      'gamified',
      'reflective',
      'contextual-situated',
    ])
    .optional(),
  /** Linked competency ladder rung ID */
  ladderRungId: z.string().optional(),
});
export type BlockInspireMeta = z.infer<typeof BlockInspireMetaSchema>;

// ============================================================================
// BLOCK STYLE
// ============================================================================

export const BlockStyleSchema = z.object({
  /** Layout variant */
  layout: z.enum(['default', 'card', 'fullwidth', 'centered', 'sidebar']).default('default'),
  /** Theme override */
  theme: z.enum(['default', 'dark', 'light', 'accent', 'highlight']).default('default'),
  /** Padding */
  padding: z
    .object({
      top: z.number().min(0).default(0),
      bottom: z.number().min(0).default(0),
      left: z.number().min(0).default(0),
      right: z.number().min(0).default(0),
    })
    .optional(),
  /** Margin */
  margin: z.number().min(0).default(0),
  /** Aspect ratio lock */
  aspectRatioLock: z.boolean().default(false),
  /** Custom CSS */
  customCSS: z.string().optional(),
});
export type BlockStyle = z.infer<typeof BlockStyleSchema>;

// ============================================================================
// CONTENT BLOCK
// ============================================================================

export const ContentBlockSchema = z.object({
  /** Unique block identifier */
  id: z.string().uuid(),
  /** Block type */
  type: BlockTypeSchema,
  /** Block order in canvas */
  order: z.number().int().min(0),
  /** Position on canvas */
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().min(1),
    height: z.number().min(1),
  }),
  /** Block content (varies by type) */
  content: z.record(z.string(), z.unknown()).default({}),
  /** Block configuration (varies by type) */
  config: z.record(z.string(), z.unknown()).default({}),
  /** INSPIRE metadata */
  inspireMeta: BlockInspireMetaSchema.optional(),
  /** xAPI configuration */
  xapi: BlockXAPIConfigSchema.optional(),
  /** Accessibility configuration */
  a11y: BlockA11yConfigSchema.optional(),
  /** Style configuration */
  style: BlockStyleSchema.optional(),
  /** Linked ladder rung ID */
  ladderRungId: z.string().optional(),
  /** Custom code */
  customCode: z
    .object({
      js: z.string().optional(),
      css: z.string().optional(),
      html: z.string().optional(),
    })
    .optional(),
  /** Created timestamp */
  createdAt: z.string().datetime().optional(),
  /** Updated timestamp */
  updatedAt: z.string().datetime().optional(),
});
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// ============================================================================
// CANVAS CONFIGURATION
// ============================================================================

export const GridTypeSchema = z.enum(['12-column', '10x10-technical']);
export type GridType = z.infer<typeof GridTypeSchema>;

export const CanvasConfigSchema = z.object({
  /** Canvas width in logical pixels */
  width: z.number().positive().default(1920),
  /** Canvas height in logical pixels */
  height: z.number().positive().default(1080),
  /** Aspect ratio (e.g., '16:9') */
  aspectRatio: z.string().default('16:9'),
  /** Grid type */
  gridType: GridTypeSchema.default('12-column'),
  /** Grid visible */
  gridVisible: z.boolean().default(true),
  /** Snap to grid enabled */
  snapToGrid: z.boolean().default(true),
  /** Rulers visible */
  rulersVisible: z.boolean().default(true),
  /** Ruler unit */
  rulerUnit: z.enum(['pixels', 'percentage']).default('pixels'),
  /** Safe zones visible */
  safeZonesVisible: z.boolean().default(true),
  /** Safe zone margin (percentage) */
  safeZoneMargin: z.number().min(0).max(20).default(5),
  /** Background color */
  backgroundColor: z.string().default('#0A0A0F'),
  /** Current zoom level (percentage) */
  zoom: z.number().min(25).max(200).default(100),
});
export type CanvasConfig = z.infer<typeof CanvasConfigSchema>;

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export const ExportFormatSchema = z.enum([
  'native-json',
  'scorm-1.2',
  'scorm-2004-4th',
  'xapi-tincan',
  'cmi5',
  'html5',
  'pdf-storyboard',
]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportConfigSchema = z.object({
  /** Export format */
  format: ExportFormatSchema.default('native-json'),
  /** LRS endpoint (for xAPI/cmi5) */
  lrsEndpoint: z.string().url().optional(),
  /** LRS auth (for xAPI/cmi5) */
  lrsAuth: z
    .object({
      type: z.enum(['basic', 'oauth']),
      credentials: z.string().optional(),
    })
    .optional(),
  /** Include source files */
  includeSource: z.boolean().default(false),
  /** Compress output */
  compress: z.boolean().default(true),
  /** WCAG compliance level */
  wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
  /** Include analytics */
  includeAnalytics: z.boolean().default(true),
  /** Custom manifest metadata */
  manifestMetadata: z.record(z.string(), z.string()).default({}),
});
export type ExportConfig = z.infer<typeof ExportConfigSchema>;

// ============================================================================
// COMBINED ASSIMILATION DATA
// ============================================================================

export const AssimilationDataSchema = z.object({
  /** Content blocks */
  blocks: z.array(ContentBlockSchema).optional(),
  /** Canvas configuration */
  canvasConfig: CanvasConfigSchema.optional(),
  /** Export configuration */
  exportConfig: ExportConfigSchema.optional(),
  /** Cognitive load meter value (0-100) */
  cognitiveLoadMeterValue: z.number().min(0).max(100).optional(),
  /** Total estimated duration (minutes) */
  estimatedDuration: z.number().min(0).optional(),
  /** Phase completion status */
  isComplete: z.boolean().optional(),
  /** Phase started timestamp */
  startedAt: z.string().datetime().optional(),
  /** Phase completed timestamp */
  completedAt: z.string().datetime().optional(),
});
export type AssimilationData = z.infer<typeof AssimilationDataSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAssimilationData(value: unknown): value is AssimilationData {
  return AssimilationDataSchema.safeParse(value).success;
}

export function isContentBlock(value: unknown): value is ContentBlock {
  return ContentBlockSchema.safeParse(value).success;
}

export function isCanvasConfig(value: unknown): value is CanvasConfig {
  return CanvasConfigSchema.safeParse(value).success;
}

export function isExportConfig(value: unknown): value is ExportConfig {
  return ExportConfigSchema.safeParse(value).success;
}
