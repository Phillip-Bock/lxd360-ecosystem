'use client';

/**
 * TimelinePanel - Full-featured timeline editor with keyframe animations
 * Provides track management, playback controls, and keyframe editing
 */

import {
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Magnet,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Square,
  StepBack,
  StepForward,
  Trash2,
  Unlock,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTimeline } from '@/hooks/studio/use-timeline';
import { cn } from '@/lib/utils';
import type {
  AnimatableProperty,
  ObjectTrack,
  TimelineMarker,
  TimeMs,
} from '@/types/studio/timeline';

// =============================================================================
// TYPES
// =============================================================================

interface TimelinePanelProps {
  slideId: string;
  onObjectUpdate?: (objectId: string, styles: React.CSSProperties) => void;
  onClose?: () => void;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TRACK_HEIGHT = 32;
const PROPERTY_TRACK_HEIGHT = 24;
const _HEADER_HEIGHT = 48;
const _CONTROLS_HEIGHT = 48;
const RULER_HEIGHT = 24;
const TRACK_LIST_WIDTH = 220;

const ANIMATABLE_PROPERTIES: Array<{ value: AnimatableProperty; label: string; group: string }> = [
  // Transform
  { value: 'x', label: 'X Position', group: 'Transform' },
  { value: 'y', label: 'Y Position', group: 'Transform' },
  { value: 'rotation', label: 'Rotation', group: 'Transform' },
  { value: 'scaleX', label: 'Scale X', group: 'Transform' },
  { value: 'scaleY', label: 'Scale Y', group: 'Transform' },

  // Appearance
  { value: 'opacity', label: 'Opacity', group: 'Appearance' },
  { value: 'blur', label: 'Blur', group: 'Appearance' },
  { value: 'brightness', label: 'Brightness', group: 'Appearance' },

  // Colors
  { value: 'backgroundColor', label: 'Background', group: 'Colors' },
  { value: 'borderColor', label: 'Border Color', group: 'Colors' },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Timeline ruler showing time markers
 */
function TimelineRuler({
  duration,
  zoom,
  scrollPosition: _scrollPosition,
  timeToPixels,
  formatTime,
}: {
  duration: TimeMs;
  zoom: number;
  scrollPosition: TimeMs;
  timeToPixels: (time: TimeMs) => number;
  formatTime: (time: TimeMs) => string;
}) {
  const width = timeToPixels(duration);
  const majorInterval = zoom > 1 ? 1000 : zoom > 0.5 ? 2000 : 5000; // ms
  const minorInterval = majorInterval / 4;

  const markers: Array<{ time: TimeMs; major: boolean }> = [];
  for (let t = 0; t <= duration; t += minorInterval) {
    markers.push({ time: t, major: t % majorInterval === 0 });
  }

  return (
    <div
      className="h-6 bg-zinc-900/80 border-b border-white/10 relative"
      style={{ width: width + TRACK_LIST_WIDTH }}
    >
      <div className="absolute left-0 w-[220px] h-full bg-zinc-900/80 z-10 border-r border-white/10" />
      <div className="absolute" style={{ left: TRACK_LIST_WIDTH }}>
        {markers.map(({ time, major }) => (
          <div
            key={time}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: timeToPixels(time) }}
          >
            <div className={cn('w-px', major ? 'h-4 bg-white/30' : 'h-2 bg-white/15')} />
            {major && <span className="text-[9px] text-white/50 mt-0.5">{formatTime(time)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Playhead indicator
 */
function Playhead({
  currentTime,
  timeToPixels,
  height,
}: {
  currentTime: TimeMs;
  timeToPixels: (time: TimeMs) => number;
  height: number;
}) {
  const left = timeToPixels(currentTime) + TRACK_LIST_WIDTH;

  return (
    <div className="absolute top-0 z-30 pointer-events-none" style={{ left, height }}>
      {/* Playhead line */}
      <div className="w-px h-full bg-red-500" />
      {/* Playhead handle */}
      <div
        className="absolute -top-1 -left-2 w-4 h-3 bg-red-500"
        style={{
          clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
        }}
      />
    </div>
  );
}

/**
 * Keyframe diamond indicator
 */
function KeyframeDiamond({
  time,
  selected,
  timeToPixels,
  onClick,
  onDragStart,
}: {
  time: TimeMs;
  selected: boolean;
  timeToPixels: (time: TimeMs) => number;
  onClick: () => void;
  onDragStart: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'absolute w-3 h-3 -translate-x-1/2 cursor-pointer transition-transform hover:scale-110 bg-transparent border-none p-0',
        selected ? 'z-20' : 'z-10',
      )}
      style={{ left: timeToPixels(time) }}
      onClick={onClick}
      onMouseDown={(e) => {
        if (e.button === 0) {
          onDragStart();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Keyframe at ${time}ms${selected ? ', selected' : ''}`}
      aria-pressed={selected}
    >
      <div
        className={cn(
          'w-full h-full rotate-45 border-2',
          selected
            ? 'bg-primary border-primary'
            : 'bg-white/80 border-white/40 hover:border-primary',
        )}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * Track row in the track list
 */
function TrackRow({
  track,
  isSelected,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onAddProperty,
}: {
  track: ObjectTrack;
  isSelected: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onAddProperty: (property: AnimatableProperty) => void;
}) {
  return (
    <>
      {/* Main track row */}
      <div
        className={cn(
          'group flex items-center gap-1 px-2 border-b border-white/5',
          'hover:bg-white/5',
          isSelected && 'bg-primary/10',
        )}
        style={{ height: TRACK_HEIGHT }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          className="w-4 h-4 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          aria-label={track.expanded ? 'Collapse track' : 'Expand track'}
          aria-expanded={track.expanded}
        >
          {track.expanded ? (
            <ChevronDown className="h-3 w-3 text-white/50" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3 w-3 text-white/50" aria-hidden="true" />
          )}
        </button>

        {/* Drag handle */}
        <div
          className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-50 cursor-grab"
          aria-hidden="true"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Track selection button - main clickable area */}
        <button
          type="button"
          className="flex-1 flex items-center gap-2 text-left cursor-pointer bg-transparent border-none p-0"
          onClick={onSelect}
          aria-pressed={isSelected}
          aria-label={`Select track: ${track.objectName}`}
        >
          {/* Track name */}
          <span className="flex-1 text-xs font-medium truncate">{track.objectName}</span>

          {/* Track type badge */}
          <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 text-white/50">
            {track.objectType}
          </span>
        </button>

        {/* Visibility toggle */}
        <button
          type="button"
          className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          aria-label={track.visible ? 'Hide track' : 'Show track'}
          aria-pressed={track.visible}
        >
          {track.visible ? (
            <Eye className="h-3 w-3" aria-hidden="true" />
          ) : (
            <EyeOff className="h-3 w-3 text-zinc-500" aria-hidden="true" />
          )}
        </button>

        {/* Lock toggle */}
        <button
          type="button"
          className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          aria-label={track.locked ? 'Unlock track' : 'Lock track'}
          aria-pressed={track.locked}
        >
          {track.locked ? (
            <Lock className="h-3 w-3 text-amber-500" aria-hidden="true" />
          ) : (
            <Unlock className="h-3 w-3" aria-hidden="true" />
          )}
        </button>

        {/* Context menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Track options menu"
            >
              <MoreHorizontal className="h-3 w-3" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#1a1a2e] border-white/10">
            <DropdownMenuItem disabled className="text-xs text-white/50">
              Add Property
            </DropdownMenuItem>
            {ANIMATABLE_PROPERTIES.map((prop) => (
              <DropdownMenuItem
                key={prop.value}
                onClick={() => onAddProperty(prop.value)}
                className="text-xs pl-4"
              >
                {prop.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-400 focus:text-red-400 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-2" aria-hidden="true" />
              Delete Track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Property tracks (when expanded) */}
      {track.expanded &&
        track.propertyTracks.map((propTrack) => (
          <div
            key={propTrack.id}
            className="flex items-center gap-1 px-2 pl-8 border-b border-white/5 bg-zinc-900/50"
            style={{ height: PROPERTY_TRACK_HEIGHT }}
          >
            <span className="text-[10px] text-white/60 flex-1">{propTrack.property}</span>
            <span className="text-[9px] text-white/40">{propTrack.keyframes.length} keyframes</span>
          </div>
        ))}
    </>
  );
}

/**
 * Track timeline area showing keyframes
 */
function TrackTimeline({
  track,
  timeToPixels,
  duration,
  selectedKeyframeIds,
  onSelectKeyframe,
  onDragKeyframeStart,
}: {
  track: ObjectTrack;
  timeToPixels: (time: TimeMs) => number;
  duration: TimeMs;
  selectedKeyframeIds: string[];
  onSelectKeyframe: (keyframeId: string, addToSelection: boolean) => void;
  onDragKeyframeStart: (keyframeId: string) => void;
}) {
  const width = timeToPixels(duration);

  // Render track duration bar
  const startX = timeToPixels(track.startTime);
  const endX = timeToPixels(track.endTime);
  const barWidth = endX - startX;

  return (
    <>
      {/* Main track row */}
      <div className="relative border-b border-white/5" style={{ height: TRACK_HEIGHT, width }}>
        {/* Duration bar */}
        <div
          className="absolute top-1 bottom-1 bg-primary/20 rounded-sm border border-primary/30"
          style={{ left: startX, width: barWidth }}
        />

        {/* Keyframes from all property tracks */}
        {track.propertyTracks.map((propTrack) =>
          propTrack.keyframes.map((kf) => (
            <div key={kf.id} className="absolute top-1/2 -translate-y-1/2" style={{ left: 0 }}>
              <KeyframeDiamond
                time={kf.time}
                selected={selectedKeyframeIds.includes(kf.id)}
                timeToPixels={timeToPixels}
                onClick={() => onSelectKeyframe(kf.id, false)}
                onDragStart={() => onDragKeyframeStart(kf.id)}
              />
            </div>
          )),
        )}
      </div>

      {/* Property track rows (when expanded) */}
      {track.expanded &&
        track.propertyTracks.map((propTrack) => (
          <div
            key={propTrack.id}
            className="relative border-b border-white/5 bg-zinc-900/30"
            style={{ height: PROPERTY_TRACK_HEIGHT, width }}
          >
            {propTrack.keyframes.map((kf) => (
              <div key={kf.id} className="absolute top-1/2 -translate-y-1/2" style={{ left: 0 }}>
                <KeyframeDiamond
                  time={kf.time}
                  selected={selectedKeyframeIds.includes(kf.id)}
                  timeToPixels={timeToPixels}
                  onClick={() => onSelectKeyframe(kf.id, false)}
                  onDragStart={() => onDragKeyframeStart(kf.id)}
                />
              </div>
            ))}
          </div>
        ))}
    </>
  );
}

/**
 * Marker indicator on the ruler
 */
function MarkerIndicator({
  marker,
  timeToPixels,
  onSelect,
}: {
  marker: TimelineMarker;
  timeToPixels: (time: TimeMs) => number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="absolute top-0 z-20 cursor-pointer group bg-transparent border-none p-0"
      style={{ left: timeToPixels(marker.time) + TRACK_LIST_WIDTH }}
      onClick={onSelect}
      aria-label={`Marker: ${marker.label} at ${marker.time}ms`}
    >
      <div
        className="w-2 h-4 -translate-x-1/2"
        style={{
          backgroundColor: marker.color || '#00d4ff',
          clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 top-5 px-1 py-0.5 text-[9px] bg-zinc-900 border border-white/20 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: marker.color }}
        aria-hidden="true"
      >
        {marker.label}
      </div>
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TimelinePanel({ slideId, onObjectUpdate, onClose, className }: TimelinePanelProps) {
  const timeline = useTimeline({
    slideId,
    onObjectUpdate,
    initialConfig: {
      duration: 10000,
    },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingKeyframe, setIsDraggingKeyframe] = useState(false);
  const [draggingKeyframeId, setDraggingKeyframeId] = useState<string | null>(null);

  // Calculate total height for tracks
  const calculateTrackHeight = (track: ObjectTrack) => {
    let height = TRACK_HEIGHT;
    if (track.expanded) {
      height += track.propertyTracks.length * PROPERTY_TRACK_HEIGHT;
    }
    return height;
  };

  const totalTracksHeight = timeline.state.objectTracks.reduce(
    (acc, track) => acc + calculateTrackHeight(track),
    0,
  );

  // Handle scrubbing on ruler
  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - TRACK_LIST_WIDTH + scrollContainerRef.current.scrollLeft;
        const time = timeline.pixelsToTime(x);
        timeline.seek(time);
        timeline.startDrag('scrub');
      }
    },
    [timeline],
  );

  // Handle keyframe dragging
  const handleKeyframeDragStart = useCallback(
    (keyframeId: string) => {
      setIsDraggingKeyframe(true);
      setDraggingKeyframeId(keyframeId);
      timeline.startDrag('keyframe');
      timeline.selectKeyframes([keyframeId]);
    },
    [timeline],
  );

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDraggingKeyframe || !draggingKeyframeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - TRACK_LIST_WIDTH + scrollContainerRef.current.scrollLeft;
        const time = timeline.snapTime(timeline.pixelsToTime(x));
        timeline.moveKeyframe(draggingKeyframeId, time);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingKeyframe(false);
      setDraggingKeyframeId(null);
      timeline.endDrag();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingKeyframe, draggingKeyframeId, timeline]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          timeline.togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            timeline.jumpToPreviousMarker();
          } else {
            timeline.stepBackward();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            timeline.jumpToNextMarker();
          } else {
            timeline.stepForward();
          }
          break;
        case 'Home':
          e.preventDefault();
          timeline.jumpToStart();
          break;
        case 'End':
          e.preventDefault();
          timeline.jumpToEnd();
          break;
        case 'Delete':
        case 'Backspace':
          if (timeline.state.selectedKeyframeIds.length > 0) {
            e.preventDefault();
            for (const id of timeline.state.selectedKeyframeIds) {
              timeline.deleteKeyframe(id);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [timeline]);

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full bg-[#0a0a0f]', className)}>
        {/* Header */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-white">Timeline</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Current time display */}
            <span className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded border border-white/10">
              {timeline.formatTime(timeline.currentTime)}
            </span>
            {/* Duration display */}
            <span className="text-xs text-white/50">
              / {timeline.formatTime(timeline.duration)}
            </span>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <span className="text-lg">×</span>
              </Button>
            )}
          </div>
        </div>

        {/* Transport Controls */}
        <div className="h-12 border-b border-white/10 flex items-center gap-2 px-4 shrink-0">
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={timeline.jumpToStart}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump to Start (Home)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={timeline.stepBackward}
                >
                  <StepBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step Back (←)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-primary/20 hover:bg-primary/30"
                  onClick={timeline.togglePlayPause}
                >
                  {timeline.isPlaying && !timeline.isPaused ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {timeline.isPlaying && !timeline.isPaused ? 'Pause' : 'Play'} (Space)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={timeline.stop}>
                  <Square className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={timeline.stepForward}
                >
                  <StepForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step Forward (→)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={timeline.jumpToEnd}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump to End (End)</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Speed:</span>
            <select
              value={timeline.playbackRate}
              onChange={(e) => timeline.setPlaybackRate(Number(e.target.value))}
              className="h-7 px-2 text-xs bg-zinc-900 border border-white/10 rounded"
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Snap toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', timeline.state.config.snapToGrid && 'bg-primary/20')}
                onClick={timeline.toggleSnap}
              >
                <Magnet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {timeline.state.config.snapToGrid ? 'Disable Snap' : 'Enable Snap'}
            </TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={timeline.zoomOut}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <div className="w-24">
              <Slider
                value={[timeline.state.config.zoom]}
                min={0.1}
                max={4}
                step={0.1}
                onValueChange={([v]) => timeline.setZoom(v)}
              />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={timeline.zoomIn}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <span className="text-xs text-white/50 w-12">
              {Math.round(timeline.state.config.zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Timeline area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Track list (left side) */}
          <div
            className="shrink-0 border-r border-white/10 bg-zinc-950"
            style={{ width: TRACK_LIST_WIDTH }}
          >
            {/* Ruler spacer */}
            <div
              className="border-b border-white/10 flex items-center justify-between px-2"
              style={{ height: RULER_HEIGHT }}
            >
              <span className="text-[10px] text-white/40">Tracks</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => {
                      // Add a demo track
                      timeline.addObjectTrack(
                        `obj_${Date.now()}`,
                        `Object ${timeline.state.objectTracks.length + 1}`,
                        'shape',
                      );
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Track</TooltipContent>
              </Tooltip>
            </div>

            {/* Track rows */}
            <ScrollArea className="h-full">
              {timeline.state.objectTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isSelected={timeline.state.selectedTrackIds.includes(track.id)}
                  onSelect={() => timeline.selectTrack(track.id)}
                  onToggleExpand={() =>
                    track.expanded
                      ? timeline.collapseTrack(track.id)
                      : timeline.expandTrack(track.id)
                  }
                  onToggleVisibility={() => timeline.toggleTrackVisibility(track.id)}
                  onToggleLock={() => timeline.toggleTrackLock(track.id)}
                  onDelete={() => timeline.removeObjectTrack(track.id)}
                  onAddProperty={(property) => timeline.addPropertyTrack(track.id, property)}
                />
              ))}

              {/* Empty state */}
              {timeline.state.objectTracks.length === 0 && (
                <div className="py-8 text-center text-zinc-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No tracks yet</p>
                  <p className="text-[10px] mt-1">Add objects to animate them</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Timeline content (right side, scrollable) */}
          <div ref={scrollContainerRef} className="flex-1 overflow-auto relative">
            {/* Ruler - acts as a scrubber/slider for seeking */}
            <div
              className="sticky top-0 z-20"
              role="slider"
              tabIndex={0}
              aria-label="Timeline scrubber"
              aria-valuemin={0}
              aria-valuemax={timeline.duration}
              aria-valuenow={timeline.currentTime}
              aria-valuetext={`Current time: ${timeline.formatTime(timeline.currentTime)}`}
              onMouseDown={handleRulerMouseDown}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 1000 : 100; // 1s or 100ms
                switch (e.key) {
                  case 'ArrowLeft':
                    e.preventDefault();
                    timeline.seek(Math.max(0, timeline.currentTime - step));
                    break;
                  case 'ArrowRight':
                    e.preventDefault();
                    timeline.seek(Math.min(timeline.duration, timeline.currentTime + step));
                    break;
                  case 'Home':
                    e.preventDefault();
                    timeline.jumpToStart();
                    break;
                  case 'End':
                    e.preventDefault();
                    timeline.jumpToEnd();
                    break;
                }
              }}
            >
              <TimelineRuler
                duration={timeline.duration}
                zoom={timeline.state.config.zoom}
                scrollPosition={timeline.state.config.scrollPosition}
                timeToPixels={timeline.timeToPixels}
                formatTime={timeline.formatTime}
              />
            </div>

            {/* Markers */}
            {timeline.state.markerTrack.markers.map((marker) => (
              <MarkerIndicator
                key={marker.id}
                marker={marker}
                timeToPixels={timeline.timeToPixels}
                onSelect={() => timeline.selectMarker(marker.id)}
              />
            ))}

            {/* Track timelines */}
            <div style={{ marginLeft: TRACK_LIST_WIDTH }}>
              {timeline.state.objectTracks.map((track) => (
                <TrackTimeline
                  key={track.id}
                  track={track}
                  timeToPixels={timeline.timeToPixels}
                  duration={timeline.duration}
                  selectedKeyframeIds={timeline.state.selectedKeyframeIds}
                  onSelectKeyframe={(kfId, add) => timeline.selectKeyframes([kfId], add)}
                  onDragKeyframeStart={handleKeyframeDragStart}
                />
              ))}
            </div>

            {/* Playhead */}
            <Playhead
              currentTime={timeline.currentTime}
              timeToPixels={timeline.timeToPixels}
              height={RULER_HEIGHT + totalTracksHeight}
            />
          </div>
        </div>

        {/* Footer - Selection info */}
        {(timeline.state.selectedKeyframeIds.length > 0 ||
          timeline.state.selectedTrackIds.length > 0) && (
          <div className="h-8 border-t border-white/10 flex items-center justify-between px-4 bg-primary/5 shrink-0">
            <span className="text-xs text-primary">
              {timeline.state.selectedKeyframeIds.length > 0 &&
                `${timeline.state.selectedKeyframeIds.length} keyframe(s) selected`}
              {timeline.state.selectedTrackIds.length > 0 &&
                `${timeline.state.selectedTrackIds.length} track(s) selected`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={timeline.clearSelection}
              >
                Clear Selection
              </Button>
              {timeline.state.selectedKeyframeIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-red-400 hover:text-red-300"
                  onClick={() => {
                    for (const id of timeline.state.selectedKeyframeIds) {
                      timeline.deleteKeyframe(id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default TimelinePanel;
