'use client';

/**
 * PolicyPageContent Component
 * ===========================
 * Renders the content for policy/legal pages.
 * Uses Firestore for content storage with PortableTextBlock support.
 *
 * Structure:
 * 1. Hero Section - Title, subtitle, effective date
 * 2. Body Content - Rich text blocks
 * 3. CTA Section - Call to action with gradient buttons
 *
 * Branding:
 * - Uses LXD360 brand colors from BRANDING.md
 * - Dark mode default with light mode support
 * - 10px border radius on all containers
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';
import type { PolicyPage, PortableTextBlock } from '@/lib/content/types';

/* =============================================================================
   PORTABLE TEXT RENDERER
   Simple renderer for PortableTextBlock content (replaces @portabletext/react)
============================================================================= */

interface PortableTextChild {
  _type: string;
  _key: string;
  text?: string;
  marks?: string[];
}

interface MarkDef {
  _type: string;
  _key: string;
  href?: string;
  blank?: boolean;
}

function renderTextWithMarks(child: PortableTextChild, markDefs: MarkDef[] = []): ReactNode {
  const { text = '', marks = [], _key } = child;

  if (marks.length === 0) {
    return text;
  }

  let content: ReactNode = text;

  for (const mark of marks) {
    // Check if it's a link (reference to markDef)
    const markDef = markDefs.find((def) => def._key === mark);
    if (markDef && markDef._type === 'link') {
      const target = markDef.blank ? '_blank' : undefined;
      const rel = markDef.blank ? 'noopener noreferrer' : undefined;
      content = (
        <a
          key={`${_key}-link`}
          href={markDef.href ?? '#'}
          target={target}
          rel={rel}
          className="text-brand-cyan hover:text-brand-cyan underline transition-colors"
        >
          {content}
        </a>
      );
    } else {
      // Standard marks
      switch (mark) {
        case 'strong':
          content = (
            <strong key={`${_key}-strong`} className="font-semibold text-brand-primary">
              {content}
            </strong>
          );
          break;
        case 'em':
          content = (
            <em key={`${_key}-em`} className="italic">
              {content}
            </em>
          );
          break;
        case 'underline':
          content = (
            <u key={`${_key}-underline`} className="underline">
              {content}
            </u>
          );
          break;
      }
    }
  }

  return content;
}

function renderBlock(block: PortableTextBlock): ReactNode {
  const { style = 'normal', children = [], markDefs = [], _key } = block;

  const renderedChildren = children.map((child) =>
    renderTextWithMarks(child, markDefs as MarkDef[]),
  );

  switch (style) {
    case 'h2':
      return (
        <h2
          key={_key}
          className="text-2xl md:text-3xl font-bold text-brand-primary mt-12 mb-4 first:mt-0"
        >
          {renderedChildren}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={_key} className="text-xl md:text-2xl font-semibold text-brand-primary mt-8 mb-3">
          {renderedChildren}
        </h3>
      );
    case 'h4':
      return (
        <h4 key={_key} className="text-lg md:text-xl font-semibold text-lxd-text-light mt-6 mb-2">
          {renderedChildren}
        </h4>
      );
    case 'blockquote':
      return (
        <blockquote
          key={_key}
          className="border-l-4 border-brand-primary pl-6 my-6 text-lxd-text-light-muted italic"
        >
          {renderedChildren}
        </blockquote>
      );
    default:
      return (
        <p key={_key} className="text-lxd-text-light-body leading-relaxed mb-4">
          {renderedChildren}
        </p>
      );
  }
}

interface PortableTextRendererProps {
  value: PortableTextBlock[];
}

function PortableTextRenderer({ value }: PortableTextRendererProps): React.JSX.Element {
  return <>{value.map((block) => renderBlock(block))}</>;
}

/* =============================================================================
   HERO SECTION COMPONENT
============================================================================= */

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  effectiveDate?: string;
}

function HeroSection({
  title,
  subtitle,
  lastUpdated,
  effectiveDate,
}: HeroSectionProps): React.JSX.Element {
  // Format date for display
  const formatDate = (dateString?: string): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-lxd-dark-page via-(--lxd-blue-dark-700) to-lxd-dark-page" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-primary mb-4">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl text-lxd-text-light-muted mb-6">{subtitle}</p>
          )}

          {/* Dates */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-lxd-text-dark-muted">
            {effectiveDate && <span>Effective: {formatDate(effectiveDate)}</span>}
            {lastUpdated && <span>Last Updated: {formatDate(lastUpdated)}</span>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =============================================================================
   BODY CONTENT COMPONENT
============================================================================= */

interface BodyContentProps {
  body?: PortableTextBlock[];
}

function BodyContent({ body }: BodyContentProps): React.JSX.Element {
  if (!body || body.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-lxd-dark-page">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lxd-text-light-muted text-center">
              Content is being prepared. Please check back soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-lxd-dark-page">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Policy content card */}
          <div className="bg-lxd-dark-card/50 border border-lxd-dark-border rounded-[10px] p-6 md:p-10">
            <PortableTextRenderer value={body} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =============================================================================
   CTA SECTION COMPONENT
============================================================================= */

interface CTASectionProps {
  showCta?: boolean;
  badge?: string;
  headline?: string;
  description?: string;
}

const CTA_DEFAULTS = {
  badge: 'Questions?',
  headline: 'Have Questions About This Policy?',
  description:
    'Our team is here to help. Reach out to us with any questions or concerns about our policies and practices.',
};

function PolicyCTASection({
  showCta = true,
  badge,
  headline,
  description,
}: CTASectionProps): React.JSX.Element | null {
  if (!showCta) return null;

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-lxd-dark-page via-lxd-dark-card to-lxd-dark-page" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-brand-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-secondary/10 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full bg-brand-primary/20 text-brand-cyan text-sm font-semibold"
        >
          {badge ?? CTA_DEFAULTS.badge}
        </motion.span>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary mb-4 max-w-3xl mx-auto"
        >
          {headline ?? CTA_DEFAULTS.headline}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-lxd-text-light-body max-w-2xl mx-auto mb-8"
        >
          {description ?? CTA_DEFAULTS.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <GradientShadowButton href="/contact" variant="tertiary">
            Contact Us
          </GradientShadowButton>
          <GradientShadowButton href="/" variant="secondary">
            Back to Home
          </GradientShadowButton>
        </motion.div>
      </div>
    </section>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

interface PolicyPageContentProps {
  policy: PolicyPage;
}

export function PolicyPageContent({ policy }: PolicyPageContentProps): React.JSX.Element {
  // Use the title with a fallback for type safety
  const pageTitle = policy.title ?? 'Policy';

  return (
    <main className="min-h-screen bg-lxd-dark-page">
      {/* Hero Section */}
      <HeroSection
        title={pageTitle}
        subtitle={policy.heroSubtitle}
        lastUpdated={policy.lastUpdated}
        effectiveDate={policy.effectiveDate}
      />

      {/* Body Content */}
      <BodyContent body={policy.body} />

      {/* CTA Section */}
      <PolicyCTASection
        showCta={policy.showCta}
        badge={policy.ctaBadge}
        headline={policy.ctaHeadline}
        description={policy.ctaDescription}
      />
    </main>
  );
}
