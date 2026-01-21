'use client';

import { motion, useInView } from 'framer-motion';
import { Award, Target, TrendingUp } from 'lucide-react';
import { useRef } from 'react';
import { AnimatedLinesBadge } from '@/components/ui/animated-lines-badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const targets = [
  {
    icon: TrendingUp,
    target: '50-70%',
    metric: 'Knowledge Retention',
    comparison: 'vs. 10% industry average',
    description: '30-day retention rate',
    color: 'blue',
  },
  {
    icon: Target,
    target: '35-50%',
    metric: 'Skill Application',
    comparison: 'vs. 12% industry average',
    description: 'Skills transferred to the job',
    color: 'cyan',
  },
  {
    icon: Award,
    target: '10:1 - 18:1',
    metric: 'LTV:CAC Ratio',
    comparison: 'Industry-leading efficiency',
    description: 'Customer lifetime value',
    color: 'sky',
  },
];

export function ResultsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string; icon: string }> = {
      blue: {
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        icon: 'group-hover:bg-blue-500',
      },
      cyan: {
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-400',
        icon: 'group-hover:bg-cyan-500',
      },
      sky: {
        border: 'border-sky-500/30',
        bg: 'bg-sky-500/20',
        text: 'text-sky-400',
        icon: 'group-hover:bg-sky-500',
      },
    };
    return colors[color];
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
            <AnimatedLinesBadge>Our Targets</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Measurable Outcomes
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-gray-400">
            We don't just promise better learning—we measure it. These are the outcomes we're
            engineering LXD360 to deliver.
          </p>
        </motion.div>

        {/* Targets grid */}
        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-3">
          {targets.map((item) => {
            const colors = getColorClasses(item.color);
            return (
              <motion.div key={item.metric} variants={itemVariants}>
                <div
                  className={`relative h-full rounded-2xl border ${colors.border} p-2 md:rounded-3xl md:p-3`}
                >
                  <GlowingEffect spread={40} glow={true} proximity={60} />
                  <div className="group relative h-full rounded-xl bg-gray-950 p-8 text-center">
                    <div
                      className={`mb-4 inline-flex rounded-xl ${colors.bg} p-3 ${colors.text} transition-all ${colors.icon} group-hover:text-white`}
                    >
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div className={`mb-2 text-4xl font-bold ${colors.text}`}>{item.target}</div>
                    <h3 className="mb-1 text-lg font-semibold text-white">{item.metric}</h3>
                    <p className="mb-3 text-sm font-medium text-gray-300">{item.comparison}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
