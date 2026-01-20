'use client';

/**
 * FlipCardBlock - Click-to-reveal two-sided card
 */

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FlipCardConfig, FlipCardContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface FlipCardBlockProps {
  id: string;
  content: FlipCardContent;
  config: FlipCardConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: FlipCardContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

export function FlipCardBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: FlipCardBlockProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);

  const handleFlip = () => {
    if (isEditing) return;

    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);

    if (config.trackInteractions) {
      const isFirstFlip = !hasFlipped;
      if (isFirstFlip) {
        setHasFlipped(true);
      }

      onXAPIEvent?.('interacted', {
        action: newFlipped ? 'flipped-to-back' : 'flipped-to-front',
        side: newFlipped ? 'back' : 'front',
        isFirstFlip,
        frontTitle: content.front.title,
        backTitle: content.back.title,
        completed: true, // Flipping reveals both sides
      });
    }
  };

  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:4': 'aspect-[3/4]',
    auto: '',
  };

  const updateSide = (side: 'front' | 'back', updates: Partial<FlipCardContent['front']>) => {
    onContentChange?.({
      ...content,
      [side]: { ...content[side], ...updates },
    });
  };

  return (
    <BlockWrapper
      id={id}
      type="Flip Card"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <button
        type="button"
        className={cn(
          'relative w-full max-w-md mx-auto cursor-pointer perspective-1000',
          aspectRatioClasses[config.aspectRatio || '4:3'],
          config.aspectRatio === 'auto' && 'min-h-50',
        )}
        onClick={handleFlip}
        onMouseEnter={() => config.flipTrigger === 'hover' && !isFlipped && handleFlip()}
        onMouseLeave={() => config.flipTrigger === 'hover' && isFlipped && handleFlip()}
        aria-label={isFlipped ? 'Flip card to front' : 'Flip card to back'}
      >
        <div
          className={cn(
            'relative w-full h-full transition-transform preserve-3d',
            isFlipped && (config.flipDirection === 'vertical' ? 'rotate-x-180' : 'rotate-y-180'),
          )}
          style={{
            transitionDuration: `${config.animationDuration || 600}ms`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front face */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-xl border border-border',
              'flex flex-col items-center justify-center p-6 text-center',
              'bg-linear-to-br from-card to-card/50',
            )}
            style={{
              backgroundColor: content.front.backgroundColor,
              backfaceVisibility: 'hidden',
            }}
          >
            {content.front.image && (
              <Image
                src={content.front.image.src}
                alt={content.front.image.alt}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg mb-4"
              />
            )}
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={content.front.title || ''}
                  onChange={(e) => updateSide('front', { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Front title..."
                  className="text-lg font-semibold bg-transparent text-center outline-hidden border-b border-transparent focus:border-cyan-500 mb-2 w-full"
                />
                <textarea
                  value={content.front.content}
                  onChange={(e) => updateSide('front', { content: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Front content..."
                  rows={3}
                  className="text-sm text-muted-foreground bg-transparent text-center outline-hidden resize-none w-full"
                />
              </>
            ) : (
              <>
                {content.front.title && (
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {content.front.title}
                  </h3>
                )}
                <p className="text-muted-foreground">{content.front.content}</p>
              </>
            )}

            {!isEditing && (
              <div className="absolute bottom-3 text-xs text-muted-foreground/60">
                {config.flipTrigger === 'hover' ? 'Hover to flip' : 'Click to flip'}
              </div>
            )}
          </div>

          {/* Back face */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-xl border border-border',
              'flex flex-col items-center justify-center p-6 text-center',
              'bg-linear-to-br from-cyan-500/10 to-purple-500/10',
              config.flipDirection === 'vertical' ? 'rotate-x-180' : 'rotate-y-180',
            )}
            style={{
              backgroundColor: content.back.backgroundColor,
              backfaceVisibility: 'hidden',
            }}
          >
            {content.back.image && (
              <Image
                src={content.back.image.src}
                alt={content.back.image.alt}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg mb-4"
              />
            )}
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={content.back.title || ''}
                  onChange={(e) => updateSide('back', { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Back title..."
                  className="text-lg font-semibold bg-transparent text-center outline-hidden border-b border-transparent focus:border-cyan-500 mb-2 w-full"
                />
                <textarea
                  value={content.back.content}
                  onChange={(e) => updateSide('back', { content: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Back content..."
                  rows={3}
                  className="text-sm text-muted-foreground bg-transparent text-center outline-hidden resize-none w-full"
                />
              </>
            ) : (
              <>
                {content.back.title && (
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {content.back.title}
                  </h3>
                )}
                <p className="text-foreground">{content.back.content}</p>
              </>
            )}

            {!isEditing && (
              <div className="absolute bottom-3 text-xs text-muted-foreground/60">
                {config.flipTrigger === 'hover' ? 'Move away to flip back' : 'Click to flip back'}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* CSS for 3D transforms */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .rotate-x-180 {
          transform: rotateX(180deg);
        }
      `}</style>
    </BlockWrapper>
  );
}
