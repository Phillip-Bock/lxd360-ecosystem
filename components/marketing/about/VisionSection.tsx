'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { Brain, Globe, Lightbulb, Rocket, Sparkles, Target, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface VisionPillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function VisionPillar({
  icon,
  title,
  description,
  delay = 0,
}: VisionPillarProps): React.JSX.Element {
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
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.7,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      whileHover={{
        y: -10,
        scale: 1.05,
        transition: { duration: 0.3 },
      }}
      className="relative group"
    >
      <div className="relative p-8 rounded-2xl bg-linear-to-br from-cyan-900/30 via-blue-900/30 to-cyan-900/30 border border-brand-accent/30 backdrop-blur-xs overflow-hidden transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/30">
        {/* Animated glow */}
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 via-blue-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <motion.div
          className="mb-6 text-brand-cyan group-hover:text-cyan-300"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="inline-block p-4 rounded-2xl bg-brand-accent/10 backdrop-blur-xs">
            <div className="h-12 w-12">{icon}</div>
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-brand-primary mb-3 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-lxd-text-light-body leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

interface RoadmapItemProps {
  year: string;
  title: string;
  description: string;
  delay?: number;
}

function RoadmapItem({ year, title, description, delay = 0 }: RoadmapItemProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration: 0.6, delay }}
      className="relative pl-12 pb-12 group"
    >
      {/* Timeline line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-linear-to-b from-cyan-500 to-cyan-500/20 group-last:bg-linear-to-b group-last:from-cyan-500 group-last:to-transparent" />

      {/* Timeline dot */}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
        <motion.div
          className="w-3 h-3 bg-lxd-light-card rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Content */}
      <div className="bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-cyan-900/20 border border-brand-accent/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
        <div className="text-brand-cyan font-bold text-sm mb-2">{year}</div>
        <h4 className="text-xl font-bold text-brand-primary mb-2">{title}</h4>
        <p className="text-lxd-text-light-body leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function VisionSection(): React.JSX.Element {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-900/10 to-transparent" />

      {/* Animated horizon glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[150px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[150px] animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Starfield effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-cyan font-semibold mb-6">
            <Rocket className="h-5 w-5" />
            <span>The Future of Learning</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6">Our Vision</h2>
          <p className="text-xl text-lxd-text-light-body leading-relaxed">
            We&apos;re building the future where every human can access personalized,
            neuroscience-powered learning that guarantees skill mastery. A world where L&amp;D
            drives competitive advantage, not compliance.
          </p>
        </motion.div>

        {/* Vision Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
          <VisionPillar
            icon={<Globe className="h-full w-full" />}
            title="Global Impact"
            description="Democratize access to world-class learning for 1 billion learners by 2030. From Fortune 500 to startups, from developed nations to emerging markets—everyone deserves proven learning science."
            delay={0.1}
          />

          <VisionPillar
            icon={<Brain className="h-full w-full" />}
            title="AI-Powered Personalization"
            description="Leverage breakthrough AI to create truly adaptive learning that reads cognitive state, emotional engagement, and performance patterns to optimize every learner's journey in real-time."
            delay={0.2}
          />

          <VisionPillar
            icon={<Target className="h-full w-full" />}
            title="Measurable Transformation"
            description="Make L&D a data-driven discipline where every dollar invested can be traced to business outcomes. Learning becomes a strategic lever for growth, not a cost center."
            delay={0.3}
          />
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-4xl mx-auto mb-20">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-brand-primary mb-16 text-center"
          >
            Our Roadmap
          </motion.h3>

          <div className="space-y-0">
            <RoadmapItem
              year="2024-2025"
              title="AI-Powered Content Generation at Scale"
              description="Launch INSPIRE Studio 2.0 with advanced AI that generates fully customized, neuroscience-optimized courses in minutes, not months. Built-in bias detection and HITL governance."
              delay={0.1}
            />

            <RoadmapItem
              year="2025-2026"
              title="Adaptive Learning Intelligence"
              description="Deploy real-time cognitive load detection and emotional engagement tracking. The platform adjusts content difficulty, pacing, and modality dynamically based on each learner's state."
              delay={0.2}
            />

            <RoadmapItem
              year="2026-2027"
              title="Global Workforce Skills Platform"
              description="Expand to 50+ languages with culturally adaptive content. Partner with governments and NGOs to upskill underserved populations. Make world-class L&D accessible to all."
              delay={0.3}
            />

            <RoadmapItem
              year="2027-2030"
              title="The Learning Operating System"
              description="Become the universal L&D infrastructure layer. Every organization, every learner, every skill—connected through one unified, neuroscience-powered ecosystem that guarantees results."
              delay={0.4}
            />
          </div>
        </div>

        {/* Final Vision Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative p-12 rounded-3xl bg-linear-to-br from-cyan-900/30 via-blue-900/40 to-cyan-900/30 border border-brand-accent/40 backdrop-blur-xs overflow-hidden">
            {/* Animated corner sparkles */}
            <motion.div
              className="absolute top-8 left-8 text-brand-cyan"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>

            <motion.div
              className="absolute bottom-8 right-8 text-brand-cyan"
              animate={{
                rotate: [0, -360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 2,
              }}
            >
              <Zap className="h-8 w-8" />
            </motion.div>

            <div className="text-center relative z-10">
              <motion.div
                className="inline-block mb-6"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Lightbulb className="h-16 w-16 text-brand-cyan" />
              </motion.div>

              <h3 className="text-4xl font-bold text-brand-primary mb-6">
                Join Us in Shaping the Future
              </h3>
              <p className="text-xl text-lxd-text-light leading-relaxed mb-8">
                The learning revolution isn&apos;t coming—it&apos;s here. We&apos;re not iterating
                on the old model; we&apos;re building something entirely new. If you believe L&amp;D
                should be a strategic asset backed by neuroscience and proven results, you&apos;re
                in the right place.
              </p>
              <p className="text-2xl font-semibold text-brand-cyan">
                The future of learning is personalized, measurable, and guaranteed. The future is
                LXP360.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
