import { Mic } from 'lucide-react';
import type { Metadata } from 'next';
import { ComingSoon } from '@/components/marketing/shared';

/**
 * @stub LXD-334
 * @route /podcast
 * @description LXD360 Podcast - Conversations on learning, neuroscience, and L&D
 * @status placeholder
 */

export const metadata: Metadata = {
  title: 'Podcast - LXD360',
  description:
    'Listen to the LXD360 Podcast featuring conversations with industry leaders on learning experience design, neuroscience in training, and the future of corporate learning.',
  openGraph: {
    title: 'Podcast - LXD360',
    description:
      'Conversations with industry leaders on learning experience design and the future of L&D.',
  },
};

export default function PodcastPage(): React.JSX.Element {
  return (
    <ComingSoon
      title="The LXD360 Podcast"
      description="Join us for thought-provoking conversations with industry leaders exploring the intersection of neuroscience, learning design, and organizational transformation."
      icon={<Mic className="w-12 h-12" />}
      features={[
        'Expert Interviews',
        'Industry Insights',
        'Case Study Deep Dives',
        'Monthly Episodes',
      ]}
      badgeText="Coming Soon"
    />
  );
}
