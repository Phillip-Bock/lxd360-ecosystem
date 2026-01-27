'use client';

/**
 * CarouselBlock - Image/content carousel with navigation
 */

import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { CarouselConfig, CarouselContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface CarouselBlockProps {
  id: string;
  content: CarouselContent;
  config: CarouselConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: CarouselContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

export function CarouselBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: CarouselBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));

  const totalSlides = content.items.length;
  const showNavigation = config.showNavigation !== false;
  const showIndicators = config.showIndicators !== false;

  const goToSlide = useCallback(
    (index: number) => {
      const newIndex = config.loop
        ? (index + totalSlides) % totalSlides
        : Math.max(0, Math.min(index, totalSlides - 1));

      setCurrentIndex(newIndex);

      if (config.trackInteractions) {
        const isFirstView = !viewedSlides.has(newIndex);
        setViewedSlides((prev) => new Set([...prev, newIndex]));

        onXAPIEvent?.('interacted', {
          slideIndex: newIndex,
          slideTitle: content.items[newIndex]?.title,
          action: 'navigated',
          isFirstView,
          totalSlides,
          viewedSlides: viewedSlides.size + (isFirstView ? 1 : 0),
          progress: (viewedSlides.size + (isFirstView ? 1 : 0)) / totalSlides,
        });
      }
    },
    [config.loop, config.trackInteractions, totalSlides, viewedSlides, content.items, onXAPIEvent],
  );

  const goNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (!config.autoPlay || isEditing) return;

    const interval = setInterval(() => {
      goNext();
    }, config.autoPlayInterval || 5000);

    return () => clearInterval(interval);
  }, [config.autoPlay, config.autoPlayInterval, isEditing, goNext]);

  const updateItem = (index: number, updates: Partial<CarouselContent['items'][0]>) => {
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], ...updates };
    onContentChange?.({ items: newItems });
  };

  const addItem = () => {
    const newId = `slide-${Date.now()}`;
    onContentChange?.({
      items: [...content.items, { id: newId, title: 'New Slide', content: 'Add content here...' }],
    });
    // Navigate to newly added slide
    setTimeout(() => setCurrentIndex(content.items.length), 0);
  };

  const removeItem = (index: number) => {
    if (content.items.length <= 1) return;
    const newItems = content.items.filter((_, i) => i !== index);
    onContentChange?.({ items: newItems });
    if (currentIndex >= newItems.length) {
      setCurrentIndex(newItems.length - 1);
    }
  };

  const currentItem = content.items[currentIndex];

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <BlockWrapper
      id={id}
      type="Carousel"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <section
        className="relative"
        onKeyDown={handleKeyDown}
        aria-roledescription="carousel"
        aria-label="Content carousel"
      >
        {/* Slide content */}
        <figure
          className="relative overflow-hidden rounded-lg bg-card/50 min-h-[200px]"
          aria-label={`Slide ${currentIndex + 1} of ${totalSlides}`}
        >
          {currentItem?.image && (
            <div className="relative h-48 w-full">
              <Image
                src={currentItem.image}
                alt={currentItem.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentItem?.title || ''}
                    onChange={(e) => updateItem(currentIndex, { title: e.target.value })}
                    className="flex-1 bg-transparent text-lg font-semibold outline-hidden border-b border-transparent focus:border-cyan-500"
                    placeholder="Slide title"
                  />
                  {content.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(currentIndex)}
                      className="p-1 text-red-500 hover:text-red-400"
                      aria-label="Remove slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={currentItem?.image || ''}
                  onChange={(e) => updateItem(currentIndex, { image: e.target.value })}
                  className="w-full bg-background px-3 py-2 rounded border border-border text-sm outline-hidden focus:border-cyan-500"
                  placeholder="Image URL (optional)"
                />
                <textarea
                  value={currentItem?.content || ''}
                  onChange={(e) => updateItem(currentIndex, { content: e.target.value })}
                  rows={3}
                  className="w-full bg-background px-3 py-2 rounded border border-border outline-hidden focus:border-cyan-500 resize-y text-sm"
                  placeholder="Slide content"
                />
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">{currentItem?.title}</h3>
                <p className="text-muted-foreground">{currentItem?.content}</p>
              </>
            )}
          </div>
        </figure>

        {/* Navigation arrows */}
        {showNavigation && totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={!config.loop && currentIndex === 0}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full',
                'bg-background/80 backdrop-blur-xs border border-border',
                'hover:bg-background transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!config.loop && currentIndex === totalSlides - 1}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full',
                'bg-background/80 backdrop-blur-xs border border-border',
                'hover:bg-background transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && totalSlides > 1 && (
          <div
            className="flex justify-center gap-2 mt-4"
            role="tablist"
            aria-label="Carousel navigation"
          >
            {content.items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSlide(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-[var(--color-lxd-primary)] w-6'
                    : 'bg-border hover:bg-muted-foreground',
                )}
              />
            ))}
          </div>
        )}

        {/* Add slide button (editing mode) */}
        {isEditing && (
          <button
            type="button"
            onClick={addItem}
            className="mt-3 w-full py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        )}
      </section>
    </BlockWrapper>
  );
}
