'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Crown,
  Image,
  Layout,
  type LucideIcon,
  MousePointer,
  Search,
  Sparkles,
  Star,
  Type,
  Users,
  Video,
  Volume2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ALL_BLOCKS,
  BLOCK_CATEGORIES,
  type BlockCategory,
  type ContentBlockDefinition,
  getBlocksByCategory,
  searchBlocks,
} from '@/lib/features/inspire-studio/config/authoringBlocks';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface BlockPaletteProps {
  onBlockSelect?: (block: ContentBlockDefinition) => void;
  favorites?: string[];
  recentlyUsed?: string[];
  onToggleFavorite?: (blockId: string) => void;
  className?: string;
  compact?: boolean;
}

export interface DraggableBlockItemProps {
  block: ContentBlockDefinition;
  isFavorite?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

// =============================================================================
// ICON MAP
// =============================================================================

const CATEGORY_ICONS: Record<BlockCategory, LucideIcon> = {
  text: Type,
  images: Image,
  video: Video,
  audio: Volume2,
  interactive: MousePointer,
  assessment: CheckCircle,
  data: BarChart3,
  layout: Layout,
  media: Box,
  social: Users,
};

// =============================================================================
// DRAGGABLE BLOCK ITEM
// =============================================================================

function DraggableBlockItem({
  block,
  isFavorite,
  onSelect,
  onToggleFavorite,
  compact,
}: DraggableBlockItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.id}`,
    data: {
      type: 'block',
      block,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.();
    },
    [onToggleFavorite],
  );

  const CategoryIcon = CATEGORY_ICONS[block.category] || Box;
  const IconComponent = CategoryIcon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const iconColor = BLOCK_CATEGORIES.find((c) => c.id === block.category)?.color || '#888';

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onSelect}
            className={cn(
              'group relative flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-studio-surface/30 border border-studio-border/50',
              'hover:bg-studio-surface hover:border-studio-accent/50',
              'cursor-grab active:cursor-grabbing transition-all',
              isDragging && 'ring-2 ring-studio-accent shadow-lg',
              compact && 'py-1.5 px-2',
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icon */}
            <div
              className={cn(
                'flex items-center justify-center rounded shrink-0',
                compact ? 'w-6 h-6' : 'w-8 h-8',
              )}
              style={{
                backgroundColor: `${iconColor}20`,
              }}
            >
              <IconComponent
                className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4')}
                style={{
                  color: iconColor,
                }}
              />
            </div>

            {/* Name and badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'font-medium text-foreground truncate',
                    compact ? 'text-xs' : 'text-sm',
                  )}
                >
                  {block.name}
                </span>
                {block.isNew && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1 text-[10px] bg-brand-success/20 text-brand-success border-0"
                  >
                    New
                  </Badge>
                )}
                {block.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
              </div>
            </div>

            {/* Favorite button */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'p-1 rounded hover:bg-studio-surface',
              )}
            >
              <Star
                className={cn(
                  'w-3.5 h-3.5',
                  isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
                )}
              />
            </button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{block.name}</p>
            <p className="text-xs text-muted-foreground">{block.description}</p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-[10px] h-4">
                {block.cognitiveLoad} load
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                ~{Math.round(block.estimatedTime / 60)}min
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// =============================================================================
// CATEGORY SECTION
// =============================================================================

interface CategorySectionProps {
  categoryId: BlockCategory;
  blocks: ContentBlockDefinition[];
  favorites: string[];
  onBlockSelect?: (block: ContentBlockDefinition) => void;
  onToggleFavorite?: (blockId: string) => void;
  defaultOpen?: boolean;
  compact?: boolean;
}

function CategorySection({
  categoryId,
  blocks,
  favorites,
  onBlockSelect,
  onToggleFavorite,
  defaultOpen = true,
  compact,
}: CategorySectionProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const category = BLOCK_CATEGORIES.find((c) => c.id === categoryId);
  const CategoryIcon = CATEGORY_ICONS[categoryId] || Box;
  const IconComponent = CategoryIcon as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  if (!category) return null;

  return (
    <div className="space-y-1">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md',
          'hover:bg-studio-surface/50 transition-colors',
        )}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <IconComponent className="w-4 h-4" style={{ color: category.color }} />
        <span className="text-sm font-medium text-foreground">{category.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">{blocks.length}</span>
      </button>

      {/* Category Blocks */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pl-2">
              {blocks.map((block) => (
                <DraggableBlockItem
                  key={block.id}
                  block={block}
                  isFavorite={favorites.includes(block.id)}
                  onSelect={() => onBlockSelect?.(block)}
                  onToggleFavorite={() => onToggleFavorite?.(block.id)}
                  compact={compact}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// BLOCK PALETTE
// =============================================================================

export function BlockPalette({
  onBlockSelect,
  favorites = [],
  recentlyUsed = [],
  onToggleFavorite,
  className,
  compact = false,
}: BlockPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter blocks based on search
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchBlocks(searchQuery);
  }, [searchQuery]);

  // Get favorite blocks
  const favoriteBlocks = useMemo(() => {
    return ALL_BLOCKS.filter((block) => favorites.includes(block.id));
  }, [favorites]);

  // Get recently used blocks
  const recentBlocks = useMemo(() => {
    return recentlyUsed
      .map((id) => ALL_BLOCKS.find((b) => b.id === id))
      .filter((block): block is ContentBlockDefinition => block !== undefined)
      .slice(0, 5);
  }, [recentlyUsed]);

  return (
    <div className={cn('flex flex-col h-full bg-studio-bg-dark', className)}>
      {/* Header */}
      <div className="p-3 border-b border-studio-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Box className="w-4 h-4 text-studio-accent" />
          Content Blocks
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-studio-surface/50 border-studio-border/50"
          />
        </div>
      </div>

      {/* Block List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Search Results */}
          {filteredBlocks && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {filteredBlocks.length} results
                </span>
              </div>
              <div className="space-y-1">
                {filteredBlocks.map((block) => (
                  <DraggableBlockItem
                    key={block.id}
                    block={block}
                    isFavorite={favorites.includes(block.id)}
                    onSelect={() => onBlockSelect?.(block)}
                    onToggleFavorite={() => onToggleFavorite?.(block.id)}
                    compact={compact}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Show categories when not searching */}
          {!filteredBlocks && (
            <>
              {/* Favorites Section */}
              {favoriteBlocks.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-muted-foreground">Favorites</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    {favoriteBlocks.map((block) => (
                      <DraggableBlockItem
                        key={block.id}
                        block={block}
                        isFavorite
                        onSelect={() => onBlockSelect?.(block)}
                        onToggleFavorite={() => onToggleFavorite?.(block.id)}
                        compact={compact}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recently Used Section */}
              {recentBlocks.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Recently Used</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    {recentBlocks.map((block) => (
                      <DraggableBlockItem
                        key={`recent-${block.id}`}
                        block={block}
                        isFavorite={favorites.includes(block.id)}
                        onSelect={() => onBlockSelect?.(block)}
                        onToggleFavorite={() => onToggleFavorite?.(block.id)}
                        compact={compact}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggested */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Sparkles className="w-4 h-4 text-studio-accent" />
                  <span className="text-xs font-medium text-muted-foreground">AI Suggested</span>
                </div>
                <p className="text-xs text-muted-foreground px-2 pb-2">
                  Based on your INSPIRE phase, add interactive content
                </p>
              </div>

              {/* Categories */}
              {BLOCK_CATEGORIES.map((category) => (
                <CategorySection
                  key={category.id}
                  categoryId={category.id}
                  blocks={getBlocksByCategory(category.id)}
                  favorites={favorites}
                  onBlockSelect={onBlockSelect}
                  onToggleFavorite={onToggleFavorite}
                  defaultOpen={category.id === 'text' || category.id === 'interactive'}
                  compact={compact}
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-studio-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          Drag blocks to canvas or click to insert
        </p>
      </div>
    </div>
  );
}

export { DraggableBlockItem, CategorySection };
