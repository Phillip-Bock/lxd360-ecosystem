'use client';

export const dynamic = 'force-dynamic';

import { AlertCircle, Loader2 } from 'lucide-react';
import { use } from 'react';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import {
  CoursePlayerHeader,
  CoursePlayerNavigation,
  CoursePlayerSidebar,
} from '@/components/player';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCoursePlayer } from '@/hooks/player/use-course-player';
import { cn } from '@/lib/utils';

/**
 * Course Player page - Main lesson delivery interface
 * LXD-332: Full player implementation with content blocks, navigation, and progress tracking
 */
export default function PlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);

  const {
    // State
    course,
    currentLesson,
    progress: _progress, // Available for future use (xAPI tracking)
    bookmarks,
    navigation,
    ui,
    loading,
    error,
    // Actions
    navigateToLesson,
    markLessonComplete,
    goToNextLesson,
    goToPreviousLesson,
    addBookmark,
    removeBookmark,
    toggleSidebar,
    toggleFullscreen,
  } = useCoursePlayer(courseId, lessonId);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course || !currentLesson) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load course</AlertTitle>
          <AlertDescription>
            {error || 'Unable to load course content. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if this is the last lesson
  const isLastLesson = !navigation?.hasNext;

  return (
    <div
      className={cn(
        'flex h-[calc(100vh-4rem)] bg-background',
        ui.isFullscreen && 'fixed inset-0 z-50 h-screen',
      )}
    >
      {/* Mobile sidebar overlay */}
      {ui.sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden border-0 cursor-default"
          onClick={toggleSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Escape') toggleSidebar();
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full transition-transform duration-300 md:relative md:z-auto md:translate-x-0',
          ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden',
        )}
      >
        <CoursePlayerSidebar
          course={course}
          currentLessonId={currentLesson.id}
          onLessonSelect={navigateToLesson}
          isCollapsed={ui.sidebarCollapsed}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <CoursePlayerHeader
          courseTitle={course.title}
          lessonTitle={currentLesson.title}
          bookmarks={bookmarks}
          currentLessonId={currentLesson.id}
          onToggleSidebar={toggleSidebar}
          onAddBookmark={addBookmark}
          onRemoveBookmark={removeBookmark}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={ui.isFullscreen}
          sidebarOpen={ui.sidebarOpen}
        />

        {/* Content area with blocks */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Lesson header */}
            <header className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {currentLesson.title}
              </h1>
              {currentLesson.description && (
                <p className="mt-2 text-sm md:text-base text-muted-foreground">
                  {currentLesson.description}
                </p>
              )}
            </header>

            {/* Content blocks */}
            <div className="space-y-6 md:space-y-8">
              {currentLesson.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={false}
                  isEditing={false}
                  onXAPIEvent={(_verb, _data) => {
                    // TODO(LXD-333): Implement xAPI tracking
                    // This will be connected to the xAPI pipeline
                  }}
                />
              ))}

              {/* Empty state if no blocks */}
              {currentLesson.blocks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No content available for this lesson yet.</p>
                </div>
              )}
            </div>

            {/* XP reward indicator */}
            {currentLesson.xpReward > 0 && currentLesson.status !== 'completed' && (
              <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground">
                  Complete this lesson to earn{' '}
                  <span className="font-semibold text-primary">{currentLesson.xpReward} XP</span>
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom navigation */}
        <CoursePlayerNavigation
          navigation={navigation}
          lessonStatus={currentLesson.status}
          onPrevious={goToPreviousLesson}
          onNext={goToNextLesson}
          onMarkComplete={markLessonComplete}
          isLastLesson={isLastLesson}
        />
      </div>
    </div>
  );
}
