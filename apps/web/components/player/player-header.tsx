'use client';

import { Bookmark, Bot, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CourseSlide, CourseWithContent } from '@/types/player';

interface PlayerHeaderProps {
  course: CourseWithContent;
  currentSlide: CourseSlide;
  slideIndex: number;
  totalSlides: number;
  completionPercentage: number;
  onToggleSidebar: () => void;
  onToggleNeuronaut: () => void;
  sidebarOpen: boolean;
  onOpenAccessibility: () => void;
  /** Whether the current slide is bookmarked */
  isBookmarked?: boolean;
  /** Callback when bookmark button is clicked */
  onBookmark?: () => void;
}

export function PlayerHeader({
  course,
  slideIndex,
  totalSlides,
  completionPercentage,
  onToggleSidebar,
  onToggleNeuronaut,
  sidebarOpen,
  onOpenAccessibility,
  isBookmarked = false,
  onBookmark,
}: PlayerHeaderProps) {
  return (
    <header className="relative z-20 flex h-14 items-center justify-between border-b border-[var(--hud-border)] bg-[var(--hud-bg)]/95 px-4 backdrop-blur-xs">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--hud-accent)]/30 to-transparent" />

      {/* Left Section - Menu + Title Only */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0 text-[var(--hud-text-muted)] hover:text-[var(--hud-accent-bright)] transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-sm font-semibold text-[var(--hud-text)] truncate tracking-wide">
          {course.title}
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-3 px-4">
        <span className="text-xs font-mono text-[var(--hud-text-muted)]">
          {slideIndex + 1}/{totalSlides}
        </span>
        <div className="w-32 h-1.5 bg-[var(--hud-bg-secondary)] rounded-full overflow-hidden border border-[var(--hud-border)]">
          <div
            className="h-full bg-linear-to-r from-[var(--hud-accent)] to-[var(--hud-accent-green)] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <span className="text-xs font-mono text-[var(--hud-accent-bright)] min-w-[35px] text-right">
          {Math.round(completionPercentage)}%
        </span>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleNeuronaut}
          className="gap-2 bg-[var(--hud-accent)]/10 text-[var(--hud-accent-bright)] hover:bg-[var(--hud-accent)]/20 border border-[var(--hud-accent)]/20 font-medium"
        >
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">Neuro-naut</span>
        </Button>

        {onBookmark && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBookmark}
            className={cn(
              'transition-colors',
              isBookmarked
                ? 'text-[var(--hud-accent-bright)] bg-[var(--hud-accent)]/20'
                : 'text-[var(--hud-text-muted)] hover:text-[var(--hud-accent-bright)]',
            )}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenAccessibility}
          className="text-[var(--hud-text-muted)] hover:text-[var(--hud-accent-bright)] transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
