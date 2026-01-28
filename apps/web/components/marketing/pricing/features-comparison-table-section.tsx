'use client';

/**
 * FeaturesComparisonTableSection Component
 * =========================================
 * Detailed feature comparison table across plans.
 * Adapted from Aurion pricing-3 template.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - Expandable feature categories
 * - Check/X icons with animations
 * - Hover effects on rows
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface ComparisonFeature {
  _key?: string;
  name: string;
  tier1: boolean | string;
  tier2: boolean | string;
  tier3: boolean | string;
  tier4?: boolean | string;
}

interface ComparisonCategory {
  _key?: string;
  name: string;
  features: ComparisonFeature[];
}

interface FeaturesComparisonTableSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  tierNames?: string[];
  categories?: ComparisonCategory[];
  highlightedTier?: number;
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_TIER_NAMES = ['Basic', 'Pro', 'Enterprise'];

const DEFAULT_CATEGORIES: ComparisonCategory[] = [
  {
    name: 'Core Features',
    features: [
      { name: 'Lorem ipsum dolor sit', tier1: true, tier2: true, tier3: true },
      { name: 'Consectetur adipiscing', tier1: true, tier2: true, tier3: true },
      { name: 'Suspendisse varius enim', tier1: '5', tier2: '30', tier3: 'Unlimited' },
      { name: 'Elementum tristique', tier1: false, tier2: true, tier3: true },
    ],
  },
  {
    name: 'Analytics & Reporting',
    features: [
      { name: 'Basic reporting', tier1: true, tier2: true, tier3: true },
      { name: 'Advanced analytics', tier1: false, tier2: true, tier3: true },
      { name: 'Custom dashboards', tier1: false, tier2: false, tier3: true },
      { name: 'Data export', tier1: false, tier2: true, tier3: true },
    ],
  },
  {
    name: 'Integrations',
    features: [
      { name: 'Native integrations', tier1: '3', tier2: '10', tier3: 'Unlimited' },
      { name: 'API access', tier1: false, tier2: true, tier3: true },
      { name: 'Custom webhooks', tier1: false, tier2: false, tier3: true },
      { name: 'SSO (SAML/OIDC)', tier1: false, tier2: false, tier3: true },
    ],
  },
  {
    name: 'Support & Security',
    features: [
      { name: 'Email support', tier1: true, tier2: true, tier3: true },
      { name: 'Priority support', tier1: false, tier2: true, tier3: true },
      { name: 'Dedicated manager', tier1: false, tier2: false, tier3: true },
      { name: 'Uptime SLA', tier1: '99%', tier2: '99.5%', tier3: '99.9%' },
    ],
  },
];

const DEFAULTS = {
  badge: 'Compare Plans',
  headline: 'Detailed Feature Comparison',
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. See exactly what's included in each plan.",
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex justify-center mb-8"
    >
      <span
        className="px-6 py-2 text-sm font-semibold text-brand-primary rounded-[10px] inline-block"
        style={{
          background: 'var(--brand-primary)',
          boxShadow:
            '0 4px 20px color-mix(in srgb, var(--brand-secondary) 40%, transparent), 0 8px 40px color-mix(in srgb, var(--brand-secondary) 20%, transparent)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   VALUE RENDERER
============================================================================= */
function RenderValue({
  value,
  isHighlighted,
}: {
  value: boolean | string;
  isHighlighted?: boolean;
}) {
  if (value === true) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring' }}
      >
        <Check className="w-5 h-5 text-brand-success mx-auto" />
      </motion.div>
    );
  }
  if (value === false) {
    return <X className="w-5 h-5 text-lxd-text-light-body dark:text-lxd-text-dark-body mx-auto" />;
  }
  return (
    <span
      className={`text-sm font-medium ${isHighlighted ? 'text-brand-blue dark:text-brand-cyan' : 'text-lxd-text-dark-body dark:text-lxd-text-light-body'}`}
    >
      {value}
    </span>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function FeaturesComparisonTableSection({
  badge,
  headline,
  description,
  tierNames,
  categories,
  highlightedTier = 1,
}: FeaturesComparisonTableSectionProps) {
  const displayTierNames = tierNames?.length ? tierNames : DEFAULT_TIER_NAMES;
  const displayCategories = categories?.length ? categories : DEFAULT_CATEGORIES;
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    displayCategories.map((c) => c.name),
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-background to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-brand-primary blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-4">
            {headline || DEFAULTS.headline}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto bg-lxd-light-card dark:bg-lxd-dark-page/50 rounded-[10px] border border-lxd-light-border dark:border-lxd-dark-border overflow-hidden"
          style={{
            boxShadow:
              '0 25px 50px -12px color-mix(in srgb, var(--brand-primary) 10%, transparent)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              {/* Header */}
              <thead>
                <tr className="border-b border-lxd-light-border dark:border-lxd-dark-border bg-lxd-light-card dark:bg-lxd-dark-card/50">
                  <th className="text-left py-5 px-6 font-semibold text-lxd-text-dark-heading dark:text-brand-primary w-2/5">
                    Features
                  </th>
                  {displayTierNames.map((name, index) => (
                    <th
                      key={name}
                      className={`py-5 px-4 text-center font-semibold ${
                        index === highlightedTier
                          ? 'text-brand-blue dark:text-brand-cyan bg-blue-50/50 dark:bg-blue-900/20'
                          : 'text-lxd-text-dark-heading dark:text-brand-primary'
                      }`}
                    >
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {name}
                      </motion.span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {displayCategories.map((category) => (
                  <>
                    {/* Category Header */}
                    <tr
                      key={category._key || category.name}
                      className="border-b border-lxd-light-border dark:border-lxd-dark-border bg-lxd-light-card dark:bg-lxd-dark-card cursor-pointer hover:bg-lxd-light-surface dark:hover:bg-lxd-dark-surface transition-colors"
                      onClick={() => toggleCategory(category.name)}
                    >
                      <td colSpan={displayTierNames.length + 1} className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{
                              rotate: expandedCategories.includes(category.name) ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-lxd-text-dark-muted" />
                          </motion.div>
                          <span className="font-semibold text-lxd-text-dark-heading dark:text-brand-primary">
                            {category.name}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Category Features */}
                    <AnimatePresence>
                      {expandedCategories.includes(category.name) &&
                        category.features.map((feature, featureIndex) => (
                          <motion.tr
                            key={feature._key || `${category.name}-${featureIndex}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                            className="border-b border-lxd-light-border dark:border-lxd-dark-border hover:bg-lxd-light-card dark:hover:bg-lxd-dark-card/30 transition-colors"
                          >
                            <td className="py-4 px-6 pl-12 text-lxd-text-dark-body dark:text-lxd-text-light-body text-sm">
                              {feature.name}
                            </td>
                            <td
                              className={`py-4 px-4 text-center ${0 === highlightedTier ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                              <RenderValue
                                value={feature.tier1}
                                isHighlighted={0 === highlightedTier}
                              />
                            </td>
                            <td
                              className={`py-4 px-4 text-center ${1 === highlightedTier ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                              <RenderValue
                                value={feature.tier2}
                                isHighlighted={1 === highlightedTier}
                              />
                            </td>
                            <td
                              className={`py-4 px-4 text-center ${2 === highlightedTier ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                              <RenderValue
                                value={feature.tier3}
                                isHighlighted={2 === highlightedTier}
                              />
                            </td>
                            {feature.tier4 !== undefined && (
                              <td
                                className={`py-4 px-4 text-center ${3 === highlightedTier ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                              >
                                <RenderValue
                                  value={feature.tier4}
                                  isHighlighted={3 === highlightedTier}
                                />
                              </td>
                            )}
                          </motion.tr>
                        ))}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-lxd-text-dark-muted dark:text-lxd-text-dark-muted text-sm mt-8"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
