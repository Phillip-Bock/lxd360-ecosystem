# =============================================================================
# Terraform State Backend Configuration
# =============================================================================

terraform {
  backend "gcs" {
    bucket = "lxd360-terraform-state"
    prefix = "terraform/state"
  }
}
