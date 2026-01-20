-- =============================================================================
-- LXD360 BigQuery - INSPIRE Cognitive Extensions
-- Ticket: LXD-XXX - Add INSPIRE Cognitive Extensions to xAPI Statements
-- =============================================================================
-- Description: Adds denormalized INSPIRE extension columns to xAPI statements
-- for efficient analytics queries without JSON parsing.
-- These columns capture behavioral telemetry for adaptive learning.
-- =============================================================================

-- Add INSPIRE behavioral telemetry columns
ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_latency INT64 
  OPTIONS (description = 'Response latency in milliseconds - hesitation indicator');

ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_depth INT64 
  OPTIONS (description = 'Engagement depth: 1=skim, 2=read, 3=study, 4=deep-dive');

ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_modality STRING 
  OPTIONS (description = 'Content modality: video, audio, text, interactive, simulation');

-- Add skill tracking columns
ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_skill_id STRING 
  OPTIONS (description = 'Skill identifier from taxonomy');

ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_mastery_estimate FLOAT64 
  OPTIONS (description = 'BKT mastery probability estimate (0-1)');

-- Add cognitive load columns
ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_cognitive_load_total FLOAT64 
  OPTIONS (description = 'Total cognitive load estimate (1-10)');

-- Add EU AI Act compliance columns
ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_consent_tier INT64 
  OPTIONS (description = 'Data consent tier: 0=isolated, 1=receive, 2=contribute, 3=industry');

ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_ai_recommended BOOL 
  OPTIONS (description = 'Was this content AI-recommended?');

ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_learner_override BOOL 
  OPTIONS (description = 'Did learner override AI recommendation?');

-- Add confidence rating for self-assessment
ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS ext_confidence_rating FLOAT64 
  OPTIONS (description = 'Self-reported confidence rating (0-1)');

-- Add session context
ALTER TABLE `lxd360_analytics.xapi_statements`
ADD COLUMN IF NOT EXISTS context_session_id STRING 
  OPTIONS (description = 'Learning session identifier');
