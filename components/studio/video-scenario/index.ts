/**
 * Video Scenario Editor - Phase 14
 *
 * NOTE: This module has been superseded by the full Scenario Builder
 * at @/components/studio/scenario-builder which supports all media types
 * (images, video, audio, 360°, 3D) not just video.
 *
 * The branch-editor.tsx is kept for backwards compatibility but new
 * development should use the ScenarioBuilder component.
 */

export type { Scenario, ScenarioEdge, ScenarioNode } from '@/types/studio/scenario';
// Re-export from the full scenario builder for new projects
export { ScenarioBuilder } from '../scenario-builder';

// Legacy export (deprecated)
export { BranchEditor } from './branch-editor';
