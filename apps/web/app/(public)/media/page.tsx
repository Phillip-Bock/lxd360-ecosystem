import { Radio } from 'lucide-react';
import type { Metadata } from 'next';
import { ComingSoon } from '@/components/marketing/shared';

/**
 * @stub LXD-333
 * @route /media
 * @description Media Hub - Blog posts, videos, webinars, and learning resources
 * @status placeholder
 */

export const metadata: Metadata = {
  title: 'Media Hub - LXD360',
  description:
    'Explore our media hub featuring blog posts, videos, webinars, and expert insights on learning experience design, neuroscience-backed training, and L&D innovation.',
  openGraph: {
    title: 'Media Hub - LXD360',
    description: 'Blog posts, videos, webinars, and expert insights on learning experience design.',
  },
};

export default function MediaPage(): React.JSX.Element {
  return (
    <ComingSoon
      title="Media Hub"
      description="Your destination for cutting-edge insights on learning experience design, neuroscience-backed training methodologies, and L&D innovation."
      icon={<Radio className="w-12 h-12" />}
      features={['Blog Articles', 'Video Content', 'Webinars', 'Case Studies', 'Research Papers']}
      badgeText="Coming Soon"
    />
  );
}
