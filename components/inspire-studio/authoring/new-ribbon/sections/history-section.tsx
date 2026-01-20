'use client';

import { Redo2, RemoveFormatting, Undo2 } from 'lucide-react';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { RibbonButton } from '../ribbon-button';

export function HistorySection(): React.JSX.Element {
  const { state, dispatch, editorRef, undo, redo, canUndo, canRedo } = useEditor();

  const handleUndo = (): void => {
    undo();
    dispatch({ type: 'UNDO' });
    if (editorRef?.current && state.currentIndex > 0) {
      editorRef.current.innerHTML = state.history[state.currentIndex - 1] ?? '';
    }
  };

  const handleRedo = (): void => {
    redo();
    dispatch({ type: 'REDO' });
    if (editorRef?.current && state.currentIndex < state.history.length - 1) {
      editorRef.current.innerHTML = state.history[state.currentIndex + 1] ?? '';
    }
  };

  const handleClearFormatting = (): void => {
    if (!editorRef?.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      // Remove all formatting from selected text
      document.execCommand('removeFormat', false, undefined);
      document.execCommand('unlink', false, undefined);

      // Save to history
      const content = editorRef.current.innerHTML;
      dispatch({ type: 'SET_CONTENT', payload: { content } });
    }
  };

  return (
    <div className="flex gap-1">
      <RibbonButton icon={Undo2} label="Undo" onClick={handleUndo} disabled={!canUndo} />
      <RibbonButton icon={Redo2} label="Redo" onClick={handleRedo} disabled={!canRedo} />
      <RibbonButton icon={RemoveFormatting} label="Clear" onClick={handleClearFormatting} />
    </div>
  );
}
