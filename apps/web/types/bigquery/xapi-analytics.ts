/**
 * BigQuery xAPI Analytics Types
 * Ticket: LXD-249 - Set Up BigQuery for xAPI Analytics
 *
 * TypeScript interfaces matching the BigQuery schema for type-safe
 * data operations between the application and BigQuery.
 */

// =============================================================================
// xAPI Statements Table Types
// =============================================================================

/**
 * Raw xAPI statement as stored in BigQuery.
 * Represents a single learning experience record.
 */
export interface XAPIStatementRow {
  /** Unique xAPI statement UUID */
  statement_id: string;

  /** Unique identifier for the learner */
  actor_id: string;

  /** Display name of the learner */
  actor_name: string | null;

  /** Email address (mbox) of the learner */
  actor_email: string | null;

  /** IRI identifying the verb (e.g., http://adlnet.gov/expapi/verbs/completed) */
  verb_id: string;

  /** Human-readable verb label */
  verb_display: string | null;

  /** Type of object: Activity, Agent, SubStatement, StatementRef */
  object_type: XAPIObjectType;

  /** IRI identifying the activity or object */
  object_id: string;

  /** Human-readable object name */
  object_name: string | null;

  /** Whether the action was successful */
  result_success: boolean | null;

  /** Whether the activity was completed */
  result_completion: boolean | null;

  /** Normalized score between -1 and 1 */
  result_score_scaled: number | null;

  /** Raw score before normalization */
  result_score_raw: number | null;

  /** Minimum possible score */
  result_score_min: number | null;

  /** Maximum possible score */
  result_score_max: number | null;

  /** ISO 8601 duration format (e.g., PT1H30M) */
  result_duration: string | null;

  /** UUID linking related statements */
  context_registration: string | null;

  /** Platform generating the statement */
  context_platform: string | null;

  /** Revision of the activity */
  context_revision: string | null;

  /** Additional context data as JSON object */
  context_extensions: Record<string, unknown> | null;

  /** When the experience occurred (ISO 8601) */
  timestamp: string;

  /** When the statement was stored in the LRS (ISO 8601) */
  stored: string;

  /** Organization/tenant identifier for data isolation */
  tenant_id: string;

  /** Associated course identifier */
  course_id: string | null;

  /** Associated module/lesson identifier */
  module_id: string | null;

  /** Complete original xAPI statement as JSON */
  raw_statement: Record<string, unknown> | null;
}

/**
 * Valid xAPI object types
 */
export type XAPIObjectType = 'Activity' | 'Agent' | 'SubStatement' | 'StatementRef';

/**
 * Input type for inserting new xAPI statements
 */
export interface XAPIStatementInsert extends Omit<XAPIStatementRow, 'stored'> {
  /** Stored timestamp is auto-generated on insert */
  stored?: string;
}

// =============================================================================
// Learner Progress Table Types
// =============================================================================

/**
 * Aggregated learner progress metrics per course/module.
 * Updated by batch jobs processing xapi_statements.
 */
export interface LearnerProgressRow {
  /** Unique identifier for the learner */
  learner_id: string;

  /** Organization/tenant identifier for data isolation */
  tenant_id: string;

  /** Course identifier */
  course_id: string;

  /** Specific module within the course (null for course-level) */
  module_id: string | null;

  /** Overall progress as percentage (0.0 to 100.0) */
  progress_percent: number | null;

  /** Completion status */
  completion_status: CompletionStatus | null;

  /** Average score across all scored activities */
  score_average: number | null;

  /** Total time spent in seconds */
  time_spent_seconds: number | null;

  /** Most recent activity timestamp (ISO 8601) */
  last_accessed: string | null;

  /** Total xAPI statements for this learner/course */
  statements_count: number | null;

  /** When this record was last updated (ISO 8601) */
  updated_at: string;
}

/**
 * Valid completion status values
 */
export type CompletionStatus = 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';

/**
 * Input type for upserting learner progress
 */
export type LearnerProgressUpsert = LearnerProgressRow;

// =============================================================================
// Course Analytics Table Types
// =============================================================================

/**
 * Aggregated course-level analytics for dashboard reporting.
 * Updated by scheduled batch jobs.
 */
export interface CourseAnalyticsRow {
  /** Course identifier */
  course_id: string;

  /** Organization/tenant identifier for data isolation */
  tenant_id: string;

  /** Total number of learners enrolled */
  total_enrollments: number | null;

  /** Learners with activity in the last 30 days */
  active_learners: number | null;

  /** Number of learners who completed the course */
  completions: number | null;

  /** Average score across all completions */
  average_score: number | null;

  /** Average time to completion in seconds */
  average_time_seconds: number | null;

  /** Percentage of learners who started but did not complete */
  drop_off_rate: number | null;

  /** Most recent learner activity in this course (ISO 8601) */
  last_activity: string | null;

  /** When these metrics were calculated (ISO 8601) */
  calculated_at: string;
}

/**
 * Input type for inserting course analytics
 */
export type CourseAnalyticsInsert = CourseAnalyticsRow;

// =============================================================================
// Query Result Types
// =============================================================================

/**
 * Result of learner activity summary query
 */
export interface LearnerActivitySummary {
  verb_display: string;
  action_count: number;
  first_action: string;
  last_action: string;
}

/**
 * Result of course completion rate query
 */
export interface CourseCompletionRate {
  course_id: string;
  total_learners: number;
  completions: number;
  completion_rate: number;
}

/**
 * Result of daily active learners query
 */
export interface DailyActiveLearners {
  activity_date: string;
  active_learners: number;
  total_statements: number;
}

/**
 * Result of verb distribution query
 */
export interface VerbDistribution {
  verb_id: string;
  verb_display: string;
  statement_count: number;
  unique_learners: number;
  percentage: number;
}

/**
 * Result of top performers query
 */
export interface TopPerformer {
  actor_id: string;
  actor_name: string | null;
  courses_attempted: number;
  avg_score: number;
  completions: number;
}

// =============================================================================
// Common xAPI Verb IRIs
// =============================================================================

/**
 * Standard ADL xAPI verb IRIs
 */
export const XAPI_VERBS = {
  EXPERIENCED: 'http://adlnet.gov/expapi/verbs/experienced',
  ATTENDED: 'http://adlnet.gov/expapi/verbs/attended',
  ATTEMPTED: 'http://adlnet.gov/expapi/verbs/attempted',
  COMPLETED: 'http://adlnet.gov/expapi/verbs/completed',
  PASSED: 'http://adlnet.gov/expapi/verbs/passed',
  FAILED: 'http://adlnet.gov/expapi/verbs/failed',
  ANSWERED: 'http://adlnet.gov/expapi/verbs/answered',
  INTERACTED: 'http://adlnet.gov/expapi/verbs/interacted',
  LAUNCHED: 'http://adlnet.gov/expapi/verbs/launched',
  INITIALIZED: 'http://adlnet.gov/expapi/verbs/initialized',
  TERMINATED: 'http://adlnet.gov/expapi/verbs/terminated',
  VOIDED: 'http://adlnet.gov/expapi/verbs/voided',
  PROGRESSED: 'http://adlnet.gov/expapi/verbs/progressed',
  SCORED: 'http://adlnet.gov/expapi/verbs/scored',
} as const;

export type XAPIVerbId = (typeof XAPI_VERBS)[keyof typeof XAPI_VERBS];

// =============================================================================
// BigQuery Configuration Types
// =============================================================================

/**
 * BigQuery dataset configuration
 */
export interface BigQueryDatasetConfig {
  projectId: string;
  datasetId: string;
  location: string;
}

/**
 * Default configuration for LXD360 analytics
 */
export const BIGQUERY_CONFIG: BigQueryDatasetConfig = {
  projectId: 'lxd-saas-dev',
  datasetId: 'lxd360_analytics',
  location: 'us-central1',
};

/**
 * Table names in the analytics dataset
 */
export const BIGQUERY_TABLES = {
  XAPI_STATEMENTS: 'xapi_statements',
  LEARNER_PROGRESS: 'learner_progress',
  COURSE_ANALYTICS: 'course_analytics',
} as const;

export type BigQueryTableName = (typeof BIGQUERY_TABLES)[keyof typeof BIGQUERY_TABLES];
