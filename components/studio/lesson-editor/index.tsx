'use client';

import { useCallback, useMemo, useState } from 'react';
import type { InspireStage } from '@/lib/cognitive-load';
import { BlocksSidebar } from './blocks-sidebar';
import { type CanvasBlock, LessonCanvas } from './lesson-canvas';
import { PropertiesSidebar } from './properties-sidebar';
import { LessonRibbon } from './ribbon';

interface LessonEditorProps {
  lessonId: string;
}

/**
 * LessonEditor - Main editor interface for lesson content
 * @param lessonId - The unique identifier for the lesson being edited
 */
export function LessonEditor({ lessonId }: LessonEditorProps) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [inspireStage, setInspireStage] = useState<InspireStage>('scaffold');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const handleUpdateBlock = useCallback((id: string, updates: Partial<CanvasBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
    },
    [selectedBlockId],
  );

  const handleDuplicateBlock = useCallback(
    (blockId: string) => {
      const blockToDuplicate = blocks.find((b) => b.id === blockId);
      if (blockToDuplicate) {
        const duplicatedBlock: CanvasBlock = {
          ...blockToDuplicate,
          id: `block-${Date.now()}`,
        };
        setBlocks((prev) => {
          const index = prev.findIndex((b) => b.id === blockId);
          const newBlocks = [...prev];
          newBlocks.splice(index + 1, 0, duplicatedBlock);
          return newBlocks;
        });
        setHasUnsavedChanges(true);
      }
    },
    [blocks],
  );

  const handleAddBlock = useCallback((type: string) => {
    setBlocks((prev) => {
      const newBlock: CanvasBlock = {
        id: `block-${Date.now()}`,
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
        content: {},
        order: prev.length,
      };
      setSelectedBlockId(newBlock.id);
      return [...prev, newBlock];
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    // Simulate save - in real implementation, this would call an API
    const timeout = setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Determine selected block type for contextual tabs
  const selectedBlockType = useMemo(() => {
    if (!selectedBlock) return 'none';
    const type = selectedBlock.type;
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    if (type === 'audio') return 'audio';
    if (['multiple-choice', 'multiple-select', 'true-false', 'fill-blank'].includes(type))
      return 'quiz';
    return 'text';
  }, [selectedBlock]);

  return (
    <div className="h-full bg-(--navy-100) flex flex-col overflow-hidden">
      {/* Lesson Ribbon - Fixed at top */}
      <div className="shrink-0 shadow-xs">
        <LessonRibbon
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          lessonDuration={lessonDuration}
          onTitleChange={setLessonTitle}
          onDurationChange={setLessonDuration}
          blocks={blocks}
          selectedBlock={selectedBlock}
          selectedBlockType={selectedBlockType}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onAddBlock={handleAddBlock}
          inspireStage={inspireStage}
          onInspireStageChange={setInspireStage}
          canUndo={false}
          canRedo={false}
          onUndo={() => {}}
          onRedo={() => {}}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
          onSave={handleSave}
        />
      </div>

      {/* Main Content Area - Sidebars fixed, canvas scrolls seamlessly */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar - Content Blocks (fixed, internal scroll) */}
        <BlocksSidebar />

        {/* Canvas - Center (scrollable) */}
        <LessonCanvas
          blocks={blocks}
          setBlocks={setBlocks}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
        />

        {/* Right Sidebar - Properties (fixed, internal scroll) */}
        <PropertiesSidebar
          selectedBlock={selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onClose={handleClearSelection}
        />
      </div>
    </div>
  );
}
