'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { SectionBadge } from '@/components/marketing/shared/SectionBadge';
import type { FeaturedPost } from '@/lib/content/types';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface BlogSectionProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  posts?: FeaturedPost[];
}

/* =============================================================================
   BLOG DATA CONFIGURATION
============================================================================= */

interface BlogPost {
  id: number;
  image: string;
  category: string;
  title: string;
  description: string;
  href: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    image: '/blog/blog-1.jpg',
    category: 'Neuroscience',
    title: 'The Science of Retention',
    description:
      'Discover how spaced repetition and cognitive load management transform learning outcomes. Learn the neuroscience behind effective training.',
    href: '/lxd-nexus',
  },
  {
    id: 2,
    image: '/blog/blog-2.jpg',
    category: 'AI & Automation',
    title: 'AI-Powered Content Creation',
    description:
      'Explore how generative AI is revolutionizing instructional design workflows and cutting content development time by up to 50%.',
    href: '/lxd-nexus',
  },
  {
    id: 3,
    image: '/blog/blog-3.jpg',
    category: 'Case Study',
    title: '50% Faster Development',
    description:
      "See how enterprise clients achieved dramatic efficiency gains with LXD360's unified learning ecosystem approach.",
    href: '/lxd-nexus',
  },
];

/* =============================================================================
   CONSTANTS
============================================================================= */

const CARD_WIDTH = 350;
const CARD_HEIGHT = 400;
const MARGIN = 20;
const CARD_SIZE = CARD_WIDTH + MARGIN;

const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
};

/* =============================================================================
   BLOG CARD COMPONENT
============================================================================= */

interface BlogCardProps {
  post: BlogPost;
}

function BlogCard({ post }: BlogCardProps): React.JSX.Element {
  return (
    <a
      href={post.href}
      className="relative shrink-0 cursor-pointer rounded-[10px] bg-card dark:bg-secondary shadow-md transition-all hover:scale-[1.02] hover:shadow-xl overflow-hidden group"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: MARGIN,
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="350px"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 rounded-[10px] bg-linear-to-b from-black/80 via-black/50 to-black/20 p-6 text-brand-primary transition-all group-hover:backdrop-blur-[2px]">
        {/* Category Badge */}
        {/* WCAG: Using bg-brand-primary for better contrast ratio */}
        <span className="inline-block rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          {post.category}
        </span>

        {/* Title */}
        <h3 className="mt-4 text-2xl font-bold leading-tight">{post.title}</h3>

        {/* Description */}
        <p className="mt-3 text-sm text-lxd-text-light leading-relaxed line-clamp-3">
          {post.description}
        </p>

        {/* Read More Link */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 text-sm font-medium text-blue-300 opacity-0 transition-opacity group-hover:opacity-100">
          <span>Read Article</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function BlogSection({
  badge,
  // heading: _heading,
  // subheading: _subheading,
  // posts: _posts,
}: BlogSectionProps) {
  // Note: Content service posts can be used to override BLOG_POSTS when available
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [offset, setOffset] = useState(0);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate visible cards based on width
  const CARD_BUFFER = width > BREAKPOINTS.lg ? 3 : width > BREAKPOINTS.sm ? 2 : 1;

  const CAN_SHIFT_LEFT = offset < 0;
  const CAN_SHIFT_RIGHT = Math.abs(offset) < CARD_SIZE * (BLOG_POSTS.length - CARD_BUFFER);

  const shiftLeft = () => {
    if (!CAN_SHIFT_LEFT) return;
    setOffset((pv) => pv + CARD_SIZE);
  };

  const shiftRight = () => {
    if (!CAN_SHIFT_RIGHT) return;
    setOffset((pv) => pv - CARD_SIZE);
  };

  return (
    <section className="py-16 md:py-24 bg-card dark:bg-transparent" ref={containerRef}>
      <div className="relative overflow-hidden">
        {/* Section Header */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex items-end justify-between">
            <div>
              {/* Section Badge */}
              {badge && <SectionBadge>{badge}</SectionBadge>}

              {/* Title - WCAG AA compliant gradient text */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                <span className="text-lxd-text-dark-heading dark:text-brand-primary">
                  Insights &{' '}
                </span>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500">
                  Resources
                </span>
              </h2>

              <p className="mt-2 text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-xl">
                Stay ahead with the latest in learning science, AI innovation, and L&D best
                practices.
              </p>
            </div>

            {/* Navigation Buttons (Desktop) - WCAG: aria-labels for icon buttons */}
            <nav className="hidden md:flex items-center gap-2" aria-label="Blog navigation">
              <button
                type="button"
                onClick={shiftLeft}
                disabled={!CAN_SHIFT_LEFT}
                aria-label="View previous blog posts"
                className={`p-3 rounded-full transition-all ${
                  CAN_SHIFT_LEFT
                    ? 'bg-muted dark:bg-secondary hover:bg-muted/70 dark:hover:bg-secondary text-foreground'
                    : 'bg-card dark:bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={shiftRight}
                disabled={!CAN_SHIFT_RIGHT}
                aria-label="View more blog posts"
                className={`p-3 rounded-full transition-all ${
                  CAN_SHIFT_RIGHT
                    ? 'bg-muted dark:bg-secondary hover:bg-muted/70 dark:hover:bg-secondary text-foreground'
                    : 'bg-card dark:bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>

        {/* Cards Container */}
        <div className="container mx-auto px-4">
          <motion.div
            animate={{ x: offset }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex"
          >
            {BLOG_POSTS.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </motion.div>
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="md:hidden flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={shiftLeft}
            disabled={!CAN_SHIFT_LEFT}
            className={`p-3 rounded-full transition-all ${
              CAN_SHIFT_LEFT
                ? 'bg-muted dark:bg-secondary text-foreground'
                : 'bg-card dark:bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={shiftRight}
            disabled={!CAN_SHIFT_RIGHT}
            className={`p-3 rounded-full transition-all ${
              CAN_SHIFT_RIGHT
                ? 'bg-muted dark:bg-secondary text-foreground'
                : 'bg-card dark:bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View All Link */}
        <div className="container mx-auto px-4 mt-8 text-center">
          <a
            href="/lxd-nexus"
            className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue font-medium transition-colors"
          >
            <span>View All Articles</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
