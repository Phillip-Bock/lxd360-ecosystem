'use client';

import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';
import { useMissionStore } from '@/store/inspire';
import type { Actor, Statement } from '../types';

const log = logger.scope('StudioXAPI');

import {
  buildAIGenerationStatement,
  buildAuditStatement,
  buildBlockCreatedStatement,
  buildBlockDeletedStatement,
  buildBlockEditedStatement,
  buildBlockMovedStatement,
  buildBlockResizedStatement,
  buildExportStatement,
  buildPhaseCompletedStatement,
} from './statement-builder';
import type {
  AISuggestionOutcome,
  AuthoringVerb,
  BlockActionOptions,
  ExportFormat,
  InspirePhase,
  StudioStatementOptions,
} from './types';

// =============================================================================
// INSPIRE Studio xAPI Hooks
// =============================================================================
// React hooks for tracking content authoring activities in INSPIRE Studio.
// =============================================================================

/**
 * Queue for batching statements before sending
 */
const statementQueue: Statement[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

/**
 * Flush queued statements to the xAPI endpoint
 */
async function flushStatements(): Promise<void> {
  if (statementQueue.length === 0) return;

  const statements = [...statementQueue];
  statementQueue.length = 0;

  try {
    const response = await fetch('/api/xapi/statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statements }),
    });

    if (!response.ok) {
      log.error('Failed to send xAPI statements', { status: response.status });
      // Re-queue failed statements
      statementQueue.push(...statements);
    }
  } catch (error) {
    log.error('xAPI statement batch error', error);
    // Re-queue failed statements
    statementQueue.push(...statements);
  }
}

/**
 * Queue a statement for sending (with batching)
 */
function queueStatement(statement: Statement): void {
  statementQueue.push(statement);

  // Debounce flush
  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }
  flushTimeout = setTimeout(flushStatements, 2000);
}

/**
 * Send a statement immediately (bypassing batch queue)
 */
async function sendImmediately(statement: Statement): Promise<void> {
  try {
    const response = await fetch('/api/xapi/statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statements: [statement] }),
    });

    if (!response.ok) {
      log.error('Failed to send xAPI statement', { status: response.status });
    }
  } catch (error) {
    log.error('xAPI statement error', error);
  }
}

// =============================================================================
// useStudioXAPI Hook
// =============================================================================

export interface UseStudioXAPIOptions {
  /** Actor (author) making the actions */
  actor: Actor;

  /** Whether to enable tracking */
  enabled?: boolean;

  /** Send statements immediately instead of batching */
  immediate?: boolean;
}

export interface UseStudioXAPIReturn {
  /** Track a block action */
  trackBlockAction: (action: AuthoringVerb, options: Omit<BlockActionOptions, 'missionId'>) => void;

  /** Track phase completion */
  trackPhaseComplete: (phase: InspirePhase, options?: Partial<StudioStatementOptions>) => void;

  /** Track export/publish */
  trackExport: (
    exportId: string,
    format: ExportFormat,
    options?: Partial<StudioStatementOptions>,
  ) => void;

  /** Track QA audit action */
  trackAudit: (
    auditId: string,
    action: 'validated' | 'approved' | 'rejected',
    options?: Partial<StudioStatementOptions>,
  ) => void;

  /** Track AI content generation */
  trackAIGeneration: (
    blockId: string,
    blockType: string,
    outcome: AISuggestionOutcome,
    agentVersion?: string,
  ) => void;

  /** Flush any pending statements */
  flush: () => Promise<void>;
}

/**
 * Hook for tracking studio authoring activities via xAPI
 */
export function useStudioXAPI(options: UseStudioXAPIOptions): UseStudioXAPIReturn {
  const { actor, enabled = true, immediate = false } = options;
  const manifest = useMissionStore((state) => state.manifest);
  const missionId = manifest?.metadata?.id ?? 'unknown';

  const send = useCallback(
    (statement: Statement) => {
      if (!enabled) return;

      if (immediate) {
        sendImmediately(statement);
      } else {
        queueStatement(statement);
      }
    },
    [enabled, immediate],
  );

  const trackBlockAction = useCallback(
    (action: AuthoringVerb, blockOptions: Omit<BlockActionOptions, 'missionId'>) => {
      const fullOptions: BlockActionOptions = {
        ...blockOptions,
        missionId,
      };

      let statement: Statement;

      switch (action) {
        case 'created':
          statement = buildBlockCreatedStatement(actor, fullOptions);
          break;
        case 'edited':
          statement = buildBlockEditedStatement(actor, fullOptions);
          break;
        case 'deleted':
          statement = buildBlockDeletedStatement(actor, fullOptions);
          break;
        case 'moved':
          statement = buildBlockMovedStatement(actor, fullOptions);
          break;
        case 'resized':
          statement = buildBlockResizedStatement(actor, fullOptions);
          break;
        default:
          statement = buildBlockEditedStatement(actor, fullOptions);
      }

      send(statement);
    },
    [actor, missionId, send],
  );

  const trackPhaseComplete = useCallback(
    (phase: InspirePhase, phaseOptions?: Partial<StudioStatementOptions>) => {
      const statement = buildPhaseCompletedStatement(actor, missionId, phase, phaseOptions);
      // Phase completion is important - send immediately
      sendImmediately(statement);
    },
    [actor, missionId],
  );

  const trackExport = useCallback(
    (exportId: string, format: ExportFormat, exportOptions?: Partial<StudioStatementOptions>) => {
      const statement = buildExportStatement(actor, missionId, exportId, {
        missionId,
        export: { format, ...exportOptions?.export },
        ...exportOptions,
      });
      // Export is important - send immediately
      sendImmediately(statement);
    },
    [actor, missionId],
  );

  const trackAudit = useCallback(
    (
      auditId: string,
      action: 'validated' | 'approved' | 'rejected',
      auditOptions?: Partial<StudioStatementOptions>,
    ) => {
      const statement = buildAuditStatement(actor, missionId, auditId, action, auditOptions);
      send(statement);
    },
    [actor, missionId, send],
  );

  const trackAIGeneration = useCallback(
    (blockId: string, blockType: string, outcome: AISuggestionOutcome, agentVersion?: string) => {
      const statement = buildAIGenerationStatement(actor, missionId, blockId, blockType, {
        missionId,
        blockId,
        blockType,
        ai: {
          generated: true,
          suggestionOutcome: outcome,
          agentVersion,
        },
      });
      send(statement);
    },
    [actor, missionId, send],
  );

  const flush = useCallback(async () => {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }
    await flushStatements();
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  return {
    trackBlockAction,
    trackPhaseComplete,
    trackExport,
    trackAudit,
    trackAIGeneration,
    flush,
  };
}

// =============================================================================
// useBlockXAPI Hook
// =============================================================================

export interface UseBlockXAPIOptions {
  /** Actor (author) */
  actor: Actor;

  /** Block ID */
  blockId: string;

  /** Block type */
  blockType: string;

  /** Current phase */
  phase?: InspirePhase;

  /** Whether to enable tracking */
  enabled?: boolean;

  /** Debounce time for edit tracking (ms) */
  debounceMs?: number;
}

export interface UseBlockXAPIReturn {
  /** Track content change */
  trackContentChange: (changes: Record<string, unknown>) => void;

  /** Track config change */
  trackConfigChange: (changes: Record<string, unknown>) => void;

  /** Track position change */
  trackPositionChange: (from: { x: number; y: number }, to: { x: number; y: number }) => void;

  /** Track size change */
  trackSizeChange: (
    from: { width: number; height: number },
    to: { width: number; height: number },
  ) => void;

  /** Track deletion */
  trackDelete: () => void;
}

/**
 * Hook for tracking individual block actions via xAPI
 */
export function useBlockXAPI(options: UseBlockXAPIOptions): UseBlockXAPIReturn {
  const { actor, blockId, blockType, phase, enabled = true, debounceMs = 1000 } = options;
  const manifest = useMissionStore((state) => state.manifest);
  const missionId = manifest?.metadata?.id ?? 'unknown';

  // Debounce edit tracking
  const editTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<{
    content?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }>({});

  const flushEdits = useCallback(() => {
    if (!enabled) return;

    const { content, config } = pendingChangesRef.current;
    if (!content && !config) return;

    const statement = buildBlockEditedStatement(actor, {
      missionId,
      blockId,
      blockType,
      phase,
      contentChanges: content,
      configChanges: config,
    });

    queueStatement(statement);
    pendingChangesRef.current = {};
  }, [actor, blockId, blockType, enabled, missionId, phase]);

  const scheduleFlush = useCallback(() => {
    if (editTimeoutRef.current) {
      clearTimeout(editTimeoutRef.current);
    }
    editTimeoutRef.current = setTimeout(flushEdits, debounceMs);
  }, [debounceMs, flushEdits]);

  const trackContentChange = useCallback(
    (changes: Record<string, unknown>) => {
      if (!enabled) return;
      pendingChangesRef.current.content = {
        ...pendingChangesRef.current.content,
        ...changes,
      };
      scheduleFlush();
    },
    [enabled, scheduleFlush],
  );

  const trackConfigChange = useCallback(
    (changes: Record<string, unknown>) => {
      if (!enabled) return;
      pendingChangesRef.current.config = {
        ...pendingChangesRef.current.config,
        ...changes,
      };
      scheduleFlush();
    },
    [enabled, scheduleFlush],
  );

  const trackPositionChange = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      if (!enabled) return;
      const statement = buildBlockMovedStatement(actor, {
        missionId,
        blockId,
        blockType,
        phase,
        previousPosition: from,
        newPosition: to,
      });
      queueStatement(statement);
    },
    [actor, blockId, blockType, enabled, missionId, phase],
  );

  const trackSizeChange = useCallback(
    (from: { width: number; height: number }, to: { width: number; height: number }) => {
      if (!enabled) return;
      const statement = buildBlockResizedStatement(actor, {
        missionId,
        blockId,
        blockType,
        phase,
        previousSize: from,
        newSize: to,
      });
      queueStatement(statement);
    },
    [actor, blockId, blockType, enabled, missionId, phase],
  );

  const trackDelete = useCallback(() => {
    if (!enabled) return;
    const statement = buildBlockDeletedStatement(actor, {
      missionId,
      blockId,
      blockType,
      phase,
    });
    // Deletion is important - send immediately
    sendImmediately(statement);
  }, [actor, blockId, blockType, enabled, missionId, phase]);

  // Flush pending edits on unmount
  useEffect(() => {
    return () => {
      if (editTimeoutRef.current) {
        clearTimeout(editTimeoutRef.current);
        flushEdits();
      }
    };
  }, [flushEdits]);

  return {
    trackContentChange,
    trackConfigChange,
    trackPositionChange,
    trackSizeChange,
    trackDelete,
  };
}

// =============================================================================
// useCanvasXAPI Hook
// =============================================================================

export interface UseCanvasXAPIOptions {
  /** Actor (author) */
  actor: Actor;

  /** Whether to enable tracking */
  enabled?: boolean;
}

export interface UseCanvasXAPIReturn {
  /** Track block added */
  trackBlockAdded: (blockId: string, blockType: string, position: { x: number; y: number }) => void;

  /** Track block removed */
  trackBlockRemoved: (blockId: string, blockType: string) => void;

  /** Track canvas zoom change */
  trackZoomChange: (oldZoom: number, newZoom: number) => void;

  /** Track grid type change */
  trackGridChange: (gridType: string) => void;
}

/**
 * Hook for tracking canvas-level actions via xAPI
 */
export function useCanvasXAPI(options: UseCanvasXAPIOptions): UseCanvasXAPIReturn {
  const { actor, enabled = true } = options;
  const manifest = useMissionStore((state) => state.manifest);
  const missionId = manifest?.metadata?.id ?? 'unknown';

  const trackBlockAdded = useCallback(
    (blockId: string, blockType: string, position: { x: number; y: number }) => {
      if (!enabled) return;
      const statement = buildBlockCreatedStatement(actor, {
        missionId,
        blockId,
        blockType,
        phase: 'assimilation',
        newPosition: position,
      });
      queueStatement(statement);
    },
    [actor, enabled, missionId],
  );

  const trackBlockRemoved = useCallback(
    (blockId: string, blockType: string) => {
      if (!enabled) return;
      const statement = buildBlockDeletedStatement(actor, {
        missionId,
        blockId,
        blockType,
        phase: 'assimilation',
      });
      queueStatement(statement);
    },
    [actor, enabled, missionId],
  );

  const trackZoomChange = useCallback(
    (oldZoom: number, newZoom: number) => {
      if (!enabled) return;
      // Zoom changes are low priority - analytics only
      void oldZoom;
      void newZoom;
    },
    [enabled],
  );

  const trackGridChange = useCallback(
    (gridType: string) => {
      if (!enabled) return;
      // Grid changes are low priority - analytics only
      void gridType;
    },
    [enabled],
  );

  return {
    trackBlockAdded,
    trackBlockRemoved,
    trackZoomChange,
    trackGridChange,
  };
}
