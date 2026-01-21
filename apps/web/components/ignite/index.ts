// INSPIRE Ignite LMS Components

// Glass Box (EU AI Act Compliance)
export { GlassBoxExplanation, type GlassBoxExplanationProps } from './glass-box';

// Navigation
export { IgniteHeader } from './navigation/header';

// Player Components
export { AdaptivePanel, type AdaptivePanelProps, useAdaptivePanel } from './player';

// Providers
export {
  AccessibilityProvider,
  useAccessibility,
} from './providers/accessibility-provider';
export {
  AdaptiveEngineProvider,
  type ContentModality,
  type FunctionalState,
  type MasteryLevel,
  useAdaptiveEngine,
} from './providers/adaptive-engine-provider';
export { useXAPI, XAPIProvider } from './providers/xapi-provider';

// Dashboard Widgets
export {
  ContinueLearningWidget,
  type ContinueLearningWidgetProps,
  type CourseProgress,
  type LastSessionData,
  ProgressOverviewWidget,
  type ProgressOverviewWidgetProps,
  type ProgressStats,
  RecommendationsWidget,
  type RecommendationsWidgetProps,
} from './widgets';
