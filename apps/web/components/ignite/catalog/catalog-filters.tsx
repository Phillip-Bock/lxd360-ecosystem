'use client';

import { Grid, List, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface CatalogFiltersProps {
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Currently selected category */
  selectedCategory: string;
  /** Callback when category changes */
  onCategoryChange: (category: string) => void;
  /** Currently selected difficulty */
  selectedDifficulty: string;
  /** Callback when difficulty changes */
  onDifficultyChange: (difficulty: string) => void;
  /** Currently selected duration filter */
  selectedDuration: string;
  /** Callback when duration changes */
  onDurationChange: (duration: string) => void;
  /** Current view mode */
  viewMode: 'grid' | 'list';
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'grid' | 'list') => void;
  /** Available categories */
  categories: string[];
  /** Additional class names */
  className?: string;
}

const DIFFICULTY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const DURATION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Any Duration' },
  { value: 'short', label: 'Under 1 hour' },
  { value: 'medium', label: '1-3 hours' },
  { value: 'long', label: '3-6 hours' },
  { value: 'extended', label: '6+ hours' },
];

/**
 * CatalogFilters - Search bar and filter controls for course catalog
 *
 * Features:
 * - Search input with clear button
 * - Category filter dropdown
 * - Difficulty level filter
 * - Duration filter
 * - Grid/List view toggle
 * - Fully accessible with keyboard navigation
 */
export function CatalogFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedDuration,
  onDurationChange,
  viewMode,
  onViewModeChange,
  categories,
  className,
}: CatalogFiltersProps): React.ReactElement {
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedDuration !== 'all';

  function handleClearFilters(): void {
    onSearchChange('');
    onCategoryChange('all');
    onDifficultyChange('all');
    onDurationChange('all');
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and view toggle row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search courses by title, description, or skill..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search courses"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-lxd-primary text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Grid className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-lxd-primary text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Filter dropdowns row */}
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty filter */}
        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by difficulty">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Duration filter */}
        <Select value={selectedDuration} onValueChange={onDurationChange}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by duration">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Helper to filter courses by duration
 */
export function filterByDuration(durationMinutes: number, filter: string): boolean {
  switch (filter) {
    case 'short':
      return durationMinutes < 60;
    case 'medium':
      return durationMinutes >= 60 && durationMinutes < 180;
    case 'long':
      return durationMinutes >= 180 && durationMinutes < 360;
    case 'extended':
      return durationMinutes >= 360;
    default:
      return true;
  }
}
