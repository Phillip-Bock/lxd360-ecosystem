'use client';

import { motion, useInView } from 'framer-motion';
import { Brain, Glasses } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { AnimatedLinesBadge } from '@/components/ui/animated-lines-badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const initiatives = [
  {
    id: 'lxp360',
    title: 'LXP360 AI/ML Platform',
    description:
      'An all-in-one Learning Management System (LMS), Learning Experience Platform (LXP), and Learning Record Store (LRS) powered by artificial intelligence. Deliver personalized learning paths, intelligent content recommendations, and comprehensive analytics.',
    icon: Brain,
    features: ['AI-Powered Personalization', 'xAPI Compliant', 'Advanced Analytics'],
    gradient: 'from-blue-600 to-cyan-500',
    size: 'large',
    logo: '/images/lxp360-20saas-20logo.png',
  },
  {
    id: 'inspire',
    title: 'INSPIRE Studio',
    description:
      'A cloud-native AI-powered authoring platform that transforms course creation. Create neuroscience-backed learning experiences with integrated cognitive load management, WCAG 2.2 AA accessibility, and multi-format export (SCORM, xAPI, cmi5).',
    icon: Glasses,
    features: ['AI-Powered Content Generation', 'Cognitive Load Calculator', 'Multi-Format Export'],
    gradient: 'from-sky-600 to-blue-500',
    size: 'medium',
    logo: '/images/inspire-studio-logo.png',
  },
];

export function InitiativesSection() {
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
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
            <AnimatedLinesBadge>What's Coming</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Launching Soon
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-gray-400">
            Two powerful solutions designed to transform how your organization approaches learning
            and development.
          </p>
        </motion.div>

        {/* Stacked rows with alternating text/image layout */}
        <div className="flex flex-col gap-6">
          {/* Row 1: LXP360 - Text left, Image right */}
          <motion.div variants={itemVariants}>
            <div className="relative rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
              <GlowingEffect spread={50} glow={true} proximity={70} />
              <div className="group relative overflow-hidden rounded-xl bg-gray-950 p-8">
                <div
                  className={`absolute -right-20 -top-20 h-60 w-60 rounded-full bg-linear-to-br ${initiatives[0].gradient} opacity-20 blur-3xl transition-opacity group-hover:opacity-30`}
                />
                <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
                  {/* Text content - Left */}
                  <div className="flex flex-col">
                    {initiatives[0].logo && (
                      <div className="mb-6 flex justify-start">
                        <Image
                          src={initiatives[0].logo || '/placeholder.svg'}
                          alt="LXP360 Logo"
                          width={140}
                          height={56}
                          className="opacity-90"
                        />
                      </div>
                    )}
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`inline-flex rounded-2xl bg-linear-to-br ${initiatives[0].gradient} p-3 text-white`}
                      >
                        <Brain className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{initiatives[0].title}</h3>
                    </div>
                    <p className="mb-6 text-gray-400">{initiatives[0].description}</p>
                    <div className="flex flex-wrap gap-2">
                      {initiatives[0].features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Image - Right */}
                  <div className="flex items-center justify-center">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900/50">
                      <Image
                        src="/images/lxp360-preview.png"
                        alt="LXP360 Platform Preview"
                        fill
                        className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Row 2: INSPIRE - Image left, Text right */}
          <motion.div variants={itemVariants}>
            <div className="relative rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
              <GlowingEffect spread={50} glow={true} proximity={70} />
              <div className="group relative overflow-hidden rounded-xl bg-gray-950 p-8">
                <div
                  className={`absolute -left-20 -top-20 h-60 w-60 rounded-full bg-linear-to-br ${initiatives[1].gradient} opacity-20 blur-3xl transition-opacity group-hover:opacity-30`}
                />
                <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
                  {/* Image - Left */}
                  <div className="order-2 flex items-center justify-center md:order-1">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900/50">
                      <Image
                        src="/images/inspire-preview.png"
                        alt="INSPIRE Studio Preview"
                        fill
                        className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                  </div>
                  {/* Text content - Right */}
                  <div className="order-1 flex flex-col md:order-2">
                    {initiatives[1].logo && (
                      <div className="mb-6 flex justify-start">
                        <Image
                          src={initiatives[1].logo || '/placeholder.svg'}
                          alt="INSPIRE Studio Logo"
                          width={140}
                          height={56}
                          className="opacity-90"
                        />
                      </div>
                    )}
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`inline-flex rounded-2xl bg-linear-to-br ${initiatives[1].gradient} p-3 text-white`}
                      >
                        <Glasses className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{initiatives[1].title}</h3>
                    </div>
                    <p className="mb-6 text-gray-400">{initiatives[1].description}</p>
                    <div className="flex flex-wrap gap-2">
                      {initiatives[1].features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sm text-sky-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
