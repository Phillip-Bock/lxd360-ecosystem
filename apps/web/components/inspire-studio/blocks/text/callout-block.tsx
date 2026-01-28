'use client';

import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Info,
  Lightbulb,
  Quote,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { safeInnerHtml } from '@/lib/sanitize';
import type { CalloutBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const CALLOUT_TYPES = {
  info: {
    icon: Info,
    bgColor: 'bg-brand-primary/10',
    borderColor: 'border-brand-primary',
    iconColor: 'text-brand-cyan',
    titleColor: 'text-blue-300',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-brand-success/10',
    borderColor: 'border-brand-success',
    iconColor: 'text-brand-success',
    titleColor: 'text-green-300',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-brand-warning/10',
    borderColor: 'border-amber-500',
    iconColor: 'text-brand-warning',
    titleColor: 'text-amber-300',
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-brand-error/10',
    borderColor: 'border-brand-error',
    iconColor: 'text-brand-error',
    titleColor: 'text-red-300',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-brand-secondary/10',
    borderColor: 'border-brand-secondary',
    iconColor: 'text-brand-purple',
    titleColor: 'text-purple-300',
  },
  note: {
    icon: FileText,
    bgColor: 'bg-studio-surface/30',
    borderColor: 'border-studio-accent',
    iconColor: 'text-studio-accent',
    titleColor: 'text-studio-accent',
  },
  quote: {
    icon: Quote,
    bgColor: 'bg-studio-surface/20',
    borderColor: 'border-studio-text-muted',
    iconColor: 'text-studio-text-muted',
    titleColor: 'text-brand-muted',
  },
};

const DEFAULT_TITLES: Record<string, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
  tip: 'Tip',
  note: 'Note',
  quote: 'Quote',
};

/**
 * CalloutBlock - Info/warning/tip callout boxes
 */
export function CalloutBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<CalloutBlockContent>) {
  const content = block.content as CalloutBlockContent;
  const titleRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  const type = (content.type || 'info') as keyof typeof CALLOUT_TYPES;
  const config = CALLOUT_TYPES[type] || CALLOUT_TYPES.info;
  const Icon = config.icon;

  // Handle title change
  const handleTitleChange = useCallback(() => {
    if (titleRef.current) {
      onUpdate({
        content: {
          ...content,
          title: titleRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (contentRef.current) {
      onUpdate({
        content: {
          ...content,
          content: contentRef.current.innerHTML,
        },
      });
    }
  }, [content, onUpdate]);

  // Handle dismiss
  if (dismissed && content.dismissible) {
    return null;
  }

  // Preview mode
  if (!isEditing) {
    return (
      <div
        className={`
          relative ${config.bgColor} border-l-4 ${config.borderColor}
          rounded-r-lg p-4
        `}
        role="alert"
      >
        {/* Dismiss button */}
        {content.dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 text-studio-text-muted hover:text-brand-primary transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex gap-3">
          {/* Icon */}
          <div className={`shrink-0 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            {content.title && (
              <h4 className={`font-semibold ${config.titleColor} mb-1`}>{content.title}</h4>
            )}

            {/* Body */}
            <div
              className="text-studio-text prose prose-invert max-w-none prose-sm"
              {...safeInnerHtml(content.content || '', 'rich')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Type selector */}
      <div className="flex flex-wrap gap-1">
        {(Object.keys(CALLOUT_TYPES) as Array<keyof typeof CALLOUT_TYPES>).map((t) => {
          const typeConfig = CALLOUT_TYPES[t];
          const TypeIcon = typeConfig.icon;
          return (
            <button
              type="button"
              key={t}
              onClick={() => onUpdate({ content: { ...content, type: t } })}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors
                ${
                  type === t
                    ? `${typeConfig.bgColor} ${typeConfig.iconColor}`
                    : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                }
              `}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Callout preview */}
      <div
        className={`
          relative ${config.bgColor} border-l-4 ${config.borderColor}
          rounded-r-lg p-4
        `}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className={`shrink-0 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Title - editable */}
            <span
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              className={`
                block font-semibold ${config.titleColor} mb-1 outline-hidden
                empty:before:content-['${DEFAULT_TITLES[type]}'] empty:before:opacity-50
              `}
              onInput={handleTitleChange}
            >
              {content.title}
            </span>

            {/* Body - editable */}
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              className={`
                text-studio-text outline-hidden
                empty:before:content-['Add_callout_content...'] empty:before:text-studio-text-muted
              `}
              onInput={handleContentChange}
              {...safeInnerHtml(content.content || '', 'rich')}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={content.dismissible || false}
          onChange={(e) => onUpdate({ content: { ...content, dismissible: e.target.checked } })}
          className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
        />
        <span className="text-sm text-studio-text-muted">Allow users to dismiss</span>
      </label>
    </div>
  );
}

export default CalloutBlock;
