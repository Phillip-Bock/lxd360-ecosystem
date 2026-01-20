-- =============================================================================
-- LXD360 BigQuery - INSPIRE Cognitive Extensions
-- Ticket: LXD-XXX - Add INSPIRE Cognitive Fields for Adaptive Learning
-- =============================================================================
-- Description: Extends xapi_statements table with INSPIRE-specific columns
-- for cognitive load tracking, modality adaptation, and EU AI Act compliance.
--
-- IMPORTANT: Run this AFTER 002_create_xapi_statements_table.sql
-- =============================================================================

-- Add INSPIRE cognitive extension columns to existing table
ALTER TABLE `lxd360_analytics.xapi_statements`

-- Behavioral telemetry
ADD COLUMN IF NOT EXISTS ext_latency INT64
  OPTIONS (description = 'Response latency in milliseconds - hesitation indicator'),

ADD COLUMN IF NOT EXISTS ext_depth INT64
  OPTIONS (description = 'Engagement depth 1-5: skimmed, read, interacted, explored, mastered'),

ADD COLUMN IF NOT EXISTS ext_time_to_first_action INT64
  OPTIONS (description = 'Time to first interaction in ms - guessing indicator'),

ADD COLUMN IF NOT EXISTS ext_revision_count INT64
  OPTIONS (description = 'Number of answer revisions before submission'),

ADD COLUMN IF NOT EXISTS ext_rage_clicks INT64
  OPTIONS (description = 'Rapid repeated clicks indicating frustration'),

ADD COLUMN IF NOT EXISTS ext_focus_loss_count INT64
  OPTIONS (description = 'Tab/window visibility changes during activity'),

-- Content modality
ADD COLUMN IF NOT EXISTS ext_modality STRING
  OPTIONS (description = 'Content delivery modality: video, audio, text, interactive, etc.'),

ADD COLUMN IF NOT EXISTS ext_ai_recommended BOOL
  OPTIONS (description = 'Whether content was AI-recommended vs manually selected'),

ADD COLUMN IF NOT EXISTS ext_learner_override BOOL
  OPTIONS (description = 'Whether learner overrode AI recommendation (EU AI Act)'),

ADD COLUMN IF NOT EXISTS ext_override_recommendation_id STRING
  OPTIONS (description = 'AI recommendation ID that was overridden'),

-- Skill and mastery
ADD COLUMN IF NOT EXISTS ext_skill_id STRING
  OPTIONS (description = 'Skill/competency ID from the skill taxonomy'),

ADD COLUMN IF NOT EXISTS ext_mastery_estimate FLOAT64
  OPTIONS (description = 'Current mastery estimate 0-1 from BKT model'),

ADD COLUMN IF NOT EXISTS ext_mastery_level STRING
  OPTIONS (description = 'Mastery level: novice, developing, proficient, mastered'),

-- Cognitive load
ADD COLUMN IF NOT EXISTS ext_cognitive_load FLOAT64
  OPTIONS (description = 'Estimated cognitive load 1-10'),

ADD COLUMN IF NOT EXISTS ext_intrinsic_load FLOAT64
  OPTIONS (description = 'Intrinsic load component - content complexity'),

ADD COLUMN IF NOT EXISTS ext_extraneous_load FLOAT64
  OPTIONS (description = 'Extraneous load component - design friction'),

ADD COLUMN IF NOT EXISTS ext_germane_load FLOAT64
  OPTIONS (description = 'Germane load component - learning effort'),

ADD COLUMN IF NOT EXISTS ext_functional_state STRING
  OPTIONS (description = 'Functional learning state: focused, uncertain, struggling, fatigued, disengaged'),

-- Spaced repetition
ADD COLUMN IF NOT EXISTS ext_easiness_factor FLOAT64
  OPTIONS (description = 'SM-2 easiness factor for this skill'),

ADD COLUMN IF NOT EXISTS ext_review_interval INT64
  OPTIONS (description = 'Days until next scheduled review'),

ADD COLUMN IF NOT EXISTS ext_is_scheduled_review BOOL
  OPTIONS (description = 'Whether this interaction was a scheduled review'),

-- Consent and compliance (EU AI Act, GDPR)
ADD COLUMN IF NOT EXISTS ext_consent_tier INT64
  OPTIONS (description = 'Consent tier 0-3: isolated, receive, contribute, industry_pool'),

ADD COLUMN IF NOT EXISTS ext_data_residency STRING
  OPTIONS (description = 'Data residency requirement: eu, us, global'),

ADD COLUMN IF NOT EXISTS ext_training_consent BOOL
  OPTIONS (description = 'Whether data can be used for model training'),

-- Content context
ADD COLUMN IF NOT EXISTS ext_session_id STRING
  OPTIONS (description = 'Learning session ID grouping related statements'),

ADD COLUMN IF NOT EXISTS ext_block_id STRING
  OPTIONS (description = 'Content block ID from INSPIRE Studio'),

ADD COLUMN IF NOT EXISTS ext_block_type STRING
  OPTIONS (description = 'Content block type: quiz, video, flashcard, etc.'),

ADD COLUMN IF NOT EXISTS ext_encoding_phase STRING
  OPTIONS (description = 'INSPIRE encoding phase: itla, nppm, ilmi, ices'),

-- Accessibility
ADD COLUMN IF NOT EXISTS ext_a11y_features ARRAY<STRING>
  OPTIONS (description = 'Active accessibility features: screen-reader, high-contrast, etc.'),

ADD COLUMN IF NOT EXISTS ext_input_method STRING
  OPTIONS (description = 'Input method: mouse, keyboard, touch, voice, switch');


-- =============================================================================
-- AI Decisions Audit Table (EU AI Act Compliance)
-- =============================================================================
-- Stores every AI-influenced decision with Glass Box explanations
-- Required for EU AI Act transparency in high-risk educational AI systems

CREATE TABLE IF NOT EXISTS `lxd360_analytics.ai_decisions` (
  -- Identification
  decision_id STRING NOT NULL OPTIONS (description = 'Unique decision UUID'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier'),
  learner_id STRING NOT NULL OPTIONS (description = 'Learner identifier'),

  -- Decision context
  decision_type STRING NOT NULL OPTIONS (description = 'Type: modality_swap, content_recommendation, path_adjustment, intervention'),
  content_id STRING OPTIONS (description = 'Content ID if applicable'),
  skill_id STRING OPTIONS (description = 'Skill ID if applicable'),

  -- Model information
  model_id STRING NOT NULL OPTIONS (description = 'Model identifier'),
  model_version STRING NOT NULL OPTIONS (description = 'Model version string'),
  model_type STRING OPTIONS (description = 'Model type: bkt, sakt, hbtn, rule_based'),

  -- Input features (hashed for privacy, full features stored separately)
  input_feature_hash STRING OPTIONS (description = 'Hash of input features for reproducibility'),
  input_signals JSON OPTIONS (description = 'Sanitized input signals used for prediction'),

  -- Output
  recommendation STRING NOT NULL OPTIONS (description = 'The recommended action'),
  confidence FLOAT64 NOT NULL OPTIONS (description = 'Model confidence 0-1'),
  alternatives JSON OPTIONS (description = 'Alternative recommendations with scores'),

  -- Glass Box Explanation
  explanation_primary STRING OPTIONS (description = 'Primary reason in natural language'),
  explanation_factors ARRAY<STRING> OPTIONS (description = 'Supporting factors'),
  explanation_evidence JSON OPTIONS (description = 'Evidence with weights'),

  -- Learner action
  learner_accepted BOOL OPTIONS (description = 'Whether learner accepted recommendation'),
  learner_override BOOL OPTIONS (description = 'Whether learner overrode recommendation'),
  override_selection STRING OPTIONS (description = 'What learner chose instead'),
  override_reason STRING OPTIONS (description = 'Learner-provided reason for override'),

  -- Outcome tracking
  outcome_measured BOOL DEFAULT FALSE OPTIONS (description = 'Whether outcome was measured'),
  outcome_success BOOL OPTIONS (description = 'Whether recommendation led to positive outcome'),
  outcome_details JSON OPTIONS (description = 'Detailed outcome metrics'),

  -- Compliance
  consent_tier INT64 NOT NULL OPTIONS (description = 'Learner consent tier at decision time'),
  data_residency STRING OPTIONS (description = 'Data residency requirement'),
  gdpr_legal_basis STRING OPTIONS (description = 'GDPR legal basis for processing'),

  -- Timestamps
  created_at TIMESTAMP NOT NULL OPTIONS (description = 'When decision was made'),
  outcome_measured_at TIMESTAMP OPTIONS (description = 'When outcome was measured')
)
PARTITION BY DATE(created_at)
CLUSTER BY tenant_id, learner_id, decision_type
OPTIONS (
  description = 'AI decision audit log for EU AI Act compliance - Glass Box AI',
  labels = [
    ('data_classification', 'pii'),
    ('retention_days', '2555'),
    ('compliance', 'eu_ai_act'),
    ('compliance', 'gdpr')
  ]
);


-- =============================================================================
-- Learner Profiles Table (Cognitive Signatures)
-- =============================================================================
-- Stores aggregated learner state for real-time adaptation

CREATE TABLE IF NOT EXISTS `lxd360_analytics.learner_profiles` (
  -- Identification
  learner_id STRING NOT NULL OPTIONS (description = 'Unique learner identifier'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier'),

  -- Consent
  consent_tier INT64 NOT NULL DEFAULT 0 OPTIONS (description = 'Cross-tenant learning consent tier'),
  consent_updated_at TIMESTAMP OPTIONS (description = 'When consent was last updated'),

  -- Modality preferences (learned from behavior)
  preferred_modality STRING OPTIONS (description = 'Most effective modality for this learner'),
  modality_effectiveness JSON OPTIONS (description = 'Effectiveness scores by modality'),

  -- Cognitive profile
  avg_cognitive_load FLOAT64 OPTIONS (description = 'Average observed cognitive load'),
  optimal_session_duration INT64 OPTIONS (description = 'Optimal session duration in minutes'),
  fatigue_threshold_minutes INT64 OPTIONS (description = 'Minutes before fatigue typically observed'),

  -- Learning patterns
  avg_latency_ms INT64 OPTIONS (description = 'Average response latency'),
  typical_depth INT64 OPTIONS (description = 'Typical engagement depth'),
  revision_tendency FLOAT64 OPTIONS (description = 'Tendency to revise answers 0-1'),

  -- Spaced repetition global state
  global_easiness_factor FLOAT64 DEFAULT 2.5 OPTIONS (description = 'Default SM-2 easiness factor'),

  -- Activity metrics
  total_statements INT64 DEFAULT 0 OPTIONS (description = 'Total xAPI statements'),
  total_skills INT64 DEFAULT 0 OPTIONS (description = 'Number of skills attempted'),
  total_courses INT64 DEFAULT 0 OPTIONS (description = 'Number of courses enrolled'),

  -- Timestamps
  created_at TIMESTAMP NOT NULL OPTIONS (description = 'Profile creation time'),
  updated_at TIMESTAMP NOT NULL OPTIONS (description = 'Last profile update'),
  last_activity_at TIMESTAMP OPTIONS (description = 'Last learning activity')
)
CLUSTER BY tenant_id, learner_id
OPTIONS (
  description = 'Aggregated learner cognitive profiles for adaptive learning',
  labels = [
    ('data_classification', 'pii'),
    ('retention_days', '2555'),
    ('compliance', 'gdpr')
  ]
);


-- =============================================================================
-- Skill Mastery Table
-- =============================================================================
-- Per-learner, per-skill BKT state

CREATE TABLE IF NOT EXISTS `lxd360_analytics.skill_mastery` (
  -- Identification
  id STRING NOT NULL OPTIONS (description = 'Unique record ID'),
  learner_id STRING NOT NULL OPTIONS (description = 'Learner identifier'),
  skill_id STRING NOT NULL OPTIONS (description = 'Skill identifier'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Tenant identifier'),

  -- BKT State
  mastery_probability FLOAT64 NOT NULL OPTIONS (description = 'Current P(mastery) 0-1'),
  mastery_level STRING NOT NULL OPTIONS (description = 'Discrete level: novice, developing, proficient, mastered'),

  -- BKT Parameters (can be skill-specific)
  p_init FLOAT64 DEFAULT 0.3 OPTIONS (description = 'Initial mastery probability'),
  p_learn FLOAT64 DEFAULT 0.1 OPTIONS (description = 'Learning rate per opportunity'),
  p_guess FLOAT64 DEFAULT 0.2 OPTIONS (description = 'Guess probability'),
  p_slip FLOAT64 DEFAULT 0.1 OPTIONS (description = 'Slip probability'),

  -- Performance history
  total_attempts INT64 DEFAULT 0 OPTIONS (description = 'Total practice attempts'),
  successful_attempts INT64 DEFAULT 0 OPTIONS (description = 'Successful attempts'),
  streak_correct INT64 DEFAULT 0 OPTIONS (description = 'Current correct streak'),
  streak_incorrect INT64 DEFAULT 0 OPTIONS (description = 'Current incorrect streak'),

  -- Timing
  avg_response_time_ms INT64 OPTIONS (description = 'Average response time'),
  expected_response_time_ms INT64 OPTIONS (description = 'Expected response time for this skill'),

  -- SM-2 Spaced Repetition
  easiness_factor FLOAT64 DEFAULT 2.5 OPTIONS (description = 'SM-2 easiness factor'),
  interval_days INT64 DEFAULT 1 OPTIONS (description = 'Days until next review'),
  repetitions INT64 DEFAULT 0 OPTIONS (description = 'Consecutive successful reviews'),
  last_practice TIMESTAMP OPTIONS (description = 'Last practice timestamp'),
  next_review_due TIMESTAMP OPTIONS (description = 'Next scheduled review'),

  -- Confidence calibration
  confidence_calibration FLOAT64 OPTIONS (description = 'Confidence calibration score -1 to 1'),

  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
)
CLUSTER BY tenant_id, learner_id, skill_id
OPTIONS (
  description = 'Per-learner, per-skill BKT mastery state',
  labels = [
    ('data_classification', 'pii'),
    ('retention_days', '2555')
  ]
);


-- =============================================================================
-- Model Registry Table
-- =============================================================================
-- Tracks deployed ML models for reproducibility

CREATE TABLE IF NOT EXISTS `lxd360_analytics.model_registry` (
  model_id STRING NOT NULL OPTIONS (description = 'Unique model identifier'),
  model_name STRING NOT NULL OPTIONS (description = 'Human-readable model name'),
  model_version STRING NOT NULL OPTIONS (description = 'Semantic version'),
  model_type STRING NOT NULL OPTIONS (description = 'Model type: bkt, sakt, dkvmn, hbtn, rule_based'),

  -- Deployment
  status STRING NOT NULL OPTIONS (description = 'Status: active, deprecated, retired'),
  deployed_at TIMESTAMP OPTIONS (description = 'When model was deployed'),
  retired_at TIMESTAMP OPTIONS (description = 'When model was retired'),

  -- Configuration
  config JSON OPTIONS (description = 'Model configuration/hyperparameters'),
  feature_schema JSON OPTIONS (description = 'Expected input feature schema'),

  -- Performance metrics
  validation_metrics JSON OPTIONS (description = 'Validation set metrics'),
  production_metrics JSON OPTIONS (description = 'Production performance metrics'),

  -- Lineage
  training_data_hash STRING OPTIONS (description = 'Hash of training data for reproducibility'),
  parent_model_id STRING OPTIONS (description = 'Parent model if fine-tuned'),

  -- Compliance
  eu_ai_act_risk_level STRING OPTIONS (description = 'Risk classification: minimal, limited, high'),
  human_oversight_required BOOL DEFAULT TRUE OPTIONS (description = 'Whether human oversight is required'),

  -- Metadata
  created_at TIMESTAMP NOT NULL,
  created_by STRING OPTIONS (description = 'Who created/deployed this model')
)
OPTIONS (
  description = 'ML model registry for versioning and compliance',
  labels = [
    ('compliance', 'eu_ai_act')
  ]
);


-- =============================================================================
-- Useful Views
-- =============================================================================

-- View: Recent learner activity with cognitive signals
CREATE OR REPLACE VIEW `lxd360_analytics.v_recent_learner_activity` AS
SELECT
  tenant_id,
  actor_id AS learner_id,
  DATE(timestamp) AS activity_date,
  COUNT(*) AS statement_count,
  AVG(ext_latency) AS avg_latency,
  AVG(ext_cognitive_load) AS avg_cognitive_load,
  COUNTIF(result_success = TRUE) AS correct_count,
  COUNTIF(result_success = FALSE) AS incorrect_count,
  ARRAY_AGG(DISTINCT ext_modality IGNORE NULLS) AS modalities_used,
  ARRAY_AGG(DISTINCT ext_skill_id IGNORE NULLS) AS skills_practiced
FROM `lxd360_analytics.xapi_statements`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY tenant_id, actor_id, activity_date
ORDER BY activity_date DESC;


-- View: AI decision effectiveness
CREATE OR REPLACE VIEW `lxd360_analytics.v_ai_decision_effectiveness` AS
SELECT
  tenant_id,
  decision_type,
  model_version,
  DATE(created_at) AS decision_date,
  COUNT(*) AS total_decisions,
  COUNTIF(learner_accepted = TRUE) AS accepted_count,
  COUNTIF(learner_override = TRUE) AS override_count,
  COUNTIF(outcome_success = TRUE) AS successful_outcomes,
  AVG(confidence) AS avg_confidence,
  SAFE_DIVIDE(COUNTIF(outcome_success = TRUE), COUNTIF(outcome_measured = TRUE)) AS success_rate
FROM `lxd360_analytics.ai_decisions`
WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY tenant_id, decision_type, model_version, decision_date
ORDER BY decision_date DESC;
