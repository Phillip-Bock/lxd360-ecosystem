// ============================================================================
// Types
// ============================================================================

export type AddonTier = 'free' | 'pro' | 'enterprise';

export type AddonCategory =
  | 'design'
  | 'accessibility'
  | 'neurodiversity'
  | 'ai'
  | 'advanced'
  | 'collaboration'
  | 'analytics'
  | 'export';

export interface Addon {
  id: string;
  name: string;
  description: string;
  category: AddonCategory;
  tier: AddonTier;
  icon: string;
  href: string;
  features: string[];
  isNew?: boolean;
  isBeta?: boolean;
  comingSoon?: boolean;
}

export interface TenantAddons {
  tenantId: string;
  tier: AddonTier;
  enabledAddons: string[];
  customizations: Record<string, unknown>;
  updatedAt: Date;
}

// ============================================================================
// Add-on Definitions
// ============================================================================

export const ADDONS: Addon[] = [
  // Design Tools
  {
    id: 'colors',
    name: 'Color Studio',
    description: '12 color families with 132 tokens in HSL format',
    category: 'design',
    tier: 'free',
    icon: 'Palette',
    href: '/internal/branding/colors',
    features: ['12 color palettes', 'HSL color picker', 'Live preview', 'Auto dark mode'],
  },
  {
    id: 'buttons',
    name: 'Button Designer',
    description: 'Customize radius, shadows, states with neumorphic controls',
    category: 'design',
    tier: 'free',
    icon: 'Square',
    href: '/internal/branding/buttons',
    features: ['5 button sizes', 'State customization', 'Shadow controls', 'Neumorphic knobs'],
  },
  {
    id: 'typography',
    name: 'Typography Lab',
    description: 'Font families, modular scales, and text hierarchy',
    category: 'design',
    tier: 'free',
    icon: 'Type',
    href: '/internal/branding/typography',
    features: ['Google Fonts', 'Modular scale', 'Line height', 'Letter spacing'],
  },
  {
    id: 'components',
    name: 'Component Forge',
    description: 'Cards, inputs, toggles, tabs customization',
    category: 'design',
    tier: 'free',
    icon: 'Layers',
    href: '/internal/branding/components',
    features: ['Card styles', 'Input variants', 'Toggle switches', 'Tab designs'],
  },
  {
    id: 'animations',
    name: 'Animation Suite',
    description: 'Motion presets and custom timing functions',
    category: 'design',
    tier: 'free',
    icon: 'Sparkles',
    href: '/internal/branding/animations',
    features: ['16 presets', 'Custom timing', 'Code generation', 'Preview mode'],
  },
  {
    id: 'gradient-lab',
    name: 'Gradient Lab',
    description: 'Advanced gradients with mesh and noise textures',
    category: 'design',
    tier: 'pro',
    icon: 'Blend',
    href: '/internal/branding/gradient-lab',
    features: ['Linear gradients', 'Radial gradients', 'Mesh gradients', 'Noise textures'],
  },
  {
    id: 'motion-editor',
    name: 'Motion Curve Editor',
    description: 'Bezier curve editor for custom animation easing',
    category: 'design',
    tier: 'pro',
    icon: 'Activity',
    href: '/internal/branding/motion-editor',
    features: ['Bezier curves', 'Spring physics', 'Preset library', 'Real-time preview'],
  },

  // Accessibility Suite
  {
    id: 'accessibility',
    name: 'WCAG 2.2 Checker',
    description: 'Real-time contrast checking and compliance scoring',
    category: 'accessibility',
    tier: 'free',
    icon: 'Eye',
    href: '/internal/branding/accessibility',
    features: ['Contrast ratio', 'AA/AAA scoring', 'Auto-fix suggestions', 'Audit reports'],
  },
  {
    id: 'color-blindness',
    name: 'Color Blindness Simulator',
    description: 'Preview themes through 8 different color vision types',
    category: 'accessibility',
    tier: 'pro',
    icon: 'EyeOff',
    href: '/internal/branding/color-blindness',
    features: ['8 vision types', 'Side-by-side', 'Palette preview', 'Safe color suggestions'],
  },

  // Neurodiversity Suite
  {
    id: 'dyslexia-tools',
    name: 'Dyslexia Tools',
    description: 'OpenDyslexic font, reading rulers, syllable highlighting',
    category: 'neurodiversity',
    tier: 'pro',
    icon: 'BookOpen',
    href: '/internal/branding/neurodiversity/dyslexia',
    features: ['OpenDyslexic font', 'Reading ruler', 'Line spacing', 'Syllable breaks'],
  },
  {
    id: 'adhd-tools',
    name: 'ADHD Accommodations',
    description: 'Focus mode, reduced distractions, progress chunking',
    category: 'neurodiversity',
    tier: 'pro',
    icon: 'Focus',
    href: '/internal/branding/neurodiversity/adhd',
    features: ['Focus mode', 'Timer visuals', 'Progress chunks', 'Distraction blocker'],
  },
  {
    id: 'autism-tools',
    name: 'Autism-Friendly Settings',
    description: 'Reduced motion, predictable patterns, sensory-friendly',
    category: 'neurodiversity',
    tier: 'pro',
    icon: 'Heart',
    href: '/internal/branding/neurodiversity/autism',
    features: ['Reduced motion', 'Predictable UI', 'Sensory palette', 'Clear icons'],
  },
  {
    id: 'motor-tools',
    name: 'Motor Accessibility',
    description: 'Touch target sizing, keyboard nav, click tolerance',
    category: 'neurodiversity',
    tier: 'pro',
    icon: 'Hand',
    href: '/internal/branding/neurodiversity/motor',
    features: ['Touch targets', 'Keyboard nav', 'Click delay', 'Large buttons'],
  },
  {
    id: 'cognitive-tools',
    name: 'Cognitive Load Manager',
    description: 'Simplified layouts, progressive disclosure, clear labels',
    category: 'neurodiversity',
    tier: 'enterprise',
    icon: 'Brain',
    href: '/internal/branding/neurodiversity/cognitive',
    features: ['Simple layouts', 'Icon + text', 'Progressive UI', 'Clear hierarchy'],
  },
  {
    id: 'low-vision-tools',
    name: 'Low Vision Suite',
    description: 'High contrast modes, zoom testing, large text previews',
    category: 'neurodiversity',
    tier: 'pro',
    icon: 'ZoomIn',
    href: '/internal/branding/neurodiversity/low-vision',
    features: ['High contrast', 'Zoom levels', 'Large text', 'Magnifier'],
  },
  {
    id: 'screen-reader',
    name: 'Screen Reader Preview',
    description: 'Hear how content sounds with screen readers',
    category: 'neurodiversity',
    tier: 'enterprise',
    icon: 'Volume2',
    href: '/internal/branding/neurodiversity/screen-reader',
    features: ['ARIA preview', 'Heading order', 'Alt text audit', 'Focus order'],
  },

  // AI Features
  {
    id: 'ai-theme',
    name: 'AI Theme Generator',
    description: 'Generate complete themes from a single color or mood',
    category: 'ai',
    tier: 'pro',
    icon: 'Wand2',
    href: '/internal/branding/ai-theme',
    features: ['Color extraction', 'Mood generation', 'Logo analysis', 'One-click themes'],
  },
  {
    id: 'theme-dna',
    name: 'Theme DNA Extractor',
    description: 'Extract design systems from unknown website URL',
    category: 'ai',
    tier: 'enterprise',
    icon: 'Dna',
    href: '/internal/branding/theme-dna',
    features: ['URL extraction', 'Full palette', 'Typography', 'Component styles'],
  },
  {
    id: 'dark-mode-gen',
    name: 'Dark Mode Generator',
    description: 'AI generates perfect dark mode from light theme',
    category: 'ai',
    tier: 'pro',
    icon: 'Moon',
    href: '/internal/branding/dark-mode-gen',
    features: ['Auto inversion', 'Contrast adjust', 'Semantic mapping', 'Preview toggle'],
  },

  // Advanced Tools
  {
    id: '3d-visualizer',
    name: '3D Theme Visualizer',
    description: 'View your theme on rotating 3D mockups',
    category: 'advanced',
    tier: 'enterprise',
    icon: 'Box',
    href: '/internal/branding/3d-visualizer',
    features: ['3D rotation', 'Device mockups', 'Real-time update', 'Export renders'],
  },
  {
    id: 'device-preview',
    name: 'Device Preview Gallery',
    description: 'See theme on iPhone, Android, tablet, desktop, watch',
    category: 'advanced',
    tier: 'pro',
    icon: 'Smartphone',
    href: '/internal/branding/device-preview',
    features: ['5 device types', 'Responsive', 'Screenshot export', 'Dark/light toggle'],
  },
  {
    id: 'micro-interactions',
    name: 'Micro-interaction Studio',
    description: 'Design hover states, click animations, loading spinners',
    category: 'advanced',
    tier: 'enterprise',
    icon: 'MousePointer',
    href: '/internal/branding/micro-interactions',
    features: ['Hover states', 'Click effects', 'Loading spinners', 'Code export'],
  },
  {
    id: 'component-dna',
    name: 'Component DNA Lab',
    description: 'Break components into atoms, molecules, organisms',
    category: 'advanced',
    tier: 'enterprise',
    icon: 'Atom',
    href: '/internal/branding/component-dna',
    features: ['Atomic design', 'Visual tree', 'Edit unknown level', 'Propagate changes'],
  },
  {
    id: 'css-inspector',
    name: 'CSS Variable Inspector',
    description: 'Hover unknown element, see tokens, click to edit',
    category: 'advanced',
    tier: 'pro',
    icon: 'Code',
    href: '/internal/branding/css-inspector',
    features: ['Live inspect', 'Token view', 'Click edit', 'Copy values'],
  },
  {
    id: 'theme-diff',
    name: 'Theme Diff Tool',
    description: 'Side-by-side comparison of theme versions',
    category: 'advanced',
    tier: 'pro',
    icon: 'GitCompare',
    href: '/internal/branding/theme-diff',
    features: ['Version compare', 'Highlight changes', 'Merge tool', 'Rollback'],
  },
  {
    id: 'token-linter',
    name: 'Design Token Linter',
    description: 'Catch accessibility issues and unused tokens',
    category: 'advanced',
    tier: 'enterprise',
    icon: 'AlertTriangle',
    href: '/internal/branding/token-linter',
    features: ['A11y issues', 'Unused tokens', 'Inconsistencies', 'Auto-fix'],
  },

  // Collaboration
  {
    id: 'live-collab',
    name: 'Live Collaboration',
    description: 'Multiple editors with cursor presence like Figma',
    category: 'collaboration',
    tier: 'enterprise',
    icon: 'Users',
    href: '/internal/branding/collaboration',
    features: ['Real-time sync', 'Cursor presence', 'Comments', 'Version control'],
    isNew: true,
  },
  {
    id: 'voice-control',
    name: 'Voice-Controlled Theming',
    description: '"Make the primary color more blue" - voice commands',
    category: 'collaboration',
    tier: 'enterprise',
    icon: 'Mic',
    href: '/internal/branding/voice-control',
    features: ['Voice commands', 'Natural language', 'Undo/redo', 'Hands-free'],
    isBeta: true,
  },

  // Analytics
  {
    id: 'ab-testing',
    name: 'A/B Theme Testing',
    description: 'Deploy 2 themes, track conversions, auto-analytics',
    category: 'analytics',
    tier: 'enterprise',
    icon: 'Split',
    href: '/internal/branding/ab-testing',
    features: ['Split testing', 'Conversion track', 'Auto winner', 'Analytics'],
  },
  {
    id: 'semantic-mapper',
    name: 'Semantic Token Mapper',
    description: 'Map tokens to semantic meanings (success = green)',
    category: 'analytics',
    tier: 'pro',
    icon: 'Map',
    href: '/internal/branding/semantic-mapper',
    features: ['Semantic names', 'Auto mapping', 'Consistency', 'Documentation'],
  },

  // Export
  {
    id: 'export',
    name: 'Theme Export',
    description: 'Download as CSS, TSX, JSON, or Style Dictionary',
    category: 'export',
    tier: 'free',
    icon: 'Download',
    href: '/internal/branding/export',
    features: ['4 formats', 'Code preview', 'File headers', 'Instant download'],
  },
  {
    id: 'brand-assets',
    name: 'Brand Asset Generator',
    description: 'Auto-generate favicons, OG images, app icons',
    category: 'export',
    tier: 'pro',
    icon: 'Image',
    href: '/internal/branding/brand-assets',
    features: ['Favicon gen', 'OG images', 'App icons', 'Touch icons'],
  },
  {
    id: 'docs-generator',
    name: 'Design System Docs',
    description: 'Auto-generate Storybook-style documentation',
    category: 'export',
    tier: 'enterprise',
    icon: 'FileText',
    href: '/internal/branding/docs-generator',
    features: ['Auto docs', 'Component API', 'Usage examples', 'Figma sync'],
  },
  {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'PDF export of WCAG compliance for enterprise sales',
    category: 'export',
    tier: 'enterprise',
    icon: 'FileCheck',
    href: '/internal/branding/compliance-report',
    features: ['PDF export', 'WCAG scores', 'Branded report', 'Audit trail'],
  },

  // eLearning Specific
  {
    id: 'caption-styling',
    name: 'Caption & Subtitle Styling',
    description: 'Customize video caption appearance for accessibility',
    category: 'neurodiversity',
    tier: 'pro',
    icon: 'Subtitles',
    href: '/internal/branding/caption-styling',
    features: ['Font size', 'Background', 'Position', 'Color contrast'],
  },
  {
    id: 'quiz-a11y',
    name: 'Quiz Accessibility Checker',
    description: 'Ensure assessments are accessible to all learners',
    category: 'neurodiversity',
    tier: 'enterprise',
    icon: 'ClipboardCheck',
    href: '/internal/branding/quiz-accessibility',
    features: ['Input labels', 'Error messages', 'Time limits', 'Alternative formats'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getAddonsByCategory(category: AddonCategory): Addon[] {
  return ADDONS.filter((addon) => addon.category === category);
}

export function getAddonsByTier(tier: AddonTier): Addon[] {
  return ADDONS.filter((addon) => addon.tier === tier);
}

export function getAddonById(id: string): Addon | undefined {
  return ADDONS.find((addon) => addon.id === id);
}

export function isAddonEnabled(addonId: string, tenantAddons: TenantAddons): boolean {
  const addon = getAddonById(addonId);
  if (!addon) return false;

  // Free addons always enabled
  if (addon.tier === 'free') return true;

  // Check tenant tier
  const tierHierarchy: AddonTier[] = ['free', 'pro', 'enterprise'];
  const tenantTierIndex = tierHierarchy.indexOf(tenantAddons.tier);
  const addonTierIndex = tierHierarchy.indexOf(addon.tier);

  // Check if tenant tier is high enough and addon is in enabled list
  return tenantTierIndex >= addonTierIndex && tenantAddons.enabledAddons.includes(addonId);
}

export function getCategoryLabel(category: AddonCategory): string {
  const labels: Record<AddonCategory, string> = {
    design: 'Design Tools',
    accessibility: 'Accessibility',
    neurodiversity: 'Neurodiversity Suite',
    ai: 'AI Features',
    advanced: 'Advanced Tools',
    collaboration: 'Collaboration',
    analytics: 'Analytics',
    export: 'Export & Docs',
  };
  return labels[category];
}

export function getTierBadgeColor(tier: AddonTier): string {
  const colors: Record<AddonTier, string> = {
    free: 'bg-green-500/20 text-green-400 border-green-500/30',
    pro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    enterprise: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return colors[tier];
}
