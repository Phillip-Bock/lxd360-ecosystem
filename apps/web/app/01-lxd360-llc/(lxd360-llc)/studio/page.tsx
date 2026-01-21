import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'INSPIRE Studio Pricing | LXD360',
  description:
    'AI-powered authoring tool pricing plans. Create neuroscience-backed learning experiences with INSPIRE Studio.',
};

const pricingTiers = [
  {
    name: 'Creator',
    price: '$49',
    period: '/month',
    description: 'Perfect for individual course creators and small teams.',
    features: [
      'AI-Powered Course Builder',
      'INSPIRE Methodology Workflow',
      '25 Content Blocks',
      'SCORM 1.2 Export',
      'Basic Analytics',
      'Email Support',
    ],
    cta: 'Start Creating',
    href: '/ignite/dashboard',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For learning teams building at scale.',
    features: [
      'Everything in Creator',
      '70+ Content Blocks',
      'SCORM 2004 & xAPI Export',
      'Neuro-naut AI Assistant',
      'Advanced Analytics',
      'Team Collaboration',
      'Priority Support',
    ],
    cta: 'Go Professional',
    href: '/ignite/dashboard',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'White-label solutions for organizations.',
    features: [
      'Everything in Professional',
      'Custom Branding',
      'SSO Integration',
      'API Access',
      'Dedicated Success Manager',
      'SLA Guarantee',
      'On-Premise Option',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function StudioPricingPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            INSPIRE Studio Pricing
          </h1>
          <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70 max-w-2xl mx-auto">
            Create neuroscience-backed learning experiences with our AI-powered authoring platform.
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

        {/* CTA Section */}
        <div className="text-center bg-lxd-light-surface dark:bg-lxd-dark-surface rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Have questions?
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Our team is here to help you find the perfect plan for your needs.
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
