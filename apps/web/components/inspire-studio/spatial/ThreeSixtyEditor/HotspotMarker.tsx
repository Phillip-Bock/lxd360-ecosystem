'use client';

import { Info, Maximize2, MessageCircle, Navigation, Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Hotspot, HotspotMarkerProps, HotspotType } from './types';

// =============================================================================
// Hotspot Icon Mapping
// =============================================================================

function getHotspotIcon(type: HotspotType) {
  switch (type) {
    case 'info_popup':
      return Info;
    case 'audio_spatial':
      return Volume2;
    case 'navigation':
      return Navigation;
    case 'quiz_block':
      return MessageCircle;
    case 'sim_trigger':
      return Play;
    default:
      return Info;
  }
}

function getHotspotColor(type: HotspotType): string {
  switch (type) {
    case 'info_popup':
      return 'bg-lxd-cyan';
    case 'audio_spatial':
      return 'bg-amber-500';
    case 'navigation':
      return 'bg-lxd-purple';
    case 'quiz_block':
      return 'bg-green-500';
    case 'sim_trigger':
      return 'bg-red-500';
    default:
      return 'bg-lxd-cyan';
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * HotspotMarker - Visual marker for hotspots in 360° scenes
 *
 * This is the 2D overlay version. For full 3D integration,
 * use with React Three Fiber's Html component.
 */
export function HotspotMarker({
  hotspot,
  isSelected = false,
  isEditing = false,
  onClick,
}: HotspotMarkerProps) {
  const Icon = getHotspotIcon(hotspot.type);
  const colorClass = hotspot.iconColor ?? getHotspotColor(hotspot.type);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-center',
        'w-10 h-10 rounded-full shadow-lg',
        'transform transition-all duration-200',
        'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50',
        colorClass,
        isSelected && 'ring-2 ring-white scale-110',
        isEditing && 'cursor-move',
      )}
      style={{
        transform: `scale(${hotspot.iconScale ?? 1})`,
      }}
      title={hotspot.label ?? `${hotspot.type} hotspot`}
      aria-label={hotspot.label ?? `${hotspot.type} hotspot`}
    >
      {/* Icon */}
      <Icon className="h-5 w-5 text-white" />

      {/* Pulse animation for active hotspots */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white" />

      {/* Label tooltip */}
      {hotspot.label && (
        <span
          className={cn(
            'absolute left-full ml-2 px-2 py-1 rounded text-xs',
            'bg-black/80 text-white whitespace-nowrap',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'pointer-events-none',
          )}
        >
          {hotspot.label}
        </span>
      )}

      {/* Edit indicator */}
      {isEditing && isSelected && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white flex items-center justify-center">
          <Maximize2 className="h-2 w-2 text-black" />
        </span>
      )}
    </button>
  );
}

// =============================================================================
// Hotspot List Item (for sidebar)
// =============================================================================

interface HotspotListItemProps {
  hotspot: Hotspot;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export function HotspotListItem({ hotspot, isSelected, onSelect, onDelete }: HotspotListItemProps) {
  const Icon = getHotspotIcon(hotspot.type);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
        'hover:bg-lxd-dark-surface transition-colors',
        isSelected && 'bg-lxd-dark-surface ring-1 ring-lxd-cyan',
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          getHotspotColor(hotspot.type),
        )}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {hotspot.label || `Hotspot ${hotspot.id.slice(0, 8)}`}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{hotspot.type.replace('_', ' ')}</p>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
          aria-label="Delete hotspot"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>Delete</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default HotspotMarker;
