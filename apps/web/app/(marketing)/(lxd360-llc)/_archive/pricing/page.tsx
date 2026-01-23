'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Calculator,
  ChevronRight,
  Clock,
  CreditCard,
  Gift,
  GraduationCap,
  Layers,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { GuaranteeBadge } from '@/components/pricing/GuaranteeBadge';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { getActiveDiscounts, products } from '@/lib/pricing/data';
import type { BillingPeriod } from '@/types/pricing';
import { calculateSavings, formatPrice, getMonthlyEquivalent } from '@/types/pricing';

// Product icons mapping
const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'inspire-studio': Sparkles,
  lxp360: GraduationCap,
  lxd360: Layers,
};

// Product colors
const productColors: Record<string, string> = {
  'inspire-studio': 'from-purple-500 to-purple-700',
  lxp360: 'from-blue-500 to-blue-700',
  lxd360: 'from-emerald-500 to-emerald-700',
};

export default function PricingHubPage(): React.JSX.Element {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
  const discounts = getActiveDiscounts();

  return (
    <main className="min-h-screen">
      {/* =====================================================================
          HERO SECTION
      ====================================================================== */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-linear-to-b from-lxd-light-page to-lxd-light-card dark:from-lxd-dark-page dark:to-lxd-dark-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
            >
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300 text-sm font-semibold">
                Simple, Transparent Pricing
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="text-lxd-text-dark-heading dark:text-white">Choose Your </span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                Learning Stack
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-lxd-text-dark-body dark:text-lxd-text-light-muted mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              From AI-powered course authoring to enterprise learning management. Start with what
              you need, scale as you grow. All plans include a 14-day free trial.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-10"
            >
              <div className="flex items-center gap-2 text-lxd-text-dark-body dark:text-lxd-text-light-muted">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2 text-lxd-text-dark-body dark:text-lxd-text-light-muted">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 text-lxd-text-dark-body dark:text-lxd-text-light-muted">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PricingToggle value={billingPeriod} onChange={setBillingPeriod} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PRODUCTS GRID
      ====================================================================== */}
      <section className="py-16 md:py-20 bg-lxd-light-card dark:bg-lxd-dark-page">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {products
              .filter((p) => p.isActive)
              .map((product, index) => {
                const Icon = productIcons[product.id] || Layers;
                const colorClass = productColors[product.id] || 'from-gray-500 to-gray-700';
                const startingTier = product.tiers.find((t) => !t.isCustomPricing && t.isActive);
                const startingPrice = startingTier
                  ? billingPeriod === 'yearly'
                    ? startingTier.priceYearly
                    : startingTier.priceMonthly
                  : null;
                const monthlyEquivalent = startingPrice
                  ? getMonthlyEquivalent(startingPrice, billingPeriod)
                  : null;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="relative bg-white dark:bg-lxd-dark-card rounded-2xl border border-lxd-light-border dark:border-lxd-dark-border overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                  >
                    {/* Product Header */}
                    <div className={`bg-linear-to-r ${colorClass} p-6`}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{product.name}</h2>
                          <p className="text-white/80 text-sm">{product.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Content */}
                    <div className="p-6">
                      <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted mb-6 min-h-[48px]">
                        {product.description}
                      </p>

                      {/* Starting Price */}
                      {monthlyEquivalent !== null && (
                        <div className="mb-6">
                          <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted mb-1">
                            Starting at
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-lxd-text-dark-heading dark:text-white">
                              {formatPrice(monthlyEquivalent)}
                            </span>
                            <span className="text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
                              /month
                            </span>
                          </div>
                          {billingPeriod === 'yearly' &&
                            startingTier?.priceMonthly &&
                            startingPrice && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Save {calculateSavings(startingTier.priceMonthly, startingPrice)}%
                                with yearly billing
                              </p>
                            )}
                        </div>
                      )}

                      {/* Tiers Summary */}
                      <div className="mb-6 space-y-2">
                        <p className="text-sm font-semibold text-lxd-text-dark-heading dark:text-white mb-3">
                          Available Plans:
                        </p>
                        {product.tiers
                          .filter((t) => t.isActive)
                          .slice(0, 4)
                          .map((tier) => (
                            <div
                              key={tier.id}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                tier.isPopular
                                  ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                                  : 'bg-lxd-light-surface dark:bg-lxd-dark-surface'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-lxd-text-dark-heading dark:text-white">
                                  {tier.name}
                                </span>
                                {tier.isPopular && (
                                  <span className="px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-200 dark:bg-purple-800 rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
                                {tier.isCustomPricing
                                  ? 'Custom'
                                  : billingPeriod === 'yearly' && tier.priceYearly
                                    ? formatPrice(getMonthlyEquivalent(tier.priceYearly, 'yearly'))
                                    : tier.priceMonthly
                                      ? formatPrice(tier.priceMonthly)
                                      : 'Free'}
                                {!tier.isCustomPricing && tier.priceMonthly && '/mo'}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/pricing/${product.slug}`}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 bg-linear-to-r ${colorClass} text-white hover:shadow-lg hover:-translate-y-0.5`}
                      >
                        View {product.name} Plans
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          QUICK LINKS
      ====================================================================== */}
      <section className="py-12 md:py-16 bg-lxd-light-surface dark:bg-lxd-dark-surface/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-lxd-text-dark-heading dark:text-white mb-4">
              More Pricing Resources
            </h2>
            <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted">
              Everything you need to make the right decision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Compare Plans */}
            <Link
              href="/pricing/compare"
              className="group p-6 bg-white dark:bg-lxd-dark-card rounded-xl border border-lxd-light-border dark:border-lxd-dark-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lxd-text-dark-heading dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Compare Plans
                  </h3>
                  <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
                    Side-by-side feature comparison
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-lxd-text-dark-muted dark:text-lxd-text-light-muted group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>

            {/* ROI Calculator */}
            <Link
              href="/pricing/calculator"
              className="group p-6 bg-white dark:bg-lxd-dark-card rounded-xl border border-lxd-light-border dark:border-lxd-dark-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lxd-text-dark-heading dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    ROI Calculator
                  </h3>
                  <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
                    Calculate your potential savings
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-lxd-text-dark-muted dark:text-lxd-text-light-muted group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              </div>
            </Link>

            {/* Add-ons */}
            <Link
              href="/pricing/addons"
              className="group p-6 bg-white dark:bg-lxd-dark-card rounded-xl border border-lxd-light-border dark:border-lxd-dark-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lxd-text-dark-heading dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Add-ons
                  </h3>
                  <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
                    Extend your platform capabilities
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-lxd-text-dark-muted dark:text-lxd-text-light-muted group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </div>
            </Link>

            {/* Enterprise */}
            <Link
              href="/pricing/enterprise"
              className="group p-6 bg-white dark:bg-lxd-dark-card rounded-xl border border-lxd-light-border dark:border-lxd-dark-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lxd-text-dark-heading dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Enterprise
                  </h3>
                  <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted">
                    Custom solutions for large orgs
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-lxd-text-dark-muted dark:text-lxd-text-light-muted group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          DISCOUNTS SECTION
      ====================================================================== */}
      {discounts.length > 0 && (
        <section className="py-12 md:py-16 bg-lxd-light-card dark:bg-lxd-dark-page">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <Gift className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 text-sm font-semibold">
                  Special Discounts Available
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-lxd-text-dark-heading dark:text-white mb-4">
                Special Pricing Programs
              </h2>
              <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
                Qualifying organizations can save up to 25% on all plans
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {discounts.map((discount) => (
                <motion.div
                  key={discount.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-lxd-dark-card rounded-xl border border-lxd-light-border dark:border-lxd-dark-border p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lxd-text-dark-heading dark:text-white">
                        {discount.name}
                      </h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {discount.discountPercent}% Off
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-lxd-text-dark-muted dark:text-lxd-text-light-muted mb-4">
                    {discount.description}
                  </p>
                  <Link
                    href={discount.ctaUrl || '/pricing/education'}
                    className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                  >
                    {discount.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          FAQ SECTION
      ====================================================================== */}
      <section className="py-16 md:py-20 bg-lxd-light-surface dark:bg-lxd-dark-surface/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-lxd-text-dark-heading dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <PricingFAQ />
          </div>
        </div>
      </section>

      {/* =====================================================================
          GUARANTEE SECTION
      ====================================================================== */}
      <section className="py-12 md:py-16 bg-lxd-light-card dark:bg-lxd-dark-page">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GuaranteeBadge variant="full" />
          </div>
        </div>
      </section>

      {/* =====================================================================
          CTA SECTION
      ====================================================================== */}
      <section className="py-16 md:py-24 bg-linear-to-br from-purple-700 via-purple-800 to-purple-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to transform your learning?
              </h2>
              <p className="text-purple-200 text-lg mb-8 leading-relaxed">
                Start your 14-day free trial today. No credit card required. Experience the full
                power of our learning platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/sign-up"
                  className="px-8 py-4 bg-white text-purple-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors border border-purple-500"
                >
                  Talk to Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
