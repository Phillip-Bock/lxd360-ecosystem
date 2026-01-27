import { Brain } from 'lucide-react';
import type { Metadata } from 'next';
import { ComingSoon } from '@/components/marketing/shared';

/**
 * @stub LXD-336
 * @route /services/neuro-strategy
 * @description Neuro Strategy consulting services - Brain-based learning design
 * @status placeholder
 */

export const metadata: Metadata = {
  title: 'Neuro Strategy Consulting - LXD360',
  description:
    'Transform your L&D strategy with neuroscience-backed consulting. Our Neuro Strategy services help organizations design learning experiences that align with how the brain actually learns.',
  openGraph: {
    title: 'Neuro Strategy Consulting - LXD360',
    description:
      'Neuroscience-backed consulting to transform your learning and development strategy.',
  },
};

export default function NeuroStrategyPage(): React.JSX.Element {
  return (
    <ComingSoon
      title="Neuro Strategy"
      description="Strategic consulting that applies cognitive neuroscience principles to transform how your organization approaches learning and development."
      icon={<Brain className="w-12 h-12" />}
      features={[
        'Learning Audits',
        'Strategy Development',
        'Cognitive Load Analysis',
        'Retention Optimization',
        'INSPIRE Methodology',
      ]}
      badgeText="Service Coming Soon"
    />
  );
}
