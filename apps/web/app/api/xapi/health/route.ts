export const dynamic = 'force-dynamic';

import { BigQuery } from '@google-cloud/bigquery';
import { type NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Configuration
// =============================================================================

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'lxd-saas-dev';
const DATASET_ID = process.env.BIGQUERY_DATASET || 'lxd360_analytics';

// =============================================================================
// Health Check
// =============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    bigquery: {
      status: 'ok' | 'error';
      latencyMs?: number;
      error?: string;
    };
    environment: {
      projectId: string;
      dataset: string;
      vertexConfigured: boolean;
    };
  };
}

/**
 * GET /api/xapi/health
 * Health check endpoint for LRS Bridge
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      bigquery: { status: 'ok' },
      environment: {
        projectId: PROJECT_ID,
        dataset: DATASET_ID,
        vertexConfigured: !!process.env.VERTEX_MODALITY_ENDPOINT_ID,
      },
    },
  };

  // Check BigQuery connectivity
  try {
    const bigquery = new BigQuery({ projectId: PROJECT_ID });
    const [datasets] = await bigquery.getDatasets();
    const datasetExists = datasets.some((d) => d.id === DATASET_ID);

    if (!datasetExists) {
      health.checks.bigquery.status = 'error';
      health.checks.bigquery.error = `Dataset ${DATASET_ID} not found`;
      health.status = 'degraded';
    } else {
      health.checks.bigquery.latencyMs = Date.now() - startTime;
    }
  } catch (error) {
    health.checks.bigquery.status = 'error';
    health.checks.bigquery.error = error instanceof Error ? error.message : 'Unknown error';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
