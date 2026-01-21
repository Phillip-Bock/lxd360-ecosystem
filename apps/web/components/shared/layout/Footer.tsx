'use client';

import {
  Facebook,
  FileText,
  Github,
  Instagram,
  Linkedin,
  Scale,
  Send,
  ShieldCheck,
  Twitter,
  Youtube,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type {
  ComplianceLink,
  Footer as FooterData,
  Link as LinkType,
  PolicyContent,
  SocialLink as SocialLinkType,
} from '@/lib/content/types';

// ============================================================================
// DEFAULT VALUES (fallback when CMS data is not available)
// ============================================================================
const DEFAULT_POLICIES: PolicyContent[] = [
  { _key: '1', title: 'Accessibility', slug: 'accessibility' },
  { _key: '2', title: 'AI Disclosure', slug: 'ai-disclosure' },
  { _key: '3', title: 'Cookie Policy', slug: 'cookies' },
  { _key: '4', title: 'Data Retention & Deletion', slug: 'data-retention' },
];

const DEFAULT_LEGAL: PolicyContent[] = [
  { _key: '5', title: 'Terms Of Use', slug: 'terms' },
  { _key: '6', title: 'Service Agreement', slug: 'service-agreement' },
  { _key: '7', title: 'Privacy Policy', slug: 'privacy' },
  { _key: '8', title: 'Security', slug: 'security' },
];

const DEFAULT_COMPLIANCE: ComplianceLink[] = [
  { _key: '1', label: 'SOC 2 Type II', href: '/compliance' },
  { _key: '2', label: 'ISO 27001', href: '/compliance' },
  { _key: '3', label: 'FedRAMP', href: '/compliance' },
  { _key: '4', label: 'WCAG 2.2 AA', href: '/compliance' },
];

const DEFAULT_QUICK_LINKS: LinkType[] = [
  { _key: '1', label: 'Create AI-Powered Content Fast', href: '/products/inspire-studio' },
  { _key: '2', label: 'Unify Your Entire Tech Stack', href: '/lxd-ecosystem' },
  { _key: '3', label: 'Design Your L&D Strategy Blueprint', href: '/solutions' },
  { _key: '4', label: 'Contact Us', href: '/contact' },
  { _key: '5', label: 'VIP Access', href: '/vip' },
  { _key: '6', label: 'System Status', href: '/status' },
  { _key: '7', label: 'Log In', href: '/auth/login' },
];

const DEFAULT_SOCIALS: SocialLinkType[] = [
  { _key: '1', platform: 'linkedin', url: 'https://linkedin.com/company/lxd360' },
  { _key: '2', platform: 'x', url: 'https://x.com/lxd360' },
  { _key: '3', platform: 'github', url: 'https://github.com/lxd360' },
];

const DEFAULTS = {
  newsletterTitle: 'Stay Updated',
  newsletterDescription:
    'Subscribe to our newsletter for the latest updates, features, and learning insights.',
  newsletterButtonText: 'Subscribe',
  brandDescription:
    'Professional learning experience design and management platform powering the future of workforce development.',
  copyrightText: 'LXD360. All rights reserved.',
};

// ============================================================================
// SOCIAL ICON MAPPING
// ============================================================================
const socialIcons: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  x: Twitter,
  github: Github,
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  reddit: Github, // Fallback
  medium: Github, // Fallback
};

// ============================================================================
// PROPS INTERFACE
// ============================================================================
interface FooterProps {
  data?: FooterData | null;
}

// ============================================================================
// FOOTER COMPONENT
// ============================================================================
export function Footer({ data }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Merge CMS data with defaults
  const newsletterTitle = data?.newsletterTitle || DEFAULTS.newsletterTitle;
  const newsletterDescription = data?.newsletterDescription || DEFAULTS.newsletterDescription;
  const newsletterButtonText = data?.newsletterButtonText || DEFAULTS.newsletterButtonText;
  const brandDescription = data?.brandDescription || DEFAULTS.brandDescription;
  const copyrightText = data?.copyrightText || DEFAULTS.copyrightText;

  // Links with fallbacks
  const policies = data?.policies && data.policies.length > 0 ? data.policies : DEFAULT_POLICIES;
  const legal = data?.legal && data.legal.length > 0 ? data.legal : DEFAULT_LEGAL;
  const quickLinks =
    data?.quickLinks && data.quickLinks.length > 0 ? data.quickLinks : DEFAULT_QUICK_LINKS;
  const socialLinks =
    data?.socialLinks && data.socialLinks.length > 0 ? data.socialLinks : DEFAULT_SOCIALS;
  const complianceLinks =
    data?.complianceLinks && data.complianceLinks.length > 0
      ? data.complianceLinks
      : DEFAULT_COMPLIANCE;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="relative bg-transparent">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section - Frosted Glass */}
        <div className="mb-8 text-center bg-lxd-light-card/80 dark:bg-lxd-dark-surface/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-lxd-light-border/50 dark:border-lxd-purple-dark/30">
          <h3 className="text-2xl font-bold text-lxd-text-dark-heading dark:text-lxd-text-light-heading mb-4">
            {newsletterTitle}
          </h3>
          <p className="text-lxd-text-dark dark:text-lxd-text-light-secondary mb-6 max-w-md mx-auto">
            {newsletterDescription}
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-lxd-light-border dark:border-lxd-purple-dark/40 bg-lxd-light-card dark:bg-lxd-dark-surface text-lxd-text-dark-heading dark:text-lxd-text-light placeholder-lxd-text-dark-placeholder focus:outline-hidden focus:ring-2 focus:ring-lxd-blue backdrop-blur-xs"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-lxd-blue hover:bg-lxd-blue-dark text-brand-primary rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              {subscribed ? 'Subscribed!' : newsletterButtonText}
            </button>
          </form>
        </div>

        {/* Footer Grid - 5 Columns: Brand | Policies | Compliance | Legal | Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Brand & Description */}
          <div className="bg-lxd-light-card/80 dark:bg-lxd-dark-surface/60 backdrop-blur-lg rounded-xl p-5 border-2 border-lxd-light-border/50 dark:border-lxd-purple-dark/30">
            <Image
              src="/lxd360-logo.png"
              alt="LXD360"
              width={140}
              height={48}
              className="h-12 w-auto mb-4"
            />
            <p className="text-xs text-lxd-text-dark dark:text-lxd-text-light-secondary">
              {brandDescription}
            </p>
          </div>

          {/* Policies */}
          <div className="bg-lxd-light-card/80 dark:bg-lxd-dark-surface/60 backdrop-blur-lg rounded-xl p-5 border-2 border-lxd-light-border/50 dark:border-lxd-purple-dark/30">
            <h4 className="font-semibold text-lxd-text-dark-heading dark:text-lxd-text-light-heading mb-3 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-lxd-blue" />
              Policies
            </h4>
            <ul className="space-y-1.5">
              {policies.map((policy) => (
                <li key={policy._key}>
                  <Link
                    href={`/policies/${policy.slug}`}
                    className="text-xs text-lxd-text-dark dark:text-lxd-text-light-secondary hover:text-lxd-blue dark:hover:text-lxd-blue-light transition-colors"
                  >
                    {policy.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance - NEW CENTER CARD */}
          <div className="bg-lxd-light-card/80 dark:bg-lxd-dark-surface/60 backdrop-blur-lg rounded-xl p-5 border-2 border-lxd-light-border/50 dark:border-lxd-purple-dark/30">
            <h4 className="font-semibold text-lxd-text-dark-heading dark:text-lxd-text-light-heading mb-3 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lxd-blue" />
              Compliance
            </h4>
            <ul className="space-y-1.5">
              {complianceLinks.map((item) => (
                <li key={item._key}>
                  <Link
                    href={item.href}
                    className="text-xs text-lxd-text-dark dark:text-lxd-text-light-secondary hover:text-lxd-blue dark:hover:text-lxd-blue-light transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="bg-lxd-light-card/80 dark:bg-lxd-dark-surface/60 backdrop-blur-lg rounded-xl p-5 border-2 border-lxd-light-border/50 dark:border-lxd-purple-dark/30">
            <h4 className="font-semibold text-lxd-text-dark-heading dark:text-lxd-text-light-heading mb-3 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-lxd-blue" />
              Legal
            </h4>
            <ul className="space-y-1.5">
              {legal.map((item) => (
                <li key={item._key}>
                  <Link
                    href={`/policies/${item.slug}`}
                    className="text-xs text-lxd-text-dark dark:text-lxd-text-light-secondary hover:text-lxd-blue dark:hover:text-lxd-blue-light transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="bg-lxd-light-card/80 dark:bg-lxd-dark-surface/60 backdrop-blur-lg rounded-xl p-5 border-2 border-lxd-light-border/50 dark:border-lxd-purple-dark/30">
            <h4 className="font-semibold text-lxd-text-dark-heading dark:text-lxd-text-light-heading mb-3 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-lxd-blue" />
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link._key}>
                  <Link
                    href={link.href}
                    target={link.isExternal ? '_blank' : undefined}
                    rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    className="text-xs text-lxd-text-dark dark:text-lxd-text-light-secondary hover:text-lxd-blue dark:hover:text-lxd-blue-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-5">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.platform] || Github;
                return (
                  <a
                    key={social._key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lxd-text-dark dark:text-lxd-text-light-muted hover:text-lxd-blue dark:hover:text-lxd-blue-light hover:scale-110 transition-all duration-200"
                    aria-label={social.platform}
                    title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <p className="text-sm text-lxd-text-dark dark:text-lxd-text-light-muted">
              &copy; {new Date().getFullYear()} {copyrightText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
