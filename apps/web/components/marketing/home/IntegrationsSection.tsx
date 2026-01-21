'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { SectionBadge } from '@/components/marketing/shared/SectionBadge';
import type { IntegrationLogo } from '@/lib/content/types';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface IntegrationsSectionProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  logos?: IntegrationLogo[];
}

/* =============================================================================
   INTEGRATION ORB DATA
   Position and animation config for each floating integration icon
============================================================================= */

interface OrbConfig {
  id: number;
  imageSrc: string;
  // Base position (percentage from center)
  baseX: number;
  baseY: number;
  // Animation parameters
  floatRadius: number;
  floatDuration: number;
  floatDelay: number;
  // Size
  size: number;
}

// 10 integration orbs positioned around the center logo
const ORBS: OrbConfig[] = [
  {
    id: 1,
    imageSrc: '/integrations/integration-1.png',
    baseX: -35,
    baseY: -30,
    floatRadius: 15,
    floatDuration: 8,
    floatDelay: 0,
    size: 70,
  },
  {
    id: 2,
    imageSrc: '/integrations/integration-2.png',
    baseX: 0,
    baseY: -42,
    floatRadius: 12,
    floatDuration: 9,
    floatDelay: 0.5,
    size: 65,
  },
  {
    id: 3,
    imageSrc: '/integrations/integration-3.png',
    baseX: 35,
    baseY: -30,
    floatRadius: 14,
    floatDuration: 7,
    floatDelay: 1,
    size: 70,
  },
  {
    id: 4,
    imageSrc: '/integrations/integration-4.png',
    baseX: 45,
    baseY: 0,
    floatRadius: 13,
    floatDuration: 10,
    floatDelay: 1.5,
    size: 60,
  },
  {
    id: 5,
    imageSrc: '/integrations/integration-5.png',
    baseX: 35,
    baseY: 30,
    floatRadius: 15,
    floatDuration: 8,
    floatDelay: 2,
    size: 68,
  },
  {
    id: 6,
    imageSrc: '/integrations/integration-6.png',
    baseX: 0,
    baseY: 42,
    floatRadius: 11,
    floatDuration: 9,
    floatDelay: 2.5,
    size: 65,
  },
  {
    id: 7,
    imageSrc: '/integrations/integration-7.png',
    baseX: -35,
    baseY: 30,
    floatRadius: 14,
    floatDuration: 7,
    floatDelay: 3,
    size: 70,
  },
  {
    id: 8,
    imageSrc: '/integrations/integration-8.png',
    baseX: -45,
    baseY: 0,
    floatRadius: 12,
    floatDuration: 10,
    floatDelay: 3.5,
    size: 62,
  },
  {
    id: 9,
    imageSrc: '/integrations/integration-9.png',
    baseX: -20,
    baseY: -40,
    floatRadius: 13,
    floatDuration: 8,
    floatDelay: 4,
    size: 55,
  },
  {
    id: 10,
    imageSrc: '/integrations/integration-10.png',
    baseX: 20,
    baseY: 40,
    floatRadius: 14,
    floatDuration: 9,
    floatDelay: 4.5,
    size: 58,
  },
];

/* =============================================================================
   ELECTRIC ARC COMPONENT
   SVG-based animated electricity connecting an orb to the center
============================================================================= */

interface ElectricArcProps {
  startX: number;
  startY: number;
  isActive: boolean;
}

function ElectricArc({ startX, startY, isActive }: ElectricArcProps): React.JSX.Element | null {
  // Generate a jagged lightning path from orb position to center (0,0)
  const generateLightningPath = useCallback(() => {
    const segments = 6;
    const points: { x: number; y: number }[] = [{ x: startX, y: startY }];

    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const baseX = startX * (1 - progress);
      const baseY = startY * (1 - progress);
      // Add randomness perpendicular to the line
      const perpX = -startY / Math.sqrt(startX * startX + startY * startY);
      const perpY = startX / Math.sqrt(startX * startX + startY * startY);
      const jitter = (Math.random() - 0.5) * 20;
      points.push({
        x: baseX + perpX * jitter,
        y: baseY + perpY * jitter,
      });
    }
    points.push({ x: 0, y: 0 });

    return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }, [startX, startY]);

  const [path, setPath] = useState('');

  useEffect(() => {
    if (isActive) {
      // Regenerate path multiple times during the active period for flickering effect
      const interval = setInterval(() => {
        setPath(generateLightningPath());
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isActive, generateLightningPath]);

  if (!isActive) return null;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.6, times: [0, 0.1, 0.7, 1] }}
    >
      {/* Glow layer */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#electricGlow)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#glow)"
        opacity={0.6}
      />
      {/* Main lightning */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#electricGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Bright core */}
      <motion.path
        d={path}
        fill="none"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.8}
      />
    </motion.g>
  );
}

/* =============================================================================
   FLOATING ORB COMPONENT
   Individual integration icon with floating animation
============================================================================= */

interface FloatingOrbProps {
  orb: OrbConfig;
  isZapping: boolean;
}

function FloatingOrb({ orb, isZapping }: FloatingOrbProps): React.JSX.Element {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${orb.baseX}%)`,
        top: `calc(50% + ${orb.baseY}%)`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        x: [0, orb.floatRadius, 0, -orb.floatRadius, 0],
        y: [0, -orb.floatRadius / 2, orb.floatRadius, -orb.floatRadius / 2, 0],
      }}
      transition={{
        duration: orb.floatDuration,
        delay: orb.floatDelay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Glow effect when zapping */}
      <motion.div
        className="absolute inset-0 rounded-full bg-brand-secondary"
        initial={{ scale: 1, opacity: 0 }}
        animate={isZapping ? { scale: 1.5, opacity: [0, 0.6, 0] } : { scale: 1, opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ filter: 'blur(15px)' }}
      />

      {/* Orb container with glow border */}
      <div className="relative">
        <div
          className="absolute -inset-1 rounded-full opacity-60 blur-sm"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #3b82f6)',
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        <div
          className="relative rounded-full overflow-hidden border-2 border-purple-400/30 shadow-lg shadow-purple-500/20"
          style={{ width: orb.size, height: orb.size }}
        >
          <Image src={orb.imageSrc} alt={`Integration ${orb.id}`} fill className="object-cover" />
        </div>
      </div>
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function IntegrationsSection({
  badge,
  // heading: _heading,
  // subheading: _subheading,
  // logos: _logos,
}: IntegrationsSectionProps) {
  // Note: Content service logos can be used to override orbs when available
  const [activeZap, setActiveZap] = useState<number | null>(null);

  // Randomly fire electricity from orbs to center
  useEffect(() => {
    const fireElectricity = () => {
      const randomOrb = ORBS[Math.floor(Math.random() * ORBS.length)];
      setActiveZap(randomOrb.id);

      // Clear after animation completes
      setTimeout(() => setActiveZap(null), 600);
    };

    // Fire electricity at random intervals (1.5-3.5 seconds)
    const scheduleNext = () => {
      const delay = 1500 + Math.random() * 2000;
      return setTimeout(() => {
        fireElectricity();
        scheduleNext();
      }, delay);
    };

    // Initial fire after 1 second
    const initialTimeout = setTimeout(() => {
      fireElectricity();
      scheduleNext();
    }, 1000);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-card dark:bg-transparent">
      <div className="container mx-auto px-4">
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          {/* Section Badge */}
          {badge && (
            <div className="flex justify-center mb-6">
              <SectionBadge>{badge}</SectionBadge>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              The 360° Vision:{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 via-blue-500 to-purple-600">
              Neuroscience-Informed Learning, Unified.
            </span>
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted leading-relaxed">
            LXD360 integrates every critical function—from compliance to XR simulation—guided by the
            INSPIRE™ framework to ensure excellence at every touchpoint.
          </p>
        </div>

        {/* =========================================================================
            INTEGRATION VISUALIZATION
            Central logo surrounded by floating orbs with electric connections
        ========================================================================= */}
        <div className="relative w-full max-w-4xl mx-auto aspect-square md:aspect-[4/3]">
          {/* SVG Layer for Electric Arcs */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="-50 -50 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Gradient and filter definitions */}
            <defs>
              <linearGradient id="electricGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="electricGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Electric arcs from orbs to center */}
            {ORBS.map((orb) => (
              <ElectricArc
                key={orb.id}
                startX={orb.baseX * 0.9}
                startY={orb.baseY * 0.9}
                isActive={activeZap === orb.id}
              />
            ))}
          </svg>

          {/* Floating Integration Orbs */}
          {ORBS.map((orb) => (
            <FloatingOrb key={orb.id} orb={orb} isZapping={activeZap === orb.id} />
          ))}

          {/* Center Logo */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: activeZap ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -inset-8 rounded-full opacity-40 blur-2xl"
              style={{
                background: 'radial-gradient(circle, #8b5cf6 0%, #3b82f6 50%, transparent 70%)',
              }}
            />

            {/* Pulse glow on zap */}
            <motion.div
              className="absolute -inset-4 rounded-full bg-brand-secondary"
              initial={{ scale: 1, opacity: 0 }}
              animate={activeZap ? { scale: 1.8, opacity: [0, 0.4, 0] } : { scale: 1, opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ filter: 'blur(20px)' }}
            />

            {/* Logo container */}
            <div className="relative">
              <div
                className="absolute -inset-2 rounded-full opacity-70 blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #8b5cf6)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 4s ease-in-out infinite',
                }}
              />
              <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-purple-400/40 shadow-2xl shadow-purple-500/30 bg-background">
                <Image
                  src="/integrations/center-logo.png"
                  alt="LXD360 Logo"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
