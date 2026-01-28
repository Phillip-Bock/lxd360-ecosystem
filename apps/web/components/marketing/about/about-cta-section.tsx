'use client';

import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Zap } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { GradientShadowButton } from '@/components/ui/gradient-shadow-button';

// ============================================================================
// NEURAL NETWORK CANVAS - Animated constellation background
// ============================================================================

const NeuralNetworkCanvas = (): React.JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const nodesRef = useRef<Node[]>([]);

  interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    pulsePhase: number;
    connections: number[];
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    const nodeCount = 60;
    const nodes: Node[] = [];
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        pulsePhase: Math.random() * Math.PI * 2,
        connections: [],
      });
    }
    nodesRef.current = nodes;

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.001;

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        // Draw connections to nearby nodes
        nodes.forEach((otherNode, j) => {
          if (i >= j) return;
          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150;

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.3;
            const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.5 + 0.5;

            // Gradient line
            const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
            gradient.addColorStop(0, `rgba(6, 182, 212, ${opacity * pulse})`);
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * pulse * 1.5})`);
            gradient.addColorStop(1, `rgba(59, 130, 246, ${opacity * pulse})`);

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw node with pulsing glow
        const pulse = Math.sin(time * 3 + node.pulsePhase) * 0.5 + 0.5;
        const glowRadius = node.radius * (2 + pulse * 2);

        // Outer glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        glow.addColorStop(0, `rgba(139, 92, 246, ${0.4 * pulse})`);
        glow.addColorStop(0.5, `rgba(6, 182, 212, ${0.2 * pulse})`);
        glow.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }} />
  );
};

// ============================================================================
// FLOATING ICON COMPONENT
// ============================================================================

interface FloatingIconProps {
  icon: React.ReactNode;
  delay: number;
  duration: number;
  x: string;
  y: string;
}

const FloatingIcon = ({ icon, delay, duration, x, y }: FloatingIconProps): React.JSX.Element => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    animate={{
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
    }}
    style={{ left: x, top: y }}
    className="absolute hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-lxd-light-card/5 backdrop-blur-xs border border-brand-subtle text-brand-purple"
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {icon}
    </motion.div>
  </motion.div>
);

// ============================================================================
// PULSING RING COMPONENT
// ============================================================================

const PulsingRings = (): React.JSX.Element => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-brand-secondary/20"
        initial={{ width: 100, height: 100, opacity: 0 }}
        animate={{
          width: [100 + i * 100, 200 + i * 150, 100 + i * 100],
          height: [100 + i * 100, 200 + i * 150, 100 + i * 100],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.5,
        }}
      />
    ))}
  </div>
);

// ============================================================================
// ANIMATED BORDER COMPONENT
// ============================================================================

const AnimatedBorder = (): React.JSX.Element => (
  <div className="absolute -inset-[2px] rounded-[28px] overflow-hidden">
    {/* Primary rotating gradient */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0"
      style={{
        background: `conic-gradient(
          from 0deg,
          transparent 0deg,
          transparent 30deg,
          #06b6d4 90deg,
          var(--color-neural-purple) 180deg,
          var(--info) 270deg,
          transparent 330deg,
          transparent 360deg
        )`,
      }}
    />

    {/* Secondary counter-rotating gradient */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 opacity-50"
      style={{
        background: `conic-gradient(
          from 180deg,
          transparent 0deg,
          transparent 60deg,
          #a855f7 120deg,
          #06b6d4 180deg,
          var(--color-neural-purple) 240deg,
          transparent 300deg,
          transparent 360deg
        )`,
      }}
    />

    {/* Glow overlay */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 blur-sm opacity-70"
      style={{
        background: `conic-gradient(
          from 90deg,
          transparent 0deg,
          transparent 45deg,
          #06b6d4 135deg,
          #a855f7 180deg,
          var(--info) 225deg,
          transparent 315deg,
          transparent 360deg
        )`,
      }}
    />

    {/* Inner mask */}
    <div className="absolute inset-[2px] bg-studio-bg-dark rounded-[26px]" />
  </div>
);

// ============================================================================
// STAT COUNTER COMPONENT
// ============================================================================

interface StatProps {
  value: string;
  label: string;
  delay: number;
}

const Stat = ({ value, label, delay }: StatProps): React.JSX.Element => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <div
      className="text-3xl md:text-4xl font-bold"
      style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, var(--info) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {value}
    </div>
    <div className="text-sm text-lxd-text-light-muted mt-1">{label}</div>
  </motion.div>
);

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface AboutCTASectionProps {
  badge?: string;
  headline?: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{ _key: string; value: string; label: string }>;
  trustIndicators?: string[];
}

// Default values
const defaults = {
  badge: 'Transform Your L&D',
  headline: 'Experience the Future of LXD',
  subtitle: 'Transform Training from a Cost Center to a Growth Engine.',
  description:
    'Ready to eliminate vendor sprawl, maximize performance, and apply neuroscience to guarantee skill transfer? Stop paying the fragmentation tax and see how the unified LXD360 ecosystem delivers measurable ROI and future-proofs your workforce.',
  stats: [
    { _key: 'stat1', value: '3x', label: 'Average ROI' },
    { _key: 'stat2', value: '85%', label: 'Skill Retention' },
    { _key: 'stat3', value: '60%', label: 'Time Saved' },
  ],
  trustIndicators: ['14-Day Free Trial', 'No Credit Card Required', 'SDVOSB Certified'],
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AboutCTASection = ({
  badge,
  headline,
  subtitle,
  description,
  stats,
  trustIndicators,
}: AboutCTASectionProps): React.JSX.Element => {
  // Use props or fallback to defaults
  const displayBadge = badge || defaults.badge;
  const displayHeadline = headline || defaults.headline;
  const displaySubtitle = subtitle || defaults.subtitle;
  const displayDescription = description || defaults.description;
  const displayStats = stats && stats.length > 0 ? stats : defaults.stats;
  const displayTrustIndicators =
    trustIndicators && trustIndicators.length > 0 ? trustIndicators : defaults.trustIndicators;

  return (
    <section className="relative bg-studio-bg-dark py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0">
        <NeuralNetworkCanvas />
      </div>

      {/* Pulsing Rings */}
      <PulsingRings />

      {/* Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px]" />
      </div>

      {/* Floating Icons */}
      <FloatingIcon icon={<Brain className="w-7 h-7" />} delay={0} duration={4} x="10%" y="20%" />
      <FloatingIcon
        icon={<Target className="w-7 h-7" />}
        delay={0.2}
        duration={5}
        x="85%"
        y="25%"
      />
      <FloatingIcon icon={<Zap className="w-7 h-7" />} delay={0.4} duration={4.5} x="8%" y="70%" />
      <FloatingIcon
        icon={<TrendingUp className="w-7 h-7" />}
        delay={0.6}
        duration={5.5}
        x="88%"
        y="65%"
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Card with Animated Border */}
        <div className="relative">
          <AnimatedBorder />

          {/* Content Card */}
          <div className="relative z-10 bg-studio-bg-dark/90 backdrop-blur-xl rounded-[26px] p-8 md:p-12 lg:p-16 border border-white/5">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-brand-accent/30 text-brand-cyan text-sm font-medium">
                <Zap className="w-4 h-4" />
                {displayBadge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6"
              style={{
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              }}
            >
              <span className="text-brand-primary">
                {displayHeadline.split(' ').slice(0, -2).join(' ')}{' '}
              </span>
              <span
                className="relative"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, var(--info) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {displayHeadline.split(' ').slice(-2).join(' ')}
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-brand-cyan font-medium text-center mb-6"
            >
              {displaySubtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-lxd-text-light-body text-center max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              {displayDescription}
            </motion.p>

            {/* CTA Buttons - Three gradient shadow buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <GradientShadowButton href="/inspire-studio" variant="primary">
                Create AI-Powered Content Fast
              </GradientShadowButton>
              <GradientShadowButton href="/lxd-ecosystem" variant="secondary">
                Unify Your Entire Tech Stack
              </GradientShadowButton>
              <GradientShadowButton href="/solutions" variant="tertiary">
                Design Your L&D Strategy Blueprint
              </GradientShadowButton>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-brand-subtle"
            >
              {displayStats.map((stat, index) => (
                <Stat
                  key={stat._key}
                  value={stat.value}
                  label={stat.label}
                  delay={0.6 + index * 0.1}
                />
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-lxd-text-light-muted"
            >
              {displayTrustIndicators.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-brand-cyan"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
