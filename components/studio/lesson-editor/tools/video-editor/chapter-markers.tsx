'use client';

import { Bookmark, ChevronDown, ChevronUp, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ChapterMarker {
  id: string;
  title: string;
  timestamp: number;
  description?: string;
}

interface ChapterMarkersProps {
  markers: ChapterMarker[];
  duration: number;
  currentTime: number;
  onMarkersChange: (markers: ChapterMarker[]) => void;
  onSeekToMarker: (timestamp: number) => void;
}

/**
 * ChapterMarkers - Add and manage chapter points in video
 */
export function ChapterMarkers({
  markers,
  duration,
  currentTime,
  onMarkersChange,
  onSeekToMarker,
}: ChapterMarkersProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addMarker = () => {
    const newMarker: ChapterMarker = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${markers.length + 1}`,
      timestamp: currentTime,
    };

    const updatedMarkers = [...markers, newMarker].sort((a, b) => a.timestamp - b.timestamp);
    onMarkersChange(updatedMarkers);
    setEditingId(newMarker.id);
  };

  const updateMarker = (id: string, updates: Partial<ChapterMarker>) => {
    const updated = markers.map((m) => (m.id === id ? { ...m, ...updates } : m));

    // Re-sort if timestamp changed
    if (updates.timestamp !== undefined) {
      updated.sort((a, b) => a.timestamp - b.timestamp);
    }

    onMarkersChange(updated);
  };

  const deleteMarker = (id: string) => {
    onMarkersChange(markers.filter((m) => m.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const moveMarker = (id: string, direction: 'up' | 'down') => {
    const index = markers.findIndex((m) => m.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= markers.length) return;

    // Swap timestamps
    const newMarkers = [...markers];
    const temp = newMarkers[index].timestamp;
    newMarkers[index].timestamp = newMarkers[newIndex].timestamp;
    newMarkers[newIndex].timestamp = temp;

    newMarkers.sort((a, b) => a.timestamp - b.timestamp);
    onMarkersChange(newMarkers);
  };

  const getCurrentChapter = () => {
    for (let i = markers.length - 1; i >= 0; i--) {
      if (currentTime >= markers[i].timestamp) {
        return markers[i];
      }
    }
    return null;
  };

  const currentChapter = getCurrentChapter();

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Bookmark className="h-4 w-4" />
            <span>Chapter Markers</span>
          </div>
          <Button variant="outline" size="sm" className="border-white/10" onClick={addMarker}>
            <Plus className="h-4 w-4 mr-1" />
            Add at {formatTime(currentTime)}
          </Button>
        </div>

        {/* Current Chapter Display */}
        {currentChapter && (
          <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-xs">
            <Bookmark className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Now: {currentChapter.title}</span>
          </div>
        )}

        {/* Timeline with Markers */}
        <div className="relative h-6 bg-zinc-800 rounded-xs overflow-hidden">
          {/* Markers on timeline */}
          {markers.map((marker) => (
            <Tooltip key={marker.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="absolute top-0 bottom-0 w-1 bg-primary hover:w-2 transition-all cursor-pointer"
                  style={{ left: `${(marker.timestamp / duration) * 100}%` }}
                  onClick={() => onSeekToMarker(marker.timestamp)}
                >
                  <span className="sr-only">{marker.title}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{marker.title}</p>
                <p className="text-xs text-zinc-400">{formatTime(marker.timestamp)}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Marker List */}
        {markers.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className={`flex items-start gap-2 p-2 rounded-xs transition-colors ${
                  currentChapter?.id === marker.id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Drag Handle */}
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => moveMarker(marker.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => moveMarker(marker.id, 'down')}
                    disabled={index === markers.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === marker.id ? (
                    <div className="space-y-2">
                      <Input
                        value={marker.title}
                        onChange={(e) => updateMarker(marker.id, { title: e.target.value })}
                        className="bg-[#1a1a2e] border-white/10 text-sm h-8"
                        placeholder="Chapter title"
                        autoFocus
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingId(null);
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="cursor-pointer text-left border-none bg-transparent p-0"
                      onClick={() => setEditingId(marker.id)}
                    >
                      <p className="text-sm font-medium truncate">{marker.title}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(marker.timestamp)}
                      </p>
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onSeekToMarker(marker.timestamp)}
                      >
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Jump to chapter</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteMarker(marker.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-500">
            <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chapters defined</p>
            <p className="text-xs mt-1">Add markers to help learners navigate the video</p>
          </div>
        )}

        {/* Quick Add Suggestions */}
        {markers.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-zinc-600 mb-2">
              Tip: Click on timeline to jump, or add chapter at current position
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Generate chapter markers from video transcription
 */
export function AutoChapterSuggestions({
  duration,
  onApply,
}: {
  duration: number;
  onApply: (markers: ChapterMarker[]) => void;
}) {
  const generateSuggestions = () => {
    // Placeholder - would use AI to analyze video/transcript
    const suggestions: ChapterMarker[] = [
      { id: 'auto-1', title: 'Introduction', timestamp: 0 },
      { id: 'auto-2', title: 'Main Content', timestamp: duration * 0.15 },
      { id: 'auto-3', title: 'Key Concepts', timestamp: duration * 0.4 },
      { id: 'auto-4', title: 'Examples', timestamp: duration * 0.6 },
      { id: 'auto-5', title: 'Summary', timestamp: duration * 0.85 },
    ];
    return suggestions;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full border-white/10"
      onClick={() => onApply(generateSuggestions())}
    >
      <Bookmark className="h-4 w-4 mr-2" />
      Auto-Generate Chapters
    </Button>
  );
}
