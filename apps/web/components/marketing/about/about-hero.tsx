'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import type React from 'react';
import { useRef } from 'react';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';
import type { AboutHeroSection, HeroSection } from '@/lib/content/types';

// ============================================================================
// DEFAULT DATA (fallback when CMS data not available)
// ============================================================================

const defaultHeroSections: HeroSection[] = [
  {
    _key: 'section1',
    titleText: 'The Architecture of Inspired Learning',
    oneliner: 'We transform the global learning and development industry.',
    paragraph:
      'By replacing costly, fragmented legacy systems with a unified, neuroscience-based ecosystem, we empower L&D as a strategic asset to drive measurable growth and foster continuous learning.',
    imageAlt: 'AI-powered learning technology',
  },
  {
    _key: 'section2',
    titleText: 'The INSPIRE™ Framework',
    oneliner: 'The Neuroscience of Performance: Our neuroscience architecture',
    paragraph:
      "The INSPIRE™ Framework uses cognitive science and neuroplasticity to guarantee skill transfer and defeat the 'Forgetting Curve.' It breaks content into optimized micro-bursts and provides adaptive practice with real-time feedback, leveraging the brain's natural reward system. This scientific rigor is our core competitive advantage.",
    imageAlt: 'INSPIRE Framework visualization',
  },
  {
    _key: 'section3',
    titleText: 'Excellence & Integrity',
    oneliner: 'Our Commitment to AI Governance is trust through transparency and compliance',
    paragraph:
      "Our AI-driven content generation is governed by a 'Glass Box' philosophy. All INSPIRE Studio content is traceable and requires Human-in-the-Loop (HITL) approval to prevent hallucination, bias, or error. Built on secure GCP services, our architecture is FedRAMP-ready and meets global data standards. We use a dedicated Inclusion Filter to actively scan for gender, racial, and cultural bias, ensuring equitable and compliant learning for your global workforce.",
    imageAlt: 'AI Governance and compliance',
  },
];

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface AboutHeroProps {
  heroSections?: AboutHeroSection[] | HeroSection[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AboutHero = ({ heroSections }: AboutHeroProps): React.JSX.Element => {
  // Use CMS data or fall back to defaults
  const sections = heroSections && heroSections.length > 0 ? heroSections : defaultHeroSections;

  return (
    <div className="bg-(--surface-page)">
      {sections.map((section) => {
        // Handle both AboutHeroSection (title/subtitle/description) and HeroSection (titleText/oneliner/paragraph) formats
        const titleText =
          'titleText' in section
            ? section.titleText
            : 'title' in section
              ? section.title
              : 'Default Title';
        const oneliner =
          'oneliner' in section ? section.oneliner : 'subtitle' in section ? section.subtitle : '';
        const paragraph =
          'paragraph' in section
            ? section.paragraph
            : 'description' in section
              ? section.description
              : '';
        // Get image alt text - check for imageAlt first, then ImageWithAlt.alt
        const imageAlt =
          'imageAlt' in section && section.imageAlt
            ? section.imageAlt
            : section.image && 'alt' in section.image
              ? section.image.alt
              : 'About LXD360';
        // Handle image formats: HeroSection has image.asset.url, AboutHeroSection has image (ImageWithAlt) with nested image.asset
        let imageSrc = '/placeholder.jpg';
        if (section.image) {
          // Check for direct asset.url (HeroSection format)
          if ('asset' in section.image && section.image.asset?.url) {
            imageSrc = section.image.asset.url;
          }
          // Check for ImageWithAlt format where image.image.asset exists
          else if ('image' in section.image && section.image.image?.asset?.url) {
            imageSrc = section.image.image.asset.url;
          }
        }

        return (
          <ParallaxSection
            key={section._key ?? 'default'}
            titleText={titleText ?? 'Default Title'}
            titleBgClass="bg-(--surface-page)"
            oneliner={oneliner ?? ''}
            paragraph={paragraph ?? ''}
            imageSrc={imageSrc}
            imageAlt={imageAlt ?? 'About LXD360'}
          />
        );
      })}
    </div>
  );
};

// ============================================================================
// PARALLAX SECTION WRAPPER
// ============================================================================

interface ParallaxSectionProps {
  titleText: string;
  titleBgClass: string;
  oneliner: string;
  paragraph: string;
  imageSrc: string;
  imageAlt: string;
}

const ParallaxSection = ({
  titleText,
  titleBgClass,
  oneliner,
  paragraph,
  imageSrc,
  imageAlt,
}: ParallaxSectionProps): React.JSX.Element => {
  return (
    <div className="relative">
      {/* Title Card - Fixed position during scroll */}
      <TitleCard title={titleText} bgClass={titleBgClass} />

      {/* Content Card - Scrolls over the title */}
      <ContentCard
        oneliner={oneliner}
        paragraph={paragraph}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </div>
  );
};

// ============================================================================
// TITLE CARD COMPONENT
// ============================================================================

interface TitleCardProps {
  title: string;
  bgClass: string;
}

const TitleCard = ({ title, bgClass }: TitleCardProps): React.JSX.Element => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div ref={targetRef} className="h-screen sticky top-0">
      <motion.div
        style={{ opacity, scale }}
        className={`
          h-full w-full flex items-center justify-center
          ${bgClass}
        `}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[100px]" />

        {/* Title Text */}
        <h2
          className="
            relative z-10 text-center px-8
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl
            font-bold text-brand-primary
            tracking-tight leading-tight
            max-w-6xl
          "
          style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 4px 60px rgba(59, 130, 246, 0.3)',
          }}
        >
          {title}
        </h2>
      </motion.div>
    </div>
  );
};

// ============================================================================
// CONTENT CARD COMPONENT
// ============================================================================

interface ContentCardProps {
  oneliner: string;
  paragraph: string;
  imageSrc: string;
  imageAlt: string;
}

const ContentCard = ({
  oneliner,
  paragraph,
  imageSrc,
  imageAlt,
}: ContentCardProps): React.JSX.Element => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'start start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <div ref={targetRef} className="relative z-10 min-h-screen">
      <motion.div
        style={{ y, opacity }}
        className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16"
      >
        {/* Card with Chasing Purple Border */}
        <div className="relative max-w-7xl mx-auto">
          {/* Chasing Border Animation */}
          <ChasingBorder />

          {/* Inner Card Content */}
          <div
            className="
              relative z-10
              bg-(--surface-page)/95 backdrop-blur-xl
              rounded-3xl
              p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16
              border border-white/5
            "
          >
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column - Text Content */}
              <div className="space-y-6 md:space-y-8">
                {/* Oneliner - Single Line */}
                <h3
                  className="
                    text-xl sm:text-2xl md:text-3xl lg:text-4xl
                    font-bold text-brand-primary
                    leading-tight
                  "
                  style={{
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  }}
                >
                  {oneliner}
                </h3>

                {/* Paragraph */}
                <p
                  className="
                    text-base sm:text-lg md:text-xl
                    text-lxd-text-light-body/90
                    leading-relaxed
                  "
                >
                  {paragraph}
                </p>

                {/* CTAs - Three gradient shadow buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                  <GradientShadowButton href="/inspire-studio" variant="primary">
                    Create AI-Powered Content Fast
                  </GradientShadowButton>
                  <GradientShadowButton href="/lxd-ecosystem" variant="secondary">
                    Unify Your Entire Tech Stack
                  </GradientShadowButton>
                  <GradientShadowButton href="/solutions" variant="tertiary">
                    Design Your L&D Strategy Blueprint
                  </GradientShadowButton>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="relative">
                <div
                  className="
                    relative aspect-[4/3] sm:aspect-video lg:aspect-[4/3]
                    rounded-2xl overflow-hidden
                    ring-1 ring-white/10
                  "
                >
                  {/* Image Glow Effect */}
                  <div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-50" />

                  {/* The Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-linear-to-t from-(--surface-page)/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// CHASING BORDER COMPONENT
// ============================================================================

const ChasingBorder = (): React.JSX.Element => {
  return (
    <div className="absolute -inset-[2px] rounded-[26px] overflow-hidden">
      {/* Rotating gradient background */}
      <div
        className="absolute inset-0 animate-spin-slow"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 60deg,
            var(--brand-secondary) 120deg,
            var(--brand-secondary) 180deg,
            var(--brand-secondary) 240deg,
            transparent 300deg,
            transparent 360deg
          )`,
        }}
      />

      {/* Secondary rotating gradient (offset) */}
      <div
        className="absolute inset-0 animate-spin-slow-reverse"
        style={{
          background: `conic-gradient(
            from 180deg,
            transparent 0deg,
            transparent 60deg,
            var(--brand-secondary) 120deg,
            var(--brand-secondary) 180deg,
            var(--brand-secondary) 240deg,
            transparent 300deg,
            transparent 360deg
          )`,
          opacity: 0.7,
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 animate-spin-slow blur-sm"
        style={{
          background: `conic-gradient(
            from 90deg,
            transparent 0deg,
            transparent 45deg,
            var(--brand-secondary) 135deg,
            var(--brand-secondary) 180deg,
            var(--brand-secondary) 225deg,
            transparent 315deg,
            transparent 360deg
          )`,
        }}
      />

      {/* Inner mask to create the border effect */}
      <div className="absolute inset-[2px] bg-(--surface-page) rounded-3xl" />
    </div>
  );
};
