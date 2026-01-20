'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { AlertCircle, Clock, DollarSign, TrendingDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface StatProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

function AnimatedStat({ value, label, icon, delay = 0 }: StatProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      className="relative group"
    >
      <div className="relative p-8 rounded-2xl bg-linear-to-br from-red-900/20 via-orange-900/20 to-red-900/20 border border-brand-error/30 backdrop-blur-xs overflow-hidden transition-all duration-300 hover:border-brand-error/50 hover:shadow-lg hover:shadow-red-500/20">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-linear-to-br from-red-500/0 via-orange-500/0 to-red-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

        {/* Icon */}
        <div className="mb-4 text-brand-error group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Value */}
        <div className="text-5xl font-bold text-brand-primary mb-2 group-hover:text-red-300 transition-colors">
          {value}
        </div>

        {/* Label */}
        <div className="text-lxd-text-light-body text-lg leading-relaxed">{label}</div>
      </div>
    </motion.div>
  );
}

interface PainPointProps {
  title: string;
  description: string;
  delay?: number;
}

function PainPoint({ title, description, delay = 0 }: PainPointProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: -30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.5,
            delay,
            ease: 'easeOut',
          },
        },
      }}
      className="flex gap-4 group"
    >
      <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-brand-error group-hover:bg-red-400 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all duration-300" />
      <div>
        <h4 className="text-xl font-semibold text-brand-primary mb-2 group-hover:text-red-300 transition-colors">
          {title}
        </h4>
        <p className="text-lxd-text-light-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function ProblemSection(): React.JSX.Element {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-linear-to-b from-red-900/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-error/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-warning/10 rounded-full blur-[128px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-error/10 border border-brand-error/20 text-brand-error font-semibold mb-6">
            <AlertCircle className="h-5 w-5" />
            <span>The Industry Crisis</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6">
            Legacy L&amp;D Is Broken
          </h2>
          <p className="text-xl text-lxd-text-light-body leading-relaxed">
            The traditional learning and development industry is plagued by inefficiency,
            fragmentation, and a fundamental failure to deliver measurable results. Organizations
            are hemorrhaging resources on systems that don&apos;t work.
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          <AnimatedStat
            value="70%"
            label="of employees forget training within 24 hours due to the Forgetting Curve"
            icon={<TrendingDown className="h-12 w-12" />}
            delay={0.1}
          />
          <AnimatedStat
            value="$100B"
            label="wasted annually on ineffective training programs globally"
            icon={<DollarSign className="h-12 w-12" />}
            delay={0.2}
          />
          <AnimatedStat
            value="40%"
            label="of L&D budgets spent on maintaining legacy systems instead of learning"
            icon={<Clock className="h-12 w-12" />}
            delay={0.3}
          />
        </div>

        {/* Pain Points */}
        <div className="max-w-4xl mx-auto">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-brand-primary mb-12 text-center"
          >
            The Critical Pain Points
          </motion.h3>

          <div className="space-y-8">
            <PainPoint
              title="Fragmented Tech Stack"
              description="Organizations juggle 5-10 disconnected learning tools, creating data silos, integration nightmares, and a frustrating user experience that kills engagement."
              delay={0.1}
            />
            <PainPoint
              title="No Skill Transfer Guarantee"
              description="Traditional training delivers content but cannot guarantee retention or real-world application. The Forgetting Curve wins, and learning investments evaporate."
              delay={0.2}
            />
            <PainPoint
              title="Reactive, Not Strategic"
              description="L&D is stuck in a reactive mode—responding to skill gaps rather than proactively building a competitive workforce aligned with business objectives."
              delay={0.3}
            />
            <PainPoint
              title="Unmeasurable ROI"
              description="Leaders cannot prove the business impact of training. Without clear metrics linking learning to performance, L&D remains a cost center, not a growth driver."
              delay={0.4}
            />
            <PainPoint
              title="One-Size-Fits-All Content"
              description="Legacy systems ignore learner context, preferences, and neuroscience. Generic training fails to engage modern learners who demand personalized, adaptive experiences."
              delay={0.5}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
