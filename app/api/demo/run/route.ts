export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { DemoOrchestrator } from '@/lib/agents/demo-orchestrator';
import { type DemoAPIResponse, type DemoResult, RunDemoRequestSchema } from '@/lib/agents/types';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-demo-run' });

/**
 * POST /api/demo/run
 *
 * Runs a demo scenario and returns the results.
 *
 * @body {
 *   scenarioId: string;
 *   options?: {
 *     simulateRealTime?: boolean;
 *     generateXAPIStatements?: boolean;
 *     storeStatements?: boolean;
 *     organizationId?: string;
 *   }
 * }
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<DemoAPIResponse<DemoResult>>> {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = RunDemoRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    const { scenarioId, options } = parseResult.data;

    // Check if scenario exists
    const scenario = DemoOrchestrator.getScenario(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SCENARIO_NOT_FOUND',
            message: `Scenario not found: ${scenarioId}`,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    log.info('Starting demo scenario', { scenarioId });

    // Create orchestrator with configuration
    const orchestrator = new DemoOrchestrator({
      storeStatements: options?.storeStatements ?? false,
      organizationId: options?.organizationId,
    });

    // Run the demo
    const result = await orchestrator.runDemo(scenarioId);

    const durationMs = Date.now() - startTime;
    log.info('Demo scenario completed', {
      scenarioId,
      durationMs,
      learnerCount: result.summary.totalLearners,
      statementCount: result.summary.totalXAPIStatements,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          durationMs,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error('Failed to run demo scenario', { error, durationMs });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          durationMs,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/demo/run
 *
 * Returns information about the demo run endpoint.
 */
export async function GET(): Promise<
  NextResponse<DemoAPIResponse<{ message: string; availableScenarios: string[] }>>
> {
  const scenarios = DemoOrchestrator.getAllScenarios();

  return NextResponse.json({
    success: true,
    data: {
      message: 'Use POST to run a demo scenario',
      availableScenarios: scenarios.map((s) => s.id),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
