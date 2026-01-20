/**
 * xAPI Statements API Route
 *
 * Handles xAPI statement ingestion with validation, enrichment,
 * and BigQuery streaming. Supports single and batch statements.
 *
 * @route POST /api/xapi/statements
 * @route GET /api/xapi/statements (query)
 *
 * @see xAPI 1.0.3 Specification
 * @see EU AI Act: All AI-influenced statements logged with consent tier
 */

export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StatementSchema, type Statement } from '@/lib/xapi/types';
import {
  InspireExtensions,
  extractInspireExtensions,
  type ConsentTierLevel,
} from '@/lib/xapi/inspire-extensions';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BIGQUERY_FUNCTION_URL = process.env.XAPI_BIGQUERY_FUNCTION_URL;
const REQUIRE_CONSENT_TIER = process.env.REQUIRE_CONSENT_TIER !== 'false';
const MAX_BATCH_SIZE = 100;

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
  'Access-Control-Allow-Origin': '*',
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
 * Validate consent tier is present (EU AI Act compliance)
 */
function validateConsentTier(statement: Statement): ConsentTierLevel | null {
  const extensions = statement.context?.extensions;
  if (!extensions) return null;

  const consentTier = extensions[InspireExtensions.consentTier];
  if (typeof consentTier === 'number' && consentTier >= 0 && consentTier <= 3) {
    return consentTier as ConsentTierLevel;
  }
  return null;
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
        ...(sessionId && !existingExtensions[InspireExtensions.sessionId]
          ? { [InspireExtensions.sessionId]: sessionId }
          : {}),
      },
    };
  }

  return enrichedStatement;
}

/**
 * Transform statement to BigQuery row format
 */
function transformToBigQueryRow(
  statement: Statement,
  tenantId: string | null,
  sessionId: string | null,
): Record<string, unknown> {
  const inspireExt = extractInspireExtensions(statement.context?.extensions);

  // Extract actor identifier
  let actorId: string | null = null;
  if ('mbox' in statement.actor && statement.actor.mbox) {
    actorId = statement.actor.mbox;
  } else if ('account' in statement.actor && statement.actor.account) {
    actorId = `${statement.actor.account.homePage}::${statement.actor.account.name}`;
  }

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
    objectName = statement.object.definition.name['en-US'] || Object.values(statement.object.definition.name)[0] || null;
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
 * Send statements to BigQuery via Cloud Function
 */
async function sendToBigQuery(
  rows: Record<string, unknown>[],
  tenantId: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!BIGQUERY_FUNCTION_URL) {
    console.warn('XAPI_BIGQUERY_FUNCTION_URL not configured, skipping BigQuery ingestion');
    return { success: true }; // Don't fail if not configured
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
      return { success: false, error: `BigQuery function error: ${response.status} - ${errorText}` };
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

  // Parse and validate request
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
    'statement' in parseResult.data
      ? [parseResult.data.statement]
      : parseResult.data.statements;

  // Validate and process each statement
  const results: IngestionResult[] = [];
  const acceptedRows: Record<string, unknown>[] = [];

  for (const statement of statements) {
    // EU AI Act: Require consent tier for AI-influenced learning
    if (REQUIRE_CONSENT_TIER) {
      const consentTier = validateConsentTier(statement);
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

    // Transform to BigQuery row
    const row = transformToBigQueryRow(enriched, tenantId, sessionId);
    acceptedRows.push(row);

    results.push({
      statementId: enriched.id!,
      status: 'accepted',
    });
  }

  // Send accepted statements to BigQuery
  if (acceptedRows.length > 0) {
    const bqResult = await sendToBigQuery(acceptedRows, tenantId);
    if (!bqResult.success) {
      console.error('BigQuery ingestion failed:', bqResult.error);
      // Don't fail the request, but log it
      // In production, you might want to queue for retry
    }
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
// GET - Query Statements (Placeholder for LRS compliance)
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
  const limit = searchParams.get('limit');

  // TODO: Implement BigQuery query for statement retrieval
  // For now, return not implemented
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Statement query endpoint is pending BigQuery integration',
        query: { statementId, agent, verb, activity, since, until, limit },
      },
    },
    { status: 501, headers: corsHeaders },
  );
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
