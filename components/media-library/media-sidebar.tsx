'use client';

import {
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  Folder,
  FolderOpen,
  HardDrive,
  Images,
  LayoutGrid,
  type LucideIcon,
  Music,
  Plus,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  formatFileSize,
  type MediaAssetType,
  type MediaCollection,
  type MediaFiltersState,
  type MediaFolder,
} from '@/types/media-library';

interface MediaSidebarProps {
  folders: MediaFolder[];
  collections: MediaCollection[];
  currentFolderId?: string;
  currentCollectionId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  onCollectionSelect: (collectionId: string | undefined) => void;
  filters: MediaFiltersState;
  onFiltersChange: (filters: MediaFiltersState) => void;
  storageUsage: { used: number; limit: number; percentage: number };
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const QUICK_FILTERS: { type: MediaAssetType | 'all'; label: string; icon: LucideIcon }[] = [
  { type: 'all', label: 'All Files', icon: LayoutGrid },
  { type: 'image', label: 'Images', icon: Images },
  { type: 'video', label: 'Videos', icon: Film },
  { type: 'audio', label: 'Audio', icon: Music },
  { type: 'document', label: 'Documents', icon: FileText },
  { type: '3d', label: '3D Models', icon: Box },
];

function FolderTree({
  folders,
  currentFolderId,
  onSelect,
  parentId,
  level = 0,
}: {
  folders: MediaFolder[];
  currentFolderId?: string;
  onSelect: (folderId: string | undefined) => void;
  parentId?: string;
  level?: number;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const childFolders = folders.filter((f) => f.parentId === parentId);

  const toggleExpand = (folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const hasChildren = (folderId: string) => folders.some((f) => f.parentId === folderId);

  return (
    <>
      {childFolders.map((folder) => {
        const isExpanded = expandedIds.has(folder.id);
        const isSelected = currentFolderId === folder.id;
        const hasSubfolders = hasChildren(folder.id);

        return (
          <div key={folder.id}>
            <button
              type="button"
              onClick={() => onSelect(folder.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left group',
                isSelected
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              {hasSubfolders ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(folder.id);
                  }}
                  className="p-0.5 hover:bg-muted-foreground/20 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <span className="w-4" />
              )}
              {isSelected || isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Folder className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate flex-1">{folder.name}</span>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                {folder.assetCount}
              </span>
            </button>

            {isExpanded && hasSubfolders && (
              <FolderTree
                folders={folders}
                currentFolderId={currentFolderId}
                onSelect={onSelect}
                parentId={folder.id}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function MediaSidebar({
  folders,
  collections,
  currentFolderId,
  currentCollectionId,
  onFolderSelect,
  onCollectionSelect,
  filters,
  onFiltersChange,
  storageUsage,
  collapsed,
  onCollapsedChange,
}: MediaSidebarProps) {
  const activeTypeFilter =
    filters.types.length === 1 ? filters.types[0] : filters.types.length === 0 ? 'all' : null;

  const handleTypeFilter = (type: MediaAssetType | 'all') => {
    if (type === 'all') {
      onFiltersChange({ ...filters, types: [] });
    } else {
      onFiltersChange({ ...filters, types: [type] });
    }
    // Clear folder/collection when using quick filters
    onFolderSelect(undefined);
    onCollectionSelect(undefined);
  };

  if (collapsed) {
    return (
      <TooltipProvider>
        <div className="w-16 border-r border-border bg-card flex flex-col">
          <div className="p-2 border-b border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCollapsedChange(false)}
                  className="w-full h-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {QUICK_FILTERS.map(({ type, label, icon: Icon }) => (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTypeFilter === type ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => handleTypeFilter(type)}
                      className="w-full h-10"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            <div className="px-2 py-4">
              <div className="w-full h-px bg-border" />
            </div>

            <div className="p-2 space-y-1">
              {collections.map((collection) => (
                <Tooltip key={collection.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentCollectionId === collection.id ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => onCollectionSelect(collection.id)}
                      className="w-full h-10"
                    >
                      <Star
                        className="w-4 h-4"
                        style={{ color: collection.color }}
                        fill={
                          currentCollectionId === collection.id ? collection.color : 'transparent'
                        }
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{collection.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full h-10 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.limit)}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Media Library</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(true)}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Filters */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Quick Filters
            </h3>
            <div className="space-y-1">
              {QUICK_FILTERS.map(({ type, label, icon: Icon }) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    activeTypeFilter === type
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Folders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Folders
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => onFolderSelect(undefined)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  !currentFolderId && !currentCollectionId && filters.types.length === 0
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Folder className="w-4 h-4" />
                <span>All Files</span>
              </button>
              <FolderTree
                folders={folders}
                currentFolderId={currentFolderId}
                onSelect={onFolderSelect}
              />
            </div>
          </div>

          {/* Collections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Collections
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {collections.map((collection) => (
                <button
                  type="button"
                  key={collection.id}
                  onClick={() => onCollectionSelect(collection.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
                    currentCollectionId === collection.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Star
                    className="w-4 h-4 shrink-0"
                    style={{ color: collection.color }}
                    fill={currentCollectionId === collection.id ? collection.color : 'transparent'}
                  />
                  <span className="truncate flex-1">{collection.name}</span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                    {collection.assetCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Storage Usage */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Storage</span>
        </div>
        <Progress value={storageUsage.percentage} className="h-2 mb-1" />
        <p className="text-xs text-muted-foreground">
          {formatFileSize(storageUsage.used)} of {formatFileSize(storageUsage.limit)} used
        </p>
      </div>
    </div>
  );
}
