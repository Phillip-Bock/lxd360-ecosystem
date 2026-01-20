'use client';

import { Clipboard, Copy, Eye, Play, Redo2, Scissors, Settings, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { StarterBlockType } from '@/types/blocks';
import { BlockInserter } from './block-inserter';

interface CourseRibbonProps {
  courseTitle: string;
  onTitleChange: (title: string) => void;
  onInsertBlock?: (type: StarterBlockType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

type RibbonTab = 'home' | 'insert' | 'design' | 'transitions' | 'review';

export default function CourseRibbon({
  courseTitle,
  onTitleChange,
  onInsertBlock,
  onUndo,
  onRedo,
  onDelete,
  onCut,
  onCopy,
  onPaste,
}: CourseRibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [isEditing, setIsEditing] = useState(false);

  const tabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'insert', label: 'Insert' },
    { id: 'design', label: 'Design' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <div className="border-b bg-card">
      {/* Top bar with title and actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-3">
          <SidebarTrigger />

          {/* Course Title - Editable */}
          {isEditing ? (
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="bg-transparent border-b border-primary px-1 py-0.5 text-lg font-medium focus:outline-hidden"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-lg font-medium hover:text-primary transition-colors"
            >
              {courseTitle}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded hover:bg-accent transition-colors flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            <Play className="h-4 w-4" />
            Publish
          </button>
          <button type="button" className="p-1.5 rounded hover:bg-accent transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div className="flex items-center gap-1 px-4 pt-1">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-1.5 text-sm rounded-t transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground border-t border-l border-r border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="flex items-center gap-6 px-4 py-2 bg-background min-h-18">
        {activeTab === 'home' && (
          <>
            {/* Clipboard Group */}
            <div className="flex items-center gap-1">
              <RibbonButton icon={Clipboard} label="Paste" size="lg" onClick={onPaste} />
              <div className="flex flex-col gap-0.5">
                <RibbonButton icon={Scissors} label="Cut" onClick={onCut} />
                <RibbonButton icon={Copy} label="Copy" onClick={onCopy} />
              </div>
              <RibbonDivider />
            </div>

            {/* Undo/Redo Group */}
            <div className="flex items-center gap-1">
              <RibbonButton icon={Undo2} label="Undo" onClick={onUndo} />
              <RibbonButton icon={Redo2} label="Redo" onClick={onRedo} />
              <RibbonDivider />
            </div>

            {/* Delete */}
            <div className="flex items-center gap-1">
              <RibbonButton icon={Trash2} label="Delete" onClick={onDelete} />
            </div>
          </>
        )}

        {activeTab === 'insert' && onInsertBlock && <BlockInserter onInsert={onInsertBlock} />}

        {activeTab === 'design' && (
          <div className="text-muted-foreground text-sm">
            Theme and styling options coming soon...
          </div>
        )}

        {activeTab === 'transitions' && (
          <div className="text-muted-foreground text-sm">Slide transitions and animations...</div>
        )}

        {activeTab === 'review' && (
          <div className="text-muted-foreground text-sm">
            Comments, accessibility checker, spell check...
          </div>
        )}
      </div>
    </div>
  );
}

// Ribbon Button Component
interface RibbonButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  size?: 'sm' | 'lg';
  onClick?: () => void;
}

function RibbonButton({ icon: Icon, label, size = 'sm', onClick }: RibbonButtonProps) {
  if (size === 'lg') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1 p-2 rounded hover:bg-accent transition-colors"
      >
        <Icon className="h-6 w-6" />
        <span className="text-xs">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition-colors text-sm"
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RibbonDivider() {
  return <div className="w-px h-10 bg-border mx-2" />;
}
