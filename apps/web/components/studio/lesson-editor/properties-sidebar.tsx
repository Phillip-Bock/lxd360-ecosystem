'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  Layout,
  Palette,
  Settings,
  Type,
  Underline,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/** Block type for properties sidebar */
interface SelectedBlock {
  id: string;
  type: string;
  name: string;
  content: Record<string, unknown>;
}

interface PropertiesSidebarProps {
  selectedBlock: SelectedBlock | null;
  onUpdateBlock: (id: string, updates: Partial<SelectedBlock>) => void;
  onClose: () => void;
}

/**
 * PropertiesSidebar - Right sidebar for editing block properties
 * @param selectedBlock - Currently selected block or null
 * @param onUpdateBlock - Callback to update block properties
 * @param onClose - Callback to clear selection
 */
export function PropertiesSidebar({
  selectedBlock,
  onUpdateBlock,
  onClose,
}: PropertiesSidebarProps) {
  if (!selectedBlock) {
    return (
      <aside className="w-80 border-l border-(--navy-200) bg-(--inspire-canvas-bg) flex flex-col shrink-0 h-full shadow-xs">
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <Settings className="h-12 w-12 text-(--navy-300) mx-auto mb-4" />
            <p className="text-(--navy-500)">Select a block to edit its properties</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-(--navy-200) bg-(--inspire-canvas-bg) flex flex-col h-full shrink-0 shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-(--navy-200) bg-(--navy-100)/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-(--navy-800)">{selectedBlock.name}</h3>
          <p className="text-xs text-(--navy-500)">Block Properties</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-(--navy-500) hover:text-(--navy-800)"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Property Tabs */}
      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-4">
          <TabsTrigger value="content" className="text-xs">
            <Type className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            <Palette className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            <Layout className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            <Zap className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-4 mt-0">
            <BlockContentProperties block={selectedBlock} onUpdate={onUpdateBlock} />
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="p-4 space-y-4 mt-0">
            <BlockStyleProperties block={selectedBlock} onUpdate={onUpdateBlock} />
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="p-4 space-y-4 mt-0">
            <BlockLayoutProperties block={selectedBlock} onUpdate={onUpdateBlock} />
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="p-4 space-y-4 mt-0">
            <BlockAdvancedProperties block={selectedBlock} onUpdate={onUpdateBlock} />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

/** Content Properties - varies by block type */
function BlockContentProperties({
  block,
  onUpdate,
}: {
  block: SelectedBlock;
  onUpdate: (id: string, updates: Partial<SelectedBlock>) => void;
}) {
  const updateContent = (key: string, value: unknown) => {
    onUpdate(block.id, {
      content: { ...block.content, [key]: value },
    });
  };

  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'quote':
      return (
        <PropertySection title="Text Content">
          <div className="space-y-3">
            {block.type === 'heading' && (
              <div className="space-y-2">
                <Label className="text-xs">Heading Level</Label>
                <Select defaultValue="h2" onValueChange={(v) => updateContent('level', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="h3">Heading 3</SelectItem>
                    <SelectItem value="h4">Heading 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Text Formatting */}
            <div className="space-y-2">
              <Label className="text-xs">Formatting</Label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Bold className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Italic className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Underline className="h-3 w-3" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <AlignLeft className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <AlignCenter className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <AlignRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {block.type === 'quote' && (
              <div className="space-y-2">
                <Label className="text-xs">Attribution</Label>
                <Input
                  placeholder="Quote author or source"
                  onChange={(e) => updateContent('attribution', e.target.value)}
                />
              </div>
            )}
          </div>
        </PropertySection>
      );

    case 'image':
      return (
        <>
          <PropertySection title="Image Source">
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload or drag image</p>
              </div>
              <div className="text-center text-xs text-muted-foreground">or</div>
              <Input placeholder="Enter image URL..." />
            </div>
          </PropertySection>

          <PropertySection title="Alt Text" defaultOpen>
            <Textarea
              placeholder="Describe this image for accessibility..."
              className="resize-none"
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required for WCAG 2.1 AA compliance
            </p>
          </PropertySection>

          <PropertySection title="Caption">
            <Input placeholder="Optional caption..." />
          </PropertySection>
        </>
      );

    case 'video':
      return (
        <>
          <PropertySection title="Video Source">
            <div className="space-y-3">
              <Select defaultValue="url">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">URL (YouTube, Vimeo)</SelectItem>
                  <SelectItem value="upload">Upload File</SelectItem>
                  <SelectItem value="library">Media Library</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Paste video URL..." />
            </div>
          </PropertySection>

          <PropertySection title="Playback">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Autoplay</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Loop</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Controls</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Muted by Default</Label>
                <Switch />
              </div>
            </div>
          </PropertySection>

          <PropertySection title="Captions">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Captions</Label>
                <Switch />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Upload SRT/VTT File
              </Button>
            </div>
          </PropertySection>
        </>
      );

    case 'multiple-choice':
    case 'multiple-select':
    case 'true-false':
      return (
        <>
          <PropertySection title="Question Settings">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Points</Label>
                <Input type="number" defaultValue={10} min={0} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Attempts Allowed</Label>
                <Select defaultValue="unlimited">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 attempt</SelectItem>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Shuffle Options</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Correct Answer</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </PropertySection>

          <PropertySection title="Feedback">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Correct Feedback</Label>
                <Textarea
                  placeholder="Great job! That's correct."
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Incorrect Feedback</Label>
                <Textarea placeholder="Not quite. Try again!" rows={2} className="resize-none" />
              </div>
            </div>
          </PropertySection>

          <PropertySection title="xAPI Tracking">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Track Attempts</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Track Time Spent</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </PropertySection>
        </>
      );

    case 'accordion':
    case 'tabs':
      return (
        <>
          <PropertySection title="Items">
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-xs">
                <span className="text-sm flex-1">Section 1</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-xs">
                <span className="text-sm flex-1">Section 2</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                + Add Section
              </Button>
            </div>
          </PropertySection>

          <PropertySection title="Behavior">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow Multiple Open</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">First Item Open</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </PropertySection>
        </>
      );

    default:
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Content properties for {block.name}</p>
          <p className="text-xs mt-1">Coming soon</p>
        </div>
      );
  }
}

/** Style Properties - colors, typography, border, shadow */
function BlockStyleProperties({
  block: _block,
  onUpdate: _onUpdate,
}: {
  block: SelectedBlock;
  onUpdate: (id: string, updates: Partial<SelectedBlock>) => void;
}) {
  return (
    <>
      <PropertySection title="Colors">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Background</Label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xs border border-border bg-transparent" />
              <Input placeholder="transparent" className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Text Color</Label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xs border border-border bg-white" />
              <Input placeholder="#ffffff" className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Accent Color</Label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xs border border-border bg-[#00d4ff]" />
              <Input placeholder="#00d4ff" className="flex-1" />
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Typography">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Font Family</Label>
            <Select defaultValue="inherit">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">Theme Default</SelectItem>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="opensans">Open Sans</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Font Size</Label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[16]} min={10} max={72} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10">16px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Line Height</Label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[1.5]} min={1} max={3} step={0.1} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10">1.5</span>
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Border">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Border Width</Label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[0]} min={0} max={10} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10">0px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Border Radius</Label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[8]} min={0} max={32} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10">8px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Border Color</Label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xs border-2 border-border" />
              <Input placeholder="#1a1a2e" className="flex-1" />
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Shadow">
        <div className="space-y-3">
          <Select defaultValue="none">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="glow">Glow Effect</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PropertySection>
    </>
  );
}

/** Layout Properties - spacing, size, alignment, visibility */
function BlockLayoutProperties({
  block: _block,
  onUpdate: _onUpdate,
}: {
  block: SelectedBlock;
  onUpdate: (id: string, updates: Partial<SelectedBlock>) => void;
}) {
  return (
    <>
      <PropertySection title="Spacing">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Padding</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="T" className="text-center text-xs" />
              <Input placeholder="R" className="text-center text-xs" />
              <Input placeholder="B" className="text-center text-xs" />
              <Input placeholder="L" className="text-center text-xs" />
            </div>
            <p className="text-xs text-muted-foreground">Top, Right, Bottom, Left (px)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Margin</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="T" className="text-center text-xs" />
              <Input placeholder="R" className="text-center text-xs" />
              <Input placeholder="B" className="text-center text-xs" />
              <Input placeholder="L" className="text-center text-xs" />
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Size">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Select defaultValue="full">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="3/4">75%</SelectItem>
                <SelectItem value="1/2">50%</SelectItem>
                <SelectItem value="1/3">33%</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Width</Label>
            <Input placeholder="none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Min Height</Label>
            <Input placeholder="auto" />
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Alignment">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Horizontal</Label>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="flex-1">
                Left
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Center
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Right
              </Button>
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Visibility">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show on Desktop</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show on Tablet</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show on Mobile</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </PropertySection>
    </>
  );
}

/** Advanced Properties - accessibility, animation, xAPI, conditions, custom CSS */
function BlockAdvancedProperties({
  block,
  onUpdate: _onUpdate,
}: {
  block: SelectedBlock;
  onUpdate: (id: string, updates: Partial<SelectedBlock>) => void;
}) {
  return (
    <>
      <PropertySection title="Accessibility">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">ARIA Label</Label>
            <Input placeholder="Screen reader label..." />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">ARIA Role</Label>
            <Select defaultValue="auto">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="region">Region</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="complementary">Complementary</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Keyboard Navigable</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Animation">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Enter Animation</Label>
            <Select defaultValue="none">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade In</SelectItem>
                <SelectItem value="slide-up">Slide Up</SelectItem>
                <SelectItem value="slide-left">Slide Left</SelectItem>
                <SelectItem value="zoom">Zoom In</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Animation Delay</Label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[0]} min={0} max={2000} step={100} className="flex-1" />
              <span className="text-xs text-muted-foreground w-12">0ms</span>
            </div>
          </div>
        </div>
      </PropertySection>

      <PropertySection title="xAPI Tracking">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Track View</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Track Interaction</Label>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Custom Statement Verb</Label>
            <Input placeholder="experienced, completed, etc." />
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Conditional Display">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Conditions</Label>
            <Switch />
          </div>
          <p className="text-xs text-muted-foreground">
            Show/hide this block based on learner progress, quiz scores, or other conditions.
          </p>
          <Button variant="outline" size="sm" className="w-full" disabled>
            Configure Conditions
          </Button>
        </div>
      </PropertySection>

      <PropertySection title="Custom CSS">
        <div className="space-y-2">
          <Textarea
            placeholder={`.block {\n  /* custom styles */\n}`}
            className="font-mono text-xs resize-none"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Scoped to this block only</p>
        </div>
      </PropertySection>

      <PropertySection title="Block ID">
        <div className="space-y-2">
          <Input value={block.id} readOnly className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground">
            Use for custom scripting or xAPI extensions
          </p>
        </div>
      </PropertySection>
    </>
  );
}

/** Collapsible Property Section Component */
function PropertySection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
