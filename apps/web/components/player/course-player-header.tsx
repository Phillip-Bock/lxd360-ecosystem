'use client';

/**
 * PlayerHeader Component
 * LXD-332: Header bar for the course player
 */

import { ArrowLeft, Bookmark, BookmarkCheck, Maximize2, Menu, Minimize2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LessonBookmark } from '@/types/player/course-player';

interface PlayerHeaderProps {
  courseTitle: string;
  lessonTitle: string;
  bookmarks: LessonBookmark[];
  currentLessonId: string;
  onToggleSidebar: () => void;
  onAddBookmark: (title: string) => Promise<void>;
  onRemoveBookmark: (bookmarkId: string) => Promise<void>;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  sidebarOpen: boolean;
}

export function CoursePlayerHeader({
  courseTitle,
  lessonTitle,
  bookmarks,
  currentLessonId,
  onToggleSidebar,
  onAddBookmark,
  onRemoveBookmark,
  onToggleFullscreen,
  isFullscreen,
  sidebarOpen,
}: PlayerHeaderProps) {
  const router = useRouter();
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if current lesson is bookmarked
  const currentBookmark = bookmarks.find((b) => b.lessonId === currentLessonId);
  const isBookmarked = Boolean(currentBookmark);

  const handleBackClick = () => {
    router.push('/ignite/learn/my-learning');
  };

  const handleBookmarkClick = async () => {
    if (isBookmarked && currentBookmark) {
      await onRemoveBookmark(currentBookmark.id);
    } else {
      setBookmarkTitle(lessonTitle);
      setShowBookmarkDialog(true);
    }
  };

  const handleSaveBookmark = async () => {
    if (!bookmarkTitle.trim()) return;

    setIsSaving(true);
    try {
      await onAddBookmark(bookmarkTitle.trim());
      setShowBookmarkDialog(false);
      setBookmarkTitle('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="shrink-0"
            aria-label="Back to my learning"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="shrink-0 md:hidden"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="shrink-0 hidden md:flex"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="min-w-0 hidden sm:block">
            <p className="text-xs text-muted-foreground truncate">{courseTitle}</p>
            <h1 className="text-sm font-medium truncate">{lessonTitle}</h1>
          </div>

          {/* Mobile title - only lesson name */}
          <div className="min-w-0 sm:hidden">
            <h1 className="text-sm font-medium truncate">{lessonTitle}</h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkClick}
            className={cn('shrink-0', isBookmarked && 'text-yellow-500 hover:text-yellow-600')}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            aria-pressed={isBookmarked}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="shrink-0 hidden sm:flex"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
            <DialogDescription>Save this position to quickly return to it later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bookmark-title">Bookmark Title</Label>
              <Input
                id="bookmark-title"
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder="Enter a title for this bookmark"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveBookmark();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookmarkDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBookmark} disabled={!bookmarkTitle.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Save Bookmark'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
