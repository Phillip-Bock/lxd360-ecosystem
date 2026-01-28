// TODO(LXD-SEC): Add authentication - this endpoint exposes available demo scenarios.
// Should require at least Editor persona to prevent information disclosure about
// internal demo capabilities.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DemoOrchestrator } from '@/lib/agents/demo-orchestrator';
import type { DemoAPIResponse, DemoScenario } from '@/lib/agents/types';

interface ScenariosResponse {
  scenarios: DemoScenario[];
  total: number;
}

/**
 * GET /api/demo/scenarios
 *
 * Lists all available demo scenarios.
 */
export async function GET(): Promise<NextResponse<DemoAPIResponse<ScenariosResponse>>> {
  const scenarios = DemoOrchestrator.getAllScenarios();

  return NextResponse.json({
    success: true,
    data: {
      scenarios,
      total: scenarios.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
