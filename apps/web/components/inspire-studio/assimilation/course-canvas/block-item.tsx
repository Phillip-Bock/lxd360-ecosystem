'use client';

import {
  AlignLeft,
  Box,
  ClipboardCheck,
  Compass,
  FileText,
  GitBranch,
  Headphones,
  Image,
  MessageCircle,
  Monitor,
  Move,
  Users,
  Video,
} from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/schemas/inspire';
import { getBlockTypeOption } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'file-text': FileText,
  'smart-text': FileText,
  image: Image,
  'unified-media': Image,
  'clipboard-check': ClipboardCheck,
  'logic-quiz': ClipboardCheck,
  headphones: Headphones,
  'contextual-audio': Headphones,
  video: Video,
  'dynamic-video': Video,
  box: Box,
  'spatial-container': Box,
  '3d-model': Box,
  users: Users,
  'social-hub': Users,
  'peer-review': Users,
  'align-left': AlignLeft,
  paragraph: AlignLeft,
  monitor: Monitor,
  simulation: Monitor,
  'git-branch': GitBranch,
  'branching-scenario': GitBranch,
  compass: Compass,
  '360-panorama': Compass,
  'message-circle': MessageCircle,
  discussion: MessageCircle,
  move: Move,
  'drag-drop': Move,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface BlockItemProps {
  block: ContentBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  scale: number;
  className?: string;
}

/**
 * BlockItem - Renders a single block on the canvas
 */
export function BlockItem({
  block,
  isSelected,
  onSelect,
  onDoubleClick,
  scale,
  className,
}: BlockItemProps) {
  const blockType = getBlockTypeOption(block.type);
  const Icon = ICON_MAP[block.type] ?? ICON_MAP[blockType?.icon ?? ''] ?? Box;

  return (
    // biome-ignore lint/a11y/useSemanticElements: Canvas block uses absolute positioning incompatible with native button styling
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'absolute rounded-lg cursor-move transition-shadow',
        'bg-lxd-dark-surface border',
        isSelected
          ? 'border-lxd-purple shadow-lg shadow-lxd-purple/20 ring-2 ring-lxd-purple/50'
          : 'border-lxd-dark-border hover:border-lxd-purple/50',
        className,
      )}
      style={{
        left: block.position.x * scale,
        top: block.position.y * scale,
        width: block.position.width * scale,
        height: block.position.height * scale,
      }}
    >
      {/* Block Content Preview */}
      <div className="absolute inset-2 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center',
              'bg-lxd-dark-bg border border-lxd-dark-border',
            )}
          >
            <Icon className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium truncate">{blockType?.name ?? block.type}</span>
        </div>

        {/* Content Preview */}
        <div className="flex-1 rounded bg-lxd-dark-bg/50 border border-lxd-dark-border p-2 overflow-hidden">
          {/* Show placeholder content based on type */}
          {(block.type === 'heading' ||
            block.type === 'paragraph' ||
            block.type === 'smart-text') && (
            <div className="space-y-1">
              <div className="h-2 bg-lxd-dark-border rounded w-3/4" />
              <div className="h-2 bg-lxd-dark-border rounded w-full" />
              <div className="h-2 bg-lxd-dark-border rounded w-2/3" />
            </div>
          )}
          {(block.type === 'image' ||
            block.type === 'unified-media' ||
            block.type === 'video' ||
            block.type === 'dynamic-video') && (
            <div className="h-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          {(block.type === 'logic-quiz' ||
            block.type === 'quiz-mc' ||
            block.type === 'quiz-tf') && (
            <div className="space-y-1">
              <div className="h-2 bg-lxd-dark-border rounded w-full" />
              <div className="flex gap-1 mt-2">
                <div className="h-4 w-4 rounded border border-lxd-dark-border" />
                <div className="h-2 bg-lxd-dark-border rounded flex-1 mt-1" />
              </div>
              <div className="flex gap-1">
                <div className="h-4 w-4 rounded border border-lxd-dark-border" />
                <div className="h-2 bg-lxd-dark-border rounded flex-1 mt-1" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Badges */}
        <div className="flex items-center gap-1 mt-2">
          {block.inspireMeta?.phase && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
              {block.inspireMeta.phase}
            </Badge>
          )}
          {block.inspireMeta?.cognitiveLoadWeight && block.inspireMeta.cognitiveLoadWeight > 1 && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 text-orange-400">
              {block.inspireMeta.cognitiveLoadWeight}x
            </Badge>
          )}
        </div>
      </div>

      {/* Resize Handles (when selected) */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-lxd-purple rounded-sm cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-lxd-purple rounded-sm cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-lxd-purple rounded-sm cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-lxd-purple rounded-sm cursor-se-resize" />
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-4 bg-lxd-purple rounded-sm cursor-w-resize" />
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-4 bg-lxd-purple rounded-sm cursor-e-resize" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-lxd-purple rounded-sm cursor-n-resize" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-lxd-purple rounded-sm cursor-s-resize" />
        </>
      )}
    </div>
  );
}
