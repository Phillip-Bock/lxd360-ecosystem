'use client';

/**
 * HomeTab - Primary ribbon tab for lesson editing
 * Contains: Clipboard, Lesson Info, Save & Publish, Undo/Redo
 */

import {
  ClipboardPaste,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Redo,
  Save,
  Scissors,
  Undo,
  Upload,
} from 'lucide-react';
import {
  RibbonButton,
  RibbonCombobox,
  RibbonContent,
  RibbonGroup,
  RibbonSeparator,
} from '@/components/ribbon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Super light blue for icons
const ICON_COLOR = 'text-sky-400';

export interface HomeTabProps {
  // Lesson info
  lessonTitle?: string;
  lessonDuration?: string;
  onTitleChange?: (title: string) => void;
  onDurationChange?: (duration: string) => void;

  // Undo/Redo state
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;

  // Clipboard actions
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;

  // Save & publish
  onSave?: () => void;
  onSaveAs?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onExport?: () => void;

  // State indicators
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
}

const DURATION_OPTIONS = [
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
];

export function HomeTab({
  lessonTitle = '',
  lessonDuration = '15',
  onTitleChange,
  onDurationChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSave,
  onSaveAs: _onSaveAs,
  onPreview,
  onPublish,
  onExport,
  isSaving = false,
  hasUnsavedChanges = false,
  lastSaved,
}: HomeTabProps) {
  return (
    <RibbonContent>
      {/* Clipboard Group */}
      <RibbonGroup label="Clipboard">
        <div className="flex items-center gap-1">
          <RibbonButton
            icon={<ClipboardPaste className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Paste"
            size="lg-row"
            variant="pill"
            onClick={onPaste}
            tooltip="Paste (Ctrl+V)"
          />
          <RibbonButton
            icon={<Scissors className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Cut"
            size="lg-row"
            variant="pill"
            onClick={onCut}
            tooltip="Cut (Ctrl+X)"
          />
          <RibbonButton
            icon={<Copy className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Copy"
            size="lg-row"
            variant="pill"
            onClick={onCopy}
            tooltip="Copy (Ctrl+C)"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Undo/Redo Group */}
      <RibbonGroup label="History">
        <div className="flex items-center gap-1">
          <RibbonButton
            icon={<Undo className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Undo"
            size="lg-row"
            variant="pill"
            onClick={onUndo}
            disabled={!canUndo}
            tooltip="Undo (Ctrl+Z)"
          />
          <RibbonButton
            icon={<Redo className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Redo"
            size="lg-row"
            variant="pill"
            onClick={onRedo}
            disabled={!canRedo}
            tooltip="Redo (Ctrl+Y)"
          />
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Lesson Info Group */}
      <RibbonGroup label="Lesson Info">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1 border border-gray-200">
            <FileText className={`h-4 w-4 ${ICON_COLOR}`} />
            <Input
              value={lessonTitle}
              onChange={(e) => onTitleChange?.(e.target.value)}
              placeholder="Lesson title..."
              className="h-6 w-40 text-xs bg-transparent border-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1 border border-gray-200">
            <Clock className={`h-4 w-4 ${ICON_COLOR}`} />
            <RibbonCombobox
              options={DURATION_OPTIONS}
              value={lessonDuration}
              onSelect={onDurationChange || (() => {})}
              placeholder="Duration"
              width={70}
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Save & Publish Group */}
      <RibbonGroup label="Save & Publish">
        <div className="flex items-center gap-1">
          <RibbonButton
            icon={<Save className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Save"
            size="lg-row"
            variant="pill"
            onClick={onSave}
            tooltip="Save (Ctrl+S)"
          />
          <RibbonButton
            icon={<Eye className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Preview"
            size="lg-row"
            variant="pill"
            onClick={onPreview}
            tooltip="Preview Lesson"
          />
          <RibbonButton
            icon={<Download className={`h-4 w-4 ${ICON_COLOR}`} />}
            label="Export"
            size="lg-row"
            variant="pill"
            onClick={onExport}
            tooltip="Export Lesson"
          />
          <Button
            size="sm"
            onClick={onPublish}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Publish
          </Button>
        </div>
      </RibbonGroup>

      {/* Status indicator on right */}
      <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
        {isSaving && <span className="animate-pulse">Saving...</span>}
        {!isSaving && hasUnsavedChanges && <span className="text-amber-500">Unsaved changes</span>}
        {!isSaving && !hasUnsavedChanges && lastSaved && (
          <span>Saved {formatTimeAgo(lastSaved)}</span>
        )}
      </div>
    </RibbonContent>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
