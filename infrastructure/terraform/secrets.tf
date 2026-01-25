# =============================================================================
# SECRET MANAGER — CODEX COMPLIANT
# =============================================================================
# Section 2.2: Sensitive values via Secret Manager, not plain env vars

# -----------------------------------------------------------------------------
# FIREBASE SECRETS
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "firebase_private_key" {
  project   = var.project_id
  secret_id = "firebase-private-key-${var.environment}"

  labels = {
    environment = var.environment
    component   = "auth"
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "firebase_private_key" {
  secret      = google_secret_manager_secret.firebase_private_key.id
  secret_data = var.firebase_private_key
}

resource "google_secret_manager_secret" "firebase_client_email" {
  project   = var.project_id
  secret_id = "firebase-client-email-${var.environment}"

  labels = {
    environment = var.environment
    component   = "auth"
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "firebase_client_email" {
  secret      = google_secret_manager_secret.firebase_client_email.id
  secret_data = var.firebase_client_email
}

# -----------------------------------------------------------------------------
# STRIPE SECRETS
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "stripe_secret_key" {
  project   = var.project_id
  secret_id = "stripe-secret-key-${var.environment}"

  labels = {
    environment = var.environment
    component   = "payments"
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "stripe_secret_key" {
  secret      = google_secret_manager_secret.stripe_secret_key.id
  secret_data = var.stripe_secret_key
}

resource "google_secret_manager_secret" "stripe_webhook_secret" {
  project   = var.project_id
  secret_id = "stripe-webhook-secret-${var.environment}"

  labels = {
    environment = var.environment
    component   = "payments"
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "stripe_webhook_secret" {
  secret      = google_secret_manager_secret.stripe_webhook_secret.id
  secret_data = var.stripe_webhook_secret
}

# -----------------------------------------------------------------------------
# BREVO (EMAIL) SECRETS
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "brevo_api_key" {
  project   = var.project_id
  secret_id = "brevo-api-key-${var.environment}"

  labels = {
    environment = var.environment
    component   = "email"
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "brevo_api_key" {
  secret      = google_secret_manager_secret.brevo_api_key.id
  secret_data = var.brevo_api_key
}

# -----------------------------------------------------------------------------
# SECRET ACCESS GRANTS
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret_iam_member" "firebase_private_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_private_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "firebase_client_email_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.firebase_client_email.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "stripe_secret_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_secret_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "stripe_webhook_secret_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.stripe_webhook_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "brevo_api_key_access" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.brevo_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}
