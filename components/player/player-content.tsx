'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import type { CourseSlide } from '@/types/player';

interface PlayerContentProps {
  slide: CourseSlide;
  slideIndex: number;
  totalSlides: number;
  isPlaying: boolean;
  onNext: () => void;
  onPrev: () => void;
  reducedMotion: boolean;
}

export function PlayerContent({
  slide,
  slideIndex,
  totalSlides,
  onNext,
  onPrev,
  reducedMotion,
}: PlayerContentProps) {
  const content = slide.content_data;

  const slideVariants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
      };

  return (
    <div className="relative flex flex-1 flex-col bg-[var(--hud-bg)]">
      {/* Main Content Area */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
          >
            {/* Slide Content */}
            <div className="relative w-full max-w-5xl">
              <div className="rounded-xl border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)]/60 p-6 md:p-10 backdrop-blur-xs">
                {/* Badge for slide type */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--hud-accent)]/10 border border-[var(--hud-accent)]/20 px-3 py-1 text-xs font-medium text-[var(--hud-accent-bright)]">
                  {slide.content_type === 'quiz' && <CheckCircle2 className="h-3 w-3" />}
                  {slide.content_type === 'interactive' && <Lightbulb className="h-3 w-3" />}
                  <span className="capitalize">{slide.content_type}</span>
                </div>

                {/* Heading */}
                {content.heading && (
                  <h2 className="mb-4 text-2xl font-bold text-[var(--hud-text)] md:text-4xl text-balance leading-tight">
                    {content.heading}
                  </h2>
                )}

                {/* Subheading */}
                {content.subheading && (
                  <p className="mb-6 text-base md:text-lg text-[var(--hud-accent-bright)] font-medium">
                    {content.subheading}
                  </p>
                )}

                {/* Body */}
                {content.body && (
                  <div className="mb-6 text-sm md:text-base leading-relaxed text-[var(--hud-text)]/90 space-y-4">
                    {content.body.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {/* Features/Key Points/Tips */}
                {(content.features ||
                  content.key_points ||
                  content.tips ||
                  content.examples ||
                  content.action_items) && (
                  <ul className="mb-6 space-y-2">
                    {(
                      content.features ||
                      content.key_points ||
                      content.tips ||
                      content.examples ||
                      content.action_items
                    )?.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[var(--hud-text)]/70">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--hud-accent)] shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Quiz Content */}
                {slide.content_type === 'quiz' && content.questions && (
                  <div className="space-y-6">
                    {content.questions.map((q, qi) => (
                      <div
                        key={q.id}
                        className="rounded-lg bg-[var(--hud-bg)]/80 p-4 border border-[var(--hud-border)]"
                      >
                        <p className="mb-3 font-medium text-[var(--hud-text)]">
                          {qi + 1}. {q.question}
                        </p>
                        <div className="grid gap-2">
                          {q.options.map((option, oi) => (
                            <button
                              type="button"
                              key={oi}
                              className="rounded-lg border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)]/60 px-4 py-2 text-left text-sm text-[var(--hud-text)]/80 transition-colors hover:border-[var(--hud-accent)]/50 hover:bg-[var(--hud-accent)]/10"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Celebration for completion */}
                {content.celebration && (
                  <div className="mt-6 flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.3 }}
                      className="rounded-full bg-linear-to-r from-[var(--hud-accent)] to-teal-400 px-6 py-3 text-sm font-semibold text-[var(--hud-bg)] shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                    >
                      Course Completed!
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={onPrev}
          disabled={slideIndex === 0}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[var(--hud-bg-secondary)]/90 text-[var(--hud-text)] border border-[var(--hud-border)] backdrop-blur-xs hover:bg-[var(--hud-accent)]/15 hover:border-[var(--hud-accent)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={slideIndex === totalSlides - 1}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[var(--hud-bg-secondary)]/90 text-[var(--hud-text)] border border-[var(--hud-border)] backdrop-blur-xs hover:bg-[var(--hud-accent)]/15 hover:border-[var(--hud-accent)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
    </div>
  );
}
