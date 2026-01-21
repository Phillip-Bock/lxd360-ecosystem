'use client';

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Grid3X3,
  Maximize2,
  Minimize2,
  Sparkles,
  Star,
  Type,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TEMPLATE_CATEGORY_INFO,
  type Template,
  type TemplatePlaceholder,
  type TemplateSlideDefinition,
} from '@/types/studio/templates';

interface TemplatePreviewProps {
  template: Template;
  onClose?: () => void;
  onUseTemplate?: (template: Template) => void;
}

/**
 * TemplatePreview - Detailed template preview with slide navigation
 */
export function TemplatePreview({ template, onClose, onUseTemplate }: TemplatePreviewProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Reserved for future animation playback feature
  const [/* isPlaying */ /* setIsPlaying */ ,] = useState(false);

  const slides = template.structure.slides || [];
  const currentSlide = slides[activeSlide];

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        setActiveSlide(index);
      }
    },
    [slides.length],
  );

  const nextSlide = useCallback(() => {
    goToSlide(activeSlide + 1);
  }, [activeSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(activeSlide - 1);
  }, [activeSlide, goToSlide]);

  return (
    <div
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{template.name}</h2>
              {template.featured && (
                <Badge className="bg-yellow-500">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {template.isPremium && (
                <Badge className="bg-purple-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-placeholders"
                  checked={showPlaceholders}
                  onCheckedChange={setShowPlaceholders}
                />
                <Label htmlFor="show-placeholders" className="text-sm">
                  <Type className="h-4 w-4 inline mr-1" />
                  Placeholders
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="show-guides" checked={showGuides} onCheckedChange={setShowGuides} />
                <Label htmlFor="show-guides" className="text-sm">
                  <Grid3X3 className="h-4 w-4 inline mr-1" />
                  Guides
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="w-24">
                <Slider
                  value={[zoomLevel]}
                  min={50}
                  max={150}
                  step={25}
                  onValueChange={([value]) => setZoomLevel(value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12">{zoomLevel}%</span>
            </div>
          </div>

          {/* Slide Preview */}
          <div className="flex-1 flex items-center justify-center p-8 bg-muted/20 overflow-auto">
            <div
              className="relative bg-background rounded-lg shadow-2xl overflow-hidden transition-all"
              style={{
                width: `${(960 * zoomLevel) / 100}px`,
                height: `${(540 * zoomLevel) / 100}px`,
              }}
            >
              {/* Slide Content */}
              {currentSlide ? (
                <SlidePreview
                  slide={currentSlide}
                  showPlaceholders={showPlaceholders}
                  showGuides={showGuides}
                  colorScheme={template.colorScheme}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <p>No slides in this template</p>
                </div>
              )}

              {/* Grid Overlay */}
              {showGuides && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 p-4 border-t">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={activeSlide === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeSlide
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <span className="text-sm text-muted-foreground">
              {activeSlide + 1} / {slides.length || 1}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={activeSlide >= slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-muted/10">
          <Tabs defaultValue="info" className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="info" className="flex-1">
                Info
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex-1">
                Structure
              </TabsTrigger>
              <TabsTrigger value="placeholders" className="flex-1">
                Fields
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="info" className="p-4 m-0">
                <TemplateInfoPanel template={template} />
              </TabsContent>

              <TabsContent value="structure" className="p-4 m-0">
                <TemplateStructurePanel
                  template={template}
                  activeSlide={activeSlide}
                  onSlideSelect={goToSlide}
                />
              </TabsContent>

              <TabsContent value="placeholders" className="p-4 m-0">
                <TemplatePlaceholdersPanel placeholders={template.placeholders} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {template.rating.toFixed(1)} ({template.reviewCount} reviews)
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {template.usageCount.toLocaleString()} uses
          </div>
          {template.estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />~{template.estimatedDuration} min
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={() => onUseTemplate?.(template)}>Use This Template</Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface SlidePreviewProps {
  slide: TemplateSlideDefinition;
  showPlaceholders: boolean;
  showGuides: boolean;
  colorScheme?: import('@/types/studio/templates').TemplateColorScheme;
}

function SlidePreview({
  slide,
  showPlaceholders,
  showGuides: _showGuides,
  colorScheme,
}: SlidePreviewProps) {
  return (
    <div
      className="w-full h-full p-8"
      style={{
        backgroundColor: colorScheme?.background || '#ffffff',
        color: colorScheme?.text || '#18181b',
      }}
    >
      {/* Slide Name */}
      <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-black/10 px-2 py-1 rounded">
        {slide.name}
      </div>

      {/* Blocks */}
      {slide.blocks.map((block) => (
        <div
          key={block.id}
          className="absolute rounded border-2 border-dashed"
          style={{
            left: `${block.position.x}%`,
            top: `${block.position.y}%`,
            width: `${block.position.width}%`,
            height: `${block.position.height}%`,
            borderColor: showPlaceholders ? colorScheme?.primary || '#0072f5' : 'transparent',
            backgroundColor: showPlaceholders
              ? `${colorScheme?.primary || '#0072f5'}10`
              : 'transparent',
          }}
        >
          {showPlaceholders && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
              <span className="text-xs font-medium">{block.type}</span>
              {block.placeholder && (
                <span className="text-xs text-muted-foreground mt-1">{block.placeholder.name}</span>
              )}
              {block.required && (
                <Badge variant="outline" className="text-xs mt-1">
                  Required
                </Badge>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface TemplateInfoPanelProps {
  template: Template;
}

function TemplateInfoPanel({ template }: TemplateInfoPanelProps) {
  return (
    <div className="space-y-6">
      {/* Author */}
      <div>
        <h4 className="text-sm font-medium mb-2">Author</h4>
        <div className="flex items-center gap-3">
          {template.author.avatar ? (
            <Image
              src={template.author.avatar}
              alt={template.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{template.author.name}</span>
              {template.author.verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            {template.author.organization && (
              <span className="text-sm text-muted-foreground">{template.author.organization}</span>
            )}
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-medium mb-2">Category</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{TEMPLATE_CATEGORY_INFO[template.category].label}</Badge>
          <Badge variant="outline" className="capitalize">
            {template.difficulty}
          </Badge>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="text-sm font-medium mb-2">Tags</h4>
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      {template.targetAudience && template.targetAudience.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Target Audience</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {template.targetAudience.map((audience, i) => (
              <li key={i}>• {audience}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Version */}
      <div>
        <h4 className="text-sm font-medium mb-2">Version</h4>
        <p className="text-sm text-muted-foreground">
          v{template.version} • Updated {new Date(template.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

interface TemplateStructurePanelProps {
  template: Template;
  activeSlide: number;
  onSlideSelect: (index: number) => void;
}

function TemplateStructurePanel({
  template,
  activeSlide,
  onSlideSelect,
}: TemplateStructurePanelProps) {
  const slides = template.structure.slides || [];
  const sections = template.structure.sections || [];

  return (
    <div className="space-y-4">
      {/* Sections */}
      {sections.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Sections</h4>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="p-2 rounded border bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{section.name}</span>
                  {section.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                {section.description && (
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slides */}
      <div>
        <h4 className="text-sm font-medium mb-2">Slides ({slides.length})</h4>
        <div className="space-y-1">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              className={`w-full flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border-none text-left ${
                index === activeSlide ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => onSlideSelect(index)}
              aria-pressed={index === activeSlide}
            >
              <span className="w-6 text-center text-sm">{index + 1}</span>
              <span className="text-sm flex-1 truncate">{slide.name}</span>
              {slide.required && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TemplatePlaceholdersPanelProps {
  placeholders: TemplatePlaceholder[];
}

function TemplatePlaceholdersPanel({ placeholders }: TemplatePlaceholdersPanelProps) {
  if (placeholders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Type className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No placeholders in this template</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Fill in these fields when using this template:
      </p>
      {placeholders.map((placeholder) => (
        <div key={placeholder.id} className="p-3 rounded border bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{placeholder.name}</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs capitalize">
                {placeholder.type}
              </Badge>
              {placeholder.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{placeholder.description}</p>
          {placeholder.hint && (
            <p className="text-xs text-muted-foreground mt-1 italic">Hint: {placeholder.hint}</p>
          )}
          {placeholder.examples && placeholder.examples.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Examples:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {placeholder.examples.map((example, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
