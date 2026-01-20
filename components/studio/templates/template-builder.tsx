'use client';

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  GripVertical,
  Layers,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_COLOR_SCHEMES,
  LAYOUT_PRESETS,
  TEMPLATE_CATEGORY_INFO,
  type Template,
  type TemplateCategory,
  type TemplateDifficulty,
  type TemplatePlaceholder,
  type TemplatePublishOptions,
  type TemplateSlideDefinition,
  type TemplateType,
  type TemplateValidationError,
} from '@/types/studio/templates';

interface TemplateBuilderProps {
  initialTemplate?: Partial<Template>;
  onSave?: (template: Partial<Template>) => void;
  onPublish?: (template: Partial<Template>, options: TemplatePublishOptions) => void;
  onPreview?: (template: Partial<Template>) => void;
}

/**
 * TemplateBuilder - Create and edit templates
 */
export function TemplateBuilder({
  initialTemplate,
  onSave,
  onPublish,
  onPreview,
}: TemplateBuilderProps) {
  const [template, setTemplate] = useState<Partial<Template>>(
    initialTemplate || {
      name: '',
      description: '',
      type: 'lesson',
      category: 'custom',
      difficulty: 'beginner',
      tags: [],
      structure: { type: 'lesson', slides: [] },
      placeholders: [],
      colorScheme: DEFAULT_COLOR_SCHEMES.professional,
    },
  );
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<TemplateValidationError[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const updateTemplate = useCallback((updates: Partial<Template>) => {
    setTemplate((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const validateTemplate = useCallback((): TemplateValidationError[] => {
    const newErrors: TemplateValidationError[] = [];

    if (!template.name || template.name.trim().length === 0) {
      newErrors.push({ field: 'name', message: 'Name is required', severity: 'error' });
    }

    if (!template.description || template.description.trim().length === 0) {
      newErrors.push({
        field: 'description',
        message: 'Description is required',
        severity: 'error',
      });
    }

    if (!template.structure?.slides || template.structure.slides.length === 0) {
      newErrors.push({
        field: 'slides',
        message: 'At least one slide is required',
        severity: 'error',
      });
    }

    setErrors(newErrors);
    return newErrors;
  }, [template]);

  const handleSave = useCallback(() => {
    const validationErrors = validateTemplate();
    if (validationErrors.filter((e) => e.severity === 'error').length === 0) {
      onSave?.(template);
      setIsDirty(false);
    }
  }, [template, validateTemplate, onSave]);

  const addSlide = useCallback(() => {
    const newSlide: TemplateSlideDefinition = {
      id: `slide-${Date.now()}`,
      name: `Slide ${(template.structure?.slides?.length || 0) + 1}`,
      layout: 'contentWithImage',
      required: false,
      order: template.structure?.slides?.length || 0,
      blocks: [],
    };

    updateTemplate({
      structure: {
        ...template.structure,
        type: template.structure?.type || 'lesson',
        slides: [...(template.structure?.slides || []), newSlide],
      },
    });

    setSelectedSlide(template.structure?.slides?.length || 0);
  }, [template.structure, updateTemplate]);

  const removeSlide = useCallback(
    (index: number) => {
      const slides = [...(template.structure?.slides || [])];
      slides.splice(index, 1);
      updateTemplate({
        structure: {
          ...template.structure,
          type: template.structure?.type || 'lesson',
          slides,
        },
      });
      setSelectedSlide(null);
    },
    [template.structure, updateTemplate],
  );

  const moveSlide = useCallback(
    (fromIndex: number, toIndex: number) => {
      const slides = [...(template.structure?.slides || [])];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      updateTemplate({
        structure: {
          ...template.structure,
          type: template.structure?.type || 'lesson',
          slides: slides.map((s, i) => ({ ...s, order: i })),
        },
      });
      setSelectedSlide(toIndex);
    },
    [template.structure, updateTemplate],
  );

  const updateSlide = useCallback(
    (index: number, updates: Partial<TemplateSlideDefinition>) => {
      const slides = [...(template.structure?.slides || [])];
      slides[index] = { ...slides[index], ...updates };
      updateTemplate({
        structure: {
          ...template.structure,
          type: template.structure?.type || 'lesson',
          slides,
        },
      });
    },
    [template.structure, updateTemplate],
  );

  const addPlaceholder = useCallback(() => {
    const newPlaceholder: TemplatePlaceholder = {
      id: `placeholder-${Date.now()}`,
      name: '',
      description: '',
      type: 'text',
      required: false,
    };

    updateTemplate({
      placeholders: [...(template.placeholders || []), newPlaceholder],
    });
  }, [template.placeholders, updateTemplate]);

  const removePlaceholder = useCallback(
    (index: number) => {
      const placeholders = [...(template.placeholders || [])];
      placeholders.splice(index, 1);
      updateTemplate({ placeholders });
    },
    [template.placeholders, updateTemplate],
  );

  const updatePlaceholder = useCallback(
    (index: number, updates: Partial<TemplatePlaceholder>) => {
      const placeholders = [...(template.placeholders || [])];
      placeholders[index] = { ...placeholders[index], ...updates };
      updateTemplate({ placeholders });
    },
    [template.placeholders, updateTemplate],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Template Builder</h2>
            <p className="text-sm text-muted-foreground">
              {initialTemplate?.id ? 'Edit Template' : 'Create New Template'}
            </p>
          </div>
          {isDirty && (
            <Badge variant="secondary">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onPreview?.(template)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={!isDirty}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => setShowPublishDialog(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Panel */}
        <div className="w-80 border-r bg-muted/10">
          <Tabs defaultValue="general" className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="general" className="flex-1">
                General
              </TabsTrigger>
              <TabsTrigger value="style" className="flex-1">
                Style
              </TabsTrigger>
              <TabsTrigger value="fields" className="flex-1">
                Fields
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="general" className="p-4 m-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={template.name || ''}
                    onChange={(e) => updateTemplate({ name: e.target.value })}
                    placeholder="Enter template name"
                  />
                  {errors.find((e) => e.field === 'name') && (
                    <p className="text-xs text-destructive">
                      {errors.find((e) => e.field === 'name')?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={template.description || ''}
                    onChange={(e) => updateTemplate({ description: e.target.value })}
                    placeholder="Describe your template"
                    rows={3}
                  />
                  {errors.find((e) => e.field === 'description') && (
                    <p className="text-xs text-destructive">
                      {errors.find((e) => e.field === 'description')?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={template.type || 'lesson'}
                    onValueChange={(v) => updateTemplate({ type: v as TemplateType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={template.category || 'custom'}
                    onValueChange={(v) => updateTemplate({ category: v as TemplateCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_CATEGORY_INFO).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={template.difficulty || 'beginner'}
                    onValueChange={(v) => updateTemplate({ difficulty: v as TemplateDifficulty })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={template.estimatedDuration || ''}
                    onChange={(e) =>
                      updateTemplate({
                        estimatedDuration: parseInt(e.target.value, 10) || undefined,
                      })
                    }
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={template.tags?.join(', ') || ''}
                    onChange={(e) =>
                      updateTemplate({
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="onboarding, hr, new hire"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {template.thumbnail ? (
                      <div className="relative w-full h-24">
                        <Image
                          src={template.thumbnail}
                          alt="Thumbnail"
                          fill
                          className="object-cover rounded"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => updateTemplate({ thumbnail: undefined })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload thumbnail image</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="p-4 m-0 space-y-4">
                <div className="space-y-2">
                  <Label>Color Scheme Preset</Label>
                  <Select
                    onValueChange={(v) => updateTemplate({ colorScheme: DEFAULT_COLOR_SCHEMES[v] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(DEFAULT_COLOR_SCHEMES).map((name) => (
                        <SelectItem key={name} value={name} className="capitalize">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Custom Colors</Label>
                  {template.colorScheme && (
                    <div className="space-y-2">
                      {Object.entries(template.colorScheme).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: value }}
                          />
                          <Input
                            value={value}
                            onChange={(e) =>
                              updateTemplate({
                                colorScheme: {
                                  ...(template.colorScheme ?? {
                                    primary: '#0072f5',
                                    secondary: '#6366f1',
                                    accent: '#00d4ff',
                                    background: '#000000',
                                    surface: '#1a1a1a',
                                    text: '#ffffff',
                                    mutedText: '#888888',
                                  }),
                                  [key]: e.target.value,
                                },
                              })
                            }
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground capitalize w-20">
                            {key}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="fields" className="p-4 m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Placeholder Fields</Label>
                  <Button size="sm" variant="outline" onClick={addPlaceholder}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>

                <div className="space-y-3">
                  {template.placeholders?.map((placeholder, index) => (
                    <Card key={placeholder.id}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={placeholder.name}
                            onChange={(e) => updatePlaceholder(index, { name: e.target.value })}
                            placeholder="Field name"
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removePlaceholder(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={placeholder.description}
                          onChange={(e) =>
                            updatePlaceholder(index, { description: e.target.value })
                          }
                          placeholder="Description"
                        />
                        <div className="flex gap-2">
                          <Select
                            value={placeholder.type}
                            onValueChange={(v) =>
                              updatePlaceholder(index, { type: v as TemplatePlaceholder['type'] })
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="richText">Rich Text</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={placeholder.required}
                              onCheckedChange={(checked) =>
                                updatePlaceholder(index, { required: checked })
                              }
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!template.placeholders || template.placeholders.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Type className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No placeholder fields yet</p>
                      <p className="text-xs mt-1">
                        Add fields that users will fill in when using this template
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Slides Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Slides</h3>
            <Button size="sm" onClick={addSlide}>
              <Plus className="h-4 w-4 mr-1" />
              Add Slide
            </Button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Slide List */}
            <div className="w-48 border-r">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {template.structure?.slides?.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.id}
                      className={`w-full flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border-none text-left ${
                        selectedSlide === index
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedSlide(index)}
                      aria-pressed={selectedSlide === index}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab" />
                      <span className="text-sm truncate flex-1">{slide.name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index > 0) moveSlide(index, index - 1);
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index < (template.structure?.slides?.length || 0) - 1) {
                              moveSlide(index, index + 1);
                            }
                          }}
                          disabled={index >= (template.structure?.slides?.length || 0) - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </button>
                  ))}

                  {(!template.structure?.slides || template.structure.slides.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs">No slides yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Slide Editor */}
            <div className="flex-1 p-4">
              {selectedSlide !== null && template.structure?.slides?.[selectedSlide] ? (
                <SlideEditor
                  slide={template.structure.slides[selectedSlide]}
                  onChange={(updates) => updateSlide(selectedSlide, updates)}
                  onDelete={() => removeSlide(selectedSlide)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Layers className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Slide Selected</p>
                    <p className="text-sm mt-1">Select a slide to edit or add a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <PublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        template={template}
        onPublish={(options) => {
          onPublish?.(template, options);
          setShowPublishDialog(false);
        }}
      />
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface SlideEditorProps {
  slide: TemplateSlideDefinition;
  onChange: (updates: Partial<TemplateSlideDefinition>) => void;
  onDelete: () => void;
}

function SlideEditor({ slide, onChange, onDelete }: SlideEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Edit Slide</h3>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Slide
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slide-name">Slide Name</Label>
          <Input
            id="slide-name"
            value={slide.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Layout</Label>
          <Select value={slide.layout} onValueChange={(v) => onChange({ layout: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="slide-required"
          checked={slide.required}
          onCheckedChange={(checked) => onChange({ required: checked })}
        />
        <Label htmlFor="slide-required">Required slide</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slide-notes">Slide Notes</Label>
        <Textarea
          id="slide-notes"
          value={slide.notes || ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Add notes for content creators..."
          rows={3}
        />
      </div>

      {/* Layout Preview */}
      <div className="space-y-2">
        <Label>Layout Preview</Label>
        <div className="aspect-video bg-muted rounded-lg border-2 border-dashed flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {LAYOUT_PRESETS[slide.layout as keyof typeof LAYOUT_PRESETS]?.description ||
              'Custom layout'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Partial<Template>;
  onPublish: (options: TemplatePublishOptions) => void;
}

function PublishDialog({ open, onOpenChange, template, onPublish }: PublishDialogProps) {
  const [options, setOptions] = useState<TemplatePublishOptions>({
    visibility: 'private',
    license: 'free',
    allowDerivatives: true,
    requireAttribution: true,
    categories: [template.category || 'custom'],
    tags: template.tags || [],
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Template</DialogTitle>
          <DialogDescription>Configure how your template will be shared</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={options.visibility}
              onValueChange={(v) =>
                setOptions({ ...options, visibility: v as TemplatePublishOptions['visibility'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Only you)</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>License</Label>
            <Select
              value={options.license}
              onValueChange={(v) =>
                setOptions({ ...options, license: v as TemplatePublishOptions['license'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {options.license === 'premium' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={options.price || ''}
                onChange={(e) =>
                  setOptions({ ...options, price: parseFloat(e.target.value) || undefined })
                }
                placeholder="19.99"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="derivatives"
              checked={options.allowDerivatives}
              onCheckedChange={(checked) => setOptions({ ...options, allowDerivatives: checked })}
            />
            <Label htmlFor="derivatives">Allow derivatives</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="attribution"
              checked={options.requireAttribution}
              onCheckedChange={(checked) => setOptions({ ...options, requireAttribution: checked })}
            />
            <Label htmlFor="attribution">Require attribution</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onPublish(options)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
