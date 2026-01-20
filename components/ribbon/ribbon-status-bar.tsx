'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { RibbonZoomSlider } from './ribbon-zoom';

export interface StatusBarItem {
  id: string;
  content: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  tooltip?: string;
  position?: 'left' | 'right';
}

export interface RibbonStatusBarProps {
  items?: StatusBarItem[];
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  showZoom?: boolean;
  zoomValue?: number;
  onZoomChange?: (value: number) => void;
  className?: string;
}

export function RibbonStatusBar({
  items = [],
  leftContent,
  rightContent,
  showZoom = true,
  zoomValue = 100,
  onZoomChange,
  className = '',
}: RibbonStatusBarProps) {
  const leftItems = items.filter((item) => item.position !== 'right');
  const rightItems = items.filter((item) => item.position === 'right');

  return (
    <div
      className={`
        flex items-center justify-between
        h-6 px-2
        bg-(--ribbon-bg) border-t border-(--ribbon-border)
        text-xs text-(--ribbon-text)/70
        ${className}
      `}
      data-slot="ribbon-status-bar"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {leftContent}
        {leftItems.map((item) => (
          <StatusBarItemRenderer key={item.id} item={item} />
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {rightItems.map((item) => (
          <StatusBarItemRenderer key={item.id} item={item} />
        ))}
        {rightContent}
        {showZoom && <RibbonZoomSlider value={zoomValue} onChange={onZoomChange} />}
      </div>
    </div>
  );
}

interface StatusBarItemRendererProps {
  item: StatusBarItem;
}

function StatusBarItemRenderer({ item }: StatusBarItemRendererProps) {
  const content = (
    <>
      {item.icon && <item.icon className="h-3 w-3 mr-1" />}
      {item.content}
    </>
  );

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className="flex items-center hover:text-(--ribbon-text) transition-colors"
        title={item.tooltip}
      >
        {content}
      </button>
    );
  }

  return (
    <span className="flex items-center" title={item.tooltip}>
      {content}
    </span>
  );
}

// Pre-built status bar items
export interface WordCountStatusProps {
  words: number;
  characters: number;
  onClick?: () => void;
}

export function WordCountStatus({ words, characters, onClick }: WordCountStatusProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 hover:text-(--ribbon-text) transition-colors"
    >
      <span>{words.toLocaleString()} words</span>
      <span className="text-(--ribbon-text)/40">|</span>
      <span>{characters.toLocaleString()} characters</span>
    </button>
  );
}

export interface PageStatusProps {
  currentPage: number;
  totalPages: number;
  onNavigate?: (page: number) => void;
}

export function PageStatus({ currentPage, totalPages, onNavigate }: PageStatusProps) {
  return (
    <div className="flex items-center gap-1">
      <span>Page</span>
      <button
        type="button"
        onClick={() => onNavigate?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-1 hover:bg-(--ribbon-hover) rounded disabled:opacity-50"
      >
        ‹
      </button>
      <span>
        {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onNavigate?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-1 hover:bg-(--ribbon-hover) rounded disabled:opacity-50"
      >
        ›
      </button>
    </div>
  );
}

export interface SaveStatusProps {
  status: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSaved?: Date;
}

export function SaveStatus({ status, lastSaved }: SaveStatusProps) {
  const statusConfig = {
    saved: { text: 'Saved', color: 'text-green-500' },
    saving: { text: 'Saving...', color: 'text-yellow-500' },
    unsaved: { text: 'Unsaved changes', color: 'text-orange-500' },
    error: { text: 'Save failed', color: 'text-red-500' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{config.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-(--ribbon-text)/40 ml-1">{formatTimeAgo(lastSaved)}</span>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export interface CursorPositionStatusProps {
  line: number;
  column: number;
  selection?: { start: number; end: number };
}

export function CursorPositionStatus({ line, column, selection }: CursorPositionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span>
        Ln {line}, Col {column}
      </span>
      {selection && selection.start !== selection.end && (
        <>
          <span className="text-(--ribbon-text)/40">|</span>
          <span>{Math.abs(selection.end - selection.start)} selected</span>
        </>
      )}
    </div>
  );
}
