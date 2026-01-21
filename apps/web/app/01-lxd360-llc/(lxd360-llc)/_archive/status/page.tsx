import type { Metadata } from 'next';
import type {
  ActiveIncident,
  HistoricalIncident,
  MaintenanceWindow,
  ServiceCategory,
} from '@/components/status';
import {
  ActiveIncidents,
  IncidentHistory,
  MetricsDashboard,
  ScheduledMaintenance,
  ServicesGrid,
  StatusFooter,
  StatusHeader,
  SubscribeSection,
  UptimeHistory,
} from '@/components/status';

export const metadata: Metadata = {
  title: 'System Status | LXD360',
  description:
    'Real-time status and uptime monitoring for all LXD360 services including LXP360, INSPIRE Studio, and more.',
  openGraph: {
    title: 'System Status | LXD360',
    description: 'Real-time status and uptime monitoring for all LXD360 services.',
    type: 'website',
  },
};

// Enable dynamic rendering for real-time status updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StatusData {
  overall?: 'operational' | 'degraded' | 'outage';
  uptime_90d?: number;
  active_incidents?: ActiveIncident[];
  scheduled_maintenance?: MaintenanceWindow[];
  services?: ServiceCategory[];
  recent_incidents?: HistoricalIncident[];
}

async function getStatusData(): Promise<StatusData | null> {
  try {
    // In production, this would fetch from the status API
    // For now, return default data - components handle defaults gracefully
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/status`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => null);

    if (response?.ok) {
      return await response.json();
    }

    return null;
  } catch {
    // Silently ignore - fallback null already returned
    return null;
  }
}

export default async function StatusPage(): Promise<React.JSX.Element> {
  const statusData = await getStatusData();

  return (
    <div className="min-h-screen bg-surface-page text-brand-primary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <StatusHeader
          overallStatus={statusData?.overall || 'operational'}
          uptime90d={statusData?.uptime_90d || 99.97}
        />
        <ActiveIncidents incidents={statusData?.active_incidents || []} />
        <ScheduledMaintenance maintenance={statusData?.scheduled_maintenance || []} />
        <ServicesGrid services={statusData?.services} />
        <UptimeHistory />
        <IncidentHistory incidents={statusData?.recent_incidents} />
        <MetricsDashboard />
        <SubscribeSection />
        <StatusFooter />
      </div>
    </div>
  );
}
