'use client';

import { motion, useAnimate, useDragControls, useMotionValue } from 'framer-motion';
import { Building2, Globe, Heart, Plane, Satellite, Shield } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import useMeasure from 'react-use-measure';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GlobalReachSection = (): React.JSX.Element => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Section Header */}
      <div className="text-center mb-8 px-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-2 mb-6 text-sm font-medium text-brand-cyan bg-brand-accent/10 rounded-full border border-brand-accent/20"
        >
          Worldwide Deployment
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-primary tracking-tight"
          style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 4px 60px rgba(6, 182, 212, 0.3)',
          }}
        >
          Global Reach
        </motion.h2>
      </div>

      {/* 3D Earth Container */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px] mx-4 md:mx-8 lg:mx-16">
        {/* Placeholder for 3D Earth (removed GlobalReachScene component) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="w-48 h-48 text-brand-cyan/30 animate-pulse" />
        </div>

        {/* Connect Button - Centered below Earth with gradient shadow effect */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative w-fit transition-transform duration-300 active:scale-95"
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative z-10 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 p-0.5 duration-300 group-hover:scale-105"
            >
              <span className="flex items-center gap-3 rounded-md bg-lxd-dark-page px-8 py-4 font-semibold text-lxd-text-light duration-300 group-hover:bg-lxd-dark-page/50 group-hover:text-brand-primary group-active:bg-lxd-dark-page/80 text-lg">
                <Satellite className="w-7 h-7" />
                <span>Connect</span>
              </span>
            </button>
            <span className="pointer-events-none absolute -inset-4 z-0 transform-gpu rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 opacity-30 blur-xl transition-all duration-300 group-hover:opacity-70 group-active:opacity-50" />
          </motion.div>
        </div>

        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Drag Close Drawer */}
      <DragCloseDrawer open={drawerOpen} setOpen={setDrawerOpen}>
        <DrawerContent />
      </DragCloseDrawer>
    </section>
  );
};

// ============================================================================
// DRAG CLOSE DRAWER
// ============================================================================

interface DragCloseDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}

const DragCloseDrawer = ({ open, setOpen, children }: DragCloseDrawerProps): React.JSX.Element => {
  const [scope, animate] = useAnimate();
  const [drawerRef, { height }] = useMeasure();

  const y = useMotionValue(0);
  const controls = useDragControls();

  const handleClose = async (): Promise<void> => {
    animate(scope.current, {
      opacity: [1, 0],
    });

    const yStart = typeof y.get() === 'number' ? y.get() : 0;

    await animate('#drawer', {
      y: [yStart, height],
    });

    setOpen(false);
  };

  return (
    <>
      {open && (
        <motion.div
          ref={scope}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 backdrop-blur-xs"
          style={{ backgroundColor: 'rgba(0, 29, 61, 0.9)' }}
        >
          <motion.div
            id="drawer"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{
              ease: 'easeInOut',
            }}
            className="absolute bottom-0 h-[80vh] w-full overflow-hidden rounded-t-3xl border-t border-brand-accent/20"
            style={{
              y,
              backgroundColor: 'var(--lxd-blue-dark-700)',
            }}
            drag="y"
            dragControls={controls}
            onDragEnd={() => {
              if (y.get() >= 100) {
                handleClose();
              }
            }}
            dragListener={false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.5,
            }}
          >
            {/* Drag Handle */}
            <div
              className="absolute left-0 right-0 top-0 z-10 flex justify-center p-4"
              style={{ backgroundColor: 'var(--lxd-blue-dark-700)' }}
            >
              <button
                type="button"
                onPointerDown={(e) => {
                  controls.start(e);
                }}
                className="h-2 w-14 cursor-grab touch-none rounded-full bg-brand-accent/50 hover:bg-brand-accent/70 active:cursor-grabbing transition-colors"
              />
            </div>
            {/* Content */}
            <div className="relative z-0 h-full overflow-y-auto p-4 pt-12">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// ============================================================================
// DRAWER CONTENT
// ============================================================================

const DrawerContent = (): React.JSX.Element => {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Globe className="w-16 h-16 mx-auto text-brand-cyan mb-4" />
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary"
            style={{
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            }}
          >
            Global Reach & Strategic Market Focus
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-brand-cyan font-medium max-w-3xl mx-auto"
        >
          Designed for cloud-native agility, we deliver high-security learning solutions to the
          world&apos;s most demanding sectors.
        </motion.p>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-lxd-light-card/5 backdrop-blur-xs rounded-2xl p-6 md:p-8 border border-brand-subtle"
      >
        <p className="text-base md:text-lg text-lxd-text-light-body leading-relaxed">
          Our platform is built on Google Cloud Platform (GCP) and architected for global,
          low-latency delivery. We specialize in providing unified, secure solutions to
          organizations with mission-critical training needs. Our primary focus spans regulated
          industries—including Defense, Aerospace, Finance, and Healthcare—where training
          compliance, high-fidelity simulation, and data security are non-negotiable. Furthermore,
          our certified Service-Disabled Veteran-Owned Small Business (SDVOSB) status provides
          unique access to the federal marketplace, ensuring we partner with government agencies
          committed to modernizing their workforce development.
        </p>
      </motion.div>

      {/* Industry Focus Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <IndustryCard icon={<Shield className="w-8 h-8" />} title="Defense" />
        <IndustryCard icon={<Plane className="w-8 h-8" />} title="Aerospace" />
        <IndustryCard icon={<Building2 className="w-8 h-8" />} title="Finance" />
        <IndustryCard icon={<Heart className="w-8 h-8" />} title="Healthcare" />
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <FeatureCard
          title="Cloud-Native"
          description="Built on GCP for global, low-latency delivery"
        />
        <FeatureCard
          title="FedRAMP Ready"
          description="Architected for the highest security standards"
        />
        <FeatureCard
          title="SDVOSB Certified"
          description="Unique access to federal marketplace opportunities"
        />
      </motion.div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface IndustryCardProps {
  icon: React.ReactNode;
  title: string;
}

const IndustryCard = ({ icon, title }: IndustryCardProps): React.JSX.Element => (
  <div className="flex flex-col items-center gap-3 p-4 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-brand-accent/20 hover:border-brand-accent/40 transition-colors">
    <div className="text-brand-cyan">{icon}</div>
    <span className="text-brand-primary font-medium text-sm">{title}</span>
  </div>
);

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard = ({ title, description }: FeatureCardProps): React.JSX.Element => (
  <div className="p-5 bg-lxd-light-card/5 rounded-xl border border-brand-subtle hover:border-brand-accent/30 transition-colors">
    <h4 className="text-brand-primary font-semibold mb-2">{title}</h4>
    <p className="text-lxd-text-light-muted text-sm">{description}</p>
  </div>
);
