'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { Boxes, Brain, CheckCircle2, Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SolutionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  delay?: number;
}

function SolutionCard({
  icon,
  title,
  description,
  features,
  delay = 0,
}: SolutionCardProps): React.JSX.Element {
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
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: {
            duration: 0.7,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      whileHover={{
        y: -8,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      className="relative group perspective-1000"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative p-8 rounded-2xl bg-linear-to-br from-blue-900/30 via-cyan-900/30 to-blue-900/30 border border-brand-primary/30 backdrop-blur-xs overflow-hidden transition-all duration-300 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/30">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-cyan-500/0 to-blue-500/0 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

        {/* Sparkle effect on hover */}
        <motion.div
          className="absolute top-4 right-4 text-brand-cyan opacity-0 group-hover:opacity-100"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>

        {/* Icon */}
        <div className="mb-6 text-brand-cyan group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-brand-primary mb-3 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-lxd-text-light-body mb-6 leading-relaxed">{description}</p>

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: delay + 0.1 * (index + 1), duration: 0.4 }}
              className="flex items-start gap-3 group/feature"
            >
              <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0 mt-0.5 group-hover/feature:scale-110 transition-transform" />
              <span className="text-lxd-text-light-body text-sm group-hover/feature:text-brand-primary transition-colors">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function SolutionSection(): React.JSX.Element {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-900/5 to-transparent" />
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[150px]" />

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(59, 130, 246, 0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgb(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-cyan font-semibold mb-6">
            <Zap className="h-5 w-5" />
            <span>The LXP360 Solution</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6">
            One Unified Ecosystem
          </h2>
          <p className="text-xl text-lxd-text-light-body leading-relaxed">
            We replace fragmented legacy systems with a single, neuroscience-powered platform that
            guarantees skill transfer, delivers measurable ROI, and transforms L&amp;D into a
            strategic growth engine.
          </p>
        </motion.div>

        {/* Solution Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          <SolutionCard
            icon={<Boxes className="h-12 w-12" />}
            title="Unified Platform"
            description="Replace 5-10 disconnected tools with one integrated ecosystem."
            features={[
              'Single sign-on across all modules',
              'Seamless data flow eliminates silos',
              'Reduced IT overhead and maintenance costs',
              'Consistent UX drives 40% higher engagement',
            ]}
            delay={0.1}
          />

          <SolutionCard
            icon={<Brain className="h-12 w-12" />}
            title="INSPIRE™ Framework"
            description="Neuroscience-based methodology that defeats the Forgetting Curve."
            features={[
              'Spaced repetition for long-term retention',
              'Adaptive microlearning optimizes cognitive load',
              "Real-time feedback leverages brain's reward system",
              '95% skill transfer guarantee',
            ]}
            delay={0.2}
          />

          <SolutionCard
            icon={<TrendingUp className="h-12 w-12" />}
            title="Measurable ROI"
            description="Prove business impact with real-time analytics and performance metrics."
            features={[
              'Link learning to KPIs and business outcomes',
              'Track skill application in real workflows',
              'Executive dashboards with predictive insights',
              'Demonstrate L&D as revenue driver, not cost center',
            ]}
            delay={0.3}
          />

          <SolutionCard
            icon={<Target className="h-12 w-12" />}
            title="Strategic Alignment"
            description="Proactively build workforce capabilities aligned with business goals."
            features={[
              'Skills gap analysis tied to org objectives',
              'Automated learning pathways for critical roles',
              'Predictive workforce planning',
              'Transform L&D from reactive to strategic',
            ]}
            delay={0.4}
          />

          <SolutionCard
            icon={<Users className="h-12 w-12" />}
            title="Personalized Learning"
            description="AI-driven adaptive content tailored to each learner's context."
            features={[
              'Dynamic content adjusts to learner pace',
              'Role-specific and skill-specific pathways',
              'Multi-modal delivery (video, text, interactive)',
              '80% learner satisfaction scores',
            ]}
            delay={0.5}
          />

          <SolutionCard
            icon={<Zap className="h-12 w-12" />}
            title="Rapid Deployment"
            description="Launch in weeks, not months, with AI-powered content generation."
            features={[
              'INSPIRE Studio generates courses in minutes',
              'Pre-built templates for common use cases',
              'Easy migration from legacy systems',
              'Continuous content updates with AI assistance',
            ]}
            delay={0.6}
          />
        </div>

        {/* Bottom highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="p-8 rounded-2xl bg-linear-to-r from-blue-900/30 via-cyan-900/30 to-blue-900/30 border border-brand-primary/30 backdrop-blur-xs">
            <h3 className="text-3xl font-bold text-brand-primary mb-4">
              The Result: L&amp;D as a Competitive Advantage
            </h3>
            <p className="text-lg text-lxd-text-light-body leading-relaxed">
              By unifying your learning ecosystem with neuroscience-backed methodology, LXP360
              transforms L&amp;D from a compliance checkbox into a strategic asset that drives
              measurable business growth, employee engagement, and competitive differentiation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
