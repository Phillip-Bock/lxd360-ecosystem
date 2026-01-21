'use client';

import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Twitter,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// ============================================================================
// CONTACT OPTIONS
// ============================================================================

const CONTACT_OPTIONS = [
  {
    title: 'Schedule a Demo',
    description: 'See LXP360 in action with a personalized walkthrough.',
    icon: Calendar,
    href: '/consultation',
    cta: 'Book Demo',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Talk to Sales',
    description: 'Discuss pricing and enterprise solutions.',
    icon: Users,
    href: '/consultation',
    cta: 'Contact Sales',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Get Support',
    description: 'Technical support for existing customers.',
    icon: MessageSquare,
    href: 'mailto:support@lxd360.com',
    cta: 'Email Support',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Partner With Us',
    description: 'Explore partnership and integration opportunities.',
    icon: Building2,
    href: 'mailto:partnerships@lxd360.com',
    cta: 'Partner Inquiry',
    color: 'from-amber-500 to-orange-500',
  },
];

const COMPANY_INFO = {
  email: 'hello@lxd360.com',
  phone: '+1 (888) LXD-360',
  address: 'Seattle, WA | Remote-First',
  hours: 'Monday - Friday, 9am - 5pm PST',
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ContactPage(): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setSubmitted(true);
    // Form submission logic would go here
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-lxd-primary-dark/10 via-transparent to-brand-primary/10 dark:from-lxd-primary-dark/40 dark:via-transparent dark:to-brand-primary/20" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-brand-primary/20 to-lxd-secondary/20 border border-brand-primary/30 text-brand-primary dark:text-neural-cyan text-sm font-medium mb-8">
            <MessageSquare className="w-4 h-4" />
            <span>Get in Touch</span>
          </div>

          {/* Headline - WCAG AA compliant */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-lxd-dark-surface dark:text-lxd-light-page">
            Let&apos;s Start a{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-lxd-secondary">
              Conversation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-studio-text dark:text-studio-text max-w-3xl mx-auto">
            Whether you have questions about our products, need support, or want to explore how we
            can help transform your learning initiatives, we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONTACT OPTIONS */}
      {/* ================================================================== */}
      <section className="py-12 px-4 bg-background dark:bg-studio-bg-dark">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_OPTIONS.map((option, index) => (
              <Link
                key={index}
                href={option.href}
                className="group p-6 rounded-2xl bg-white dark:bg-studio-bg border border-lxd-light-border dark:border-surface-card hover:border-brand-primary/50 dark:hover:border-neural-cyan/50 transition-all duration-300 hover:shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${option.color} flex items-center justify-center mb-4`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-lxd-dark-surface dark:text-lxd-light-page mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-studio-text dark:text-studio-text mb-4">
                  {option.description}
                </p>
                <span className="flex items-center gap-2 text-sm font-medium text-brand-primary dark:text-neural-cyan group-hover:gap-3 transition-all">
                  {option.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONTACT FORM & INFO */}
      {/* ================================================================== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-studio-bg rounded-2xl p-8 border border-lxd-light-border dark:border-surface-card">
              <h2 className="text-2xl font-bold text-lxd-dark-surface dark:text-lxd-light-page mb-6">
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
                  <h3 className="text-xl font-bold text-lxd-dark-surface dark:text-lxd-light-page mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-studio-text dark:text-studio-text">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-lxd-dark-surface dark:text-lxd-light-page mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-lxd-light-border dark:border-surface-card bg-background dark:bg-studio-bg-dark text-lxd-dark-surface dark:text-lxd-light-page focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-lxd-dark-surface dark:text-lxd-light-page mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-lxd-light-border dark:border-surface-card bg-background dark:bg-studio-bg-dark text-lxd-dark-surface dark:text-lxd-light-page focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-lxd-dark-surface dark:text-lxd-light-page mb-2"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-lxd-light-border dark:border-surface-card bg-background dark:bg-studio-bg-dark text-lxd-dark-surface dark:text-lxd-light-page focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-lxd-dark-surface dark:text-lxd-light-page mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-lxd-light-border dark:border-surface-card bg-background dark:bg-studio-bg-dark text-lxd-dark-surface dark:text-lxd-light-page focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value="">Select a topic</option>
                      <option value="demo">Product Demo</option>
                      <option value="pricing">Pricing Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-lxd-dark-surface dark:text-lxd-light-page mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-lxd-light-border dark:border-surface-card bg-background dark:bg-studio-bg-dark text-lxd-dark-surface dark:text-lxd-light-page focus:outline-hidden focus:ring-2 focus:ring-brand-primary resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-linear-to-r from-brand-primary to-lxd-secondary text-white font-bold rounded-xl flex items-center gap-2 justify-center text-lg hover:shadow-lg hover:shadow-brand-primary/25 transition-all"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Company Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-lxd-dark-surface dark:text-lxd-light-page mb-6">
                  Company Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-brand-primary dark:text-neural-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-lxd-dark-surface dark:text-lxd-light-page">
                        Email
                      </p>
                      <a
                        href={`mailto:${COMPANY_INFO.email}`}
                        className="text-brand-primary dark:text-neural-cyan hover:underline"
                      >
                        {COMPANY_INFO.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-brand-primary dark:text-neural-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-lxd-dark-surface dark:text-lxd-light-page">
                        Phone
                      </p>
                      <p className="text-studio-text dark:text-studio-text">{COMPANY_INFO.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-brand-primary dark:text-neural-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-lxd-dark-surface dark:text-lxd-light-page">
                        Location
                      </p>
                      <p className="text-studio-text dark:text-studio-text">
                        {COMPANY_INFO.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-brand-primary dark:text-neural-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-lxd-dark-surface dark:text-lxd-light-page">
                        Business Hours
                      </p>
                      <p className="text-studio-text dark:text-studio-text">{COMPANY_INFO.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-bold text-lxd-dark-surface dark:text-lxd-light-page mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://linkedin.com/company/lxd360"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-background dark:bg-studio-bg-dark border border-lxd-light-border dark:border-surface-card flex items-center justify-center hover:border-brand-primary/50 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-studio-text dark:text-studio-text" />
                  </a>
                  <a
                    href="https://twitter.com/lxd360"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-background dark:bg-studio-bg-dark border border-lxd-light-border dark:border-surface-card flex items-center justify-center hover:border-brand-primary/50 transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-studio-text dark:text-studio-text" />
                  </a>
                </div>
              </div>

              {/* Quick Consultation CTA */}
              <div className="p-6 rounded-2xl bg-linear-to-br from-lxd-primary-dark to-brand-primary">
                <h3 className="text-xl font-bold text-white mb-2">Need Immediate Assistance?</h3>
                <p className="text-white/80 mb-4">Book a 30-minute consultation with our team.</p>
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
