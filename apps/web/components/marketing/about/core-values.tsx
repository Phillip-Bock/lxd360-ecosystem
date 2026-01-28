'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { Award, Globe, Heart, Lightbulb, Shield, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  size?: 'small' | 'large';
  delay?: number;
}

function ValueCard({
  icon,
  title,
  description,
  color,
  size = 'small',
  delay = 0,
}: ValueCardProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const heightClass = size === 'large' ? 'md:row-span-2' : '';

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50, rotateY: -20 },
        visible: {
          opacity: 1,
          y: 0,
          rotateY: 0,
          transition: {
            duration: 0.7,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      className={`relative group ${heightClass}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className={`relative h-full p-8 rounded-3xl bg-linear-to-br ${color} border border-brand-subtle backdrop-blur-xs overflow-hidden transition-all duration-300 hover:border-white/40 hover:shadow-2xl`}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-lxd-light-card rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-linear-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Icon */}
        <motion.div
          className="mb-6 text-brand-primary"
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block p-4 rounded-2xl bg-lxd-light-card/10 backdrop-blur-xs">
            <div className="h-10 w-10">{icon}</div>
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-brand-primary mb-4 group-hover:scale-105 transition-transform">
          {title}
        </h3>

        {/* Description */}
        <p className="text-brand-primary/90 leading-relaxed text-lg">{description}</p>

        {/* Corner accent */}
        <motion.div
          className="absolute bottom-4 right-4 text-brand-primary/30 group-hover:text-brand-primary/60"
          animate={{
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function CoreValues(): React.JSX.Element {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-900/10 to-transparent" />
      <div className="absolute top-1/3 left-1/5 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/3 right-1/5 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold mb-6">
            <Award className="h-5 w-5" />
            <span>Our Guiding Principles</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6">Core Values</h2>
          <p className="text-xl text-lxd-text-light-body leading-relaxed">
            These principles guide every decision we make, from product design to customer support.
            They&apos;re not aspirational—they&apos;re how we operate every day.
          </p>
        </motion.div>

        {/* Bento Grid of Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <ValueCard
            icon={<Heart className="h-full w-full" />}
            title="Learner-Centricity"
            description="Every design choice starts with the learner's cognitive experience. We don't build for ourselves—we build for the humans on the other side of the screen."
            color="from-pink-600/40 via-rose-600/40 to-red-600/40"
            size="large"
            delay={0.1}
          />

          <ValueCard
            icon={<Lightbulb className="h-full w-full" />}
            title="Innovation"
            description="We challenge assumptions and embrace emerging technologies to solve old problems in new ways."
            color="from-yellow-600/40 via-amber-600/40 to-orange-600/40"
            size="small"
            delay={0.2}
          />

          <ValueCard
            icon={<Shield className="h-full w-full" />}
            title="Integrity"
            description="Transparency, ethical AI, and data privacy aren't checkboxes—they're non-negotiable foundations."
            color="from-blue-600/40 via-cyan-600/40 to-teal-600/40"
            size="small"
            delay={0.3}
          />

          <ValueCard
            icon={<TrendingUp className="h-full w-full" />}
            title="Excellence"
            description="We set the bar high and refuse to ship mediocrity. Good enough isn't good enough when learning outcomes are on the line."
            color="from-green-600/40 via-emerald-600/40 to-teal-600/40"
            size="small"
            delay={0.4}
          />

          <ValueCard
            icon={<Users className="h-full w-full" />}
            title="Collaboration"
            description="Great learning experiences are built by diverse teams working in sync. We value every voice and foster a culture of mutual respect and shared ownership."
            color="from-purple-600/40 via-violet-600/40 to-indigo-600/40"
            size="large"
            delay={0.5}
          />

          <ValueCard
            icon={<Globe className="h-full w-full" />}
            title="Impact"
            description="We measure success by the real-world outcomes our platform enables—skills gained, careers advanced, businesses transformed."
            color="from-indigo-600/40 via-blue-600/40 to-cyan-600/40"
            size="small"
            delay={0.6}
          />
        </div>

        {/* Bottom Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mt-20"
        >
          <div className="p-8 rounded-2xl bg-linear-to-r from-indigo-900/30 via-purple-900/30 to-indigo-900/30 border border-indigo-500/30 backdrop-blur-xs">
            <h3 className="text-3xl font-bold text-brand-primary mb-4">Values in Action</h3>
            <p className="text-lg text-lxd-text-light-body leading-relaxed">
              These aren&apos;t just words on a wall. They shape our product roadmap, our hiring
              decisions, our customer relationships, and our culture. When you work with LXP360, you
              experience these values in every interaction.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
