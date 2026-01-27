'use client';

import { File, Film, Image, Music, Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { MediaAssetType, MediaFilters, MediaSortOptions } from '@/lib/media/types';

// =============================================================================
// Types
// =============================================================================

export interface MediaFiltersBarProps {
  filters: MediaFilters;
  sortOptions: MediaSortOptions;
  searchQuery: string;
  onFiltersChange: (filters: MediaFilters) => void;
  onSortChange: (sort: MediaSortOptions) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const MEDIA_TYPES: { value: MediaAssetType; label: string; icon: typeof Image }[] = [
  { value: 'image', label: 'Images', icon: Image },
  { value: 'video', label: 'Videos', icon: Film },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'document', label: 'Documents', icon: File },
  { value: '3d_model', label: '3D Models', icon: File },
  { value: 'icon', label: 'Icons', icon: Image },
];

const SORT_OPTIONS: { field: MediaSortOptions['field']; label: string }[] = [
  { field: 'created_at', label: 'Date Added' },
  { field: 'updated_at', label: 'Last Modified' },
  { field: 'filename', label: 'Name' },
  { field: 'file_size', label: 'Size' },
  { field: 'usage_count', label: 'Usage' },
];

// =============================================================================
// Component
// =============================================================================

export function MediaFiltersBar({
  filters,
  sortOptions,
  searchQuery,
  onFiltersChange,
  onSortChange,
  onSearchChange,
  onClearFilters,
}: MediaFiltersBarProps) {
  const activeFilterCount = countActiveFilters(filters);
  const selectedTypes = Array.isArray(filters.type)
    ? filters.type
    : filters.type
      ? [filters.type]
      : [];

  const handleTypeToggle = (type: MediaAssetType) => {
    const current = selectedTypes;
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];

    onFiltersChange({
      ...filters,
      type: updated.length > 0 ? updated : undefined,
    });
  };

  const handleSortFieldChange = (field: MediaSortOptions['field']) => {
    onSortChange({
      ...sortOptions,
      field,
    });
  };

  const handleSortDirectionToggle = () => {
    onSortChange({
      ...sortOptions,
      direction: sortOptions.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search media..."
          className="pl-9 bg-zinc-900 border-white/10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-2">
        {/* Type Filter Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {MEDIA_TYPES.slice(0, 4).map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              type="button"
              variant={selectedTypes.includes(value) ? 'default' : 'outline'}
              size="sm"
              className={selectedTypes.includes(value) ? '' : 'border-white/10'}
              onClick={() => handleTypeToggle(value)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        {/* More Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="border-white/10">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Media Type</DropdownMenuLabel>
            {MEDIA_TYPES.map(({ value, label, icon: Icon }) => (
              <DropdownMenuCheckboxItem
                key={value}
                checked={selectedTypes.includes(value)}
                onCheckedChange={() => handleTypeToggle(value)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            {SORT_OPTIONS.map(({ field, label }) => (
              <DropdownMenuCheckboxItem
                key={field}
                checked={sortOptions.field === field}
                onCheckedChange={() => handleSortFieldChange(field)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sortOptions.direction === 'desc'}
              onCheckedChange={handleSortDirectionToggle}
            >
              Descending
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-zinc-400"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function countActiveFilters(filters: MediaFilters): number {
  let count = 0;

  if (filters.type) {
    count += Array.isArray(filters.type) ? filters.type.length : 1;
  }
  if (filters.status) count++;
  if (filters.folderId !== undefined) count++;
  if (filters.collectionId) count++;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.dateRange) count++;
  if (filters.sizeRange) count++;
  if (filters.uploadedBy) count++;

  return count;
}
