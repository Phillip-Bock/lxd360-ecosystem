'use client';

import { Plus, Target, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { HotspotConfig } from './HotspotConfig';
import { HotspotListItem } from './HotspotMarker';
import type { Hotspot, HotspotType, ThreeSixtyScene } from './types';

// =============================================================================
// Types
// =============================================================================

interface HotspotManagerProps {
  scene: ThreeSixtyScene;
  selectedHotspotId: string | null;
  isPlacingHotspot: boolean;
  newHotspotType: HotspotType;
  onSelectHotspot: (id: string | null) => void;
  onUpdateHotspot: (id: string, updates: Partial<Hotspot>) => void;
  onDeleteHotspot: (id: string) => void;
  onStartPlacing: (type: HotspotType) => void;
  onCancelPlacing: () => void;
  onTypeChange: (type: HotspotType) => void;
  availableScenes?: Array<{ id: string; title: string }>;
  availableBlocks?: Array<{ id: string; type: string; label: string }>;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * HotspotManager - Sidebar panel for managing hotspots
 */
export function HotspotManager({
  scene,
  selectedHotspotId,
  isPlacingHotspot,
  newHotspotType,
  onSelectHotspot,
  onUpdateHotspot,
  onDeleteHotspot,
  onStartPlacing,
  onCancelPlacing,
  onTypeChange,
  availableScenes = [],
  availableBlocks = [],
  className,
}: HotspotManagerProps) {
  const selectedHotspot = scene.hotspots.find((h) => h.id === selectedHotspotId);

  const handleDeleteSelected = useCallback(() => {
    if (selectedHotspotId) {
      onDeleteHotspot(selectedHotspotId);
      onSelectHotspot(null);
    }
  }, [selectedHotspotId, onDeleteHotspot, onSelectHotspot]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-lxd-dark-border">
        <h2 className="text-sm font-semibold">Hotspots</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {scene.hotspots.length} hotspot{scene.hotspots.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Add hotspot controls */}
      <div className="flex-shrink-0 p-4 border-b border-lxd-dark-border space-y-3">
        {isPlacingHotspot ? (
          <>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-lxd-cyan/10 border border-lxd-cyan/30">
              <Target className="h-4 w-4 text-lxd-cyan animate-pulse" />
              <span className="text-xs text-lxd-cyan">Click on panorama to place</span>
            </div>
            <div className="flex gap-2">
              <Select value={newHotspotType} onValueChange={(v) => onTypeChange(v as HotspotType)}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info_popup">Info Popup</SelectItem>
                  <SelectItem value="audio_spatial">Spatial Audio</SelectItem>
                  <SelectItem value="navigation">Navigation</SelectItem>
                  <SelectItem value="quiz_block">Quiz Block</SelectItem>
                  <SelectItem value="sim_trigger">Simulation</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelPlacing}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => onStartPlacing(newHotspotType)}
            className="w-full h-8"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hotspot
          </Button>
        )}
      </div>

      {/* Hotspot list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {scene.hotspots.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">No hotspots yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add interactive points to your panorama
            </p>
          </div>
        ) : (
          scene.hotspots.map((hotspot) => (
            <HotspotListItem
              key={hotspot.id}
              hotspot={hotspot}
              isSelected={hotspot.id === selectedHotspotId}
              onSelect={() => onSelectHotspot(hotspot.id)}
              onDelete={() => onDeleteHotspot(hotspot.id)}
            />
          ))
        )}
      </div>

      {/* Selected hotspot config */}
      {selectedHotspot && (
        <div className="flex-shrink-0 border-t border-lxd-dark-border p-4 max-h-[50%] overflow-y-auto">
          <HotspotConfig
            hotspot={selectedHotspot}
            onUpdate={(updates) => onUpdateHotspot(selectedHotspot.id, updates)}
            onDelete={handleDeleteSelected}
            availableScenes={availableScenes}
            availableBlocks={availableBlocks}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Tour Sequence Manager
// =============================================================================

interface TourSequenceManagerProps {
  scene: ThreeSixtyScene;
  onUpdateSequence: (sequence: string[]) => void;
  className?: string;
}

export function TourSequenceManager({
  scene,
  onUpdateSequence,
  className,
}: TourSequenceManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sequence = scene.tourSequence ?? scene.hotspots.map((h) => h.id);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      const newSequence = [...sequence];
      const [removed] = newSequence.splice(draggedIndex, 1);
      newSequence.splice(index, 0, removed);

      onUpdateSequence(newSequence);
      setDraggedIndex(index);
    },
    [draggedIndex, sequence, onUpdateSequence],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleRemoveFromTour = useCallback(
    (hotspotId: string) => {
      onUpdateSequence(sequence.filter((id) => id !== hotspotId));
    },
    [sequence, onUpdateSequence],
  );

  const handleAddToTour = useCallback(
    (hotspotId: string) => {
      if (!sequence.includes(hotspotId)) {
        onUpdateSequence([...sequence, hotspotId]);
      }
    },
    [sequence, onUpdateSequence],
  );

  const hotspotsInTour = sequence
    .map((id) => scene.hotspots.find((h) => h.id === id))
    .filter((h): h is Hotspot => h !== undefined);

  const hotspotsNotInTour = scene.hotspots.filter((h) => !sequence.includes(h.id));

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label className="text-xs">Tour Sequence</Label>
        <p className="text-xs text-muted-foreground">Drag to reorder the guided tour stops</p>
      </div>

      {/* Tour sequence */}
      <div className="space-y-1">
        {hotspotsInTour.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No stops in tour. Add hotspots below.
          </p>
        ) : (
          hotspotsInTour.map((hotspot, index) => (
            <div
              key={hotspot.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border',
                'cursor-grab active:cursor-grabbing',
                draggedIndex === index && 'opacity-50',
              )}
            >
              <span className="w-5 h-5 rounded-full bg-lxd-purple/20 text-lxd-purple text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span className="flex-1 text-sm truncate">
                {hotspot.label || `Hotspot ${hotspot.id.slice(0, 8)}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFromTour(hotspot.id)}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Available hotspots */}
      {hotspotsNotInTour.length > 0 && (
        <>
          <Separator />
          <div>
            <Label className="text-xs">Available Hotspots</Label>
            <div className="space-y-1 mt-2">
              {hotspotsNotInTour.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-lxd-dark-border"
                >
                  <span className="flex-1 text-sm truncate text-muted-foreground">
                    {hotspot.label || `Hotspot ${hotspot.id.slice(0, 8)}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddToTour(hotspot.id)}
                    className="h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HotspotManager;
