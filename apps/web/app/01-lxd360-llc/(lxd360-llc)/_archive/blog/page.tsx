import {
  ArrowRight,
  Bell,
  BookOpen,
  Lightbulb,
  Newspaper,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | LXD360 - Learning Experience Insights',
  description:
    'Explore the latest insights on learning experience design, instructional technology, and workforce development.',
};

const UPCOMING_TOPICS = [
  {
    title: 'AI in Learning Design',
    description:
      'How artificial intelligence is transforming content creation and personalization.',
    icon: Sparkles,
  },
  {
    title: 'Neuroscience of Learning',
    description: 'Research-backed strategies for improving knowledge retention and skill transfer.',
    icon: Lightbulb,
  },
  {
    title: 'L&D Analytics',
    description: 'Measuring learning impact and demonstrating ROI to stakeholders.',
    icon: TrendingUp,
  },
  {
    title: 'Future of Work',
    description: 'Skills development strategies for the evolving workforce landscape.',
    icon: Users,
  },
];

export default function BlogPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-lxd-primary-dark/10 via-transparent to-brand-primary/10 dark:from-lxd-primary-dark/40 dark:via-transparent dark:to-brand-primary/20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-lxd-purple-light/20 to-brand-primary/20 border border-lxd-purple-light/30 text-lxd-purple-light dark:text-lxd-purple-light text-sm font-medium mb-8">
            <Newspaper className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-brand-primary to-lxd-secondary flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-primary/25">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-lxd-dark-surface dark:text-lxd-light-page">
            LXD360{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-lxd-secondary">
              Blog
            </span>
          </h1>

          <p className="text-xl text-studio-text dark:text-studio-text max-w-2xl mx-auto mb-10">
            We&apos;re crafting insightful content on learning experience design, instructional
            technology, and workforce development. Stay tuned for our launch.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/contact?subject=blog-updates"
              className="px-8 py-4 bg-linear-to-r from-brand-primary to-lxd-secondary text-white font-bold rounded-xl flex items-center gap-2 justify-center text-lg hover:shadow-lg hover:shadow-brand-primary/25 transition-all"
            >
              <Bell className="w-5 h-5" />
              Get Notified at Launch
            </Link>
            <Link
              href="/solutions"
              className="px-8 py-4 border-2 border-brand-primary/30 text-brand-primary dark:text-neural-cyan font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-brand-primary/5 transition-colors text-lg"
            >
              Explore Our Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Topics */}
      <section className="py-20 px-4 bg-background dark:bg-studio-bg-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-lxd-dark-surface dark:text-lxd-light-page mb-12">
            Topics We&apos;ll Be Covering
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {UPCOMING_TOPICS.map((topic, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-studio-bg border border-lxd-light-border dark:border-surface-card"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
                  <topic.icon className="w-6 h-6 text-brand-primary dark:text-neural-cyan" />
                </div>
                <h3 className="font-bold text-lxd-dark-surface dark:text-lxd-light-page mb-2">
                  {topic.title}
                </h3>
                <p className="text-sm text-studio-text dark:text-studio-text">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
