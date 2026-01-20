-- =============================================================================
-- LXD360 BigQuery Dataset Creation
-- Ticket: LXD-249 - Set Up BigQuery for xAPI Analytics
-- =============================================================================
-- Description: Creates the lxd360_analytics dataset for xAPI learning analytics
-- Location: us-central1
-- Author: Claude Code Agent
-- =============================================================================

-- Create the analytics dataset
-- Note: Run this using bq CLI or BigQuery Console
-- Command: bq mk --location=us-central1 --dataset lxd360_analytics

CREATE SCHEMA IF NOT EXISTS `lxd360_analytics`
OPTIONS (
  description = 'xAPI learning analytics data warehouse for LXD360 platform',
  location = 'us-central1',
  labels = [
    ('environment', 'production'),
    ('team', 'data-engineering'),
    ('compliance', 'fedramp-ready')
  ]
);

-- Grant necessary permissions (adjust project and users as needed)
-- Note: These statements should be run by a project admin
--
-- GRANT `roles/bigquery.dataViewer`
-- ON SCHEMA `lxd360_analytics`
-- TO 'serviceAccount:lxd360-analytics@lxd-saas-dev.iam.gserviceaccount.com';
--
-- GRANT `roles/bigquery.dataEditor`
-- ON SCHEMA `lxd360_analytics`
-- TO 'serviceAccount:lxd360-pipeline@lxd-saas-dev.iam.gserviceaccount.com';
