'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Quick Access Toolbar Component
 * =============================================================================
 *
 * The top toolbar that provides quick access to common actions like
 * Save, Undo, Redo, Preview, and Publish. Always visible above the ribbon.
 */

import {
  ChevronDown,
  Eye,
  HelpCircle,
  Keyboard,
  Plus,
  Redo,
  Save,
  Settings,
  Undo,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuickAccessToolbarProps {
  documentTitle?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onOpenShortcuts?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export function QuickAccessToolbar({
  documentTitle = 'Untitled Lesson',
  canUndo = false,
  canRedo = false,
  isSaving = false,
  lastSaved,
  onSave,
  onUndo,
  onRedo,
  onPreview,
  onPublish,
  onOpenShortcuts,
  onOpenHelp,
  className,
}: QuickAccessToolbarProps) {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const customizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
        setIsCustomizeOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={cn(
        'h-9 bg-studio-bg-dark border-b border-studio-surface/30 flex items-center justify-between px-2',
        className,
      )}
    >
      {/* Left side - Quick actions */}
      <div className="flex items-center gap-0.5">
        <QuickButton icon={Save} onClick={onSave} tooltip="Save (Ctrl+S)" isLoading={isSaving} />
        <div className="w-px h-4 bg-studio-surface/50 mx-1" />
        <QuickButton icon={Undo} onClick={onUndo} disabled={!canUndo} tooltip="Undo (Ctrl+Z)" />
        <QuickButton icon={Redo} onClick={onRedo} disabled={!canRedo} tooltip="Redo (Ctrl+Y)" />
        <div className="w-px h-4 bg-studio-surface/50 mx-1" />
        <QuickButton icon={Eye} onClick={onPreview} tooltip="Preview (Ctrl+Shift+P)" />

        {/* Customize dropdown */}
        <div ref={customizeRef} className="relative">
          <button
            type="button"
            onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
            className="p-1 text-studio-text-muted hover:text-brand-primary transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          {isCustomizeOpen && (
            <div className="absolute top-full left-0 mt-1 py-1 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl z-50 min-w-[200px]">
              <div className="px-3 py-2 text-xs text-studio-text-muted uppercase tracking-wider">
                Quick Access Toolbar
              </div>
              <div className="h-px bg-studio-surface/50" />
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Commands...
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                Customize Toolbar...
              </button>
              <div className="h-px bg-studio-surface/50 my-1" />
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary transition-colors"
              >
                <span>Show Below Ribbon</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary transition-colors"
              >
                <span>Minimize Ribbon</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center - Document title and save status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-brand-primary font-medium">{documentTitle}</span>
        <span className="text-xs text-studio-text-muted">
          {isSaving ? 'Saving...' : lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : 'Not saved'}
        </span>
      </div>

      {/* Right side - Publish & Help */}
      <div className="flex items-center gap-1">
        <QuickButton
          icon={Keyboard}
          onClick={onOpenShortcuts}
          tooltip="Keyboard Shortcuts (Ctrl+/)"
        />
        <QuickButton icon={HelpCircle} onClick={onOpenHelp} tooltip="Help (F1)" />
        <div className="w-px h-4 bg-studio-surface/50 mx-1" />
        <button
          type="button"
          onClick={onPublish}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-studio-accent to-lxd-purple-light hover:from-studio-accent-hover hover:to-lxd-purple-light text-brand-primary text-xs font-medium rounded-md transition-all shadow-lg shadow-studio-accent/20"
        >
          <Upload className="w-3.5 h-3.5" />
          Publish
        </button>
      </div>
    </div>
  );
}

// Helper Components

interface QuickButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  isLoading?: boolean;
}

function QuickButton({ icon: Icon, onClick, disabled, tooltip, isLoading }: QuickButtonProps) {
  const buttonContent = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'p-1.5 rounded transition-colors',
        disabled
          ? 'text-studio-text-muted/50 cursor-not-allowed'
          : 'text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50',
      )}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-studio-text-muted/30 border-t-studio-accent rounded-full animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          className="bg-studio-bg border border-studio-surface text-brand-primary text-xs"
          sideOffset={5}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

// Utility function

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}
