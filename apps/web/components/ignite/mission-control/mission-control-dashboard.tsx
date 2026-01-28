'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  isEditorStats,
  isLearnerStats,
  isManagerStats,
  isOwnerStats,
  useDashboardStats,
} from '@/hooks/firestore';
import type { Persona } from '@/lib/rbac/personas';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import { NeuronautCompanion } from './neuro-naut-companion';
// Types
import type {
  ComplianceMetric,
  HeatmapData,
  JITAIAlert,
  ServiceHealth,
  SkillMasteryData,
  StatMetric,
} from './types';
import { AIRecommendationsWidget } from './widgets/ai-recommendations-widget';
import { ComplianceGapWidget } from './widgets/compliance-gap-widget';
import { DashboardWidgetGrid, type WidgetDefinition } from './widgets/dashboard-widget-grid';
import { JITAIAlertsWidget } from './widgets/jit-ai-alerts-widget';
import { SkillHeatmapWidget } from './widgets/skill-heatmap-widget';
import { SkillMasteryWidget } from './widgets/skill-mastery-widget';
// Widgets
import { StatCard } from './widgets/stat-card';
import { SystemHealthWidget } from './widgets/system-health-widget';
import { WidgetCard } from './widgets/widget-card';

// =============================================================================
// TYPES
// =============================================================================

export interface MissionControlDashboardProps {
  /** Override the auto-detected persona (for testing/demo) */
  personaOverride?: Persona;
  /** Tenant ID for multi-tenant context */
  tenantId?: string;
  /** Additional class names */
  className?: string;
}

type DashboardView = 'learner' | 'instructor' | 'manager' | 'admin';

// =============================================================================
// VIEW CONFIGURATIONS
// =============================================================================

const VIEW_CONFIG: Record<
  DashboardView,
  {
    title: string;
    subtitle: string;
    color: string;
    icon: string;
    accentClass: string;
  }
> = {
  learner: {
    title: 'Mission Control',
    subtitle: 'Your personalized learning command center',
    color: 'var(--neural-cyan)',
    icon: '🎓',
    accentClass: 'bg-cyan-500',
  },
  instructor: {
    title: 'Instructor Hub',
    subtitle: 'Course management and student analytics',
    color: '#A855F7',
    icon: '👨‍🏫',
    accentClass: 'bg-violet-500',
  },
  manager: {
    title: 'Command Center',
    subtitle: 'Team performance and organizational insights',
    color: '#10B981',
    icon: '📊',
    accentClass: 'bg-emerald-500',
  },
  admin: {
    title: 'System Control',
    subtitle: 'Platform administration and monitoring',
    color: 'var(--warning)',
    icon: '⚡',
    accentClass: 'bg-amber-500',
  },
};

// =============================================================================
// MOCK DATA (Replace with real data hooks from lib/adaptive-learning)
// =============================================================================

const getLearnerStats = (): StatMetric[] => [
  { label: 'Courses Active', value: 4, icon: '📚', change: { value: 1, label: 'new' } },
  {
    label: 'Skills Mastered',
    value: 12,
    icon: '🎯',
    color: 'success',
    change: { value: 3, label: 'month' },
  },
  { label: 'Learning Streak', value: '7 days', icon: '🔥', color: 'warning' },
  { label: 'Rank', value: '#23', icon: '🏆', color: 'purple', change: { value: 5, label: 'up' } },
];

const getInstructorStats = (): StatMetric[] => [
  { label: 'Active Courses', value: 6, icon: '📚' },
  { label: 'Total Students', value: 342, icon: '👥', change: { value: 28, label: 'month' } },
  { label: 'Avg Completion', value: '84%', icon: '📊', color: 'success' },
  { label: 'Pending Reviews', value: 18, icon: '✏️', color: 'warning' },
];

const getManagerStats = (): StatMetric[] => [
  { label: 'Team Members', value: 47, icon: '👥' },
  { label: 'Compliance', value: '92%', icon: '✅', color: 'success' },
  { label: 'At Risk', value: 8, icon: '⚠️', color: 'danger' },
  {
    label: 'ROI Score',
    value: '+23%',
    icon: '📈',
    color: 'cyan',
    change: { value: 5, label: 'qtr' },
  },
];

const getAdminStats = (): StatMetric[] => [
  { label: 'Active Users', value: '2,847', icon: '👥', change: { value: 156, label: 'week' } },
  { label: 'Uptime', value: '99.97%', icon: '⚡', color: 'success' },
  { label: 'API/min', value: '12.4K', icon: '📡', color: 'cyan' },
  { label: 'Tenants', value: 23, icon: '🏢', color: 'purple' },
];

const getMockSkillMasteryData = (): SkillMasteryData[] => [
  {
    skillId: '1',
    skillName: 'Critical Thinking',
    mastery: 0.85,
    trend: 'up',
    lastUpdated: new Date(),
  },
  {
    skillId: '2',
    skillName: 'Problem Solving',
    mastery: 0.72,
    trend: 'up',
    lastUpdated: new Date(),
  },
  {
    skillId: '3',
    skillName: 'Communication',
    mastery: 0.68,
    trend: 'stable',
    lastUpdated: new Date(),
  },
  {
    skillId: '4',
    skillName: 'Technical Skills',
    mastery: 0.91,
    trend: 'up',
    lastUpdated: new Date(),
  },
];

const getMockJITAIAlerts = (): JITAIAlert[] => [
  {
    id: '1',
    learnerId: 'l1',
    learnerName: 'Alex M.',
    alertType: 'doom_scroll',
    severity: 'high',
    message: 'Doom-scroll detected - skimming content without engagement',
    timestamp: new Date(),
    actionable: true,
  },
  {
    id: '2',
    learnerId: 'l2',
    learnerName: 'Sarah K.',
    alertType: 'false_confidence',
    severity: 'medium',
    message: 'High self-assessment but struggling with practice questions',
    timestamp: new Date(),
    actionable: true,
  },
  {
    id: '3',
    learnerId: 'l3',
    learnerName: 'Mike T.',
    alertType: 'low_engagement',
    severity: 'medium',
    message: 'Below average engagement this week',
    timestamp: new Date(),
    actionable: true,
  },
];

const getMockHeatmapData = (): HeatmapData => ({
  departments: ['Engineering', 'Sales', 'Operations', 'Marketing'],
  skills: ['Safety', 'Compliance', 'Leadership', 'Technical'],
  cells: [
    {
      departmentId: 'Engineering',
      departmentName: 'Engineering',
      skillId: 'Safety',
      skillName: 'Safety',
      value: 0.82,
      status: 'strong',
    },
    {
      departmentId: 'Engineering',
      departmentName: 'Engineering',
      skillId: 'Compliance',
      skillName: 'Compliance',
      value: 0.67,
      status: 'moderate',
    },
    {
      departmentId: 'Engineering',
      departmentName: 'Engineering',
      skillId: 'Leadership',
      skillName: 'Leadership',
      value: 0.45,
      status: 'at_risk',
    },
    {
      departmentId: 'Engineering',
      departmentName: 'Engineering',
      skillId: 'Technical',
      skillName: 'Technical',
      value: 0.91,
      status: 'strong',
    },
    {
      departmentId: 'Sales',
      departmentName: 'Sales',
      skillId: 'Safety',
      skillName: 'Safety',
      value: 0.54,
      status: 'moderate',
    },
    {
      departmentId: 'Sales',
      departmentName: 'Sales',
      skillId: 'Compliance',
      skillName: 'Compliance',
      value: 0.78,
      status: 'strong',
    },
    {
      departmentId: 'Sales',
      departmentName: 'Sales',
      skillId: 'Leadership',
      skillName: 'Leadership',
      value: 0.88,
      status: 'strong',
    },
    {
      departmentId: 'Sales',
      departmentName: 'Sales',
      skillId: 'Technical',
      skillName: 'Technical',
      value: 0.32,
      status: 'critical',
    },
    {
      departmentId: 'Operations',
      departmentName: 'Operations',
      skillId: 'Safety',
      skillName: 'Safety',
      value: 0.95,
      status: 'strong',
    },
    {
      departmentId: 'Operations',
      departmentName: 'Operations',
      skillId: 'Compliance',
      skillName: 'Compliance',
      value: 0.89,
      status: 'strong',
    },
    {
      departmentId: 'Operations',
      departmentName: 'Operations',
      skillId: 'Leadership',
      skillName: 'Leadership',
      value: 0.58,
      status: 'moderate',
    },
    {
      departmentId: 'Operations',
      departmentName: 'Operations',
      skillId: 'Technical',
      skillName: 'Technical',
      value: 0.71,
      status: 'strong',
    },
    {
      departmentId: 'Marketing',
      departmentName: 'Marketing',
      skillId: 'Safety',
      skillName: 'Safety',
      value: 0.42,
      status: 'at_risk',
    },
    {
      departmentId: 'Marketing',
      departmentName: 'Marketing',
      skillId: 'Compliance',
      skillName: 'Compliance',
      value: 0.61,
      status: 'moderate',
    },
    {
      departmentId: 'Marketing',
      departmentName: 'Marketing',
      skillId: 'Leadership',
      skillName: 'Leadership',
      value: 0.76,
      status: 'strong',
    },
    {
      departmentId: 'Marketing',
      departmentName: 'Marketing',
      skillId: 'Technical',
      skillName: 'Technical',
      value: 0.48,
      status: 'at_risk',
    },
  ],
});

const getMockComplianceMetrics = (): ComplianceMetric[] => [
  { name: 'OSHA', completionRate: 94, expiringCount: 3, status: 'compliant' },
  { name: 'HIPAA', completionRate: 87, expiringCount: 5, status: 'at_risk' },
  { name: 'SOC 2', completionRate: 76, expiringCount: 4, status: 'at_risk' },
];

const getMockServiceHealth = (): ServiceHealth[] => [
  { name: 'Cloud Run', status: 'healthy', latency: 45, lastCheck: new Date() },
  { name: 'Firestore', status: 'healthy', latency: 12, lastCheck: new Date() },
  { name: 'Vertex AI', status: 'healthy', latency: 234, lastCheck: new Date() },
  { name: 'BigQuery', status: 'degraded', latency: 890, lastCheck: new Date() },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function mapPersonaToDashboardView(persona: Persona): DashboardView {
  // Map 4-persona system to dashboard views
  switch (persona) {
    case 'owner':
      return 'admin';
    case 'editor':
      return 'instructor';
    case 'manager':
      return 'manager';
    default:
      return 'learner';
  }
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MissionControlDashboard({
  personaOverride,
  tenantId,
  className,
}: MissionControlDashboardProps) {
  const { user, persona: authPersona } = useSafeAuth();
  const [missionTime, setMissionTime] = useState(new Date());

  // Fetch real dashboard stats from Firestore
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();

  // Determine dashboard view based on persona
  const persona = personaOverride ?? authPersona ?? 'learner';
  const dashboardView = mapPersonaToDashboardView(persona);
  const config = VIEW_CONFIG[dashboardView];

  // Mission clock
  useEffect(() => {
    const timer = setInterval(() => setMissionTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert real stats to StatMetric format, with fallback to mock data during loading
  const stats = useMemo((): StatMetric[] => {
    // Use real data if available
    if (dashboardStats && !statsLoading) {
      if (isLearnerStats(dashboardStats)) {
        return [
          {
            label: 'Courses Active',
            value: dashboardStats.coursesActive,
            icon: '📚',
            change: { value: 0, label: 'new' },
          },
          {
            label: 'Courses Completed',
            value: dashboardStats.coursesCompleted,
            icon: '🎯',
            color: 'success',
          },
          {
            label: 'Skills Mastered',
            value: dashboardStats.skillsMastered,
            icon: '🏆',
            color: 'purple',
          },
          {
            label: 'Learning Streak',
            value: `${dashboardStats.learningStreak} days`,
            icon: '🔥',
            color: 'warning',
          },
        ];
      }
      if (isEditorStats(dashboardStats)) {
        return [
          { label: 'Active Courses', value: dashboardStats.activeCourses, icon: '📚' },
          {
            label: 'Draft Courses',
            value: dashboardStats.draftCourses,
            icon: '📝',
            color: 'warning',
          },
          {
            label: 'Total Students',
            value: dashboardStats.totalStudents,
            icon: '👥',
            change: { value: 0, label: 'month' },
          },
          {
            label: 'Avg Completion',
            value: `${dashboardStats.avgCompletion}%`,
            icon: '📊',
            color: 'success',
          },
        ];
      }
      if (isManagerStats(dashboardStats)) {
        return [
          { label: 'Team Members', value: dashboardStats.teamMembers, icon: '👥' },
          {
            label: 'Compliance',
            value: `${dashboardStats.complianceRate}%`,
            icon: '✅',
            color: 'success',
          },
          { label: 'At Risk', value: dashboardStats.atRiskCount, icon: '⚠️', color: 'danger' },
          {
            label: 'Avg Progress',
            value: `${dashboardStats.avgProgress}%`,
            icon: '📈',
            color: 'cyan',
          },
        ];
      }
      if (isOwnerStats(dashboardStats)) {
        return [
          { label: 'Total Courses', value: dashboardStats.totalCourses, icon: '📚' },
          {
            label: 'Total Learners',
            value: dashboardStats.totalLearners,
            icon: '👥',
            change: { value: 0, label: 'week' },
          },
          {
            label: 'Active Enrollments',
            value: dashboardStats.activeEnrollments,
            icon: '📡',
            color: 'cyan',
          },
          {
            label: 'Completion Rate',
            value: `${dashboardStats.completionRate}%`,
            icon: '⚡',
            color: 'success',
          },
        ];
      }
    }

    // Fallback to mock data while loading or if no org context
    switch (dashboardView) {
      case 'learner':
        return getLearnerStats();
      case 'instructor':
        return getInstructorStats();
      case 'manager':
        return getManagerStats();
      case 'admin':
        return getAdminStats();
    }
  }, [dashboardView, dashboardStats, statsLoading]);

  // Mock data for widgets (replace with real hooks)
  const skillMasteryData = useMemo(() => getMockSkillMasteryData(), []);
  const jitaiAlerts = useMemo(() => getMockJITAIAlerts(), []);
  const heatmapData = useMemo(() => getMockHeatmapData(), []);
  const complianceMetrics = useMemo(() => getMockComplianceMetrics(), []);
  const serviceHealth = useMemo(() => getMockServiceHealth(), []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Commander';

  // Widget definitions for the draggable grid
  const widgetDefinitions = useMemo((): Record<string, WidgetDefinition> => {
    return {
      'skill-mastery': {
        id: 'skill-mastery',
        label: 'Skill Mastery',
        component: <SkillMasteryWidget skills={skillMasteryData} />,
        defaultColSpan: 2,
      },
      'ai-recommendations': {
        id: 'ai-recommendations',
        label: 'AI Recommendations',
        component: <AIRecommendationsWidget recommendations={[]} />,
        defaultColSpan: 2,
      },
      'learning-velocity': {
        id: 'learning-velocity',
        label: 'Learning Velocity',
        component: (
          <WidgetCard
            title="Learning Velocity"
            subtitle="30-day progress trend"
            icon="📊"
            accentColor="purple"
            size="full"
          >
            <LearningVelocityChart />
          </WidgetCard>
        ),
        defaultColSpan: 4,
      },
      'jitai-alerts': {
        id: 'jitai-alerts',
        label: 'JITAI Alerts',
        component: <JITAIAlertsWidget alerts={jitaiAlerts} />,
        defaultColSpan: 2,
      },
      'class-analytics': {
        id: 'class-analytics',
        label: 'Class Analytics',
        component: (
          <WidgetCard
            title="Class Analytics"
            subtitle="Aggregate student performance"
            icon="📊"
            accentColor="purple"
          >
            <ClassAnalyticsContent />
          </WidgetCard>
        ),
        defaultColSpan: 2,
      },
      'skill-heatmap': {
        id: 'skill-heatmap',
        label: 'Skill Heatmap',
        component: <SkillHeatmapWidget data={heatmapData} />,
        defaultColSpan: 4,
      },
      'compliance-gap': {
        id: 'compliance-gap',
        label: 'Compliance Gap',
        component: <ComplianceGapWidget metrics={complianceMetrics} />,
        defaultColSpan: 2,
      },
      'roi-analytics': {
        id: 'roi-analytics',
        label: 'ROI Analytics',
        component: (
          <WidgetCard
            title="ROI Analytics"
            subtitle="Learning ↔ Business correlation"
            icon="📈"
            accentColor="purple"
          >
            <ROIAnalyticsContent />
          </WidgetCard>
        ),
        defaultColSpan: 2,
      },
      'system-health': {
        id: 'system-health',
        label: 'System Health',
        component: <SystemHealthWidget services={serviceHealth} />,
        defaultColSpan: 2,
      },
      'audit-log': {
        id: 'audit-log',
        label: 'Audit Log',
        component: (
          <WidgetCard
            title="Audit Log"
            subtitle="Recent security events"
            icon="📋"
            accentColor="cyan"
          >
            <AuditLogContent />
          </WidgetCard>
        ),
        defaultColSpan: 2,
      },
    };
  }, [skillMasteryData, jitaiAlerts, heatmapData, complianceMetrics, serviceHealth]);

  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scan line effect (dark mode only) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden dark:block hidden">
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
          animate={{ y: ['0vh', '100vh'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className={cn('w-1 h-8 rounded-full', config.accentClass)} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <span>{config.icon}</span>
                  {config.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{config.subtitle}</p>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 ml-4">
              Welcome back, <span className="font-medium text-foreground">{displayName}</span>
            </p>
          </div>

          {/* Mission Clock */}
          <div className="text-right">
            <div className="font-mono text-xl font-semibold tracking-wider tabular-nums">
              <span className="text-cyan-500 dark:text-cyan-400">
                {missionTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Mission Time
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

        {/* Widget Grid - Draggable & Reorderable */}
        <motion.div variants={itemVariants}>
          <DashboardWidgetGrid persona={persona} widgets={widgetDefinitions} />
        </motion.div>
      </motion.div>

      {/* Neuro-naut AI Companion */}
      <NeuronautCompanion tenantId={tenantId} />
    </div>
  );
}

// =============================================================================
// MINI WIDGET CONTENT COMPONENTS
// =============================================================================

function LearningVelocityChart() {
  // Generate stable mock data
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => 40 + ((i * 7 + 13) % 60)), []);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((value, index) => (
        <div
          key={`velocity-bar-${index}`}
          className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-violet-500"
          style={{
            height: `${value}%`,
            opacity: 0.6 + (index / 30) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

function ClassAnalyticsContent() {
  return (
    <div className="space-y-4">
      <div className="flex justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-500">78%</div>
          <div className="text-xs text-muted-foreground">Avg Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-500">92%</div>
          <div className="text-xs text-muted-foreground">Pass Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">64%</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
      </div>
    </div>
  );
}

function ROIAnalyticsContent() {
  return (
    <div className="space-y-3 text-sm">
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <span className="text-emerald-500 font-medium">Strong correlation:</span>
        <span className="text-muted-foreground"> Users with &gt;5 hrs training had </span>
        <span className="text-cyan-500 font-medium">20% fewer</span>
        <span className="text-muted-foreground"> safety incidents</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <span className="text-amber-500 font-medium">Moderate:</span>
        <span className="text-muted-foreground"> Course completion correlates with </span>
        <span className="text-violet-500 font-medium">+15%</span>
        <span className="text-muted-foreground"> sales performance</span>
      </div>
    </div>
  );
}

function AuditLogContent() {
  const logs = useMemo(
    () => [
      { time: '14:32:01', event: 'User login', user: 'john@co.com' },
      { time: '14:31:45', event: 'Course published', user: 'admin' },
      { time: '14:30:22', event: 'Role changed', user: 'admin' },
      { time: '14:28:11', event: 'AI prediction', user: 'system' },
    ],
    [],
  );

  return (
    <div className="font-mono text-xs space-y-1 max-h-40 overflow-auto">
      {logs.map((log, index) => (
        <div key={`audit-${log.time}-${index}`} className="py-1 border-b border-border/30">
          <span className="text-cyan-500">{log.time}</span>{' '}
          <span className="text-muted-foreground">[{log.event}]</span>{' '}
          <span className="text-violet-500">{log.user}</span>
        </div>
      ))}
    </div>
  );
}

export type { DashboardView };
