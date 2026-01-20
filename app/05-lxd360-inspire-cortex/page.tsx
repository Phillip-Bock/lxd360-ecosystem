import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cortex | LXD360 Blog',
  description: 'Insights on learning experience design, neuroscience, and educational technology from LXD360.',
};

export default function CortexPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Coming Soon Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-lxd-purple/10 dark:bg-lxd-purple/20 text-lxd-purple dark:text-lxd-purple-light rounded-full text-sm font-medium mb-8">
          Coming Soon
        </div>

        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-6">
          INSPIRE Cortex
        </h1>
        <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-12 max-w-2xl mx-auto">
          Thought leadership on learning experience design, cognitive science, and the future of education.
          Powered by our Medium publication.
        </p>

        {/* Placeholder Categories */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { title: 'Learning Science', desc: 'Evidence-based insights on how the brain learns' },
            { title: 'Design Patterns', desc: 'Best practices in instructional design' },
            { title: 'Technology Trends', desc: 'AI, XR, and the future of learning tech' },
            { title: 'Case Studies', desc: 'Real-world implementation stories' },
          ].map((category) => (
            <div
              key={category.title}
              className="rounded-2xl bg-lxd-light-surface dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6 text-left"
            >
              <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
                {category.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-lxd-light-card dark:bg-lxd-dark-surface rounded-2xl p-8 border border-lxd-light-border dark:border-lxd-dark-border">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Subscribe to Cortex
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Get the latest insights delivered to your inbox.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-purple hover:bg-lxd-purple-dark text-white rounded-lg font-medium transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}
