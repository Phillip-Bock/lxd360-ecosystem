'use client';

import { motion, useInView } from 'framer-motion';
import { BarChart3, Brain, Globe, Lock, Puzzle, Zap } from 'lucide-react';
import { useRef } from 'react';
import { AnimatedLinesBadge } from '@/components/ui/animated-lines-badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const features = [
  {
    icon: Brain,
    title: 'Glass Box AI',
    description:
      'Every AI recommendation includes a plain-English explanation. Learners understand WHY content was suggested—driving 3x higher engagement.',
    highlight: true,
  },
  {
    icon: Zap,
    title: 'Human-in-the-Loop Control',
    description:
      'Ethical, unbiased AI with built-in human feedback and intervention. You stay in control while AI handles the heavy lifting.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Comprehensive dashboards with xAPI/SCORM/cmi5 compliance for measuring learning impact and ROI—not just completions.',
  },
  {
    icon: Globe,
    title: 'Global Accessibility',
    description:
      'WCAG 2.2 AA and Section 508 compliant interfaces for truly inclusive learning experiences worldwide.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description:
      'SOC 2 Type II ready architecture with FedRAMP-ready design, SSO/SAML integration, and role-based access control.',
  },
  {
    icon: Puzzle,
    title: 'Zero Tech Debt',
    description:
      'Built on Google Cloud Platform and modern frameworks. We keep pace with emerging tech while competitors fall behind.',
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section ref={ref} className="bg-black py-24 sm:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-6xl px-6"
      >
        {/* Section header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <div className="mb-6">
            <AnimatedLinesBadge>Why LXD360</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Built for the Future of Learning
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-gray-400">
            Our platform combines the latest in technology and learning science to deliver
            experiences that truly make a difference.
          </p>
        </motion.div>

        {/* Features grid - Use GlowingEffect wrapper instead of BackgroundGradient */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <div className="relative h-full rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
                <GlowingEffect spread={40} glow={true} proximity={64} />
                <div className="group relative h-full rounded-xl bg-gray-950 p-6 text-center sm:text-left">
                  <div className="mb-4 inline-flex rounded-xl bg-blue-500/20 p-3 text-blue-400 transition-all group-hover:bg-blue-500 group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
