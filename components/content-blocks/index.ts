// Content Blocks - Master Export
// Integrated from INSPIRE repo with LXD CSS variables

// Alerts (6)
export * from './alerts';

// Blockquotes (7)
export * from './blockquotes';

// Callouts (2)
export * from './callouts';
// Immersive (360° VR, Panorama) (7)
export * from './immersive';
// Interactive (2)
export * from './interactive';
// Layouts (1)
export * from './layouts';
// Lists (4)
export * from './lists';
// Media (3)
export * from './media';
// Special (3)
export * from './special';
// Statements (3)
export * from './statements';
// Tables (2)
export * from './tables';
// Text (5)
export * from './text';
// Timelines (4)
export * from './timelines';

// Total: 49 content blocks

export type { ContentBlock, ContentBlockProps, ContentBlockType } from './registry';
// Registry & Renderer
export {
  BLOCK_REGISTRY,
  EXTENDED_BLOCK_REGISTRY,
  getAvailableBlockTypes,
  isBlockTypeSupported,
  renderContentBlock,
} from './registry';
