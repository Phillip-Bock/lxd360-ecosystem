-- =============================================================================
-- LXD360 BigQuery - Learner Progress Table
-- Ticket: LXD-249 - Set Up BigQuery for xAPI Analytics
-- =============================================================================
-- Description: Aggregated learner progress metrics per course/module
-- Updated by batch jobs that process xapi_statements
-- Partitioned by updated_at for efficient incremental updates
-- Clustered by tenant_id, learner_id for multi-tenant learner lookups
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.learner_progress` (
  -- Learner and tenant identification
  learner_id STRING NOT NULL OPTIONS (description = 'Unique identifier for the learner'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier for data isolation'),

  -- Course/module context
  course_id STRING NOT NULL OPTIONS (description = 'Course identifier'),
  module_id STRING OPTIONS (description = 'Specific module within the course (null for course-level)'),

  -- Progress metrics
  progress_percent FLOAT64 OPTIONS (description = 'Overall progress as percentage (0.0 to 100.0)'),
  completion_status STRING OPTIONS (description = 'Status: not_started, in_progress, completed, passed, failed'),
  score_average FLOAT64 OPTIONS (description = 'Average score across all scored activities'),
  time_spent_seconds INT64 OPTIONS (description = 'Total time spent in seconds'),

  -- Activity tracking
  last_accessed TIMESTAMP OPTIONS (description = 'Most recent activity timestamp'),
  statements_count INT64 OPTIONS (description = 'Total xAPI statements for this learner/course'),

  -- Record metadata
  updated_at TIMESTAMP NOT NULL OPTIONS (description = 'When this record was last updated')
)
PARTITION BY DATE(updated_at)
CLUSTER BY tenant_id, learner_id
OPTIONS (
  description = 'Aggregated learner progress metrics for courses and modules',
  labels = [
    ('data_classification', 'pii'),
    ('update_frequency', 'hourly'),
    ('aggregation_level', 'learner-course')
  ]
);

-- Add a unique constraint simulation via a view (BigQuery doesn't support unique constraints)
-- Use this view for upsert logic in ETL pipelines:
--
-- CREATE OR REPLACE VIEW `lxd360_analytics.learner_progress_latest` AS
-- SELECT *
-- FROM (
--   SELECT
--     *,
--     ROW_NUMBER() OVER (
--       PARTITION BY tenant_id, learner_id, course_id, COALESCE(module_id, '')
--       ORDER BY updated_at DESC
--     ) as row_num
--   FROM `lxd360_analytics.learner_progress`
-- )
-- WHERE row_num = 1;
