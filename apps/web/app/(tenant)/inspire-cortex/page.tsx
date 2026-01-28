export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'INSPIRE Cortex | AI-Powered Learning Experience',
  description:
    'INSPIRE Cortex — AI-powered adaptive learning platform with personalized recommendations and xAPI analytics.',
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
          AI-powered adaptive learning platform with personalized recommendations, skill mastery
          tracking, and Glass Box explainability. Your learners deserve more than a
          one-size-fits-all experience.
        </p>

        {/* Platform Features */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            {
              title: 'Adaptive Learning',
              desc: "AI-driven pathways that adjust to each learner's pace and mastery level",
            },
            {
              title: 'Glass Box AI',
              desc: 'Transparent recommendations with full explainability—no black boxes',
            },
            {
              title: 'Skill Mastery',
              desc: 'Track competencies with Bayesian Knowledge Tracing and spaced repetition',
            },
            {
              title: 'xAPI Analytics',
              desc: 'Rich learning data with xAPI 1.0.3 statements flowing to your LRS',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-lxd-light-surface dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6 text-left"
            >
              <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-lxd-light-card dark:bg-lxd-dark-surface rounded-2xl p-8 border border-lxd-light-border dark:border-lxd-dark-border">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Interested in INSPIRE Cortex?
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Join the waitlist for early access to our AI-powered learning experience platform.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-purple hover:bg-lxd-purple-dark text-white rounded-lg font-medium transition-colors"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}
