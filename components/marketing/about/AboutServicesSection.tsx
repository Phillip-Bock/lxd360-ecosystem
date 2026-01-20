'use client';

import { motion } from 'framer-motion';
import { Headphones, type LucideIcon, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface ContentImage {
  asset?: { url: string };
}

interface ServiceCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string | ContentImage;
}

// Helper to extract URL from image
function getImageUrl(image?: string | ContentImage): string {
  if (!image) return '/placeholder.jpg';
  if (typeof image === 'string') return image;
  return image.asset?.url || '/placeholder.jpg';
}

interface AboutServicesSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  services?: ServiceCard[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  TrendingUp,
  Headphones,
};

const DEFAULT_SERVICES: ServiceCard[] = [
  {
    title: 'Optimize User Experience',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    icon: 'Sparkles',
    image: '/placeholder.jpg',
  },
  {
    title: 'Maximize Revenue Potential',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    icon: 'TrendingUp',
    image: '/placeholder.jpg',
  },
  {
    title: 'Reliable Online Assistance',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    icon: 'Headphones',
    image: '/placeholder.jpg',
  },
];

const DEFAULTS = {
  badge: 'Our Services',
  headline: 'Simplify Your Tasks With\nOur Solutions',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }): React.JSX.Element {
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
   SERVICE CARD COMPONENT
============================================================================= */
interface ServiceCardProps {
  service: ServiceCard;
  index: number;
}

function ServiceCardComponent({ service, index }: ServiceCardProps): React.JSX.Element {
  const Icon = ICON_MAP[service.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative bg-lxd-light-card dark:bg-lxd-dark-page/50 rounded-[10px] overflow-hidden border border-lxd-light-border dark:border-lxd-dark-border hover:border-brand-primary/50 transition-all duration-300"
    >
      {/* Card Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={getImageUrl(service.image)}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Floating Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', delay: index * 0.15 + 0.3 }}
          className="absolute bottom-4 left-4"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="w-14 h-14 rounded-[10px] bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            style={{
              boxShadow: '0 4px 20px color-mix(in srgb, var(--brand-secondary) 40%, transparent)',
            }}
          >
            <Icon className="w-7 h-7 text-brand-primary" />
          </motion.div>
        </motion.div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-lxd-text-dark-heading dark:text-brand-primary mb-3 group-hover:text-brand-blue dark:group-hover:text-brand-cyan transition-colors">
          {service.title}
        </h3>
        <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted text-sm leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Learn More Link */}
        <motion.button
          whileHover={{ x: 5 }}
          className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-cyan font-semibold text-sm"
        >
          Discover More
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            &rarr;
          </motion.span>
        </motion.button>
      </div>

      {/* Hover Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-[10px] pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 40px color-mix(in srgb, var(--brand-primary) 10%, transparent)',
        }}
      />
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function AboutServicesSection({
  badge,
  headline,
  description,
  services,
}: AboutServicesSectionProps): React.JSX.Element {
  const displayServices = services?.length ? services : DEFAULT_SERVICES;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/20 to-transparent dark:via-blue-950/10" />

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              {headlineParts[0]}
            </span>
            {headlineParts[1] && (
              <>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">
                  {headlineParts[1]}
                </span>
              </>
            )}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, index) => (
            <ServiceCardComponent key={service._key || index} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
