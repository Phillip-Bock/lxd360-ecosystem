'use client';

/**
 * =============================================================================
 * INSPIRE Studio - Slide Renderer Component
 * =============================================================================
 *
 * Renders individual slides with blocks, handles transitions, and manages
 * block-level interactions. Integrates with timeline for animation playback.
 *
 * @module components/studio/player/slide-renderer
 * @version 1.0.0
 */

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/providers/player-provider';
import type { BlockInstance } from '@/types/blocks';
import type { PlayerMode, PlayerSlide } from '@/types/studio/player';
import { DEFAULT_SLIDE_TRANSITION } from '@/types/studio/player';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface SlideRendererProps {
  slide: PlayerSlide;
  mode: PlayerMode;
  onBlockInteraction?: (blockId: string, eventType: string, data?: Record<string, unknown>) => void;
  className?: string;
}

interface BlockWrapperProps {
  block: BlockInstance;
  mode: PlayerMode;
  onInteraction?: (eventType: string, data?: Record<string, unknown>) => void;
}

// =============================================================================
// BLOCK WRAPPER
// =============================================================================

function BlockWrapper({ block, mode, onInteraction }: BlockWrapperProps) {
  const player = usePlayerContext();
  const blockRef = useRef<HTMLDivElement>(null);

  // Get object state if applicable
  const objectState = player.getObjectState(block.id);

  // Apply object state styles
  const stateStyles = useMemo(() => {
    if (!objectState) return {};
    // State styles would be looked up from state definitions
    return {};
  }, [objectState]);

  // Track interactions via event delegation - the wrapper is presentational,
  // actual interactive elements are inside the BlockRenderer
  useEffect(() => {
    const element = blockRef.current;
    if (!element) return;

    const handleBlockClick = () => {
      onInteraction?.('click', { blockId: block.id, blockType: block.type });
    };
    const handleBlockMouseEnter = () => {
      onInteraction?.('mouse-enter', { blockId: block.id });
    };
    const handleBlockMouseLeave = () => {
      onInteraction?.('mouse-leave', { blockId: block.id });
    };

    element.addEventListener('click', handleBlockClick);
    element.addEventListener('mouseenter', handleBlockMouseEnter);
    element.addEventListener('mouseleave', handleBlockMouseLeave);

    return () => {
      element.removeEventListener('click', handleBlockClick);
      element.removeEventListener('mouseenter', handleBlockMouseEnter);
      element.removeEventListener('mouseleave', handleBlockMouseLeave);
    };
  }, [block.id, block.type, onInteraction]);

  return (
    <div
      ref={blockRef}
      className={cn(
        'player-block',
        mode === 'preview' &&
          'outline-dashed outline-1 outline-transparent hover:outline-blue-500/30',
      )}
      data-block-id={block.id}
      data-block-type={block.type}
      data-object-state={objectState || undefined}
      style={stateStyles}
    >
      <BlockRenderer block={block} mode={mode} />
    </div>
  );
}

// =============================================================================
// BLOCK RENDERER - Renders actual block content
// =============================================================================

interface BlockRendererProps {
  block: BlockInstance;
  mode: PlayerMode;
}

function BlockRenderer({ block, mode }: BlockRendererProps) {
  // Render based on block type
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock content={block.content} config={block.config} />;

    case 'image':
      return <ImageBlock content={block.content} config={block.config} />;

    case 'video':
      return <VideoBlock content={block.content} config={block.config} mode={mode} />;

    case 'quote':
      return <QuoteBlock content={block.content} config={block.config} />;

    case 'list':
      return <ListBlock content={block.content} config={block.config} />;

    case 'mc-question':
      return <MCQuestionBlock blockId={block.id} content={block.content} config={block.config} />;

    case 'fitb-question':
      return <FITBQuestionBlock blockId={block.id} content={block.content} config={block.config} />;

    case 'accordion':
      return <AccordionBlock content={block.content} config={block.config} />;

    case 'tabs':
      return <TabsBlock content={block.content} config={block.config} />;

    case 'flip-card':
      return <FlipCardBlock content={block.content} config={block.config} />;

    default:
      return (
        <div className="p-4 bg-muted/20 rounded-sm">
          <p className="text-sm text-muted-foreground">Unsupported block type: {block.type}</p>
        </div>
      );
  }
}

// =============================================================================
// INDIVIDUAL BLOCK COMPONENTS
// =============================================================================

function ParagraphBlock({ content, config }: { content: unknown; config: unknown }) {
  const para = content as { text: string };
  const cfg = config as { alignment?: string; size?: string };

  return (
    <p
      className={cn(
        'leading-relaxed',
        cfg.alignment === 'center' && 'text-center',
        cfg.alignment === 'right' && 'text-right',
        cfg.size === 'small' && 'text-sm',
        cfg.size === 'large' && 'text-lg',
        cfg.size === 'lead' && 'text-xl font-medium',
      )}
    >
      {para.text}
    </p>
  );
}

function ImageBlock({ content, config }: { content: unknown; config: unknown }) {
  const img = content as { src: string; alt: string; caption?: string };
  const cfg = config as { sizing?: string; borderRadius?: string };

  return (
    <figure className="flex flex-col gap-2">
      <div
        className={cn(
          'relative',
          cfg.sizing === 'full-width' ? 'w-full aspect-video' : 'w-auto',
          cfg.borderRadius === 'small' && 'rounded-sm overflow-hidden',
          cfg.borderRadius === 'medium' && 'rounded-sm overflow-hidden',
          cfg.borderRadius === 'large' && 'rounded-lg overflow-hidden',
        )}
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill={cfg.sizing === 'full-width'}
          width={cfg.sizing !== 'full-width' ? 800 : undefined}
          height={cfg.sizing !== 'full-width' ? 600 : undefined}
          className="object-contain"
          sizes={cfg.sizing === 'full-width' ? '100vw' : '800px'}
        />
      </div>
      {img.caption && (
        <figcaption className="text-sm text-muted-foreground text-center">{img.caption}</figcaption>
      )}
    </figure>
  );
}

function VideoBlock({
  content,
  config,
  mode,
}: {
  content: unknown;
  config: unknown;
  mode: PlayerMode;
}) {
  const video = content as { src: string; title: string; poster?: string };
  const cfg = config as { autoplay?: boolean; controls?: boolean; muted?: boolean };
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative aspect-video bg-black rounded-sm overflow-hidden">
      <video
        ref={videoRef}
        src={video.src}
        poster={video.poster}
        controls={cfg.controls !== false}
        muted={cfg.muted || cfg.autoplay}
        autoPlay={cfg.autoplay && mode === 'player'}
        className="w-full h-full object-contain"
        title={video.title}
      />
    </div>
  );
}

function QuoteBlock({ content, config }: { content: unknown; config: unknown }) {
  const quote = content as { text: string; attribution?: string };
  const cfg = config as { variant?: string; showQuoteMarks?: boolean };

  return (
    <blockquote
      className={cn(
        'relative pl-4 border-l-2 border-primary/50 italic',
        cfg.variant === 'highlighted' && 'bg-primary/5 p-4 rounded-sm border-l-4',
      )}
    >
      {cfg.showQuoteMarks && (
        <span className="absolute -top-2 -left-1 text-4xl text-primary/20">"</span>
      )}
      <p className="text-lg">{quote.text}</p>
      {quote.attribution && (
        <footer className="mt-2 text-sm text-muted-foreground not-italic">
          — {quote.attribution}
        </footer>
      )}
    </blockquote>
  );
}

function ListBlock({ content, config }: { content: unknown; config: unknown }) {
  const list = content as { listType: string; items: Array<{ text: string; checked?: boolean }> };
  const cfg = config as { spacing?: string };

  const ListTag = list.listType === 'number' ? 'ol' : 'ul';

  return (
    <ListTag
      className={cn(
        'pl-6',
        list.listType === 'bullet' && 'list-disc',
        list.listType === 'number' && 'list-decimal',
        cfg.spacing === 'compact' && 'space-y-1',
        cfg.spacing === 'relaxed' && 'space-y-3',
      )}
    >
      {list.items.map((item, index) => (
        <li key={index} className="leading-relaxed">
          {list.listType === 'check' ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                readOnly
                className="rounded-sm border-muted"
              />
              <span>{item.text}</span>
            </label>
          ) : (
            item.text
          )}
        </li>
      ))}
    </ListTag>
  );
}

function MCQuestionBlock({
  blockId,
  content,
  config,
}: {
  blockId: string;
  content: unknown;
  config: unknown;
}) {
  const player = usePlayerContext();
  const question = content as {
    question: string;
    choices: Array<{ id: string; text: string; correct: boolean }>;
    feedback?: { correct: string; incorrect: string };
  };
  const cfg = config as { shuffleChoices?: boolean; immediateFeedback?: boolean };

  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = useCallback(() => {
    const correctIds = question.choices.filter((c) => c.correct).map((c) => c.id);
    const correct =
      selected.length === correctIds.length && selected.every((id) => correctIds.includes(id));

    setIsCorrect(correct);
    setSubmitted(true);

    // Report to player
    player.submitAnswer(blockId, selected, correct, correct ? 1 : 0, 1);
  }, [blockId, player, question.choices, selected]);

  return (
    <div className="space-y-4">
      <p className="font-medium">{question.question}</p>

      <div className="space-y-2">
        {question.choices.map((choice) => (
          <label
            key={choice.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors',
              selected.includes(choice.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              submitted && choice.correct && 'border-green-500 bg-green-500/10',
              submitted &&
                selected.includes(choice.id) &&
                !choice.correct &&
                'border-red-500 bg-red-500/10',
            )}
          >
            <input
              type="checkbox"
              checked={selected.includes(choice.id)}
              onChange={(e) => {
                if (submitted) return;
                if (e.target.checked) {
                  setSelected([...selected, choice.id]);
                } else {
                  setSelected(selected.filter((id) => id !== choice.id));
                }
              }}
              disabled={submitted}
              className="rounded-sm"
            />
            <span>{choice.text}</span>
          </label>
        ))}
      </div>

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50"
        >
          Submit
        </button>
      )}

      {submitted && cfg.immediateFeedback && question.feedback && (
        <div
          className={cn(
            'p-3 rounded-sm',
            isCorrect ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700',
          )}
        >
          {isCorrect ? question.feedback.correct : question.feedback.incorrect}
        </div>
      )}
    </div>
  );
}

function FITBQuestionBlock({
  blockId,
  content,
  config,
}: {
  blockId: string;
  content: unknown;
  config: unknown;
}) {
  const player = usePlayerContext();
  const question = content as {
    template: string;
    blanks: Array<{ id: string; acceptedAnswers: string[]; placeholder?: string }>;
    feedback?: { correct: string; incorrect: string };
  };
  const cfg = config as { caseSensitive?: boolean };

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleSubmit = useCallback(() => {
    const newResults: Record<string, boolean> = {};
    let allCorrect = true;

    for (const blank of question.blanks) {
      const userAnswer = answers[blank.id] || '';
      const isCorrect = blank.acceptedAnswers.some((accepted) =>
        cfg.caseSensitive
          ? userAnswer === accepted
          : userAnswer.toLowerCase() === accepted.toLowerCase(),
      );
      newResults[blank.id] = isCorrect;
      if (!isCorrect) allCorrect = false;
    }

    setResults(newResults);
    setSubmitted(true);

    player.submitAnswer(
      blockId,
      answers,
      allCorrect,
      Object.values(newResults).filter(Boolean).length,
      question.blanks.length,
    );
  }, [blockId, player, question.blanks, answers, cfg.caseSensitive]);

  // Parse template and replace blanks with inputs
  const renderTemplate = () => {
    const parts = question.template.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        const blank = question.blanks.find((b) => b.id === blankId);

        return (
          <input
            key={index}
            type="text"
            value={answers[blankId] || ''}
            onChange={(e) => setAnswers({ ...answers, [blankId]: e.target.value })}
            placeholder={blank?.placeholder || ''}
            disabled={submitted}
            className={cn(
              'inline-block w-32 px-2 py-1 mx-1 border rounded-sm',
              submitted && results[blankId] && 'border-green-500 bg-green-500/10',
              submitted && !results[blankId] && 'border-red-500 bg-red-500/10',
            )}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <p className="leading-relaxed">{renderTemplate()}</p>

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
        >
          Submit
        </button>
      )}

      {submitted && question.feedback && (
        <div
          className={cn(
            'p-3 rounded-sm',
            Object.values(results).every(Boolean)
              ? 'bg-green-500/10 text-green-700'
              : 'bg-red-500/10 text-red-700',
          )}
        >
          {Object.values(results).every(Boolean)
            ? question.feedback.correct
            : question.feedback.incorrect}
        </div>
      )}
    </div>
  );
}

function AccordionBlock({ content, config }: { content: unknown; config: unknown }) {
  const accordion = content as {
    panels: Array<{ id: string; title: string; content: string; defaultExpanded?: boolean }>;
  };
  const cfg = config as { allowMultiple?: boolean };

  const [expanded, setExpanded] = useState<string[]>(
    accordion.panels.filter((p) => p.defaultExpanded).map((p) => p.id),
  );

  const togglePanel = (panelId: string) => {
    if (cfg.allowMultiple) {
      setExpanded(
        expanded.includes(panelId)
          ? expanded.filter((id) => id !== panelId)
          : [...expanded, panelId],
      );
    } else {
      setExpanded(expanded.includes(panelId) ? [] : [panelId]);
    }
  };

  return (
    <div className="divide-y border rounded-sm">
      {accordion.panels.map((panel) => (
        <div key={panel.id}>
          <button
            type="button"
            onClick={() => togglePanel(panel.id)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50"
          >
            <span className="font-medium">{panel.title}</span>
            <span
              className={cn('transition-transform', expanded.includes(panel.id) && 'rotate-180')}
            >
              ▼
            </span>
          </button>
          {expanded.includes(panel.id) && (
            <div className="p-4 pt-0">
              <p className="text-muted-foreground">{panel.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TabsBlock({ content, config }: { content: unknown; config: unknown }) {
  const tabs = content as {
    tabs: Array<{ id: string; label: string; content: string }>;
    defaultTabId?: string;
  };
  const cfg = config as { orientation?: string; variant?: string };

  const [activeTab, setActiveTab] = useState(tabs.defaultTabId || tabs.tabs[0]?.id);

  return (
    <div className={cn('flex gap-4', cfg.orientation === 'vertical' ? 'flex-row' : 'flex-col')}>
      <div
        className={cn(
          'flex gap-1',
          cfg.orientation === 'vertical' ? 'flex-col' : 'flex-row border-b',
        )}
        role="tablist"
      >
        {tabs.tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-4">
        {tabs.tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}

function FlipCardBlock({ content, config }: { content: unknown; config: unknown }) {
  const card = content as {
    front: { title?: string; content: string };
    back: { title?: string; content: string };
  };
  const cfg = config as {
    flipDirection?: string;
    flipTrigger?: string;
    aspectRatio?: string;
  };

  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (cfg.flipTrigger !== 'hover') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (cfg.flipTrigger === 'hover') {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (cfg.flipTrigger === 'hover') {
      setIsFlipped(false);
    }
  };

  const cardLabel = isFlipped
    ? `Flip card showing back: ${card.back.title || card.back.content}. Click to flip to front.`
    : `Flip card showing front: ${card.front.title || card.front.content}. Click to flip to back.`;

  return (
    <button
      type="button"
      className={cn(
        'relative cursor-pointer perspective-1000 w-full text-left',
        cfg.aspectRatio === '1:1' && 'aspect-square',
        cfg.aspectRatio === '4:3' && 'aspect-[4/3]',
        cfg.aspectRatio === '16:9' && 'aspect-video',
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={cardLabel}
      aria-pressed={isFlipped}
    >
      <span
        className={cn(
          'block relative w-full h-full transition-transform duration-500 transform-style-preserve-3d',
          isFlipped && (cfg.flipDirection === 'vertical' ? 'rotate-x-180' : 'rotate-y-180'),
        )}
      >
        {/* Front */}
        <span className="absolute inset-0 backface-hidden bg-card border rounded-lg p-4 flex flex-col items-center justify-center">
          {card.front.title && (
            <span className="font-semibold mb-2 text-base">{card.front.title}</span>
          )}
          <span className="block">{card.front.content}</span>
        </span>

        {/* Back */}
        <span
          className={cn(
            'absolute inset-0 backface-hidden bg-primary text-primary-foreground rounded-lg p-4 flex flex-col items-center justify-center',
            cfg.flipDirection === 'vertical' ? 'rotate-x-180' : 'rotate-y-180',
          )}
        >
          {card.back.title && (
            <span className="font-semibold mb-2 text-base">{card.back.title}</span>
          )}
          <span className="block">{card.back.content}</span>
        </span>
      </span>
    </button>
  );
}

// =============================================================================
// MAIN SLIDE RENDERER
// =============================================================================

export function SlideRenderer({ slide, mode, onBlockInteraction, className }: SlideRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSlideIdRef = useRef<string | null>(null);

  // Handle slide transitions
  useEffect(() => {
    if (prevSlideIdRef.current && prevSlideIdRef.current !== slide.id) {
      setIsTransitioning(true);
      const transition = slide.transition || DEFAULT_SLIDE_TRANSITION;
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, transition.duration);

      return () => clearTimeout(timer);
    }
    prevSlideIdRef.current = slide.id;
  }, [slide.id, slide.transition]);

  // Apply background styles
  const backgroundStyles = useMemo(() => {
    if (!slide.background) return {};

    switch (slide.background.type) {
      case 'color':
        return { backgroundColor: slide.background.value };
      case 'gradient':
        return { background: slide.background.value };
      case 'image':
        return {
          backgroundImage: `url(${slide.background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      default:
        return {};
    }
  }, [slide.background]);

  // Get transition class
  const transitionClass = useMemo(() => {
    if (!isTransitioning) return '';

    const transition = slide.transition || DEFAULT_SLIDE_TRANSITION;

    switch (transition.type) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return transition.direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right';
      case 'zoom':
        return 'animate-zoom-in';
      default:
        return '';
    }
  }, [isTransitioning, slide.transition]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-auto', transitionClass, className)}
      style={backgroundStyles}
      data-slide-id={slide.id}
      data-slide-index={slide.index}
    >
      {/* Slide Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {slide.blocks.map((block) => (
            <BlockWrapper
              key={block.id}
              block={block}
              mode={mode}
              onInteraction={(eventType, data) => onBlockInteraction?.(block.id, eventType, data)}
            />
          ))}
        </div>
      </div>

      {/* Debug info in preview mode */}
      {mode === 'preview' && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-sm">
          Slide {slide.index + 1}: {slide.name || slide.id}
        </div>
      )}
    </div>
  );
}

export default SlideRenderer;
