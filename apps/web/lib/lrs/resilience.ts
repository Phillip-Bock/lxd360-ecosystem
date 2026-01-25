/**
 * LRS Resilience Layer
 *
 * Dead Letter Queue pattern for failed xAPI statement ingestion.
 * If BigQuery write fails, statements are queued in Firestore for retry.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { requireDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';

const log = logger.scope('LRSResilience');

// =============================================================================
// TYPES
// =============================================================================

export interface FailedStatement {
  id?: string;
  statement: Record<string, unknown>;
  error: string;
  retryCount: number;
  createdAt: Timestamp;
  lastRetryAt?: Timestamp;
  organizationId: string;
}

export interface QueueStats {
  total: number;
  retriable: number;
  exhausted: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FAILED_STATEMENTS_COLLECTION = 'failed_xapi_statements';
const MAX_RETRY_COUNT = 5;
const BATCH_SIZE = 50;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Queue a failed statement for later retry
 */
export async function queueFailedStatement(
  statement: Record<string, unknown>,
  error: string,
  organizationId: string,
): Promise<string> {
  try {
    const db = requireDb();
    const docRef = await addDoc(collection(db, FAILED_STATEMENTS_COLLECTION), {
      statement,
      error,
      retryCount: 0,
      createdAt: serverTimestamp(),
      organizationId,
    });

    log.warn('Statement queued for retry', {
      docId: docRef.id,
      error,
      organizationId,
    });

    return docRef.id;
  } catch (queueError) {
    log.error('Failed to queue statement', queueError);
    throw queueError;
  }
}

/**
 * Get statements ready for retry
 */
export async function getStatementsForRetry(organizationId?: string): Promise<FailedStatement[]> {
  try {
    const db = requireDb();
    const q = query(
      collection(db, FAILED_STATEMENTS_COLLECTION),
      where('retryCount', '<', MAX_RETRY_COUNT),
      orderBy('createdAt', 'asc'),
      limit(BATCH_SIZE),
    );

    const snapshot = await getDocs(q);

    const statements: FailedStatement[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as Omit<FailedStatement, 'id'>;
      // Filter by organizationId in memory if provided
      if (!organizationId || data.organizationId === organizationId) {
        statements.push({ id: docSnapshot.id, ...data });
      }
    });

    log.debug('Retrieved statements for retry', { count: statements.length });

    return statements;
  } catch (error) {
    log.error('Failed to retrieve retry queue', error);
    return [];
  }
}

/**
 * Mark a statement as successfully processed (remove from queue)
 */
export async function markStatementProcessed(docId: string): Promise<void> {
  try {
    const db = requireDb();
    await deleteDoc(doc(db, FAILED_STATEMENTS_COLLECTION, docId));
    log.debug('Statement removed from retry queue', { docId });
  } catch (error) {
    log.error('Failed to remove processed statement', error);
  }
}

/**
 * Increment retry count for a failed statement
 */
export async function incrementRetryCount(docId: string, newError: string): Promise<void> {
  try {
    const db = requireDb();
    const docRef = doc(db, FAILED_STATEMENTS_COLLECTION, docId);
    await updateDoc(docRef, {
      retryCount: (await getDocs(query(collection(db, FAILED_STATEMENTS_COLLECTION)))).docs
        .find((d) => d.id === docId)
        ?.data().retryCount
        ? ((await getDocs(query(collection(db, FAILED_STATEMENTS_COLLECTION)))).docs
            .find((d) => d.id === docId)
            ?.data().retryCount as number) + 1
        : 1,
      lastRetryAt: serverTimestamp(),
      error: newError,
    });
    log.warn('Retry failed, count incremented', { docId, error: newError });
  } catch (error) {
    log.error('Failed to update retry count', error);
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(organizationId?: string): Promise<QueueStats> {
  try {
    const db = requireDb();
    const allDocs = await getDocs(collection(db, FAILED_STATEMENTS_COLLECTION));

    let total = 0;
    let retriable = 0;
    let exhausted = 0;

    allDocs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (!organizationId || data.organizationId === organizationId) {
        total++;
        if ((data.retryCount as number) < MAX_RETRY_COUNT) {
          retriable++;
        } else {
          exhausted++;
        }
      }
    });

    return { total, retriable, exhausted };
  } catch (error) {
    log.error('Failed to get queue stats', error);
    return { total: 0, retriable: 0, exhausted: 0 };
  }
}

/**
 * Wrapper for LRS send with automatic fallback
 */
export async function sendToLRSWithFallback(
  statement: Record<string, unknown>,
  organizationId: string,
  sendFn: (stmt: Record<string, unknown>) => Promise<void>,
): Promise<{ success: boolean; queued: boolean }> {
  try {
    await sendFn(statement);
    return { success: true, queued: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log.warn('LRS send failed, queueing for retry', {
      error: errorMessage,
      organizationId,
    });

    await queueFailedStatement(statement, errorMessage, organizationId);
    return { success: false, queued: true };
  }
}

/**
 * Process retry queue in batches
 */
export async function processRetryQueue(
  organizationId: string,
  sendFn: (stmt: Record<string, unknown>) => Promise<void>,
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const statements = await getStatementsForRetry(organizationId);

  let succeeded = 0;
  let failed = 0;

  for (const failedStmt of statements) {
    try {
      await sendFn(failedStmt.statement);
      if (failedStmt.id) {
        await markStatementProcessed(failedStmt.id);
      }
      succeeded++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (failedStmt.id) {
        await incrementRetryCount(failedStmt.id, errorMessage);
      }
      failed++;
    }
  }

  log.info('Retry queue processed', {
    organizationId,
    processed: statements.length,
    succeeded,
    failed,
  });

  return { processed: statements.length, succeeded, failed };
}

/**
 * Clear exhausted statements (those that have exceeded max retries)
 */
export async function clearExhaustedStatements(organizationId?: string): Promise<number> {
  try {
    const db = requireDb();
    const q = query(
      collection(db, FAILED_STATEMENTS_COLLECTION),
      where('retryCount', '>=', MAX_RETRY_COUNT),
    );

    const snapshot = await getDocs(q);
    let cleared = 0;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      if (!organizationId || data.organizationId === organizationId) {
        await deleteDoc(doc(db, FAILED_STATEMENTS_COLLECTION, docSnapshot.id));
        cleared++;
      }
    }

    log.info('Exhausted statements cleared', { cleared });
    return cleared;
  } catch (error) {
    log.error('Failed to clear exhausted statements', error);
    return 0;
  }
}
