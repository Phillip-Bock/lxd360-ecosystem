#!/bin/bash

# =============================================================================
# LXP360-SaaS | xAPI to BigQuery Cloud Function Deployment Script
# =============================================================================
#
# This script deploys the xAPI ingestion Cloud Function to Google Cloud.
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - Correct GCP project selected
# - BigQuery dataset and table created
#
# Usage:
#   ./deploy.sh [environment]
#
# Environment:
#   dev (default) - Deploy to development environment
#   prod          - Deploy to production environment
#
# Linear Ticket: LXD-293
# =============================================================================

set -e  # Exit on error

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

FUNCTION_NAME="xapi-to-bigquery"
REGION="us-central1"
RUNTIME="nodejs20"
ENTRY_POINT="handleXAPIStatement"
MEMORY="256MB"
TIMEOUT="60s"
MIN_INSTANCES=0
MAX_INSTANCES=100

# Project configuration
DEV_PROJECT="lxd-saas-dev"
PROD_PROJECT="lxd360-platform"

# BigQuery configuration
DEV_DATASET="xapi_lrs"
PROD_DATASET="xapi_lrs"
TABLE_NAME="statements"

# Service account
SERVICE_ACCOUNT_PREFIX="xapi-ingestion"

# -----------------------------------------------------------------------------
# Parse Arguments
# -----------------------------------------------------------------------------

ENVIRONMENT="${1:-dev}"

case "$ENVIRONMENT" in
  dev)
    PROJECT_ID="$DEV_PROJECT"
    DATASET_ID="$DEV_DATASET"
    SERVICE_ACCOUNT="${SERVICE_ACCOUNT_PREFIX}@${DEV_PROJECT}.iam.gserviceaccount.com"
    ;;
  prod)
    PROJECT_ID="$PROD_PROJECT"
    DATASET_ID="$PROD_DATASET"
    SERVICE_ACCOUNT="${SERVICE_ACCOUNT_PREFIX}@${PROD_PROJECT}.iam.gserviceaccount.com"
    MIN_INSTANCES=1  # Keep warm in production
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    echo "Usage: ./deploy.sh [dev|prod]"
    exit 1
    ;;
esac

# -----------------------------------------------------------------------------
# Pre-deployment Checks
# -----------------------------------------------------------------------------

echo "=========================================="
echo "xAPI to BigQuery Function Deployment"
echo "=========================================="
echo ""
echo "Environment: $ENVIRONMENT"
echo "Project:     $PROJECT_ID"
echo "Region:      $REGION"
echo "Function:    $FUNCTION_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed"
  exit 1
fi

# Check if correct project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
  echo "Switching to project: $PROJECT_ID"
  gcloud config set project "$PROJECT_ID"
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 | grep -q "@"; then
  echo "Error: Not logged in to gcloud"
  echo "Run: gcloud auth login"
  exit 1
fi

# -----------------------------------------------------------------------------
# Build TypeScript
# -----------------------------------------------------------------------------

echo ""
echo "Building TypeScript..."
echo ""

# Navigate to function directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build
npm run build

if [ ! -f "dist/index.js" ]; then
  echo "Error: Build failed - dist/index.js not found"
  exit 1
fi

echo "Build successful!"

# -----------------------------------------------------------------------------
# Deploy Cloud Function (Gen 2)
# -----------------------------------------------------------------------------

echo ""
echo "Deploying Cloud Function..."
echo ""

gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime="$RUNTIME" \
  --region="$REGION" \
  --source="$SCRIPT_DIR" \
  --entry-point="$ENTRY_POINT" \
  --trigger-http \
  --allow-unauthenticated=false \
  --memory="$MEMORY" \
  --timeout="$TIMEOUT" \
  --min-instances="$MIN_INSTANCES" \
  --max-instances="$MAX_INSTANCES" \
  --service-account="$SERVICE_ACCOUNT" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID,BIGQUERY_DATASET=$DATASET_ID,BIGQUERY_TABLE=$TABLE_NAME"

# -----------------------------------------------------------------------------
# Output Deployment Info
# -----------------------------------------------------------------------------

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""

# Get the function URL
FUNCTION_URL=$(gcloud functions describe "$FUNCTION_NAME" \
  --region="$REGION" \
  --gen2 \
  --format="value(serviceConfig.uri)" 2>/dev/null || echo "Unable to retrieve URL")

echo "Function URL: $FUNCTION_URL"
echo ""
echo "Test the function:"
echo "  curl -X POST '$FUNCTION_URL' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'Authorization: Bearer \$(gcloud auth print-identity-token)' \\"
echo "    -d '{\"organizationId\": \"test-org\", \"statement\": {...}}'"
echo ""

# -----------------------------------------------------------------------------
# Optional: Deploy Pub/Sub Trigger Function
# -----------------------------------------------------------------------------

if [ "$2" == "--with-pubsub" ]; then
  PUBSUB_FUNCTION_NAME="${FUNCTION_NAME}-pubsub"
  PUBSUB_TOPIC="xapi-statements"
  PUBSUB_ENTRY_POINT="handleXAPIStatementPubSub"

  echo ""
  echo "Deploying Pub/Sub triggered function..."
  echo ""

  gcloud functions deploy "$PUBSUB_FUNCTION_NAME" \
    --gen2 \
    --runtime="$RUNTIME" \
    --region="$REGION" \
    --source="$SCRIPT_DIR" \
    --entry-point="$PUBSUB_ENTRY_POINT" \
    --trigger-topic="$PUBSUB_TOPIC" \
    --memory="$MEMORY" \
    --timeout="$TIMEOUT" \
    --min-instances="$MIN_INSTANCES" \
    --max-instances="$MAX_INSTANCES" \
    --service-account="$SERVICE_ACCOUNT" \
    --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID,BIGQUERY_DATASET=$DATASET_ID,BIGQUERY_TABLE=$TABLE_NAME"

  echo ""
  echo "Pub/Sub function deployed: $PUBSUB_FUNCTION_NAME"
  echo "Topic: $PUBSUB_TOPIC"
fi

echo ""
echo "Done!"
