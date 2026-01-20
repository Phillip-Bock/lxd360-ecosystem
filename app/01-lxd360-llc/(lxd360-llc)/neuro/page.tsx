'use client';

import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  MessageSquare,
  Rocket,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { ConsultingServicesPricingSection } from '@/components/marketing/home/ConsultingServicesPricingSection';

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
// SERVICE DATA
// ============================================================================

const SERVICES = [
  {
    title: 'Learning Strategy Development',
    description:
      'Comprehensive organizational learning assessments and strategic roadmaps aligned with business objectives.',
    icon: Target,
    features: ['Needs Analysis', 'Gap Assessment', 'Strategic Roadmap', 'ROI Planning'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Curriculum Design & Development',
    description:
      'Custom course development using the INSPIRE Learning Architecture for maximum learner engagement and retention.',
    icon: BookOpen,
    features: ['INSPIRE Framework', 'Modular Design', 'Assessment Strategy', 'Content Development'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Neuroscience-Based Design',
    description:
      'Apply cognitive science principles to optimize learning outcomes for neurodiverse audiences.',
    icon: Brain,
    features: [
      'Cognitive Load Optimization',
      'Accessibility Design',
      'Neurodiversity Support',
      'Retention Strategies',
    ],
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Technology Implementation',
    description:
      'LMS/LXP selection, integration, and deployment support for seamless learning technology ecosystems.',
    icon: Rocket,
    features: [
      'Platform Selection',
      'Integration Planning',
      'Migration Support',
      'Training & Adoption',
    ],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Compliance & Regulatory Training',
    description:
      'Industry-specific compliance training design for healthcare, aerospace, and manufacturing sectors.',
    icon: Shield,
    features: ['FDA/FAA Compliance', 'OSHA Standards', 'Audit Preparation', 'Documentation'],
    gradient: 'from-red-500 to-rose-500',
  },
  {
    title: 'Training Program Evaluation',
    description:
      'Comprehensive evaluation using Kirkpatrick and Phillips ROI models to measure learning impact.',
    icon: Award,
    features: ['Kirkpatrick Levels', 'Phillips ROI', 'Analytics Setup', 'Continuous Improvement'],
    gradient: 'from-indigo-500 to-violet-500',
  },
];

const INDUSTRIES = [
  { name: 'Healthcare', icon: '🏥', description: 'FDA, HIPAA, and clinical training compliance' },
  {
    name: 'Aerospace & Aviation',
    icon: '✈️',
    description: 'FAA Part 121/135 and safety-critical training',
  },
  {
    name: 'Manufacturing',
    icon: '🏭',
    description: 'OSHA, quality systems, and operational excellence',
  },
  {
    name: 'Defense & Government',
    icon: '🛡️',
    description: 'Military training standards and security compliance',
  },
  {
    name: 'Energy & Utilities',
    icon: '⚡',
    description: 'Safety certifications and regulatory compliance',
  },
  {
    name: 'Financial Services',
    icon: '🏦',
    description: 'Regulatory compliance and professional development',
  },
];

const ENGAGEMENT_MODELS = [
  {
    title: 'Discovery Session',
    duration: '2 Hours',
    description: 'Free initial consultation to understand your challenges and explore solutions.',
    price: 'Complimentary',
    features: ['Needs Discussion', 'Solution Overview', 'Next Steps Planning'],
  },
  {
    title: 'Strategic Assessment',
    duration: '1-2 Weeks',
    description:
      'Comprehensive analysis of your current learning ecosystem with actionable recommendations.',
    price: 'Starting at $5,000',
    features: [
      'Stakeholder Interviews',
      'Gap Analysis',
      'Strategic Roadmap',
      'Executive Presentation',
    ],
  },
  {
    title: 'Project Engagement',
    duration: '4-12 Weeks',
    description:
      'End-to-end project delivery for specific learning initiatives with defined outcomes.',
    price: 'Custom Scope',
    features: ['Dedicated Team', 'Milestone Delivery', 'Quality Assurance', 'Knowledge Transfer'],
  },
  {
    title: 'Retainer Partnership',
    duration: 'Ongoing',
    description:
      'Continuous strategic support with dedicated hours for ongoing learning initiatives.',
    price: 'Monthly Retainer',
    features: ['Priority Access', 'Strategic Guidance', 'Project Support', 'Quarterly Reviews'],
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

export default function SolutionsPage(): React.JSX.Element {
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-lxd-primary/5 via-transparent to-lxd-secondary/5" />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lxd-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-lxd-secondary/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <FloatingBadge className="mb-8">
            <Award className="w-4 h-4" />
            <span>Service-Disabled Veteran-Owned Small Business</span>
          </FloatingBadge>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-lxd-dark-text dark:text-lxd-light-text"
          >
            Transform Learning Through{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-lxd-primary to-lxd-secondary">
              Expert Consultation
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-3xl mx-auto mb-10"
          >
            Neuroscience-backed learning experience design services for regulated industries. From
            strategy to implementation, we partner with you to create measurable learning outcomes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact?service=consultation">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-linear-to-r from-lxd-primary to-lxd-secondary text-brand-primary font-bold rounded-xl flex items-center gap-2 justify-center text-lg shadow-lg shadow-lxd-primary/25"
              >
                <Calendar className="w-5 h-5" />
                Schedule Discovery Call
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="#services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-lxd-primary/30 text-lxd-primary font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-lxd-primary/5 transition-colors text-lg"
              >
                <FileText className="w-5 h-5" />
                View Services
              </motion.button>
            </Link>
          </motion.div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-lxd-text-light-muted dark:text-lxd-text-dark-muted"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-lxd-primary" />
              <span>PhD in Instructional Technology</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-lxd-primary" />
              <span>Blue Origin & Amazon Alumni</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-lxd-primary" />
              <span>SDVOSB Certified</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRODUCTIZED SERVICES PRICING (From Home Page) */}
      {/* ================================================================== */}
      <ConsultingServicesPricingSection />

      {/* ================================================================== */}
      {/* SERVICES SECTION */}
      {/* ================================================================== */}
      <section
        id="services"
        ref={servicesRef}
        className="py-20 lg:py-32 px-4 bg-lxd-light-page dark:bg-lxd-dark-page"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <FloatingBadge className="mb-6">
              <Zap className="w-4 h-4" />
              <span>Our Services</span>
            </FloatingBadge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              Comprehensive Learning Solutions
            </h2>
            <p className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-2xl mx-auto">
              End-to-end consulting services powered by the INSPIRE Learning Architecture
            </p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={servicesInView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="group p-8 rounded-2xl bg-brand-surface dark:bg-lxd-dark-card border border-lxd-light-card dark:border-lxd-dark-border transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-linear-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <service.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-lxd-dark-text dark:text-lxd-light-text mb-3">
                  {service.title}
                </h3>
                <p className="text-lxd-text-light-muted dark:text-lxd-text-dark-muted mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-lxd-text-light-body dark:text-lxd-text-dark-body"
                    >
                      <CheckCircle2 className="w-4 h-4 text-lxd-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* INDUSTRIES SECTION */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-lxd-light-card/50 dark:bg-lxd-dark-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              Industries We Serve
            </h2>
            <p className="text-lg text-lxd-text-light-muted dark:text-lxd-text-dark-muted">
              Specialized expertise in regulated and safety-critical industries
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-brand-surface dark:bg-lxd-dark-card border border-lxd-light-card dark:border-lxd-dark-border"
              >
                <div className="text-4xl mb-3">{industry.icon}</div>
                <h3 className="text-lg font-bold text-lxd-dark-text dark:text-lxd-light-text mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-lxd-text-light-muted dark:text-lxd-text-dark-muted">
                  {industry.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ENGAGEMENT MODELS SECTION */}
      {/* ================================================================== */}
      <section className="py-20 lg:py-32 px-4 bg-lxd-light-page dark:bg-lxd-dark-page">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <FloatingBadge className="mb-6">
              <Clock className="w-4 h-4" />
              <span>Engagement Models</span>
            </FloatingBadge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-lxd-dark-text dark:text-lxd-light-text">
              Flexible Partnership Options
            </h2>
            <p className="text-xl text-lxd-text-light-muted dark:text-lxd-text-dark-muted max-w-2xl mx-auto">
              Choose the engagement model that best fits your needs and timeline
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ENGAGEMENT_MODELS.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl border ${
                  i === 0
                    ? 'bg-linear-to-br from-lxd-primary/10 to-lxd-secondary/10 border-lxd-primary/30'
                    : 'bg-brand-surface dark:bg-lxd-dark-card border-lxd-light-card dark:border-lxd-dark-border'
                } transition-all duration-300`}
              >
                <div className="text-sm font-medium text-lxd-primary mb-2">{model.duration}</div>
                <h3 className="text-xl font-bold text-lxd-dark-text dark:text-lxd-light-text mb-2">
                  {model.title}
                </h3>
                <p className="text-sm text-lxd-text-light-muted dark:text-lxd-text-dark-muted mb-4">
                  {model.description}
                </p>
                <div className="text-lg font-bold text-lxd-primary mb-4">{model.price}</div>
                <ul className="space-y-2">
                  {model.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-lxd-primary shrink-0" />
                      <span className="text-lxd-text-light-body dark:text-lxd-text-dark-body">
                        {feature}
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
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-lxd-primary via-lxd-secondary to-lxd-primary" />
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />

            <div className="relative z-10 p-12 md:p-16 text-center text-brand-primary">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-90" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
                Schedule a complimentary discovery session to discuss your challenges and explore
                how we can help you achieve measurable learning outcomes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact?service=consultation">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-brand-surface text-lxd-primary font-bold rounded-xl flex items-center gap-2 justify-center text-lg"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Discovery Call
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>

              <p className="mt-6 text-sm opacity-75">
                No commitment required | 30-minute session | Actionable insights
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
