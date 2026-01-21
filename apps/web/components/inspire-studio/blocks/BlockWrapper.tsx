'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  Box,
  ChevronDown,
  Clock,
  Code,
  Columns,
  EyeOff,
  FlipHorizontal,
  GitBranch,
  Grid,
  GripVertical,
  HelpCircle,
  Image,
  Layers,
  LayoutGrid,
  List,
  type LucideIcon,
  MessageCircle,
  Minus,
  MoreHorizontal,
  MousePointer,
  Music,
  PieChart,
  PlayCircle,
  Plus,
  Quote,
  Square,
  Star,
  Table,
  TrendingUp,
  Type,
  Users,
  Video,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { Block, BlockType } from '@/types/blocks';
import { BlockToolbar } from './BlockToolbar';

/**
 * Block type icon mapping
 */
const BLOCK_TYPE_ICONS: Partial<Record<BlockType, LucideIcon>> = {
  // Text
  text: Type,
  heading: Type,
  quote: Quote,
  code: Code,
  list: List,
  callout: AlertCircle,
  divider: Minus,
  // Media
  image: Image,
  imageGallery: Grid,
  imageCompare: Columns,
  video: Video,
  audio: Music,
  embed: PlayCircle,
  iframe: Box,
  file: Box,
  // Layout
  columns: Columns,
  container: Square,
  grid: LayoutGrid,
  spacer: Minus,
  card: Square,
  // Interactive
  accordion: ChevronDown,
  tabs: Layers,
  carousel: Layers,
  flipCard: FlipHorizontal,
  timeline: Clock,
  process: GitBranch,
  hotspot: MousePointer,
  labeledImage: Image,
  clickReveal: MousePointer,
  sliderReveal: Columns,
  sorting: List,
  matching: GitBranch,
  categorize: LayoutGrid,
  lightbox: Image,
  // Assessment
  quiz: HelpCircle,
  multipleChoice: HelpCircle,
  trueFalse: HelpCircle,
  knowledgeCheck: HelpCircle,
  survey: List,
  // Scenario
  scenario: GitBranch,
  dialogue: MessageCircle,
  conversation: MessageCircle,
  character: Users,
  // Data
  table: Table,
  chart: PieChart,
  stat: TrendingUp,
  comparison: Columns,
  dataCard: BarChart3,
  // Special
  testimonial: Quote,
  teamMember: Users,
  feature: Star,
  cta: Star,
  countdown: Clock,
  progress: TrendingUp,
  codePlayground: Code,
};

/**
 * Block type color mapping
 */
const BLOCK_TYPE_COLORS: Partial<Record<BlockType, string>> = {
  // Text - Blue
  text: 'var(--color-block-text)',
  heading: 'var(--color-block-text)',
  quote: 'var(--color-block-text)',
  code: 'var(--color-block-text)',
  list: 'var(--color-block-text)',
  callout: 'var(--color-block-text)',
  divider: 'var(--color-block-text)',
  // Media - Green
  image: 'var(--color-block-media)',
  imageGallery: 'var(--color-block-media)',
  imageCompare: 'var(--color-block-media)',
  video: 'var(--color-block-media)',
  audio: 'var(--color-block-media)',
  embed: 'var(--color-block-media)',
  iframe: 'var(--color-block-media)',
  file: 'var(--color-block-media)',
  // Layout - Purple
  columns: 'var(--color-block-layout)',
  container: 'var(--color-block-layout)',
  grid: 'var(--color-block-layout)',
  spacer: 'var(--color-block-layout)',
  card: 'var(--color-block-layout)',
  // Interactive - Amber
  accordion: 'var(--color-block-interactive)',
  tabs: 'var(--color-block-interactive)',
  carousel: 'var(--color-block-interactive)',
  flipCard: 'var(--color-block-interactive)',
  timeline: 'var(--color-block-interactive)',
  process: 'var(--color-block-interactive)',
  hotspot: 'var(--color-block-interactive)',
  labeledImage: 'var(--color-block-interactive)',
  clickReveal: 'var(--color-block-interactive)',
  sliderReveal: 'var(--color-block-interactive)',
  sorting: 'var(--color-block-interactive)',
  matching: 'var(--color-block-interactive)',
  categorize: 'var(--color-block-interactive)',
  lightbox: 'var(--color-block-interactive)',
  // Assessment - Pink
  quiz: 'var(--color-block-assessment)',
  multipleChoice: 'var(--color-block-assessment)',
  multipleSelect: 'var(--color-block-assessment)',
  trueFalse: 'var(--color-block-assessment)',
  fillBlank: 'var(--color-block-assessment)',
  matchingQuestion: 'var(--color-block-assessment)',
  ordering: 'var(--color-block-assessment)',
  shortAnswer: 'var(--color-block-assessment)',
  essay: 'var(--color-block-assessment)',
  hotspotQuestion: 'var(--color-block-assessment)',
  likert: 'var(--color-block-assessment)',
  ranking: 'var(--color-block-assessment)',
  fileUpload: 'var(--color-block-assessment)',
  knowledgeCheck: 'var(--color-block-assessment)',
  survey: 'var(--color-block-assessment)',
  // Scenario - Magenta
  scenario: 'var(--color-block-scenario)',
  dialogue: 'var(--color-block-scenario)',
  conversation: 'var(--color-block-scenario)',
  character: 'var(--color-block-scenario)',
  // Data - Cyan
  table: 'var(--color-block-data)',
  chart: 'var(--color-block-data)',
  stat: 'var(--color-block-data)',
  comparison: 'var(--color-block-data)',
  dataCard: 'var(--color-block-data)',
  // Special - Teal
  testimonial: 'var(--color-block-special)',
  teamMember: 'var(--color-block-special)',
  feature: 'var(--color-block-special)',
  pricing: 'var(--color-block-special)',
  cta: 'var(--color-block-special)',
  newsletter: 'var(--color-block-special)',
  social: 'var(--color-block-special)',
  map: 'var(--color-block-special)',
  calendar: 'var(--color-block-special)',
  countdown: 'var(--color-block-special)',
  progress: 'var(--color-block-special)',
  codePlayground: 'var(--color-block-special)',
};

/**
 * Props for BlockWrapper
 */
interface BlockWrapperProps {
  block: Block;
  isSelected: boolean;
  isHidden?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddAfter?: (type: BlockType) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * BlockWrapper - Selection, drag, resize wrapper for blocks
 */
export function BlockWrapper({
  block,
  isSelected,
  isHidden,
  isEditing = true,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddAfter,
  children,
  className,
}: BlockWrapperProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);

  // Get icon and color for this block type
  const Icon = BLOCK_TYPE_ICONS[block.type] || Box;
  const color = BLOCK_TYPE_COLORS[block.type] || 'var(--color-studio-text-muted)';

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(true);
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          blockId: block.id,
          blockType: block.type,
        }),
      );
      e.dataTransfer.effectAllowed = 'move';
    },
    [block.id, block.type],
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click on wrapper
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.();
    },
    [onSelect],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isSelected && onDelete) {
          e.preventDefault();
          onDelete();
        }
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        if (isSelected && onDuplicate) {
          e.preventDefault();
          onDuplicate();
        }
      }
      if (e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey)) {
        if (isSelected && onMoveUp) {
          e.preventDefault();
          onMoveUp();
        }
      }
      if (e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey)) {
        if (isSelected && onMoveDown) {
          e.preventDefault();
          onMoveDown();
        }
      }
    },
    [isSelected, onDelete, onDuplicate, onMoveUp, onMoveDown],
  );

  return (
    <section
      ref={wrapperRef}
      className={`
        relative group
        ${isDragging ? 'opacity-50' : ''}
        ${className || ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowAddMenu(false);
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isEditing ? 0 : -1}
      data-block-id={block.id}
      data-block-type={block.type}
      aria-label={`${block.type} block`}
    >
      {/* Selection outline */}
      <div
        className={`
          absolute -inset-0.5 rounded-lg pointer-events-none transition-all duration-150
          ${
            isSelected
              ? 'border-2 border-studio-accent bg-studio-accent/5 shadow-[0_0_0_4px_rgba(71,157,255,0.1)]'
              : isHovered && isEditing
                ? 'border border-dashed border-studio-accent/50'
                : 'border border-transparent'
          }
        `}
      />

      {/* Hidden indicator */}
      <AnimatePresence>
        {isHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-studio-bg-dark/80 rounded-lg flex items-center justify-center z-10 backdrop-blur-xs"
          >
            <div className="flex items-center gap-2 text-studio-text-muted bg-studio-bg px-3 py-2 rounded-lg border border-studio-surface/50">
              <EyeOff className="w-4 h-4" />
              <span className="text-sm">Hidden by condition</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side controls - Drag handle & type indicator */}
      <div
        className={`
          absolute -left-12 top-0 bottom-0 w-10 flex flex-col items-center justify-start pt-2 gap-1
          transition-opacity duration-150
          ${(isSelected || isHovered) && isEditing ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Drag handle */}
        <button
          type="button"
          ref={dragHandleRef}
          className="p-1.5 text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50 rounded cursor-grab active:cursor-grabbing transition-colors"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Block type icon */}
        <div className="p-1.5 rounded" style={{ backgroundColor: `${color}20` }} title={block.type}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>

      {/* Top toolbar - Only when selected */}
      <AnimatePresence>
        {isSelected && isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-12 left-0 right-0 z-20"
          >
            <BlockToolbar
              block={block}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block content */}
      <div className="relative">{children}</div>

      {/* Bottom add block button */}
      <AnimatePresence>
        {(isSelected || isHovered) && isEditing && onAddAfter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddMenu(!showAddMenu);
              }}
              className={`
                flex items-center justify-center w-6 h-6 rounded-full
                bg-studio-accent hover:bg-studio-accent-hover text-brand-primary
                shadow-lg transition-all hover:scale-110
                ${showAddMenu ? 'rotate-45' : ''}
              `}
              aria-label="Add block after"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Quick add menu */}
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-studio-bg border border-studio-surface/50 rounded-xl shadow-xl p-2 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs text-studio-text-muted px-2 py-1 mb-1">Quick Add</div>
                  <div className="space-y-0.5">
                    {[
                      {
                        type: 'text' as BlockType,
                        label: 'Text',
                        icon: Type,
                        color: 'var(--color-block-text)',
                      },
                      {
                        type: 'heading' as BlockType,
                        label: 'Heading',
                        icon: Type,
                        color: 'var(--color-block-text)',
                      },
                      {
                        type: 'image' as BlockType,
                        label: 'Image',
                        icon: Image,
                        color: 'var(--color-block-media)',
                      },
                      {
                        type: 'video' as BlockType,
                        label: 'Video',
                        icon: Video,
                        color: 'var(--color-block-media)',
                      },
                      {
                        type: 'accordion' as BlockType,
                        label: 'Accordion',
                        icon: ChevronDown,
                        color: 'var(--color-block-interactive)',
                      },
                      {
                        type: 'quiz' as BlockType,
                        label: 'Quiz',
                        icon: HelpCircle,
                        color: 'var(--color-block-assessment)',
                      },
                      {
                        type: 'scenario' as BlockType,
                        label: 'Scenario',
                        icon: GitBranch,
                        color: 'var(--color-block-scenario)',
                      },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => {
                          onAddAfter(item.type);
                          setShowAddMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-studio-surface/50 transition-colors text-left"
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                        </div>
                        <span className="text-sm text-studio-text">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-studio-surface/30 mt-2 pt-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-studio-surface/50 transition-colors text-left"
                      onClick={() => {
                        // Open full block palette
                        setShowAddMenu(false);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4 text-studio-text-muted" />
                      <span className="text-sm text-studio-text-muted">Browse all blocks...</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default BlockWrapper;
