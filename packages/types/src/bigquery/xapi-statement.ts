/**
 * BigQuery xAPI Statement Schema
 *
 * This schema defines the flattened/denormalized structure for
 * xAPI statements stored in BigQuery for analytics.
 *
 * @module @inspire/types/bigquery/xapi-statement
 */

import { z } from 'zod';

// ============================================================================
// BIGQUERY xAPI ROW SCHEMA
// ============================================================================

/**
 * BigQuery row schema for xAPI statements.
 *
 * This is a denormalized structure optimized for analytical queries.
 * The full statement JSON is preserved in statement_json for compliance.
 */
export const BigQueryXAPIStatementSchema = z.object({
  // Statement Identity
  /** xAPI statement UUID */
  id: z.string().uuid(),

  // Actor (denormalized for query performance)
  /** Actor account home page URL */
  actor_account_home_page: z.string(),
  /** Actor account name (user ID) */
  actor_account_name: z.string(),
  /** Actor display name */
  actor_name: z.string().nullable(),

  // Verb
  /** Verb IRI */
  verb_id: z.string(),
  /** Verb display text (en-US) */
  verb_display: z.string().nullable(),

  // Object (Activity)
  /** Activity IRI */
  object_id: z.string(),
  /** Object type (Activity, Agent, etc.) */
  object_type: z.string().nullable(),
  /** Activity definition type IRI */
  object_definition_type: z.string().nullable(),
  /** Activity name (en-US) */
  object_definition_name: z.string().nullable(),
  /** Interaction type for questions */
  object_definition_interaction_type: z.string().nullable(),

  // Result
  /** Whether the activity was successful */
  result_success: z.boolean().nullable(),
  /** Whether the activity was completed */
  result_completion: z.boolean().nullable(),
  /** Scaled score (-1 to 1) */
  result_score_scaled: z.number().nullable(),
  /** Raw score */
  result_score_raw: z.number().nullable(),
  /** Minimum possible score */
  result_score_min: z.number().nullable(),
  /** Maximum possible score */
  result_score_max: z.number().nullable(),
  /** Learner response text */
  result_response: z.string().nullable(),
  /** Duration in ISO 8601 format */
  result_duration: z.string().nullable(),

  // Context
  /** Registration UUID (session) */
  context_registration: z.string().nullable(),
  /** Course ID extracted from context */
  context_course_id: z.string().nullable(),
  /** Lesson ID extracted from context */
  context_lesson_id: z.string().nullable(),
  /** Learning session ID */
  context_session_id: z.string().nullable(),
  /** Platform identifier */
  context_platform: z.string().nullable(),
  /** Language code */
  context_language: z.string().nullable(),

  // INSPIRE Extensions (promoted for query performance)
  /** Response latency in milliseconds */
  ext_latency_ms: z.number().int().nullable(),
  /** Total cognitive load (0-10) */
  ext_cognitive_load_total: z.number().nullable(),
  /** Intrinsic cognitive load (0-10) */
  ext_cognitive_load_intrinsic: z.number().nullable(),
  /** Extraneous cognitive load (0-10) */
  ext_cognitive_load_extraneous: z.number().nullable(),
  /** Germane cognitive load (0-10) */
  ext_cognitive_load_germane: z.number().nullable(),
  /** Content modality state */
  ext_modality_state: z.string().nullable(),
  /** Skill ID for BKT tracking */
  ext_skill_id: z.string().nullable(),
  /** Content block type */
  ext_block_type: z.string().nullable(),
  /** Hesitation count */
  ext_hesitation_count: z.number().int().nullable(),
  /** Accessibility mode settings (JSON) */
  ext_a11y_mode: z.record(z.boolean()).nullable(),

  // Full Statement (for compliance/replay)
  /** Complete xAPI statement as JSON */
  statement_json: z.string(),

  // Multi-tenant
  /** Tenant/organization identifier */
  tenant_id: z.string(),

  // Timestamps
  /** Statement timestamp (when the event occurred) */
  timestamp: z.string().datetime(),
  /** Stored timestamp (when LRS received it) */
  stored: z.string().datetime(),

  // Metadata
  /** xAPI version */
  api_version: z.string().default('1.0.3'),
  /** BigQuery ingestion timestamp */
  ingestion_time: z.string().datetime().optional(),
  /** Source system (ignite, studio, mobile) */
  source_system: z.string().nullable(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BigQueryXAPIStatement = z.infer<typeof BigQueryXAPIStatementSchema>;

// ============================================================================
// BIGQUERY SQL SCHEMA (for reference)
// ============================================================================

/**
 * BigQuery table creation SQL.
 * This is provided as a reference - actual creation should use Terraform.
 */
export const BIGQUERY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS inspire_lrs.xapi_statements (
  -- Statement Identity
  id STRING NOT NULL,

  -- Actor (denormalized for query performance)
  actor_account_home_page STRING NOT NULL,
  actor_account_name STRING NOT NULL,
  actor_name STRING,

  -- Verb
  verb_id STRING NOT NULL,
  verb_display STRING,

  -- Object (Activity)
  object_id STRING NOT NULL,
  object_type STRING,
  object_definition_type STRING,
  object_definition_name STRING,
  object_definition_interaction_type STRING,

  -- Result
  result_success BOOL,
  result_completion BOOL,
  result_score_scaled FLOAT64,
  result_score_raw FLOAT64,
  result_score_min FLOAT64,
  result_score_max FLOAT64,
  result_response STRING,
  result_duration STRING,

  -- Context
  context_registration STRING,
  context_course_id STRING,
  context_lesson_id STRING,
  context_session_id STRING,
  context_platform STRING,
  context_language STRING,

  -- INSPIRE Extensions (promoted for query performance)
  ext_latency_ms INT64,
  ext_cognitive_load_total FLOAT64,
  ext_cognitive_load_intrinsic FLOAT64,
  ext_cognitive_load_extraneous FLOAT64,
  ext_cognitive_load_germane FLOAT64,
  ext_modality_state STRING,
  ext_skill_id STRING,
  ext_block_type STRING,
  ext_hesitation_count INT64,
  ext_a11y_mode JSON,

  -- Full Statement (for compliance/replay)
  statement_json JSON NOT NULL,

  -- Multi-tenant
  tenant_id STRING NOT NULL,

  -- Timestamps
  timestamp TIMESTAMP NOT NULL,
  stored TIMESTAMP NOT NULL,

  -- Metadata
  api_version STRING DEFAULT '1.0.3',
  ingestion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  source_system STRING
)
PARTITION BY DATE(timestamp)
CLUSTER BY tenant_id, actor_account_name, verb_id
OPTIONS (
  description = 'INSPIRE LRS xAPI Statements',
  labels = [('component', 'lrs'), ('compliance', 'hipaa')],
  partition_expiration_days = 2557,  -- 7 years
  require_partition_filter = true
);
`;
