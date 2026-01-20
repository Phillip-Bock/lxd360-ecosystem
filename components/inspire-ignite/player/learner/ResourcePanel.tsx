'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Download, FileText, MessageSquare, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link';
  url: string;
  size?: string;
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  lessonTitle: string;
}

interface ResourcePanelProps {
  resources: Resource[];
  onDownload: (resourceId: string) => void;
}

/**
 * ResourcePanel - Tabbed panel for course resources and learner notes
 * Features downloadable materials and note-taking functionality
 */
export function ResourcePanel({ resources, onDownload }: ResourcePanelProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'resources' | 'notes'>('resources');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Important: Remember to review emergency protocol steps',
      timestamp: '12:34',
      lessonTitle: 'Emergency Response Basics',
    },
    {
      id: '2',
      content: 'Key point: Patient communication requires active listening and empathy',
      timestamp: '08:15',
      lessonTitle: 'Patient Communication Skills',
    },
  ]);
  const [newNote, setNewNote] = useState('');

  const tabs = [
    { id: 'resources' as const, label: 'Resources', icon: FileText },
    { id: 'notes' as const, label: 'My Notes', icon: MessageSquare },
  ];

  const handleAddNote = (): void => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        lessonTitle: 'Current Lesson', // TODO(LXD-405): Get from current lesson context
      };
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (noteId: string): void => {
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  const getFileIcon = (type: Resource['type']): string => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'doc':
        return '📝';
      case 'link':
        return '🔗';
      default:
        return '📎';
    }
  };

  return (
    <div className="bg-card border-[1.5px]  rounded-[10px] h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b  bg-muted/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-(--primary)'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>

              {/* Active Indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--primary)"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'resources' ? (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-5 space-y-3"
            >
              {resources.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-(--primary)" />
                    <h3 className="font-semibold text-foreground">Course Materials</h3>
                  </div>

                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-muted/50 border  rounded-[8px] hover:border-(--primary) transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">{getFileIcon(resource.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {resource.title}
                          </p>
                          {resource.size && (
                            <p className="text-xs text-muted-foreground">{resource.size}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDownload(resource.id)}
                        className="p-2 hover:bg-card rounded-[6px] transition-colors shrink-0"
                        aria-label={`Download ${resource.title}`}
                      >
                        <Download className="w-4 h-4 text-(--primary)" />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No resources available for this lesson</p>
                </div>
              )}

              {/* Data: Firestore integration pending */}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-5 space-y-4"
            >
              {/* Add Note Form */}
              <div className="space-y-2">
                <label htmlFor="new-note" className="text-sm font-semibold text-foreground">
                  Add a Note
                </label>
                <textarea
                  id="new-note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write your thoughts, questions, or key takeaways..."
                  className="w-full px-3 py-2.5 bg-card border-[1.5px]  rounded-[8px] text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-(--primary) focus:border-transparent resize-none text-sm"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="button-primary btn-sm w-full flex items-center justify-center gap-2"
                  aria-label="Save note"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Note</span>
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Your Notes</h3>

                {notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-muted/50 border  rounded-[8px] group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs font-medium text-(--primary)">{note.lessonTitle}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-card rounded-[4px] transition-all"
                              aria-label="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-(--danger-600)" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No notes yet. Start taking notes to remember key points!
                    </p>
                  </div>
                )}
              </div>

              {/* Data: Firestore integration pending */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
