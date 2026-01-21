import type { BlockConfig, BlockType, ContentBlock } from './content-blocks';

// =============================================================================
// STARTER BLOCK TYPES
// =============================================================================

/**
 * Block types available for creating new blocks
 * This is the subset of BlockType that can be directly instantiated
 */
export type StarterBlockType = BlockType;

// =============================================================================
// BLOCK CONTENT & CONFIG MAPS
// =============================================================================

/**
 * Map of block types to their content structure
 * Content represents the user-editable data within a block
 */
export type BlockContentMap = {
  [K in BlockType]: ContentBlock<K>['config'];
};

/**
 * Map of block types to their configuration structure
 * Config represents the block's settings and behavior options
 */
export type BlockConfigMap = {
  [K in BlockType]: BlockConfig<K>;
};

// =============================================================================
// BLOCK INSTANCE
// =============================================================================

/**
 * A block instance with all required fields for the store
 * This extends ContentBlock with additional store-specific properties
 */
export interface BlockInstance<T extends BlockType = BlockType> {
  /** Unique instance ID */
  id: string;
  /** Block type */
  type: T;
  /** Block content (type-specific data) */
  content: BlockContentMap[T];
  /** Block configuration (type-specific settings) */
  config: BlockConfigMap[T];
  /** Order in the block list */
  order: number;
  /** Optional parent block ID for nested blocks */
  parentId?: string;
  /** Custom CSS classes */
  className?: string;
  /** Inline styles override */
  style?: Record<string, string>;
  /** Estimated duration override (seconds) */
  duration?: number;
  /** Cognitive load override (1-10) */
  cognitiveLoad?: number;
}

// =============================================================================
// COURSE STATE
// =============================================================================

/**
 * Course status values
 */
export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Complete course state for the store
 */
export interface CourseState {
  /** Unique course ID */
  id: string;
  /** Course title */
  title: string;
  /** All blocks in the course */
  blocks: BlockInstance[];
  /** Currently selected block ID */
  selectedBlockId: string | null;
  /** Course status */
  status: CourseStatus;
  /** Last saved timestamp */
  lastSaved?: Date;
}
