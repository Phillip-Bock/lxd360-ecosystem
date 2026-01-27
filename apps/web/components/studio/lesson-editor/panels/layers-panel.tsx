'use client';

/**
 * LayersPanel - Full-featured layer management panel with drag-drop reordering
 * Manages z-order, grouping, visibility, and locking of canvas objects
 */

import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  GripVertical,
  Layers,
  Lock,
  MoreHorizontal,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Layer, LayerGroup } from '@/types/studio/layers';

// =============================================================================
// TYPES
// =============================================================================

interface LayersPanelProps {
  layers: Layer[];
  groups: LayerGroup[];
  selectedLayers: string[];
  hoveredLayer: string | null;
  onSelectLayer: (layerId: string, multi?: boolean) => void;
  onMoveUp: (layerId: string) => void;
  onMoveDown: (layerId: string) => void;
  onMoveToTop: (layerId: string) => void;
  onMoveToBottom: (layerId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onRename: (layerId: string, name: string) => void;
  onDuplicate: (layerId: string) => void;
  onDelete: (layerId: string) => void;
  onGroupSelected: (name?: string) => void;
  onUngroup: (groupId: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onLockAll: () => void;
  onUnlockAll: () => void;
  onClose?: () => void;
}

// =============================================================================
// LAYER ITEM ICONS
// =============================================================================

const LAYER_TYPE_ICONS: Record<string, string> = {
  txt: 'T',
  img: 'IMG',
  vid: 'VID',
  mcq: '?',
  btn: 'BTN',
  shp: 'SHP',
  grp: 'GRP',
};

function getLayerIcon(objectId: string): string {
  const type = objectId.split('_')[0];
  return LAYER_TYPE_ICONS[type] || 'OBJ';
}

// =============================================================================
// LAYER ITEM COMPONENT
// =============================================================================

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  isHovered: boolean;
  depth?: number;
  onSelect: (multi?: boolean) => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
}

function LayerItem({
  layer,
  isSelected,
  isHovered,
  depth = 0,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const handleRename = useCallback(() => {
    if (editName.trim() && editName !== layer.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }, [editName, layer.name, onRename]);

  return (
    <button
      type="button"
      className={cn(
        'group flex items-center h-8 px-2 gap-1 cursor-pointer transition-colors w-full text-left',
        'hover:bg-white/5',
        isSelected && 'bg-primary/10 hover:bg-primary/15',
        isHovered && !isSelected && 'bg-white/3',
        !layer.visible && 'opacity-50',
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={(e) => onSelect(e.shiftKey || e.ctrlKey || e.metaKey)}
      aria-label={`Select layer ${layer.name}`}
    >
      {/* Drag Handle */}
      <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-50 cursor-grab">
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Type Icon */}
      <span className="w-5 h-5 flex items-center justify-center text-xs">
        {getLayerIcon(layer.objectId)}
      </span>

      {/* Name */}
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="h-6 text-xs bg-zinc-900 border-white/10 flex-1"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          type="button"
          className="flex-1 text-xs truncate text-left bg-transparent border-none p-0 cursor-text"
          tabIndex={-1}
          aria-label={`Edit layer name: ${layer.name}`}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditName(layer.name);
          }}
          onKeyDown={(e) => {
            if (e.key === 'F2') {
              e.stopPropagation();
              setIsEditing(true);
              setEditName(layer.name);
            }
          }}
        >
          {layer.name}
        </button>
      )}

      {/* Visibility Toggle */}
      <button
        type="button"
        className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
      >
        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-zinc-500" />}
      </button>

      {/* Lock Toggle */}
      <button
        type="button"
        className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock();
        }}
      >
        {layer.locked ? (
          <Lock className="h-3 w-3 text-amber-500" />
        ) : (
          <Unlock className="h-3 w-3" />
        )}
      </button>

      {/* Context Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-(--studio-surface) border-white/10">
          <DropdownMenuItem onClick={onMoveToTop}>Bring to Front</DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveUp}>Bring Forward</DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveDown}>Send Backward</DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveToBottom}>Send to Back</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-3 w-3 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">
            <Trash2 className="h-3 w-3 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}

// =============================================================================
// GROUP HEADER COMPONENT
// =============================================================================

interface GroupHeaderProps {
  group: LayerGroup;
  onToggleCollapse: () => void;
  onUngroup: () => void;
  onRename: (name: string) => void;
}

function GroupHeader({ group, onToggleCollapse, onUngroup, onRename }: GroupHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const handleRename = useCallback(() => {
    if (editName.trim() && editName !== group.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }, [editName, group.name, onRename]);

  return (
    <button
      type="button"
      className={cn(
        'group flex items-center h-8 px-2 gap-1 cursor-pointer transition-colors w-full text-left',
        'bg-zinc-900/80 hover:bg-zinc-800/80',
        !group.visible && 'opacity-50',
      )}
      onClick={onToggleCollapse}
      aria-label={`Toggle group ${group.name}`}
      aria-expanded={!group.collapsed}
    >
      {/* Collapse Toggle */}
      <button
        type="button"
        className="w-4 h-4 flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          onToggleCollapse();
        }}
      >
        {group.collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {/* Folder Icon */}
      <span className="w-5 h-5 flex items-center justify-center">
        {group.collapsed ? (
          <Folder className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
        )}
      </span>

      {/* Name */}
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="h-6 text-xs bg-zinc-900 border-white/10 flex-1"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          type="button"
          className="flex-1 text-xs font-medium truncate text-left bg-transparent border-none p-0 cursor-text"
          tabIndex={-1}
          aria-label={`Edit group name: ${group.name}`}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditName(group.name);
          }}
          onKeyDown={(e) => {
            if (e.key === 'F2') {
              e.stopPropagation();
              setIsEditing(true);
              setEditName(group.name);
            }
          }}
        >
          {group.name}
        </button>
      )}

      {/* Layer Count */}
      <span className="text-[10px] text-zinc-500 px-1">{group.layers.length}</span>

      {/* Context Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 bg-(--studio-surface) border-white/10">
          <DropdownMenuItem onClick={onUngroup}>Ungroup</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}

// =============================================================================
// LAYERS PANEL COMPONENT
// =============================================================================

export function LayersPanel({
  layers,
  groups,
  selectedLayers,
  hoveredLayer,
  onSelectLayer,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onReorder: _onReorder,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDuplicate,
  onDelete,
  onGroupSelected,
  onUngroup,
  onToggleGroupCollapse,
  onShowAll,
  onHideAll,
  onLockAll,
  onUnlockAll,
  onClose,
}: LayersPanelProps) {
  // Sort layers by z-index (highest first for panel display)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  // Get ungrouped layers
  const ungroupedLayers = sortedLayers.filter((l) => !l.parentId);

  // Get grouped layers by group
  const groupedLayersMap = new Map<string, Layer[]>();
  for (const group of groups) {
    const groupLayers = sortedLayers.filter((l) => l.parentId === group.id);
    groupedLayersMap.set(group.id, groupLayers);
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-(--neural-bg)">
        {/* Header */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-white">Layers</span>
            <span className="text-xs text-zinc-500">({layers.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <span className="text-lg">×</span>
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="h-10 border-b border-white/5 flex items-center px-2 gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onGroupSelected()}
                disabled={selectedLayers.length < 2}
              >
                <Folder className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Group Selected</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onShowAll}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show All</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onHideAll}>
                <EyeOff className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide All</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onLockAll}>
                <Lock className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lock All</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onUnlockAll}>
                <Unlock className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unlock All</TooltipContent>
          </Tooltip>
        </div>

        {/* Layers List */}
        <ScrollArea className="flex-1">
          <div className="py-1">
            {/* Groups */}
            {groups.map((group) => {
              const groupLayers = groupedLayersMap.get(group.id) || [];
              return (
                <div key={group.id}>
                  <GroupHeader
                    group={group}
                    onToggleCollapse={() => onToggleGroupCollapse(group.id)}
                    onUngroup={() => onUngroup(group.id)}
                    onRename={(_name) => {
                      // Would need to add onRenameGroup prop
                    }}
                  />
                  {!group.collapsed &&
                    groupLayers.map((layer) => (
                      <LayerItem
                        key={layer.id}
                        layer={layer}
                        isSelected={selectedLayers.includes(layer.id)}
                        isHovered={hoveredLayer === layer.id}
                        depth={1}
                        onSelect={(multi) => onSelectLayer(layer.id, multi)}
                        onToggleVisibility={() => onToggleVisibility(layer.id)}
                        onToggleLock={() => onToggleLock(layer.id)}
                        onRename={(name) => onRename(layer.id, name)}
                        onDuplicate={() => onDuplicate(layer.id)}
                        onDelete={() => onDelete(layer.id)}
                        onMoveUp={() => onMoveUp(layer.id)}
                        onMoveDown={() => onMoveDown(layer.id)}
                        onMoveToTop={() => onMoveToTop(layer.id)}
                        onMoveToBottom={() => onMoveToBottom(layer.id)}
                      />
                    ))}
                </div>
              );
            })}

            {/* Ungrouped Layers */}
            {ungroupedLayers.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayers.includes(layer.id)}
                isHovered={hoveredLayer === layer.id}
                onSelect={(multi) => onSelectLayer(layer.id, multi)}
                onToggleVisibility={() => onToggleVisibility(layer.id)}
                onToggleLock={() => onToggleLock(layer.id)}
                onRename={(name) => onRename(layer.id, name)}
                onDuplicate={() => onDuplicate(layer.id)}
                onDelete={() => onDelete(layer.id)}
                onMoveUp={() => onMoveUp(layer.id)}
                onMoveDown={() => onMoveDown(layer.id)}
                onMoveToTop={() => onMoveToTop(layer.id)}
                onMoveToBottom={() => onMoveToBottom(layer.id)}
              />
            ))}

            {/* Empty State */}
            {layers.length === 0 && (
              <div className="py-8 text-center text-zinc-500">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No layers yet</p>
                <p className="text-xs mt-1">Add objects to the canvas to see them here</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Selection Info */}
        {selectedLayers.length > 0 && (
          <div className="h-8 border-t border-white/10 flex items-center justify-center px-4 bg-primary/5 shrink-0">
            <span className="text-xs text-primary">
              {selectedLayers.length} layer{selectedLayers.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default LayersPanel;
