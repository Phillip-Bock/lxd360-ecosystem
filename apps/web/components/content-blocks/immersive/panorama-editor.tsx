'use client';

import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Settings2,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  type CustomHotspot,
  createHotspot,
  type DocumentHotspot,
  type Hotspot,
  type HotspotType,
  hotspotColors,
  hotspotIcons,
  hotspotLabels,
  type InfoHotspot,
  type LinkHotspot,
  type PanoramaScene,
  type SceneHotspot,
  type VideoHotspot,
  type WarningHotspot,
} from './hotspot-types';
import { PanoramaBlock } from './panorama-block';

interface PanoramaEditorProps {
  scene: PanoramaScene;
  availableScenes?: { id: string; name: string }[];
  onSceneUpdate: (scene: PanoramaScene) => void;
  onSave?: () => void;
  className?: string;
}

export function PanoramaEditor({
  scene,
  availableScenes = [],
  onSceneUpdate,
  onSave,
  className = '',
}: PanoramaEditorProps): React.JSX.Element {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [newHotspotType, setNewHotspotType] = useState<HotspotType>('info');
  const [showPreview, setShowPreview] = useState(true);
  const [expandedHotspots, setExpandedHotspots] = useState<Set<string>>(new Set());

  const handlePositionClick = useCallback(
    (pitch: number, yaw: number): void => {
      if (!isAddingHotspot) return;

      const newHotspot = createHotspot(newHotspotType, pitch, yaw);
      onSceneUpdate({
        ...scene,
        hotspots: [...scene.hotspots, newHotspot],
      });
      setSelectedHotspotId(newHotspot.id);
      setExpandedHotspots((prev) => new Set([...prev, newHotspot.id]));
      setIsAddingHotspot(false);
    },
    [isAddingHotspot, newHotspotType, scene, onSceneUpdate],
  );

  const updateHotspot = useCallback(
    (id: string, updates: Partial<Hotspot>): void => {
      onSceneUpdate({
        ...scene,
        hotspots: scene.hotspots.map((h) => (h.id === id ? { ...h, ...updates } : h)) as Hotspot[],
      });
    },
    [scene, onSceneUpdate],
  );

  const deleteHotspot = useCallback(
    (id: string): void => {
      onSceneUpdate({
        ...scene,
        hotspots: scene.hotspots.filter((h) => h.id !== id),
      });
      if (selectedHotspotId === id) {
        setSelectedHotspotId(null);
      }
    },
    [scene, onSceneUpdate, selectedHotspotId],
  );

  const toggleHotspotExpanded = (id: string): void => {
    setExpandedHotspots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderHotspotEditor = (hotspot: Hotspot): React.JSX.Element => {
    const Icon = hotspotIcons[hotspot.type];
    const isExpanded = expandedHotspots.has(hotspot.id);
    const isSelected = selectedHotspotId === hotspot.id;

    return (
      <Card
        key={hotspot.id}
        className={`p-3 bg-lxd-dark-surface-alt/30 border-lxd-dark-surface-alt ${
          isSelected ? 'ring-2 ring-secondary-blue' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-brand-muted cursor-move" />
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: hotspotColors[hotspot.type] }}
          >
            <Icon className="w-3 h-3 text-brand-primary" />
          </div>
          <span className="flex-1 text-sm text-brand-primary font-medium truncate">
            {getHotspotTitle(hotspot)}
          </span>
          <Badge variant="outline" className="text-xs border-lxd-dark-surface-alt text-brand-muted">
            {hotspotLabels[hotspot.type]}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toggleHotspotExpanded(hotspot.id)}
            className="h-6 w-6 text-brand-muted hover:text-brand-primary"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteHotspot(hotspot.id)}
            className="h-6 w-6 text-brand-error hover:text-red-300 hover:bg-brand-error/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Position info */}
        <div className="flex gap-4 mt-2 text-xs text-brand-muted">
          <span>Pitch: {hotspot.pitch.toFixed(1)}°</span>
          <span>Yaw: {hotspot.yaw.toFixed(1)}°</span>
        </div>

        {/* Expanded Editor */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-lxd-dark-surface-alt">
            {/* Common fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-brand-secondary text-xs">Pitch (°)</Label>
                <Input
                  type="number"
                  value={hotspot.pitch}
                  onChange={(e): void =>
                    updateHotspot(hotspot.id, { pitch: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
                  min={-90}
                  max={90}
                />
              </div>
              <div>
                <Label className="text-brand-secondary text-xs">Yaw (°)</Label>
                <Input
                  type="number"
                  value={hotspot.yaw}
                  onChange={(e): void =>
                    updateHotspot(hotspot.id, { yaw: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
                  min={0}
                  max={360}
                />
              </div>
            </div>

            <div>
              <Label className="text-brand-secondary text-xs">Tooltip</Label>
              <Input
                value={hotspot.tooltip || ''}
                onChange={(e): void => updateHotspot(hotspot.id, { tooltip: e.target.value })}
                placeholder="Optional tooltip text"
                className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
              />
            </div>

            {/* Type-specific fields */}
            {renderTypeSpecificFields(hotspot, updateHotspot, availableScenes)}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      {/* Preview Panel */}
      <div className={`flex-1 ${showPreview ? '' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={(): void => setShowPreview(!showPreview)}
            className="lg:hidden border-lxd-dark-surface-alt text-brand-secondary"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPreview ? 'Hide' : 'Show'}
          </Button>
        </div>
        <PanoramaBlock
          scene={scene}
          isEditing={isAddingHotspot}
          onPositionClick={handlePositionClick}
          showControls={true}
          showCompass={true}
        />
        {isAddingHotspot && (
          <Card className="mt-3 p-4 bg-warning/10 border-warning">
            <p className="text-sm text-warning text-center">
              Click on the panorama to place a new <strong>{hotspotLabels[newHotspotType]}</strong>{' '}
              hotspot
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={(): void => setIsAddingHotspot(false)}
              className="mt-2 w-full border-warning text-warning hover:bg-warning/20"
            >
              Cancel
            </Button>
          </Card>
        )}
      </div>

      {/* Editor Panel */}
      <div className="w-full lg:w-96">
        <Card className="p-4 bg-background-dark border-lxd-dark-surface-alt">
          {/* Scene Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5" />
              Scene Settings
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-brand-secondary text-sm">Scene Name</Label>
                <Input
                  value={scene.name}
                  onChange={(e): void => onSceneUpdate({ ...scene, name: e.target.value })}
                  className="bg-lxd-dark-surface-alt/30 border-lxd-dark-surface-alt text-brand-primary"
                />
              </div>
              <div>
                <Label className="text-brand-secondary text-sm">Caption</Label>
                <Input
                  value={scene.caption || ''}
                  onChange={(e): void => onSceneUpdate({ ...scene, caption: e.target.value })}
                  placeholder="Optional scene caption"
                  className="bg-lxd-dark-surface-alt/30 border-lxd-dark-surface-alt text-brand-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-brand-secondary text-sm">Initial Pitch</Label>
                  <Input
                    type="number"
                    value={scene.initialPitch || 0}
                    onChange={(e): void =>
                      onSceneUpdate({
                        ...scene,
                        initialPitch: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-lxd-dark-surface-alt/30 border-lxd-dark-surface-alt text-brand-primary"
                    min={-90}
                    max={90}
                  />
                </div>
                <div>
                  <Label className="text-brand-secondary text-sm">Initial Yaw</Label>
                  <Input
                    type="number"
                    value={scene.initialYaw || 0}
                    onChange={(e): void =>
                      onSceneUpdate({
                        ...scene,
                        initialYaw: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-lxd-dark-surface-alt/30 border-lxd-dark-surface-alt text-brand-primary"
                    min={0}
                    max={360}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hotspots */}
          <div className="border-t border-lxd-dark-surface-alt pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Hotspots
                <Badge className="ml-2 bg-secondary-blue">{scene.hotspots.length}</Badge>
              </h3>
            </div>

            {/* Add Hotspot */}
            <div className="flex gap-2 mb-4">
              <Select
                value={newHotspotType}
                onValueChange={(v): void => setNewHotspotType(v as HotspotType)}
              >
                <SelectTrigger className="flex-1 bg-lxd-dark-surface-alt/30 border-lxd-dark-surface-alt text-brand-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background-dark border-lxd-dark-surface-alt">
                  {(Object.keys(hotspotLabels) as HotspotType[]).map((type) => {
                    const Icon = hotspotIcons[type];
                    return (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-brand-primary hover:bg-lxd-dark-surface-alt"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: hotspotColors[type] }} />
                          {hotspotLabels[type]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button
                onClick={(): void => setIsAddingHotspot(true)}
                disabled={isAddingHotspot}
                className="bg-secondary-blue hover:bg-secondary-blue/80"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Hotspot List */}
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {scene.hotspots.length === 0 ? (
                  <div className="text-center py-8 text-brand-muted">
                    <p className="text-sm">No hotspots yet</p>
                    <p className="text-xs mt-1">Select a type and click the panorama to add one</p>
                  </div>
                ) : (
                  scene.hotspots.map((hotspot) => renderHotspotEditor(hotspot))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Save Button */}
          {onSave && (
            <div className="border-t border-lxd-dark-surface-alt pt-4 mt-4">
              <Button
                onClick={onSave}
                className="w-full bg-success hover:bg-success/80 text-brand-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Helper to get display title for hotspot
function getHotspotTitle(hotspot: Hotspot): string {
  switch (hotspot.type) {
    case 'info':
    case 'link':
    case 'custom':
    case 'video':
    case 'document':
    case 'warning':
      return hotspot.title;
    case 'scene':
      return `Go to: ${hotspot.targetSceneId || 'Not set'}`;
    default:
      return 'Hotspot';
  }
}

// Render type-specific editor fields
function renderTypeSpecificFields(
  hotspot: Hotspot,
  updateHotspot: (id: string, updates: Partial<Hotspot>) => void,
  availableScenes: { id: string; name: string }[],
): React.JSX.Element | null {
  switch (hotspot.type) {
    case 'info':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Title</Label>
            <Input
              value={(hotspot as InfoHotspot).title}
              onChange={(e): void => updateHotspot(hotspot.id, { title: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Content</Label>
            <Textarea
              value={(hotspot as InfoHotspot).content}
              onChange={(e): void => updateHotspot(hotspot.id, { content: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary text-sm resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Image URL (optional)</Label>
            <Input
              value={(hotspot as InfoHotspot).image || ''}
              onChange={(e): void => updateHotspot(hotspot.id, { image: e.target.value })}
              placeholder="https://..."
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
        </>
      );

    case 'scene':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Target Scene</Label>
            <Select
              value={(hotspot as SceneHotspot).targetSceneId}
              onValueChange={(v): void => updateHotspot(hotspot.id, { targetSceneId: v })}
            >
              <SelectTrigger className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm">
                <SelectValue placeholder="Select scene" />
              </SelectTrigger>
              <SelectContent className="bg-background-dark border-lxd-dark-surface-alt">
                {availableScenes.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="text-brand-primary hover:bg-lxd-dark-surface-alt"
                  >
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-brand-secondary text-xs">Target Pitch</Label>
              <Input
                type="number"
                value={(hotspot as SceneHotspot).targetPitch || 0}
                onChange={(e): void =>
                  updateHotspot(hotspot.id, { targetPitch: parseFloat(e.target.value) || 0 })
                }
                className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-brand-secondary text-xs">Target Yaw</Label>
              <Input
                type="number"
                value={(hotspot as SceneHotspot).targetYaw || 0}
                onChange={(e): void =>
                  updateHotspot(hotspot.id, { targetYaw: parseFloat(e.target.value) || 0 })
                }
                className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Transition Duration (ms)</Label>
            <Input
              type="number"
              value={(hotspot as SceneHotspot).transitionDuration || 1000}
              onChange={(e): void =>
                updateHotspot(hotspot.id, {
                  transitionDuration: parseInt(e.target.value, 10) || 1000,
                })
              }
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
        </>
      );

    case 'link':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Title</Label>
            <Input
              value={(hotspot as LinkHotspot).title}
              onChange={(e): void => updateHotspot(hotspot.id, { title: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">URL</Label>
            <Input
              value={(hotspot as LinkHotspot).url}
              onChange={(e): void => updateHotspot(hotspot.id, { url: e.target.value })}
              placeholder="https://..."
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-brand-secondary text-xs">Open in new tab</Label>
            <Switch
              checked={(hotspot as LinkHotspot).openInNewTab ?? true}
              onCheckedChange={(checked): void =>
                updateHotspot(hotspot.id, { openInNewTab: checked })
              }
            />
          </div>
        </>
      );

    case 'custom':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Title</Label>
            <Input
              value={(hotspot as CustomHotspot).title}
              onChange={(e): void => updateHotspot(hotspot.id, { title: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Callback ID</Label>
            <Input
              value={(hotspot as CustomHotspot).callbackId}
              onChange={(e): void => updateHotspot(hotspot.id, { callbackId: e.target.value })}
              placeholder="e.g., onMachineClick"
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
        </>
      );

    case 'video':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Title</Label>
            <Input
              value={(hotspot as VideoHotspot).title}
              onChange={(e): void => updateHotspot(hotspot.id, { title: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Video URL</Label>
            <Input
              value={(hotspot as VideoHotspot).videoUrl}
              onChange={(e): void => updateHotspot(hotspot.id, { videoUrl: e.target.value })}
              placeholder="https://..."
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-brand-secondary text-xs">Autoplay</Label>
            <Switch
              checked={(hotspot as VideoHotspot).autoplay ?? false}
              onCheckedChange={(checked): void => updateHotspot(hotspot.id, { autoplay: checked })}
            />
          </div>
        </>
      );

    case 'document':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Title</Label>
            <Input
              value={(hotspot as DocumentHotspot).title}
              onChange={(e): void => updateHotspot(hotspot.id, { title: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Document URL</Label>
            <Input
              value={(hotspot as DocumentHotspot).documentUrl}
              onChange={(e): void => updateHotspot(hotspot.id, { documentUrl: e.target.value })}
              placeholder="https://..."
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Document Type</Label>
            <Select
              value={(hotspot as DocumentHotspot).documentType}
              onValueChange={(v): void =>
                updateHotspot(hotspot.id, { documentType: v as 'pdf' | 'doc' | 'other' })
              }
            >
              <SelectTrigger className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-dark border-lxd-dark-surface-alt">
                <SelectItem value="pdf" className="text-brand-primary">
                  PDF
                </SelectItem>
                <SelectItem value="doc" className="text-brand-primary">
                  Document
                </SelectItem>
                <SelectItem value="other" className="text-brand-primary">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'warning':
      return (
        <>
          <div>
            <Label className="text-brand-secondary text-xs">Title</Label>
            <Input
              value={(hotspot as WarningHotspot).title}
              onChange={(e): void => updateHotspot(hotspot.id, { title: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Severity</Label>
            <Select
              value={(hotspot as WarningHotspot).severity}
              onValueChange={(v): void =>
                updateHotspot(hotspot.id, {
                  severity: v as 'low' | 'medium' | 'high' | 'critical',
                })
              }
            >
              <SelectTrigger className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-dark border-lxd-dark-surface-alt">
                <SelectItem value="low" className="text-brand-warning">
                  Low
                </SelectItem>
                <SelectItem value="medium" className="text-orange-400">
                  Medium
                </SelectItem>
                <SelectItem value="high" className="text-brand-error">
                  High
                </SelectItem>
                <SelectItem value="critical" className="text-red-600">
                  Critical
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-brand-secondary text-xs">Warning Content</Label>
            <Textarea
              value={(hotspot as WarningHotspot).content}
              onChange={(e): void => updateHotspot(hotspot.id, { content: e.target.value })}
              className="bg-background-dark border-lxd-dark-surface-alt text-brand-primary text-sm resize-none"
              rows={3}
            />
          </div>
        </>
      );

    default:
      return null;
  }
}

export default PanoramaEditor;
