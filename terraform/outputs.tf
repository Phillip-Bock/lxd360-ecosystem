# =============================================================================
# Output Values
# =============================================================================

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "enabled_apis" {
  description = "List of enabled GCP APIs"
  value       = [for api in google_project_service.apis : api.service]
}

# =============================================================================
# Storage Outputs
# =============================================================================

output "bucket_avatars" {
  value = google_storage_bucket.avatars.name
}

output "bucket_course_assets" {
  value = google_storage_bucket.course_assets.name
}

output "bucket_user_uploads" {
  value = google_storage_bucket.user_uploads.name
}

output "bucket_generated_content" {
  value = google_storage_bucket.generated_content.name
}

output "bucket_backups" {
  value = google_storage_bucket.backups.name
}
