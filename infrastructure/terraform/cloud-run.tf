# =============================================================================
# CLOUD RUN SERVICE — CODEX COMPLIANT
# =============================================================================
# Implements Section 2.1 of the Unified Codex:
# - Gen2 execution environment (microVMs)
# - CPU Boost for cold start mitigation
# - Min instances for production readiness
# - Concurrency tuned for SSR workloads

resource "google_cloud_run_v2_service" "inspire_web" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    # Gen2 execution environment (Section 2.1.1)
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    # Container concurrency (Section 2.1.4)
    max_instance_request_concurrency = 80

    containers {
      image = var.container_image

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
        cpu_idle          = true
        startup_cpu_boost = true # CRITICAL: Reduces cold start by 50%
      }

      # Environment variables (non-sensitive)
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "NEXT_TELEMETRY_DISABLED"
        value = "1"
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "NEXT_PUBLIC_APP_ENV"
        value = var.environment
      }

      # Secrets from Secret Manager (Section 2.2)
      env {
        name = "FIREBASE_PRIVATE_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.firebase_private_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "FIREBASE_CLIENT_EMAIL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.firebase_client_email.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.stripe_secret_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "STRIPE_WEBHOOK_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.stripe_webhook_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "BREVO_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.brevo_api_key.secret_id
            version = "latest"
          }
        }
      }

      # Startup probe for health checks
      startup_probe {
        http_get {
          path = "/api/health"
          port = 3000
        }
        initial_delay_seconds = 10
        timeout_seconds       = 3
        period_seconds        = 5
        failure_threshold     = 10
      }

      # Liveness probe
      liveness_probe {
        http_get {
          path = "/api/health"
          port = 3000
        }
        timeout_seconds   = 3
        period_seconds    = 30
        failure_threshold = 3
      }
    }

    scaling {
      # Min instances (Section 2.1.3)
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = var.max_instances
    }

    # Service account with least privilege
    service_account = google_service_account.cloud_run_sa.email

    # Timeout for long-running SSR
    timeout = "60s"
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = {
    environment = var.environment
    component   = "web"
    managed_by  = "terraform"
  }

  depends_on = [
    google_project_service.run,
    google_secret_manager_secret_version.firebase_private_key,
    google_secret_manager_secret_version.firebase_client_email,
    google_secret_manager_secret_version.stripe_secret_key,
    google_secret_manager_secret_version.stripe_webhook_secret,
    google_secret_manager_secret_version.brevo_api_key,
  ]
}

# Allow unauthenticated access (public web app)
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.inspire_web.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# =============================================================================
# OUTPUTS
# =============================================================================

output "cloud_run_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.inspire_web.uri
}

output "cloud_run_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_v2_service.inspire_web.name
}
