'use client';

import { motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================
const navigationItems = [
  { label: 'LXD360', href: '/' },
  { label: 'Vision', href: '/vision' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'INSPIRE Studio', href: '/products/inspire-studio' },
  { label: 'LXP360', href: '/products/lxp360' },
  { label: 'LXD Ecosystem', href: '/lxd-ecosystem' },
  { label: 'ROI', href: '/pricing' },
  { label: 'LXD Nexus', href: '/lxd-nexus' },
  { label: 'VIP', href: '/vip' },
];

// ============================================================================
// SLIDER TOGGLE COMPONENT
// ============================================================================
const TOGGLE_CLASSES =
  'text-sm font-medium flex items-center gap-2 px-3 md:pl-3 md:pr-3.5 py-3 md:py-1.5 transition-colors relative z-10';

interface SliderToggleProps {
  selected: string;
  setSelected: (value: string) => void;
}

const SliderToggle = ({ selected, setSelected }: SliderToggleProps) => {
  return (
    <div className="relative flex w-fit items-center rounded-full bg-lxd-light-surface/20 dark:bg-lxd-dark-surface">
      <button
        type="button"
        className={`${TOGGLE_CLASSES} ${
          selected === 'light'
            ? 'text-brand-primary'
            : 'text-lxd-text-dark dark:text-lxd-text-light'
        }`}
        onClick={() => setSelected('light')}
      >
        <Sun className="relative z-10 h-4 w-4 md:h-3.5 md:w-3.5" />
        <span className="relative z-10 hidden sm:inline">Light</span>
      </button>
      <button
        type="button"
        className={`${TOGGLE_CLASSES} ${
          selected === 'dark' ? 'text-brand-primary' : 'text-lxd-text-dark dark:text-lxd-text-light'
        }`}
        onClick={() => setSelected('dark')}
      >
        <Moon className="relative z-10 h-4 w-4 md:h-3.5 md:w-3.5" />
        <span className="relative z-10 hidden sm:inline">Dark</span>
      </button>
      <div
        className={`absolute inset-0 z-0 flex ${
          selected === 'dark' ? 'justify-end' : 'justify-start'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', damping: 15, stiffness: 250 }}
          className="h-full w-1/2 rounded-full bg-linear-to-r from-blue-600 to-blue-700"
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4">
      <nav className="container mx-auto px-4">
        <div
          className={`flex items-center justify-between gap-8 px-6 py-3 rounded-2xl transition-all duration-300 border-2 ${
            scrolled
              ? 'bg-lxd-light-card/90 dark:bg-lxd-dark-surface/80 backdrop-blur-xl shadow-lg border-lxd-light-border/50 dark:border-lxd-purple-dark/40'
              : 'bg-lxd-light-card/70 dark:bg-lxd-dark-surface/60 backdrop-blur-lg border-lxd-light-border/30 dark:border-lxd-purple-dark/30'
          }`}
        >
          {/* Logo - Far Left */}
          <Link href="/" className="shrink-0">
            <Image
              src="/lxd360-logo.png"
              alt="LXD360"
              width={320}
              height={107}
              className="h-28 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation - Center (WCAG AA compliant contrast) */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 text-sm font-medium text-lxd-text-dark dark:text-lxd-text-light hover:text-lxd-blue dark:hover:text-lxd-blue-light transition-colors relative group whitespace-nowrap"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lxd-blue dark:bg-lxd-blue-light transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Side - Theme Toggle, Sign In */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {/* Dark/Light Mode Slider Toggle */}
            {mounted && (
              <SliderToggle
                selected={theme === 'dark' ? 'dark' : 'light'}
                setSelected={handleThemeChange}
              />
            )}

            {/* Sign In Button */}
            <Link
              href="/auth/login"
              className="px-6 py-2 text-sm font-medium text-brand-primary bg-lxd-blue hover:bg-lxd-blue-dark rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-lxd-text-dark dark:text-lxd-text-light hover:bg-lxd-light-surface/20 dark:hover:bg-lxd-dark-surface rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-in slide-in-from-top">
            <div className="flex flex-col gap-4 bg-lxd-light-card/90 dark:bg-lxd-dark-page/90 backdrop-blur-xl rounded-2xl p-4 border border-lxd-light-border/50 dark:border-lxd-purple-dark/40">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-lxd-text-dark dark:text-lxd-text-light hover:bg-lxd-light-surface/20 dark:hover:bg-lxd-dark-surface rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-lxd-light-border dark:border-lxd-dark-border pt-4 mt-2 flex flex-col gap-3">
                {/* Mobile Theme Toggle */}
                {mounted && (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-lxd-text-dark dark:text-lxd-text-light">
                      Theme
                    </span>
                    <SliderToggle
                      selected={theme === 'dark' ? 'dark' : 'light'}
                      setSelected={handleThemeChange}
                    />
                  </div>
                )}

                {/* Mobile Sign In */}
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-center text-brand-primary bg-lxd-blue hover:bg-lxd-blue-dark rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
