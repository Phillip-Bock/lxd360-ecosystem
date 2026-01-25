# =============================================================================
# INSPIRE Platform Infrastructure — CODEX COMPLIANT
# =============================================================================
#
# Terraform configuration for the INSPIRE platform:
# - Cloud Run for web application (Gen2, CPU Boost)
# - Secret Manager for sensitive configuration
# - Pub/Sub for xAPI statement ingestion
# - BigQuery for analytics storage
# - Cloud Functions for processing
#
# Codex References:
# - Section 2.1: Cloud Run Configuration
# - Section 2.2: Terraform Governance
# - Section 5.1: Observability
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "lxd360-terraform-state"
    prefix = "inspire-platform"
  }
}

# =============================================================================
# PROVIDER
# =============================================================================

provider "google" {
  project = var.project_id
  region  = var.region
}

# =============================================================================
# API ENABLEMENT
# =============================================================================

resource "google_project_service" "run" {
  project            = var.project_id
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secretmanager" {
  project            = var.project_id
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "aiplatform" {
  project            = var.project_id
  service            = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudtrace" {
  project            = var.project_id
  service            = "cloudtrace.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "logging" {
  project            = var.project_id
  service            = "logging.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "monitoring" {
  project            = var.project_id
  service            = "monitoring.googleapis.com"
  disable_on_destroy = false
}

# =============================================================================
# PUB/SUB
# =============================================================================

# Topic for xAPI statements
resource "google_pubsub_topic" "xapi_statements" {
  name = "xapi-statements-${var.environment}"

  labels = {
    environment = var.environment
    component   = "lrs"
  }

  message_retention_duration = "604800s" # 7 days
}

# Dead letter topic for failed messages
resource "google_pubsub_topic" "xapi_statements_dlq" {
  name = "xapi-statements-dlq-${var.environment}"

  labels = {
    environment = var.environment
    component   = "lrs"
    type        = "dlq"
  }
}

# Subscription for BigQuery ingestion
resource "google_pubsub_subscription" "xapi_bigquery" {
  name  = "xapi-statements-bigquery-sub-${var.environment}"
  topic = google_pubsub_topic.xapi_statements.name

  # BigQuery subscription
  bigquery_config {
    table            = "${var.project_id}.${google_bigquery_dataset.inspire_lrs.dataset_id}.${google_bigquery_table.xapi_statements.table_id}"
    write_metadata   = true
    drop_unknown_fields = true
  }

  # Dead letter policy
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.xapi_statements_dlq.id
    max_delivery_attempts = 5
  }

  # Retry policy
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  # Expiration (never)
  expiration_policy {
    ttl = ""
  }

  labels = {
    environment = var.environment
    component   = "lrs"
  }
}

# Subscription for Cloud Function processing
resource "google_pubsub_subscription" "xapi_processing" {
  name  = "xapi-statements-processing-sub-${var.environment}"
  topic = google_pubsub_topic.xapi_statements.name

  # Push to Cloud Function
  push_config {
    push_endpoint = google_cloudfunctions2_function.process_statement.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.lrs_processor.email
    }
  }

  # Acknowledgement deadline
  ack_deadline_seconds = 60

  # Retry policy
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "300s"
  }

  labels = {
    environment = var.environment
    component   = "lrs"
  }
}

# =============================================================================
# BIGQUERY
# =============================================================================

resource "google_bigquery_dataset" "inspire_lrs" {
  dataset_id  = "inspire_lrs_${var.environment}"
  description = "INSPIRE Learning Record Store - xAPI analytics"
  location    = var.region

  labels = {
    environment = var.environment
    component   = "lrs"
    compliance  = "hipaa"
  }

  # 7-year retention for compliance
  default_partition_expiration_ms = 220898880000000 # ~7 years

  # Access control
  access {
    role          = "OWNER"
    special_group = "projectOwners"
  }

  access {
    role          = "WRITER"
    user_by_email = google_service_account.lrs_processor.email
  }
}

resource "google_bigquery_table" "xapi_statements" {
  dataset_id = google_bigquery_dataset.inspire_lrs.dataset_id
  table_id   = "xapi_statements"

  description = "xAPI statements with INSPIRE extensions"

  # Partition by timestamp
  time_partitioning {
    type          = "DAY"
    field         = "timestamp"
    expiration_ms = 220898880000000 # ~7 years
  }

  # Cluster for query performance
  clustering = ["tenant_id", "actor_account_name", "verb_id"]

  # Require partition filter
  require_partition_filter = true

  # Schema definition
  schema = <<EOF
[
  {"name": "id", "type": "STRING", "mode": "REQUIRED", "description": "Statement UUID"},
  {"name": "actor_account_home_page", "type": "STRING", "mode": "REQUIRED"},
  {"name": "actor_account_name", "type": "STRING", "mode": "REQUIRED"},
  {"name": "actor_name", "type": "STRING", "mode": "NULLABLE"},
  {"name": "verb_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "verb_display", "type": "STRING", "mode": "NULLABLE"},
  {"name": "object_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "object_type", "type": "STRING", "mode": "NULLABLE"},
  {"name": "object_definition_type", "type": "STRING", "mode": "NULLABLE"},
  {"name": "object_definition_name", "type": "STRING", "mode": "NULLABLE"},
  {"name": "object_definition_interaction_type", "type": "STRING", "mode": "NULLABLE"},
  {"name": "result_success", "type": "BOOL", "mode": "NULLABLE"},
  {"name": "result_completion", "type": "BOOL", "mode": "NULLABLE"},
  {"name": "result_score_scaled", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "result_score_raw", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "result_score_min", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "result_score_max", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "result_response", "type": "STRING", "mode": "NULLABLE"},
  {"name": "result_duration", "type": "STRING", "mode": "NULLABLE"},
  {"name": "context_registration", "type": "STRING", "mode": "NULLABLE"},
  {"name": "context_course_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "context_lesson_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "context_session_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "context_platform", "type": "STRING", "mode": "NULLABLE"},
  {"name": "context_language", "type": "STRING", "mode": "NULLABLE"},
  {"name": "ext_latency_ms", "type": "INT64", "mode": "NULLABLE"},
  {"name": "ext_cognitive_load_total", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "ext_cognitive_load_intrinsic", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "ext_cognitive_load_extraneous", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "ext_cognitive_load_germane", "type": "FLOAT64", "mode": "NULLABLE"},
  {"name": "ext_modality_state", "type": "STRING", "mode": "NULLABLE"},
  {"name": "ext_skill_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "ext_block_type", "type": "STRING", "mode": "NULLABLE"},
  {"name": "ext_hesitation_count", "type": "INT64", "mode": "NULLABLE"},
  {"name": "ext_a11y_mode", "type": "JSON", "mode": "NULLABLE"},
  {"name": "statement_json", "type": "JSON", "mode": "REQUIRED"},
  {"name": "tenant_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "timestamp", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "stored", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "api_version", "type": "STRING", "mode": "NULLABLE"},
  {"name": "ingestion_time", "type": "TIMESTAMP", "mode": "NULLABLE"},
  {"name": "source_system", "type": "STRING", "mode": "NULLABLE"}
]
EOF

  labels = {
    environment = var.environment
    component   = "lrs"
    compliance  = "hipaa"
  }
}

# =============================================================================
# SERVICE ACCOUNT
# =============================================================================

resource "google_service_account" "lrs_processor" {
  account_id   = "lrs-processor-${var.environment}"
  display_name = "INSPIRE LRS Processor"
  description  = "Service account for LRS statement processing"
}

# Pub/Sub publisher role
resource "google_project_iam_member" "lrs_pubsub_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.lrs_processor.email}"
}

# Pub/Sub subscriber role
resource "google_project_iam_member" "lrs_pubsub_subscriber" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.lrs_processor.email}"
}

# BigQuery data editor role
resource "google_project_iam_member" "lrs_bigquery_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.lrs_processor.email}"
}

# Firestore user role
resource "google_project_iam_member" "lrs_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.lrs_processor.email}"
}

# =============================================================================
# CLOUD FUNCTIONS
# =============================================================================

# Storage bucket for function source
resource "google_storage_bucket" "functions_source" {
  name     = "${var.project_id}-functions-source-${var.environment}"
  location = var.region

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

# Cloud Function for statement processing
resource "google_cloudfunctions2_function" "process_statement" {
  name     = "process-xapi-statement-${var.environment}"
  location = var.region

  description = "Process xAPI statements and update learner mastery"

  build_config {
    runtime     = "nodejs20"
    entry_point = "processStatement"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = "functions/process-statement.zip"
      }
    }
  }

  service_config {
    max_instance_count    = 100
    min_instance_count    = 0
    available_memory      = "256M"
    timeout_seconds       = 60
    service_account_email = google_service_account.lrs_processor.email

    environment_variables = {
      PROJECT_ID  = var.project_id
      ENVIRONMENT = var.environment
    }
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.xapi_statements.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }

  labels = {
    environment = var.environment
    component   = "lrs"
  }
}

# =============================================================================
# OUTPUTS
# =============================================================================

output "pubsub_topic_name" {
  description = "Pub/Sub topic name for xAPI statements"
  value       = google_pubsub_topic.xapi_statements.name
}

output "pubsub_topic_id" {
  description = "Pub/Sub topic ID for xAPI statements"
  value       = google_pubsub_topic.xapi_statements.id
}

output "bigquery_dataset_id" {
  description = "BigQuery dataset ID"
  value       = google_bigquery_dataset.inspire_lrs.dataset_id
}

output "bigquery_table_id" {
  description = "BigQuery table ID for statements"
  value       = google_bigquery_table.xapi_statements.table_id
}

output "service_account_email" {
  description = "LRS processor service account email"
  value       = google_service_account.lrs_processor.email
}

output "cloud_function_uri" {
  description = "Cloud Function URI for statement processing"
  value       = google_cloudfunctions2_function.process_statement.service_config[0].uri
}
