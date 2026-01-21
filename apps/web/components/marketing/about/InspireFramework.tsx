'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import {
  BarChart3,
  Brain,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface FrameworkPillarProps {
  letter: string;
  word: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

function FrameworkPillar({
  letter,
  word,
  description,
  icon,
  delay = 0,
}: FrameworkPillarProps): React.JSX.Element {
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
        hidden: { opacity: 0, x: -50, scale: 0.8 },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      className="group relative"
    >
      <div className="flex gap-6 p-6 rounded-2xl bg-linear-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 border border-brand-secondary/30 backdrop-blur-xs transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105">
        {/* Letter Circle */}
        <div className="shrink-0">
          <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-2xl text-brand-primary group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/50">
            {letter}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-brand-primary group-hover:text-purple-300 transition-colors">
              {word}
            </h3>
            <div className="text-brand-purple group-hover:scale-110 transition-transform">
              {icon}
            </div>
          </div>
          <p className="text-lxd-text-light-body leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface NeuroscienceMetricProps {
  value: string;
  label: string;
  delay?: number;
}

function NeuroscienceMetric({
  value,
  label,
  delay = 0,
}: NeuroscienceMetricProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
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
        hidden: { opacity: 0, scale: 0.5 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            delay,
            ease: 'backOut',
          },
        },
      }}
      className="text-center"
    >
      <motion.div
        className="text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2"
        animate={{
          backgroundPosition: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% auto',
        }}
      >
        {value}
      </motion.div>
      <div className="text-lxd-text-light-muted font-medium">{label}</div>
    </motion.div>
  );
}

export function InspireFramework(): React.JSX.Element {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-900/10 to-transparent" />

      {/* Animated neural network background */}
      <div className="absolute inset-0 opacity-10">
        <svg aria-hidden="true" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="brain-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="rgb(168, 85, 247)" opacity="0.4">
                <animate
                  attributeName="opacity"
                  values="0.4;0.8;0.4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brain-grid)" />
        </svg>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-purple font-semibold mb-6">
            <Brain className="h-5 w-5" />
            <span>Neuroscience-Powered Learning</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6">
            The INSPIRE™ Framework
          </h2>
          <p className="text-xl text-lxd-text-light-body leading-relaxed">
            Our proprietary methodology leverages cognitive science and neuroplasticity to guarantee
            skill transfer and defeat the Forgetting Curve. Every element is designed to work with
            the brain&apos;s natural learning mechanisms.
          </p>
        </motion.div>

        {/* Neuroscience Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-24">
          <NeuroscienceMetric value="95%" label="Skill Retention" delay={0.1} />
          <NeuroscienceMetric value="3x" label="Faster Mastery" delay={0.2} />
          <NeuroscienceMetric value="89%" label="Application Rate" delay={0.3} />
          <NeuroscienceMetric value="24h" label="to First Result" delay={0.4} />
        </div>

        {/* INSPIRE Acronym Breakdown */}
        <div className="max-w-4xl mx-auto space-y-6 mb-24">
          <FrameworkPillar
            letter="I"
            word="Individualized"
            description="Adaptive learning paths that adjust to each learner's pace, prior knowledge, and cognitive load. AI-driven personalization ensures optimal challenge without overwhelm."
            icon={<Users className="h-6 w-6" />}
            delay={0.1}
          />
          <FrameworkPillar
            letter="N"
            word="Neuroscience-Based"
            description="Built on peer-reviewed cognitive science: spaced repetition, interleaving, retrieval practice, and the testing effect. We don't guess—we apply proven brain science."
            icon={<Brain className="h-6 w-6" />}
            delay={0.2}
          />
          <FrameworkPillar
            letter="S"
            word="Spaced Repetition"
            description="Strategic review intervals timed to the edge of forgetting. This defeats the Forgetting Curve and moves learning from short-term to long-term memory."
            icon={<RefreshCw className="h-6 w-6" />}
            delay={0.3}
          />
          <FrameworkPillar
            letter="P"
            word="Practice-Driven"
            description="Active recall and application in realistic scenarios. Learners don't just consume content—they apply it, receive feedback, and refine through deliberate practice."
            icon={<Target className="h-6 w-6" />}
            delay={0.4}
          />
          <FrameworkPillar
            letter="I"
            word="Incremental"
            description="Micro-learning bursts optimized for cognitive load. Complex skills are broken into bite-sized chunks that fit working memory capacity and build progressively."
            icon={<TrendingUp className="h-6 w-6" />}
            delay={0.5}
          />
          <FrameworkPillar
            letter="R"
            word="Reward-Based"
            description="Leverages the brain's dopamine system with immediate feedback, visible progress, and achievement recognition. Motivation is neuroscience, not guesswork."
            icon={<Zap className="h-6 w-6" />}
            delay={0.6}
          />
          <FrameworkPillar
            letter="E"
            word="Evidence-Driven"
            description="Real-time analytics track skill application, retention curves, and performance outcomes. Every decision is informed by data, not intuition."
            icon={<BarChart3 className="h-6 w-6" />}
            delay={0.7}
          />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="relative p-8 rounded-2xl bg-linear-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 border border-brand-secondary/30 backdrop-blur-xs overflow-hidden">
            {/* Sparkle effects */}
            <motion.div
              className="absolute top-4 right-4 text-brand-purple"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>

            <h3 className="text-3xl font-bold text-brand-primary mb-4">
              Science-Backed Results, Guaranteed
            </h3>
            <p className="text-lg text-lxd-text-light-body leading-relaxed">
              The INSPIRE™ Framework isn&apos;t theory—it&apos;s a proven methodology backed by
              decades of cognitive research and validated by measurable outcomes across thousands of
              learners. We guarantee skill transfer because we understand how the brain learns.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
