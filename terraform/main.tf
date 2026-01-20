# =============================================================================
# LXD360 Platform - Terraform Configuration
# =============================================================================

terraform {
  required_version = ">= 1.14.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

# -----------------------------------------------------------------------------
# Provider Configuration
# -----------------------------------------------------------------------------

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# -----------------------------------------------------------------------------
# Enable Required APIs
# -----------------------------------------------------------------------------

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",              # Cloud Run
    "firestore.googleapis.com",        # Firestore
    "firebase.googleapis.com",         # Firebase
    "storage.googleapis.com",          # Cloud Storage
    "cloudtasks.googleapis.com",       # Cloud Tasks
    "pubsub.googleapis.com",           # Pub/Sub
    "secretmanager.googleapis.com",    # Secret Manager
    "artifactregistry.googleapis.com", # Artifact Registry
    "cloudbuild.googleapis.com",       # Cloud Build
    "bigquery.googleapis.com",         # BigQuery
    "aiplatform.googleapis.com",       # Vertex AI
    "dns.googleapis.com",              # Cloud DNS
    "compute.googleapis.com",          # Compute Engine (networking)
    "vpcaccess.googleapis.com",        # VPC Access (serverless)
    "cloudscheduler.googleapis.com",   # Cloud Scheduler
    "logging.googleapis.com",          # Cloud Logging
    "monitoring.googleapis.com",       # Cloud Monitoring
    "identitytoolkit.googleapis.com",  # Identity Toolkit (Firebase Auth)
  ])

  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}
