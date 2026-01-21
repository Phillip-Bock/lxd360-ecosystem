'use client';

import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Link } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import type { HeadingBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const HEADING_SIZES = {
  1: 'text-4xl font-bold',
  2: 'text-3xl font-bold',
  3: 'text-2xl font-semibold',
  4: 'text-xl font-semibold',
  5: 'text-lg font-medium',
  6: 'text-base font-medium',
};

const HEADING_ICONS = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
  4: Heading4,
  5: Heading5,
  6: Heading6,
};

/**
 * HeadingBlock - H1-H6 heading with subtitle support
 */
export function HeadingBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<HeadingBlockContent>) {
  const content = block.content as HeadingBlockContent;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const level = content.level || 2;
  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  // Handle heading text change
  const handleHeadingChange = useCallback(() => {
    if (headingRef.current) {
      onUpdate({
        content: {
          ...content,
          text: headingRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Handle subtitle change
  const handleSubtitleChange = useCallback(() => {
    if (subtitleRef.current) {
      onUpdate({
        content: {
          ...content,
          subtitle: subtitleRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Change heading level
  const handleLevelChange = useCallback(
    (newLevel: 1 | 2 | 3 | 4 | 5 | 6) => {
      onUpdate({
        content: {
          ...content,
          level: newLevel,
        },
      });
      setShowLevelPicker(false);
    },
    [content, onUpdate],
  );

  // Preview mode
  if (!isEditing) {
    return (
      <div id={content.anchor}>
        <HeadingTag className={`${HEADING_SIZES[level]} text-brand-primary`}>
          {content.text || 'Heading'}
        </HeadingTag>
        {content.subtitle && (
          <p className="mt-2 text-lg text-studio-text-muted">{content.subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Level picker button */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={() => setShowLevelPicker(!showLevelPicker)}
          className="p-1.5 rounded text-studio-text-muted hover:text-brand-primary hover:bg-studio-surface/50 transition-colors"
          title="Change heading level"
        >
          {React.createElement(HEADING_ICONS[level], { className: 'w-4 h-4' })}
        </button>

        {/* Level dropdown */}
        {showLevelPicker && (
          <div className="absolute left-full top-0 ml-2 bg-studio-bg border border-studio-surface/50 rounded-lg shadow-xl py-1 z-20">
            {([1, 2, 3, 4, 5, 6] as const).map((l) => {
              const Icon = HEADING_ICONS[l];
              return (
                <button
                  type="button"
                  key={l}
                  onClick={() => handleLevelChange(l)}
                  className={`
                    flex items-center gap-2 w-full px-3 py-1.5 text-sm transition-colors
                    ${
                      level === l
                        ? 'bg-studio-accent/20 text-studio-accent'
                        : 'text-studio-text hover:bg-studio-surface/50 hover:text-brand-primary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>Heading {l}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Heading content */}
      <HeadingTag
        ref={headingRef as React.Ref<HTMLHeadingElement>}
        contentEditable
        suppressContentEditableWarning
        className={`
          ${HEADING_SIZES[level]} text-brand-primary outline-hidden
          focus:bg-studio-bg/30 rounded px-1 -mx-1
          empty:before:content-['Heading'] empty:before:text-studio-text-muted
        `}
        onInput={handleHeadingChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            subtitleRef.current?.focus();
          }
        }}
      >
        {content.text}
      </HeadingTag>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        contentEditable
        suppressContentEditableWarning
        className={`
          mt-2 text-lg text-studio-text-muted outline-hidden
          focus:bg-studio-bg/30 rounded px-1 -mx-1
          empty:before:content-['Add_subtitle...'] empty:before:text-studio-text-muted/50
        `}
        onInput={handleSubtitleChange}
      >
        {content.subtitle}
      </p>

      {/* Anchor link */}
      {content.anchor && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}#${content.anchor}`;
              navigator.clipboard.writeText(url);
            }}
            className="p-1.5 rounded text-studio-text-muted hover:text-studio-accent hover:bg-studio-surface/50 transition-colors"
            title="Copy link to heading"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default HeadingBlock;
