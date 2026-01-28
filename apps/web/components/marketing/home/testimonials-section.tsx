'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';
import type { Testimonial } from '@/lib/content/types';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface TestimonialsSectionProps {
  badge?: string;
  heading?: string;
  testimonials?: Testimonial[];
}

/* =============================================================================
   TESTIMONIAL DATA CONFIGURATION
============================================================================= */

interface TestimonialData {
  id: number;
  name: string;
  title: string;
  company: string;
  quote: string;
  imageSrc: string;
}

const TESTIMONIALS: TestimonialData[] = [
  {
    id: 1,
    name: 'Dianne',
    title: 'Director of Training & Compliance',
    company: 'Global Logistics',
    quote:
      'The fragmentation tax was crushing us. LXP360 allowed us to consolidate our LMS, LXP, and authoring tool into one subscription. We cut vendor costs by 40% immediately and finally unified our compliance tracking.',
    imageSrc: '/placeholder.jpg',
  },
  {
    id: 2,
    name: 'Sophia',
    title: 'LXD Strategist',
    company: 'Pharmaceuticals R&D',
    quote:
      "The INSPIRE Studio AI is a game-changer. Our scientists now auto-create complex SOP training 50% faster, and the adaptive pathways ensure our staff actually retain procedures for compliance. It's the future of learning science.",
    imageSrc: '/placeholder.jpg',
  },
  {
    id: 3,
    name: 'Marvin',
    title: 'VP of Technology',
    company: 'K-12 School District',
    quote:
      'The Learning Record Store (LRS) provides real-time data on every student click and pause. We use this deep analytics to personalize instruction and drive better standardized test alignment. The transparency is critical.',
    imageSrc: '/placeholder.jpg',
  },
  {
    id: 4,
    name: 'Marcus',
    title: 'Head of Safety & Operations',
    company: 'Energy & Utilities',
    quote:
      'The native VR/AR support is unparalleled. We stream immersive safety simulations directly in the browser—no expensive headsets or external vendors required. It has fundamentally changed our safety training efficiency.',
    imageSrc: '/placeholder.jpg',
  },
  {
    id: 5,
    name: 'Olivia',
    title: 'Chief Learning Officer',
    company: 'Financial Services',
    quote:
      "We partnered with LXD360's consultancy for strategic architectural vision. They helped us link training to our core KPIs and finally prove a verifiable 3x ROI on our leadership programs. L&D is now a strategic engine.",
    imageSrc: '/placeholder.jpg',
  },
  {
    id: 6,
    name: 'Rajneesh',
    title: 'Federal Programs Manager',
    company: 'Defense Consulting',
    quote:
      'We needed a modern, cloud-native platform that met FedRAMP High standards. Partnering with LXD360, a certified SDVOSB, was the strategic choice. They delivered high-security, compliant training that no one else could match.',
    imageSrc: '/placeholder.jpg',
  },
];

/* =============================================================================
   PROGRESS BAR SELECTOR COMPONENT
   Shows auto-advancing progress bars for each testimonial
============================================================================= */

interface SelectBtnsProps {
  numTracks: number;
  selected: number;
  setSelected: (index: number) => void;
}

function SelectBtns({ numTracks, setSelected, selected }: SelectBtnsProps): React.JSX.Element {
  return (
    // WCAG: Added role="tablist" and aria-label for screen reader context
    <div className="flex gap-1 mt-8" role="tablist" aria-label="Testimonial navigation">
      {Array.from(Array(numTracks).keys()).map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => setSelected(n)}
          role="tab"
          aria-selected={selected === n}
          aria-label={`View testimonial ${n + 1} of ${numTracks}`}
          className="h-1.5 w-full bg-muted dark:bg-secondary relative rounded-full overflow-hidden"
        >
          {selected === n ? (
            <motion.span
              className="absolute top-0 left-0 bottom-0 bg-brand-primary dark:bg-brand-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5 }}
              onAnimationComplete={() => {
                setSelected(selected === numTracks - 1 ? 0 : selected + 1);
              }}
            />
          ) : (
            <span
              className="absolute top-0 left-0 bottom-0 bg-brand-primary dark:bg-brand-primary rounded-full"
              style={{ width: selected > n ? '100%' : '0%' }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* =============================================================================
   CARDS CONTAINER COMPONENT
   Container with purple glow border for testimonial cards
============================================================================= */

interface CardsProps {
  testimonials: TestimonialData[];
  selected: number;
}

function Cards({ testimonials, selected }: CardsProps): React.JSX.Element {
  const testimonial = testimonials[selected];
  const isBlue = selected % 2 === 0;
  const background = isBlue
    ? 'bg-linear-to-br from-blue-600 to-blue-700'
    : 'bg-card dark:bg-secondary';
  const textColor = isBlue
    ? 'text-brand-primary'
    : 'text-lxd-text-dark-heading dark:text-brand-primary';
  const subtitleColor = isBlue
    ? 'text-blue-100'
    : 'text-lxd-text-dark-body dark:text-lxd-text-light-muted';

  return (
    <div className="relative h-[450px] md:h-[480px] lg:h-[500px]">
      {/* Purple glow border effect */}
      <div
        className="absolute -inset-1 rounded-[10px] opacity-75 blur-sm"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899, #8b5cf6)',
          backgroundSize: '300% 300%',
          animation: 'shimmer 4s ease-in-out infinite',
        }}
      />
      {/* Inner container - WCAG: aria-live announces testimonial changes to screen readers */}
      <div
        className={`relative h-full rounded-[10px] overflow-hidden border-2 border-brand-secondary/30 ${background}`}
        aria-live="polite"
        aria-atomic="true"
        role="tabpanel"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full p-6 md:p-8 lg:p-12 flex flex-col justify-between"
          >
            {/* Profile image with animated glow border */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto">
              {/* Animated glow border */}
              <div
                className="absolute -inset-1 rounded-[10px] opacity-75 blur-sm"
                style={{
                  background: isBlue
                    ? 'linear-gradient(90deg, #a855f7, #ec4899, #a855f7)'
                    : 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />
              {/* Image container */}
              <div className="relative w-full h-full rounded-[10px] overflow-hidden border-2 border-white/30 shadow-lg">
                <Image
                  src={testimonial.imageSrc}
                  alt={testimonial.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>

            {/* Quote */}
            <p
              className={`text-base md:text-lg lg:text-xl font-light italic my-6 md:my-8 leading-relaxed ${textColor}`}
            >
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Name and title */}
            <div className="text-center">
              <span className={`block font-semibold text-lg ${textColor}`}>{testimonial.name}</span>
              <span className={`block text-sm ${subtitleColor}`}>
                {testimonial.title}, {testimonial.company}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function TestimonialsSection({
  badge,
  // heading: _heading,
  // testimonials: _testimonials,
}: TestimonialsSectionProps) {
  // Note: Content service testimonials can be used to override TESTIMONIALS when available
  const [selected, setSelected] = useState(0);

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-card dark:bg-transparent">
      <div className="container mx-auto px-4">
        {/* Section Badge - centered above content */}
        {badge && (
          <div className="flex justify-center mb-6">
            <SectionBadge>{badge}</SectionBadge>
          </div>
        )}

        <div className="grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* =========================================================================
              LEFT SIDE - Header and Progress Indicators
          ========================================================================= */}
          <div className="p-4">
            {/* Section header */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
              What Our Partners{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
                Achieve
              </span>
            </h2>

            {/* Description paragraph */}
            <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted my-6 leading-relaxed">
              LXD360 is the only platform trusted by CLOs, Federal Managers, and K-12 technologists
              alike because we transform learning from a cost center into a strategic, measurable
              asset. Our clients—from Fortune 500 financial firms to global logistics providers—rely
              on us to eliminate technical silos, achieve verifiable ROI, accelerate safety
              compliance via native VR/AR, and secure high-value government contracts as an SDVOSB
              partner. We guarantee faster, neuroscience-backed skill acquisition and provide the
              transparent analytics needed to prove L&D is driving organizational results.
            </p>

            {/* Progress bar indicators */}
            <SelectBtns
              numTracks={TESTIMONIALS.length}
              setSelected={setSelected}
              selected={selected}
            />
          </div>

          {/* =========================================================================
              RIGHT SIDE - Stacked Testimonial Cards
          ========================================================================= */}
          <Cards testimonials={TESTIMONIALS} selected={selected} />
        </div>
      </div>
    </section>
  );
}
