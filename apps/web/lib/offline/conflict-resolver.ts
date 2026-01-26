/**
 * =============================================================================
 * LXD360 Offline Queue Service - Conflict Resolver
 * =============================================================================
 *
 * Handles sync conflicts between local (offline) and remote (server) xAPI statements.
 * Default strategy: most recent timestamp wins, but both versions are preserved in audit.
 *
 * @module lib/offline/conflict-resolver
 * @version 1.0.0
 */

import type { XAPIStatement } from '@/types/xapi';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Conflict resolution action.
 */
export type ConflictAction = 'use_local' | 'use_remote' | 'merge' | 'skip';

/**
 * Result of a conflict resolution.
 */
export interface ConflictResolution {
  /** Action taken to resolve the conflict */
  action: ConflictAction;
  /** The resolved statement (if action is not 'skip') */
  resolvedStatement?: XAPIStatement;
  /** The local statement (preserved for audit) */
  localStatement: XAPIStatement;
  /** The remote statement (if conflict existed) */
  remoteStatement?: XAPIStatement;
  /** Reason for the resolution */
  reason: string;
}

/**
 * Audit record for conflict resolution.
 */
export interface ConflictAuditRecord {
  /** Unique ID for this audit record */
  id: string;
  /** Statement ID that had the conflict */
  statementId: string;
  /** ISO timestamp of the resolution */
  resolvedAt: string;
  /** Action taken */
  action: ConflictAction;
  /** Local statement data */
  localStatement: XAPIStatement;
  /** Remote statement data (if exists) */
  remoteStatement?: XAPIStatement;
  /** Resolved statement data */
  resolvedStatement?: XAPIStatement;
  /** Resolution reason */
  reason: string;
}

/**
 * Conflict resolver interface.
 */
export interface ConflictResolver {
  /**
   * Resolves a potential conflict for a statement.
   *
   * @param localStatement - The local (offline) statement
   * @param remoteStatement - The remote (server) statement, if exists
   * @returns The resolution result
   */
  resolve(
    localStatement: XAPIStatement,
    remoteStatement?: XAPIStatement,
  ): Promise<ConflictResolution>;

  /**
   * Gets the audit trail of conflict resolutions.
   */
  getAuditTrail(): Promise<ConflictAuditRecord[]>;

  /**
   * Clears the audit trail.
   */
  clearAuditTrail(): Promise<void>;
}

// =============================================================================
// DEFAULT RESOLVER (TIMESTAMP-BASED)
// =============================================================================

/**
 * Default conflict resolver that uses timestamp comparison.
 * Most recent timestamp wins, both versions preserved in audit.
 */
export class TimestampConflictResolver implements ConflictResolver {
  private auditTrail: ConflictAuditRecord[] = [];
  private maxAuditSize: number;

  constructor(maxAuditSize = 1000) {
    this.maxAuditSize = maxAuditSize;
  }

  async resolve(
    localStatement: XAPIStatement,
    remoteStatement?: XAPIStatement,
  ): Promise<ConflictResolution> {
    // No remote statement = no conflict, use local
    if (!remoteStatement) {
      const resolution: ConflictResolution = {
        action: 'use_local',
        resolvedStatement: localStatement,
        localStatement,
        reason: 'No remote statement exists',
      };

      return resolution;
    }

    // Same statement ID - actual conflict
    const localTimestamp = this.parseTimestamp(localStatement.timestamp);
    const remoteTimestamp = this.parseTimestamp(remoteStatement.timestamp);

    let resolution: ConflictResolution;

    if (localTimestamp > remoteTimestamp) {
      // Local is newer
      resolution = {
        action: 'use_local',
        resolvedStatement: localStatement,
        localStatement,
        remoteStatement,
        reason: `Local timestamp (${localStatement.timestamp}) is more recent than remote (${remoteStatement.timestamp})`,
      };
    } else if (remoteTimestamp > localTimestamp) {
      // Remote is newer
      resolution = {
        action: 'use_remote',
        resolvedStatement: remoteStatement,
        localStatement,
        remoteStatement,
        reason: `Remote timestamp (${remoteStatement.timestamp}) is more recent than local (${localStatement.timestamp})`,
      };
    } else {
      // Same timestamp - merge if possible, otherwise use local (local user's intent)
      resolution = this.attemptMerge(localStatement, remoteStatement);
    }

    // Record in audit trail
    this.recordAudit(resolution);

    return resolution;
  }

  async getAuditTrail(): Promise<ConflictAuditRecord[]> {
    return [...this.auditTrail];
  }

  async clearAuditTrail(): Promise<void> {
    this.auditTrail = [];
  }

  // ---------------------------------------------------------------------------
  // PRIVATE METHODS
  // ---------------------------------------------------------------------------

  private parseTimestamp(timestamp?: string): number {
    if (!timestamp) {
      return 0;
    }

    const parsed = new Date(timestamp).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private attemptMerge(
    localStatement: XAPIStatement,
    remoteStatement: XAPIStatement,
  ): ConflictResolution {
    // For xAPI statements, merging is complex due to the semantic nature
    // We prefer local for same-timestamp conflicts (user intent)
    // but preserve both in the audit trail

    const mergedStatement: XAPIStatement = {
      ...localStatement,
      // Add extension to indicate this was a merged resolution
      context: {
        ...localStatement.context,
        extensions: {
          ...localStatement.context?.extensions,
          'https://lxd360.com/xapi/extensions/conflictResolved': true,
          'https://lxd360.com/xapi/extensions/mergeTimestamp': new Date().toISOString(),
        },
      },
    };

    return {
      action: 'merge',
      resolvedStatement: mergedStatement,
      localStatement,
      remoteStatement,
      reason: 'Same timestamp - merged with local preference, both preserved in audit',
    };
  }

  private recordAudit(resolution: ConflictResolution): void {
    const record: ConflictAuditRecord = {
      id: crypto.randomUUID(),
      statementId: resolution.localStatement.id || 'unknown',
      resolvedAt: new Date().toISOString(),
      action: resolution.action,
      localStatement: resolution.localStatement,
      remoteStatement: resolution.remoteStatement,
      resolvedStatement: resolution.resolvedStatement,
      reason: resolution.reason,
    };

    this.auditTrail.push(record);

    // Trim audit trail if too large
    if (this.auditTrail.length > this.maxAuditSize) {
      this.auditTrail = this.auditTrail.slice(-this.maxAuditSize);
    }
  }
}

// =============================================================================
// LAST-WRITE-WINS RESOLVER
// =============================================================================

/**
 * Simple last-write-wins resolver that always uses the local statement.
 * Useful when you want to ensure offline changes are always preserved.
 */
export class LastWriteWinsResolver implements ConflictResolver {
  private auditTrail: ConflictAuditRecord[] = [];

  async resolve(
    localStatement: XAPIStatement,
    remoteStatement?: XAPIStatement,
  ): Promise<ConflictResolution> {
    const resolution: ConflictResolution = {
      action: 'use_local',
      resolvedStatement: localStatement,
      localStatement,
      remoteStatement,
      reason: 'Last-write-wins: local statement always takes precedence',
    };

    if (remoteStatement) {
      this.recordAudit(resolution);
    }

    return resolution;
  }

  async getAuditTrail(): Promise<ConflictAuditRecord[]> {
    return [...this.auditTrail];
  }

  async clearAuditTrail(): Promise<void> {
    this.auditTrail = [];
  }

  private recordAudit(resolution: ConflictResolution): void {
    const record: ConflictAuditRecord = {
      id: crypto.randomUUID(),
      statementId: resolution.localStatement.id || 'unknown',
      resolvedAt: new Date().toISOString(),
      action: resolution.action,
      localStatement: resolution.localStatement,
      remoteStatement: resolution.remoteStatement,
      resolvedStatement: resolution.resolvedStatement,
      reason: resolution.reason,
    };

    this.auditTrail.push(record);
  }
}

// =============================================================================
// SCORE-PRESERVING RESOLVER
// =============================================================================

/**
 * Resolver that preserves the highest score for assessment statements.
 * Falls back to timestamp comparison for non-assessment statements.
 */
export class ScorePreservingResolver implements ConflictResolver {
  private timestampResolver: TimestampConflictResolver;
  private auditTrail: ConflictAuditRecord[] = [];

  constructor() {
    this.timestampResolver = new TimestampConflictResolver();
  }

  async resolve(
    localStatement: XAPIStatement,
    remoteStatement?: XAPIStatement,
  ): Promise<ConflictResolution> {
    // No remote = no conflict
    if (!remoteStatement) {
      return this.timestampResolver.resolve(localStatement);
    }

    // Check if this is a scored statement
    const localScore = localStatement.result?.score?.scaled;
    const remoteScore = remoteStatement.result?.score?.scaled;

    if (localScore !== undefined && remoteScore !== undefined) {
      // Both have scores - use highest
      let resolution: ConflictResolution;

      if (localScore >= remoteScore) {
        resolution = {
          action: 'use_local',
          resolvedStatement: localStatement,
          localStatement,
          remoteStatement,
          reason: `Local score (${localScore}) >= remote score (${remoteScore})`,
        };
      } else {
        resolution = {
          action: 'use_remote',
          resolvedStatement: remoteStatement,
          localStatement,
          remoteStatement,
          reason: `Remote score (${remoteScore}) > local score (${localScore})`,
        };
      }

      this.recordAudit(resolution);
      return resolution;
    }

    // Not a scored statement, use timestamp comparison
    return this.timestampResolver.resolve(localStatement, remoteStatement);
  }

  async getAuditTrail(): Promise<ConflictAuditRecord[]> {
    const timestampAudit = await this.timestampResolver.getAuditTrail();
    return [...this.auditTrail, ...timestampAudit];
  }

  async clearAuditTrail(): Promise<void> {
    this.auditTrail = [];
    await this.timestampResolver.clearAuditTrail();
  }

  private recordAudit(resolution: ConflictResolution): void {
    const record: ConflictAuditRecord = {
      id: crypto.randomUUID(),
      statementId: resolution.localStatement.id || 'unknown',
      resolvedAt: new Date().toISOString(),
      action: resolution.action,
      localStatement: resolution.localStatement,
      remoteStatement: resolution.remoteStatement,
      resolvedStatement: resolution.resolvedStatement,
      reason: resolution.reason,
    };

    this.auditTrail.push(record);
  }
}

// =============================================================================
// CUSTOM RESOLVER BUILDER
// =============================================================================

/**
 * Options for building a custom conflict resolver.
 */
export interface CustomResolverOptions {
  /** Strategy for general conflicts */
  defaultStrategy: 'timestamp' | 'last_write_wins' | 'preserve_score';
  /** Custom resolver function for specific verb types */
  verbHandlers?: Record<string, (local: XAPIStatement, remote?: XAPIStatement) => ConflictAction>;
  /** Maximum audit trail size */
  maxAuditSize?: number;
}

/**
 * Creates a custom conflict resolver based on options.
 */
export function createCustomResolver(options: CustomResolverOptions): ConflictResolver {
  const baseResolver =
    options.defaultStrategy === 'timestamp'
      ? new TimestampConflictResolver(options.maxAuditSize)
      : options.defaultStrategy === 'preserve_score'
        ? new ScorePreservingResolver()
        : new LastWriteWinsResolver();

  if (!options.verbHandlers || Object.keys(options.verbHandlers).length === 0) {
    return baseResolver;
  }

  // Wrap with verb-specific handling
  return {
    async resolve(
      localStatement: XAPIStatement,
      remoteStatement?: XAPIStatement,
    ): Promise<ConflictResolution> {
      const verbId = localStatement.verb.id;
      const handler = options.verbHandlers?.[verbId];

      if (handler && remoteStatement) {
        const action = handler(localStatement, remoteStatement);

        return {
          action,
          resolvedStatement: action === 'use_local' ? localStatement : remoteStatement,
          localStatement,
          remoteStatement,
          reason: `Custom handler for verb: ${verbId}`,
        };
      }

      return baseResolver.resolve(localStatement, remoteStatement);
    },

    getAuditTrail: () => baseResolver.getAuditTrail(),
    clearAuditTrail: () => baseResolver.clearAuditTrail(),
  };
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Creates the default conflict resolver.
 * Uses timestamp comparison with score preservation.
 */
export function createDefaultResolver(): ConflictResolver {
  return new ScorePreservingResolver();
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if two statements represent the same learning event.
 * Used to determine if a conflict exists.
 */
export function statementsMatch(a: XAPIStatement, b: XAPIStatement): boolean {
  // Same statement ID = same statement
  if (a.id && b.id && a.id === b.id) {
    return true;
  }

  // Same actor, verb, object, and close timestamps = likely same event
  const sameActor = actorsMatch(a.actor, b.actor);
  const sameVerb = a.verb.id === b.verb.id;

  // Safely access object.id (may not exist on all object types)
  const aObjectId = 'id' in a.object ? a.object.id : undefined;
  const bObjectId = 'id' in b.object ? b.object.id : undefined;
  const sameObject = aObjectId && bObjectId && aObjectId === bObjectId;

  if (!sameActor || !sameVerb || !sameObject) {
    return false;
  }

  // Check if timestamps are within 5 seconds of each other
  const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
  const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;

  return Math.abs(aTime - bTime) < 5000;
}

/**
 * Checks if two actors represent the same entity.
 */
function actorsMatch(a: XAPIStatement['actor'], b: XAPIStatement['actor']): boolean {
  if (a.mbox && b.mbox) {
    return a.mbox === b.mbox;
  }

  if (a.account && b.account) {
    return a.account.homePage === b.account.homePage && a.account.name === b.account.name;
  }

  if (a.openid && b.openid) {
    return a.openid === b.openid;
  }

  if (a.mbox_sha1sum && b.mbox_sha1sum) {
    return a.mbox_sha1sum === b.mbox_sha1sum;
  }

  return false;
}
