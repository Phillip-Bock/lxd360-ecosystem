#!/bin/bash
# =============================================================================
# LXD360 Cloud Run Deployment Script
# =============================================================================
# Usage: ./deploy-cloud-run.sh [environment]
# 
# Environments:
#   dev  - Deploy to development (default)
#   prod - Deploy to production
# =============================================================================

set -e

# Configuration
PROJECT_ID="lxd-saas-dev"
REGION="us-central1"
SERVICE_NAME="lxd360-app"
MIN_INSTANCES=1
MAX_INSTANCES=10
MEMORY="2Gi"
CPU=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  LXD360 Cloud Run Deployment${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Check gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verify authentication
echo -e "${YELLOW}Verifying GCP authentication...${NC}"
gcloud auth print-access-token > /dev/null 2>&1 || {
    echo -e "${RED}Error: Not authenticated with GCP${NC}"
    echo "Run: gcloud auth login"
    exit 1
}

# Set project
echo -e "${YELLOW}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Navigate to app directory
cd "$(dirname "$0")"

echo ""
echo -e "${YELLOW}Building and deploying to Cloud Run...${NC}"
echo "  Project:   ${PROJECT_ID}"
echo "  Region:    ${REGION}"
echo "  Service:   ${SERVICE_NAME}"
echo "  Memory:    ${MEMORY}"
echo "  CPU:       ${CPU}"
echo "  Instances: ${MIN_INSTANCES}-${MAX_INSTANCES}"
echo ""

# Deploy using Cloud Build + Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory ${MEMORY} \
  --cpu ${CPU} \
  --min-instances ${MIN_INSTANCES} \
  --max-instances ${MAX_INSTANCES} \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "NEXT_PUBLIC_CLOUD_RUN=true" \
  --timeout 300 \
  --concurrency 80

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo -e "Service URL: ${GREEN}${SERVICE_URL}${NC}"
echo ""

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/api/health" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP ${HTTP_STATUS})${NC}"
else
    echo -e "${YELLOW}⚠ Health check returned HTTP ${HTTP_STATUS}${NC}"
    echo "  This may be normal if the service is still starting."
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Test the deployment: curl ${SERVICE_URL}/api/health"
echo "  2. Configure custom domain: gcloud run domain-mappings create"
echo "  3. Set up Stripe webhook: ${SERVICE_URL}/api/webhooks/stripe"
echo ""
