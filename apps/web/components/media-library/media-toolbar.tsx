'use client';

import {
  ArrowUpDown,
  Filter,
  FolderInput,
  FolderPlus,
  Grid3X3,
  List,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type {
  MediaCollection,
  MediaFiltersState,
  MediaFolder,
  MediaSort,
  MediaSortDirection,
  MediaSortField,
  MediaViewMode,
} from '@/types/media-library';
import { MediaFilters } from './media-filters';
import { MediaSearch } from './media-search';

interface MediaToolbarProps {
  viewMode: MediaViewMode;
  onViewModeChange: (mode: MediaViewMode) => void;
  sort: MediaSort;
  onSortChange: (sort: MediaSort) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCount: number;
  onDelete: () => void;
  onMove: (folderId: string) => void;
  onAddToCollection: (collectionId: string) => void;
  folders: MediaFolder[];
  collections: MediaCollection[];
  totalAssets: number;
  filters: MediaFiltersState;
  onFiltersChange: (filters: MediaFiltersState) => void;
  availableTags: string[];
}

const SORT_OPTIONS: { field: MediaSortField; label: string }[] = [
  { field: 'date', label: 'Date Uploaded' },
  { field: 'name', label: 'Name' },
  { field: 'type', label: 'Type' },
  { field: 'size', label: 'Size' },
  { field: 'dimensions', label: 'Dimensions' },
];

export function MediaToolbar({
  viewMode,
  onViewModeChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
  selectedCount,
  onDelete,
  onMove,
  onAddToCollection,
  folders,
  collections,
  totalAssets,
  filters,
  onFiltersChange,
  availableTags,
}: MediaToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount =
    filters.types.length +
    filters.status.length +
    filters.tags.length +
    (filters.dateRange ? 1 : 0) +
    (filters.sizeRange ? 1 : 0);

  return (
    <TooltipProvider>
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Upload Button */}
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>

          {/* New Folder Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <FolderPlus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Folder</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-6 bg-border" />

          {/* Search */}
          <div className="flex-1 max-w-md">
            <MediaSearch value={searchQuery} onChange={onSearchChange} />
          </div>

          {/* Filters Button */}
          <Button
            variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border hidden md:block" />

          {/* Sort Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="hidden lg:inline">
                      {SORT_OPTIONS.find((o) => o.field === sort.field)?.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="lg:hidden">Sort</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sort.field}
                onValueChange={(value) => onSortChange({ ...sort, field: value as MediaSortField })}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.field} value={option.field}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Direction</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sort.direction}
                onValueChange={(value) =>
                  onSortChange({ ...sort, direction: value as MediaSortDirection })
                }
              >
                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewModeChange('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-t border-border">
            <span className="text-sm text-foreground font-medium">{selectedCount} selected</span>

            <div className="flex-1" />

            {/* Move to Folder */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FolderInput className="w-4 h-4" />
                  <span className="hidden sm:inline">Move</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Move to folder</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {folders
                  .filter((f) => !f.parentId)
                  .map((folder) => (
                    <DropdownMenuItem key={folder.id} onClick={() => onMove(folder.id)}>
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add to Collection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Star className="w-4 h-4" />
                  <span className="hidden sm:inline">Add to Collection</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Add to collection</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {collections.map((collection) => (
                  <DropdownMenuItem
                    key={collection.id}
                    onClick={() => onAddToCollection(collection.id)}
                  >
                    <Star className="w-4 h-4 mr-2" style={{ color: collection.color }} />
                    {collection.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete */}
            <Button variant="destructive" size="sm" className="gap-2" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {filtersOpen && (
          <MediaFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableTags={availableTags}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {/* Results Count */}
        <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border">
          {totalAssets} {totalAssets === 1 ? 'asset' : 'assets'}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>
    </TooltipProvider>
  );
}
