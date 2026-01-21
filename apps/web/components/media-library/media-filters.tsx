'use client';

import { format } from 'date-fns';
import {
  AlertCircle,
  Box,
  Check,
  CheckCircle,
  File,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  type LucideIcon,
  Music,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  formatFileSize,
  type MediaAssetStatus,
  type MediaAssetType,
  type MediaFiltersState,
} from '@/types/media-library';

interface MediaFiltersProps {
  filters: MediaFiltersState;
  onFiltersChange: (filters: MediaFiltersState) => void;
  availableTags: string[];
  onClose: () => void;
}

const TYPE_OPTIONS: { type: MediaAssetType; label: string; icon: LucideIcon }[] = [
  { type: 'image', label: 'Images', icon: ImageIcon },
  { type: 'video', label: 'Videos', icon: Film },
  { type: 'audio', label: 'Audio', icon: Music },
  { type: 'document', label: 'Documents', icon: FileText },
  { type: '3d', label: '3D Models', icon: Box },
  { type: 'other', label: 'Other', icon: File },
];

const STATUS_OPTIONS: {
  status: MediaAssetStatus;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { status: 'ready', label: 'Ready', icon: CheckCircle, color: 'text-brand-success' },
  { status: 'processing', label: 'Processing', icon: Loader2, color: 'text-brand-blue' },
  { status: 'error', label: 'Error', icon: AlertCircle, color: 'text-brand-error' },
];

const SIZE_PRESETS = [
  { label: 'Under 1 MB', min: 0, max: 1024 * 1024 },
  { label: '1 - 10 MB', min: 1024 * 1024, max: 10 * 1024 * 1024 },
  { label: '10 - 100 MB', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  { label: 'Over 100 MB', min: 100 * 1024 * 1024, max: Infinity },
];

export function MediaFilters({
  filters,
  onFiltersChange,
  availableTags,
  onClose,
}: MediaFiltersProps) {
  const [tagSearch, setTagSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange ? { from: filters.dateRange.from, to: filters.dateRange.to } : undefined,
  );

  const toggleType = (type: MediaAssetType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types });
  };

  const toggleStatus = (status: MediaAssetStatus) => {
    const statuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: statuses });
  };

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags });
  };

  const setSize = (min: number, max: number) => {
    if (filters.sizeRange?.min === min && filters.sizeRange?.max === max) {
      onFiltersChange({ ...filters, sizeRange: undefined });
    } else {
      onFiltersChange({ ...filters, sizeRange: { min, max } });
    }
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFiltersChange({ ...filters, dateRange: { from: range.from, to: range.to } });
    } else {
      onFiltersChange({ ...filters, dateRange: undefined });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      types: [],
      status: [],
      tags: [],
      dateRange: undefined,
      sizeRange: undefined,
    });
    setDateRange(undefined);
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.status.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange ||
    filters.sizeRange;

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  return (
    <div className="border-t border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Type Filter */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Type
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
              <button
                type="button"
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  filters.types.includes(type)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10',
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Status
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(({ status, label, icon: Icon, color }) => (
              <button
                type="button"
                key={status}
                onClick={() => toggleStatus(status)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  filters.status.includes(status)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10',
                )}
              >
                <Icon className={cn('w-3 h-3', !filters.status.includes(status) && color)} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Size
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {SIZE_PRESETS.map(({ label, min, max }) => (
              <button
                type="button"
                key={label}
                onClick={() => setSize(min, max)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  filters.sizeRange?.min === min && filters.sizeRange?.max === max
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Upload Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  'Select date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mt-6">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Tags
        </Label>
        <div className="space-y-2">
          <Input
            placeholder="Search tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {filteredTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
                  filters.tags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10',
                )}
              >
                {filters.tags.includes(tag) && <Check className="w-3 h-3" />}
                {tag}
              </button>
            ))}
            {filteredTags.length === 0 && (
              <p className="text-sm text-muted-foreground">No tags found</p>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Active Filters
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {filters.types.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {TYPE_OPTIONS.find((t) => t.type === type)?.label}
                <button type="button" onClick={() => toggleType(type)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.status.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                {STATUS_OPTIONS.find((s) => s.status === status)?.label}
                <button type="button" onClick={() => toggleStatus(status)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                #{tag}
                <button type="button" onClick={() => toggleTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.sizeRange && (
              <Badge variant="secondary" className="gap-1">
                {formatFileSize(filters.sizeRange.min)} -{' '}
                {filters.sizeRange.max === Infinity ? '∞' : formatFileSize(filters.sizeRange.max)}
                <button
                  type="button"
                  onClick={() => onFiltersChange({ ...filters, sizeRange: undefined })}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="gap-1">
                {format(filters.dateRange.from, 'MMM d')} - {format(filters.dateRange.to, 'MMM d')}
                <button
                  type="button"
                  onClick={() => {
                    onFiltersChange({ ...filters, dateRange: undefined });
                    setDateRange(undefined);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
