import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LXD Nexus | Community Hub',
  description: 'Join the LXD360 community. Connect with learning experience designers, share insights, and grow together.',
};

export default function NexusPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Coming Soon Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-lxd-purple/10 dark:bg-lxd-purple/20 text-lxd-purple dark:text-lxd-purple-light rounded-full text-sm font-medium mb-8">
          Coming Soon
        </div>

        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-6">
          LXD Nexus
        </h1>
        <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-12 max-w-2xl mx-auto">
          The professional community for learning experience designers. 
          Connect, collaborate, and elevate your craft.
        </p>

        {/* Features Preview */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12 text-left">
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Discussion Forums
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
              Ask questions, share solutions, and learn from peers in the industry.
            </p>
          </div>
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Expert AMAs
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
              Monthly sessions with learning science researchers and industry leaders.
            </p>
          </div>
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Project Showcases
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
              Share your work, get feedback, and discover inspiring projects.
            </p>
          </div>
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Job Board
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
              Find opportunities and connect with companies hiring LXDs.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-lxd-purple/10 to-lxd-blue/10 dark:from-lxd-purple/20 dark:to-lxd-blue/20 rounded-2xl p-8 border border-lxd-purple/20 dark:border-lxd-purple/30">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Join the Waitlist
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Be among the first to access LXD Nexus when we launch.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-purple hover:bg-lxd-purple-dark text-white rounded-lg font-medium transition-colors"
          >
            Request Early Access
          </Link>
        </div>
      </div>
    </div>
  );
}
