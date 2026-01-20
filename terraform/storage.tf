# =============================================================================
# Cloud Storage Buckets
# =============================================================================

# Avatars - Public read for profile images
resource "google_storage_bucket" "avatars" {
  name          = "${var.app_name}-avatars"
  location      = var.region
  force_destroy = var.environment == "dev"

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
}



# Course Assets - Public read for thumbnails, images
resource "google_storage_bucket" "course_assets" {
  name          = "${var.app_name}-course-assets"
  location      = var.region
  force_destroy = var.environment == "dev"

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
}



# User Uploads - Private
resource "google_storage_bucket" "user_uploads" {
  name          = "${var.app_name}-user-uploads"
  location      = var.region
  force_destroy = var.environment == "dev"

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}

# Generated Content - AI-generated videos, images
resource "google_storage_bucket" "generated_content" {
  name          = "${var.app_name}-generated-content"
  location      = var.region
  force_destroy = var.environment == "dev"

  uniform_bucket_level_access = true
}

# Backups - Private, lifecycle to coldline
resource "google_storage_bucket" "backups" {
  name          = "${var.app_name}-backups"
  location      = var.region
  force_destroy = var.environment == "dev"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

