# Phase 11: Branding & Design Tokens Audit

**Date:** 2026-01-19
**Auditor:** Claude Code
**Scope:** CSS Variables, Design Tokens, Theming, White-Label Support
**Mode:** REPORT ONLY - No fixes applied

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **CSS Variables Defined** | 123 | GOOD |
| **Hardcoded Hex Colors** | 536 | HIGH |
| **Hardcoded RGB/HSL** | 360 | HIGH |
| **Dark Mode** | Implemented | OK |
| **ThemeProvider** | next-themes | OK |
| **White-Label Support** | Partial | MEDIUM |
| **Favicon/Manifest** | Missing manifest | MEDIUM |
| **Inline Styles** | 889 | HIGH |
| **Design System Docs** | None | MEDIUM |

**Overall Score: 6/10**

---

## Step-by-Step Audit Results

### Step 1: CSS Variables in globals.css

**Full globals.css contents:** 228 lines

**Key Structure:**
- `@theme inline` block (Tailwind 4 CSS-first config)
- `:root` - Light theme defaults
- `.dark` - Dark theme overrides
- `@layer base` - Base styles
- `@keyframes` - Animation definitions
- `@media (prefers-reduced-motion)` - Accessibility

**CSS Variables extracted:**

```css
/* @theme inline block - Tailwind 4 mappings */
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-card: var(--card);
--color-card-foreground: var(--card-foreground);
--color-popover: var(--popover);
--color-popover-foreground: var(--popover-foreground);
--color-primary: var(--primary);
--color-primary-foreground: var(--primary-foreground);
--color-secondary: var(--secondary);
--color-secondary-foreground: var(--secondary-foreground);
--color-muted: var(--muted);
--color-muted-foreground: var(--muted-foreground);
--color-accent: var(--accent);
--color-accent-foreground: var(--accent-foreground);
--color-destructive: var(--destructive);
--color-border: var(--border);
--color-input: var(--input);
--color-ring: var(--ring);

/* Sidebar */
--color-sidebar: var(--sidebar);
--color-sidebar-foreground: var(--sidebar-foreground);
--color-sidebar-primary: var(--sidebar-primary);
--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
--color-sidebar-accent: var(--sidebar-accent);
--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
--color-sidebar-border: var(--sidebar-border);
--color-sidebar-ring: var(--sidebar-ring);

/* Chart */
--color-chart-1 through --color-chart-5

/* Radius */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);

/* LXD-161 LOCKED BRAND COLORS */
--color-lxd-primary: #0072f5;
--color-lxd-primary-dark: #001d3d;
--color-lxd-secondary: #019ef3;
--color-lxd-success: #237406;
--color-lxd-caution: #b58e21;
--color-lxd-warning: #a75d20;
--color-lxd-error: #cd0a0a;

/* Neural Brand Accents */
--color-neural-cyan: #00d4ff;
--color-neural-purple: #8b5cf6;
--color-neural-cyan-glow: oklch(75% 0.15 195 / 0.2);
--color-neural-purple-glow: oklch(60% 0.2 280 / 0.2);

/* Glassmorphism */
--color-glass-bg: oklch(20% 0 0 / 0.5);
--color-glass-border: oklch(80% 0 0 / 0.1);
--blur-glass: 12px;

/* Glow Effects */
--shadow-glow-sm: 0 0 10px oklch(0.7 0.15 220 / 0.3);
--shadow-glow-md: 0 0 20px oklch(0.7 0.15 220 / 0.4);
--shadow-glow-lg: 0 0 40px oklch(0.7 0.15 220 / 0.5);

/* Gradients */
--gradient-neural: linear-gradient(135deg, #0072f5, #019ef3);
--gradient-dark: linear-gradient(180deg, #000000, #0a0a0f);

/* Font Families */
--font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-family-mono: "JetBrains Mono", ui-monospace, monospace;
--font-sans: var(--font-family-sans);
--font-mono: var(--font-family-mono);

/* Animations */
--animate-accordion-down: accordion-down 0.2s ease-out;
--animate-accordion-up: accordion-up 0.2s ease-out;
```

---

### Step 2: Root CSS Variables Count

**Total CSS Variables: 123**

**By Category:**
| Category | Count |
|----------|-------|
| COLOR | 106 |
| TYPOGRAPHY | 4 |
| SPACING/RADIUS | 5 |
| EFFECTS | 6 |
| ANIMATION | 2 |

---

### Step 3: Tailwind Theme Configuration

**Result:** No `tailwind.config.ts` or `tailwind.config.js` found.

**Reason:** Project uses **Tailwind CSS v4** with CSS-first configuration.

**Package versions:**
```json
"tailwindcss": "^4.1.17",
"@tailwindcss/postcss": "^4.1.18",
"tailwind-merge": "^3.4.0"
```

**postcss.config.mjs:**
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**Analysis:** Tailwind 4 uses `@theme inline` blocks in CSS instead of JS config files. This is the correct modern approach.

---

### Step 4: Shadcn/UI Theme Tokens

**components.json:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "registries": {
    "@eldoraui": "https://eldoraui.site/r/{name}.json",
    "@glass-ui": "https://glass-ui.crenspire.com/r/{name}.json",
    "@basecn": "https://basecn.dev/r/{name}.json",
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json",
    "@intentui": "https://intentui.com/r/{name}",
    "@magicui": "https://magicui.design/r/{name}.json",
    "@limeplay": "https://limeplay.winoffrg.dev/r/{name}.json",
    "@animate-ui": "https://animate-ui.com/r/{name}.json",
    "@lucide-animated": "https://lucide-animated.com/r/{name}.json"
  }
}
```

**Shadcn theme variables in globals.css:**
- All standard shadcn tokens present (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring)
- Both light (`:root`) and dark (`.dark`) variants defined

---

### Step 5: Dark Mode Implementation

**CSS Dark Mode:**
```css
@custom-variant dark (&:is(.dark *));

.dark {
  --background: #000000;
  --foreground: #ffffff;
  /* ... full dark theme variables */
}
```

**Component Usage:**
- `dark:` variant usage: **1,436 instances**
- ThemeProvider configured for class-based dark mode

**Examples:**
```tsx
className="min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page"
className="text-brand-primary dark:text-brand-primary"
className="border-brand-default dark:border-lxd-dark-border"
```

---

### Step 6: Theme Provider Setup

**Implementation:** Using `next-themes` (v0.4.6)

**File:** `components/shared/theme-provider.tsx`
```tsx
'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

**Usage in layout.tsx:**
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

**Multiple ThemeProvider files found:**
| File | Purpose |
|------|---------|
| components/shared/theme-provider.tsx | Main app theme |
| providers/ThemeProvider.tsx | Alternate implementation |
| providers/theme-provider.tsx | Another variant |
| components/theme-provider.tsx | Yet another |
| components/ribbon/ribbon-theme.tsx | Ribbon-specific |

**Issue:** Multiple ThemeProvider implementations - should consolidate.

---

### Step 7: Hardcoded Colors (Anti-Pattern)

**Total hardcoded hex colors: 536**

**Sample locations:**
```
app/00-lxd360-auth/login/page.tsx:57:        fill="#4285F4"
app/00-lxd360-auth/login/page.tsx:61:        fill="#34A853"
app/02-lxd360-inspire-studio/(inspire-studio)/ai-studio/page.tsx:52:    color: '#22c55e',
app/02-lxd360-inspire-studio/(inspire-studio)/ai-studio/page.tsx:62:    color: '#f59e0b',
app/02-lxd360-inspire-studio/(inspire-studio)/lesson/page.tsx:67:    color: '#f97316',
app/api/og/route.tsx:19:      default: { primary: '#00FFFF', secondary: '#9B59B6' },
```

**Categories of hardcoded colors:**
| Type | Examples |
|------|----------|
| Brand icons (Google, Microsoft) | #4285F4, #34A853, #FBBC05, #EA4335, #F25022, #00A4EF |
| UI colors in configs | #22c55e, #f59e0b, #ec4899, #06b6d4, #a855f7 |
| OG Image generation | #00FFFF, #9B59B6 |

---

### Step 8: Hardcoded RGB/HSL Values

**Total: 360 instances**

**Sample locations:**
```
app/01-lxd360-llc/(lxd360-llc)/neuro/page.tsx:355:  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
app/01-lxd360-llc/(lxd360-llc)/products/ignite/page.tsx:728:  boxShadow: '0 0 20px rgba(85, 2, 120, 0.5)'
app/api/og/route.tsx:153:  color: 'rgba(255,255,255,0.7)',
components/analytics/completion-ring.tsx:36:  color = 'hsl(var(--chart-1))',  // GOOD - using variable
```

**Analysis:** Many rgba() values for shadows and overlays. Some properly use CSS variables via `hsl(var(--...))`.

---

### Step 9: Brand Color Tokens

**Locked brand colors (LXD-161):**
```css
--color-lxd-primary: #0072f5;
--color-lxd-primary-dark: #001d3d;
--color-lxd-secondary: #019ef3;
--color-lxd-success: #237406;
--color-lxd-caution: #b58e21;
--color-lxd-warning: #a75d20;
--color-lxd-error: #cd0a0a;

--color-neural-cyan: #00d4ff;
--color-neural-purple: #8b5cf6;
```

**Usage in components:**
- `text-brand-primary`, `bg-brand-surface`, `border-brand-secondary`
- `text-neural-cyan`, `bg-neural-purple`
- Custom brand classes widely used

---

### Step 10: Typography Tokens

**Font families defined:**
```css
--font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-family-mono: "JetBrains Mono", ui-monospace, monospace;
```

**next/font usage in layout.tsx:**
```tsx
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
```

**Hardcoded font sizes found: 9 instances**
- Mostly in `app/api/og/route.tsx` (OG image generation - expected)
- 1 instance in `components/internal/admin/ActiveUserChart.tsx`

---

### Step 11: Spacing Tokens

**Radius tokens defined:**
```css
--radius: 0.625rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

**Missing:** No `--spacing` or `--gap` CSS variables (relying on Tailwind classes)

**Hardcoded pixel values: 91 instances**
- Most are `useInView` margin options (`margin: '-100px'`)
- Some in OG image generation (`padding: '80px'`)
- Chart components with specific spacing

---

### Step 12: White-Label / Tenant Theming

**Status:** Partial implementation

**Found infrastructure:**
- `components/branding/` directory with 12 components
- Permission: `'manage:org:branding'`
- Placeholder page at `/manage/organization-admin/branding/`

**Branding components:**
```
components/branding/accessibility-score.tsx
components/branding/color-picker.tsx
components/branding/contrast-validator.tsx
components/branding/logo-uploader.tsx
components/branding/preset-gallery.tsx
components/branding/theme-history.tsx
components/branding/touch-target-checker.tsx
```

**Dynamic CSS variable setting:** Limited to effects
```tsx
container.style.setProperty("--glow-x", `${x}px`)
container.style.setProperty("--glow-y", `${y}px`)
```

**White-label mentions:**
```tsx
// app/11-lxd360-maintenance/faq/page.tsx
question: 'Can I white-label the platform?',

// components/branding/preset-gallery.tsx
tier: 'basic' | 'professional' | 'enterprise' | 'white-label';
```

**Issue:** White-label infrastructure exists but not fully implemented for tenant theming.

---

### Step 13: Logo & Brand Asset Handling

**Logo references in code:** Multiple locations using logo props

**Brand assets in public folder:**
```
public/apple-icon.png
public/icon.svg
public/icon-dark-32x32.png
public/icon-light-32x32.png
public/images/inspire-studio-logo.png
public/images/lxd-nexus-logo.png
public/images/lxd360-20company-20logo.png
public/images/lxp360-20saas-20logo.png
public/inspire-logo.png
public/integrations/center-logo.png
public/lxd360-logo.png
public/LXP360 SaaS Logo.png
public/placeholder-logo.png
public/placeholder-logo.svg
```

**Issues:**
- Inconsistent naming (`lxd360-logo.png` vs `LXP360 SaaS Logo.png`)
- URL-encoded names (`lxd360-20company-20logo.png`)
- Multiple logo versions without clear purpose

---

### Step 14: Favicon & App Icons

**Favicon files in app/:** None found
**Favicon files in public/:** None (no favicon.ico)

**Icon files found:**
```
public/apple-icon.png      (2.6KB)
public/icon.svg            (1.3KB)
public/icon-dark-32x32.png (585B)
public/icon-light-32x32.png (566B)
```

**Manifest files:**
- `app/manifest.ts` - NOT FOUND
- `app/manifest.json` - NOT FOUND
- `public/manifest.json` - NOT FOUND

**Issue:** No PWA manifest configured. Icons exist but no favicon.ico.

---

### Step 15: Color Contrast Compliance

**Low-contrast text patterns found: 324 instances**

```tsx
// Common patterns (potentially low contrast)
text-gray-300
text-gray-400
text-slate-300
text-slate-400
text-zinc-300
text-zinc-400
```

**Sample locations:**
```
components/coming-soon/about-section.tsx:45:  text-gray-400
components/ai/neuronaut-modal.tsx:115:  text-zinc-400
components/blocks/immersive/model-viewer.tsx:489:  text-zinc-400
```

**Light/Dark theme contrast:**
- Light: `--foreground: #0a0a0a` on `--background: #ffffff` (21:1 - excellent)
- Dark: `--foreground: #ffffff` on `--background: #000000` (21:1 - excellent)
- Muted: `--muted-foreground: #71717a` on `--muted: #f4f4f5` (~4.5:1 - borderline AA)

---

### Step 16: Animation Tokens

**CSS Keyframes defined:**
```css
@keyframes accordion-down { /* height animation */ }
@keyframes accordion-up { /* height animation */ }
```

**Animation variables:**
```css
--animate-accordion-down: accordion-down 0.2s ease-out;
--animate-accordion-up: accordion-up 0.2s ease-out;
```

**Reduced motion support:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
}
```

**framer-motion imports: 174 files**

**Tailwind animation usage:** Widespread use of `animate-`, `transition-`, `duration-` classes

---

### Step 17: Responsive Breakpoints

**Custom @media queries in CSS: 1** (prefers-reduced-motion only)

**Tailwind responsive prefix usage: 1,020 instances**

| Prefix | Purpose |
|--------|---------|
| sm: | Small screens (640px+) |
| md: | Medium screens (768px+) |
| lg: | Large screens (1024px+) |
| xl: | Extra large (1280px+) |
| 2xl: | 2X large (1536px+) |

**Analysis:** Properly using Tailwind responsive prefixes instead of custom media queries.

---

### Step 18: Z-Index Scale

**No z-index CSS variables defined** (--z-* not found)

**Z-index values used (Tailwind classes):**
| Class | Count |
|-------|-------|
| z-10 | 199 |
| z-50 | 131 |
| z-20 | 43 |
| z-0 | 38 |
| z-40 | 20 |
| z-30 | 16 |
| z-100 | 2 |
| z-1 | 2 |
| z-9999 | 1 |
| z-10001 | 1 |
| z-10000 | 1 |
| z-1000 | 1 |

**Arbitrary z-index values found:**
```tsx
focus:z-[99999]     // Skip links
z-index: 9999;      // Tool shell
z-index: 100;       // Wizard
z-[100]             // Tour/toast
z-[2147483647]      // Cool mode (max int)
```

**Issue:** No standardized z-index scale. Values range from 0 to 2147483647.

---

### Step 19: Design System Documentation

**Documentation files checked:**
| File | Status |
|------|--------|
| docs/design-system.md | NOT FOUND |
| docs/branding.md | NOT FOUND |
| docs/tokens.md | NOT FOUND |
| STYLE_GUIDE.md | NOT FOUND |

**Storybook:**
| Item | Status |
|------|--------|
| .storybook directory | NOT FOUND |
| storybook packages | NOT FOUND |

**Issue:** No design system documentation or component playground.

---

### Step 20: Inline Styles Audit

**Total inline styles: 889**

**Sample patterns:**
```tsx
// Framer motion transforms
style={{ perspective: PERSPECTIVE }}
style={{ scale: 1.75 }}

// Dynamic colors
style={{ backgroundColor: `${action.color}20` }}
style={{ color: action.color }}

// Layout
style={{ width: `${progress}%` }}
```

**Common use cases:**
- framer-motion animation properties
- Dynamic color assignment from data
- Dynamic width/height calculations
- OG image generation styles

---

## Findings Summary

### CRITICAL Issues

| # | File | Line | Issue | Evidence |
|---|------|------|-------|----------|
| - | - | - | None critical | - |

### HIGH Issues (Hardcoded values)

| # | File/Location | Issue | Count |
|---|---------------|-------|-------|
| 1 | Throughout codebase | Hardcoded hex colors | 536 |
| 2 | Throughout codebase | Hardcoded rgb/rgba/hsl | 360 |
| 3 | Throughout codebase | Inline styles | 889 |
| 4 | Throughout codebase | Low-contrast text classes | 324 |

### MEDIUM Issues (Missing tokens/infrastructure)

| # | File/Location | Issue | Evidence |
|---|---------------|-------|----------|
| 1 | app/ | No manifest.ts/json | PWA not configured |
| 2 | app/ | No favicon.ico | Using icon.svg via rewrites |
| 3 | providers/ | Multiple ThemeProvider files | 5 different implementations |
| 4 | public/ | Inconsistent logo naming | lxd360-logo.png vs "LXP360 SaaS Logo.png" |
| 5 | - | No z-index scale | Values range 0 to 2147483647 |
| 6 | manage/branding | White-label incomplete | Placeholder page only |

### LOW Issues (Documentation gaps)

| # | File | Issue | Evidence |
|---|------|-------|----------|
| 1 | docs/ | No design system docs | design-system.md not found |
| 2 | - | No Storybook | .storybook not found |
| 3 | - | No style guide | STYLE_GUIDE.md not found |

### INFO Notes

| # | Observation | Details |
|---|-------------|---------|
| 1 | Tailwind 4 CSS-first | Correct modern approach, no tailwind.config needed |
| 2 | next-themes properly configured | Class-based dark mode working |
| 3 | next/font properly used | Inter, JetBrains Mono, Plus Jakarta Sans |
| 4 | Locked brand colors (LXD-161) | Documented and consistent |
| 5 | Responsive design | 1,020 uses of responsive prefixes |
| 6 | Reduced motion support | Properly implemented in globals.css |
| 7 | shadcn/ui tokens complete | All standard tokens defined |

---

## Metrics Summary

| Metric | Count | Target | Status |
|--------|-------|--------|--------|
| CSS Variables defined | 123 | >30 | OK |
| Hardcoded hex colors | 536 | 0 | HIGH |
| Hardcoded rgb/hsl values | 360 | <10 | HIGH |
| Dark mode implemented | Yes | Yes | OK |
| ThemeProvider setup | Yes | Yes | OK |
| White-label support | Partial | Yes | MEDIUM |
| Favicon configured | Via rewrite | Native | MEDIUM |
| Manifest.json exists | No | Yes | MEDIUM |
| Inline styles count | 889 | <20 | HIGH |
| Design system docs | No | Yes | MEDIUM |
| Low-contrast text | 324 | 0 | HIGH |
| Z-index variables | 0 | >5 | MEDIUM |
| framer-motion imports | 174 | - | INFO |
| Responsive prefixes | 1,020 | - | OK |

---

## Priority Recommendations

### Immediate (Branding Consistency)

1. **Create z-index scale CSS variables**
   ```css
   --z-dropdown: 50;
   --z-modal: 100;
   --z-toast: 150;
   --z-tooltip: 200;
   ```

2. **Add PWA manifest**
   - Create `app/manifest.ts` for Next.js 15
   - Include proper icons, theme colors, start_url

3. **Consolidate ThemeProvider implementations**
   - Keep `components/shared/theme-provider.tsx`
   - Remove duplicates in `providers/` and `components/`

### Short-Term (Token Consistency)

1. **Audit hardcoded colors**
   - Replace hex colors with CSS variables where possible
   - Exception: Third-party brand icons (Google, Microsoft)

2. **Address low-contrast text**
   - Review all `text-gray-400`, `text-zinc-400` usages
   - Ensure 4.5:1 contrast ratio for WCAG AA

3. **Standardize logo assets**
   - Rename with consistent convention
   - Remove URL-encoded characters from filenames

### Medium-Term (Documentation)

1. **Create design system documentation**
   - `docs/design-system.md` with token reference
   - Color palette, typography scale, spacing guidelines

2. **Consider Storybook**
   - Component playground for design consistency
   - Visual regression testing

3. **Complete white-label infrastructure**
   - Dynamic CSS variable injection per tenant
   - Logo/branding override system

---

## Appendix: Command Reference

```bash
# Count CSS variables
grep -c "\-\-[a-zA-Z0-9-]*:" app/globals.css

# Find hardcoded hex colors
grep -rn "#[0-9A-Fa-f]{3,8}" --include="*.tsx" app/ components/ | wc -l

# Find inline styles
grep -rn "style={" --include="*.tsx" app/ components/ | wc -l

# Count dark mode usage
grep -rn "dark:" --include="*.tsx" app/ components/ | wc -l

# Find z-index usage
grep -rn "z-index\|z-\[" --include="*.tsx" --include="*.css" app/ components/
```

---

**Report Generated:** 2026-01-19
**Next Phase:** Phase 12 - Internationalization & Localization Audit
