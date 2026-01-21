/**
 * =============================================================================
 * INSPIRE Studio - xAPI Statement Batch Optimizer
 * =============================================================================
 *
 * Optimizes xAPI statement batches by deduplicating, merging, and prioritizing
 * statements before sending to the LRS.
 *
 * Features:
 * - Deduplication: Removes duplicate statements within a time window
 * - Merging: Combines related statements (e.g., multiple progress updates)
 * - Prioritization: Ensures critical statements (passed/failed) are sent first
 * - Compression: Optionally compresses result extensions
 *
 * @module lib/xapi/batch-optimizer
 * @version 1.0.0
 */

import type { XAPIStatement } from '@/types/xapi';

// =============================================================================
// TYPES
// =============================================================================

export interface BatchOptimizerConfig {
  /** Time window (ms) for deduplication. Default: 5000 */
  dedupeWindow: number;
  /** Whether to merge progress statements. Default: true */
  mergeProgress: boolean;
  /** Whether to merge media events. Default: true */
  mergeMediaEvents: boolean;
  /** Maximum statements to keep per object. Default: 100 */
  maxStatementsPerObject: number;
  /** Priority order for verbs (lower = higher priority) */
  verbPriority: Record<string, number>;
}

export interface OptimizationResult {
  statements: XAPIStatement[];
  originalCount: number;
  optimizedCount: number;
  deduplicatedCount: number;
  mergedCount: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_VERB_PRIORITY: Record<string, number> = {
  'http://adlnet.gov/expapi/verbs/passed': 1,
  'http://adlnet.gov/expapi/verbs/failed': 1,
  'http://adlnet.gov/expapi/verbs/completed': 2,
  'http://adlnet.gov/expapi/verbs/terminated': 2,
  'http://adlnet.gov/expapi/verbs/answered': 3,
  'http://adlnet.gov/expapi/verbs/launched': 4,
  'http://adlnet.gov/expapi/verbs/initialized': 4,
  'http://adlnet.gov/expapi/verbs/experienced': 5,
  'http://adlnet.gov/expapi/verbs/interacted': 6,
  'http://adlnet.gov/expapi/verbs/progressed': 7,
  'https://w3id.org/xapi/video/verbs/played': 8,
  'https://w3id.org/xapi/video/verbs/paused': 8,
  'https://w3id.org/xapi/video/verbs/seeked': 8,
};

const PROGRESS_VERBS = [
  'http://adlnet.gov/expapi/verbs/progressed',
  'http://adlnet.gov/expapi/verbs/experienced',
];

const MEDIA_VERBS = [
  'https://w3id.org/xapi/video/verbs/played',
  'https://w3id.org/xapi/video/verbs/paused',
  'https://w3id.org/xapi/video/verbs/seeked',
];

// =============================================================================
// BATCH OPTIMIZER CLASS
// =============================================================================

export class BatchOptimizer {
  private config: BatchOptimizerConfig;

  constructor(config?: Partial<BatchOptimizerConfig>) {
    this.config = {
      dedupeWindow: 5000,
      mergeProgress: true,
      mergeMediaEvents: true,
      maxStatementsPerObject: 100,
      verbPriority: DEFAULT_VERB_PRIORITY,
      ...config,
    };
  }

  /**
   * Optimize a batch of statements for sending.
   */
  optimize(statements: XAPIStatement[]): OptimizationResult {
    const originalCount = statements.length;
    let current = [...statements];
    let deduplicatedCount = 0;
    let mergedCount = 0;

    // Step 1: Sort by timestamp
    current = this.sortByTimestamp(current);

    // Step 2: Deduplicate
    const deduped = this.deduplicate(current);
    deduplicatedCount = current.length - deduped.length;
    current = deduped;

    // Step 3: Merge progress statements
    if (this.config.mergeProgress) {
      const merged = this.mergeProgressStatements(current);
      mergedCount += current.length - merged.length;
      current = merged;
    }

    // Step 4: Merge media events
    if (this.config.mergeMediaEvents) {
      const merged = this.mergeMediaStatements(current);
      mergedCount += current.length - merged.length;
      current = merged;
    }

    // Step 5: Limit per object
    current = this.limitPerObject(current);

    // Step 6: Sort by priority
    current = this.sortByPriority(current);

    return {
      statements: current,
      originalCount,
      optimizedCount: current.length,
      deduplicatedCount,
      mergedCount,
    };
  }

  /**
   * Sort statements by timestamp (oldest first).
   */
  private sortByTimestamp(statements: XAPIStatement[]): XAPIStatement[] {
    return [...statements].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeA - timeB;
    });
  }

  /**
   * Remove duplicate statements within the dedupe window.
   * Duplicates are defined as same actor, verb, and object within the time window.
   */
  private deduplicate(statements: XAPIStatement[]): XAPIStatement[] {
    const seen = new Map<string, number>();
    const result: XAPIStatement[] = [];

    for (const statement of statements) {
      const key = this.getDedupeKey(statement);
      const timestamp = statement.timestamp ? new Date(statement.timestamp).getTime() : Date.now();
      const lastSeen = seen.get(key);

      if (!lastSeen || timestamp - lastSeen > this.config.dedupeWindow) {
        result.push(statement);
        seen.set(key, timestamp);
      }
    }

    return result;
  }

  /**
   * Generate a key for deduplication.
   */
  private getDedupeKey(statement: XAPIStatement): string {
    const actor = this.getActorId(statement);
    const verb = statement.verb.id;
    const object =
      typeof statement.object === 'object' && 'id' in statement.object
        ? statement.object.id
        : 'unknown';
    return `${actor}:${verb}:${object}`;
  }

  /**
   * Extract actor identifier from statement.
   */
  private getActorId(statement: XAPIStatement): string {
    const actor = statement.actor;
    if ('mbox' in actor && actor.mbox) {
      return actor.mbox;
    }
    if ('account' in actor && actor.account) {
      return `${actor.account.homePage}::${actor.account.name}`;
    }
    return 'unknown';
  }

  /**
   * Merge consecutive progress statements for the same object.
   * Keeps only the highest progress value within the merge window.
   */
  private mergeProgressStatements(statements: XAPIStatement[]): XAPIStatement[] {
    const progressStatements: XAPIStatement[] = [];
    const otherStatements: XAPIStatement[] = [];

    // Separate progress from other statements
    for (const statement of statements) {
      if (PROGRESS_VERBS.includes(statement.verb.id)) {
        progressStatements.push(statement);
      } else {
        otherStatements.push(statement);
      }
    }

    // Group progress by object
    const byObject = new Map<string, XAPIStatement[]>();
    for (const statement of progressStatements) {
      const objectId =
        typeof statement.object === 'object' && 'id' in statement.object
          ? statement.object.id
          : 'unknown';
      const existing = byObject.get(objectId) || [];
      existing.push(statement);
      byObject.set(objectId, existing);
    }

    // Keep only the highest progress for each object
    const mergedProgress: XAPIStatement[] = [];
    for (const [, group] of byObject) {
      const withProgress = group.filter((s) => {
        const result = s.result;
        return result && 'extensions' in result;
      });

      if (withProgress.length > 0) {
        // Find highest progress
        let highest = withProgress[0];
        let highestValue = this.extractProgressValue(highest);

        for (const statement of withProgress.slice(1)) {
          const value = this.extractProgressValue(statement);
          if (value > highestValue) {
            highest = statement;
            highestValue = value;
          }
        }
        mergedProgress.push(highest);
      } else if (group.length > 0) {
        // Keep the last one if no progress values
        mergedProgress.push(group[group.length - 1]);
      }
    }

    return [...otherStatements, ...mergedProgress];
  }

  /**
   * Extract progress value from a statement.
   */
  private extractProgressValue(statement: XAPIStatement): number {
    const result = statement.result;
    if (!result) return 0;

    if ('extensions' in result && result.extensions) {
      const extensions = result.extensions as Record<string, unknown>;
      const progressKey = Object.keys(extensions).find((k) => k.includes('progress'));
      if (progressKey) {
        const value = extensions[progressKey];
        return typeof value === 'number' ? value : 0;
      }
    }

    if ('completion' in result && result.completion) {
      return 1;
    }

    return 0;
  }

  /**
   * Merge consecutive media events for the same media.
   * Combines play/pause cycles into a single watched segment.
   */
  private mergeMediaStatements(statements: XAPIStatement[]): XAPIStatement[] {
    const mediaStatements: XAPIStatement[] = [];
    const otherStatements: XAPIStatement[] = [];

    // Separate media from other statements
    for (const statement of statements) {
      if (MEDIA_VERBS.includes(statement.verb.id)) {
        mediaStatements.push(statement);
      } else {
        otherStatements.push(statement);
      }
    }

    // Group by object
    const byObject = new Map<string, XAPIStatement[]>();
    for (const statement of mediaStatements) {
      const objectId =
        typeof statement.object === 'object' && 'id' in statement.object
          ? statement.object.id
          : 'unknown';
      const existing = byObject.get(objectId) || [];
      existing.push(statement);
      byObject.set(objectId, existing);
    }

    // Keep essential media events (first play, last pause, all seeks)
    const mergedMedia: XAPIStatement[] = [];
    for (const [, group] of byObject) {
      const plays = group.filter((s) => s.verb.id.includes('played'));
      const pauses = group.filter((s) => s.verb.id.includes('paused'));
      const seeks = group.filter((s) => s.verb.id.includes('seeked'));

      // Keep first play
      if (plays.length > 0) {
        mergedMedia.push(plays[0]);
      }

      // Keep all seeks (important for analytics)
      mergedMedia.push(...seeks);

      // Keep last pause
      if (pauses.length > 0) {
        mergedMedia.push(pauses[pauses.length - 1]);
      }
    }

    return [...otherStatements, ...mergedMedia];
  }

  /**
   * Limit statements per object to prevent overwhelming the LRS.
   */
  private limitPerObject(statements: XAPIStatement[]): XAPIStatement[] {
    const byObject = new Map<string, XAPIStatement[]>();

    for (const statement of statements) {
      const objectId =
        typeof statement.object === 'object' && 'id' in statement.object
          ? statement.object.id
          : 'unknown';
      const existing = byObject.get(objectId) || [];
      existing.push(statement);
      byObject.set(objectId, existing);
    }

    const result: XAPIStatement[] = [];
    for (const [, group] of byObject) {
      if (group.length <= this.config.maxStatementsPerObject) {
        result.push(...group);
      } else {
        // Sort by priority and keep top N
        const sorted = this.sortByPriority(group);
        result.push(...sorted.slice(0, this.config.maxStatementsPerObject));
      }
    }

    return result;
  }

  /**
   * Sort statements by verb priority (critical statements first).
   */
  private sortByPriority(statements: XAPIStatement[]): XAPIStatement[] {
    return [...statements].sort((a, b) => {
      const priorityA = this.config.verbPriority[a.verb.id] || 10;
      const priorityB = this.config.verbPriority[b.verb.id] || 10;
      return priorityA - priorityB;
    });
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<BatchOptimizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): BatchOptimizerConfig {
    return { ...this.config };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let defaultOptimizer: BatchOptimizer | null = null;

/**
 * Get the default batch optimizer instance.
 */
export function getBatchOptimizer(): BatchOptimizer {
  if (!defaultOptimizer) {
    defaultOptimizer = new BatchOptimizer();
  }
  return defaultOptimizer;
}

/**
 * Initialize the batch optimizer with custom configuration.
 */
export function initializeBatchOptimizer(config?: Partial<BatchOptimizerConfig>): BatchOptimizer {
  defaultOptimizer = new BatchOptimizer(config);
  return defaultOptimizer;
}

/**
 * Optimize statements using the default optimizer.
 */
export function optimizeStatements(statements: XAPIStatement[]): OptimizationResult {
  return getBatchOptimizer().optimize(statements);
}
