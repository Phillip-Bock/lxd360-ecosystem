'use client';

import {
  BookOpen,
  Clock,
  Crown,
  Eye,
  Filter,
  Grid3X3,
  List,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TEMPLATE_CATEGORY_INFO,
  type Template,
  type TemplateCategory,
  type TemplateDifficulty,
  type TemplateFilters,
  type TemplateSortOption,
  type TemplateType,
} from '@/types/studio/templates';

interface TemplateGalleryProps {
  templates: Template[];
  onSelectTemplate?: (template: Template) => void;
  onPreviewTemplate?: (template: Template) => void;
  onUseTemplate?: (template: Template) => void;
  defaultFilters?: TemplateFilters;
  showTypeFilter?: boolean;
}

/**
 * TemplateGallery - Browse and select templates
 */
export function TemplateGallery({
  templates,
  onSelectTemplate,
  onPreviewTemplate,
  onUseTemplate,
  defaultFilters = {},
  showTypeFilter = true,
}: TemplateGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TemplateFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<TemplateSortOption>('featured');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Type filter
    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      result = result.filter((t) => filters.category?.includes(t.category));
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      result = result.filter((t) => filters.difficulty?.includes(t.difficulty));
    }

    // Featured filter
    if (filters.featured) {
      result = result.filter((t) => t.featured);
    }

    // Rating filter
    if (filters.minRating) {
      result = result.filter((t) => t.rating >= (filters.minRating || 0));
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'duration':
        result.sort((a, b) => (a.estimatedDuration || 0) - (b.estimatedDuration || 0));
        break;
    }

    return result;
  }, [templates, searchQuery, filters, sortBy]);

  const handleSelectTemplate = useCallback(
    (template: Template) => {
      setSelectedTemplate(template);
      onSelectTemplate?.(template);
    },
    [onSelectTemplate],
  );

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters =
    searchQuery ||
    filters.type ||
    (filters.category && filters.category.length > 0) ||
    (filters.difficulty && filters.difficulty.length > 0) ||
    filters.featured;

  const getDifficultyBadge = (difficulty: TemplateDifficulty) => {
    const variants: Record<
      TemplateDifficulty,
      { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }
    > = {
      beginner: { variant: 'outline', label: 'Beginner' },
      intermediate: { variant: 'secondary', label: 'Intermediate' },
      advanced: { variant: 'default', label: 'Advanced' },
      expert: { variant: 'destructive', label: 'Expert' },
    };
    return variants[difficulty];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          {showTypeFilter && (
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  type: value === 'all' ? undefined : (value as TemplateType),
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Category
                {filters.category && filters.category.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.category.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-64">
                {Object.entries(TEMPLATE_CATEGORY_INFO).map(([key, info]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={filters.category?.includes(key as TemplateCategory)}
                    onCheckedChange={(checked) => {
                      setFilters((prev) => ({
                        ...prev,
                        category: checked
                          ? [...(prev.category || []), key as TemplateCategory]
                          : prev.category?.filter((c) => c !== key),
                      }));
                    }}
                  >
                    {info.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Difficulty Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Difficulty
                {filters.difficulty && filters.difficulty.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.difficulty.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Difficulty Level</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['beginner', 'intermediate', 'advanced', 'expert'] as TemplateDifficulty[]).map(
                (level) => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={filters.difficulty?.includes(level)}
                    onCheckedChange={(checked) => {
                      setFilters((prev) => ({
                        ...prev,
                        difficulty: checked
                          ? [...(prev.difficulty || []), level]
                          : prev.difficulty?.filter((d) => d !== level),
                      }));
                    }}
                  >
                    <span className="capitalize">{level}</span>
                  </DropdownMenuCheckboxItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as TemplateSortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => handleSelectTemplate(template)}
                    onPreview={() => onPreviewTemplate?.(template)}
                    onUse={() => onUseTemplate?.(template)}
                    getDifficultyBadge={getDifficultyBadge}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <TemplateListItem
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => handleSelectTemplate(template)}
                    onPreview={() => onPreviewTemplate?.(template)}
                    onUse={() => onUseTemplate?.(template)}
                    getDifficultyBadge={getDifficultyBadge}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
        <span>
          Showing {filteredTemplates.length} of {templates.length} templates
        </span>
        {selectedTemplate && (
          <div className="flex items-center gap-2">
            <span>Selected: {selectedTemplate.name}</span>
            <Button size="sm" onClick={() => onUseTemplate?.(selectedTemplate)}>
              Use Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onUse: () => void;
  getDifficultyBadge: (difficulty: TemplateDifficulty) => {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    label: string;
  };
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
  onUse,
  getDifficultyBadge,
}: TemplateCardProps) {
  const diffBadge = getDifficultyBadge(template.difficulty);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
        {template.thumbnail ? (
          <Image src={template.thumbnail} alt={template.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {template.featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {template.isPremium && (
          <Badge className="absolute top-2 right-2 bg-purple-500">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="capitalize">
            {template.type}
          </Badge>
          <Badge variant={diffBadge.variant}>{diffBadge.label}</Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {template.rating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {template.usageCount.toLocaleString()}
          </div>
          {template.estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {template.estimatedDuration} min
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          className="w-full"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}

interface TemplateListItemProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onUse: () => void;
  getDifficultyBadge: (difficulty: TemplateDifficulty) => {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    label: string;
  };
}

function TemplateListItem({
  template,
  isSelected,
  onSelect,
  onPreview,
  onUse,
  getDifficultyBadge,
}: TemplateListItemProps) {
  const diffBadge = getDifficultyBadge(template.difficulty);

  return (
    <button
      type="button"
      className={`w-full flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 text-left ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 bg-muted rounded overflow-hidden shrink-0">
        {template.thumbnail ? (
          <Image src={template.thumbnail} alt={template.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{template.name}</span>
          {template.featured && (
            <Badge className="bg-yellow-500 shrink-0">
              <Sparkles className="h-3 w-3" />
            </Badge>
          )}
          {template.isPremium && (
            <Badge className="bg-purple-500 shrink-0">
              <Crown className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{template.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="capitalize text-xs">
            {template.type}
          </Badge>
          <Badge variant={diffBadge.variant} className="text-xs">
            {diffBadge.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {TEMPLATE_CATEGORY_INFO[template.category].label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {template.rating.toFixed(1)}
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {template.usageCount.toLocaleString()}
        </div>
        {template.estimatedDuration && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {template.estimatedDuration} min
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
        >
          Use
        </Button>
      </div>
    </button>
  );
}
