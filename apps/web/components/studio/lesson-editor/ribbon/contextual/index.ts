/**
 * Contextual tabs for the lesson editor ribbon
 * These tabs appear when specific block types are selected
 */

export { AudioToolsTab } from '@/components/ribbon/contextual-tabs/audio-tools-tab';
// Re-export the shared contextual tabs from ribbon library
export { ImageToolsTab } from '@/components/ribbon/contextual-tabs/image-tools-tab';
export { QuizToolsTab } from '@/components/ribbon/contextual-tabs/quiz-tools-tab';
export { VideoToolsTab } from '@/components/ribbon/contextual-tabs/video-tools-tab';

// Export types
export type { AspectRatio } from './types';
