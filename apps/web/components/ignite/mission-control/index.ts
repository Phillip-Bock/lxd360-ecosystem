/**
 * Mission Control Dashboard Index
 *
 * NASA-grade dashboard system for INSPIRE Ignite platform.
 * Role-based widgets with Phase 8 feature integration.
 */

export type { MissionControlDashboardProps } from './mission-control-dashboard';
// Core dashboard
export { MissionControlDashboard } from './mission-control-dashboard';
export type { NeuronautCompanionProps } from './neuro-naut-companion';
// AI Companion
export { NeuronautCompanion } from './neuro-naut-companion';
// Types
export * from './types';
export { AIRecommendationsWidget } from './widgets/ai-recommendations-widget';
export { ComplianceGapWidget } from './widgets/compliance-gap-widget';
export { JITAIAlertsWidget } from './widgets/jit-ai-alerts-widget';
export { ProgressRing, type ProgressRingProps } from './widgets/progress-ring';
export { SkillBar, type SkillBarProps } from './widgets/skill-bar';
export { SkillHeatmapWidget } from './widgets/skill-heatmap-widget';
// Feature widgets
export { SkillMasteryWidget } from './widgets/skill-mastery-widget';
export { StatCard, type StatCardProps } from './widgets/stat-card';
export { SystemHealthWidget } from './widgets/system-health-widget';
// Widget system
export { WidgetCard, type WidgetCardProps } from './widgets/widget-card';
