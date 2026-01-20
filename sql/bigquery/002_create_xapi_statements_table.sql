-- =============================================================================
-- LXD360 BigQuery - xAPI Statements Table
-- Ticket: LXD-249 - Set Up BigQuery for xAPI Analytics
-- =============================================================================
-- Description: Stores raw xAPI statements from the learning record store (LRS)
-- Partitioned by timestamp for efficient time-range queries
-- Clustered by tenant_id, actor_id, verb_id for multi-tenant filtering
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.xapi_statements` (
  -- Statement identification
  statement_id STRING NOT NULL OPTIONS (description = 'Unique xAPI statement UUID'),

  -- Actor information (who performed the action)
  actor_id STRING NOT NULL OPTIONS (description = 'Unique identifier for the learner'),
  actor_name STRING OPTIONS (description = 'Display name of the learner'),
  actor_email STRING OPTIONS (description = 'Email address (mbox) of the learner'),

  -- Verb information (what action was performed)
  verb_id STRING NOT NULL OPTIONS (description = 'IRI identifying the verb (e.g., http://adlnet.gov/expapi/verbs/completed)'),
  verb_display STRING OPTIONS (description = 'Human-readable verb label'),

  -- Object information (what was acted upon)
  object_type STRING NOT NULL OPTIONS (description = 'Type of object: Activity, Agent, SubStatement, StatementRef'),
  object_id STRING NOT NULL OPTIONS (description = 'IRI identifying the activity or object'),
  object_name STRING OPTIONS (description = 'Human-readable object name'),

  -- Result information (outcome of the action)
  result_success BOOL OPTIONS (description = 'Whether the action was successful'),
  result_completion BOOL OPTIONS (description = 'Whether the activity was completed'),
  result_score_scaled FLOAT64 OPTIONS (description = 'Normalized score between -1 and 1'),
  result_score_raw FLOAT64 OPTIONS (description = 'Raw score before normalization'),
  result_score_min FLOAT64 OPTIONS (description = 'Minimum possible score'),
  result_score_max FLOAT64 OPTIONS (description = 'Maximum possible score'),
  result_duration STRING OPTIONS (description = 'ISO 8601 duration format (e.g., PT1H30M)'),

  -- Context information (additional context)
  context_registration STRING OPTIONS (description = 'UUID linking related statements'),
  context_platform STRING OPTIONS (description = 'Platform generating the statement'),
  context_revision STRING OPTIONS (description = 'Revision of the activity'),
  context_extensions JSON OPTIONS (description = 'Additional context data as JSON'),

  -- Timestamps
  timestamp TIMESTAMP NOT NULL OPTIONS (description = 'When the experience occurred'),
  stored TIMESTAMP NOT NULL OPTIONS (description = 'When the statement was stored in the LRS'),

  -- Multi-tenant and course context
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier for data isolation'),
  course_id STRING OPTIONS (description = 'Associated course identifier'),
  module_id STRING OPTIONS (description = 'Associated module/lesson identifier'),

  -- Raw statement for compliance and debugging
  raw_statement JSON OPTIONS (description = 'Complete original xAPI statement as JSON')
)
PARTITION BY DATE(timestamp)
CLUSTER BY tenant_id, actor_id, verb_id
OPTIONS (
  description = 'xAPI learning record statements from the LXD360 LRS',
  labels = [
    ('data_classification', 'pii'),
    ('retention_days', '2555'),
    ('compliance', 'hipaa')
  ]
);

-- Create index-like optimization through materialized view for common queries
-- Uncomment when ready to deploy:
--
-- CREATE MATERIALIZED VIEW `lxd360_analytics.xapi_statements_by_course`
-- PARTITION BY DATE(timestamp)
-- CLUSTER BY tenant_id, course_id
-- AS
-- SELECT
--   tenant_id,
--   course_id,
--   actor_id,
--   verb_id,
--   timestamp,
--   result_success,
--   result_completion,
--   result_score_scaled
-- FROM `lxd360_analytics.xapi_statements`
-- WHERE course_id IS NOT NULL;
