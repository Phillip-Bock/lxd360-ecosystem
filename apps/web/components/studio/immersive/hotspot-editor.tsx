'use client';

/**
 * HotspotEditor - Phase 13
 * Editor for placing and configuring hotspots in 360° panoramas
 */

import {
  ArrowRight,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  Link,
  MessageSquare,
  Play,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Video,
  Volume2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  HotspotAnimation,
  HotspotContent,
  HotspotIcon,
  HotspotStyle,
  HotspotType,
  PanoramaHotspot,
  PanoramaScene,
  SceneTransition,
} from '@/types/studio/immersive';

// =============================================================================
// TYPES
// =============================================================================

interface HotspotEditorProps {
  scene: PanoramaScene;
  scenes: PanoramaScene[];
  selectedHotspotId?: string;
  onSelectHotspot: (hotspotId: string | null) => void;
  onAddHotspot: (hotspot: Omit<PanoramaHotspot, 'id'>) => string;
  onUpdateHotspot: (hotspotId: string, updates: Partial<PanoramaHotspot>) => void;
  onDeleteHotspot: (hotspotId: string) => void;
  onDuplicateHotspot: (hotspotId: string) => string;
  /** Current view for placing new hotspots */
  currentView?: { theta: number; phi: number };
  onClose?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const HOTSPOT_TYPES: Array<{
  value: HotspotType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'info',
    label: 'Information',
    icon: <Info className="h-4 w-4" />,
    description: 'Show info popup',
  },
  {
    value: 'navigation',
    label: 'Navigation',
    icon: <ArrowRight className="h-4 w-4" />,
    description: 'Link to another scene',
  },
  {
    value: 'media',
    label: 'Media',
    icon: <Play className="h-4 w-4" />,
    description: 'Play media content',
  },
  {
    value: 'audio',
    label: 'Audio',
    icon: <Volume2 className="h-4 w-4" />,
    description: 'Audio narration',
  },
  {
    value: 'video',
    label: 'Video',
    icon: <Video className="h-4 w-4" />,
    description: 'Embedded video',
  },
  {
    value: 'quiz',
    label: 'Quiz',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Assessment question',
  },
  {
    value: 'link',
    label: 'External Link',
    icon: <Link className="h-4 w-4" />,
    description: 'Open external URL',
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Custom action',
  },
];

const HOTSPOT_ICONS: Array<{ value: HotspotIcon; label: string; preview: string }> = [
  { value: 'info', label: 'Info', preview: 'i' },
  { value: 'arrow', label: 'Arrow', preview: '>' },
  { value: 'play', label: 'Play', preview: '>' },
  { value: 'question', label: 'Question', preview: '?' },
  { value: 'link', label: 'Link', preview: '@' },
  { value: 'audio', label: 'Audio', preview: 'A' },
  { value: 'video', label: 'Video', preview: 'V' },
  { value: 'cube', label: '3D', preview: '3D' },
  { value: 'eye', label: 'Eye', preview: 'o' },
  { value: 'star', label: 'Star', preview: '*' },
  { value: 'pin', label: 'Pin', preview: '+' },
];

const TRANSITIONS: Array<{ value: SceneTransition; label: string }> = [
  { value: 'fade', label: 'Fade' },
  { value: 'crossfade', label: 'Crossfade' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'none', label: 'None' },
];

const DEFAULT_STYLE: HotspotStyle = {
  icon: 'info',
  color: '#ffffff',
  size: 24,
  pulse: false,
  glow: true,
  background: 'circle',
  backgroundColor: 'rgba(0,0,0,0.5)',
  idleOpacity: 0.8,
};

// =============================================================================
// HOTSPOT LIST ITEM
// =============================================================================

interface HotspotListItemProps {
  hotspot: PanoramaHotspot;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function HotspotListItem({
  hotspot,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
  onDuplicate,
}: HotspotListItemProps) {
  const typeInfo = HOTSPOT_TYPES.find((t) => t.value === hotspot.type);
  const iconInfo = HOTSPOT_ICONS.find((i) => i.value === hotspot.style.icon);

  return (
    <button
      type="button"
      className={cn(
        'group px-2 py-2 rounded-lg border transition-colors cursor-pointer w-full text-left',
        isSelected ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20',
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />

        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: hotspot.style.backgroundColor || 'rgba(0,0,0,0.5)' }}
        >
          {iconInfo?.preview || '•'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white truncate">{hotspot.name}</span>
            {hotspot.required && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded">
                Required
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            {typeInfo?.icon}
            <span>{typeInfo?.label}</span>
            <span className="text-zinc-700">•</span>
            <span>
              θ:{Math.round(hotspot.position.theta)}° φ:{Math.round(hotspot.position.phi)}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
          >
            {hotspot.visible !== false ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// HOTSPOT PROPERTIES PANEL
// =============================================================================

interface HotspotPropertiesProps {
  hotspot: PanoramaHotspot;
  scenes: PanoramaScene[];
  onUpdate: (updates: Partial<PanoramaHotspot>) => void;
}

function HotspotProperties({ hotspot, scenes, onUpdate }: HotspotPropertiesProps) {
  const [activeTab, setActiveTab] = useState('general');

  const updateStyle = (updates: Partial<HotspotStyle>) => {
    onUpdate({ style: { ...hotspot.style, ...updates } });
  };

  const updateContent = (updates: Partial<HotspotContent>) => {
    onUpdate({ content: { ...hotspot.content, ...updates } });
  };

  const updateAnimation = (updates: Partial<HotspotAnimation>) => {
    onUpdate({ animation: { ...hotspot.animation, ...updates } as HotspotAnimation });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
      <TabsList className="grid grid-cols-4 h-8 mx-2">
        <TabsTrigger value="general" className="text-xs">
          General
        </TabsTrigger>
        <TabsTrigger value="content" className="text-xs">
          Content
        </TabsTrigger>
        <TabsTrigger value="style" className="text-xs">
          Style
        </TabsTrigger>
        <TabsTrigger value="animation" className="text-xs">
          Animation
        </TabsTrigger>
      </TabsList>

      {/* General Tab */}
      <TabsContent value="general" className="flex-1 overflow-auto px-3 py-2 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Hotspot Name</Label>
          <Input
            value={hotspot.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="h-8 bg-zinc-900 border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Type</Label>
          <Select value={hotspot.type} onValueChange={(v) => onUpdate({ type: v as HotspotType })}>
            <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOTSPOT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Tooltip</Label>
          <Input
            value={hotspot.tooltip || ''}
            onChange={(e) => onUpdate({ tooltip: e.target.value })}
            placeholder="Hover text..."
            className="h-8 bg-zinc-900 border-white/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Theta (θ)</Label>
            <Input
              type="number"
              value={hotspot.position.theta}
              onChange={(e) =>
                onUpdate({
                  position: { ...hotspot.position, theta: Number(e.target.value) },
                })
              }
              min={0}
              max={360}
              className="h-8 bg-zinc-900 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Phi (φ)</Label>
            <Input
              type="number"
              value={hotspot.position.phi}
              onChange={(e) =>
                onUpdate({
                  position: { ...hotspot.position, phi: Number(e.target.value) },
                })
              }
              min={-90}
              max={90}
              className="h-8 bg-zinc-900 border-white/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm text-white">Required</Label>
            <p className="text-[10px] text-zinc-500">Must visit for tour completion</p>
          </div>
          <Switch
            checked={hotspot.required || false}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm text-white">Visible</Label>
            <p className="text-[10px] text-zinc-500">Show hotspot in viewer</p>
          </div>
          <Switch
            checked={hotspot.visible !== false}
            onCheckedChange={(checked) => onUpdate({ visible: checked })}
          />
        </div>
      </TabsContent>

      {/* Content Tab */}
      <TabsContent value="content" className="flex-1 overflow-auto px-3 py-2 space-y-4">
        {hotspot.type === 'info' && (
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Info Content (HTML)</Label>
            <Textarea
              value={hotspot.content.html || ''}
              onChange={(e) => updateContent({ html: e.target.value })}
              placeholder="<p>Your content here...</p>"
              className="min-h-32 bg-zinc-900 border-white/10 font-mono text-sm"
            />
          </div>
        )}

        {hotspot.type === 'navigation' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Target Scene</Label>
              <Select
                value={hotspot.content.targetSceneId || ''}
                onValueChange={(v) => updateContent({ targetSceneId: v })}
              >
                <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                  <SelectValue placeholder="Select scene..." />
                </SelectTrigger>
                <SelectContent>
                  {scenes.map((scene) => (
                    <SelectItem key={scene.id} value={scene.id}>
                      {scene.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Transition</Label>
              <Select
                value={hotspot.content.transition || 'fade'}
                onValueChange={(v) => updateContent({ transition: v as SceneTransition })}
              >
                <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSITIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {(hotspot.type === 'media' || hotspot.type === 'audio' || hotspot.type === 'video') && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Media URL</Label>
              <Input
                value={hotspot.content.mediaUrl || ''}
                onChange={(e) => updateContent({ mediaUrl: e.target.value })}
                placeholder="https://..."
                className="h-8 bg-zinc-900 border-white/10"
              />
            </div>

            {hotspot.type === 'media' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Media Type</Label>
                <Select
                  value={hotspot.content.mediaType || 'image'}
                  onValueChange={(v) =>
                    updateContent({ mediaType: v as 'image' | 'video' | 'audio' })
                  }
                >
                  <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {hotspot.type === 'link' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">URL</Label>
              <Input
                value={hotspot.content.url || ''}
                onChange={(e) => updateContent({ url: e.target.value })}
                placeholder="https://..."
                className="h-8 bg-zinc-900 border-white/10"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-white">Open in New Tab</Label>
              <Switch
                checked={hotspot.content.newTab !== false}
                onCheckedChange={(checked) => updateContent({ newTab: checked })}
              />
            </div>
          </>
        )}

        {hotspot.type === 'quiz' && (
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Question ID</Label>
            <Input
              value={hotspot.content.questionId || ''}
              onChange={(e) => updateContent({ questionId: e.target.value })}
              placeholder="Enter question ID..."
              className="h-8 bg-zinc-900 border-white/10"
            />
          </div>
        )}
      </TabsContent>

      {/* Style Tab */}
      <TabsContent value="style" className="flex-1 overflow-auto px-3 py-2 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Icon</Label>
          <div className="grid grid-cols-6 gap-1">
            {HOTSPOT_ICONS.map((icon) => (
              <button
                key={icon.value}
                type="button"
                className={cn(
                  'w-8 h-8 rounded flex items-center justify-center text-lg transition-colors',
                  hotspot.style.icon === icon.value
                    ? 'bg-primary/20 ring-1 ring-primary'
                    : 'bg-zinc-800 hover:bg-zinc-700',
                )}
                onClick={() => updateStyle({ icon: icon.value })}
                title={icon.label}
              >
                {icon.preview}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Icon Color</Label>
            <Input
              type="color"
              value={hotspot.style.color}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="h-8 w-full bg-zinc-900 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Background</Label>
            <Input
              type="color"
              value={hotspot.style.backgroundColor || '#000000'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              className="h-8 w-full bg-zinc-900 border-white/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Size</Label>
            <span className="text-xs text-zinc-500">{hotspot.style.size}px</span>
          </div>
          <Slider
            value={[hotspot.style.size]}
            onValueChange={([v]) => updateStyle({ size: v })}
            min={12}
            max={48}
            step={2}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Idle Opacity</Label>
            <span className="text-xs text-zinc-500">
              {Math.round((hotspot.style.idleOpacity || 0.8) * 100)}%
            </span>
          </div>
          <Slider
            value={[(hotspot.style.idleOpacity || 0.8) * 100]}
            onValueChange={([v]) => updateStyle({ idleOpacity: v / 100 })}
            min={20}
            max={100}
            step={5}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-white">Pulse Effect</Label>
          <Switch
            checked={hotspot.style.pulse || false}
            onCheckedChange={(checked) => updateStyle({ pulse: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-white">Glow Effect</Label>
          <Switch
            checked={hotspot.style.glow || false}
            onCheckedChange={(checked) => updateStyle({ glow: checked })}
          />
        </div>
      </TabsContent>

      {/* Animation Tab */}
      <TabsContent value="animation" className="flex-1 overflow-auto px-3 py-2 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Animation Type</Label>
          <Select
            value={hotspot.animation?.type || 'none'}
            onValueChange={(v) =>
              updateAnimation({
                type: v as HotspotAnimation['type'],
                duration: hotspot.animation?.duration || 1000,
              })
            }
          >
            <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
              <SelectItem value="spin">Spin</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hotspot.animation?.type && hotspot.animation.type !== 'none' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Duration</Label>
                <span className="text-xs text-zinc-500">
                  {hotspot.animation?.duration || 1000}ms
                </span>
              </div>
              <Slider
                value={[hotspot.animation?.duration || 1000]}
                onValueChange={([v]) => updateAnimation({ duration: v })}
                min={200}
                max={3000}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Delay</Label>
                <span className="text-xs text-zinc-500">{hotspot.animation?.delay || 0}ms</span>
              </div>
              <Slider
                value={[hotspot.animation?.delay || 0]}
                onValueChange={([v]) => updateAnimation({ delay: v })}
                min={0}
                max={2000}
                step={100}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-white">Loop Infinitely</Label>
              <Switch
                checked={hotspot.animation?.infinite || false}
                onCheckedChange={(checked) => updateAnimation({ infinite: checked })}
              />
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HotspotEditor({
  scene,
  scenes,
  selectedHotspotId,
  onSelectHotspot,
  onAddHotspot,
  onUpdateHotspot,
  onDeleteHotspot,
  onDuplicateHotspot,
  currentView,
  onClose,
}: HotspotEditorProps) {
  const selectedHotspot = scene.hotspots.find((h) => h.id === selectedHotspotId);

  const handleAddHotspot = useCallback(
    (type: HotspotType) => {
      const newHotspot: Omit<PanoramaHotspot, 'id'> = {
        name: `New ${HOTSPOT_TYPES.find((t) => t.value === type)?.label || 'Hotspot'}`,
        position: {
          theta: currentView?.theta || 0,
          phi: currentView?.phi || 0,
        },
        type,
        style: { ...DEFAULT_STYLE },
        content: {},
        visible: true,
      };

      const id = onAddHotspot(newHotspot);
      onSelectHotspot(id);
    },
    [currentView, onAddHotspot, onSelectHotspot],
  );

  return (
    <div className="flex flex-col h-full bg-(--neural-bg)">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Hotspot Editor</span>
          <span className="text-xs text-zinc-500">({scene.hotspots.length})</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <span className="text-lg">×</span>
          </Button>
        )}
      </div>

      {/* Add Hotspot */}
      <div className="px-4 py-2 border-b border-white/10">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-1 justify-between">
              <span className="flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Add Hotspot
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 gap-1">
              {HOTSPOT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-left transition-colors"
                  onClick={() => handleAddHotspot(type.value)}
                >
                  <span className="text-primary">{type.icon}</span>
                  <span className="text-xs text-white">{type.label}</span>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Split View */}
      <div className="flex-1 flex min-h-0">
        {/* Hotspot List */}
        <div className="w-1/2 border-r border-white/10 flex flex-col">
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {scene.hotspots.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hotspots yet</p>
                  <p className="text-xs mt-1">Add hotspots to make the scene interactive</p>
                </div>
              ) : (
                scene.hotspots.map((hotspot) => (
                  <HotspotListItem
                    key={hotspot.id}
                    hotspot={hotspot}
                    isSelected={hotspot.id === selectedHotspotId}
                    onSelect={() => onSelectHotspot(hotspot.id)}
                    onToggleVisibility={() =>
                      onUpdateHotspot(hotspot.id, { visible: hotspot.visible === false })
                    }
                    onDelete={() => {
                      onDeleteHotspot(hotspot.id);
                      if (selectedHotspotId === hotspot.id) {
                        onSelectHotspot(null);
                      }
                    }}
                    onDuplicate={() => {
                      const newId = onDuplicateHotspot(hotspot.id);
                      onSelectHotspot(newId);
                    }}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Properties Panel */}
        <div className="w-1/2 flex flex-col">
          {selectedHotspot ? (
            <HotspotProperties
              hotspot={selectedHotspot}
              scenes={scenes}
              onUpdate={(updates) => onUpdateHotspot(selectedHotspot.id, updates)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a hotspot to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 shrink-0">
        <p className="text-[10px] text-zinc-500 text-center">
          Position hotspots by clicking in the viewer or adjust θ/φ manually
        </p>
      </div>
    </div>
  );
}

export default HotspotEditor;
