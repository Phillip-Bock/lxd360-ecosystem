'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2,
  Cpu,
  Database,
  GitBranch,
  Layers,
  type LucideIcon,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { SectionBadge } from '@/components/marketing/shared/section-badge';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface HowItWorksSectionProps {
  badge?: string;
  heading?: string;
  tabs?: unknown[];
}

/* =============================================================================
   TAB/FEATURE DATA CONFIGURATION
   Content for all 6 tabs with front and back descriptions
============================================================================= */

interface FeatureData {
  id: number;
  /** Tab title (short) */
  tabTitle: string;
  /** Full card title */
  title: string;
  /** Description shown on the left side */
  frontDescription: string;
  /** Description revealed when card is flipped */
  backDescription: string;
  /** Icon component for the tab */
  Icon: LucideIcon;
  /** Video source (using same test video for all during testing) */
  videoSrc: string;
  /** CTA button text on the back of card */
  backCtaText: string;
  /** CTA button link */
  backCtaHref: string;
  /** Button variant for styling */
  backCtaVariant: 'primary' | 'secondary' | 'tertiary';
}

const FEATURES: FeatureData[] = [
  {
    id: 1,
    tabTitle: 'Unify Your Tech Stack',
    title: 'Unify Your Tech Stack',
    frontDescription:
      'Ditch the silos. Instantly consolidate your fragmented LMS, LXP, and Authoring tools into the single, cloud-native LXP360 platform—simplifying administration and cutting complexity.',
    backDescription:
      'The LXP360 platform eliminates the need for separate licenses and integrations, addressing the major vendor sprawl pain point. It serves as the foundation for verifiable skill development, replacing costly legacy systems with a single unified solution.',
    Icon: Layers,
    videoSrc: '/how-it-works/step-1.mp4',
    backCtaText: 'Unify Your Entire Tech Stack',
    backCtaHref: '/lxd-ecosystem',
    backCtaVariant: 'secondary',
  },
  {
    id: 2,
    tabTitle: 'Generate Content',
    title: 'Unlock 50% Faster Content Creation',
    frontDescription:
      'Instantly convert policy documents into neuro-aligned, mobile-ready courses using our native INSPIRE Studio AI Authoring Suite, cutting content development time by up to 50%.',
    backDescription:
      'The INSPIRE Studio uses Generative AI powered by Vertex AI to rapidly create course structures and content. This speeds up the Synthesization process, ensuring new content is automatically structured to maximize memory encoding and align with cognitive science principles.',
    Icon: Cpu,
    videoSrc: '/how-it-works/step-2.mp4',
    backCtaText: 'Create AI-Powered Content Fast',
    backCtaHref: '/inspire-studio',
    backCtaVariant: 'primary',
  },
  {
    id: 3,
    tabTitle: 'Capture Everything',
    title: 'Capture Everything: From SCORM to Spatial Computing',
    frontDescription:
      'Our native Learning Record Store (LRS) is the data backbone of your L&D, tracking every interaction—HTML, SCORM, CMI5, and xAPI—so no content is left behind.',
    backDescription:
      'The LRS within LXP360 utilizes algorithmic predictive analysis and captures granular xAPI data to track learner behavior across all modalities. This data feeds the INSPIRE AI Engine to deliver true transparent performance reporting and adapt the experience to the individual.',
    Icon: Database,
    videoSrc: '/how-it-works/step-3.mp4',
    backCtaText: 'Unify Your Entire Tech Stack',
    backCtaHref: '/lxd-ecosystem',
    backCtaVariant: 'secondary',
  },
  {
    id: 4,
    tabTitle: 'Adaptive Pathways',
    title: 'Automate Adaptive Pathways',
    frontDescription:
      'The INSPIRE AI Engine analyzes this performance data against the INSPIRE Competency Ladder to dynamically adjust learning difficulty and assign real-time, personalized remediation paths.',
    backDescription:
      'This is the core of personalized learning in LXP360. The platform uses the INSPIRE Capability Progression Framework to ensure content is neither too easy nor too difficult, keeping every learner in their optimal zone for performance and skill mastery.',
    Icon: GitBranch,
    videoSrc: '/how-it-works/step-4.mp4',
    backCtaText: 'Create AI-Powered Content Fast',
    backCtaHref: '/inspire-studio',
    backCtaVariant: 'primary',
  },
  {
    id: 5,
    tabTitle: 'Prove ROI',
    title: 'Optimize & Prove ROI',
    frontDescription:
      'Access the live ROI Dashboard built on Google BigQuery. Move beyond vanity metrics to prove training value through measurable improvements in skill application and organizational results.',
    backDescription:
      'The Results-Focused pillar of INSPIRE is measured directly in the LXP360 dashboard. This functionality provides the verifiable metrics needed to demonstrate performance improvement and justify L&D as a strategic growth engine.',
    Icon: BarChart2,
    videoSrc: '/how-it-works/step-5.mp4',
    backCtaText: 'Unify Your Entire Tech Stack',
    backCtaHref: '/lxd-ecosystem',
    backCtaVariant: 'secondary',
  },
  {
    id: 6,
    tabTitle: 'Scale for Impact',
    title: 'Scale for Impact (Pay-As-You-Grow)',
    frontDescription:
      'Start small and scale. Baseline packages allow easy customization and usage-based add-ons so you only pay for the features you need.',
    backDescription:
      'LXD360 uses a disruptive Product-Led Growth (PLG) pricing model tied to Monthly Active Users (MAU), rather than paying for unused seats. This strategy allows for a low-friction entry point and organic expansion from a small pilot to enterprise-wide adoption.',
    Icon: TrendingUp,
    videoSrc: '/how-it-works/step-6.mp4',
    backCtaText: 'Create AI-Powered Content Fast',
    backCtaHref: '/inspire-studio',
    backCtaVariant: 'primary',
  },
];

/* =============================================================================
   TAB COMPONENT
   Individual tab button in the navigation bar
============================================================================= */

interface TabProps {
  selected: boolean;
  Icon: LucideIcon;
  title: string;
  setSelected: (index: number) => void;
  tabNum: number;
}

function Tab({ selected, Icon, title, setSelected, tabNum }: TabProps): React.JSX.Element {
  return (
    <div className="relative w-full min-w-[140px]">
      <button
        type="button"
        onClick={() => setSelected(tabNum)}
        className="relative z-0 flex w-full flex-col items-center justify-center gap-2 border-b-4 border-border bg-card dark:bg-transparent p-4 md:p-6 transition-colors hover:bg-card dark:hover:bg-card/5"
      >
        {/* Icon with gradient background */}
        <span
          className={`rounded-lg bg-linear-to-br from-blue-600 to-blue-500 p-3 text-xl md:text-2xl text-brand-primary shadow-blue-400/50 transition-all duration-300 ${
            selected ? 'scale-100 opacity-100 shadow-lg' : 'scale-90 opacity-50 shadow'
          }`}
        >
          <Icon />
        </span>

        {/* Tab title */}
        <span
          className={`text-xs md:text-sm text-lxd-text-dark-body dark:text-lxd-text-light-body text-center transition-opacity font-medium ${
            selected ? 'opacity-100' : 'opacity-50'
          }`}
        >
          {title}
        </span>
      </button>

      {/* Active tab indicator */}
      {selected && (
        <motion.span
          layoutId="how-it-works-tab-underline"
          className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-brand-primary"
        />
      )}
    </div>
  );
}

/* =============================================================================
   TABS NAVIGATION BAR
   Horizontal scrollable tab bar
============================================================================= */

interface TabsProps {
  selected: number;
  setSelected: (index: number) => void;
}

function Tabs({ selected, setSelected }: TabsProps): React.JSX.Element {
  return (
    <div className="flex overflow-x-auto scrollbar-hide rounded-t-xl border border-b-0 border-border">
      {FEATURES.map((tab, index) => (
        <Tab
          key={tab.id}
          setSelected={setSelected}
          selected={selected === index}
          Icon={tab.Icon}
          title={tab.tabTitle}
          tabNum={index}
        />
      ))}
    </div>
  );
}

/* =============================================================================
   FLIPPABLE VIDEO CARD COMPONENT
   Card with video on front, description on back
   Flips when "Discover the ROI" is clicked
============================================================================= */

interface FlipCardProps {
  videoSrc: string;
  backDescription: string;
  title: string;
  isFlipped: boolean;
  backCtaText: string;
  backCtaHref: string;
  backCtaVariant: 'primary' | 'secondary' | 'tertiary';
}

function FlipCard({
  videoSrc,
  backDescription,
  title,
  isFlipped,
  backCtaText,
  backCtaHref,
  backCtaVariant,
}: FlipCardProps): React.JSX.Element {
  return (
    <div className="relative w-full h-[300px] md:h-[400px]" style={{ perspective: 1000 }}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* =========================================================================
            FRONT SIDE - Video
        ========================================================================= */}
        <div
          className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Video element */}
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/how-it-works/video-fallback.png"
          />
        </div>

        {/* =========================================================================
            BACK SIDE - Description
        ========================================================================= */}
        <div
          className="absolute inset-0 rounded-[10px] overflow-hidden bg-linear-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 p-6 md:p-8 flex flex-col justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Back title */}
          <h4 className="text-xl md:text-2xl font-bold text-brand-primary mb-4">{title}</h4>

          {/* Back description */}
          <p className="text-sm md:text-base text-blue-100 leading-relaxed mb-6">
            {backDescription}
          </p>

          {/* CTA button with gradient shadow effect */}
          <div className="self-start">
            <GradientShadowButton href={backCtaHref} variant={backCtaVariant}>
              {backCtaText}
            </GradientShadowButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* =============================================================================
   FEATURE CONTENT COMPONENT
   Two-column layout: description left, flip card right
============================================================================= */

interface FeatureContentProps {
  feature: FeatureData;
}

function FeatureContent({ feature }: FeatureContentProps): React.JSX.Element {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full px-0 py-8 md:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* =========================================================================
            LEFT SIDE - Title and Front Description
        ========================================================================= */}
        <div className="space-y-6">
          {/* Feature title */}
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-lxd-text-dark-heading dark:text-brand-primary">
            {feature.title}
          </h3>

          {/* Front description */}
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-body leading-relaxed">
            {feature.frontDescription}
          </p>

          {/* "Discover the ROI" button - triggers card flip */}
          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="btn-glow px-6 py-3 text-brand-primary font-semibold rounded-[10px] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            style={{
              background: 'var(--brand-primary)',
              boxShadow:
                '0 10px 15px -3px color-mix(in srgb, var(--brand-primary) 10%, transparent), 0 4px 6px -2px color-mix(in srgb, var(--brand-primary) 5%, transparent)',
            }}
          >
            <span>Discover the ROI</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        {/* =========================================================================
            RIGHT SIDE - Flippable Video Card
        ========================================================================= */}
        <FlipCard
          key={feature.id}
          videoSrc={feature.videoSrc}
          backDescription={feature.backDescription}
          title={feature.title}
          isFlipped={isFlipped}
          backCtaText={feature.backCtaText}
          backCtaHref={feature.backCtaHref}
          backCtaVariant={feature.backCtaVariant}
        />
      </div>
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function HowItWorksSection({
  badge,
  // heading: _heading,
  // tabs: _tabs,
}: HowItWorksSectionProps) {
  // Note: Content service tab data can be used to override features when available
  const [selected, setSelected] = useState(0);

  return (
    <section className="py-16 md:py-24 bg-card dark:bg-transparent">
      <div className="container mx-auto px-4">
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="text-center mb-12">
          {/* Section Badge */}
          {badge && (
            <div className="flex justify-center mb-6">
              <SectionBadge>{badge}</SectionBadge>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">How </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
              LXP360
            </span>
            <span className="text-lxd-text-dark-heading dark:text-brand-primary"> Works</span>
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            Six steps to transform your learning ecosystem
          </p>
        </div>

        {/* =========================================================================
            TABS NAVIGATION
        ========================================================================= */}
        <div className="max-w-6xl mx-auto">
          <Tabs selected={selected} setSelected={setSelected} />

          {/* =========================================================================
              TAB CONTENT AREA
              Animated content switching with AnimatePresence
          ========================================================================= */}
          <div className="bg-card dark:bg-transparent border border-t-0 border-border rounded-b-xl p-4 md:p-8">
            <AnimatePresence mode="wait">
              {FEATURES.map((feature, index) =>
                selected === index ? (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FeatureContent feature={feature} />
                  </motion.div>
                ) : null,
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
