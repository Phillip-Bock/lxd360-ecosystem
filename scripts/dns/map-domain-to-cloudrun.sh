#!/bin/bash
#
# LXD360 Cloud Run Domain Mapping Script
# Ticket: LXD-244
#
# This script maps custom domains to Cloud Run services and configures DNS
# Idempotent: Safe to run multiple times
#
# Usage: ./map-domain-to-cloudrun.sh [--dry-run] [--domain=DOMAIN]
#

set -euo pipefail

# Configuration
PROJECT_ID="lxd-saas-dev"
ZONE_NAME="lxd360-zone"
DOMAIN="lxd360.io"
REGION="us-central1"
SERVICE_NAME="lxd360-app"

# Subdomains to map (all point to same service for Next.js routing)
SUBDOMAINS=("app" "api" "studio" "docs")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
SINGLE_DOMAIN=""

for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            echo -e "${YELLOW}Running in DRY RUN mode - no changes will be made${NC}"
            ;;
        --domain=*)
            SINGLE_DOMAIN="${arg#*=}"
            ;;
    esac
done

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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Execute command or show dry run
run_cmd() {
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would execute: $*"
        return 0
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

    # Check if Cloud Run service exists
    if ! gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" > /dev/null 2>&1; then
        log_error "Cloud Run service $SERVICE_NAME not found in $REGION"
        log_error "Deploy the service first: gcloud run deploy $SERVICE_NAME --source . --region=$REGION"
        exit 1
    fi

    # Check if DNS zone exists
    if ! gcloud dns managed-zones describe "$ZONE_NAME" --project="$PROJECT_ID" > /dev/null 2>&1; then
        log_error "DNS zone $ZONE_NAME not found. Run setup-cloud-dns.sh first."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Set the project
set_project() {
    log_info "Setting project to $PROJECT_ID..."
    run_cmd gcloud config set project "$PROJECT_ID"
}

# Check if domain mapping exists
mapping_exists() {
    local domain="$1"
    gcloud run domain-mappings describe \
        --domain="$domain" \
        --region="$REGION" \
        --project="$PROJECT_ID" > /dev/null 2>&1
}

# Check if DNS record exists
record_exists() {
    local name="$1"
    local type="$2"
    gcloud dns record-sets describe "$name" \
        --zone="$ZONE_NAME" \
        --type="$type" \
        --project="$PROJECT_ID" > /dev/null 2>&1
}

# Create domain mapping
create_mapping() {
    local domain="$1"

    log_step "Processing domain: $domain"

    if mapping_exists "$domain"; then
        log_warning "Domain mapping for $domain already exists. Skipping."
        return 0
    fi

    log_info "Creating domain mapping for $domain -> $SERVICE_NAME..."
    run_cmd gcloud run domain-mappings create \
        --service="$SERVICE_NAME" \
        --domain="$domain" \
        --region="$REGION" \
        --project="$PROJECT_ID"

    log_success "Domain mapping created for $domain"
}

# Get resource records from domain mapping
get_resource_records() {
    local domain="$1"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would get resource records for $domain"
        return 0
    fi

    gcloud run domain-mappings describe \
        --domain="$domain" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="yaml(status.resourceRecords)"
}

# Add CNAME record for subdomain
add_cname_record() {
    local subdomain="$1"
    local fqdn="${subdomain}.${DOMAIN}."

    log_info "Checking CNAME record for $fqdn..."

    if record_exists "$fqdn" "CNAME"; then
        log_warning "CNAME record for $fqdn already exists. Skipping."
        return 0
    fi

    log_info "Adding CNAME record: $fqdn -> ghs.googlehosted.com."
    run_cmd gcloud dns record-sets create "$fqdn" \
        --zone="$ZONE_NAME" \
        --type="CNAME" \
        --ttl="300" \
        --rrdatas="ghs.googlehosted.com." \
        --project="$PROJECT_ID"

    log_success "CNAME record added for $fqdn"
}

# Add A records for root domain
add_root_domain_records() {
    log_step "Configuring root domain: $DOMAIN"

    # Create mapping first
    create_mapping "$DOMAIN"

    if [[ "$DRY_RUN" == true ]]; then
        log_warning "In dry run mode, cannot get actual IPs. Showing example."
        echo "Would add A records for $DOMAIN with IPs from domain mapping"
        return 0
    fi

    # Get the resource records
    log_info "Getting resource records for root domain..."
    local records
    records=$(get_resource_records "$DOMAIN")

    if [[ -z "$records" ]]; then
        log_warning "No resource records returned yet. Domain mapping may still be processing."
        log_info "You may need to wait and run this script again to add A records."
        return 0
    fi

    echo ""
    echo "Resource records for $DOMAIN:"
    echo "$records"
    echo ""
    log_info "Add the A and AAAA records shown above to your DNS zone."
    log_info "Use: gcloud dns record-sets create ${DOMAIN}. --zone=$ZONE_NAME --type=A --ttl=300 --rrdatas='IP1,IP2,...'"
}

# Map a subdomain
map_subdomain() {
    local subdomain="$1"
    local fqdn="${subdomain}.${DOMAIN}"

    log_step "Mapping subdomain: $fqdn"

    # Create the domain mapping
    create_mapping "$fqdn"

    # Add CNAME record
    add_cname_record "$subdomain"
}

# Check mapping status
check_status() {
    local domain="$1"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would check status for $domain"
        return 0
    fi

    log_info "Checking status for $domain..."

    local status
    status=$(gcloud run domain-mappings describe \
        --domain="$domain" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.conditions.type,status.conditions.status)" 2>/dev/null || echo "NOT_FOUND")

    if [[ "$status" == "NOT_FOUND" ]]; then
        echo "  Status: Not mapped"
    else
        echo "  Status: $status"
    fi
}

# List all mappings
list_mappings() {
    log_info "Listing all domain mappings..."

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would list all domain mappings"
        return 0
    fi

    echo ""
    echo "========================================"
    echo "DOMAIN MAPPINGS"
    echo "========================================"
    gcloud run domain-mappings list \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="table(DOMAIN,SERVICE,REGION)"
    echo "========================================"
}

# Verify SSL certificates
verify_ssl() {
    log_info "Checking SSL certificate status..."

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would verify SSL certificates"
        return 0
    fi

    echo ""
    echo "========================================"
    echo "SSL CERTIFICATE STATUS"
    echo "========================================"

    for subdomain in "${SUBDOMAINS[@]}"; do
        local fqdn="${subdomain}.${DOMAIN}"
        echo -n "$fqdn: "
        if timeout 5 openssl s_client -servername "$fqdn" -connect "${fqdn}:443" </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
            echo "  Valid"
        else
            echo "  Not ready (certificate still provisioning or DNS not propagated)"
        fi
    done

    echo "========================================"
    echo ""
    echo "Note: SSL certificates take 15-30 minutes to provision after DNS propagation."
}

# Display next steps
display_next_steps() {
    echo ""
    echo "========================================"
    echo "NEXT STEPS"
    echo "========================================"
    echo ""
    echo "1. Verify DNS propagation:"
    echo "   dig app.$DOMAIN CNAME +short"
    echo "   Expected: ghs.googlehosted.com."
    echo ""
    echo "2. Check domain mapping status:"
    echo "   gcloud run domain-mappings list --region=$REGION"
    echo ""
    echo "3. Test HTTPS access (after SSL provisioning):"
    echo "   curl -I https://app.$DOMAIN"
    echo ""
    echo "4. SSL provisioning takes 15-30 minutes after DNS is verified."
    echo ""
    echo "========================================"
}

# Main function
main() {
    echo ""
    echo "========================================"
    echo "LXD360 Cloud Run Domain Mapping"
    echo "========================================"
    echo "Project: $PROJECT_ID"
    echo "Service: $SERVICE_NAME"
    echo "Domain: $DOMAIN"
    echo "Region: $REGION"
    echo "========================================"
    echo ""

    check_prerequisites
    set_project

    if [[ -n "$SINGLE_DOMAIN" ]]; then
        # Map single domain
        if [[ "$SINGLE_DOMAIN" == "$DOMAIN" ]]; then
            add_root_domain_records
        else
            # Extract subdomain
            local subdomain="${SINGLE_DOMAIN%%.*}"
            map_subdomain "$subdomain"
        fi
    else
        # Map root domain
        add_root_domain_records

        # Map all subdomains
        for subdomain in "${SUBDOMAINS[@]}"; do
            map_subdomain "$subdomain"
        done
    fi

    # Show results
    list_mappings

    # Check SSL status
    if [[ "$DRY_RUN" != true ]]; then
        # Only check SSL if not dry run
        echo ""
        echo "Checking SSL status (may fail if DNS not propagated yet)..."
        verify_ssl || true
    fi

    display_next_steps

    echo ""
    log_success "Domain mapping complete!"
    echo ""
}

# Run main function
main
