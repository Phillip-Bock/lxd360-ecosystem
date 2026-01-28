'use client';

import {
  animate,
  motion,
  useAnimation,
  useInView,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Quote,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  label,
  icon,
  delay = 0,
}: CounterProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 2,
        delay,
        ease: 'easeOut',
      });

      return controls.stop;
    }
  }, [isInView, count, value, delay]);

  useEffect(() => {
    return rounded.onChange((latest) => setDisplayValue(latest));
  }, [rounded]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="p-8 rounded-2xl bg-linear-to-br from-green-900/20 via-emerald-900/20 to-green-900/20 border border-brand-success/30 backdrop-blur-xs transition-all duration-300 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/30">
        <div className="mb-4 text-brand-success group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-5xl font-bold text-brand-primary mb-2">
          {prefix}
          {displayValue}
          {suffix}
        </div>
        <div className="text-lxd-text-light-body text-lg">{label}</div>
      </div>
    </motion.div>
  );
}

interface CaseStudyProps {
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  delay?: number;
}

function CaseStudy({
  company,
  industry,
  challenge,
  solution,
  results,
  delay = 0,
}: CaseStudyProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.7,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      className="group"
    >
      <div className="p-8 rounded-2xl bg-linear-to-br from-blue-900/20 via-indigo-900/20 to-blue-900/20 border border-brand-primary/30 backdrop-blur-xs transition-all duration-300 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/20">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-brand-primary mb-1">{company}</h3>
            <p className="text-brand-cyan font-semibold">{industry}</p>
          </div>
          <Award className="h-8 w-8 text-brand-warning" />
        </div>

        {/* Challenge */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-lxd-text-light-muted mb-2">Challenge</h4>
          <p className="text-lxd-text-light-body leading-relaxed">{challenge}</p>
        </div>

        {/* Solution */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-lxd-text-light-muted mb-2">Solution</h4>
          <p className="text-lxd-text-light-body leading-relaxed">{solution}</p>
        </div>

        {/* Results */}
        <div>
          <h4 className="text-lg font-semibold text-lxd-text-light-muted mb-3">Results</h4>
          <div className="space-y-2">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: delay + 0.1 * (index + 1), duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0 mt-0.5" />
                <span className="text-lxd-text-light">{result}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface TestimonialProps {
  quote: string;
  name: string;
  jobTitle: string;
  company: string;
  delay?: number;
}

function Testimonial({
  quote,
  name,
  jobTitle,
  company,
  delay = 0,
}: TestimonialProps): React.JSX.Element {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="p-8 rounded-2xl bg-linear-to-br from-purple-900/20 via-indigo-900/20 to-purple-900/20 border border-brand-secondary/30 backdrop-blur-xs">
        <Quote className="h-8 w-8 text-brand-purple mb-4" />
        <p className="text-lxd-text-light text-lg leading-relaxed mb-6 italic">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-brand-primary font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <div className="text-brand-primary font-semibold">{name}</div>
            <div className="text-lxd-text-light-muted text-sm">
              {jobTitle}, {company}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ImpactResults(): React.JSX.Element {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ background: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-green-900/10 to-transparent" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-success/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-brand-success/10 rounded-full blur-[140px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-success/10 border border-brand-success/20 text-brand-success font-semibold mb-6">
            <BarChart3 className="h-5 w-5" />
            <span>Proven Results</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6">
            Impact at Scale
          </h2>
          <p className="text-xl text-lxd-text-light-body leading-relaxed">
            Our platform delivers measurable outcomes for organizations across industries. These
            aren&apos;t projections—they&apos;re real results from real deployments.
          </p>
        </motion.div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-24">
          <AnimatedCounter
            value={500000}
            suffix="+"
            label="Learners Trained"
            icon={<Users className="h-12 w-12" />}
            delay={0.1}
          />
          <AnimatedCounter
            value={95}
            suffix="%"
            label="Skill Retention Rate"
            icon={<Target className="h-12 w-12" />}
            delay={0.2}
          />
          <AnimatedCounter
            value={3}
            suffix="x"
            label="Faster Time to Competency"
            icon={<Zap className="h-12 w-12" />}
            delay={0.3}
          />
          <AnimatedCounter
            value={87}
            suffix="%"
            label="Customer Satisfaction"
            icon={<TrendingUp className="h-12 w-12" />}
            delay={0.4}
          />
        </div>

        {/* Case Studies */}
        <div className="max-w-6xl mx-auto mb-24 space-y-8">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-brand-primary mb-12 text-center"
          >
            Success Stories
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CaseStudy
              company="Global Tech Corporation"
              industry="Technology"
              challenge="7,000 engineers needed upskilling in cloud architecture, but training completion was under 30% and retention was abysmal."
              solution="Deployed LXP360 with INSPIRE™ microlearning paths, spaced repetition, and hands-on labs integrated into daily workflows."
              results={[
                '92% course completion rate (up from 29%)',
                '87% skill retention at 90 days (measured via practical assessments)',
                'Cloud migration project completed 6 weeks ahead of schedule',
              ]}
              delay={0.1}
            />

            <CaseStudy
              company="Healthcare System Network"
              industry="Healthcare"
              challenge="Compliance training was a checkbox exercise with no engagement. Staff couldn't recall critical protocols when it mattered."
              solution="Replaced annual compliance videos with INSPIRE™ scenario-based microlearning and quarterly refreshers timed to forgetting curves."
              results={[
                'Protocol adherence increased 41% in audits',
                'Incident reports related to non-compliance dropped 67%',
                'Staff satisfaction with training jumped from 2.1 to 4.6/5',
              ]}
              delay={0.2}
            />
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-5xl mx-auto">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-brand-primary mb-12 text-center"
          >
            What Our Clients Say
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Testimonial
              quote="LXP360 didn't just improve our training—it transformed how we think about workforce development. The neuroscience approach actually works."
              name="Sarah Chen"
              jobTitle="Chief Learning Officer"
              company="Global Tech Corp"
              delay={0.1}
            />

            <Testimonial
              quote="For the first time, we can prove L&D's business impact with hard data. Our board now sees learning as a strategic investment, not a cost."
              name="Marcus Rodriguez"
              jobTitle="VP of Talent Development"
              company="Healthcare Network"
              delay={0.2}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
