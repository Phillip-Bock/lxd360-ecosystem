import type { ComponentType } from 'react';
// Import learning components
import { AssessmentArchitect } from '@/components/inspire/assessment';
import { AlertBlock } from './alerts/AlertBlock';
import { CautionBlock } from './alerts/CautionBlock';
import { NoteBlock } from './alerts/NoteBlock';
import { BlockquoteCard } from './blockquotes/BlockquoteCard';
import { FAQAccordion } from './interactive/FAQAccordion';
import { InteractiveImage } from './interactive/InteractiveImage';
import { MultiColumnLayout } from './layouts/MultiColumnLayout';
import { AudioPlayer } from './media/AudioPlayer';
import { ImageGallery } from './media/ImageGallery';
// Import content block components
import { VideoPlayer } from './media/VideoPlayer';
import { ReferencesBlock } from './special/ReferencesBlock';
import { StatisticsDisplay } from './special/StatisticsDisplay';
import { TestimonialBlock } from './special/TestimonialBlock';
import { ComparisonTable } from './tables/ComparisonTable';
import { TitleWithParagraph } from './text/TitleWithParagraph';
import { TimelineVertical } from './timelines/TimelineVertical';

// Content block type mapping
export type ContentBlockType =
  | 'videoContent'
  | 'audioContent'
  | 'textContent'
  | 'imageContent'
  | 'interactiveContent'
  | 'assessmentContent'
  | 'model3dContent'
  | 'panorama360Content'
  | 'vrContent'
  | 'pdfContent'
  | 'lottieContent'
  | 'quizContent'
  | 'scenarioContent'
  | 'simulationContent';

// Content block props interface
export interface ContentBlockProps {
  id?: string;
  data?: Record<string, unknown>;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  readOnly?: boolean;
}

// Registry mapping content block types to React components
export const BLOCK_REGISTRY: Record<ContentBlockType, ComponentType<ContentBlockProps> | null> = {
  videoContent: VideoPlayer as unknown as ComponentType<ContentBlockProps>,
  audioContent: AudioPlayer as unknown as ComponentType<ContentBlockProps>,
  textContent: TitleWithParagraph as unknown as ComponentType<ContentBlockProps>,
  imageContent: ImageGallery as unknown as ComponentType<ContentBlockProps>,
  interactiveContent: InteractiveImage as unknown as ComponentType<ContentBlockProps>,
  assessmentContent: AssessmentArchitect as unknown as ComponentType<ContentBlockProps>,
  model3dContent: null, // Placeholder - use @react-three/drei ModelViewer
  panorama360Content: null, // Use PanoramaViewer from learning/360
  vrContent: null, // Placeholder for VR content
  pdfContent: null, // Use PDFViewer component
  lottieContent: null, // Use lottie-react
  quizContent: null, // Use Quiz component
  scenarioContent: null, // Use ScenarioPanorama
  simulationContent: null, // Use simulation components
};

// Extended registry with more specific mappings
export const EXTENDED_BLOCK_REGISTRY = {
  // Alerts
  alert: AlertBlock,
  note: NoteBlock,
  caution: CautionBlock,

  // Blockquotes
  blockquote: BlockquoteCard,

  // Interactive
  faq: FAQAccordion,
  interactiveImage: InteractiveImage,

  // Statistics
  statistics: StatisticsDisplay,

  // Testimonials
  testimonial: TestimonialBlock,

  // References
  references: ReferencesBlock,

  // Layout
  multiColumn: MultiColumnLayout,

  // Tables
  comparison: ComparisonTable,

  // Timelines
  timeline: TimelineVertical,
} as const;

// Content block interface
export interface ContentBlock {
  _key: string;
  _type: ContentBlockType;
  title?: string;
  description?: string;
  content?: unknown;
  settings?: Record<string, unknown>;
}

// Render a content block based on its type
export function renderContentBlock(
  block: ContentBlock,
  props?: Partial<ContentBlockProps>,
): React.ReactNode {
  const Component = BLOCK_REGISTRY[block._type];

  if (!Component) {
    return (
      <div className="p-4 bg-lxd-warning/10 border border-lxd-warning rounded-lg">
        <p className="text-lxd-warning text-sm">Component not available: {block._type}</p>
      </div>
    );
  }

  return (
    <Component
      key={block._key}
      id={block._key}
      data={block.content as Record<string, unknown>}
      {...props}
    />
  );
}

// Get all available block types
export function getAvailableBlockTypes(): ContentBlockType[] {
  return Object.entries(BLOCK_REGISTRY)
    .filter(([, component]) => component !== null)
    .map(([type]) => type as ContentBlockType);
}

// Check if a block type is supported
export function isBlockTypeSupported(type: string): type is ContentBlockType {
  return type in BLOCK_REGISTRY && BLOCK_REGISTRY[type as ContentBlockType] !== null;
}
