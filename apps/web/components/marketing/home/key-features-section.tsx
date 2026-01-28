'use client';

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';
import type { FeatureCard } from '@/lib/content/types';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface KeyFeaturesSectionProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  cards?: FeatureCard[];
}

/* =============================================================================
   CARD DATA CONFIGURATION
   Content and styling for each of the 4 feature cards
============================================================================= */

interface CardData {
  id: number;
  title: string;
  description: string;
  image: string;
  /** Grid area name for CSS Grid placement */
  gridArea: string;
}

const cardsData: CardData[] = [
  {
    id: 1,
    title: 'End the Fragmentation Tax',
    description:
      'LMS, LXP, LRS, and AI Authoring unified in a single cloud-native code base. Reduce admin time and cut Total Cost of Ownership by up to 60%.',
    image: '/placeholder.jpg',
    gridArea: 'card1',
  },
  {
    id: 2,
    title: 'The INSPIRE™ Engine: Learning that Sticks',
    description:
      'Our AI-driven platform helps design content and analyze performance for maximum memory encoding, managing cognitive load and utilizing spaced repetition. Guaranteed to fight the Forgetting Curve.',
    image: '/placeholder.jpg',
    gridArea: 'card2',
  },
  {
    id: 3,
    title: 'Immersive Training.',
    description:
      'Deploy realistic AR / VR / XR simulations directly in the browser, on unknown mobile devices, or on headsets like Oculus. Engage motor cortex and accelerate skill transfer for high-risk, high-value tasks safely and effectively.',
    image: '/placeholder.jpg',
    gridArea: 'card3',
  },
  {
    id: 4,
    title: 'Prove Training ROI. Instantly.',
    description:
      'Granular SCORM, xAPI, or CMI5 data tracks every interaction, not just completions. "Glass Box" AI and ML ensures transparent, auditable, actionable performance insights and predictive analysis.',
    image: '/placeholder.jpg',
    gridArea: 'card4',
  },
];

/* =============================================================================
   TILT CARD COMPONENT
   Individual card with 3D tilt effect on mouse hover
============================================================================= */

/** Rotation range in degrees for the tilt effect */
const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

interface TiltCardProps {
  card: CardData;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TiltCard - A card component with interactive 3D tilt animation
 *
 * How it works:
 * 1. Tracks mouse position relative to card bounds
 * 2. Calculates rotation angles based on mouse position
 * 3. Applies spring-smoothed rotateX and rotateY transforms
 * 4. Resets to flat when mouse leaves
 *
 * @param card - Card data (title, description, image, etc.)
 * @param className - Additional CSS classes for grid positioning
 */
function TiltCard({ card, className = '', style }: TiltCardProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for tracking rotation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animation for smooth transitions
  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });

  // Combine springs into CSS transform string
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  /**
   * Calculate and set rotation based on mouse position
   * Maps mouse coordinates to rotation angles within ROTATION_RANGE
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position as percentage of card dimensions
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    // Convert to rotation angles (inverted for natural feel)
    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  /**
   * Reset rotation to flat when mouse leaves card
   */
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform,
        ...style,
      }}
      className={`relative rounded-[10px] overflow-hidden cursor-pointer shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/40 transition-shadow duration-300 ${className}`}
    >
      {/* =========================================================================
          BACKGROUND IMAGE
          Full-cover image with dark gradient overlay for text readability
      ========================================================================= */}
      <div className="absolute inset-0">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient overlay - darker at bottom for text, lighter at top for image visibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20" />
      </div>

      {/* =========================================================================
          CARD CONTENT
          Title and description with 3D depth effect (translateZ)
      ========================================================================= */}
      <div
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full flex flex-col justify-end p-6 md:p-8"
      >
        {/* Card Title - elevated for 3D depth */}
        <h3
          style={{ transform: 'translateZ(30px)' }}
          className="text-xl md:text-2xl lg:text-3xl font-bold text-brand-primary mb-3"
        >
          {card.title}
        </h3>

        {/* Card Description - slightly less elevated */}
        <p
          style={{ transform: 'translateZ(20px)' }}
          className="text-sm md:text-base text-lxd-text-light leading-relaxed"
        >
          {card.description}
        </p>
      </div>

      {/* =========================================================================
          HOVER BORDER GLOW
          Subtle blue border that appears on hover for visual feedback
      ========================================================================= */}
      <div className="absolute inset-0 rounded-[10px] border-2 border-transparent hover:border-brand-primary/30 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function KeyFeaturesSection({
  badge,
  // heading: _heading,
  // subheading: _subheading,
  // cards: _cards,
}: KeyFeaturesSectionProps) {
  // Note: Content service card data can be used to override cardsData when available
  // For now, using local fallback data for the bento grid layout
  return (
    <section className="py-16 md:py-24 bg-card dark:bg-transparent">
      <div className="container mx-auto px-4">
        {/* Section Badge */}
        {badge && (
          <div className="flex justify-center mb-6">
            <SectionBadge>{badge}</SectionBadge>
          </div>
        )}

        {/* =========================================================================
            SECTION HEADER
            Single line title with gradient accent
        ========================================================================= */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              LXD360, INSPIRE, and LXP360 is the{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
              future ready solution!
            </span>
          </h2>
        </div>

        {/* =========================================================================
            BENTO GRID LAYOUT
            Custom CSS Grid with named areas for complex card arrangement:
            - Desktop: 3-column layout with Card 4 spanning full height on right
            - Tablet: 2-column layout
            - Mobile: Single column stack

            Grid Template Areas (desktop):
            "card1 card2 card4"
            "card3 card3 card4"
        ========================================================================= */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(1, 1fr)',
            gridTemplateRows: 'auto',
          }}
        >
          {/* Mobile/Tablet: Stack layout */}
          <div className="grid gap-6 md:hidden">
            {cardsData.map((card) => (
              <TiltCard key={card.id} card={card} className="min-h-[300px]" />
            ))}
          </div>

          {/* Desktop: Bento grid layout */}
          <div
            className="hidden md:grid gap-6"
            style={{
              gridTemplateAreas: `
                "card1 card2 card4"
                "card3 card3 card4"
              `,
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr',
            }}
          >
            {/* Card 1 - Top Left Square */}
            <TiltCard
              card={cardsData[0]}
              className="min-h-[280px] lg:min-h-[320px]"
              style={{ gridArea: 'card1' }}
            />

            {/* Card 2 - Top Right Square */}
            <TiltCard
              card={cardsData[1]}
              className="min-h-[280px] lg:min-h-[320px]"
              style={{ gridArea: 'card2' }}
            />

            {/* Card 3 - Bottom Wide Rectangle */}
            <TiltCard
              card={cardsData[2]}
              className="min-h-[280px] lg:min-h-[320px]"
              style={{ gridArea: 'card3' }}
            />

            {/* Card 4 - Right Vertical Rectangle */}
            <TiltCard
              card={cardsData[3]}
              className="min-h-[580px] lg:min-h-[660px]"
              style={{ gridArea: 'card4' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
