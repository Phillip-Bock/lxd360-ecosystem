-- =============================================================================
-- LXD360 BigQuery - AI Decisions Audit Table
-- Ticket: LXD-XXX - EU AI Act Compliance - AI Decision Audit Trail
-- =============================================================================
-- Description: Stores all AI-driven decisions for regulatory compliance.
-- Required for EU AI Act high-risk AI system transparency requirements.
-- Enables Glass Box AI explanations and learner override tracking.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.ai_decisions` (
  -- Decision identification
  decision_id STRING NOT NULL OPTIONS (description = 'Unique decision UUID'),
  explanation_id STRING NOT NULL OPTIONS (description = 'Glass Box explanation ID for learner-facing rationale'),
  
  -- Who and what
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier'),
  learner_id STRING NOT NULL OPTIONS (description = 'Learner identifier'),
  content_block_id STRING OPTIONS (description = 'Content block this decision affects'),
  skill_id STRING OPTIONS (description = 'Skill this decision relates to'),
  
  -- Decision details
  decision_type STRING NOT NULL OPTIONS (description = 'Type: modality_swap, path_adaptation, intervention, assessment_difficulty'),
  
  -- AI model information
  model_name STRING NOT NULL OPTIONS (description = 'Model identifier (e.g., hbtn-v1, rule-based-v1)'),
  model_version STRING NOT NULL OPTIONS (description = 'Specific model version'),
  model_type STRING NOT NULL OPTIONS (description = 'Model architecture: bkt, sakt, dkvmn, rule_based, llm'),
  
  -- Input features (for reproducibility)
  input_features JSON NOT NULL OPTIONS (description = 'Feature vector used for prediction'),
  feature_vector_hash STRING NOT NULL OPTIONS (description = 'Hash of input features for deduplication'),
  
  -- Prediction output
  prediction JSON NOT NULL OPTIONS (description = 'Raw model output'),
  confidence FLOAT64 NOT NULL OPTIONS (description = 'Model confidence score (0-1)'),
  
  -- Recommendation
  recommendation_type STRING OPTIONS (description = 'What was recommended'),
  recommendation_value STRING OPTIONS (description = 'Specific recommendation value'),
  recommendation_reason STRING OPTIONS (description = 'Human-readable reason'),
  
  -- Learner response (Glass Box compliance)
  learner_accepted BOOL OPTIONS (description = 'Did learner accept the recommendation?'),
  learner_override BOOL OPTIONS (description = 'Did learner override with different choice?'),
  override_value STRING OPTIONS (description = 'What the learner chose instead'),
  override_reason STRING OPTIONS (description = 'Learner-provided reason for override'),
  
  -- Regulatory compliance
  consent_tier INT64 NOT NULL OPTIONS (description = 'Learner consent tier at time of decision'),
  data_residency STRING OPTIONS (description = 'Data residency region (EU AI Act)'),
  
  -- Audit metadata
  decision_timestamp TIMESTAMP NOT NULL OPTIONS (description = 'When the decision was made'),
  response_timestamp TIMESTAMP OPTIONS (description = 'When the learner responded'),
  latency_ms INT64 OPTIONS (description = 'Time from request to decision'),
  
  -- xAPI correlation
  xapi_statement_id STRING OPTIONS (description = 'Related xAPI statement ID'),
  
  -- Created timestamp
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Record creation timestamp')
)
PARTITION BY DATE(decision_timestamp)
CLUSTER BY tenant_id, learner_id, decision_type
OPTIONS (
  description = 'AI decision audit trail for EU AI Act compliance and Glass Box AI transparency',
  labels = [
    ('data_classification', 'pii'),
    ('retention_days', '2555'),
    ('compliance', 'eu_ai_act'),
    ('compliance', 'gdpr')
  ]
);

-- =============================================================================
-- Learner Profiles Table (for real-time adaptation)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.learner_profiles` (
  -- Identification
  learner_id STRING NOT NULL OPTIONS (description = 'Unique learner identifier'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier'),
  
  -- Cognitive state
  current_cognitive_load FLOAT64 OPTIONS (description = 'Current estimated cognitive load (1-10)'),
  preferred_modality STRING OPTIONS (description = 'Learner preferred content modality'),
  
  -- Session tracking
  current_session_id STRING OPTIONS (description = 'Active learning session ID'),
  session_start_time TIMESTAMP OPTIONS (description = 'When current session started'),
  
  -- Aggregate metrics
  total_interactions INT64 DEFAULT 0 OPTIONS (description = 'Total learning interactions'),
  avg_correct_rate FLOAT64 OPTIONS (description = 'Average correct response rate'),
  avg_latency_ms FLOAT64 OPTIONS (description = 'Average response latency'),
  avg_engagement_depth FLOAT64 OPTIONS (description = 'Average engagement depth'),
  
  -- AI adaptation tracking
  total_recommendations INT64 DEFAULT 0 OPTIONS (description = 'Total AI recommendations received'),
  accepted_recommendations INT64 DEFAULT 0 OPTIONS (description = 'Recommendations accepted'),
  overridden_recommendations INT64 DEFAULT 0 OPTIONS (description = 'Recommendations overridden'),
  
  -- Consent
  consent_tier INT64 NOT NULL DEFAULT 0 OPTIONS (description = 'Current data consent tier'),
  consent_updated_at TIMESTAMP OPTIONS (description = 'When consent was last updated'),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Profile creation timestamp'),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Last update timestamp')
)
CLUSTER BY tenant_id, learner_id
OPTIONS (
  description = 'Learner cognitive profiles for adaptive learning',
  labels = [
    ('data_classification', 'pii'),
    ('retention_days', '2555')
  ]
);

-- =============================================================================
-- Model Registry Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.model_registry` (
  -- Model identification
  model_id STRING NOT NULL OPTIONS (description = 'Unique model identifier'),
  model_name STRING NOT NULL OPTIONS (description = 'Human-readable model name'),
  model_version STRING NOT NULL OPTIONS (description = 'Semantic version'),
  model_type STRING NOT NULL OPTIONS (description = 'Architecture: bkt, sakt, dkvmn, rule_based, llm'),
  
  -- Deployment info
  vertex_endpoint_id STRING OPTIONS (description = 'Vertex AI endpoint ID if deployed'),
  vertex_model_id STRING OPTIONS (description = 'Vertex AI model ID'),
  deployment_status STRING NOT NULL DEFAULT 'inactive' OPTIONS (description = 'Status: inactive, staging, production, deprecated'),
  
  -- Performance metrics
  accuracy FLOAT64 OPTIONS (description = 'Test accuracy'),
  auc_roc FLOAT64 OPTIONS (description = 'Area under ROC curve'),
  calibration_error FLOAT64 OPTIONS (description = 'Expected calibration error'),
  
  -- Training info
  training_dataset STRING OPTIONS (description = 'Training dataset identifier'),
  training_samples INT64 OPTIONS (description = 'Number of training samples'),
  training_completed_at TIMESTAMP OPTIONS (description = 'When training completed'),
  
  -- Metadata
  description STRING OPTIONS (description = 'Model description'),
  created_by STRING OPTIONS (description = 'Who created/deployed this model'),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Record creation timestamp'),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Last update timestamp')
)
OPTIONS (
  description = 'Registry of deployed ML models for adaptive learning',
  labels = [
    ('compliance', 'eu_ai_act')
  ]
);

-- =============================================================================
-- Skill Baselines Table (Cold-Start Probing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `lxd360_analytics.skill_baselines` (
  -- Identification
  baseline_id STRING NOT NULL OPTIONS (description = 'Unique baseline record ID'),
  learner_id STRING NOT NULL OPTIONS (description = 'Learner identifier'),
  tenant_id STRING NOT NULL OPTIONS (description = 'Organization/tenant identifier'),
  skill_id STRING NOT NULL OPTIONS (description = 'Skill identifier'),
  
  -- BKT State
  mastery_probability FLOAT64 NOT NULL OPTIONS (description = 'P(mastery) from BKT'),
  mastery_level STRING NOT NULL OPTIONS (description = 'Discrete level: novice, developing, proficient, mastered'),
  
  -- BKT Parameters
  p_init FLOAT64 NOT NULL OPTIONS (description = 'Initial mastery probability'),
  p_learn FLOAT64 NOT NULL OPTIONS (description = 'Learning rate'),
  p_guess FLOAT64 NOT NULL OPTIONS (description = 'Guess probability'),
  p_slip FLOAT64 NOT NULL OPTIONS (description = 'Slip probability'),
  
  -- Performance metrics
  total_attempts INT64 DEFAULT 0 OPTIONS (description = 'Total attempts on this skill'),
  successful_attempts INT64 DEFAULT 0 OPTIONS (description = 'Successful attempts'),
  streak_correct INT64 DEFAULT 0 OPTIONS (description = 'Current correct streak'),
  streak_incorrect INT64 DEFAULT 0 OPTIONS (description = 'Current incorrect streak'),
  avg_response_time_ms FLOAT64 OPTIONS (description = 'Average response time'),
  
  -- SM-2 Spaced Repetition
  easiness_factor FLOAT64 DEFAULT 2.5 OPTIONS (description = 'SM-2 easiness factor'),
  interval_days INT64 DEFAULT 1 OPTIONS (description = 'Days until next review'),
  repetitions INT64 DEFAULT 0 OPTIONS (description = 'Successful repetitions'),
  next_review_due TIMESTAMP OPTIONS (description = 'Next review date'),
  last_practice TIMESTAMP OPTIONS (description = 'Last practice date'),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Baseline creation timestamp'),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() OPTIONS (description = 'Last update timestamp')
)
CLUSTER BY tenant_id, learner_id, skill_id
OPTIONS (
  description = 'Per-skill mastery tracking using Bayesian Knowledge Tracing',
  labels = [
    ('data_classification', 'pii')
  ]
);
