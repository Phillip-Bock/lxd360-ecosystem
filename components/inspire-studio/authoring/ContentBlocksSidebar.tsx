import {
  BarChart,
  BookOpen,
  Box,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  MessageSquare,
  MinusSquare,
  Search,
  Sparkles,
  Star,
  Type,
  Wrench,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  type ContentBlockDefinition,
  contentBlocksData,
} from '@/lib/inspire/config/authoringBlocks';

interface ContentBlocksSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContentBlocksSidebar = ({
  isOpen,
  onClose,
}: ContentBlocksSidebarProps): React.JSX.Element | null => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, ContentBlockDefinition[]>();
    contentBlocksData.forEach((block) => {
      if (!categoryMap.has(block.category)) {
        categoryMap.set(block.category, []);
      }
      const categoryBlocks = categoryMap.get(block.category) ?? [];
      categoryBlocks.push(block);
    });
    return Array.from(categoryMap.entries()).map(([name, blocks]) => ({
      name,
      blocks,
      icon: getCategoryIcon(name),
    }));
  }, []);

  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return contentBlocksData;
    const query = searchQuery.toLowerCase();
    return contentBlocksData.filter(
      (block) =>
        block.name.toLowerCase().includes(query) ||
        block.description.toLowerCase().includes(query) ||
        block.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const favoriteBlocks = useMemo(() => {
    return contentBlocksData.filter((block) => favorites.includes(block.id));
  }, [favorites]);

  const handleDragStart = (e: React.DragEvent, block: ContentBlockDefinition): void => {
    e.dataTransfer.setData('blockType', block.type);
    e.dataTransfer.setData('blockName', block.name);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = (): void => {
    setIsDragging(false);
  };

  const toggleFavorite = (blockId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setFavorites((prev) => {
      if (prev.includes(blockId)) {
        return prev.filter((id) => id !== blockId);
      } else if (prev.length < 10) {
        return [...prev, blockId];
      }
      return prev;
    });
  };

  const toggleCategory = (categoryName: string): void => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - positioned to not interfere with drag operations */}
      <button
        type="button"
        className="fixed inset-0 bg-black/30 z-40 transition-opacity border-none cursor-default"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') onClose();
        }}
        aria-label="Close sidebar"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      />
      {/* Position sidebar to the right to avoid conflict with dashboard sidebar */}
      {/* Reduced width from 420px to 320px and moved to right side */}
      <div className="fixed right-0 top-0 bottom-0 w-[320px] bg-brand-surface shadow-2xl z-50 flex flex-col">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-surface/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-primary">Content Library</h2>
              <p className="text-sm text-blue-100">Drag blocks to build your lesson</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-brand-surface/20 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-brand-primary" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-brand-default">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-brand-secondary mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Results ({filteredBlocks.length})
              </h3>
              {filteredBlocks.length === 0 ? (
                <div className="text-center py-8 text-brand-muted">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-brand-secondary" />
                  <p className="font-medium">No blocks found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBlocks.map((block) => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      isFavorite={favorites.includes(block.id)}
                      onToggleFavorite={toggleFavorite}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={isDragging}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {favoriteBlocks.length > 0 && (
                <div className="p-6 border-b border-brand-default bg-amber-50">
                  <h3 className="text-sm font-semibold text-brand-primary mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Favorites ({favoriteBlocks.length}/10)
                  </h3>
                  <div className="space-y-2">
                    {favoriteBlocks.map((block) => (
                      <BlockCard
                        key={block.id}
                        block={block}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={isDragging}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6">
                {categories.map((category) => (
                  <div key={category.name} className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-3 bg-brand-page hover:bg-brand-surface rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-surface rounded-lg flex items-center justify-center shadow-sm">
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-brand-primary">{category.name}</h3>
                          <p className="text-xs text-brand-secondary">
                            {category.blocks.length} blocks
                          </p>
                        </div>
                      </div>
                      {expandedCategories.includes(category.name) ? (
                        <ChevronDown className="w-5 h-5 text-brand-muted group-hover:text-brand-secondary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-brand-secondary" />
                      )}
                    </button>

                    {expandedCategories.includes(category.name) && (
                      <div className="mt-2 ml-3 space-y-2">
                        {category.blocks.map((block) => (
                          <BlockCard
                            key={block.id}
                            block={block}
                            isFavorite={favorites.includes(block.id)}
                            onToggleFavorite={toggleFavorite}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            isDragging={isDragging}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!isDragging && (
          <div className="border-t border-brand-default p-4 bg-brand-page">
            <div className="text-xs text-brand-secondary space-y-1">
              <p className="flex items-center gap-2">
                <span className="w-4 h-4 bg-brand-primary rounded flex items-center justify-center text-brand-primary text-[10px]">
                  ↕
                </span>
                Drag blocks into the editor
              </p>
              <p className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Click star to add to favorites (max 10)
              </p>
            </div>
          </div>
        )}

        {isDragging && (
          <div className="border-t border-blue-200 p-4 bg-blue-50 animate-pulse">
            <p className="text-sm font-medium text-blue-900 text-center">
              Drop the block in your lesson content area
            </p>
          </div>
        )}
      </div>
    </>
  );
};

interface BlockCardProps {
  block: ContentBlockDefinition;
  isFavorite: boolean;
  onToggleFavorite: (blockId: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, block: ContentBlockDefinition) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const BlockCard = ({
  block,
  isFavorite,
  onToggleFavorite,
  onDragStart,
  onDragEnd,
  isDragging,
}: BlockCardProps): React.JSX.Element => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="option"
      aria-selected={false}
      tabIndex={0}
      className="group relative bg-brand-surface border-2 border-brand-default rounded-lg p-3 cursor-move hover:border-blue-400 hover:shadow-md transition-all duration-200 active:scale-95 active:rotate-2"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 ${block.color} rounded-lg flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-110 transition-transform shadow-sm`}
        >
          {block.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-brand-primary text-sm">{block.name}</h3>
              {block.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded uppercase">
                  {block.badge}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => onToggleFavorite(block.id, e)}
              className="shrink-0 p-1 hover:bg-brand-surface rounded transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isFavorite
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-brand-muted hover:text-amber-500'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-brand-secondary mt-0.5">{block.description}</p>
        </div>
      </div>

      {isHovering && !isDragging && (
        <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
          <div className="absolute top-1 right-1 bg-brand-primary text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
            DRAG
          </div>
        </div>
      )}
    </div>
  );
};

function getCategoryIcon(category: string): React.JSX.Element {
  switch (category) {
    case 'Knowledge Check':
      return <CheckSquare className="w-4 h-4 text-indigo-600" />;
    case 'Interactive':
      return <Sparkles className="w-4 h-4 text-brand-blue" />;
    case 'Social & Collaborative':
      return <MessageSquare className="w-4 h-4 text-teal-600" />;
    case 'Immersive (XR)':
      return <Box className="w-4 h-4 text-violet-600" />;
    case 'AI-Powered':
      return <Sparkles className="w-4 h-4 text-purple-600" />;
    case 'Utility':
      return <Wrench className="w-4 h-4 text-orange-600" />;
    case 'Text':
      return <Type className="w-4 h-4 text-brand-secondary" />;
    case 'Media':
      return <ImageIcon className="w-4 h-4 text-green-600" />;
    case 'Chart':
      return <BarChart className="w-4 h-4 text-emerald-600" />;
    case 'Divider':
      return <MinusSquare className="w-4 h-4 text-brand-secondary" />;
    default:
      return <BookOpen className="w-4 h-4 text-brand-secondary" />;
  }
}
