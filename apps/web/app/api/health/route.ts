import { NextResponse } from 'next/server';

/**
 * Health check endpoint for the web application
 * Used by: Status page, Cloud Run health checks, load balancers
 *
 * @route GET /api/health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Basic health check - app is running
    const health = {
      status: 'healthy',
      service: 'inspire-web',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      region: process.env.CLOUD_RUN_REGION || 'local',
      responseTime: 0,
    };

    health.responseTime = Date.now() - startTime;

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${health.responseTime}ms`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'inspire-web',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

// Support HEAD requests for simple ping checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
