'use client';

/**
 * BlockRenderer - Dynamic block component renderer
 * Maps block types to their React components
 */

import type {
  AccordionConfig,
  AccordionContent,
  BlockInstance,
  FITBQuestionConfig,
  FITBQuestionContent,
  FlipCardConfig,
  FlipCardContent,
  ImageConfig,
  ImageContent,
  ListConfig,
  ListContent,
  MCQuestionConfig,
  MCQuestionContent,
  ParagraphConfig,
  ParagraphContent,
  QuoteConfig,
  QuoteContent,
  TabsConfig,
  TabsContent,
  VideoConfig,
  VideoContent,
} from '@/types/blocks';
import { FITBQuestionBlock } from './assessment/fitb-question-block';
// Assessment blocks
import { MCQuestionBlock } from './assessment/mc-question-block';
// Interactive blocks
import { AccordionBlock } from './interactive/accordion-block';
import { FlipCardBlock } from './interactive/flip-card-block';
import { TabsBlock } from './interactive/tabs-block';
// Media blocks
import { ImageBlock } from './media/image-block';
import { VideoBlock } from './media/video-block';
import { ListBlock } from './text/list-block';
// Text blocks
import { ParagraphBlock } from './text/paragraph-block';
import { QuoteBlock } from './text/quote-block';

interface BlockRendererProps {
  block: BlockInstance;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: BlockInstance['content']) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

export function BlockRenderer({
  block,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onStopEditing,
  onXAPIEvent,
}: BlockRendererProps) {
  const commonProps = {
    id: block.id,
    isSelected,
    isEditing,
    onSelect,
    onStartEditing,
    onStopEditing,
    onXAPIEvent,
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <ParagraphBlock
          {...commonProps}
          content={block.content as ParagraphContent}
          config={block.config as ParagraphConfig}
          onContentChange={onContentChange as ((content: ParagraphContent) => void) | undefined}
        />
      );

    case 'image':
      return (
        <ImageBlock
          {...commonProps}
          content={block.content as ImageContent}
          config={block.config as ImageConfig}
          onContentChange={onContentChange as ((content: ImageContent) => void) | undefined}
        />
      );

    case 'video':
      return (
        <VideoBlock
          {...commonProps}
          content={block.content as VideoContent}
          config={block.config as VideoConfig}
          onContentChange={onContentChange as ((content: VideoContent) => void) | undefined}
        />
      );

    case 'quote':
      return (
        <QuoteBlock
          {...commonProps}
          content={block.content as QuoteContent}
          config={block.config as QuoteConfig}
          onContentChange={onContentChange as ((content: QuoteContent) => void) | undefined}
        />
      );

    case 'list':
      return (
        <ListBlock
          {...commonProps}
          content={block.content as ListContent}
          config={block.config as ListConfig}
          onContentChange={onContentChange as ((content: ListContent) => void) | undefined}
        />
      );

    case 'mc-question':
      return (
        <MCQuestionBlock
          {...commonProps}
          content={block.content as MCQuestionContent}
          config={block.config as MCQuestionConfig}
          onContentChange={onContentChange as ((content: MCQuestionContent) => void) | undefined}
        />
      );

    case 'fitb-question':
      return (
        <FITBQuestionBlock
          {...commonProps}
          content={block.content as FITBQuestionContent}
          config={block.config as FITBQuestionConfig}
          onContentChange={onContentChange as ((content: FITBQuestionContent) => void) | undefined}
        />
      );

    case 'accordion':
      return (
        <AccordionBlock
          {...commonProps}
          content={block.content as AccordionContent}
          config={block.config as AccordionConfig}
          onContentChange={onContentChange as ((content: AccordionContent) => void) | undefined}
        />
      );

    case 'tabs':
      return (
        <TabsBlock
          {...commonProps}
          content={block.content as TabsContent}
          config={block.config as TabsConfig}
          onContentChange={onContentChange as ((content: TabsContent) => void) | undefined}
        />
      );

    case 'flip-card':
      return (
        <FlipCardBlock
          {...commonProps}
          content={block.content as FlipCardContent}
          config={block.config as FlipCardConfig}
          onContentChange={onContentChange as ((content: FlipCardContent) => void) | undefined}
        />
      );

    default:
      return (
        <div className="p-4 border border-dashed border-border rounded-lg text-muted-foreground">
          Unknown block type: {block.type}
        </div>
      );
  }
}
