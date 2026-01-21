import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Media Center | LXD360',
  description:
    'Podcasts, videos, resources, and FAQs from LXD360. Your hub for learning experience design content.',
};

export default function MediaCenterPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-lxd-blue/10 dark:bg-lxd-blue/20 text-lxd-blue dark:text-lxd-blue-light rounded-full text-sm font-medium mb-8">
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-6">
            INSPIRE Media Center
          </h1>
          <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70 max-w-2xl mx-auto">
            Your hub for podcasts, videos, resources, and everything LXD360.
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Podcast */}
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <div className="w-12 h-12 rounded-xl bg-lxd-purple/10 dark:bg-lxd-purple/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-lxd-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Microphone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Podcast
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60 mb-4">
              The INSPIRE Podcast — Deep dives into learning science with industry experts.
            </p>
            <span className="text-sm text-lxd-purple font-medium">Launching Soon</span>
          </div>

          {/* Video Library */}
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <div className="w-12 h-12 rounded-xl bg-lxd-blue/10 dark:bg-lxd-blue/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-lxd-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Video camera</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Video Library
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60 mb-4">
              Tutorials, webinars, and conference talks on learning experience design.
            </p>
            <span className="text-sm text-lxd-blue font-medium">Launching Soon</span>
          </div>

          {/* Resources */}
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Book</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Resources
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60 mb-4">
              Templates, guides, and tools for learning professionals.
            </p>
            <span className="text-sm text-green-600 font-medium">Launching Soon</span>
          </div>

          {/* Social Feeds */}
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Hashtag</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Social Feeds
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60 mb-4">
              Follow us on LinkedIn, X, and YouTube for the latest updates.
            </p>
            <span className="text-sm text-pink-600 font-medium">Coming Soon</span>
          </div>

          {/* Press Kit */}
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Newspaper</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              Press Kit
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60 mb-4">
              Logos, brand assets, and media resources for journalists.
            </p>
            <span className="text-sm text-orange-600 font-medium">Coming Soon</span>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Question mark</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
              FAQ
            </h3>
            <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60 mb-4">
              Answers to common questions about LXD360 and our products.
            </p>
            <Link href="/faq" className="text-sm text-cyan-600 font-medium hover:underline">
              View FAQ →
            </Link>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="text-center bg-lxd-light-surface dark:bg-lxd-dark-surface rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Stay Updated
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Get notified when new content drops.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-blue hover:bg-lxd-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}
