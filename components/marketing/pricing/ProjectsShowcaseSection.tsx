'use client';

/**
 * ProjectsShowcaseSection Component
 * ==================================
 * Portfolio/Projects showcase with card grid layout.
 * Adapted from Lunexa works-v1 template.
 *
 * Features:
 * - Floating badge with blue/purple glow
 * - 4-card grid with images and hover effects
 * - Staggered entrance animations
 * - Gradient overlays on hover
 */

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface ProjectCard {
  _key?: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  category?: string;
}

interface ProjectsShowcaseSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  projects?: ProjectCard[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_PROJECTS: ProjectCard[] = [
  {
    title: 'Learning Portal Design',
    description: 'AI CRM startup design',
    image: '/placeholder.jpg',
    link: '#',
    category: 'UI/UX Design',
  },
  {
    title: 'Mobile Learning App',
    description: 'Playful agency portfolio design',
    image: '/placeholder.jpg',
    link: '#',
    category: 'Mobile App',
  },
  {
    title: 'Enterprise Dashboard',
    description: 'Minimalist interior design showcase',
    image: '/placeholder.jpg',
    link: '#',
    category: 'Web Application',
  },
  {
    title: 'Content Authoring Tool',
    description: 'Bold agency portfolio design',
    image: '/placeholder.jpg',
    link: '#',
    category: 'SaaS Platform',
  },
];

const DEFAULTS = {
  badge: 'Our Projects',
  headline: 'A Showcase of Our Latest Work',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Designed with purpose and impact.',
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex justify-center mb-8"
    >
      <span
        className="px-6 py-2 text-sm font-semibold text-brand-primary rounded-[10px] inline-block bg-(--brand-primary)"
        style={{
          boxShadow:
            '0 4px 20px color-mix(in srgb, var(--brand-secondary) 40%, transparent), 0 8px 40px color-mix(in srgb, var(--brand-secondary) 20%, transparent)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   PROJECT CARD COMPONENT
============================================================================= */
function ProjectCardComponent({ project, index }: { project: ProjectCard; index: number }) {
  return (
    <motion.a
      href={project.link || '#'}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -10 }}
      className="group relative block rounded-[10px] overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.image || '/placeholder.jpg'}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Hover Gradient Border */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 rounded-[10px] pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 30%, transparent), color-mix(in srgb, var(--brand-secondary) 30%, transparent))',
          }}
        />

        {/* Category Badge */}
        {project.category && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.3 }}
            className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold text-brand-primary bg-brand-primary/80 backdrop-blur-xs rounded-full"
          >
            {project.category}
          </motion.span>
        )}

        {/* Arrow Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 w-10 h-10 bg-lxd-light-card rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowUpRight className="w-5 h-5 text-lxd-text-dark-heading" />
        </motion.div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.2 }}
            className="text-xl font-bold text-brand-primary mb-2 group-hover:text-brand-cyan transition-colors"
          >
            {project.title}
          </motion.h3>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.3 }}
            className="text-lxd-text-light-body text-sm"
          >
            {project.description}
          </motion.p>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 -z-10 blur-2xl"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 20%, transparent), color-mix(in srgb, var(--brand-secondary) 20%, transparent))',
        }}
      />
    </motion.a>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function ProjectsShowcaseSection({
  badge,
  headline,
  description,
  projects,
}: ProjectsShowcaseSectionProps) {
  const displayProjects = projects?.length ? projects : DEFAULT_PROJECTS;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-lxd-light-card via-background to-lxd-light-card dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Animated Background Orbs */}
      <motion.div
        animate={{ x: [0, 50, 0], opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-brand-primary blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 0], opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 25, repeat: Infinity, delay: 5 }}
        className="absolute bottom-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-brand-secondary blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-4">
            {headline || DEFAULTS.headline}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {displayProjects.map((project, index) => (
            <ProjectCardComponent key={project._key || index} project={project} index={index} />
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.a
            href="/projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-(--brand-primary) to-(--brand-secondary) text-brand-primary font-semibold rounded-md"
            style={{
              boxShadow: '0 4px 20px color-mix(in srgb, var(--brand-secondary) 30%, transparent)',
            }}
          >
            View All Projects
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowUpRight className="w-5 h-5" />
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
