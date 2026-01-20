import { BigQuery } from '@google-cloud/bigquery';
import { z } from 'zod';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * xAPI Actor schema - supports Agent and Group
 */
const ActorSchema = z.object({
  objectType: z.enum(['Agent', 'Group']).optional().default('Agent'),
  name: z.string().optional(),
  mbox: z.string().optional(),
  mbox_sha1sum: z.string().optional(),
  openid: z.string().optional(),
  account: z
    .object({
      homePage: z.string(),
      name: z.string(),
    })
    .optional(),
  member: z.array(z.lazy(() => ActorSchema)).optional(),
});

/**
 * xAPI Verb schema
 */
const VerbSchema = z.object({
  id: z.string().url(),
  display: z.record(z.string()).optional(),
});

/**
 * xAPI Activity Definition schema
 */
const ActivityDefinitionSchema = z.object({
  type: z.string().optional(),
  name: z.record(z.string()).optional(),
  description: z.record(z.string()).optional(),
  moreInfo: z.string().optional(),
  interactionType: z
    .enum([
      'true-false',
      'choice',
      'fill-in',
      'long-fill-in',
      'matching',
      'performance',
      'sequencing',
      'likert',
      'numeric',
      'other',
    ])
    .optional(),
  correctResponsesPattern: z.array(z.string()).optional(),
  extensions: z.record(z.unknown()).optional(),
});

/**
 * xAPI Object schema (Activity, Agent, StatementRef, SubStatement)
 */
const ObjectSchema = z.union([
  z.object({
    objectType: z.literal('Activity').optional().default('Activity'),
    id: z.string(),
    definition: ActivityDefinitionSchema.optional(),
  }),
  z.object({
    objectType: z.literal('Agent'),
    name: z.string().optional(),
    mbox: z.string().optional(),
    account: z
      .object({
        homePage: z.string(),
        name: z.string(),
      })
      .optional(),
  }),
  z.object({
    objectType: z.literal('StatementRef'),
    id: z.string().uuid(),
  }),
]);

/**
 * xAPI Score schema
 */
const ScoreSchema = z.object({
  scaled: z.number().min(-1).max(1).optional(),
  raw: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

/**
 * xAPI Result schema
 */
const ResultSchema = z.object({
  score: ScoreSchema.optional(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  response: z.string().optional(),
  duration: z.string().optional(),
  extensions: z.record(z.unknown()).optional(),
});

/**
 * xAPI Context schema
 */
const ContextSchema = z.object({
  registration: z.string().uuid().optional(),
  instructor: ActorSchema.optional(),
  team: ActorSchema.optional(),
  contextActivities: z
    .object({
      parent: z.array(z.object({ id: z.string() })).optional(),
      grouping: z.array(z.object({ id: z.string() })).optional(),
      category: z.array(z.object({ id: z.string() })).optional(),
      other: z.array(z.object({ id: z.string() })).optional(),
    })
    .optional(),
  revision: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  extensions: z.record(z.unknown()).optional(),
});

/**
 * Complete xAPI Statement schema
 */
const XAPIStatementSchema = z.object({
  id: z.string().uuid().optional(),
  actor: ActorSchema,
  verb: VerbSchema,
  object: ObjectSchema,
  result: ResultSchema.optional(),
  context: ContextSchema.optional(),
  timestamp: z.string().datetime().optional(),
  stored: z.string().datetime().optional(),
  authority: ActorSchema.optional(),
  version: z.string().optional().default('1.0.3'),
  attachments: z.array(z.unknown()).optional(),
});

type XAPIStatement = z.infer<typeof XAPIStatementSchema>;

/**
 * Request body schema for the Cloud Function
 */
const RequestBodySchema = z.object({
  statement: XAPIStatementSchema.optional(),
  statements: z.array(XAPIStatementSchema).optional(),
  organizationId: z.string().min(1),
  sessionId: z.string().optional(),
});

/**
 * BigQuery row structure for xAPI statements
 */
interface BigQueryStatementRow {
  statement_id: string;
  organization_id: string;
  session_id: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_type: string;
  verb_id: string;
  verb_display: string | null;
  object_id: string;
  object_type: string;
  object_name: string | null;
  object_definition_type: string | null;
  result_success: boolean | null;
  result_completion: boolean | null;
  result_score_scaled: number | null;
  result_score_raw: number | null;
  result_score_min: number | null;
  result_score_max: number | null;
  result_duration: string | null;
  result_response: string | null;
  context_registration: string | null;
  context_platform: string | null;
  context_language: string | null;
  context_parent_ids: string[] | null;
  context_grouping_ids: string[] | null;
  timestamp: string;
  stored: string;
  raw_statement: string;
  created_at: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'lxd-saas-dev';
const DATASET_ID = process.env.BIGQUERY_DATASET || 'xapi_lrs';
const TABLE_ID = process.env.BIGQUERY_TABLE || 'statements';

// =============================================================================
// BIGQUERY CLIENT
// =============================================================================

let bigQueryClient: BigQuery | null = null;

/**
 * Get or initialize the BigQuery client
 */
function getBigQueryClient(): BigQuery {
  if (!bigQueryClient) {
    bigQueryClient = new BigQuery({
      projectId: PROJECT_ID,
    });
  }
  return bigQueryClient;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract actor identifier from xAPI actor
 */
function extractActorId(actor: z.infer<typeof ActorSchema>): string | null {
  if (actor.mbox) {
    return actor.mbox;
  }
  if (actor.mbox_sha1sum) {
    return `sha1:${actor.mbox_sha1sum}`;
  }
  if (actor.openid) {
    return actor.openid;
  }
  if (actor.account) {
    return `${actor.account.homePage}::${actor.account.name}`;
  }
  return null;
}

/**
 * Extract display text from language map
 */
function extractDisplayText(
  displayMap: Record<string, string> | undefined,
  preferredLang = 'en-US',
): string | null {
  if (!displayMap) return null;

  // Try preferred language first
  if (displayMap[preferredLang]) {
    return displayMap[preferredLang];
  }

  // Try any English variant
  for (const [lang, text] of Object.entries(displayMap)) {
    if (lang.startsWith('en')) {
      return text;
    }
  }

  // Return first available
  const firstEntry = Object.values(displayMap)[0];
  return firstEntry || null;
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Transform xAPI statement to BigQuery row
 */
function transformStatementToRow(
  statement: XAPIStatement,
  organizationId: string,
  sessionId: string | null,
): BigQueryStatementRow {
  const now = new Date().toISOString();
  const statementId = statement.id || generateUUID();

  // Extract object details based on object type
  let objectId = '';
  let objectType = 'Activity';
  let objectName: string | null = null;
  let objectDefinitionType: string | null = null;

  if ('id' in statement.object) {
    objectId = statement.object.id;
  }

  if ('objectType' in statement.object && statement.object.objectType) {
    objectType = statement.object.objectType;
  }

  if ('definition' in statement.object && statement.object.definition) {
    objectName = extractDisplayText(statement.object.definition.name);
    objectDefinitionType = statement.object.definition.type || null;
  }

  // Extract context activity IDs
  let parentIds: string[] | null = null;
  let groupingIds: string[] | null = null;

  if (statement.context?.contextActivities) {
    if (statement.context.contextActivities.parent) {
      parentIds = statement.context.contextActivities.parent.map((a) => a.id);
    }
    if (statement.context.contextActivities.grouping) {
      groupingIds = statement.context.contextActivities.grouping.map((a) => a.id);
    }
  }

  return {
    statement_id: statementId,
    organization_id: organizationId,
    session_id: sessionId,
    actor_id: extractActorId(statement.actor),
    actor_name: statement.actor.name || null,
    actor_type: statement.actor.objectType || 'Agent',
    verb_id: statement.verb.id,
    verb_display: extractDisplayText(statement.verb.display),
    object_id: objectId,
    object_type: objectType,
    object_name: objectName,
    object_definition_type: objectDefinitionType,
    result_success: statement.result?.success ?? null,
    result_completion: statement.result?.completion ?? null,
    result_score_scaled: statement.result?.score?.scaled ?? null,
    result_score_raw: statement.result?.score?.raw ?? null,
    result_score_min: statement.result?.score?.min ?? null,
    result_score_max: statement.result?.score?.max ?? null,
    result_duration: statement.result?.duration ?? null,
    result_response: statement.result?.response ?? null,
    context_registration: statement.context?.registration ?? null,
    context_platform: statement.context?.platform ?? null,
    context_language: statement.context?.language ?? null,
    context_parent_ids: parentIds,
    context_grouping_ids: groupingIds,
    timestamp: statement.timestamp || now,
    stored: now,
    raw_statement: JSON.stringify(statement),
    created_at: now,
  };
}

// =============================================================================
// HTTP REQUEST/RESPONSE TYPES
// =============================================================================

interface HttpRequest {
  method: string;
  headers: Record<string, string | undefined>;
  body: unknown;
}

interface HttpResponse {
  status: (code: number) => HttpResponse;
  json: (data: unknown) => void;
  send: (data: string) => void;
  set: (header: string, value: string) => HttpResponse;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

/**
 * Cloud Function entry point for xAPI statement ingestion
 *
 * Accepts HTTP POST requests with xAPI statements and inserts them into BigQuery.
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export async function handleXAPIStatement(req: HttpRequest, res: HttpResponse): Promise<void> {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is accepted',
      },
    });
    return;
  }

  try {
    // Validate request body
    const parseResult = RequestBodySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: parseResult.error.flatten(),
        },
      });
      return;
    }

    const { statement, statements: statementsArray, organizationId, sessionId } = parseResult.data;

    // Collect all statements to process
    const statementsToProcess: XAPIStatement[] = [];

    if (statement) {
      statementsToProcess.push(statement);
    }

    if (statementsArray && statementsArray.length > 0) {
      statementsToProcess.push(...statementsArray);
    }

    if (statementsToProcess.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_STATEMENTS',
          message: 'No statements provided. Include "statement" or "statements" in request body.',
        },
      });
      return;
    }

    // Transform statements to BigQuery rows
    const rows = statementsToProcess.map((stmt) =>
      transformStatementToRow(stmt, organizationId, sessionId || null),
    );

    // Insert into BigQuery
    const bigquery = getBigQueryClient();
    const dataset = bigquery.dataset(DATASET_ID);
    const table = dataset.table(TABLE_ID);

    await table.insert(rows, {
      skipInvalidRows: false,
      ignoreUnknownValues: false,
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        statementIds: rows.map((row) => row.statement_id),
        count: rows.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error processing xAPI statements:', error);

    // Handle BigQuery specific errors
    if (error instanceof Error && error.message.includes('BigQuery')) {
      res.status(503).json({
        success: false,
        error: {
          code: 'BIGQUERY_ERROR',
          message: 'Failed to insert statements into BigQuery',
        },
      });
      return;
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred while processing the request',
      },
    });
  }
}

/**
 * Cloud Function entry point for Pub/Sub triggered ingestion
 *
 * Accepts Pub/Sub messages containing xAPI statements.
 *
 * @param message - Pub/Sub message
 * @param context - Event context
 */
export async function handleXAPIStatementPubSub(
  message: { data: string; attributes?: Record<string, string> },
  context: { eventId: string; timestamp: string },
): Promise<void> {
  try {
    // Decode the Pub/Sub message
    const messageData = Buffer.from(message.data, 'base64').toString('utf-8');
    const payload = JSON.parse(messageData);

    // Validate the payload
    const parseResult = RequestBodySchema.safeParse(payload);

    if (!parseResult.success) {
      console.error('Invalid Pub/Sub message:', parseResult.error.flatten());
      // Don't throw - acknowledge the message to prevent redelivery of invalid messages
      return;
    }

    const { statement, statements: statementsArray, organizationId, sessionId } = parseResult.data;

    // Collect all statements to process
    const statementsToProcess: XAPIStatement[] = [];

    if (statement) {
      statementsToProcess.push(statement);
    }

    if (statementsArray && statementsArray.length > 0) {
      statementsToProcess.push(...statementsArray);
    }

    if (statementsToProcess.length === 0) {
      console.error('No statements in Pub/Sub message');
      return;
    }

    // Transform statements to BigQuery rows
    const rows = statementsToProcess.map((stmt) =>
      transformStatementToRow(stmt, organizationId, sessionId || null),
    );

    // Insert into BigQuery
    const bigquery = getBigQueryClient();
    const dataset = bigquery.dataset(DATASET_ID);
    const table = dataset.table(TABLE_ID);

    await table.insert(rows, {
      skipInvalidRows: false,
      ignoreUnknownValues: false,
    });

    console.info(`Successfully ingested ${rows.length} statements for event ${context.eventId}`);
  } catch (error) {
    console.error('Error processing Pub/Sub message:', error);
    // Throw to trigger retry
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { XAPIStatementSchema, RequestBodySchema, transformStatementToRow };
