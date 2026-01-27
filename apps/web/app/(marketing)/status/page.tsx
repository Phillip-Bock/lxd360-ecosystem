import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StatusDashboard } from './status-dashboard';

export const metadata: Metadata = {
  title: 'System Status | INSPIRE Platform',
  description: 'Real-time system status and uptime for the INSPIRE Platform services.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<StatusSkeleton />}>
        <StatusDashboard />
      </Suspense>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
