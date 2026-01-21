'use client';

import React, { useCallback, useMemo } from 'react';
import type { Block, BlockCondition, BlockRenderMode, BlockType } from '@/types/blocks';
import { BlockWrapper } from './BlockWrapper';

// Lazy load block components for better performance
const TextBlock = React.lazy(() =>
  import('./text/TextBlock').then((m) => ({ default: m.TextBlock })),
);
const HeadingBlock = React.lazy(() =>
  import('./text/HeadingBlock').then((m) => ({ default: m.HeadingBlock })),
);
const QuoteBlock = React.lazy(() =>
  import('./text/QuoteBlock').then((m) => ({ default: m.QuoteBlock })),
);
const CodeBlock = React.lazy(() =>
  import('./text/CodeBlock').then((m) => ({ default: m.CodeBlock })),
);
const ListBlock = React.lazy(() =>
  import('./text/ListBlock').then((m) => ({ default: m.ListBlock })),
);
const CalloutBlock = React.lazy(() =>
  import('./text/CalloutBlock').then((m) => ({ default: m.CalloutBlock })),
);
const DividerBlock = React.lazy(() =>
  import('./text/DividerBlock').then((m) => ({ default: m.DividerBlock })),
);

const ImageBlock = React.lazy(() =>
  import('./media/ImageBlock').then((m) => ({ default: m.ImageBlock })),
);
const VideoBlock = React.lazy(() =>
  import('./media/VideoBlock').then((m) => ({ default: m.VideoBlock })),
);
const AudioBlock = React.lazy(() =>
  import('./media/AudioBlock').then((m) => ({ default: m.AudioBlock })),
);
const EmbedBlock = React.lazy(() =>
  import('./media/EmbedBlock').then((m) => ({ default: m.EmbedBlock })),
);

const AccordionBlock = React.lazy(() =>
  import('./interactive/AccordionBlock').then((m) => ({ default: m.AccordionBlock })),
);
const TabsBlock = React.lazy(() =>
  import('./interactive/TabsBlock').then((m) => ({ default: m.TabsBlock })),
);
const HotspotBlock = React.lazy(() =>
  import('./interactive/HotspotBlock').then((m) => ({ default: m.HotspotBlock })),
);
const FlipCardBlock = React.lazy(() =>
  import('./interactive/FlipCardBlock').then((m) => ({ default: m.FlipCardBlock })),
);
const TimelineBlock = React.lazy(() =>
  import('./interactive/TimelineBlock').then((m) => ({ default: m.TimelineBlock })),
);
// TODO(LXD-410): Create CarouselBlock and ProcessBlock components
// const CarouselBlock = React.lazy(() => import('./interactive/CarouselBlock').then(m => ({ default: m.CarouselBlock })));
// const ProcessBlock = React.lazy(() => import('./interactive/ProcessBlock').then(m => ({ default: m.ProcessBlock })));

const QuizBlock = React.lazy(() =>
  import('./assessment/QuizBlock').then((m) => ({ default: m.QuizBlock })),
);
const KnowledgeCheckBlock = React.lazy(() =>
  import('./assessment/KnowledgeCheckBlock').then((m) => ({ default: m.KnowledgeCheckBlock })),
);

const ScenarioBlock = React.lazy(() =>
  import('./scenario/ScenarioBlock').then((m) => ({ default: m.ScenarioBlock })),
);
const CharacterBlock = React.lazy(() =>
  import('./character/CharacterBlock').then((m) => ({ default: m.CharacterBlock })),
);
const DialogueBlock = React.lazy(() =>
  import('./character/DialogueBlock').then((m) => ({ default: m.DialogueBlock })),
);

const ColumnsBlock = React.lazy(() =>
  import('./layout/ColumnsBlock').then((m) => ({ default: m.ColumnsBlock })),
);
const ContainerBlock = React.lazy(() =>
  import('./layout/ContainerBlock').then((m) => ({ default: m.ContainerBlock })),
);
const SpacerBlock = React.lazy(() =>
  import('./layout/SpacerBlock').then((m) => ({ default: m.SpacerBlock })),
);
const CardBlock = React.lazy(() =>
  import('./layout/CardBlock').then((m) => ({ default: m.CardBlock })),
);

// TODO(LXD-410): Create data block components (TableBlock, ChartBlock, StatBlock)
// const TableBlock = React.lazy(() => import('./data/TableBlock').then(m => ({ default: m.TableBlock })));
// const ChartBlock = React.lazy(() => import('./data/ChartBlock').then(m => ({ default: m.ChartBlock })));
// const StatBlock = React.lazy(() => import('./data/StatBlock').then(m => ({ default: m.StatBlock })));

/**
 * Block component props interface
 */
export interface BlockComponentProps<TContent = unknown> {
  block: Block & { content: TContent };
  isEditing: boolean;
  isSelected?: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  mode?: BlockRenderMode;
}

/**
 * Type for a block component that can handle any content type.
 * Uses the base Block type to avoid invariance issues with generic content types.
 */
type AnyBlockComponent = React.LazyExoticComponent<
  React.ComponentType<{
    block: Block;
    isEditing: boolean;
    isSelected?: boolean;
    onUpdate: (updates: Partial<Block>) => void;
    mode?: BlockRenderMode;
  }>
>;

/**
 * Mapping of block types to their React components
 *
 * Note: Type assertion is used here because each component has a specific content type
 * (e.g., BlockComponentProps<TextBlockContent>), but we need to store them in a common
 * Record. This is safe because at runtime, each block will receive its correctly-typed
 * content through the Block type's discriminated union.
 */
const BLOCK_COMPONENTS = {
  // Text blocks
  text: TextBlock,
  heading: HeadingBlock,
  quote: QuoteBlock,
  code: CodeBlock,
  list: ListBlock,
  callout: CalloutBlock,
  divider: DividerBlock,

  // Media blocks
  image: ImageBlock,
  video: VideoBlock,
  audio: AudioBlock,
  embed: EmbedBlock,

  // Interactive blocks
  accordion: AccordionBlock,
  tabs: TabsBlock,
  hotspot: HotspotBlock,
  flipCard: FlipCardBlock,
  timeline: TimelineBlock,
  // carousel: CarouselBlock, // TODO(LXD-410): Create component
  // process: ProcessBlock, // TODO(LXD-410): Create component

  // Assessment blocks
  quiz: QuizBlock,
  knowledgeCheck: KnowledgeCheckBlock,

  // Scenario blocks
  scenario: ScenarioBlock,
  character: CharacterBlock,
  dialogue: DialogueBlock,

  // Layout blocks
  columns: ColumnsBlock,
  container: ContainerBlock,
  spacer: SpacerBlock,
  card: CardBlock,

  // Data blocks - TODO(LXD-410): Create these components
  // table: TableBlock,
  // chart: ChartBlock,
  // stat: StatBlock,
} as Partial<Record<BlockType, AnyBlockComponent>>;

/**
 * Props for BlockRenderer component
 */
interface BlockRendererProps {
  /** The block to render */
  block: Block;
  /** Whether block can be edited */
  isEditing?: boolean;
  /** Whether block is currently selected */
  isSelected?: boolean;
  /** Whether this is a preview render */
  isPreview?: boolean;
  /** Render mode */
  mode?: BlockRenderMode;
  /** Handler for block selection */
  onSelect?: () => void;
  /** Handler for block updates */
  onUpdate?: (updates: Partial<Block>) => void;
  /** Handler for block deletion */
  onDelete?: () => void;
  /** Handler for block duplication */
  onDuplicate?: () => void;
  /** Handler for moving block up */
  onMoveUp?: () => void;
  /** Handler for moving block down */
  onMoveDown?: () => void;
  /** Handler for adding block after this one */
  onAddAfter?: (type: BlockType) => void;
  /** Variables context for condition evaluation */
  variables?: Record<string, unknown>;
  /** Custom class name */
  className?: string;
}

/**
 * Loading fallback for lazy-loaded blocks
 */
function BlockLoadingFallback(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center p-8 bg-studio-bg/50 rounded-lg border border-(--color-studio-surface)/30 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-(--color-studio-accent) border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-(--color-studio-text-muted)">Loading block...</span>
      </div>
    </div>
  );
}

/**
 * Unknown block type fallback
 */
function UnknownBlockFallback({ type }: { type: string }): React.JSX.Element {
  return (
    <div className="p-4 bg-brand-warning/10 border border-amber-500/50 rounded-lg">
      <div className="flex items-center gap-3">
        <svg
          aria-hidden="true"
          className="w-5 h-5 text-brand-warning"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-brand-warning text-sm">
          Unknown block type:{' '}
          <code className="bg-brand-warning/20 px-1.5 py-0.5 rounded font-mono">{type}</code>
        </span>
      </div>
    </div>
  );
}

/**
 * Evaluate block conditions against current variable state
 */
function evaluateConditions(
  conditions: BlockCondition[] | undefined,
  variables: Record<string, unknown>,
): boolean {
  if (!conditions || conditions.length === 0) return true;

  let result = true;
  let currentCombine: 'and' | 'or' = 'and';

  for (const condition of conditions) {
    const value = variables[condition.variable];
    let conditionResult = false;

    switch (condition.operator) {
      case 'equals':
        conditionResult = value === condition.value;
        break;
      case 'notEquals':
        conditionResult = value !== condition.value;
        break;
      case 'greaterThan':
        conditionResult = Number(value) > Number(condition.value);
        break;
      case 'lessThan':
        conditionResult = Number(value) < Number(condition.value);
        break;
      case 'greaterOrEqual':
        conditionResult = Number(value) >= Number(condition.value);
        break;
      case 'lessOrEqual':
        conditionResult = Number(value) <= Number(condition.value);
        break;
      case 'contains':
        conditionResult = String(value).includes(String(condition.value));
        break;
      case 'notContains':
        conditionResult = !String(value).includes(String(condition.value));
        break;
      case 'startsWith':
        conditionResult = String(value).startsWith(String(condition.value));
        break;
      case 'endsWith':
        conditionResult = String(value).endsWith(String(condition.value));
        break;
      case 'isEmpty':
        conditionResult = !value || value === '' || (Array.isArray(value) && value.length === 0);
        break;
      case 'isNotEmpty':
        conditionResult = !!value && value !== '' && (!Array.isArray(value) || value.length > 0);
        break;
      case 'isTrue':
        conditionResult = value === true;
        break;
      case 'isFalse':
        conditionResult = value === false;
        break;
      case 'matches':
        try {
          const regex = new RegExp(String(condition.value));
          conditionResult = regex.test(String(value));
        } catch {
          // Silently ignore - invalid regex pattern, treat as non-matching
          conditionResult = false;
        }
        break;
      default:
        conditionResult = true;
    }

    // Apply action (show/hide inverts the result for hide)
    if (condition.action === 'hide') {
      conditionResult = !conditionResult;
    }

    // Combine with previous result
    if (currentCombine === 'and') {
      result = result && conditionResult;
    } else {
      result = result || conditionResult;
    }

    currentCombine = condition.combineWith || 'and';
  }

  return result;
}

/**
 * BlockRenderer - The main block rendering component
 *
 * Handles:
 * - Block type to component mapping
 * - Lazy loading of block components
 * - Condition evaluation for visibility
 * - Edit/preview mode switching
 * - Error boundaries
 */
export function BlockRenderer({
  block,
  isEditing = true,
  isSelected = false,
  isPreview = false,
  mode = 'edit',
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddAfter,
  variables = {},
  className,
}: BlockRendererProps) {
  // Get the component for this block type
  const BlockComponent = BLOCK_COMPONENTS[block.type];

  // Check if block is visible based on conditions
  const isVisible = useMemo(() => {
    return evaluateConditions(block.conditions, variables);
  }, [block.conditions, variables]);

  // Handle updates
  const handleUpdate = useCallback(
    (updates: Partial<Block>) => {
      onUpdate?.(updates);
    },
    [onUpdate],
  );

  // Convert style object to CSS properties
  const blockStyle = useMemo(() => {
    if (!block.style) return {};

    const style: React.CSSProperties = {};

    // Map block style to CSS
    if (block.style.width) style.width = block.style.width;
    if (block.style.height) style.height = block.style.height;
    if (block.style.maxWidth) style.maxWidth = block.style.maxWidth;
    if (block.style.minHeight) style.minHeight = block.style.minHeight;
    if (block.style.backgroundColor) style.backgroundColor = block.style.backgroundColor;
    if (block.style.borderRadius) style.borderRadius = block.style.borderRadius;
    if (block.style.boxShadow) style.boxShadow = block.style.boxShadow;
    if (block.style.opacity !== undefined) style.opacity = block.style.opacity;

    // Handle padding
    if (block.style.padding) {
      if (typeof block.style.padding === 'object') {
        style.paddingTop = block.style.padding.top;
        style.paddingRight = block.style.padding.right;
        style.paddingBottom = block.style.padding.bottom;
        style.paddingLeft = block.style.padding.left;
      } else {
        style.padding = block.style.padding;
      }
    }

    // Handle margin
    if (block.style.margin) {
      if (typeof block.style.margin === 'object') {
        style.marginTop = block.style.margin.top;
        style.marginRight = block.style.margin.right;
        style.marginBottom = block.style.margin.bottom;
        style.marginLeft = block.style.margin.left;
      } else {
        style.margin = block.style.margin;
      }
    }

    // Handle border
    if (block.style.borderWidth) {
      style.borderWidth = block.style.borderWidth;
      style.borderStyle = block.style.borderStyle || 'solid';
      style.borderColor = block.style.borderColor || 'var(--color-studio-surface)';
    }

    return style;
  }, [block.style]);

  // If block type is not supported
  if (!BlockComponent) {
    return (
      <BlockWrapper
        block={block}
        isSelected={isSelected}
        isHidden={!isVisible}
        onSelect={onSelect}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onAddAfter={onAddAfter}
        isEditing={isEditing}
        className={className}
      >
        <UnknownBlockFallback type={block.type} />
      </BlockWrapper>
    );
  }

  // If not visible and not in edit mode, don't render
  if (!isVisible && !isEditing) {
    return null;
  }

  // Preview mode - no wrapper, just render the block
  if (isPreview || mode === 'preview' || mode === 'learner') {
    return (
      <div
        className={`block-renderer ${!isVisible ? 'opacity-50' : ''} ${className || ''}`}
        style={blockStyle}
        data-block-id={block.id}
        data-block-type={block.type}
      >
        <React.Suspense fallback={<BlockLoadingFallback />}>
          <BlockComponent
            block={block}
            isEditing={false}
            isSelected={false}
            onUpdate={() => {}}
            mode={mode}
          />
        </React.Suspense>
      </div>
    );
  }

  // Edit mode - with wrapper for selection, drag, etc.
  return (
    <BlockWrapper
      block={block}
      isSelected={isSelected}
      isHidden={!isVisible}
      onSelect={onSelect}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onAddAfter={onAddAfter}
      isEditing={isEditing}
      className={className}
    >
      <div style={blockStyle}>
        <React.Suspense fallback={<BlockLoadingFallback />}>
          <BlockComponent
            block={block}
            isEditing={isEditing}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            mode={mode}
          />
        </React.Suspense>
      </div>
    </BlockWrapper>
  );
}

/**
 * Render multiple blocks
 */
export function BlockList({
  blocks,
  isEditing = true,
  selectedBlockId,
  mode = 'edit',
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlockUp,
  onMoveBlockDown,
  onAddBlockAfter,
  variables = {},
  className,
}: {
  blocks: Block[];
  isEditing?: boolean;
  selectedBlockId?: string;
  mode?: BlockRenderMode;
  onSelectBlock?: (blockId: string) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
  onMoveBlockUp?: (blockId: string) => void;
  onMoveBlockDown?: (blockId: string) => void;
  onAddBlockAfter?: (blockId: string, type: BlockType) => void;
  variables?: Record<string, unknown>;
  className?: string;
}) {
  // Sort blocks by order
  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.order - b.order);
  }, [blocks]);

  return (
    <div className={`block-list space-y-4 ${className || ''}`}>
      {sortedBlocks.map((block, index) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isEditing={isEditing}
          isSelected={selectedBlockId === block.id}
          mode={mode}
          onSelect={() => onSelectBlock?.(block.id)}
          onUpdate={(updates) => onUpdateBlock?.(block.id, updates)}
          onDelete={() => onDeleteBlock?.(block.id)}
          onDuplicate={() => onDuplicateBlock?.(block.id)}
          onMoveUp={index > 0 ? () => onMoveBlockUp?.(block.id) : undefined}
          onMoveDown={
            index < sortedBlocks.length - 1 ? () => onMoveBlockDown?.(block.id) : undefined
          }
          onAddAfter={(type) => onAddBlockAfter?.(block.id, type)}
          variables={variables}
        />
      ))}
    </div>
  );
}

export default BlockRenderer;
