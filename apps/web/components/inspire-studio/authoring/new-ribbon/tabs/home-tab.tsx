'use client';

import { RibbonGroup } from '../ribbon-group';
import { ClipboardSection } from '../sections/clipboard-section';
import { FontSection } from '../sections/font-section';
import { HistorySection } from '../sections/history-section';
import { ParagraphSection } from '../sections/paragraph-section';

interface HomeTabProps {
  onExpandGroup?: (content: React.ReactNode) => void;
}

export function HomeTab({ onExpandGroup }: HomeTabProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <RibbonGroup title="Clipboard">
        <ClipboardSection />
      </RibbonGroup>

      <RibbonGroup title="History">
        <HistorySection />
      </RibbonGroup>

      <RibbonGroup title="Font">
        <FontSection />
      </RibbonGroup>

      <RibbonGroup
        title="Paragraph"
        expandable
        onExpand={() =>
          onExpandGroup?.(
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paragraph Options</h3>
              <ParagraphSection />
              <p className="text-sm text-muted-foreground">
                Advanced paragraph formatting including alignment, spacing, and lists.
              </p>
            </div>,
          )
        }
      >
        <ParagraphSection />
      </RibbonGroup>

      <RibbonGroup title="Actions">
        <div className="flex gap-1.5">
          <button
            type="button"
            className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-accent rounded transition-colors"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-[9px]">Preview</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-accent rounded transition-colors"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[9px]">Review</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-accent rounded transition-colors"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-[9px]">Publish</span>
          </button>
        </div>
      </RibbonGroup>
    </div>
  );
}
