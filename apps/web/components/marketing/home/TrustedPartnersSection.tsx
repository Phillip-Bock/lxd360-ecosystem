'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { SectionBadge } from '@/components/marketing/shared/SectionBadge';
import type { PartnerLogo } from '@/lib/content/types';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface TrustedPartnersSectionProps {
  badge?: string;
  heading?: string;
  logos?: PartnerLogo[];
}

/* =============================================================================
   PARTNER LOGO DATA
   Arrays of logo paths split between top and bottom rows
============================================================================= */

/**
 * Top row logos - partners 1-18
 * These scroll from right to left
 */
const topRowLogos = [
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
];

/**
 * Bottom row logos - partners 19-36
 * These scroll from left to right (reverse direction)
 */
const bottomRowLogos = [
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
  '/placeholder.jpg',
];

/* =============================================================================
   ANIMATION WRAPPER COMPONENT
   Wraps logo rows and applies infinite scrolling animation
============================================================================= */

interface TranslateWrapperProps {
  children: React.ReactNode;
  reverse?: boolean;
}

/**
 * TranslateWrapper - Applies infinite horizontal scroll animation
 * @param children - Logo items to animate
 * @param reverse - If true, scrolls in opposite direction (right to left becomes left to right)
 */
function TranslateWrapper({ children, reverse = false }: TranslateWrapperProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ translateX: reverse ? '-100%' : '0%' }}
      animate={{ translateX: reverse ? '0%' : '-100%' }}
      transition={{
        duration: 50, // Time for one complete scroll cycle (slower, relaxed pace)
        repeat: Infinity, // Loop forever
        ease: 'linear', // Constant speed (no acceleration)
        repeatType: 'loop', // Seamless loop
      }}
      className="flex gap-8 px-4"
    >
      {children}
    </motion.div>
  );
}

/* =============================================================================
   LOGO ITEM COMPONENT
   Individual partner logo display
============================================================================= */

interface LogoItemProps {
  src: string;
  index: number;
}

/**
 * LogoItem - Displays a single partner logo
 * @param src - Path to the logo image
 * @param index - Index for unique key and alt text
 */
function LogoItem({ src, index }: LogoItemProps): React.JSX.Element {
  return (
    <div className="shrink-0 w-32 h-20 md:w-40 md:h-24 lg:w-44 lg:h-28 flex items-center justify-center rounded-lg bg-card/60 dark:bg-card/[0.03] hover:bg-muted/80 dark:hover:bg-card/10 transition-colors">
      <Image
        src={src}
        alt={`Technology partner ${index + 1}`}
        width={160}
        height={100}
        loading="eager"
        priority={index < 12}
        className="w-full h-full object-contain opacity-85 hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

/* =============================================================================
   LOGO ROW COMPONENTS
   Pre-defined rows of logos for top and bottom carousels
============================================================================= */

/**
 * LogoRowTop - Renders all top row partner logos
 */
function LogoRowTop(): React.JSX.Element {
  return (
    <>
      {topRowLogos.map((src, index) => (
        <LogoItem key={`top-${index}`} src={src} index={index} />
      ))}
    </>
  );
}

/**
 * LogoRowBottom - Renders all bottom row partner logos
 */
function LogoRowBottom(): React.JSX.Element {
  return (
    <>
      {bottomRowLogos.map((src, index) => (
        <LogoItem key={`bottom-${index}`} src={src} index={index + 18} />
      ))}
    </>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function TrustedPartnersSection({
  badge,
  // heading: _heading,
  // logos: _logos,
}: TrustedPartnersSectionProps) {
  // Note: When content service logos are provided, they will be split into top/bottom rows
  // For now, we use local fallback logos since the carousel animation
  // requires a specific setup. Content service integration for logos can be added later.
  return (
    <section className="py-16 md:py-24 overflow-hidden bg-card dark:bg-transparent">
      {badge && (
        <div className="flex justify-center mb-6">
          <SectionBadge>{badge}</SectionBadge>
        </div>
      )}
      {/* =========================================================================
          SECTION HEADER
          Two-line title as specified
      ========================================================================= */}
      <div className="container mx-auto px-4 mb-12 text-center">
        {/* Line 1 - Main title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-2">
          Designed with strategic technology future focused partners!
        </h2>
        {/* Line 2 - Subtitle with gradient */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
          Made for Individuals to Enterprises!
        </p>
      </div>

      {/* =========================================================================
          TOP ROW - Scrolls left (default direction)
          Triple repetition ensures seamless infinite loop
      ========================================================================= */}
      <div className="flex overflow-hidden mb-6">
        <TranslateWrapper>
          <LogoRowTop />
        </TranslateWrapper>
        <TranslateWrapper>
          <LogoRowTop />
        </TranslateWrapper>
        <TranslateWrapper>
          <LogoRowTop />
        </TranslateWrapper>
      </div>

      {/* =========================================================================
          BOTTOM ROW - Scrolls right (reverse direction)
          Triple repetition ensures seamless infinite loop
      ========================================================================= */}
      <div className="flex overflow-hidden">
        <TranslateWrapper reverse>
          <LogoRowBottom />
        </TranslateWrapper>
        <TranslateWrapper reverse>
          <LogoRowBottom />
        </TranslateWrapper>
        <TranslateWrapper reverse>
          <LogoRowBottom />
        </TranslateWrapper>
      </div>
    </section>
  );
}
