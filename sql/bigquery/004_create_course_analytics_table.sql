-- =============================================================================
-- LXD360 BigQuery - Course Analytics Table
-- Ticket: LXD-249 - Set Up BigQuery for xAPI Analytics
-- =============================================================================
-- Description: Aggregated course-level analytics for dashboard reporting
-- Updated by scheduled batch jobs that process xapi_statements
-- Partitioned by calculated_at for time-series analysis
-- Clustered by tenant_id, course_id for multi-tenant course lookups
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.course_analytics` (
  -- Course and tenant identification
  course_id STRING NOT NULL OPTIONS (description = 'Course identifier'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier for data isolation'),

  -- Enrollment metrics
  total_enrollments INT64 OPTIONS (description = 'Total number of learners enrolled'),
  active_learners INT64 OPTIONS (description = 'Learners with activity in the last 30 days'),
  completions INT64 OPTIONS (description = 'Number of learners who completed the course'),

  -- Performance metrics
  average_score FLOAT64 OPTIONS (description = 'Average score across all completions'),
  average_time_seconds INT64 OPTIONS (description = 'Average time to completion in seconds'),
  drop_off_rate FLOAT64 OPTIONS (description = 'Percentage of learners who started but did not complete'),

  -- Activity tracking
  last_activity TIMESTAMP OPTIONS (description = 'Most recent learner activity in this course'),

  -- Record metadata
  calculated_at TIMESTAMP NOT NULL OPTIONS (description = 'When these metrics were calculated')
)
PARTITION BY DATE(calculated_at)
CLUSTER BY tenant_id, course_id
OPTIONS (
  description = 'Aggregated course analytics for dashboard reporting and insights',
  labels = [
    ('data_classification', 'internal'),
    ('update_frequency', 'daily'),
    ('aggregation_level', 'course')
  ]
);

-- View for latest course analytics (most recent calculation per course)
-- Uncomment when ready to deploy:
--
-- CREATE OR REPLACE VIEW `lxd360_analytics.course_analytics_latest` AS
-- SELECT *
-- FROM (
--   SELECT
--     *,
--     ROW_NUMBER() OVER (
--       PARTITION BY tenant_id, course_id
--       ORDER BY calculated_at DESC
--     ) as row_num
--   FROM `lxd360_analytics.course_analytics`
-- )
-- WHERE row_num = 1;

-- Historical comparison view for trend analysis
-- Uncomment when ready to deploy:
--
-- CREATE OR REPLACE VIEW `lxd360_analytics.course_analytics_weekly` AS
-- SELECT
--   tenant_id,
--   course_id,
--   DATE_TRUNC(calculated_at, WEEK) as week_start,
--   AVG(total_enrollments) as avg_enrollments,
--   AVG(active_learners) as avg_active_learners,
--   AVG(completions) as avg_completions,
--   AVG(average_score) as avg_score,
--   AVG(drop_off_rate) as avg_drop_off_rate
-- FROM `lxd360_analytics.course_analytics`
-- GROUP BY tenant_id, course_id, week_start;
