'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// ============================================================================
// Component
// ============================================================================

export function FuturisticBackground(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate particles
  const particles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[hsl(222,47%,6%)] via-[hsl(222,47%,8%)] to-[hsl(222,47%,4%)]" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, hsl(217 91% 60% / 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, hsl(271 91% 65% / 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 40% 80%, hsl(330 81% 60% / 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 90% 70%, hsl(142 71% 45% / 0.08) 0%, transparent 35%)
            `,
          }}
        />
      </div>

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(217 91% 60%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217 91% 60%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[hsl(217,91%,60%,0.5)] to-transparent"
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, hsl(217 91% 60% / 0.8) 0%, transparent 70%)`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(217 91% 60% / 0.5)`,
          }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
      ))}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[hsl(217,91%,60%,0.2)] rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[hsl(217,91%,60%,0.2)] rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[hsl(217,91%,60%,0.2)] rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[hsl(217,91%,60%,0.2)] rounded-br-3xl" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, hsl(222 47% 4% / 0.4) 100%)',
        }}
      />
    </div>
  );
}
