'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  BarChart3,
  FileText,
  Loader2,
  RefreshCw,
  Settings,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  type ComplianceStatus,
  ComplianceWidget,
  type DueDateItem,
  DueDatesList,
  type TeamMember,
  TeamProgressTable,
  type TeamStats,
  TeamStatsCard,
} from '@/components/ignite/manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Get Firebase ID token for API authentication */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/** Dashboard API response shape */
interface ManagerDashboardResponse {
  teamStats: TeamStats;
  teamMembers: TeamMember[];
  complianceData: ComplianceStatus[];
  dueDates: DueDateItem[];
}

/** Default empty team stats */
const defaultTeamStats: TeamStats = {
  totalLearners: 0,
  learnersChange: 0,
  avgCompletionRate: 0,
  completionChange: 0,
  avgScore: 0,
  scoreChange: 0,
  overdueAssignments: 0,
  overdueChange: 0,
  complianceRate: 0,
  complianceChange: 0,
};

// =============================================================================
// QUICK ACTIONS
// =============================================================================

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

function QuickAction({ href, icon: Icon, label, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-lxd-primary/30 hover:bg-lxd-primary/5 transition-all group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lxd-primary/10 group-hover:bg-lxd-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2
        className="w-8 h-8 animate-spin text-[var(--color-lxd-primary)]"
        aria-hidden="true"
      />
      <p className="text-muted-foreground mt-4">Loading manager dashboard...</p>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-lxd-error)]/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-[var(--color-lxd-error)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load dashboard</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{message}</p>
      <Button type="button" onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
        Try Again
      </Button>
    </div>
  );
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

/**
 * Manager Dashboard - Team oversight and compliance tracking
 *
 * Provides managers with:
 * - Team overview statistics (KPIs)
 * - Compliance status by category
 * - Team progress table with sorting/filtering
 * - Upcoming due dates and deadlines
 * - Quick actions for common tasks
 */
export default function ManagerDashboardPage() {
  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats>(defaultTeamStats);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceStatus[]>([]);
  const [dueDates, setDueDates] = useState<DueDateItem[]>([]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/ignite/manager/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }

      const data: ManagerDashboardResponse = await response.json();

      // Convert date strings back to Date objects
      const parsedTeamMembers = data.teamMembers.map((member) => ({
        ...member,
        lastActive: new Date(member.lastActive),
      }));

      const parsedComplianceData = data.complianceData.map((item) => ({
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      }));

      const parsedDueDates = data.dueDates.map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      }));

      setTeamStats(data.teamStats);
      setTeamMembers(parsedTeamMembers);
      setComplianceData(parsedComplianceData);
      setDueDates(parsedDueDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleExport = () => {
    // TODO(LXD-339): Implement CSV export functionality
    // Export feature placeholder - will trigger CSV download when implemented
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Team oversight and compliance tracking</p>
        </div>
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Team oversight and compliance tracking</p>
        </div>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Team oversight and compliance tracking</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* Team Stats Overview */}
      <TeamStatsCard stats={teamStats} />

      {/* Compliance & Due Dates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceWidget complianceData={complianceData} />
        <DueDatesList dueDates={dueDates} />
      </div>

      {/* Team Progress Table */}
      <TeamProgressTable members={teamMembers} onExport={handleExport} />

      {/* Quick Actions */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              href="/ignite/manage/users"
              icon={UserPlus}
              label="Add Learner"
              description="Invite a new team member"
            />
            <QuickAction
              href="/ignite/manage/reports"
              icon={FileText}
              label="Generate Report"
              description="Export team progress data"
            />
            <QuickAction
              href="/ignite/manage/analytics"
              icon={BarChart3}
              label="View Analytics"
              description="Detailed performance metrics"
            />
            <QuickAction
              href="/ignite/manage/settings"
              icon={Settings}
              label="Team Settings"
              description="Configure team preferences"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
