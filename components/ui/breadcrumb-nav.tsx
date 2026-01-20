'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ============================================================================
// TYPES
// ============================================================================

export interface BreadcrumbNavItem {
  label: string;
  href: string;
}

interface BreadcrumbNavProps {
  /** Custom breadcrumb items - if not provided, auto-generates from URL */
  items?: BreadcrumbNavItem[];
  /** Whether to show home icon */
  showHome?: boolean;
  /** Custom home label */
  homeLabel?: string;
  /** Maximum items to show before collapsing (0 = no collapse) */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// PATH TO LABEL MAPPING
// ============================================================================

const PATH_LABELS: Record<string, string> = {
  // Marketing pages
  vision: 'Vision',
  solutions: 'Solutions',
  pricing: 'Pricing',
  contact: 'Contact',
  blog: 'Blog',
  compliance: 'Compliance',
  status: 'Status',
  legal: 'Legal',
  policies: 'Policies',
  privacy: 'Privacy',
  terms: 'Terms',

  // Product pages
  'inspire-studio': 'INSPIRE Studio',
  lxp360: 'LXP360',
  'lxd-ecosystem': 'LXD Ecosystem',
  'lxd-nexus': 'LXD Nexus',
  vip: 'VIP Access',

  // Feature pages
  authoring: 'Authoring',
  lms: 'LMS',
  'lxp-platform': 'LXP Platform',
  lrs: 'LRS',

  // Platform pages
  app: 'Application',
  learner: 'Learner',
  instructor: 'Instructor',
  'lms-admin': 'LMS Admin',
  admin: 'Admin',
  'course-builder': 'Course Builder',
  settings: 'Settings',

  // Internal pages
  internal: 'Internal',
  'command-center': 'Command Center',
  engineering: 'Engineering',
  sales: 'Sales',
  branding: 'Branding',

  // Auth pages
  auth: 'Account',
  login: 'Sign In',
  'sign-up': 'Sign Up',
  'forgot-password': 'Forgot Password',
  'reset-password': 'Reset Password',

  // Other
  consultation: 'Consultation',
  checkout: 'Checkout',
  wiki: 'Wiki',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPathSegment(segment: string): string {
  // Check if we have a custom label
  if (PATH_LABELS[segment]) {
    return PATH_LABELS[segment];
  }

  // Convert kebab-case or slug to Title Case
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbNavItem[] {
  // Remove leading/trailing slashes and split
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbNavItem[] = [];
  let currentPath = '';

  for (const segment of segments) {
    // Skip route group markers (parentheses)
    if (segment.startsWith('(') && segment.endsWith(')')) {
      continue;
    }

    // Skip dynamic segments like [id] for display but include in path
    const isOnlyDynamic = segment.startsWith('[') && segment.endsWith(']');

    currentPath += `/${segment}`;

    if (!isOnlyDynamic) {
      breadcrumbs.push({
        label: formatPathSegment(segment),
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

// ============================================================================
// SCHEMA.ORG STRUCTURED DATA
// ============================================================================

interface SchemaOrgBreadcrumb {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

function generateSchemaOrg(items: BreadcrumbNavItem[], baseUrl: string): SchemaOrgBreadcrumb {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(index < items.length - 1 ? { item: `${baseUrl}${item.href}` } : {}),
      })),
    ],
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BreadcrumbNav({
  items,
  showHome = true,
  homeLabel = 'Home',
  maxItems = 4,
  className,
}: BreadcrumbNavProps) {
  const pathname = usePathname();

  // Use provided items or generate from pathname
  const breadcrumbItems = items ?? generateBreadcrumbsFromPath(pathname);

  // Don't render if we're on the home page
  if (breadcrumbItems.length === 0) {
    return null;
  }

  // Determine if we need to collapse
  const shouldCollapse = maxItems > 0 && breadcrumbItems.length > maxItems;

  // Get visible items
  let visibleItems = breadcrumbItems;
  if (shouldCollapse) {
    // Show first item, ellipsis, and last (maxItems - 2) items
    const lastItems = breadcrumbItems.slice(-(maxItems - 1));
    visibleItems = [breadcrumbItems[0], ...lastItems];
  }

  // Base URL for schema.org
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lxd360.com';

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSchemaOrg(breadcrumbItems, baseUrl)),
        }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {/* Home */}
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-1 text-studio-text dark:text-studio-text hover:text-brand-primary dark:hover:text-neural-cyan"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">{homeLabel}</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-studio-text-muted" />
              </BreadcrumbSeparator>
            </>
          )}

          {/* Collapsed indicator */}
          {shouldCollapse && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={visibleItems[0].href}
                    className="text-studio-text dark:text-studio-text hover:text-brand-primary dark:hover:text-neural-cyan"
                  >
                    {visibleItems[0].label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-studio-text-muted" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbEllipsis className="text-muted-foreground dark:text-studio-text-muted" />
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-studio-text-muted" />
              </BreadcrumbSeparator>
              {/* Remaining items after ellipsis */}
              {visibleItems.slice(1).map((item, index, arr) => {
                const isLast = index === arr.length - 1;
                return (
                  <BreadcrumbItem key={item.href}>
                    {isLast ? (
                      <BreadcrumbPage className="text-lxd-dark-surface dark:text-lxd-light-page font-medium">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink asChild>
                          <Link
                            href={item.href}
                            className="text-studio-text dark:text-studio-text hover:text-brand-primary dark:hover:text-neural-cyan"
                          >
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-studio-text-muted" />
                        </BreadcrumbSeparator>
                      </>
                    )}
                  </BreadcrumbItem>
                );
              })}
            </>
          )}

          {/* Normal display (no collapse) */}
          {!shouldCollapse &&
            visibleItems.map((item, index) => {
              const isLast = index === visibleItems.length - 1;
              return (
                <BreadcrumbItem key={item.href}>
                  {isLast ? (
                    <BreadcrumbPage className="text-lxd-dark-surface dark:text-lxd-light-page font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className="text-studio-text dark:text-studio-text hover:text-brand-primary dark:hover:text-neural-cyan"
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-studio-text-muted" />
                      </BreadcrumbSeparator>
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
