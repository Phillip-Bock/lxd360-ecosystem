#!/bin/bash
# =============================================================================
# LXP360-SaaS | Cloud Tasks Setup Script
# =============================================================================
#
# This script creates and configures Cloud Tasks queues in GCP.
# Run this script once during initial setup or when adding new queues.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Cloud Tasks API enabled in your GCP project
#
# Usage:
#   ./scripts/setup-cloud-tasks.sh
#
# =============================================================================

set -e

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-lxd-saas-dev}"
LOCATION="${CLOUD_TASKS_LOCATION:-us-central1}"

echo "=============================================="
echo "LXP360 Cloud Tasks Setup"
echo "=============================================="
echo "Project: $PROJECT_ID"
echo "Location: $LOCATION"
echo ""

# Ensure we're using the correct project
gcloud config set project "$PROJECT_ID"

# Enable Cloud Tasks API if not already enabled
echo "Enabling Cloud Tasks API..."
gcloud services enable cloudtasks.googleapis.com --quiet

echo ""
echo "Creating Cloud Tasks queues..."
echo ""

# =============================================================================
# Email Queue
# =============================================================================
echo "Creating email-queue..."
gcloud tasks queues create email-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=100 \
  --max-attempts=5 \
  --min-backoff=1s \
  --max-backoff=60s \
  --max-doublings=4 \
  --quiet 2>/dev/null || echo "  Queue email-queue already exists, updating..."

gcloud tasks queues update email-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=100 \
  --max-attempts=5 \
  --min-backoff=1s \
  --max-backoff=60s \
  --max-doublings=4 \
  --quiet

echo "  ✓ email-queue configured"

# =============================================================================
# Video Generation Queue
# =============================================================================
echo "Creating video-generation-queue..."
gcloud tasks queues create video-generation-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=2 \
  --max-concurrent-dispatches=10 \
  --max-attempts=3 \
  --min-backoff=10s \
  --max-backoff=300s \
  --max-doublings=3 \
  --quiet 2>/dev/null || echo "  Queue video-generation-queue already exists, updating..."

gcloud tasks queues update video-generation-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=2 \
  --max-concurrent-dispatches=10 \
  --max-attempts=3 \
  --min-backoff=10s \
  --max-backoff=300s \
  --max-doublings=3 \
  --quiet

echo "  ✓ video-generation-queue configured"

# =============================================================================
# Analytics Queue
# =============================================================================
echo "Creating analytics-queue..."
gcloud tasks queues create analytics-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=50 \
  --max-concurrent-dispatches=200 \
  --max-attempts=5 \
  --min-backoff=2s \
  --max-backoff=120s \
  --max-doublings=4 \
  --quiet 2>/dev/null || echo "  Queue analytics-queue already exists, updating..."

gcloud tasks queues update analytics-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=50 \
  --max-concurrent-dispatches=200 \
  --max-attempts=5 \
  --min-backoff=2s \
  --max-backoff=120s \
  --max-doublings=4 \
  --quiet

echo "  ✓ analytics-queue configured"

# =============================================================================
# Subscription Queue
# =============================================================================
echo "Creating subscription-queue..."
gcloud tasks queues create subscription-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=20 \
  --max-concurrent-dispatches=50 \
  --max-attempts=10 \
  --min-backoff=5s \
  --max-backoff=600s \
  --max-doublings=5 \
  --quiet 2>/dev/null || echo "  Queue subscription-queue already exists, updating..."

gcloud tasks queues update subscription-queue \
  --location="$LOCATION" \
  --max-dispatches-per-second=20 \
  --max-concurrent-dispatches=50 \
  --max-attempts=10 \
  --min-backoff=5s \
  --max-backoff=600s \
  --max-doublings=5 \
  --quiet

echo "  ✓ subscription-queue configured"

echo ""
echo "=============================================="
echo "Setup Complete!"
echo "=============================================="
echo ""
echo "Created/updated queues:"
gcloud tasks queues list --location="$LOCATION" --format="table(name,state)"
echo ""
echo "Next steps:"
echo "1. Set CLOUD_TASKS_SERVICE_ACCOUNT environment variable"
echo "2. Deploy the application to Cloud Run"
echo "3. Test task enqueueing"
echo ""
