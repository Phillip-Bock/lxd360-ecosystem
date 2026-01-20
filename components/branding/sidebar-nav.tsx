'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Blend,
  BookOpen,
  Box,
  Brain,
  ChevronDown,
  Dna,
  Download,
  Eye,
  FileCheck,
  FileText,
  Focus,
  GitCompare,
  Hand,
  Heart,
  History,
  Home,
  ImageIcon,
  Layers,
  type LucideIcon,
  Mic,
  Moon,
  MousePointer,
  Palette,
  Settings,
  Smartphone,
  Sparkles,
  Square,
  Store,
  ToggleLeft,
  Type,
  Users,
  Volume2,
  Wand2,
  Zap,
  ZoomIn,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: 'new' | 'beta' | 'pro' | 'enterprise';
}

interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

// ============================================================================
// Base Path
// ============================================================================

const BASE_PATH = '/internal/branding';

// ============================================================================
// Navigation Structure
// ============================================================================

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    icon: Home,
    items: [
      { title: 'Dashboard', href: BASE_PATH, icon: Home, description: 'Overview & quick actions' },
      {
        title: 'Add-ons Control',
        href: `${BASE_PATH}/addons`,
        icon: ToggleLeft,
        description: 'Manage features',
        badge: 'new',
      },
    ],
  },
  {
    title: 'Design Tools',
    icon: Palette,
    items: [
      {
        title: 'Colors',
        href: `${BASE_PATH}/colors`,
        icon: Palette,
        description: 'Brand color palettes',
      },
      {
        title: 'Buttons',
        href: `${BASE_PATH}/buttons`,
        icon: Square,
        description: 'Button styles & states',
      },
      {
        title: 'Typography',
        href: `${BASE_PATH}/typography`,
        icon: Type,
        description: 'Fonts & text scales',
      },
      {
        title: 'Components',
        href: `${BASE_PATH}/components`,
        icon: Layers,
        description: 'Cards, inputs, toggles',
      },
      {
        title: 'Animations',
        href: `${BASE_PATH}/animations`,
        icon: Sparkles,
        description: 'Motion & effects',
      },
      {
        title: 'Gradient Lab',
        href: `${BASE_PATH}/gradient-lab`,
        icon: Blend,
        description: 'Advanced gradients',
        badge: 'pro',
      },
      {
        title: 'Motion Editor',
        href: `${BASE_PATH}/motion-editor`,
        icon: Activity,
        description: 'Bezier curves',
        badge: 'pro',
      },
      {
        title: 'Component DNA',
        href: `${BASE_PATH}/component-dna`,
        icon: Dna,
        description: 'Atomic design',
        badge: 'enterprise',
      },
    ],
  },
  {
    title: 'Accessibility',
    icon: Eye,
    items: [
      {
        title: 'WCAG Checker',
        href: `${BASE_PATH}/accessibility`,
        icon: Eye,
        description: 'Contrast & compliance',
      },
      {
        title: 'Color Blindness',
        href: `${BASE_PATH}/accessibility`,
        icon: Eye,
        description: 'Vision simulation',
        badge: 'pro',
      },
      {
        title: 'Compliance Report',
        href: `${BASE_PATH}/compliance-report`,
        icon: FileCheck,
        description: 'PDF export',
        badge: 'enterprise',
      },
    ],
  },
  {
    title: 'Neurodiversity',
    icon: Brain,
    items: [
      {
        title: 'Overview',
        href: `${BASE_PATH}/neurodiversity`,
        icon: Users,
        description: 'All tools',
      },
      {
        title: 'Dyslexia Tools',
        href: `${BASE_PATH}/neurodiversity/dyslexia`,
        icon: BookOpen,
        description: 'Reading aids',
        badge: 'pro',
      },
      {
        title: 'ADHD Mode',
        href: `${BASE_PATH}/neurodiversity/adhd`,
        icon: Focus,
        description: 'Focus features',
        badge: 'pro',
      },
      {
        title: 'Autism-Friendly',
        href: `${BASE_PATH}/neurodiversity/autism`,
        icon: Heart,
        description: 'Sensory settings',
        badge: 'pro',
      },
      {
        title: 'Motor Access',
        href: `${BASE_PATH}/neurodiversity/motor`,
        icon: Hand,
        description: 'Touch targets',
        badge: 'pro',
      },
      {
        title: 'Cognitive Load',
        href: `${BASE_PATH}/neurodiversity/cognitive`,
        icon: Brain,
        description: 'Simplified UI',
        badge: 'enterprise',
      },
      {
        title: 'Low Vision',
        href: `${BASE_PATH}/neurodiversity/low-vision`,
        icon: ZoomIn,
        description: 'High contrast',
        badge: 'pro',
      },
    ],
  },
  {
    title: 'eLearning Tools',
    icon: BookOpen,
    items: [
      {
        title: 'Overview',
        href: `${BASE_PATH}/elearning`,
        icon: BookOpen,
        description: 'All eLearning tools',
      },
      {
        title: 'Screen Reader',
        href: `${BASE_PATH}/elearning/screen-reader`,
        icon: Volume2,
        description: 'ARIA preview',
        badge: 'enterprise',
      },
      {
        title: 'Caption Styling',
        href: `${BASE_PATH}/elearning/captions`,
        icon: FileText,
        description: 'Subtitle design',
        badge: 'pro',
      },
      {
        title: 'Quiz Checker',
        href: `${BASE_PATH}/elearning/quiz`,
        icon: FileCheck,
        description: 'Assessment a11y',
        badge: 'enterprise',
      },
      {
        title: 'Keyboard Nav',
        href: `${BASE_PATH}/elearning/keyboard`,
        icon: Hand,
        description: 'Tab order test',
        badge: 'pro',
      },
      {
        title: 'Audio Desc',
        href: `${BASE_PATH}/elearning/audio-description`,
        icon: Volume2,
        description: 'AD preview',
        badge: 'enterprise',
      },
    ],
  },
  {
    title: 'AI Features',
    icon: Wand2,
    items: [
      {
        title: 'AI Theme Gen',
        href: `${BASE_PATH}/ai-theme`,
        icon: Wand2,
        description: 'Generate themes',
        badge: 'pro',
      },
      {
        title: 'Theme DNA',
        href: `${BASE_PATH}/theme-dna`,
        icon: Dna,
        description: 'Extract from URL',
        badge: 'enterprise',
      },
      {
        title: 'Dark Mode Gen',
        href: `${BASE_PATH}/dark-mode`,
        icon: Moon,
        description: 'Auto dark mode',
        badge: 'pro',
      },
    ],
  },
  {
    title: 'Advanced',
    icon: Box,
    items: [
      {
        title: '3D Visualizer',
        href: `${BASE_PATH}/3d-visualizer`,
        icon: Box,
        description: '3D mockups',
        badge: 'enterprise',
      },
      {
        title: 'Device Preview',
        href: `${BASE_PATH}/device-preview`,
        icon: Smartphone,
        description: 'Multi-device',
        badge: 'pro',
      },
      {
        title: 'Micro-interactions',
        href: `${BASE_PATH}/micro-interactions`,
        icon: MousePointer,
        description: 'Animations',
        badge: 'enterprise',
      },
      {
        title: 'Theme Diff',
        href: `${BASE_PATH}/theme-diff`,
        icon: GitCompare,
        description: 'Compare versions',
        badge: 'pro',
      },
    ],
  },
  {
    title: 'Collaboration',
    icon: Users,
    items: [
      {
        title: 'Live Collab',
        href: `${BASE_PATH}/collaboration`,
        icon: Users,
        description: 'Real-time editing',
        badge: 'enterprise',
      },
      {
        title: 'Voice Control',
        href: `${BASE_PATH}/voice-control`,
        icon: Mic,
        description: 'Voice commands',
        badge: 'beta',
      },
    ],
  },
  {
    title: 'Export & Docs',
    icon: Download,
    items: [
      {
        title: 'Export Theme',
        href: `${BASE_PATH}/export`,
        icon: Download,
        description: 'CSS, TSX, JSON',
      },
      {
        title: 'Brand Assets',
        href: `${BASE_PATH}/brand-assets`,
        icon: ImageIcon,
        description: 'Favicons & icons',
        badge: 'pro',
      },
      {
        title: 'Marketplace',
        href: `${BASE_PATH}/marketplace`,
        icon: Store,
        description: 'Theme templates',
      },
      {
        title: 'History',
        href: `${BASE_PATH}/history`,
        icon: History,
        description: 'Version timeline',
      },
      {
        title: 'Design Docs',
        href: `${BASE_PATH}/design-docs`,
        icon: BookOpen,
        description: 'Auto-generate docs',
        badge: 'enterprise',
      },
    ],
  },
];

// ============================================================================
// Badge Component
// ============================================================================

function NavBadge({ type }: { type: 'new' | 'beta' | 'pro' | 'enterprise' }): React.JSX.Element {
  const styles = {
    new: 'bg-brand-success/20 text-brand-success border-brand-success/30',
    beta: 'bg-brand-warning/20 text-orange-400 border-orange-500/30',
    pro: 'bg-brand-primary/20 text-brand-cyan border-brand-primary/30',
    enterprise: 'bg-brand-secondary/20 text-brand-purple border-brand-secondary/30',
  };

  const labels = {
    new: 'New',
    beta: 'Beta',
    pro: 'Pro',
    enterprise: 'Ent',
  };

  return (
    <span className={cn('text-[9px] px-1.5 py-0.5 rounded border font-medium', styles[type])}>
      {labels[type]}
    </span>
  );
}

// ============================================================================
// Component
// ============================================================================

export function BrandingSidebarNav(): React.JSX.Element {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Overview', 'Design Tools', 'Accessibility']),
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-brand-subtle bg-black/40 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-brand-subtle px-6 shrink-0">
        <div className="relative">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="absolute -inset-1 rounded-lg bg-primary-500/20 blur-md -z-10" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-brand-primary">LXD360</h1>
          <p className="text-[10px] text-muted-foreground">Branding Control Center</p>
        </div>
      </div>

      {/* Back to Command Center */}
      <div className="px-3 py-2 border-b border-brand-subtle">
        <Link href="/internal/command-center">
          <motion.div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-brand-surface/5 hover:text-foreground transition-colors"
            whileHover={{ x: -2 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Command Center</span>
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.title);
          const GroupIcon = group.icon;
          const hasActiveItem = group.items.some((item) => pathname === item.href);

          return (
            <div key={group.title}>
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  hasActiveItem
                    ? 'text-primary-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-brand-surface/5',
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="h-4 w-4" />
                  <span>{group.title}</span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              {/* Group Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-brand-subtle pl-2">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                          <Link key={item.href} href={item.href}>
                            <motion.div
                              className={cn(
                                'group relative flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                                isActive
                                  ? 'bg-primary-500/20 text-primary-400'
                                  : 'text-muted-foreground hover:bg-brand-surface/5 hover:text-foreground',
                              )}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon
                                className={cn('h-4 w-4 shrink-0', isActive && 'text-primary-400')}
                              />
                              <span
                                className={cn(
                                  'text-xs font-medium flex-1',
                                  isActive && 'text-primary-400',
                                )}
                              >
                                {item.title}
                              </span>
                              {item.badge && <NavBadge type={item.badge} />}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 p-3 border-t border-brand-subtle">
        <Link href={`${BASE_PATH}/settings`}>
          <motion.div
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-brand-surface/5 hover:text-foreground transition-colors',
              pathname === `${BASE_PATH}/settings` && 'bg-primary-500/20 text-primary-400',
            )}
            whileHover={{ x: 2 }}
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Settings</span>
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
