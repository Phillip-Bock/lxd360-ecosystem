import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kinetix Gear Store | LXD360',
  description: 'Official LXD360 merchandise. Learning experience design gear for professionals.',
};

export default function KinetixStorePage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Coming Soon Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-lxd-blue/10 dark:bg-lxd-blue/20 text-lxd-blue dark:text-lxd-blue-light rounded-full text-sm font-medium mb-8">
          Coming Soon
        </div>

        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-6">
          Kinetix Gear
        </h1>
        <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-12 max-w-2xl mx-auto">
          Official LXD360 merchandise for learning experience design professionals. 
          Wear your passion for neuroscience-backed learning.
        </p>

        {/* Placeholder Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {['Apparel', 'Accessories', 'Drinkware', 'Notebooks', 'Stickers', 'Bundles'].map((category) => (
            <div
              key={category}
              className="aspect-square rounded-2xl bg-lxd-light-surface dark:bg-lxd-dark-surface border-2 border-dashed border-lxd-light-border dark:border-lxd-dark-border flex items-center justify-center"
            >
              <span className="text-lg font-medium text-lxd-text-dark/40 dark:text-lxd-text-light/40">
                {category}
              </span>
            </div>
          ))}
        </div>

        {/* Notify CTA */}
        <div className="bg-lxd-light-card dark:bg-lxd-dark-surface rounded-2xl p-8 border border-lxd-light-border dark:border-lxd-dark-border">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Get Notified When We Launch
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Be the first to know when Kinetix Gear goes live.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-blue hover:bg-lxd-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}
