'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';

// ============================================================================
// DATA
// ============================================================================

const valuesData = [
  {
    id: 1,
    bgImage: '/placeholder.jpg',
    iconImage: '/placeholder.jpg',
    title: 'The Collective Advantage: Synthesis and Strategy',
    description:
      'LXD360 is fundamentally built on the belief that collective wisdom accelerates growth faster than unknown individual tool. Our community synthesizes the applied insights and best practices from practitioners—from solo LXD consultants to Fortune 500 CLOs—to solve complex, unique organizational challenges. By fostering this network and sharing successful implementations, we ensure the entire collective rapidly advances in its mastery of neuroscience-backed design and performance improvement. This open collaboration, powered by xAPI data sharing and open standards, is the engine that drives the continuous evolution of our platform and methodology.',
  },
  {
    id: 2,
    bgImage: '/placeholder.jpg',
    iconImage: '/placeholder.jpg',
    title: 'L - Lifelong Learning',
    description:
      'Our core philosophy dictates that development is a continuous, evolutionary process, not a finite event. We view every project and challenge as an opportunity for mastery, ensuring our platform is always aligned with emerging research. Our community actively supports this through shared resources, peer mentorship, and structured pathways that encourage self-directed growth in areas like cognitive science and emerging technology. By instilling this continuous evolutionary mindset, we ensure our practitioners and their training programs never become obsolete.',
  },
  {
    id: 3,
    bgImage: '/placeholder.jpg',
    iconImage: '/placeholder.jpg',
    title: 'E - Excellence',
    subtitle: 'Upholding Instructional Rigor & Ethical Excellence',
    description:
      'The Excellence pillar ensures we uphold the highest standards of instructional rigor, technical precision, and ethical practice. This includes our commitment to Glass Box AI transparency and methodical quality assurance, which we share with the community. We ensure every piece of content created in INSPIRE Studio is compliant and scientifically sound, while our architecture is FedRAMP-ready for the most demanding, high-stakes environments. This commitment to scientific precision builds credibility for every LXD professional leveraging our ecosystem.',
  },
  {
    id: 4,
    bgImage: '/placeholder.jpg',
    iconImage: '/placeholder.jpg',
    title: 'A - Adaptability',
    subtitle: 'Driving Adaptability and Agile Methodologies',
    description:
      'We embrace change and respond with agility to evolving client needs and market disruptions. Our cloud-native architecture is designed for rapid iteration, allowing us to pivot quickly and deliver updates faster than competitors burdened by legacy systems. We champion agile methodologies in L&D, empowering L&D teams to continuously refine training based on data and feedback, rather than adhering to rigid, outdated development cycles. This allows our clients to rapidly upskill their workforce and stay competitive in changing regulatory and technological landscapes.',
  },
  {
    id: 5,
    bgImage: '/placeholder.jpg',
    iconImage: '/placeholder.jpg',
    title: 'R - Results-Driven',
    subtitle: 'Guaranteeing Results and Verifiable ROI',
    description:
      'We anchor every design in measurable performance outcomes, rejecting vanity metrics like course completion rates. Our Results-Driven pillar provides the framework and tools to demonstrate verifiable Training ROI, targeting a 3x return on investment for strategic programs. The LXP360 platform ensures performance is tracked at the deepest level (xAPI), giving managers the ability to conduct predictive analysis and link learning activity directly to organizational KPIs, revenue goals, and safety metrics.',
  },
  {
    id: 6,
    bgImage: '/placeholder.jpg',
    iconImage: '/placeholder.jpg',
    title: 'N - Next-Gen Thinking',
    subtitle: 'Pioneering Next-Gen Thought Leadership',
    description:
      'We are dedicated to Next-Gen Thinking, meaning our collective is always looking ahead to the future of human performance and technology. We actively research and integrate trends in AI, WebXR, and cloud-native computing to keep our members on the cutting edge of innovation. This foresight ensures that the skills you acquire and the platforms you use are not just current, but future-proofed for the rapidly evolving demands of the strategic business landscape. We are continually redefining what is possible in the learning space, making our members leaders, not followers, of change.',
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const bgVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 0.6 },
  exit: { opacity: 0 },
};

const iconVariants = {
  initial: (trend: number) => ({
    x: trend === 1 ? 100 : -100,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
  exit: (trend: number) => ({
    x: trend === 1 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' as const },
  }),
};

const textVariants = {
  initial: (trend: number) => ({
    y: trend === 1 ? 40 : -40,
    opacity: 0,
  }),
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const, delay: 0.1 },
  },
  exit: (trend: number) => ({
    y: trend === 1 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' as const },
  }),
};

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ValueItem {
  _key?: string;
  id?: string | number;
  title: string;
  subtitle?: string;
  description: string;
  iconImage?: { asset?: { url?: string } };
  backgroundImage?: { asset?: { url?: string } };
}

interface CompanyValuesSectionProps {
  badge?: string;
  heading?: string;
  values?: ValueItem[];
}

// Transform CMS data to match component structure
const transformValues = (
  cmsValues?: ValueItem[],
): Array<{
  id: string | number;
  bgImage: string;
  iconImage: string;
  title: string;
  subtitle?: string;
  description: string;
}> => {
  if (!cmsValues || cmsValues.length === 0) return valuesData;

  return cmsValues.map((item, index) => ({
    id: item.id || index + 1,
    bgImage: item.backgroundImage?.asset?.url || valuesData[index]?.bgImage || '',
    iconImage: item.iconImage?.asset?.url || valuesData[index]?.iconImage || '',
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CompanyValuesSection = ({
  badge,
  heading,
  values,
}: CompanyValuesSectionProps): React.JSX.Element => {
  // Use props or fallback to defaults
  const displayBadge = badge || 'Our Core Values';
  const displayHeading = heading || 'The L.E.A.R.N. Framework';
  const displayValues = transformValues(values);

  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(idx);

  const trend = idx > prevIdx ? 1 : -1;
  const currentIndex = Math.abs(idx % displayValues.length);
  const currentValue = displayValues[currentIndex];

  const handlePrev = (): void => {
    setPrevIdx(idx);
    setIdx((pv) => (pv - 1 + displayValues.length) % displayValues.length);
  };

  const handleNext = (): void => {
    setPrevIdx(idx);
    setIdx((pv) => (pv + 1) % displayValues.length);
  };

  return (
    <section
      className="relative py-16 md:py-24"
      style={{ backgroundColor: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Section Header */}
      <div className="text-center mb-12 px-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-2 mb-6 text-sm font-medium text-brand-cyan bg-brand-primary/10 rounded-full border border-brand-primary/20"
        >
          {displayBadge}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-primary tracking-tight"
          style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 4px 60px rgba(59, 130, 246, 0.3)',
          }}
        >
          {displayHeading}
        </motion.h2>
      </div>

      {/* Carousel Container */}
      <div className="relative h-[60vh] min-h-[500px] max-h-[700px] overflow-hidden mx-4 md:mx-8 lg:mx-16 rounded-3xl">
        {/* Background Image Layer */}
        <AnimatePresence initial={false}>
          <motion.div
            key={`${currentValue.id}-bg`}
            variants={bgVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${currentValue.bgImage})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          />
        </AnimatePresence>

        {/* Three Column Layout */}
        <div className="absolute inset-0 z-10 grid grid-cols-1 md:grid-cols-3">
          {/* Left Column - Frosted Glass with Icon */}
          <div
            className="relative backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
            style={{ backgroundColor: 'rgba(0, 29, 61, 0.7)' }}
          >
            <AnimatePresence initial={false} custom={trend} mode="wait">
              <motion.div
                key={`${currentValue.id}-icon`}
                variants={iconVariants}
                custom={trend}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full h-[70%] md:h-[80%]"
              >
                <Image
                  src={currentValue.iconImage}
                  alt={currentValue.title}
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Decorative gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, transparent, transparent, transparent, rgba(0, 29, 61, 0.3))',
              }}
            />
          </div>

          {/* Middle Column - Exposed Background (hidden on mobile) */}
          <div className="hidden md:block relative">
            {/* Subtle vignette effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, rgba(0, 29, 61, 0.5), transparent, rgba(0, 29, 61, 0.5))',
              }}
            />
          </div>

          {/* Right Column - Frosted Glass with Text */}
          <div
            className="relative backdrop-blur-xl flex flex-col justify-center p-6 md:p-8 lg:p-10"
            style={{ backgroundColor: 'rgba(0, 29, 61, 0.7)' }}
          >
            <AnimatePresence initial={false} custom={trend} mode="wait">
              <motion.div
                key={`${currentValue.id}-text`}
                variants={textVariants}
                custom={trend}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                {/* Title */}
                <h3
                  className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-brand-primary leading-tight"
                  style={{
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  }}
                >
                  {currentValue.title}
                </h3>

                {/* Subtitle (if exists) */}
                {currentValue.subtitle && (
                  <p className="text-base md:text-lg text-brand-purple font-medium">
                    {currentValue.subtitle}
                  </p>
                )}

                {/* Description */}
                <p className="text-sm sm:text-base md:text-base lg:text-lg text-lxd-text-light-body leading-relaxed">
                  {currentValue.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Decorative gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to left, transparent, transparent, transparent, rgba(0, 29, 61, 0.3))',
              }}
            />
          </div>
        </div>

        {/* Corner accent lines */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-brand-secondary/50 rounded-tl-lg pointer-events-none z-20" />
        <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-brand-secondary/50 rounded-tr-lg pointer-events-none z-20" />
      </div>

      {/* Navigation Controls - Below Carousel */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous value"
          className="bg-lxd-light-card/10 hover:bg-lxd-light-card/20 backdrop-blur-md transition-all duration-300 text-brand-primary p-2 rounded-full border border-brand-subtle hover:border-white/30 hover:scale-110"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Progress Counter */}
        <span className="text-lxd-text-light-muted text-sm font-medium min-w-[3rem] text-center">
          {currentIndex + 1} / {displayValues.length}
        </span>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next value"
          className="bg-lxd-light-card/10 hover:bg-lxd-light-card/20 backdrop-blur-md transition-all duration-300 text-brand-primary p-2 rounded-full border border-brand-subtle hover:border-white/30 hover:scale-110"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {displayValues.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => {
              setPrevIdx(idx);
              setIdx(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-brand-secondary w-6'
                : 'bg-lxd-light-card/30 hover:bg-lxd-light-card/50 w-2'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
