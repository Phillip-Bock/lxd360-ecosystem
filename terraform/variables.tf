# =============================================================================
# Input Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "Default GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Default GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "domain" {
  description = "Primary domain for the platform"
  type        = string
  default     = "lxd360.io"
}

variable "app_name" {
  description = "Application name prefix for resources"
  type        = string
  default     = "lxd360"
}
