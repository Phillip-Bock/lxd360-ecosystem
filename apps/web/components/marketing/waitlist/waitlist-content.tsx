'use client';

/**
 * VIP Dashboard Content
 * =====================
 * Comprehensive VIP member page combining multiple sections.
 * Design inspired by SignalX template (https://signalx.webflow.io/)
 *
 * Sections:
 * 1. Hero - Welcome with "Open VIP" CTA
 * 2. Social Proof - Partner logos
 * 3. Features - Platform capabilities
 * 4. Metrics - Key statistics
 * 5. How It Works - 3-step process
 * 6. Benefits Grid - Six key benefits
 * 7. About/Mission - Company story
 * 8. Team - Leadership section
 * 9. Download - App access
 * 10. Integrations - Partner platforms
 * 11. Testimonials - User quotes
 * 12. FAQ - Common questions
 */

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  ChevronDown,
  Database,
  Download,
  Globe,
  Headphones,
  Layout,
  MessageSquare,
  Monitor,
  Play,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// DATA
// ============================================================================

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description:
      "Adaptive algorithms that personalize every learner's journey based on performance and preferences.",
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with SSO, data encryption, and comprehensive audit trails.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards tracking engagement, completion, and skill mastery metrics.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Multi-language support with CDN delivery for learners anywhere in the world.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with sub-second load times and seamless experiences.',
  },
  {
    icon: Layout,
    title: 'Custom Branding',
    description: "Full white-label capabilities to match your organization's identity.",
  },
];

const METRICS = [
  { value: '50+', label: 'Enterprise Clients', icon: Users },
  { value: '99.9%', label: 'Uptime SLA', icon: Shield },
  { value: '500K+', label: 'Active Learners', icon: TrendingUp },
  { value: '4.9/5', label: 'Customer Rating', icon: Star },
];

const STEPS = [
  {
    step: '01',
    title: 'Connect Your Systems',
    description: 'Integrate with your existing HRIS, SSO, and content systems in minutes.',
    icon: Database,
  },
  {
    step: '02',
    title: 'Import or Create Content',
    description:
      'Use INSPIRE Studio to create AI-powered content or import existing SCORM/xAPI courses.',
    icon: Sparkles,
  },
  {
    step: '03',
    title: 'Launch & Measure',
    description: 'Deploy to learners instantly and track progress with real-time analytics.',
    icon: Rocket,
  },
];

const BENEFITS = [
  {
    icon: Brain,
    title: 'Smarter Learning',
    description: "AI adapts to each learner's pace and style",
  },
  { icon: Zap, title: 'Faster Deployment', description: 'Launch courses in days, not months' },
  {
    icon: Target,
    title: 'Better Outcomes',
    description: 'Measurable skill improvement guaranteed',
  },
  { icon: Shield, title: 'Enterprise Ready', description: 'Security and compliance built-in' },
  { icon: BarChart3, title: 'Clear ROI', description: 'Track business impact with precision' },
  { icon: Headphones, title: '24/7 Support', description: 'Expert help whenever you need it' },
];

const TEAM = [
  { name: 'Sarah Chen', role: 'CEO & Co-Founder', initials: 'SC' },
  { name: 'Michael Torres', role: 'CTO', initials: 'MT' },
  { name: 'Emily Watson', role: 'VP of Product', initials: 'EW' },
  { name: 'David Kim', role: 'VP of Engineering', initials: 'DK' },
  { name: 'Lisa Park', role: 'VP of Customer Success', initials: 'LP' },
  { name: 'James Wilson', role: 'VP of Sales', initials: 'JW' },
];

const INTEGRATIONS = [
  'Workday',
  'SAP SuccessFactors',
  'Oracle HCM',
  'BambooHR',
  'Okta',
  'Azure AD',
  'Google Workspace',
  'Slack',
  'Microsoft Teams',
  'Zoom',
  'Salesforce',
  'HubSpot',
  'Stripe',
  'PayPal',
  'Zapier',
  'Webhooks',
];

const TESTIMONIALS = [
  {
    quote:
      'LXP360 transformed how we deliver training. The AI recommendations are incredibly accurate.',
    author: 'Jennifer M.',
    role: 'L&D Director, Fortune 500',
  },
  {
    quote: 'Finally, a platform that gives us full control of our learning data. Game changer.',
    author: 'Robert K.',
    role: 'Chief Learning Officer',
  },
  {
    quote:
      'The INSPIRE content we created in weeks would have taken months with traditional tools.',
    author: 'Amanda S.',
    role: 'Instructional Designer',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What makes LXP360 different from other platforms?',
    answer:
      'LXP360 is a headless platform that gives you complete ownership of your learning data. Unlike traditional LMS platforms, we separate the experience layer from the data layer, meaning no vendor lock-in and full xAPI data access.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most organizations are live within 2-4 weeks. Our implementation team handles SSO setup, data migration, and initial content import. Enterprise deployments with complex integrations typically take 6-8 weeks.',
  },
  {
    question: 'Is my data secure?',
    answer:
      "Absolutely. We're SOC 2 Type II certified with end-to-end encryption, regular security audits, and data sovereignty options for enterprise customers. Your learning data is yours and never shared.",
  },
  {
    question: 'Can I migrate from my existing LMS?',
    answer:
      'Yes! We support SCORM 1.2, SCORM 2004, and xAPI content imports. Our team can help migrate your courses, completion records, and user data with minimal disruption.',
  },
  {
    question: 'What support is included?',
    answer:
      'All plans include email support. Growth and above include priority support with guaranteed response times. Enterprise customers get a dedicated success manager and 24/7 phone support.',
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function FAQItem({
  item,
  isOpen,
  onClick,
}: {
  item: (typeof FAQ_ITEMS)[0];
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-brand-subtle">
      <button
        type="button"
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-brand-primary pr-8">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-lxd-text-light-muted transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="pb-5 text-lxd-text-light-muted leading-relaxed"
        >
          {item.answer}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WaitlistContent(): React.JSX.Element {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-brand-page">
      {/* =====================================================================
          HERO SECTION
      ====================================================================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-secondary/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-[200px]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-brand-cyan bg-brand-accent/10 rounded-full border border-brand-accent/20">
              <Sparkles className="w-4 h-4" />
              VIP Access Portal
            </span>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-brand-primary mb-6 leading-tight">
              Welcome to the
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600">
                Future of Learning
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-lxd-text-light-body max-w-3xl mx-auto mb-10 leading-relaxed">
              AI-powered insights, enterprise security, and complete data ownership. Transform how
              your organization learns and grows.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-brand-primary font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              >
                <Play className="w-5 h-5" />
                Open VIP
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lxd-light-card/5 hover:bg-lxd-light-card/10 text-brand-primary font-semibold rounded-xl border border-brand-subtle transition-all duration-300"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="absolute -inset-4 bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-linear-to-b from-lxd-dark-card/50 to-lxd-dark-page/50 rounded-2xl border border-brand-subtle p-2 backdrop-blur-xs">
              <div className="bg-lxd-dark-page rounded-xl overflow-hidden">
                <div className="h-8 bg-lxd-dark-card flex items-center gap-2 px-4">
                  <div className="w-3 h-3 rounded-full bg-brand-error" />
                  <div className="w-3 h-3 rounded-full bg-brand-warning" />
                  <div className="w-3 h-3 rounded-full bg-brand-success" />
                </div>
                <div className="aspect-video bg-linear-to-br from-lxd-dark-card to-lxd-dark-page flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-brand-cyan mx-auto mb-4" />
                    <p className="text-lxd-text-light-muted">Interactive Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-brand-subtle flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-lxd-light-card/40 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          SOCIAL PROOF / PARTNERS
      ====================================================================== */}
      <section className="py-16 border-y border-white/5">
        <div className="container mx-auto px-4">
          <p className="text-center text-lxd-text-dark-muted text-sm mb-8 uppercase tracking-wider">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {['Microsoft', 'Google', 'Amazon', 'IBM', 'Oracle', 'Salesforce'].map((company) => (
              <div key={company} className="text-lxd-text-light-muted font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FEATURES SECTION
      ====================================================================== */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-brand-cyan bg-brand-accent/10 rounded-full">
              Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-lxd-text-light-muted max-w-2xl mx-auto">
              Powerful tools designed for modern learning and development teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-lxd-light-card/5 rounded-2xl border border-brand-subtle hover:border-brand-accent/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-semibold text-brand-primary mb-2">{feature.title}</h3>
                <p className="text-lxd-text-light-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          METRICS SECTION
      ====================================================================== */}
      <section className="py-24 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {METRICS.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <metric.icon className="w-8 h-8 text-brand-cyan mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-bold text-brand-primary mb-2">
                  {metric.value}
                </div>
                <div className="text-lxd-text-light-muted">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          HOW IT WORKS
      ====================================================================== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-brand-purple bg-brand-secondary/10 rounded-full">
              Getting Started
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Three Steps to Transform Learning
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-brand-primary/5 absolute -top-4 left-0">
                  {step.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-brand-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-primary mb-2">{step.title}</h3>
                  <p className="text-lxd-text-light-muted">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          BENEFITS GRID
      ====================================================================== */}
      <section className="py-24 bg-lxd-light-card/[0.02]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Why Organizations Choose Us
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-lxd-light-card/5 rounded-xl border border-brand-subtle"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-brand-cyan" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-primary mb-1">{benefit.title}</h3>
                  <p className="text-sm text-lxd-text-light-muted">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          ABOUT / MISSION
      ====================================================================== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-brand-success bg-brand-success/10 rounded-full">
                Our Mission
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
                Empowering Learning Everywhere
              </h2>
              <p className="text-xl text-lxd-text-light-muted mb-6 leading-relaxed">
                We believe every organization deserves access to world-class learning tools. Our
                mission is to democratize enterprise learning technology and give you complete
                ownership of your most valuable asset: your learning data.
              </p>
              <p className="text-lxd-text-light-muted leading-relaxed">
                Founded by learning scientists and technologists, we combine decades of L&D
                expertise with cutting-edge AI to deliver measurable business outcomes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '2019', label: 'Founded' },
                { value: '50+', label: 'Team Members' },
                { value: '12', label: 'Countries Served' },
                { value: '$20M+', label: 'Funding Raised' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-lxd-light-card/5 rounded-xl border border-brand-subtle text-center"
                >
                  <div className="text-3xl font-bold text-brand-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-lxd-text-light-muted">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          TEAM
      ====================================================================== */}
      <section className="py-24 bg-lxd-light-card/[0.02]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Leadership Team
            </h2>
            <p className="text-xl text-lxd-text-light-muted">
              Meet the people building the future of learning.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {TEAM.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-brand-primary font-bold text-xl">
                  {member.initials}
                </div>
                <h3 className="font-semibold text-brand-primary">{member.name}</h3>
                <p className="text-sm text-lxd-text-light-muted">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          DOWNLOAD / APP ACCESS
      ====================================================================== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-brand-subtle p-12 md:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
                  Access Anywhere, Anytime
                </h2>
                <p className="text-xl text-lxd-text-light-body mb-8 leading-relaxed">
                  Get the full power of LXP360 on unknown device. Desktop app provides enhanced
                  performance, offline access, and advanced analytics tools.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/downloads/desktop"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-lxd-light-card/10 hover:bg-lxd-light-card/20 rounded-xl border border-brand-subtle transition-colors"
                  >
                    <Monitor className="w-5 h-5 text-brand-primary" />
                    <span className="text-brand-primary font-medium">Desktop App</span>
                  </a>
                  <a
                    href="/downloads/mobile"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-lxd-light-card/10 hover:bg-lxd-light-card/20 rounded-xl border border-brand-subtle transition-colors"
                  >
                    <Smartphone className="w-5 h-5 text-brand-primary" />
                    <span className="text-brand-primary font-medium">Mobile App</span>
                  </a>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-brand-accent/20 rounded-3xl blur-2xl" />
                  <div className="relative w-64 h-64 rounded-3xl bg-linear-to-br from-lxd-dark-card to-lxd-dark-page border border-brand-subtle flex items-center justify-center">
                    <Download className="w-24 h-24 text-brand-cyan" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          INTEGRATIONS
      ====================================================================== */}
      <section className="py-24 bg-lxd-light-card/[0.02]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-orange-400 bg-brand-warning/10 rounded-full">
              Integrations
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Connect Your Ecosystem
            </h2>
            <p className="text-xl text-lxd-text-light-muted max-w-2xl mx-auto">
              Seamlessly integrate with the tools you already use.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {INTEGRATIONS.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="p-4 bg-lxd-light-card/5 rounded-xl border border-brand-subtle text-center hover:border-brand-subtle transition-colors"
              >
                <span className="text-sm text-lxd-text-light-muted">{integration}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          TESTIMONIALS
      ====================================================================== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              What Leaders Are Saying
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-lxd-light-card/5 rounded-2xl border border-brand-subtle"
              >
                <MessageSquare className="w-8 h-8 text-brand-cyan mb-4" />
                <p className="text-lg text-lxd-text-light-body mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-brand-primary">{testimonial.author}</p>
                  <p className="text-sm text-lxd-text-light-muted">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FAQ
      ====================================================================== */}
      <section className="py-24 bg-lxd-light-card/[0.02]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                item={item}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FINAL CTA
      ====================================================================== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-linear-to-r from-cyan-600 via-blue-600 to-purple-600 p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-6">
                Ready to Transform Learning?
              </h2>
              <p className="text-xl text-brand-primary/80 max-w-2xl mx-auto mb-8">
                Join hundreds of organizations already using LXP360 to deliver better learning
                outcomes.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 bg-lxd-light-card text-brand-blue font-semibold rounded-xl hover:bg-lxd-light-card transition-colors shadow-lg"
              >
                <Play className="w-5 h-5" />
                Open VIP
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
