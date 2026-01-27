import { ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import { ComingSoon } from '@/components/marketing/shared';

/**
 * @stub LXD-335
 * @route /swag
 * @description Kinetix Gear - LXD360 branded merchandise and swag
 * @status placeholder
 */

export const metadata: Metadata = {
  title: 'Kinetix Gear - LXD360',
  description:
    'Shop Kinetix Gear - Premium LXD360 branded merchandise including apparel, accessories, and learning swag for L&D professionals.',
  openGraph: {
    title: 'Kinetix Gear - LXD360 Swag Store',
    description: 'Premium branded merchandise and learning swag for L&D professionals.',
  },
};

export default function SwagPage(): React.JSX.Element {
  return (
    <ComingSoon
      title="Kinetix Gear"
      description="Premium branded merchandise designed for learning experience professionals. Wear your passion for neuroscience-backed learning design."
      icon={<ShoppingBag className="w-12 h-12" />}
      features={['Apparel', 'Accessories', 'Conference Gear', 'Team Orders']}
      badgeText="Store Coming Soon"
    />
  );
}
