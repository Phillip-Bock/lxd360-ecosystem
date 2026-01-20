'use client';

import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  GraduationCap,
  Layers,
  Rocket,
  Shield,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { StandardCTAButtons } from '@/components/marketing/shared';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// ============================================================================
// FEATURES DATA
// ============================================================================

const FEATURES = [
  {
    title: 'Adaptive Learning Paths',
    description:
      "AI-powered personalized learning journeys that adapt to each learner's pace and performance.",
    icon: Brain,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Advanced Analytics',
    description:
      'Real-time dashboards with xAPI learning analytics, skill gaps, and ROI measurement.',
    icon: BarChart3,
    gradient: 'from-(--brand-secondary) to-(--brand-primary-hover)',
  },
  {
    title: 'Multi-Tenant Architecture',
    description:
      'Enterprise-grade platform supporting multiple organizations with complete data isolation.',
    icon: Layers,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Compliance Management',
    description: 'Automated compliance tracking with certification management and audit trails.',
    icon: Shield,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Social Learning',
    description: 'Built-in communities, discussion forums, and peer learning capabilities.',
    icon: Users,
    gradient: 'from-red-500 to-rose-500',
  },
  {
    title: 'Global Deployment',
    description: 'Multi-language support, regional compliance, and worldwide CDN delivery.',
    icon: Globe,
    gradient: 'from-indigo-500 to-violet-500',
  },
];

const CAPABILITIES = [
  {
    category: 'Learning Delivery',
    items: [
      'SCORM 1.2 & 2004',
      'xAPI (Tin Can)',
      'cmi5 Compliant',
      'HTML5 Content',
      'Video Streaming',
      'Virtual Classrooms',
    ],
  },
  {
    category: 'Assessment & Certification',
    items: [
      'Quiz Engine',
      'Competency Tracking',
      'Digital Badges',
      'Certificates',
      'Proctored Exams',
      'Skill Assessments',
    ],
  },
  {
    category: 'Administration',
    items: [
      'Role-Based Access',
      'Bulk Operations',
      'Automated Enrollment',
      'Reporting Suite',
      'API Integrations',
      'SSO/SAML',
    ],
  },
  {
    category: 'Learner Experience',
    items: [
      'Mobile Responsive',
      'Offline Learning',
      'Progress Tracking',
      'Notifications',
      'Gamification',
      'Accessibility',
    ],
  },
];

const INTEGRATIONS = [
  'Workday',
  'SAP SuccessFactors',
  'Microsoft 365',
  'Salesforce',
  'Slack',
  'Teams',
  'Zoom',
  'Google Workspace',
  'Okta',
  'Azure AD',
];

// ============================================================================
// PRICING DATA
// ============================================================================

interface PricingTier {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: { text: string; included: boolean }[];
  ctaText: string;
  ctaLink: string;
  highlight?: boolean;
  badge?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Rocket,
    monthlyPrice: '4.99',
    yearlyPrice: '3.99',
    description: 'Perfect for small teams getting started with LXP360',
    features: [
      { text: 'Up to 100 Learners', included: true },
      { text: 'Unlimited Courses', included: true },
      { text: 'SCORM & xAPI Support', included: true },
      { text: 'Basic Analytics', included: true },
      { text: 'Email Support', included: true },
      { text: 'Custom Branding', included: false },
      { text: 'API Access', included: false },
      { text: 'SSO Integration', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/vip?product=lxp360&tier=starter',
    badge: 'Small Teams',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: Star,
    monthlyPrice: '9.99',
    yearlyPrice: '7.99',
    description: 'Scale your learning program with advanced features',
    features: [
      { text: 'Up to 500 Learners', included: true },
      { text: 'Unlimited Courses', included: true },
      { text: 'All Content Standards', included: true },
      { text: 'Advanced Analytics & Reports', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Custom Branding', included: true },
      { text: 'API Access', included: true },
      { text: 'SSO Integration', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/vip?product=lxp360&tier=growth',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    description: 'Enterprise-grade deployment with dedicated support',
    features: [
      { text: 'Unlimited Learners', included: true },
      { text: 'Unlimited Courses', included: true },
      { text: 'All Content Standards + LRS', included: true },
      { text: 'Custom Analytics & BI', included: true },
      { text: 'Dedicated Success Manager', included: true },
      { text: 'White-Label Platform', included: true },
      { text: 'Full API & Webhooks', included: true },
      { text: 'SSO/SAML + Custom Security', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact?product=lxp360&tier=enterprise',
    badge: 'Enterprise',
  },
];

// ============================================================================
// FAQ DATA
// ============================================================================

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What content standards does LXP360 support?',
    answer:
      'LXP360 supports SCORM 1.2, SCORM 2004, xAPI (Tin Can), cmi5, and HTML5 content. Our built-in LRS tracks all learning activities and provides comprehensive analytics across all content types.',
  },
  {
    question: 'How does the per-learner pricing work?',
    answer:
      "Pricing is based on active learners per month. An active learner is anyone who logs in or accesses content during the billing period. Inactive learners don't count toward your limit.",
  },
  {
    question: 'Can we migrate from our existing LMS?',
    answer:
      'Yes! We offer migration services for all plans. Our team can help you migrate courses, user data, and historical completion records from most major LMS platforms. Enterprise plans include dedicated migration support.',
  },
  {
    question: 'What integrations are available?',
    answer:
      'LXP360 integrates with major HRIS systems (Workday, SAP SuccessFactors), identity providers (Okta, Azure AD), collaboration tools (Slack, Teams), and CRM platforms. We also offer a comprehensive API for custom integrations.',
  },
  {
    question: 'Is LXP360 accessible?',
    answer:
      'Absolutely. LXP360 is WCAG 2.2 AA compliant and designed with accessibility as a core principle. We support screen readers, keyboard navigation, and provide accommodations for learners with various needs.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'Starter plans include email support. Growth plans add priority support with faster response times. Enterprise plans include a dedicated success manager, phone support, and quarterly business reviews.',
  },
];

// ============================================================================
// FLOATING BADGE COMPONENT
// ============================================================================

function FloatingBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-lxd-primary/20 to-lxd-secondary/20 border border-lxd-primary/30 text-lxd-primary text-sm font-medium ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// PRICING CARD COMPONENT
// ============================================================================

function PricingCard({
  tier,
  billingPeriod,
}: {
  tier: PricingTier;
  billingPeriod: 'monthly' | 'yearly';
}): React.JSX.Element {
  const Icon = tier.icon;
  const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const isCustom = price === 'Custom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 h-full ${
        tier.highlight
          ? 'bg-brand-surface dark:bg-lxd-dark-card border-2 border-brand-primary shadow-2xl shadow-blue-500/10'
          : 'bg-brand-surface dark:bg-lxd-dark-page border border-brand-default dark:border-lxd-dark-border'
      }`}
    >
      {tier.badge && (
        <span
          className={`absolute -top-3 right-6 rounded-full px-4 py-1 text-xs font-semibold text-brand-primary ${
            tier.highlight ? 'bg-brand-primary' : 'bg-gray-600 dark:bg-brand-surface-hover'
          }`}
        >
          {tier.badge}
        </span>
      )}

      <div
        className={`inline-flex p-3 rounded-xl mb-4 w-fit ${
          tier.highlight
            ? 'bg-blue-100 dark:bg-blue-900/30'
            : 'bg-brand-surface dark:bg-brand-surface'
        }`}
      >
        <Icon
          className={`w-6 h-6 ${tier.highlight ? 'text-brand-blue' : 'text-brand-secondary dark:text-lxd-muted'}`}
        />
      </div>

      <h3 className="text-xl font-bold text-brand-primary dark:text-brand-primary mb-2">
        {tier.name}
      </h3>
      <p className="text-brand-secondary dark:text-lxd-muted text-sm mb-4">{tier.description}</p>

      <div className="mb-6">
        {!isCustom && (
          <div className="flex items-baseline gap-1">
            <span className="text-brand-muted">$</span>
            <span className="text-4xl font-bold text-brand-primary dark:text-brand-primary">
              {price}
            </span>
            <span className="text-brand-muted dark:text-lxd-tertiary">/learner/mo</span>
          </div>
        )}
        {isCustom && (
          <span className="text-4xl font-bold text-brand-primary dark:text-brand-primary">
            {price}
          </span>
        )}
        {!isCustom && billingPeriod === 'yearly' && (
          <p className="text-sm text-brand-muted mt-1">Billed annually</p>
        )}
      </div>

      <div className="grow space-y-3 mb-8">
        {tier.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-brand-secondary dark:text-lxd-muted shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm ${
                feature.included
                  ? 'text-brand-secondary dark:text-lxd-body'
                  : 'text-brand-muted dark:text-lxd-muted'
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <Link
        href={tier.ctaLink}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all duration-300 hover:-translate-y-0.5 block ${
          tier.highlight
            ? 'bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-brand-primary shadow-lg'
            : 'bg-brand-page dark:bg-brand-surface hover:bg-brand-surface dark:hover:bg-brand-surface text-brand-primary dark:text-brand-primary'
        }`}
      >
        {tier.ctaText}
      </Link>
    </motion.div>
  );
}

// ============================================================================
// FAQ ITEM COMPONENT
// ============================================================================

function FAQItemComponent({
  item,
  isOpen,
  onClick,
}: {
  item: FAQItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-brand-default dark:border-lxd-dark-border">
      <button
        type="button"
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-brand-primary dark:text-brand-primary pr-8">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-brand-muted transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-brand-secondary dark:text-lxd-muted leading-relaxed">
            {item.answer}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function LXP360Page() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const capabilitiesRef = useRef(null);
  const capabilitiesInView = useInView(capabilitiesRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <FloatingBadge className="mb-8">
            <GraduationCap className="w-4 h-4" />
            <span>Enterprise Learning Platform</span>
          </FloatingBadge>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-lxd-dark-text dark:text-lxd-light-text"
          >
            Deliver Learning That{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-cyan-500">
              Drives Performance
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-3xl mx-auto mb-10"
          >
            LXP360 is an enterprise learning experience platform that combines adaptive learning,
            advanced analytics, and neuroscience-backed design to maximize learner outcomes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/waitlist?product=lxp360">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-linear-to-r from-blue-500 to-cyan-500 text-brand-primary font-bold rounded-xl flex items-center gap-2 justify-center text-lg shadow-lg shadow-blue-500/25"
              >
                <Rocket className="w-5 h-5" />
                Request Demo
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/lxp360/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-brand-primary/30 text-brand-blue dark:text-brand-cyan font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-brand-primary/5 transition-colors text-lg"
              >
                <BarChart3 className="w-5 h-5" />
                View Pricing
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '99.9%', label: 'Uptime SLA' },
              { value: 'xAPI', label: 'LRS Built-in' },
              { value: 'WCAG 2.2', label: 'Accessible' },
              { value: 'SOC 2', label: 'Compliant' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-blue mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-lxd-text-light-muted dark:text-lxd-text-dark-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FEATURES SECTION */}
      {/* ================================================================== */}
      <section ref={featuresRef} className="py-20 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <FloatingBadge className="mb-6">
              <Zap className="w-4 h-4" />
              <span>Platform Features</span>
            </FloatingBadge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              Enterprise-Grade Learning Delivery
            </h2>
            <p className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-2xl mx-auto">
              Everything you need to deliver, track, and optimize organizational learning at scale.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-brand-surface dark:bg-lxd-dark-card border border-lxd-light-card dark:border-lxd-dark-border transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-lxd-dark-text dark:text-lxd-light-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-lxd-text-light-muted dark:text-lxd-text-dark-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CAPABILITIES SECTION */}
      {/* ================================================================== */}
      <section
        ref={capabilitiesRef}
        className="py-20 px-4 bg-lxd-light-card/50 dark:bg-lxd-dark-card/50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={capabilitiesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              Comprehensive Capabilities
            </h2>
            <p className="text-lg text-lxd-text-light-muted dark:text-lxd-text-dark-muted">
              Built for enterprise learning requirements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={capabilitiesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-brand-surface dark:bg-lxd-dark-card border border-lxd-light-card dark:border-lxd-dark-border"
              >
                <h3 className="text-lg font-bold text-lxd-dark-text dark:text-lxd-light-text mb-4">
                  {cap.category}
                </h3>
                <ul className="space-y-2">
                  {cap.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
                      <span className="text-lxd-text-light-body dark:text-lxd-text-dark-body">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* INTEGRATIONS SECTION */}
      {/* ================================================================== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              Integrates With Your Stack
            </h2>
            <p className="text-lg text-lxd-text-light-muted dark:text-lxd-text-dark-muted mb-8">
              Connect with the tools your organization already uses
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {INTEGRATIONS.map((integration, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 rounded-full bg-brand-surface dark:bg-lxd-dark-card border border-lxd-light-card dark:border-lxd-dark-border text-sm font-medium text-lxd-dark-text dark:text-lxd-light-text"
              >
                {integration}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRICING SECTION */}
      {/* ================================================================== */}
      <section id="pricing" className="py-20 lg:py-32 px-4 bg-brand-page dark:bg-lxd-dark-page">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span
              className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-semibold text-brand-primary"
              style={{
                backgroundColor: 'var(--brand-primary)',
                boxShadow: '0 0 20px rgba(85, 2, 120, 0.5), 0 0 40px rgba(85, 2, 120, 0.3)',
              }}
            >
              Pricing Plans
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-primary dark:text-brand-primary">
              Simple Per-Learner Pricing
            </h2>
            <p className="text-xl text-brand-secondary dark:text-lxd-muted max-w-2xl mx-auto mb-8">
              Scale your learning program without complexity. All plans include a 14-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex flex-col items-center gap-4">
              <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-semibold text-green-700 dark:text-brand-success">
                Save 20% with yearly billing
              </span>
              <div className="relative flex items-center rounded-full bg-gray-200 dark:bg-brand-surface p-1">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'text-brand-primary dark:text-brand-primary'
                      : 'text-brand-muted'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('yearly')}
                  className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
                    billingPeriod === 'yearly'
                      ? 'text-brand-primary dark:text-brand-primary'
                      : 'text-brand-muted'
                  }`}
                >
                  Yearly
                </button>
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-y-1 z-0 rounded-full bg-brand-surface dark:bg-brand-surface-hover shadow-md"
                  style={{
                    left: billingPeriod === 'yearly' ? 'calc(50% - 2px)' : '4px',
                    width: 'calc(50% - 4px)',
                  }}
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} billingPeriod={billingPeriod} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FAQ SECTION */}
      {/* ================================================================== */}
      <section className="py-20 lg:py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span
              className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-semibold text-brand-primary"
              style={{
                backgroundColor: 'var(--brand-primary)',
                boxShadow: '0 0 20px rgba(85, 2, 120, 0.5), 0 0 40px rgba(85, 2, 120, 0.3)',
              }}
            >
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary dark:text-brand-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-brand-secondary dark:text-lxd-muted">
              Everything you need to know about LXP360
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {FAQ_ITEMS.map((item, index) => (
              <FAQItemComponent
                key={index}
                item={item}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <p className="text-brand-secondary dark:text-lxd-muted">
              Have more questions?{' '}
              <Link
                href="/contact"
                className="text-brand-blue dark:text-brand-cyan font-semibold hover:underline"
              >
                Contact our team
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* STANDARD CTA BUTTONS */}
      {/* ================================================================== */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-secondary dark:text-lxd-muted mb-6">
            Explore more ways to transform your L&D operations
          </p>
          <StandardCTAButtons currentPage="/lxp360" />
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA SECTION */}
      {/* ================================================================== */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-cyan-600 to-blue-600" />
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />

            <div className="relative z-10 p-12 md:p-16 text-center text-brand-primary">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-90" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Learning Program?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
                See how LXP360 can help you deliver learning experiences that drive real business
                outcomes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact?product=lxp360">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-brand-surface text-brand-blue font-bold rounded-xl flex items-center gap-2 justify-center text-lg"
                  >
                    <Rocket className="w-5 h-5" />
                    Request Demo
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="#pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 border-2 border-white/30 text-brand-primary font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-brand-surface/10 transition-colors text-lg"
                  >
                    View Pricing
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
