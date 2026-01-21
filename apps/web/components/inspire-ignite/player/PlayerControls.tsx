'use client';

import { BookOpen, ChevronLeft, ChevronRight, Home, Settings, X } from 'lucide-react';
import { useState } from 'react';
import type { ContentBlock } from '@/lib/inspire/types/contentBlocks';

interface PlayerControlsProps {
  currentIndex: number;
  totalBlocks: number;
  progress: number;
  lessonTitle: string;
  moduleTitle?: string;
  onPrevious: () => void;
  onNext: () => void;
  onNavigate: (index: number) => void;
  onExit: () => void;
  blocks: ContentBlock[];
}

export function PlayerControls({
  currentIndex,
  totalBlocks,
  progress,
  lessonTitle,
  moduleTitle,
  onPrevious,
  onNext,
  onNavigate,
  onExit,
  blocks,
}: PlayerControlsProps): React.JSX.Element {
  const [showOutline, setShowOutline] = useState(false);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalBlocks - 1;

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-lxd-light-card border-b border-lxd-light-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Exit and Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="p-2 hover:bg-lxd-light-card rounded-lg transition-colors"
              title="Exit lesson"
            >
              <Home className="w-5 h-5 text-lxd-text-dark-body" />
            </button>
            <div className="hidden sm:block border-l border-lxd-light-border pl-3">
              {moduleTitle && <p className="text-xs text-lxd-text-dark-muted">{moduleTitle}</p>}
              <p className="text-sm font-medium text-lxd-text-dark-heading truncate max-w-[200px] sm:max-w-[300px]">
                {lessonTitle}
              </p>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-lxd-light-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-lxd-text-dark-body whitespace-nowrap">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="p-2 hover:bg-lxd-light-card rounded-lg transition-colors"
              title="Show outline"
            >
              <BookOpen className="w-5 h-5 text-lxd-text-dark-body" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-lxd-light-card rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-lxd-text-dark-body" />
            </button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden px-4 pb-2">
          <div className="h-1.5 bg-lxd-light-card rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-lxd-light-card border-t border-lxd-light-border shadow-lg">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Previous Button */}
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                canGoPrevious
                  ? 'text-lxd-text-dark-body hover:bg-lxd-light-card'
                  : 'text-lxd-text-light-body cursor-not-allowed'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Block Counter */}
          <div className="text-sm text-lxd-text-dark-muted">
            <span className="font-medium text-lxd-text-dark-heading">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span>{totalBlocks}</span>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                canGoNext
                  ? 'bg-indigo-600 text-brand-primary hover:bg-indigo-700'
                  : currentIndex === totalBlocks - 1
                    ? 'bg-brand-success text-brand-primary hover:bg-green-700'
                    : 'bg-lxd-light-surface text-lxd-text-light-muted cursor-not-allowed'
              }
            `}
          >
            <span className="hidden sm:inline">
              {currentIndex === totalBlocks - 1 ? 'Complete' : 'Next'}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Outline Sidebar */}
      {showOutline && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowOutline(false)}
            role="presentation"
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-lxd-light-card shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-lxd-light-border">
              <h3 className="font-semibold text-lxd-text-dark-heading">Lesson Outline</h3>
              <button
                type="button"
                onClick={() => setShowOutline(false)}
                className="p-2 hover:bg-lxd-light-card rounded-lg"
              >
                <X className="w-5 h-5 text-lxd-text-dark-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {blocks.map((block, index) => {
                  const isActive = index === currentIndex;
                  const isPast = index < currentIndex;

                  // Only show headings in outline
                  if (block.type !== 'heading') return null;

                  return (
                    <button
                      type="button"
                      key={block.id}
                      onClick={() => {
                        onNavigate(index);
                        setShowOutline(false);
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : isPast
                              ? 'text-lxd-text-light-muted hover:bg-lxd-light-card'
                              : 'text-lxd-text-dark-body hover:bg-lxd-light-card'
                        }
                      `}
                    >
                      {(block.content as { text?: string }).text || `Section ${index + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
