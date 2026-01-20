/**
 * Object ID System for INSPIRE Studio
 * Generates unique, human-readable IDs for canvas objects
 * Format: {type}_{shortId}_{sequence}
 * Examples: "text_a3x7_001", "mcq_b2y9_002", "video_c1z8_003"
 */

import type { StarterBlockType } from '@/types/blocks';

// Extended content block types including all possible objects
export type ContentBlockType =
  | StarterBlockType
  | 'button'
  | 'shape'
  | 'hotspot'
  | 'audio'
  | 'embed'
  | 'divider'
  | 'group';

export interface ObjectIdConfig {
  type: ContentBlockType;
  slideId: string;
  existingIds: string[];
}

export interface ObjectMetadata {
  id: string;
  type: ContentBlockType;
  displayName: string;
  slideId: string;
  createdAt: Date;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  parentId?: string; // For grouped objects
}

// Type abbreviations for cleaner IDs
const TYPE_ABBREVIATIONS: Record<ContentBlockType, string> = {
  paragraph: 'txt',
  image: 'img',
  video: 'vid',
  quote: 'qot',
  list: 'lst',
  'mc-question': 'mcq',
  'fitb-question': 'ftb',
  accordion: 'acc',
  tabs: 'tab',
  'flip-card': 'flp',
  button: 'btn',
  shape: 'shp',
  hotspot: 'hot',
  audio: 'aud',
  embed: 'emb',
  divider: 'div',
  group: 'grp',
};

// Characters used for short ID generation (URL-safe)
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random short ID (4 characters)
 */
function generateShortId(): string {
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  }
  return result;
}

/**
 * Generate a unique object ID
 */
export function generateObjectId(config: ObjectIdConfig): string {
  const { type, existingIds } = config;
  const abbreviation = TYPE_ABBREVIATIONS[type] || type.slice(0, 3);
  const sequence = getNextSequence(existingIds, abbreviation);
  const sequenceStr = sequence.toString().padStart(3, '0');

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const shortId = generateShortId();
    const newId = `${abbreviation}_${shortId}_${sequenceStr}`;

    if (!existingIds.includes(newId)) {
      return newId;
    }
    attempts++;
  }

  // Fallback with timestamp if all random attempts fail
  const timestamp = Date.now().toString(36).slice(-4);
  return `${abbreviation}_${timestamp}_${sequenceStr}`;
}

/**
 * Generate multiple unique IDs at once (for batch operations)
 */
export function generateBatchObjectIds(configs: ObjectIdConfig[], count: number): string[] {
  const ids: string[] = [];
  const existingIds = configs[0]?.existingIds || [];

  for (let i = 0; i < count; i++) {
    const config = configs[i] || configs[0];
    const newId = generateObjectId({
      ...config,
      existingIds: [...existingIds, ...ids],
    });
    ids.push(newId);
  }

  return ids;
}

/**
 * Parse an object ID into its components
 */
export function parseObjectId(id: string): {
  type: string;
  shortId: string;
  sequence: number;
} | null {
  const parts = id.split('_');
  if (parts.length !== 3) {
    return null;
  }

  const [type, shortId, sequenceStr] = parts;
  const sequence = Number.parseInt(sequenceStr, 10);

  if (Number.isNaN(sequence)) {
    return null;
  }

  return { type, shortId, sequence };
}

/**
 * Validate an object ID format
 */
export function validateObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // Check format: type_shortId_sequence
  const regex = /^[a-z]{3}_[a-z0-9]{4}_\d{3}$/;
  return regex.test(id);
}

/**
 * Get the next sequence number for a given type
 */
export function getNextSequence(existingIds: string[], type: string): number {
  const typeIds = existingIds.filter((id) => id.startsWith(`${type}_`));

  if (typeIds.length === 0) {
    return 1;
  }

  const sequences = typeIds
    .map((id) => {
      const parsed = parseObjectId(id);
      return parsed?.sequence ?? 0;
    })
    .filter((seq) => !Number.isNaN(seq));

  return Math.max(...sequences, 0) + 1;
}

/**
 * Get the full type name from an abbreviation
 */
export function getTypeFromAbbreviation(abbreviation: string): ContentBlockType | null {
  for (const [type, abbr] of Object.entries(TYPE_ABBREVIATIONS)) {
    if (abbr === abbreviation) {
      return type as ContentBlockType;
    }
  }
  return null;
}

/**
 * Get the abbreviation for a type
 */
export function getAbbreviationForType(type: ContentBlockType): string {
  return TYPE_ABBREVIATIONS[type] || type.slice(0, 3);
}

/**
 * Create object metadata with a new ID
 */
export function createObjectMetadata(config: ObjectIdConfig, displayName?: string): ObjectMetadata {
  const id = generateObjectId(config);
  const typeDisplayName = config.type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id,
    type: config.type,
    displayName: displayName || typeDisplayName,
    slideId: config.slideId,
    createdAt: new Date(),
    zIndex: 0,
    locked: false,
    visible: true,
  };
}

/**
 * Alias system for user-defined display names
 */
export interface ObjectAlias {
  objectId: string;
  alias: string;
  createdAt: Date;
  updatedAt: Date;
}

const aliasStore = new Map<string, ObjectAlias>();

/**
 * Set a custom alias for an object
 */
export function setObjectAlias(objectId: string, alias: string): ObjectAlias {
  const now = new Date();
  const existingAlias = aliasStore.get(objectId);

  const newAlias: ObjectAlias = {
    objectId,
    alias,
    createdAt: existingAlias?.createdAt || now,
    updatedAt: now,
  };

  aliasStore.set(objectId, newAlias);
  return newAlias;
}

/**
 * Get the alias for an object (or the object ID if no alias)
 */
export function getObjectAlias(objectId: string): string {
  return aliasStore.get(objectId)?.alias || objectId;
}

/**
 * Remove an alias for an object
 */
export function removeObjectAlias(objectId: string): boolean {
  return aliasStore.delete(objectId);
}

/**
 * Find object by alias
 */
export function findObjectByAlias(alias: string): string | null {
  for (const [objectId, aliasData] of aliasStore.entries()) {
    if (aliasData.alias === alias) {
      return objectId;
    }
  }
  return null;
}

/**
 * Export all aliases (for persistence)
 */
export function exportAliases(): ObjectAlias[] {
  return Array.from(aliasStore.values());
}

/**
 * Import aliases (from persistence)
 */
export function importAliases(aliases: ObjectAlias[]): void {
  aliasStore.clear();
  for (const alias of aliases) {
    aliasStore.set(alias.objectId, alias);
  }
}
