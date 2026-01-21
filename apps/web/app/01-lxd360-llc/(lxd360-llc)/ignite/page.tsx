import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'INSPIRE Ignite Pricing | LXD360',
  description:
    'Adaptive learning platform pricing plans. Deliver personalized learning experiences with Glass Box AI.',
};

const pricingTiers = [
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'For small teams getting started with adaptive learning.',
    features: [
      'Up to 100 Learners',
      'LMS Core Features',
      'Basic Analytics Dashboard',
      'xAPI Statement Tracking',
      'Course Catalog',
      'Email Support',
    ],
    cta: 'Get Started',
    href: '/ignite/dashboard',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$299',
    period: '/month',
    description: 'For organizations scaling their learning programs.',
    features: [
      'Up to 500 Learners',
      'Everything in Starter',
      'Glass Box AI Recommendations',
      'Spaced Repetition Engine',
      'Skill Mastery Tracking',
      'Compliance Dashboard',
      'Priority Support',
    ],
    cta: 'Scale Up',
    href: '/ignite/dashboard',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full platform with white-label options.',
    features: [
      'Unlimited Learners',
      'Everything in Growth',
      'INSPIRE Studio Included',
      'LRS (Learning Record Store)',
      'Custom Integrations',
      'SSO & SCIM',
      'Dedicated Success Team',
      'FedRAMP Ready',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function IgnitePricingPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            INSPIRE Ignite Pricing
          </h1>
          <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70 max-w-2xl mx-auto">
            Adaptive learning platform powered by Glass Box AI. Personalized paths, explainable
            recommendations.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 border-2 transition-all duration-300 ${
                tier.highlighted
                  ? 'bg-gradient-to-br from-lxd-blue/10 to-lxd-purple/10 border-lxd-blue dark:border-lxd-blue-light scale-105 shadow-xl'
                  : 'bg-lxd-light-card dark:bg-lxd-dark-surface border-lxd-light-border dark:border-lxd-dark-border hover:border-lxd-blue/50'
              }`}
            >
              <h3 className="text-xl font-semibold text-lxd-text-dark dark:text-lxd-text-light mb-2">
                {tier.name}
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-lxd-text-dark dark:text-lxd-text-light">
                  {tier.price}
                </span>
                <span className="text-lxd-text-dark/60 dark:text-lxd-text-light/60 ml-1">
                  {tier.period}
                </span>
              </div>
              <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
                {tier.description}
              </p>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-sm text-lxd-text-dark dark:text-lxd-text-light"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      role="img"
                    >
                      <title>Checkmark</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`block w-full py-3 px-6 text-center rounded-lg font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-lxd-blue hover:bg-lxd-blue-dark text-white'
                    : 'bg-lxd-light-surface dark:bg-lxd-dark-page text-lxd-text-dark dark:text-lxd-text-light hover:bg-lxd-blue hover:text-white'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Feature Comparison Teaser */}
        <div className="text-center bg-lxd-light-surface dark:bg-lxd-dark-surface rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Bundle & Save
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Get INSPIRE Studio + Ignite together for maximum impact. Enterprise plans include the
            full LXD360 Ecosystem.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-blue hover:bg-lxd-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
