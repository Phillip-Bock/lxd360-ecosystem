/**
 * Mission Control Dashboard Index
 *
 * NASA-grade dashboard system for INSPIRE Ignite platform.
 * Role-based widgets with Phase 8 feature integration.
 */

export type { MissionControlDashboardProps } from './MissionControlDashboard';
// Core dashboard
export { MissionControlDashboard } from './MissionControlDashboard';
export type { NeuronautCompanionProps } from './NeuronautCompanion';
// AI Companion
export { NeuronautCompanion } from './NeuronautCompanion';
// Types
export * from './types';
export { AIRecommendationsWidget } from './widgets/AIRecommendationsWidget';
export { ComplianceGapWidget } from './widgets/ComplianceGapWidget';
export { JITAIAlertsWidget } from './widgets/JITAIAlertsWidget';
export { ProgressRing, type ProgressRingProps } from './widgets/ProgressRing';
export { SkillBar, type SkillBarProps } from './widgets/SkillBar';
export { SkillHeatmapWidget } from './widgets/SkillHeatmapWidget';
// Feature widgets
export { SkillMasteryWidget } from './widgets/SkillMasteryWidget';
export { StatCard, type StatCardProps } from './widgets/StatCard';
export { SystemHealthWidget } from './widgets/SystemHealthWidget';
// Widget system
export { WidgetCard, type WidgetCardProps } from './widgets/WidgetCard';
