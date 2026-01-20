'use client';

import { Pin, PinOff, Plus, StickyNote, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CourseSlide, LearnerNote } from '@/types/player';

interface NotesPanelProps {
  courseId: string;
  currentSlide: CourseSlide;
  userId: string;
  allSlides: CourseSlide[];
  isDemo?: boolean;
}

export function NotesPanel({
  courseId,
  currentSlide,
  userId,
  allSlides,
  isDemo = false,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<LearnerNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (isDemo) {
      const localNotes = localStorage.getItem(`demo-notes-${courseId}`);
      if (localNotes) {
        setNotes(JSON.parse(localNotes));
      }
      setIsLoading(false);
      return;
    }

    try {
      // TODO(LXD-297): Implement notes fetching with Firestore
      console.error('Fetch notes temporarily unavailable during Firebase migration');
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
    setIsLoading(false);
  }, [courseId, isDemo]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setIsSaving(true);

    if (isDemo) {
      const newNoteObj: LearnerNote = {
        id: `demo-note-${Date.now()}`,
        learner_id: userId,
        course_id: courseId,
        slide_id: currentSlide.id,
        content: newNote.trim(),
        is_pinned: false,
        created_at: new Date().toISOString(),
      };
      const updatedNotes = [newNoteObj, ...notes];
      setNotes(updatedNotes);
      localStorage.setItem(`demo-notes-${courseId}`, JSON.stringify(updatedNotes));
      setNewNote('');
      setIsSaving(false);
      return;
    }

    try {
      // TODO(LXD-297): Implement note creation with Firestore
      console.error('Add note temporarily unavailable during Firebase migration');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
    setIsSaving(false);
  };

  const deleteNote = async (noteId: string) => {
    if (isDemo) {
      const updatedNotes = notes.filter((n) => n.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem(`demo-notes-${courseId}`, JSON.stringify(updatedNotes));
      return;
    }

    try {
      // TODO(LXD-297): Implement note deletion with Firestore
      console.error('Delete note temporarily unavailable during Firebase migration');
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const togglePin = async (noteId: string, currentPinned: boolean) => {
    if (isDemo) {
      const updatedNotes = notes
        .map((n) => (n.id === noteId ? { ...n, is_pinned: !currentPinned } : n))
        .sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      setNotes(updatedNotes);
      localStorage.setItem(`demo-notes-${courseId}`, JSON.stringify(updatedNotes));
      return;
    }

    try {
      // TODO(LXD-297): Implement note pin toggle with Firestore
      console.error('Toggle pin temporarily unavailable during Firebase migration');
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const getSlideTitle = (slideId: string | null) => {
    if (!slideId) return 'General';
    const slide = allSlides.find((s) => s.id === slideId);
    return slide?.title ?? 'Unknown Slide';
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[var(--hud-text-muted)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--hud-border)] border-t-[var(--hud-accent)]" />
        <p className="mt-2 text-sm">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Add Note Form */}
      <div className="border-b border-[var(--hud-border)] p-4">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={`Add a note for "${currentSlide.title}"...`}
          className="min-h-[80px] resize-none border-[var(--hud-border)] bg-[var(--hud-bg)]/80 text-[var(--hud-text)] placeholder:text-[var(--hud-text-muted)]/50"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-[var(--hud-text-muted)]/60">
            Linked to: {currentSlide.title}
          </span>
          <Button
            size="sm"
            onClick={addNote}
            disabled={!newNote.trim() || isSaving}
            className="gap-1.5 bg-linear-to-r from-[var(--hud-accent)] to-[var(--hud-accent-bright)] text-[var(--hud-bg)] hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        {notes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[var(--hud-text-muted)]">
            <StickyNote className="mb-2 h-8 w-8" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs">Add your first note above</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'group rounded-lg border border-[var(--hud-border)] bg-[var(--hud-bg)]/60 p-3 transition-colors',
                  note.is_pinned && 'border-[var(--hud-accent)]/30 bg-[var(--hud-accent)]/5',
                )}
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-xs text-[var(--hud-accent-bright)]">
                    {getSlideTitle(note.slide_id)}
                  </span>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin(note.id, note.is_pinned)}
                      className="h-6 w-6 text-[var(--hud-text-muted)] hover:text-[var(--hud-accent-bright)]"
                    >
                      {note.is_pinned ? (
                        <PinOff className="h-3.5 w-3.5" />
                      ) : (
                        <Pin className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                      className="h-6 w-6 text-[var(--hud-text-muted)] hover:text-[var(--destructive)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-[var(--hud-text)]/80 whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="mt-2 text-xs text-[var(--hud-text-muted)]/50">
                  {new Date(note.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
