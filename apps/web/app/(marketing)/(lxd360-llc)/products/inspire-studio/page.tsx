'use client';

import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Layers,
  PenTool,
  Puzzle,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Wand2,
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
// INSPIRE TOOLS DATA
// ============================================================================

const INSPIRE_STAGES = [
  {
    name: 'Stage 1: Foundation',
    description: 'Establish the strategic foundation for your learning experience',
    //color: "from-blue-500 to-cyan-500",// Commented out hardcode css per Phill
    tools: [
      { id: 'ilmi', name: 'Learner Model Insight', icon: Users, desc: 'Deep learner analysis' },
      { id: 'itla', name: 'Task & Learning Analysis', icon: Target, desc: 'Task decomposition' },
      { id: 'nppm', name: 'Performance Mapping', icon: BarChart3, desc: 'Performance objectives' },
      { id: 'icl', name: 'Cognitive Load', icon: Brain, desc: 'Load optimization' },
    ],
  },
  {
    name: 'Stage 2: Design',
    description: 'Design engaging and effective learning experiences',
    color: 'from-(--brand-secondary) to-(--brand-primary-hover)',
    tools: [
      { id: 'ilem', name: 'Learning Event Model', icon: Layers, desc: 'Event structuring' },
      { id: 'icpf', name: 'Prototype Framework', icon: Puzzle, desc: 'Rapid prototyping' },
      { id: 'idns', name: 'Design Narrative', icon: PenTool, desc: 'Story-driven design' },
      { id: 'ices', name: 'Engagement Strategy', icon: Sparkles, desc: 'Learner engagement' },
    ],
  },
  {
    name: 'Stage 3: Development',
    description: 'Build and refine your learning content',
    color: 'from-amber-500 to-orange-500',
    tools: [
      { id: 'iadc', name: 'AI-Driven Content', icon: Wand2, desc: 'AI content generation' },
      { id: 'ialm', name: 'Adaptive Learning', icon: Zap, desc: 'Personalization' },
      { id: 'icdt', name: 'Content Development', icon: FileText, desc: 'Content creation' },
      { id: 'ipmg', name: 'Progress Management', icon: Clock, desc: 'Project tracking' },
    ],
  },
];

const FEATURES = [
  {
    title: 'AI-Powered Course Creation',
    description:
      'Generate comprehensive courses in minutes using advanced AI that understands instructional design principles.',
    icon: Wand2,
    gradient: 'from-(--brand-secondary) to-(--brand-primary-hover)',
  },
  {
    title: 'Neuroscience-Backed Design',
    description:
      'Built-in cognitive load optimization and neurodiverse learner support based on peer-reviewed research.',
    icon: Brain,
    //gradient: "from-blue-500 to-cyan-500"// Commented out hardcode css per Phill
  },
  {
    title: 'INSPIRE Methodology',
    description:
      '12 interconnected tools guide you through a proven instructional design framework.',
    icon: Layers,
    //gradient: "from-amber-500 to-orange-500"// Commented out hardcode css per Phill
  },
  {
    title: 'Accessibility First',
    description:
      'WCAG 2.2 compliant outputs with built-in support for dyslexia, autism, and sensory impairments.',
    icon: Shield,
    //gradient: "from-green-500 to-emerald-500"// Commented out hardcode css per Phill
  },
  {
    title: 'Multi-Format Export',
    description:
      'Export to SCORM, xAPI, cmi5, or deploy directly to LXP360 or unknown compatible LMS.',
    icon: Rocket,
    //gradient: "from-red-500 to-rose-500"// Commented out hardcode css per Phill
  },
  {
    title: 'Collaborative Workflows',
    description:
      'Real-time collaboration with SMEs, stakeholders, and team members throughout the design process.',
    icon: Users,
    //gradient: "from-indigo-500 to-violet-500"// Commented out hardcode css per Phill
  },
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
    id: 'solo',
    name: 'Solo Creator',
    icon: Rocket,
    monthlyPrice: '49',
    yearlyPrice: '39',
    description: 'Perfect for individual instructional designers and freelancers',
    features: [
      { text: '1 Creator Seat', included: true },
      { text: '5 Active Projects', included: true },
      { text: 'All 12 INSPIRE Tools', included: true },
      { text: 'SCORM & xAPI Export', included: true },
      { text: 'Community Support', included: true },
      { text: 'AI Content Generation (100/mo)', included: true },
      { text: 'Team Collaboration', included: false },
      { text: 'Custom Branding', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/vip?product=inspire-studio&tier=solo',
    badge: 'Individual',
  },
  {
    id: 'team',
    name: 'Team Studio',
    icon: Star,
    monthlyPrice: '149',
    yearlyPrice: '119',
    description: 'Collaborate with your team on professional course development',
    features: [
      { text: '5 Creator Seats', included: true },
      { text: 'Unlimited Projects', included: true },
      { text: 'All 12 INSPIRE Tools', included: true },
      { text: 'All Export Formats', included: true },
      { text: 'Priority Support', included: true },
      { text: 'AI Content Generation (500/mo)', included: true },
      { text: 'Team Collaboration', included: true },
      { text: 'Custom Branding', included: true },
    ],
    ctaText: 'Start Free Trial',
    ctaLink: '/vip?product=inspire-studio&tier=team',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    description: 'Full-scale deployment for large organizations',
    features: [
      { text: 'Unlimited Creator Seats', included: true },
      { text: 'Unlimited Projects', included: true },
      { text: 'All 12 INSPIRE Tools', included: true },
      { text: 'All Export Formats + API', included: true },
      { text: 'Dedicated Success Manager', included: true },
      { text: 'Unlimited AI Generation', included: true },
      { text: 'SSO & Advanced Security', included: true },
      { text: 'Custom AI Model Training', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact?product=inspire-studio&tier=enterprise',
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
    question: 'What is the INSPIRE Learning Architecture?',
    answer:
      'INSPIRE is a neuroscience-backed instructional design methodology featuring 12 interconnected tools across 3 stages: Foundation, Design, and Development. It guides you through creating evidence-based learning experiences that maximize retention and engagement.',
  },
  {
    question: 'How does the AI content generation work?',
    answer:
      'INSPIRE Studio uses advanced AI trained on instructional design best practices. You provide learning objectives and context, and the AI generates course outlines, content drafts, quiz questions, and scenarios. You maintain full control to review and refine all generated content.',
  },
  {
    question: 'What formats can I export my courses to?',
    answer:
      'INSPIRE Studio supports SCORM 1.2, SCORM 2004, xAPI (Tin Can), cmi5, and HTML5. You can also publish directly to LXP360 or export as standalone packages for unknown compatible LMS.',
  },
  {
    question: 'Is INSPIRE Studio accessible?',
    answer:
      'Absolutely! All content created in INSPIRE Studio is WCAG 2.2 AA compliant by default. The platform includes built-in accessibility checking, support for screen readers, and options for neurodiverse learners including dyslexia-friendly fonts and reduced motion settings.',
  },
  {
    question: 'Can I collaborate with my team?',
    answer:
      'Yes! Team and Enterprise plans include real-time collaboration features. Multiple team members can work on projects simultaneously, leave comments, assign tasks, and track progress through built-in workflow tools.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'Solo plans include community forum access and self-service documentation. Team plans add priority email support with 24-hour response times. Enterprise plans include a dedicated success manager, phone support, and custom training sessions.',
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
// MAIN PAGE COMPONENT
// ============================================================================

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
          ? 'bg-brand-surface dark:bg-lxd-dark-card border-2 border-brand-secondary shadow-2xl shadow-purple-500/10'
          : 'bg-brand-surface dark:bg-lxd-dark-page border border-brand-default dark:border-lxd-dark-border'
      }`}
    >
      {tier.badge && (
        <span
          className={`absolute -top-3 right-6 rounded-full px-4 py-1 text-xs font-semibold text-brand-primary ${
            tier.highlight ? 'bg-brand-secondary' : 'bg-gray-600 dark:bg-brand-surface-hover'
          }`}
        >
          {tier.badge}
        </span>
      )}

      <div
        className={`inline-flex p-3 rounded-xl mb-4 w-fit ${
          tier.highlight
            ? 'bg-purple-100 dark:bg-purple-900/30'
            : 'bg-brand-surface dark:bg-brand-surface'
        }`}
      >
        <Icon
          className={`w-6 h-6 ${tier.highlight ? 'text-purple-600' : 'text-brand-secondary dark:text-lxd-muted'}`}
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
            <span className="text-brand-muted dark:text-lxd-tertiary">/month</span>
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
            ? 'bg-linear-to-r from-(--brand-secondary) to-(--brand-primary-hover) hover:from-lxd-purple hover:to-studio-accent text-brand-primary shadow-lg'
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
}): React.JSX.Element {
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

export default function InspireStudioPage(): React.JSX.Element {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const toolsRef = useRef(null);
  const toolsInView = useInView(toolsRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-linear-to-br from-(--brand-secondary)/5 via-transparent to-(--brand-primary-hover)/5" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-(--brand-primary-hover)/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <FloatingBadge className="mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Course Creation</span>
          </FloatingBadge>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-lxd-dark-text dark:text-lxd-light-text"
          >
            Design Learning Experiences{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-(--brand-secondary) to-(--brand-primary-hover)">
              That Actually Work
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-3xl mx-auto mb-10"
          >
            INSPIRE Studio combines the INSPIRE Learning Architecture with AI to help you create
            neuroscience-backed courses in a fraction of the time. From analysis to deployment.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/vip?product=inspire-studio">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-linear-to-r from-(--brand-secondary) to-(--brand-primary-hover) text-brand-primary font-bold rounded-xl flex items-center gap-2 justify-center text-lg shadow-lg shadow-(--brand-secondary)/25"
              >
                <Rocket className="w-5 h-5" />
                Join VIP Waitlist
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/products/inspire-studio/tools">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-brand-secondary/30 text-purple-600 dark:text-brand-purple font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-brand-secondary/5 transition-colors text-lg"
              >
                <Layers className="w-5 h-5" />
                Explore Tools
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
              { value: '12', label: 'INSPIRE Tools' },
              { value: '80%', label: 'Time Saved' },
              { value: 'WCAG 2.2', label: 'Accessible' },
              { value: '3', label: 'Design Stages' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-purple mb-1">
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
      {/* INSPIRE TOOLS SECTION */}
      {/* ================================================================== */}
      <section
        ref={toolsRef}
        className="py-20 lg:py-32 px-4 bg-lxd-light-card/50 dark:bg-lxd-dark-card/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={toolsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <FloatingBadge className="mb-6">
              <Layers className="w-4 h-4" />
              <span>INSPIRE Learning Architecture</span>
            </FloatingBadge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              12 Tools. 3 Stages. One Methodology.
            </h2>
            <p className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-2xl mx-auto">
              A systematic approach to instructional design that produces measurable learning
              outcomes.
            </p>
          </motion.div>

          {/* Stages */}
          <div className="space-y-12">
            {INSPIRE_STAGES.map((stage, stageIdx) => (
              <motion.div
                key={stageIdx}
                initial={{ opacity: 0, x: stageIdx % 2 === 0 ? -30 : 30 }}
                animate={toolsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: stageIdx * 0.2 }}
                className="relative"
              >
                <div
                  className={`absolute left-0 top-0 w-1 h-full bg-linear-to-b ${stage.color} rounded-full`}
                />
                <div className="pl-8">
                  <h3 className="text-2xl font-bold text-lxd-dark-text dark:text-lxd-light-text mb-2">
                    {stage.name}
                  </h3>
                  <p className="text-lxd-text-light-muted dark:text-lxd-text-dark-muted mb-6">
                    {stage.description}
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stage.tools.map((tool, toolIdx) => (
                      <Link key={toolIdx} href={`/products/inspire-studio/tools/${tool.id}`}>
                        <motion.div
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="p-4 rounded-xl bg-brand-surface dark:bg-lxd-dark-card border border-lxd-light-card dark:border-lxd-dark-border hover:border-brand-secondary/50 transition-all cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-linear-to-br ${stage.color} flex items-center justify-center mb-3`}
                          >
                            <tool.icon className="w-5 h-5 text-brand-primary" />
                          </div>
                          <h4 className="font-semibold text-lxd-dark-text dark:text-lxd-light-text mb-1">
                            {tool.name}
                          </h4>
                          <p className="text-sm text-lxd-text-light-muted dark:text-lxd-text-dark-muted">
                            {tool.desc}
                          </p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
              Everything You Need to Create
            </h2>
            <p className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-2xl mx-auto">
              Professional tools designed for instructional designers, by instructional designers.
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
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-brand-secondary dark:text-lxd-muted max-w-2xl mx-auto mb-8">
              Choose the plan that fits your team. All plans include a 14-day free trial.
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
              Everything you need to know about INSPIRE Studio
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
                className="text-purple-600 dark:text-brand-purple font-semibold hover:underline"
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
          <StandardCTAButtons currentPage="/inspire-studio" />
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
            <div className="absolute inset-0 bg-linear-to-br from-(--brand-secondary) via-(--brand-primary-hover) to-(--brand-secondary)" />
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />

            <div className="relative z-10 p-12 md:p-16 text-center text-brand-primary">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Course Design?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
                Join the waitlist for early access to INSPIRE Studio and be among the first to
                experience AI-powered instructional design.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/vip?product=inspire-studio">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-brand-surface text-purple-600 font-bold rounded-xl flex items-center gap-2 justify-center text-lg"
                  >
                    <Rocket className="w-5 h-5" />
                    Join VIP Waitlist
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
