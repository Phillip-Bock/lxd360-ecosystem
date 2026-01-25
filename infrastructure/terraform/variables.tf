# =============================================================================
# INSPIRE Platform Infrastructure Variables
# =============================================================================
# Codex Section 2.2: All infrastructure configuration via Terraform
# =============================================================================

# -----------------------------------------------------------------------------
# PROJECT CONFIGURATION
# -----------------------------------------------------------------------------

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "lxd-saas-dev"
}

variable "region" {
  description = "GCP Region for resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production"
  }
}

# -----------------------------------------------------------------------------
# CLOUD RUN CONFIGURATION
# -----------------------------------------------------------------------------

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "inspire-web"
}

variable "container_image" {
  description = "Container image URL (gcr.io or artifact registry)"
  type        = string
  default     = "gcr.io/lxd-saas-dev/inspire-web:latest"
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
  default     = 10

  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 100
    error_message = "max_instances must be between 1 and 100"
  }
}

# -----------------------------------------------------------------------------
# LRS CONFIGURATION
# -----------------------------------------------------------------------------

variable "bigquery_retention_days" {
  description = "BigQuery table retention in days (default 7 years for compliance)"
  type        = number
  default     = 2557 # ~7 years
}

variable "pubsub_retention_days" {
  description = "Pub/Sub message retention in days"
  type        = number
  default     = 7
}

# -----------------------------------------------------------------------------
# SECRETS (Sensitive - provide via environment or tfvars)
# -----------------------------------------------------------------------------

variable "firebase_private_key" {
  description = "Firebase Admin SDK private key (PEM format)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "firebase_client_email" {
  description = "Firebase Admin SDK service account email"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_secret_key" {
  description = "Stripe secret API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "brevo_api_key" {
  description = "Brevo (Sendinblue) API key"
  type        = string
  sensitive   = true
  default     = ""
}
