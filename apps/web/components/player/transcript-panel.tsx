'use client';

/**
 * =============================================================================
 * LXD360 | TranscriptPanel Component
 * =============================================================================
 *
 * Side panel with synced transcript.
 * Features auto-scroll, search, and click-to-seek.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { FileText, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Transcript cue
 */
export interface TranscriptCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

/**
 * TranscriptPanel component props
 */
export interface TranscriptPanelProps {
  /** Transcript cues */
  cues: TranscriptCue[];
  /** Current playback time in seconds */
  currentTime: number;
  /** Called when user clicks to seek */
  onSeek?: (time: number) => void;
  /** Auto-scroll to current cue */
  autoScroll?: boolean;
  /** Show speaker names */
  showSpeakers?: boolean;
  /** Show timestamps */
  showTimestamps?: boolean;
  /** Enable search functionality */
  searchable?: boolean;
  /** Panel height */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * TranscriptPanel - Synced transcript with search and seek
 *
 * Features:
 * - Auto-scroll to current cue
 * - Click-to-seek on any cue
 * - Search with highlighting
 * - Speaker labels
 * - Timestamps
 */
export function TranscriptPanel({
  cues,
  currentTime,
  onSeek,
  autoScroll = true,
  showSpeakers = true,
  showTimestamps = true,
  searchable = true,
  height = 400,
  className,
  label = 'Transcript',
}: TranscriptPanelProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCueRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find active cue index
  const activeCueIndex = useMemo(() => {
    for (let i = cues.length - 1; i >= 0; i--) {
      if (currentTime >= cues[i].startTime) {
        return i;
      }
    }
    return -1;
  }, [cues, currentTime]);

  // Filter cues by search query
  const filteredCues = useMemo(() => {
    if (!searchQuery.trim()) return cues;
    const query = searchQuery.toLowerCase();
    return cues.filter(
      (cue) => cue.text.toLowerCase().includes(query) || cue.speaker?.toLowerCase().includes(query),
    );
  }, [cues, searchQuery]);

  // Track matching indices for highlighting
  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return new Set<number>();
    return new Set(filteredCues.map((cue) => cues.indexOf(cue)));
  }, [cues, filteredCues, searchQuery]);

  // Auto-scroll to active cue
  useEffect(() => {
    if (!autoScroll || userScrolled || !activeCueRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const activeCue = activeCueRef.current;

    const containerRect = container.getBoundingClientRect();
    const cueRect = activeCue.getBoundingClientRect();

    const isOutOfView =
      cueRect.top < containerRect.top + 50 || cueRect.bottom > containerRect.bottom - 50;

    if (isOutOfView) {
      activeCue.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // activeCueIndex intentionally excluded - we use activeCueRef instead
  }, [autoScroll, userScrolled]);

  // Handle user scroll
  const handleScroll = useCallback(() => {
    setUserScrolled(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 3000);
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle cue click
  const handleCueClick = useCallback(
    (time: number) => {
      onSeek?.(time);
    },
    [onSeek],
  );

  // Toggle search
  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Highlight matching text
  const highlightText = useCallback(
    (text: string): React.ReactNode => {
      if (!searchQuery.trim()) return text;
      const query = searchQuery.toLowerCase();
      const index = text.toLowerCase().indexOf(query);
      if (index === -1) return text;
      const before = text.slice(0, index);
      const match = text.slice(index, index + searchQuery.length);
      const after = text.slice(index + searchQuery.length);
      return (
        <>
          {before}
          <mark className="rounded bg-cyan-500/30 px-0.5 text-cyan-300">{match}</mark>
          {after}
        </>
      );
    },
    [searchQuery],
  );

  // Group cues by speaker
  const groupedCues = useMemo(() => {
    if (!showSpeakers) {
      return filteredCues.map((cue) => ({ ...cue, isNewSpeaker: false }));
    }
    return filteredCues.map((cue, index) => {
      const prevCue = index > 0 ? filteredCues[index - 1] : null;
      const isNewSpeaker = !prevCue || prevCue.speaker !== cue.speaker;
      return { ...cue, isNewSpeaker };
    });
  }, [filteredCues, showSpeakers]);

  return (
    <section
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl',
        'border border-white/10 bg-black/40 backdrop-blur-sm',
        className,
      )}
      style={{ height }}
      aria-label={label}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <span className="text-sm font-medium text-white">Transcript</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
            {cues.length} segments
          </span>
        </div>

        {searchable && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              'text-white/60 hover:bg-white/10 hover:text-cyan-400',
              isSearchOpen && 'bg-cyan-500/20 text-cyan-400',
            )}
            onClick={toggleSearch}
            aria-label={isSearchOpen ? 'Close search' : 'Search transcript'}
            aria-expanded={isSearchOpen}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Search bar */}
      {searchable && isSearchOpen && (
        <div className="border-b border-white/10 px-4 py-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search transcript..."
              className={cn(
                'w-full rounded-lg bg-white/5 py-2 pl-10 pr-10 text-sm text-white',
                'placeholder-white/40',
                'focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500/50',
              )}
              aria-label="Search transcript"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-white/40 hover:text-white"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-white/50">
              {filteredCues.length} result{filteredCues.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      )}

      {/* Cues list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4" onScroll={handleScroll}>
        {groupedCues.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/40">
            {searchQuery ? 'No matches found' : 'No transcript available'}
          </div>
        ) : (
          <div className="space-y-3">
            {groupedCues.map((cue) => {
              const originalIndex = cues.indexOf(cue);
              const isActive = originalIndex === activeCueIndex;
              const isMatch = matchingIndices.has(originalIndex);

              return (
                <button
                  key={cue.id}
                  ref={isActive ? activeCueRef : null}
                  type="button"
                  className={cn(
                    'group relative w-full text-left transition-all duration-200',
                    'rounded-lg p-3',
                    'hover:bg-white/5',
                    'focus:outline-none focus:ring-1 focus:ring-cyan-500/50',
                    isActive && 'bg-cyan-500/10 shadow-[0_0_15px_rgba(0,212,255,0.2)]',
                    isMatch && !isActive && 'bg-purple-500/10',
                  )}
                  onClick={() => handleCueClick(cue.startTime)}
                  aria-label={`${cue.speaker ? `${cue.speaker}: ` : ''}${cue.text}. Click to jump to ${formatTime(cue.startTime)}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                      aria-hidden="true"
                    />
                  )}

                  {/* Speaker label */}
                  {showSpeakers && cue.isNewSpeaker && cue.speaker && (
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-cyan-400">{cue.speaker}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                  )}

                  {/* Cue content */}
                  <div className="flex items-start gap-3">
                    {showTimestamps && (
                      <span
                        className={cn(
                          'shrink-0 font-mono text-xs',
                          isActive ? 'text-cyan-400' : 'text-white/40',
                          'group-hover:text-cyan-400/80',
                        )}
                      >
                        {formatTime(cue.startTime)}
                      </span>
                    )}
                    <p
                      className={cn(
                        'text-sm leading-relaxed',
                        isActive ? 'text-white' : 'text-white/70',
                        'group-hover:text-white/90',
                      )}
                    >
                      {highlightText(cue.text)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Resume auto-scroll button */}
      {userScrolled && autoScroll && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full bg-black/80 px-3 py-1 text-xs text-white/70 hover:bg-black hover:text-white"
            onClick={() => setUserScrolled(false)}
          >
            Resume auto-scroll
          </Button>
        </div>
      )}
    </section>
  );
}

export default TranscriptPanel;
