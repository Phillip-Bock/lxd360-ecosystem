import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ | LXD360',
  description: 'Frequently asked questions about LXD360, INSPIRE Studio, and INSPIRE Ignite.',
};

const faqs = [
  {
    question: 'What is LXD360?',
    answer:
      'LXD360 is a learning experience design company that provides AI-powered tools for creating and delivering neuroscience-backed learning experiences. Our ecosystem includes INSPIRE Studio (authoring) and INSPIRE Ignite (delivery/LMS).',
  },
  {
    question: 'What is the INSPIRE Framework?',
    answer:
      'INSPIRE is our proprietary methodology based on cognitive science and learning theory. It stands for: Investigation & Analysis, Neuroscience Integration, Strategic Design, Production & Development, Implementation & Delivery, Reinforcement & Retention, and Evaluation & Optimization.',
  },
  {
    question: 'What is Glass Box AI?',
    answer:
      'Glass Box AI is our approach to explainable artificial intelligence. Unlike "black box" systems, Glass Box AI provides transparent explanations for every recommendation, allowing learners and instructors to understand why specific content or paths are suggested.',
  },
  {
    question: 'Is LXD360 SCORM compatible?',
    answer:
      'Yes! INSPIRE Studio exports to SCORM 1.2, SCORM 2004 (4th Edition), xAPI, and cmi5. You can use our content in any LMS, or deliver it natively through INSPIRE Ignite.',
  },
  {
    question: 'What compliance standards do you support?',
    answer:
      'We support WCAG 2.2 AA accessibility, EU AI Act requirements, HIPAA for healthcare clients, and are on the path to FedRAMP certification for government clients.',
  },
  {
    question: 'Can I white-label the platform?',
    answer:
      'Yes! Enterprise clients can fully brand INSPIRE Studio and Ignite with their own logo, colors, and custom domain. This is included in our Enterprise plans.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'We offer tiered pricing based on features and learner count. INSPIRE Studio starts at $49/month for creators, and INSPIRE Ignite starts at $99/month for up to 100 learners. Enterprise plans include bundled pricing.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'We offer a 14-day free trial of both INSPIRE Studio and Ignite. No credit card required to start.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70">
            Everything you need to know about LXD360.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl bg-lxd-light-card dark:bg-lxd-dark-surface border border-lxd-light-border dark:border-lxd-dark-border overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="text-lg font-medium text-lxd-text-dark dark:text-lxd-text-light pr-4">
                  {faq.question}
                </h3>
                <svg
                  className="w-5 h-5 text-lxd-text-dark/60 dark:text-lxd-text-light/60 shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  role="img"
                >
                  <title>Chevron</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* System Status */}
        <div className="bg-green-500/10 dark:bg-green-500/20 rounded-2xl p-6 mb-12 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
              All Systems Operational
            </h3>
          </div>
          <p className="text-green-600/80 dark:text-green-400/80 text-sm mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-lxd-light-surface dark:bg-lxd-dark-surface rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            Still have questions?
          </h2>
          <p className="text-lxd-text-dark/70 dark:text-lxd-text-light/70 mb-6">
            Our team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-lxd-blue hover:bg-lxd-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
