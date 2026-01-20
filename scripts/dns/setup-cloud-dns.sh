#!/bin/bash
#
# LXD360 Cloud DNS Setup Script
# Ticket: LXD-244
#
# This script creates and configures Cloud DNS zone for lxd360.io
# Idempotent: Safe to run multiple times
#
# Usage: ./setup-cloud-dns.sh [--dry-run]
#

set -euo pipefail

# Configuration
PROJECT_ID="lxd-saas-dev"
ZONE_NAME="lxd360-zone"
DOMAIN="lxd360.io"
REGION="us-central1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in DRY RUN mode - no changes will be made${NC}"
fi

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Execute command or show dry run
run_cmd() {
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would execute: $*"
    else
        "$@"
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi

    # Check authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null 2>&1; then
        log_error "Not authenticated with gcloud. Run: gcloud auth login"
        exit 1
    fi

    # Check project access
    if ! gcloud projects describe "$PROJECT_ID" > /dev/null 2>&1; then
        log_error "Cannot access project $PROJECT_ID. Check permissions."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Set the project
set_project() {
    log_info "Setting project to $PROJECT_ID..."
    run_cmd gcloud config set project "$PROJECT_ID"
    log_success "Project set to $PROJECT_ID"
}

# Check if zone exists
zone_exists() {
    gcloud dns managed-zones describe "$ZONE_NAME" --project="$PROJECT_ID" > /dev/null 2>&1
}

# Create DNS zone
create_zone() {
    log_info "Checking if zone $ZONE_NAME exists..."

    if zone_exists; then
        log_warning "Zone $ZONE_NAME already exists. Skipping creation."
        return 0
    fi

    log_info "Creating DNS zone $ZONE_NAME for $DOMAIN..."
    run_cmd gcloud dns managed-zones create "$ZONE_NAME" \
        --description="DNS zone for $DOMAIN production domain" \
        --dns-name="${DOMAIN}." \
        --visibility=public \
        --dnssec-state=on \
        --project="$PROJECT_ID"

    log_success "DNS zone $ZONE_NAME created"
}

# Check if record exists
record_exists() {
    local name="$1"
    local type="$2"
    gcloud dns record-sets describe "$name" \
        --zone="$ZONE_NAME" \
        --type="$type" \
        --project="$PROJECT_ID" > /dev/null 2>&1
}

# Add DNS record (idempotent)
add_record() {
    local name="$1"
    local type="$2"
    local ttl="$3"
    shift 3
    local data="$*"

    log_info "Checking record: $name ($type)..."

    if record_exists "$name" "$type"; then
        log_warning "Record $name ($type) already exists. Skipping."
        return 0
    fi

    log_info "Adding record: $name ($type) -> $data"
    run_cmd gcloud dns record-sets create "$name" \
        --zone="$ZONE_NAME" \
        --type="$type" \
        --ttl="$ttl" \
        --rrdatas="$data" \
        --project="$PROJECT_ID"

    log_success "Record $name ($type) added"
}

# Add all DNS records
add_dns_records() {
    log_info "Adding DNS records..."

    # WWW CNAME
    add_record "www.${DOMAIN}." "CNAME" "300" "${DOMAIN}."

    # CAA record for Google-managed certificates
    add_record "${DOMAIN}." "CAA" "3600" '0 issue "pki.goog"'

    # Note: A/AAAA records for root domain and CNAME for subdomains
    # will be added after Cloud Run domain mapping provides the IPs

    log_success "Base DNS records added"
}

# Display nameservers
display_nameservers() {
    log_info "Retrieving nameservers for $ZONE_NAME..."

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would display nameservers"
        return 0
    fi

    echo ""
    echo "========================================"
    echo "NAMESERVERS FOR ${DOMAIN}"
    echo "========================================"
    gcloud dns managed-zones describe "$ZONE_NAME" \
        --project="$PROJECT_ID" \
        --format="value(nameServers)" | tr ';' '\n'
    echo ""
    echo "Update these nameservers at your domain registrar."
    echo "========================================"
}

# Verify DNS propagation
verify_dns() {
    log_info "Verifying DNS configuration..."

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would verify DNS propagation"
        return 0
    fi

    echo ""
    echo "========================================"
    echo "DNS VERIFICATION"
    echo "========================================"

    # Check NS records
    echo "Nameservers (should show Google Cloud DNS):"
    dig +short NS "$DOMAIN" || echo "  (not yet propagated)"

    echo ""
    echo "To check propagation from Google DNS:"
    echo "  dig @8.8.8.8 $DOMAIN NS"
    echo ""
    echo "Full propagation may take 24-48 hours."
    echo "========================================"
}

# List all records
list_records() {
    log_info "Listing all records in $ZONE_NAME..."

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would list records"
        return 0
    fi

    echo ""
    echo "========================================"
    echo "CURRENT DNS RECORDS"
    echo "========================================"
    gcloud dns record-sets list \
        --zone="$ZONE_NAME" \
        --project="$PROJECT_ID" \
        --format="table(NAME,TYPE,TTL,DATA)"
    echo "========================================"
}

# Main function
main() {
    echo ""
    echo "========================================"
    echo "LXD360 Cloud DNS Setup"
    echo "========================================"
    echo "Project: $PROJECT_ID"
    echo "Zone: $ZONE_NAME"
    echo "Domain: $DOMAIN"
    echo "========================================"
    echo ""

    check_prerequisites
    set_project
    create_zone
    add_dns_records
    display_nameservers
    list_records
    verify_dns

    echo ""
    log_success "Cloud DNS setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update nameservers at your domain registrar"
    echo "2. Wait for DNS propagation (1-48 hours)"
    echo "3. Run map-domain-to-cloudrun.sh to add Cloud Run mappings"
    echo ""
}

# Run main function
main
