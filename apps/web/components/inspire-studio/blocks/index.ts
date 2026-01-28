export { KnowledgeCheckBlock } from './assessment/knowledge-check-block';
// Assessment blocks
export { QuizBlock } from './assessment/quiz-block';
// Lesson Builder components
export { BlockPalette, type BlockPaletteProps } from './block-palette';
export type { BlockComponentProps } from './block-renderer';
// Core components
export { BlockList, BlockRenderer } from './block-renderer';
export { BlockToolbar } from './block-toolbar';
export { BlockWrapper } from './block-wrapper';
// Character blocks
export {
  CharacterBlock,
  ConversationBlock,
  DialogueBlock,
} from './character';
export { ContextualAudioBlock } from './contextual-audio';
export { DynamicVideoBlock } from './dynamic-video';
// Interactive blocks
export { AccordionBlock } from './interactive/accordion-block';
export { FlipCardBlock } from './interactive/flip-card-block';
export { HotspotBlock } from './interactive/hotspot-block';
export { TabsBlock } from './interactive/tabs-block';
export { TimelineBlock } from './interactive/timeline-block';
export { CardBlock } from './layout/card-block';
// Layout blocks
export { ColumnsBlock } from './layout/columns-block';
export { ContainerBlock } from './layout/container-block';
export { SpacerBlock } from './layout/spacer-block';
export { type CanvasBlock, LessonCanvas, type LessonCanvasProps } from './lesson-canvas';
export { LogicQuizBlock } from './logic-quiz';
export { AudioBlock } from './media/audio-block';
export { EmbedBlock } from './media/embed-block';
// Media blocks
export { ImageBlock } from './media/image-block';
export { VideoBlock } from './media/video-block';
export type { ScenarioAnalyticsData } from './scenario';
// Scenario blocks
export {
  ScenarioAnalytics,
  ScenarioBlock,
  ScenarioEditor,
  ScenarioNodeComponent,
  ScenarioPreview,
} from './scenario';
// Smart Block Suites (INSPIRE Assimilation)
export { SmartTextBlock } from './smart-text';
export { SocialHubBlock } from './social-hub';
export { SpatialContainerBlock } from './spatial-container';
export { CalloutBlock } from './text/callout-block';
export { CodeBlock } from './text/code-block';
export { DividerBlock } from './text/divider-block';
export { HeadingBlock } from './text/heading-block';
export { ListBlock } from './text/list-block';
export { QuoteBlock } from './text/quote-block';
// Text blocks
export { TextBlock } from './text/text-block';
export { UnifiedMediaBlock } from './unified-media';
