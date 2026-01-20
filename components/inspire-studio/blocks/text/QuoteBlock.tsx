'use client';

import { Quote as QuoteIcon, User } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef } from 'react';
import type { QuoteBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const QUOTE_VARIANTS = {
  default: 'border-l-4 border-studio-accent pl-6 py-2',
  large: 'text-2xl italic text-center py-8',
  bordered: 'border-2 border-studio-surface rounded-xl p-6',
  filled: 'bg-studio-surface/30 rounded-xl p-6',
};

/**
 * QuoteBlock - Styled blockquote with attribution
 */
export function QuoteBlock({ block, isEditing, onUpdate }: BlockComponentProps<QuoteBlockContent>) {
  const content = block.content as QuoteBlockContent;
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  const variant = content.variant || 'default';

  // Handle quote text change
  const handleQuoteChange = useCallback(() => {
    if (quoteRef.current) {
      onUpdate({
        content: {
          ...content,
          text: quoteRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Handle author change
  const handleAuthorChange = useCallback(() => {
    if (authorRef.current) {
      onUpdate({
        content: {
          ...content,
          author: authorRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Handle title change
  const handleTitleChange = useCallback(() => {
    if (titleRef.current) {
      onUpdate({
        content: {
          ...content,
          authorTitle: titleRef.current.textContent || '',
        },
      });
    }
  }, [content, onUpdate]);

  // Preview mode
  if (!isEditing) {
    return (
      <figure className={QUOTE_VARIANTS[variant]}>
        {/* Quote icon for large variant */}
        {variant === 'large' && (
          <QuoteIcon className="w-12 h-12 text-studio-accent/30 mx-auto mb-4" />
        )}

        {/* Quote text */}
        <blockquote className={`text-studio-text ${variant === 'large' ? 'text-2xl' : 'text-lg'}`}>
          "{content.text || 'Quote text'}"
        </blockquote>

        {/* Attribution */}
        {(content.author || content.authorTitle) && (
          <figcaption className="mt-4 flex items-center gap-3">
            {content.authorAvatar ? (
              <Image
                src={content.authorAvatar}
                alt={content.author || ''}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-studio-surface flex items-center justify-center">
                <User className="w-5 h-5 text-studio-text-muted" />
              </div>
            )}
            <div>
              <span className="text-brand-primary font-medium">{content.author}</span>
              {content.authorTitle && (
                <span className="block text-sm text-studio-text-muted">{content.authorTitle}</span>
              )}
            </div>
          </figcaption>
        )}

        {/* Citation */}
        {content.citation && (
          <cite className="block mt-2 text-sm text-studio-text-muted not-italic">
            Source: {content.citation}
          </cite>
        )}
      </figure>
    );
  }

  return (
    <div className="relative">
      {/* Variant selector */}
      <div className="flex gap-1 mb-4">
        {(Object.keys(QUOTE_VARIANTS) as Array<keyof typeof QUOTE_VARIANTS>).map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onUpdate({ content: { ...content, variant: v } })}
            className={`
              px-3 py-1.5 text-xs rounded-lg transition-colors
              ${
                variant === v
                  ? 'bg-studio-accent text-brand-primary'
                  : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
              }
            `}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <figure className={QUOTE_VARIANTS[variant]}>
        {/* Quote icon for large variant */}
        {variant === 'large' && (
          <QuoteIcon className="w-12 h-12 text-studio-accent/30 mx-auto mb-4" />
        )}

        {/* Quote text - editable */}
        <blockquote
          ref={quoteRef}
          contentEditable
          suppressContentEditableWarning
          className={`
            text-studio-text outline-hidden
            ${variant === 'large' ? 'text-2xl text-center' : 'text-lg'}
            focus:bg-studio-bg/30 rounded px-1 -mx-1
            empty:before:content-['"Add_quote_text..."'] empty:before:text-studio-text-muted
          `}
          onInput={handleQuoteChange}
        >
          {content.text}
        </blockquote>

        {/* Attribution - editable */}
        <figcaption className="mt-4 flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-studio-surface flex items-center justify-center cursor-pointer hover:bg-studio-surface/70 transition-colors">
            {content.authorAvatar ? (
              <Image
                src={content.authorAvatar}
                alt={content.author || ''}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-studio-text-muted" />
            )}
          </div>

          <div className="flex-1">
            {/* Author name */}
            <span
              ref={authorRef}
              contentEditable
              suppressContentEditableWarning
              className="block text-brand-primary font-medium outline-hidden focus:bg-studio-bg/30 rounded px-1 -mx-1 empty:before:content-['Author_name'] empty:before:text-studio-text-muted"
              onInput={handleAuthorChange}
            >
              {content.author}
            </span>

            {/* Author title */}
            <span
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              className="block text-sm text-studio-text-muted outline-hidden focus:bg-studio-bg/30 rounded px-1 -mx-1 empty:before:content-['Title/Role'] empty:before:text-studio-text-muted/50"
              onInput={handleTitleChange}
            >
              {content.authorTitle}
            </span>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

export default QuoteBlock;
