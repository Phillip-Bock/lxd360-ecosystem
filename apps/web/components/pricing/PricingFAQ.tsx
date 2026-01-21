'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface PricingFAQProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  className?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'How does the free trial work?',
    answer:
      'All plans come with a 14-day free trial. No credit card required to start. You get full access to all features during the trial period. At the end of your trial, you can choose to subscribe or your account will be automatically downgraded to our free tier with limited features.',
  },
  {
    question: 'Can I change my plan later?',
    answer:
      "Yes! You can upgrade or downgrade your plan at unknown time. When upgrading, you'll be charged the prorated difference. When downgrading, the credit will be applied to your next billing cycle. Changes take effect immediately.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. For Enterprise plans, we also offer invoicing with NET-30 terms and ACH payments.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes! When you choose annual billing, you save 20% compared to monthly billing. This applies to all plans and add-ons. For multi-year commitments (3+ years), we offer an additional 10% discount.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer:
      "We'll notify you when you're approaching your limits. If you exceed them, we won't cut off access immediately. Instead, we'll reach out to discuss upgrading your plan or adding capacity. For learner limits, you can purchase additional seats at a prorated cost.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "Yes, we offer a 30-day money-back guarantee on all plans. If you're not satisfied within the first 30 days of your paid subscription, contact our support team for a full refund. No questions asked.",
  },
  {
    question: 'Can I get a discount for my nonprofit or educational institution?',
    answer:
      'Absolutely! We offer 20% off for registered nonprofits (501(c)(3)) and 25% off for educational institutions with valid .edu email addresses. Contact our sales team or apply during checkout with your verification documents.',
  },
  {
    question: "What's included in Enterprise plans?",
    answer:
      'Enterprise plans include unlimited users and learners, dedicated infrastructure, custom integrations, SSO/SAML authentication, advanced security features, a dedicated customer success manager, custom contract terms, and SLA guarantees. Contact us for a customized quote.',
  },
  {
    question: 'How do add-ons work?',
    answer:
      "Add-ons extend your plan with additional features like AI capabilities, advanced analytics, white-labeling, and more. They're billed separately from your base plan and can be added or removed at unknown time. Annual billing saves 20% on add-ons too.",
  },
  {
    question: 'Is my data secure?',
    answer:
      "Security is our top priority. We're SOC 2 Type II certified, HIPAA compliant, and GDPR ready. All data is encrypted at rest and in transit. We perform regular security audits and penetration testing. Enterprise plans include additional security features like dedicated infrastructure and custom data retention policies.",
  },
];

export function PricingFAQ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about our pricing',
  items = defaultFAQs,
  className,
}: PricingFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-(--lxd-blue-light)" />
          <span className="text-(--lxd-blue-light) text-sm font-medium uppercase tracking-wider">
            FAQ
          </span>
        </div>
        <h2 className="text-3xl font-bold text-brand-primary mb-3">{title}</h2>
        <p className="text-brand-muted max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {/* FAQ Items */}
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="bg-(--lxd-blue-dark-700) border border-(--lxd-blue-dark-700)/50 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-(--lxd-blue-dark-700)/80 transition-colors"
              >
                <span className="text-brand-primary font-medium pr-4">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-brand-muted shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180 text-(--lxd-blue-light)',
                  )}
                />
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isOpen ? 'max-h-96' : 'max-h-0',
                )}
              >
                <div className="px-6 pb-4 text-brand-muted text-sm leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="text-center mt-10">
        <p className="text-brand-muted mb-4">Still have questions?</p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 text-(--lxd-blue-light) hover:text-(--lxd-blue-light) hover:opacity-80 font-medium transition-colors"
        >
          Contact our sales team
          <span>→</span>
        </a>
      </div>
    </div>
  );
}

export default PricingFAQ;
