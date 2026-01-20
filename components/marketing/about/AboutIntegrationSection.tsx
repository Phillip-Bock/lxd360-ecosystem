'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface IntegrationBenefit {
  _key?: string;
  number: string;
  title: string;
  description: string;
}

interface AboutIntegrationSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  benefits?: IntegrationBenefit[];
  image?: string;
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_BENEFITS: IntegrationBenefit[] = [
  {
    number: '01',
    title: 'Seamless Data Sync',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
  },
  {
    number: '02',
    title: 'Automated Workflows',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
  },
];

const DEFAULTS = {
  badge: 'Integration',
  headline: 'Connect Your Tools\nSeamlessly',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }): React.JSX.Element {
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
          boxShadow: '0 4px 20px rgba(85, 2, 120, 0.4), 0 8px 40px rgba(85, 2, 120, 0.2)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   BENEFIT ITEM COMPONENT
============================================================================= */
interface BenefitItemProps {
  benefit: IntegrationBenefit;
  index: number;
}

function BenefitItem({ benefit, index }: BenefitItemProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="group flex gap-6 p-6 rounded-[10px] bg-lxd-light-card/50 dark:bg-lxd-dark-page/30 border border-lxd-light-border dark:border-lxd-dark-border hover:border-brand-primary/50 transition-all duration-300"
    >
      {/* Number Badge */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="shrink-0 w-14 h-14 rounded-[10px] bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center"
        style={{
          boxShadow: '0 4px 15px rgba(85, 2, 120, 0.3)',
        }}
      >
        <span className="text-xl font-bold text-brand-primary">{benefit.number}</span>
      </motion.div>

      {/* Content */}
      <div className="grow">
        <h3 className="text-lg font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-2 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">
          {benefit.title}
        </h3>
        <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm leading-relaxed">
          {benefit.description}
        </p>
      </div>

      {/* Arrow Icon */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="shrink-0 self-center"
      >
        <ArrowRight className="w-5 h-5 text-brand-blue" />
      </motion.div>
    </motion.div>
  );
}

/* =============================================================================
   PROCESS FLOW COMPONENT
============================================================================= */
function ProcessFlow(): React.JSX.Element {
  const steps = ['Connect', 'Configure', 'Automate', 'Scale'];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-center"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="px-4 py-2 rounded-full bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-brand-primary/30 text-sm font-medium text-lxd-text-dark-body dark:text-lxd-text-light-body"
          >
            {step}
          </motion.div>
          {index < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              className="w-8 h-0.5 bg-linear-to-r from-blue-500 to-purple-500 mx-1"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function AboutIntegrationSection({
  badge,
  headline,
  description,
  benefits,
  image,
}: AboutIntegrationSectionProps): React.JSX.Element {
  const displayBenefits = benefits?.length ? benefits : DEFAULT_BENEFITS;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-50/20 to-transparent dark:via-purple-950/10" />

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              {headlineParts[0]}
            </span>
            {headlineParts[1] && (
              <>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">
                  {headlineParts[1]}
                </span>
              </>
            )}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto mb-8">
            {description || DEFAULTS.description}
          </p>

          {/* Process Flow */}
          <ProcessFlow />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits */}
          <div className="space-y-6">
            {displayBenefits.map((benefit, index) => (
              <BenefitItem key={benefit._key || index} benefit={benefit} index={index} />
            ))}

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 px-8 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-brand-primary font-semibold rounded-[10px] inline-flex items-center gap-2"
              style={{
                boxShadow: '0 4px 20px rgba(85, 2, 120, 0.3)',
              }}
            >
              Get in Touch
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                &rarr;
              </motion.span>
            </motion.button>
          </div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 2 }}
              style={{ perspective: '1000px' }}
              className="relative aspect-[4/3] rounded-[10px] overflow-hidden"
            >
              <Image
                src={image || '/placeholder.jpg'}
                alt="Integration process"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 via-transparent to-purple-500/20" />

              {/* Floating Status Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 left-4 right-4 p-4 bg-lxd-light-card/90 dark:bg-lxd-dark-page/90 backdrop-blur-xs rounded-[10px] border border-lxd-light-border dark:border-lxd-dark-border"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-brand-success"
                  />
                  <span className="text-sm font-medium text-lxd-text-dark-body dark:text-lxd-text-light-body">
                    All Systems Connected
                  </span>
                  <div className="ml-auto flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <CheckCircle key={i} className="w-4 h-4 text-brand-success" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Decorations */}
            <motion.div
              animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-brand-primary/20 blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
