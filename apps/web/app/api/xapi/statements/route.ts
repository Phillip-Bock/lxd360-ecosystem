/**
 * xAPI Statements API Route
 *
 * Handles xAPI statement ingestion with validation, enrichment,
 * and dual-write to Firestore (real-time) and Pub/Sub (async processing).
 *
 * @route POST /api/xapi/statements
 * @route GET /api/xapi/statements (query)
 *
 * @see xAPI 1.0.3 Specification
 * @see EU AI Act: All AI-influenced statements logged with consent tier
 */

export const dynamic = 'force-dynamic';

import { PubSub } from '@google-cloud/pubsub';
// Import from @inspire/xapi-client package
import {
  INSPIRE_EXTENSIONS,
  type Statement,
  StatementSchema,
  validateStatement,
} from '@inspire/xapi-client';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const log = logger.scope('xAPIStatements');

// ============================================================================
// FIREBASE ADMIN INITIALIZATION
// ============================================================================

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Initialize with credentials from environment
  return initializeApp({
    credential: cert({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminApp = getAdminApp();
const db = getFirestore(adminApp);

// ============================================================================
// PUB/SUB INITIALIZATION
// ============================================================================

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const PUBSUB_TOPIC = process.env.XAPI_PUBSUB_TOPIC || 'xapi-statements';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BIGQUERY_FUNCTION_URL = process.env.XAPI_BIGQUERY_FUNCTION_URL;
const REQUIRE_CONSENT_TIER = process.env.REQUIRE_CONSENT_TIER !== 'false';
const MAX_BATCH_SIZE = 100;
const ENABLE_FIRESTORE_WRITE = process.env.ENABLE_FIRESTORE_WRITE !== 'false';
const ENABLE_PUBSUB_PUBLISH = process.env.ENABLE_PUBSUB_PUBLISH !== 'false';

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

const SingleStatementSchema = z.object({
  statement: StatementSchema,
});

const BatchStatementSchema = z.object({
  statements: z.array(StatementSchema).min(1).max(MAX_BATCH_SIZE),
});

const RequestSchema = z.union([SingleStatementSchema, BatchStatementSchema]);

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface IngestionResult {
  statementId: string;
  status: 'accepted' | 'rejected';
  error?: string;
}

interface IngestionResponse {
  success: boolean;
  data?: {
    statementIds: string[];
    accepted: number;
    rejected: number;
    results?: IngestionResult[];
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin':
    process.env.ALLOWED_ORIGINS?.split(',')[0] || 'https://app.lxd360.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Experience-API-Version, X-Tenant-ID, X-Session-ID',
  'Access-Control-Expose-Headers': 'X-Experience-API-Consistent-Through',
  'X-Experience-API-Version': '1.0.3',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extract tenant ID from request
 */
function getTenantId(request: NextRequest): string | null {
  return request.headers.get('x-tenant-id') || request.headers.get('X-Tenant-ID');
}

/**
 * Extract session ID from request
 */
function getSessionId(request: NextRequest): string | null {
  return request.headers.get('x-session-id') || request.headers.get('X-Session-ID');
}

/**
 * Extract consent tier from statement extensions
 */
function getConsentTier(statement: Statement): number | null {
  const extensions = statement.context?.extensions;
  if (!extensions) return null;

  const consentTier = extensions[INSPIRE_EXTENSIONS.CONSENT_TIER];
  if (typeof consentTier === 'number' && consentTier >= 0 && consentTier <= 3) {
    return consentTier;
  }
  return null;
}

/**
 * Extract INSPIRE extensions from statement
 */
function extractInspireExtensions(statement: Statement): Record<string, unknown> {
  const contextExt = statement.context?.extensions || {};
  const resultExt = statement.result?.extensions || {};

  return {
    sessionId: contextExt[INSPIRE_EXTENSIONS.SESSION_ID],
    skillId: contextExt[INSPIRE_EXTENSIONS.SKILL_ID] || resultExt[INSPIRE_EXTENSIONS.SKILL_ID],
    blockId: contextExt[INSPIRE_EXTENSIONS.BLOCK_ID],
    blockType: contextExt[INSPIRE_EXTENSIONS.BLOCK_TYPE],
    latency: resultExt[INSPIRE_EXTENSIONS.LATENCY],
    cognitiveLoad: resultExt[INSPIRE_EXTENSIONS.COGNITIVE_LOAD],
    consentTier: contextExt[INSPIRE_EXTENSIONS.CONSENT_TIER],
    modality: contextExt[INSPIRE_EXTENSIONS.MODALITY],
    masteryEstimate: resultExt[INSPIRE_EXTENSIONS.MASTERY_ESTIMATE],
    functionalState: contextExt[INSPIRE_EXTENSIONS.FUNCTIONAL_STATE],
    aiRecommended: contextExt[INSPIRE_EXTENSIONS.AI_RECOMMENDED],
    learnerOverride: contextExt[INSPIRE_EXTENSIONS.LEARNER_OVERRIDE],
    hesitationCount: resultExt[INSPIRE_EXTENSIONS.HESITATION_COUNT],
    depth: resultExt[INSPIRE_EXTENSIONS.DEPTH],
  };
}

/**
 * Enrich statement with server-side metadata
 */
function enrichStatement(
  statement: Statement,
  tenantId: string | null,
  sessionId: string | null,
): Statement {
  const now = new Date().toISOString();

  // Ensure statement has an ID
  const enrichedStatement: Statement = {
    ...statement,
    id: statement.id || generateUUID(),
    timestamp: statement.timestamp || now,
    stored: now,
    version: statement.version || '1.0.3',
  };

  // Add tenant and session to context extensions if not present
  if (tenantId || sessionId) {
    const existingExtensions = enrichedStatement.context?.extensions || {};

    enrichedStatement.context = {
      ...enrichedStatement.context,
      extensions: {
        ...existingExtensions,
        ...(sessionId && !existingExtensions[INSPIRE_EXTENSIONS.SESSION_ID]
          ? { [INSPIRE_EXTENSIONS.SESSION_ID]: sessionId }
          : {}),
      },
    };
  }

  return enrichedStatement;
}

/**
 * Extract actor identifier
 */
function getActorId(statement: Statement): string {
  if ('mbox' in statement.actor && statement.actor.mbox) {
    return statement.actor.mbox.replace('mailto:', '');
  }
  if ('account' in statement.actor && statement.actor.account) {
    return statement.actor.account.name;
  }
  if ('mbox_sha1sum' in statement.actor && statement.actor.mbox_sha1sum) {
    return statement.actor.mbox_sha1sum;
  }
  if ('openid' in statement.actor && statement.actor.openid) {
    return statement.actor.openid;
  }
  return 'unknown';
}

// ============================================================================
// FIRESTORE WRITE
// ============================================================================

/**
 * Write statement to Firestore for real-time access
 */
async function writeToFirestore(
  statement: Statement,
  tenantId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!ENABLE_FIRESTORE_WRITE) {
    return { success: true };
  }

  try {
    const actorId = getActorId(statement);
    const inspireExt = extractInspireExtensions(statement);

    // Write to tenants/{tenantId}/statements/{statementId}
    const statementRef = db
      .collection('tenants')
      .doc(tenantId)
      .collection('statements')
      .doc(statement.id || generateUUID());

    await statementRef.set({
      id: statement.id,
      tenantId,
      actorId,
      actorName: statement.actor.name || null,
      verbId: statement.verb.id,
      verbDisplay: statement.verb.display?.['en-US'] || null,
      objectId: 'id' in statement.object ? statement.object.id : null,
      objectType: 'objectType' in statement.object ? statement.object.objectType : 'Activity',
      objectName:
        'definition' in statement.object
          ? statement.object.definition?.name?.['en-US'] || null
          : null,
      resultSuccess: statement.result?.success ?? null,
      resultCompletion: statement.result?.completion ?? null,
      resultScoreScaled: statement.result?.score?.scaled ?? null,
      resultScoreRaw: statement.result?.score?.raw ?? null,
      resultDuration: statement.result?.duration ?? null,
      resultResponse: statement.result?.response ?? null,
      contextRegistration: statement.context?.registration ?? null,
      // INSPIRE extensions denormalized
      sessionId: inspireExt.sessionId ?? null,
      skillId: inspireExt.skillId ?? null,
      blockId: inspireExt.blockId ?? null,
      blockType: inspireExt.blockType ?? null,
      latencyMs: inspireExt.latency ?? null,
      cognitiveLoad: inspireExt.cognitiveLoad ?? null,
      consentTier: inspireExt.consentTier ?? null,
      modality: inspireExt.modality ?? null,
      masteryEstimate: inspireExt.masteryEstimate ?? null,
      functionalState: inspireExt.functionalState ?? null,
      aiRecommended: inspireExt.aiRecommended ?? null,
      learnerOverride: inspireExt.learnerOverride ?? null,
      hesitationCount: inspireExt.hesitationCount ?? null,
      // Timestamps
      timestamp: statement.timestamp ? Timestamp.fromDate(new Date(statement.timestamp)) : null,
      stored: FieldValue.serverTimestamp(),
      // Raw statement for compliance
      rawStatement: statement,
    });

    // Also write to learner interactions subcollection for quick access
    if (inspireExt.skillId || statement.result?.success !== undefined) {
      const interactionRef = db
        .collection('tenants')
        .doc(tenantId)
        .collection('learners')
        .doc(actorId)
        .collection('interactions')
        .doc(statement.id || generateUUID());

      await interactionRef.set({
        id: statement.id,
        tenantId,
        learnerId: actorId,
        activityId: 'id' in statement.object ? statement.object.id : null,
        activityType:
          'definition' in statement.object ? (statement.object.definition?.type ?? null) : null,
        blockId: inspireExt.blockId ?? null,
        blockType: inspireExt.blockType ?? null,
        verb: statement.verb.id,
        success: statement.result?.success ?? null,
        completion: statement.result?.completion ?? null,
        scoreScaled: statement.result?.score?.scaled ?? null,
        response: statement.result?.response ?? null,
        latencyMs: inspireExt.latency ?? null,
        skillId: inspireExt.skillId ?? null,
        sessionId: inspireExt.sessionId ?? null,
        timestamp: statement.timestamp ? Timestamp.fromDate(new Date(statement.timestamp)) : null,
        xapiStatementId: statement.id,
      });
    }

    return { success: true };
  } catch (error) {
    log.error('Firestore write error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Firestore error',
    };
  }
}

// ============================================================================
// PUB/SUB PUBLISH
// ============================================================================

/**
 * Publish statement to Pub/Sub for async processing
 */
async function publishToPubSub(
  statement: Statement,
  tenantId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!ENABLE_PUBSUB_PUBLISH) {
    return { success: true };
  }

  try {
    const topic = pubsub.topic(PUBSUB_TOPIC);
    const messageData = Buffer.from(JSON.stringify(statement));

    await topic.publishMessage({
      data: messageData,
      attributes: {
        tenantId,
        statementId: statement.id || '',
        verbId: statement.verb.id,
      },
    });

    return { success: true };
  } catch (error) {
    log.error('Pub/Sub publish error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Pub/Sub error',
    };
  }
}

// ============================================================================
// BIGQUERY (LEGACY - KEPT FOR BACKWARD COMPATIBILITY)
// ============================================================================

/**
 * Transform statement to BigQuery row format
 */
function transformToBigQueryRow(
  statement: Statement,
  tenantId: string | null,
  sessionId: string | null,
): Record<string, unknown> {
  const inspireExt = extractInspireExtensions(statement);
  const actorId = getActorId(statement);

  // Extract object details
  let objectId = '';
  let objectType = 'Activity';
  let objectName: string | null = null;

  if ('id' in statement.object) {
    objectId = statement.object.id;
  }
  if ('objectType' in statement.object && statement.object.objectType) {
    objectType = statement.object.objectType;
  }
  if ('definition' in statement.object && statement.object.definition?.name) {
    objectName =
      statement.object.definition.name['en-US'] ||
      Object.values(statement.object.definition.name)[0] ||
      null;
  }

  return {
    statement_id: statement.id,
    tenant_id: tenantId,
    session_id: sessionId || inspireExt.sessionId,

    // Actor
    actor_id: actorId,
    actor_name: statement.actor.name || null,
    actor_email: 'mbox' in statement.actor ? statement.actor.mbox : null,

    // Verb
    verb_id: statement.verb.id,
    verb_display: statement.verb.display?.['en-US'] || null,

    // Object
    object_id: objectId,
    object_type: objectType,
    object_name: objectName,

    // Result
    result_success: statement.result?.success ?? null,
    result_completion: statement.result?.completion ?? null,
    result_score_scaled: statement.result?.score?.scaled ?? null,
    result_score_raw: statement.result?.score?.raw ?? null,
    result_duration: statement.result?.duration ?? null,

    // Context
    context_registration: statement.context?.registration ?? null,
    context_platform: statement.context?.platform ?? null,

    // INSPIRE Extensions (denormalized for BigQuery ML)
    ext_latency: inspireExt.latency ?? null,
    ext_depth: inspireExt.depth ?? null,
    ext_modality: inspireExt.modality ?? null,
    ext_skill_id: inspireExt.skillId ?? null,
    ext_mastery_estimate: inspireExt.masteryEstimate ?? null,
    ext_cognitive_load: inspireExt.cognitiveLoad ?? null,
    ext_functional_state: inspireExt.functionalState ?? null,
    ext_consent_tier: inspireExt.consentTier ?? null,
    ext_ai_recommended: inspireExt.aiRecommended ?? null,
    ext_learner_override: inspireExt.learnerOverride ?? null,
    ext_block_id: inspireExt.blockId ?? null,
    ext_block_type: inspireExt.blockType ?? null,

    // Timestamps
    timestamp: statement.timestamp,
    stored: statement.stored,

    // Raw statement for compliance
    raw_statement: JSON.stringify(statement),
  };
}

/**
 * Send statements to BigQuery via Cloud Function (legacy path)
 */
async function sendToBigQuery(
  rows: Record<string, unknown>[],
  tenantId: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!BIGQUERY_FUNCTION_URL) {
    // BigQuery function not configured - using Pub/Sub path instead
    return { success: true };
  }

  try {
    const response = await fetch(BIGQUERY_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: rows,
        organizationId: tenantId || 'default',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `BigQuery function error: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending to BigQuery',
    };
  }
}

// ============================================================================
// OPTIONS - CORS Preflight
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ============================================================================
// POST - Store Statement(s)
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tenantId = getTenantId(request);
  const sessionId = getSessionId(request);

  // Require tenant ID for multi-tenant isolation
  if (!tenantId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_TENANT_ID',
          message: 'X-Tenant-ID header is required for multi-tenant isolation',
        },
      } satisfies IngestionResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON',
        },
      } satisfies IngestionResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  // Parse and validate request using @inspire/xapi-client schemas
  const parseResult = RequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid xAPI statement format',
          details: parseResult.error.flatten(),
        },
      } satisfies IngestionResponse,
      { status: 400, headers: corsHeaders },
    );
  }

  // Extract statements (single or batch)
  const statements: Statement[] =
    'statement' in parseResult.data ? [parseResult.data.statement] : parseResult.data.statements;

  // Validate and process each statement
  const results: IngestionResult[] = [];
  const acceptedRows: Record<string, unknown>[] = [];
  const acceptedStatements: Statement[] = [];

  for (const statement of statements) {
    // Additional validation using @inspire/xapi-client validator
    const validation = validateStatement(statement);
    if (!validation.valid) {
      results.push({
        statementId: statement.id || 'unknown',
        status: 'rejected',
        error: `Validation failed: ${validation.errors?.join(', ')}`,
      });
      continue;
    }

    // EU AI Act: Require consent tier for AI-influenced learning
    if (REQUIRE_CONSENT_TIER) {
      const consentTier = getConsentTier(statement);
      if (consentTier === null) {
        results.push({
          statementId: statement.id || 'unknown',
          status: 'rejected',
          error: 'Missing consent_tier extension (EU AI Act compliance)',
        });
        continue;
      }
    }

    // Enrich statement
    const enriched = enrichStatement(statement, tenantId, sessionId);

    // Transform to BigQuery row (for legacy path)
    const row = transformToBigQueryRow(enriched, tenantId, sessionId);
    acceptedRows.push(row);
    acceptedStatements.push(enriched);

    results.push({
      statementId: enriched.id ?? '',
      status: 'accepted',
    });
  }

  // Process accepted statements with dual-write
  if (acceptedStatements.length > 0) {
    // Parallel writes to Firestore, Pub/Sub, and BigQuery (legacy)
    const writePromises: Promise<{ success: boolean; error?: string }>[] = [];

    // Write each statement to Firestore
    for (const statement of acceptedStatements) {
      writePromises.push(writeToFirestore(statement, tenantId));
    }

    // Publish each statement to Pub/Sub
    for (const statement of acceptedStatements) {
      writePromises.push(publishToPubSub(statement, tenantId));
    }

    // Send to BigQuery via Cloud Function (legacy path, if configured)
    if (BIGQUERY_FUNCTION_URL) {
      writePromises.push(sendToBigQuery(acceptedRows, tenantId));
    }

    // Wait for all writes to complete
    const writeResults = await Promise.allSettled(writePromises);

    // Log any failures (but don't fail the request)
    writeResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        log.error('Write operation failed', result.reason, { operationIndex: index });
      } else if (!result.value.success) {
        log.error('Write operation returned error', {
          operationIndex: index,
          error: result.value.error,
        });
      }
    });
  }

  const accepted = results.filter((r) => r.status === 'accepted').length;
  const rejected = results.filter((r) => r.status === 'rejected').length;

  // Determine response status
  let status = 200;
  if (rejected > 0 && accepted > 0) {
    status = 207; // Multi-Status
  } else if (rejected > 0 && accepted === 0) {
    status = 400;
  }

  return NextResponse.json(
    {
      success: rejected === 0,
      data: {
        statementIds: results.filter((r) => r.status === 'accepted').map((r) => r.statementId),
        accepted,
        rejected,
        results: rejected > 0 ? results : undefined, // Only include details if there were rejections
      },
    } satisfies IngestionResponse,
    { status, headers: corsHeaders },
  );
}

// ============================================================================
// GET - Query Statements
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenantId = getTenantId(request);

  if (!tenantId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_TENANT_ID',
          message: 'X-Tenant-ID header is required',
        },
      },
      { status: 400, headers: corsHeaders },
    );
  }

  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const statementId = searchParams.get('statementId');
  const agent = searchParams.get('agent');
  const verb = searchParams.get('verb');
  const activity = searchParams.get('activity');
  const since = searchParams.get('since');
  const until = searchParams.get('until');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 25;

  try {
    // Query Firestore for statements
    let query = db
      .collection('tenants')
      .doc(tenantId)
      .collection('statements')
      .orderBy('stored', 'desc')
      .limit(limit);

    // Filter by statementId if provided
    if (statementId) {
      const doc = await db
        .collection('tenants')
        .doc(tenantId)
        .collection('statements')
        .doc(statementId)
        .get();

      if (!doc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Statement ${statementId} not found`,
            },
          },
          { status: 404, headers: corsHeaders },
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            statements: [doc.data()?.rawStatement],
            more: false,
          },
        },
        { status: 200, headers: corsHeaders },
      );
    }

    // Apply filters
    if (verb) {
      query = query.where('verbId', '==', verb);
    }
    if (activity) {
      query = query.where('objectId', '==', activity);
    }
    if (agent) {
      query = query.where('actorId', '==', agent);
    }
    if (since) {
      query = query.where('timestamp', '>=', Timestamp.fromDate(new Date(since)));
    }
    if (until) {
      query = query.where('timestamp', '<=', Timestamp.fromDate(new Date(until)));
    }

    const snapshot = await query.get();
    const statements = snapshot.docs.map((doc) => doc.data()?.rawStatement).filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        data: {
          statements,
          more: statements.length === limit,
        },
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    log.error('Statement query error', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QUERY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown query error',
        },
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

// ============================================================================
// PUT - Store Statement with specific ID
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const statementId = searchParams.get('statementId');

  if (!statementId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_STATEMENT_ID',
          message: 'statementId query parameter is required for PUT',
        },
      },
      { status: 400, headers: corsHeaders },
    );
  }

  // Delegate to POST with the statement ID
  const body = await request.json();
  if (body.statement) {
    body.statement.id = statementId;
  }

  // Create a new request with modified body
  const modifiedRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(body),
  });

  return POST(modifiedRequest);
}
