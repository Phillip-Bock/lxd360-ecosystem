'use client';

export const dynamic = 'force-dynamic';

import { MissionControlDashboard } from '@/components/ignite/mission-control';

/**
 * INSPIRE Ignite Dashboard Page
 *
 * NASA-grade Mission Control dashboard with role-based views.
 * Integrates Phase 7/8 adaptive learning and analytics features.
 */
export default function DashboardPage() {
  return <MissionControlDashboard />;
}
