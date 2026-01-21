'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  BookText,
  Check,
  ChevronRight,
  Circle,
  Download,
  Palette,
  Settings,
  StickyNote,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { CourseSlide, CourseWithContent, PlayerState } from '@/types/player';
import { NotesPanel } from './notes-panel';
import { SkinsPanel } from './skins-panel';

interface PlayerSidebarProps {
  course: CourseWithContent;
  currentSlideIndex: number;
  activeTab: PlayerState['sidebarTab'];
  onTabChange: (tab: PlayerState['sidebarTab']) => void;
  onSlideSelect: (index: number) => void;
  onClose: () => void;
  userId: string;
  allSlides: CourseSlide[];
  onSkinChange?: (skinId: string, cssVariables: Record<string, string>) => void;
  currentSkinId?: string;
  isDemo?: boolean;
}

export function PlayerSidebar({
  course,
  currentSlideIndex,
  activeTab,
  onTabChange,
  onSlideSelect,
  onClose,
  userId,
  allSlides,
  onSkinChange,
  currentSkinId = 'default',
  isDemo = false,
}: PlayerSidebarProps) {
  const currentSlide = allSlides[currentSlideIndex];

  return (
    <motion.aside
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative z-10 flex h-full w-80 flex-col border-r border-[var(--hud-border)] bg-[var(--hud-bg-secondary,#080c14)]/98 backdrop-blur-md"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[var(--hud-border)] p-4">
        <span className="text-sm font-medium text-[var(--hud-text)]">Course Navigation</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/10 hover:text-[var(--hud-text)]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as PlayerState['sidebarTab'])}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-6 bg-[var(--hud-bg)]/50 p-1">
          <TabsTrigger
            value="menu"
            className="data-[state=active]:bg-[var(--hud-accent)]/20 data-[state=active]:text-[var(--hud-accent-bright)]"
          >
            <BookOpen className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="data-[state=active]:bg-[var(--hud-accent)]/20 data-[state=active]:text-[var(--hud-accent-bright)]"
          >
            <StickyNote className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="glossary"
            className="data-[state=active]:bg-[var(--hud-accent)]/20 data-[state=active]:text-[var(--hud-accent-bright)]"
          >
            <BookText className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="data-[state=active]:bg-[var(--hud-accent)]/20 data-[state=active]:text-[var(--hud-accent-bright)]"
          >
            <Download className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="skins"
            className="data-[state=active]:bg-[var(--hud-accent)]/20 data-[state=active]:text-[var(--hud-accent-bright)]"
          >
            <Palette className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[var(--hud-accent)]/20 data-[state=active]:text-[var(--hud-accent-bright)]"
          >
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* Menu Tab */}
        <TabsContent value="menu" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {course.chapters.map((chapter) => {
                const chapterSlides = allSlides.filter((s) => s.chapter_id === chapter.id);
                const isCurrentChapter = chapterSlides.some(
                  (s) => s.id === allSlides[currentSlideIndex]?.id,
                );

                return (
                  <div key={chapter.id} className="space-y-1">
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isCurrentChapter
                          ? 'bg-[var(--hud-accent)]/15 text-[var(--hud-accent-bright)]'
                          : 'text-[var(--hud-text-muted)]',
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isCurrentChapter && 'rotate-90',
                        )}
                      />
                      {chapter.title}
                    </div>

                    <div className="ml-4 space-y-0.5">
                      {chapterSlides.map((slide) => {
                        const slideIndex = allSlides.findIndex((s) => s.id === slide.id);
                        const isCompleted = slideIndex < currentSlideIndex;
                        const isCurrent = slideIndex === currentSlideIndex;

                        return (
                          <button
                            type="button"
                            key={slide.id}
                            onClick={() => onSlideSelect(slideIndex)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                              isCurrent &&
                                'bg-[var(--hud-accent)]/10 text-[var(--hud-accent-bright)]',
                              isCompleted && !isCurrent && 'text-[var(--hud-text-muted)]/60',
                              !isCurrent &&
                                !isCompleted &&
                                'text-[var(--hud-text-muted)] hover:bg-[var(--hud-accent)]/5 hover:text-[var(--hud-text)]',
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-3.5 w-3.5 text-brand-success" />
                            ) : isCurrent ? (
                              <Circle className="h-3.5 w-3.5 fill-[var(--hud-accent-bright)] text-[var(--hud-accent-bright)]" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-[var(--hud-text-muted)]/30" />
                            )}
                            <span className="line-clamp-1">{slide.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 m-0">
          <NotesPanel
            courseId={course.id}
            currentSlide={currentSlide}
            userId={userId}
            allSlides={allSlides}
            isDemo={isDemo}
          />
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {course.glossary.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center text-[var(--hud-text-muted)]">
                  <BookText className="mb-2 h-8 w-8" />
                  <p className="text-sm">No glossary terms</p>
                </div>
              ) : (
                course.glossary.map((term) => (
                  <div
                    key={term.id}
                    className="rounded-lg bg-[var(--hud-bg)]/80 p-3 border border-[var(--hud-border)]"
                  >
                    <h4 className="text-sm font-semibold text-[var(--hud-accent-bright)]">
                      {term.term}
                    </h4>
                    {term.pronunciation && (
                      <p className="text-xs text-[var(--hud-text-muted)] italic">
                        [{term.pronunciation}]
                      </p>
                    )}
                    <p className="mt-1 text-sm text-[var(--hud-text)]/80">{term.definition}</p>
                    {term.related_terms && term.related_terms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {term.related_terms.map((related) => (
                          <span
                            key={related}
                            className="rounded-full bg-[var(--hud-accent)]/10 px-2 py-0.5 text-xs text-[var(--hud-accent)]"
                          >
                            {related}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="flex-1 m-0 p-4">
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--hud-text-muted)]">
            <Download className="mb-2 h-8 w-8" />
            <p className="text-sm">Downloadable resources</p>
            <p className="text-xs">Course materials will appear here</p>
          </div>
        </TabsContent>

        {/* Skins Tab */}
        <TabsContent value="skins" className="flex-1 m-0">
          <SkinsPanel
            currentSkinId={currentSkinId}
            userId={userId}
            onSkinChange={onSkinChange || (() => {})}
            isDemo={isDemo}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 m-0 p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--hud-text)]">Player Settings</h3>
            <p className="text-xs text-[var(--hud-text-muted)]">
              Access accessibility settings from the header settings icon
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-[var(--hud-accent)]/40 to-transparent" />
    </motion.aside>
  );
}
