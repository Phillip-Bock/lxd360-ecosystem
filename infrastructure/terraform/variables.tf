# =============================================================================
# INSPIRE LRS Infrastructure Variables
# =============================================================================

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
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

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
