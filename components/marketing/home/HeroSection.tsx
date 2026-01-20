'use client';

import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { SectionBadge } from '@/components/marketing/shared/SectionBadge';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';
import { urlFor } from '@/lib/content';
import type { ImageWithAlt } from '@/lib/content/types';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface HeroSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  heroImage?: ImageWithAlt;
}

/* =============================================================================
   DEFAULT VALUES (fallback when content service data is not available)
============================================================================= */
const DEFAULTS = {
  badge: 'AI-Powered Learning',
  headline: 'The All-in-One Learning Ecosystem!\nPersonalized. Intelligent. Limitless.',
  description:
    'End Vendor Sprawl. Power your workforce with LXP360: The only AI-driven ecosystem that integrates LMS, LXP, Authoring, and Analytics for guaranteed skill transfer.',
  heroImageSrc: '/hero-image.jpg',
  heroImageAlt:
    "A table with three monitors and a computer screen displaying LXP360's AI-powered learning analytics dashboard",
};

/* =============================================================================
   ANIMATION CONFIGURATION
   Defines reusable animation variants for consistent motion across elements
   Using Framer Motion's Variants type for proper TypeScript support
============================================================================= */

/**
 * Container animation variant
 * Controls the orchestrated reveal of child elements
 * - staggerChildren: Time delay between each child's animation start
 * - delayChildren: Initial delay before the first child begins
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/**
 * Individual item animation variant
 * Each child element fades in while sliding up from below
 * Creates a polished, professional reveal effect
 */
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * Hero image entrance animation
 * Larger movement and scale for dramatic effect
 * Delayed to appear after text content
 */
const imageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
      delay: 0.4,
    },
  },
};

/* =============================================================================
   HERO SECTION COMPONENT
============================================================================= */

export function HeroSection({ badge, headline, description, heroImage }: HeroSectionProps) {
  // Reference for the image container to track its scroll position
  const imageRef = useRef<HTMLDivElement>(null);

  // Parse headline into two lines (split by newline)
  const headlineText = headline || DEFAULTS.headline;
  const [line1, line2] = headlineText.split('\n');

  // Get image source and alt from content service or use defaults
  const imageSrc = heroImage?.image?.asset?.url
    ? urlFor(heroImage.image).width(1200).height(675).url()
    : DEFAULTS.heroImageSrc;
  const imageAlt = heroImage?.alt || DEFAULTS.heroImageAlt;

  // Track scroll progress when image enters and exits viewport
  // offset: ["start end", "end start"] means:
  // - Animation starts when top of element reaches bottom of viewport
  // - Animation ends when bottom of element reaches top of viewport
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ['start end', 'end start'],
  });

  // Transform scroll progress (0 to 1) into tilt rotation values
  // At scrollYProgress 0.5 (middle of scroll), rotation is 0
  // Before middle: tilts one way, after middle: tilts the other way
  // Range: -35deg to +35deg for dramatic 3D effect
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [35, 0, -35]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-18, 0, 18]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* =========================================================================
          BACKGROUND GRADIENT
          Creates the signature dark blue radial gradient effect (Finvolv-inspired)
          Multiple overlapping gradients create depth and visual interest
          - Primary gradient: Blue glow from top
          - Secondary gradients: Subtle accent glows from corners
      ========================================================================= */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--brand-primary) 15%, transparent), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, color-mix(in srgb, var(--brand-primary) 8%, transparent), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, color-mix(in srgb, var(--brand-primary-hover) 5%, transparent), transparent)
          `,
        }}
      />

      {/* =========================================================================
          MAIN CONTENT CONTAINER
          Uses Framer Motion for orchestrated entrance animations
          Container controls the stagger timing for all children
      ========================================================================= */}
      <motion.div
        className="container mx-auto px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* =================================================================
              SECTION BADGE
              Displayed at top center of hero section
          ================================================================= */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <SectionBadge animate={false}>{badge || DEFAULTS.badge}</SectionBadge>
          </motion.div>

          {/* =================================================================
              HEADLINE - TWO LINES
              Line 1: Main title in white/dark text
              Line 2: Tagline with gradient text for visual emphasis
              Typography:
              - Responsive sizing: 4xl on mobile to 7xl on large screens
              - Bold weight for impact
              - Tight tracking for modern look
          ================================================================= */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
          >
            {/* Line 1 - Main title (WCAG AA: text-lxd-text-dark = 12.6:1 contrast on white) */}
            <span className="block text-lxd-text-dark dark:text-brand-primary">{line1}</span>
            {/* Line 2 - Tagline with gradient */}
            {line2 && (
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
                {line2}
              </span>
            )}
          </motion.h1>

          {/* =================================================================
              DESCRIPTION
              Supporting text that explains the value proposition
              Typography:
              - Muted color (gray-600/gray-300) for visual hierarchy
              - Comfortable line-height (relaxed) for readability
              - Max-width constraint (3xl) for optimal 45-75 char line length
          ================================================================= */}
          {/* Description (WCAG AA: text-lxd-text-dark-body = 9.6:1 contrast on white) */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-lxd-text-dark-body dark:text-lxd-text-light-body mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {description || DEFAULTS.description}
          </motion.p>

          {/* =================================================================
              CALL-TO-ACTION BUTTONS
              Three gradient shadow buttons aligned center:
              1. Create AI-Powered Content Fast - INSPIRE Studio
              2. Unify Your Entire Tech Stack - LXP360
              3. Design Your L&D Strategy Blueprint - B2B
          ================================================================= */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <GradientShadowButton href="/inspire-studio" variant="primary">
              Create AI-Powered Content Fast
            </GradientShadowButton>
            <GradientShadowButton href="/lxd-ecosystem" variant="secondary">
              Unify Your Entire Tech Stack
            </GradientShadowButton>
            <GradientShadowButton href="/solutions" variant="tertiary">
              Design Your L&D Strategy Blueprint
            </GradientShadowButton>
          </motion.div>

          {/* =================================================================
              HERO IMAGE WITH BLUE GLOW AND DIAGONAL TILT
              The main visual showcasing the platform dashboard
              Features:
              - Responsive sizing (max-w-4xl)
              - Prominent blue glow effect around the image
              - Diagonal tilt animation on scroll (3D perspective)
              - Rounded corners and shadow for depth
              - Priority loading for LCP optimization
          ================================================================= */}
          <motion.div
            ref={imageRef}
            variants={imageVariants}
            className="relative max-w-4xl mx-auto"
            style={{ perspective: 1000 }}
          >
            {/* Blue glow effect - prominent and visible around the image */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-60 dark:opacity-70 -z-10 blur-2xl"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 60%, transparent), color-mix(in srgb, var(--brand-primary-hover) 50%, transparent), color-mix(in srgb, var(--brand-primary) 60%, transparent))',
              }}
            />

            {/* Secondary inner glow for more intensity */}
            <div
              className="absolute -inset-2 rounded-[10px] opacity-40 dark:opacity-50 -z-10 blur-xl"
              style={{
                background:
                  'radial-gradient(ellipse at center, color-mix(in srgb, var(--brand-primary) 80%, transparent), transparent 70%)',
              }}
            />

            {/* Image container with scroll-based 3D tilt animation */}
            <motion.div
              className="relative"
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={1200}
                height={675}
                className="w-full h-auto rounded-[10px] shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/30"
                priority
              />

              {/* Border overlay - adds subtle depth and glassmorphism effect */}
              <div className="absolute inset-0 rounded-[10px] border-2 border-blue-400/20 dark:border-blue-400/30 pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
