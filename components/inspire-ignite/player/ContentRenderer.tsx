'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { ContentBlock } from '@/lib/inspire/types/contentBlocks';
import { sanitizeRichText } from '@/lib/sanitize';

interface ContentRendererProps {
  blocks: ContentBlock[];
  currentBlockIndex: number;
  onBlockComplete: (blockId: string) => void;
  onInteraction: (type: string, blockId: string, data?: unknown) => void;
}

export function ContentRenderer({
  blocks,
  currentBlockIndex,
  onBlockComplete,
  onInteraction,
}: ContentRendererProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to current block when it changes
  useEffect(() => {
    const currentBlock = containerRef.current?.querySelector(
      `[data-block-index="${currentBlockIndex}"]`,
    );
    currentBlock?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentBlockIndex]);

  const renderBlock = (block: ContentBlock, index: number): React.JSX.Element => {
    const isActive = index === currentBlockIndex;
    const isPast = index < currentBlockIndex;

    const blockClasses = `
      transition-all duration-300 mb-6
      ${isActive ? 'scale-100 opacity-100' : 'scale-98 opacity-70'}
      ${isPast ? 'opacity-50' : ''}
    `;

    switch (block.type) {
      case 'heading': {
        const content = block.content as { text?: string; level?: number };
        const headingText = String(content.text || 'Heading');
        const level = content.level || 1;
        const headingClassName = `font-bold text-lxd-text-dark-heading ${
          level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : level === 3 ? 'text-xl' : 'text-lg'
        }`;
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            {level === 1 && <h1 className={headingClassName}>{headingText}</h1>}
            {level === 2 && <h2 className={headingClassName}>{headingText}</h2>}
            {level === 3 && <h3 className={headingClassName}>{headingText}</h3>}
            {level === 4 && <h4 className={headingClassName}>{headingText}</h4>}
            {level === 5 && <h5 className={headingClassName}>{headingText}</h5>}
            {level === 6 && <h6 className={headingClassName}>{headingText}</h6>}
          </div>
        );
      }

      case 'text': {
        const textContent = block.content as { text?: string };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="prose prose-lg max-w-none text-lxd-text-dark-body">
              {String(textContent.text || '')}
            </div>
          </div>
        );
      }

      case 'richtext': {
        const richContent = block.content as { html?: string };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div
              className="prose prose-lg max-w-none text-lxd-text-dark-body"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(String(richContent.html || '')) }}
            />
          </div>
        );
      }

      case 'image': {
        const imgContent = block.content as { url?: string; alt?: string; caption?: string };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <figure className="my-4">
              <Image
                src={String(imgContent.url || '/placeholder-image.jpg')}
                width={800}
                height={600}
                alt={String(imgContent.alt || '')}
                className="w-full rounded-lg shadow-md"
                onLoad={() => onBlockComplete(block.id)}
              />
              {imgContent.caption && (
                <figcaption className="text-sm text-lxd-text-dark-muted mt-2 text-center">
                  {String(imgContent.caption)}
                </figcaption>
              )}
            </figure>
          </div>
        );
      }

      case 'video': {
        const videoContent = block.content as { url?: string };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={String(videoContent.url || '')}
                controls
                className="w-full h-full"
                onEnded={() => onBlockComplete(block.id)}
                onPlay={() => onInteraction('video_play', block.id)}
                onPause={() => onInteraction('video_pause', block.id)}
              >
                <track kind="captions" srcLang="en" label="English captions" />
              </video>
            </div>
          </div>
        );
      }

      case 'quiz': {
        const quizContent = block.content as { question?: string; options?: string[] };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
              <h4 className="font-semibold text-lxd-text-dark-heading mb-4">
                {String(quizContent.question || 'Question')}
              </h4>
              <div className="space-y-2">
                {(quizContent.options || []).map((option: string, i: number) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => onInteraction('answer', block.id, { answer: option, index: i })}
                    className="w-full text-left px-4 py-3 bg-lxd-light-card rounded-lg border border-lxd-light-border hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-lxd-light-card text-sm font-medium mr-3">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'multiple_choice': {
        const mcContent = block.content as {
          question?: string;
          options?: Array<{ id: string; text: string; isCorrect: boolean }>;
        };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
              <h4 className="font-semibold text-lxd-text-dark-heading mb-4">
                {String(mcContent.question || 'Question')}
              </h4>
              <div className="space-y-2">
                {(mcContent.options || []).map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() =>
                      onInteraction('answer', block.id, {
                        answerId: option.id,
                        isCorrect: option.isCorrect,
                      })
                    }
                    className="w-full text-left px-4 py-3 bg-lxd-light-card rounded-lg border border-lxd-light-border hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'flashcard': {
        const fcContent = block.content as { cards?: Array<{ id: string; front: string }> };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="space-y-4">
              {(fcContent.cards || []).map((card) => (
                <button
                  type="button"
                  key={card.id}
                  className="bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-brand-primary min-h-[200px] cursor-pointer hover:shadow-xl transition-shadow text-left w-full"
                  onClick={() => onInteraction('flip', block.id, { cardId: card.id })}
                >
                  <p className="text-lg font-medium">{card.front || 'Click to flip'}</p>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'accordion': {
        const accContent = block.content as {
          items?: Array<{ id: string; title: string; content: string }>;
        };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="border border-lxd-light-border rounded-lg overflow-hidden">
              {(accContent.items || []).map((item) => (
                <details key={item.id} className="group">
                  <summary className="px-4 py-3 bg-lxd-light-card cursor-pointer hover:bg-lxd-light-card font-medium flex items-center justify-between">
                    {item.title}
                    <span className="text-lxd-text-light-muted group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 py-3 text-lxd-text-dark-body">{item.content}</div>
                </details>
              ))}
            </div>
          </div>
        );
      }

      case 'alert': {
        const alertContent = block.content as { type?: string; message?: string };
        const alertStyles: Record<string, string> = {
          info: 'bg-blue-50 border-blue-200 text-blue-800',
          warning: 'bg-amber-50 border-amber-200 text-amber-800',
          success: 'bg-green-50 border-green-200 text-green-800',
          error: 'bg-red-50 border-red-200 text-red-800',
        };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div
              className={`rounded-lg border-l-4 p-4 ${alertStyles[alertContent.type || 'info']}`}
            >
              <p className="text-sm">{String(alertContent.message || '')}</p>
            </div>
          </div>
        );
      }

      case 'code': {
        const codeContent = block.content as { language?: string; code?: string };
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="bg-lxd-dark-page rounded-lg overflow-hidden">
              {codeContent.language && (
                <div className="px-4 py-2 bg-lxd-dark-card text-lxd-text-light-muted text-xs font-mono">
                  {String(codeContent.language)}
                </div>
              )}
              <pre className="p-4 overflow-x-auto">
                <code className="text-lxd-text-light text-sm font-mono">
                  {String(codeContent.code || '// Code here')}
                </code>
              </pre>
            </div>
          </div>
        );
      }

      case 'divider':
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <hr className="border-lxd-light-border my-8" />
          </div>
        );

      default:
        return (
          <div key={block.id} data-block-index={index} className={blockClasses}>
            <div className="bg-lxd-light-card rounded-lg p-4 text-lxd-text-dark-muted text-sm">
              Unsupported block type: {(block as ContentBlock).type}
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 py-8">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
