/**
 * =============================================================================
 * LXP360-SaaS | Accessibility - Axe DevTools Integration
 * =============================================================================
 *
 * @fileoverview Development-time accessibility testing with axe-core
 *
 * @description
 * Integrates axe-core for automated accessibility testing in development.
 * Highlights WCAG violations in the browser console.
 *
 * @usage Add to _app.tsx or root layout in development:
 * ```tsx
 * import { AxeAccessibilityProvider } from '@/lib/accessibility/axe-init'
 *
 * // In development only
 * if (process.env.NODE_ENV === 'development') {
 *   return <AxeAccessibilityProvider>{children}</AxeAccessibilityProvider>
 * }
 * ```
 *
 * =============================================================================
 */

'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'accessibility-axe' });

// ============================================================================
// Types
// ============================================================================

export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AxeResults {
  violations: AxeViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  timestamp: Date;
}

interface AxeContextValue {
  results: AxeResults | null;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  runAudit: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const AxeContext = createContext<AxeContextValue | null>(null);

export function useAxeContext(): AxeContextValue {
  const context = useContext(AxeContext);
  if (!context) {
    throw new Error('useAxeContext must be used within AxeAccessibilityProvider');
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

interface AxeAccessibilityProviderProps {
  children: React.ReactNode;
  /** Run audit on initial mount */
  runOnMount?: boolean;
  /** Run audit on route changes */
  runOnRouteChange?: boolean;
  /** Delay before running audit (ms) */
  auditDelay?: number;
  /** Show visual highlights for violations */
  showVisualHighlights?: boolean;
}

export function AxeAccessibilityProvider({
  children,
  runOnMount = true,
  runOnRouteChange = true,
  auditDelay = 1000,
  showVisualHighlights = true,
}: AxeAccessibilityProviderProps): React.JSX.Element {
  const [results, setResults] = useState<AxeResults | null>(null);
  const [isEnabled, setEnabled] = useState(true);

  const runAudit = useCallback(async () => {
    if (!isEnabled || typeof window === 'undefined') return;

    try {
      // Dynamically import axe-core (only in development)
      const axe = await import('axe-core');

      // Configure axe
      axe.default.configure({
        rules: [
          // Enable all WCAG 2.1 AA rules
          { id: 'color-contrast', enabled: true },
          { id: 'valid-lang', enabled: true },
        ],
      });

      // Run the audit
      const axeResults = await axe.default.run(document.body, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      });

      const formattedResults: AxeResults = {
        violations: axeResults.violations as AxeViolation[],
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length,
        inapplicable: axeResults.inapplicable.length,
        timestamp: new Date(),
      };

      setResults(formattedResults);

      // Log results to console
      logResults(formattedResults);

      // Apply visual highlights
      if (showVisualHighlights) {
        highlightViolations(formattedResults.violations);
      }
    } catch (error) {
      log.error('Failed to run axe audit', { error });
    }
  }, [isEnabled, showVisualHighlights]);

  // Run on mount
  useEffect(() => {
    if (runOnMount && process.env.NODE_ENV === 'development') {
      const timer = setTimeout(runAudit, auditDelay);
      return () => clearTimeout(timer);
    }
  }, [runOnMount, auditDelay, runAudit]);

  // Run on route changes
  useEffect(() => {
    if (!runOnRouteChange || process.env.NODE_ENV !== 'development') return;

    const handleRouteChange = () => {
      setTimeout(runAudit, auditDelay);
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    // Use MutationObserver to detect SPA navigation
    const observer = new MutationObserver((mutations) => {
      const hasSignificantChange = mutations.some(
        (m) => m.type === 'childList' && m.addedNodes.length > 0,
      );
      if (hasSignificantChange) {
        setTimeout(runAudit, auditDelay);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, [runOnRouteChange, auditDelay, runAudit]);

  return (
    <AxeContext.Provider value={{ results, isEnabled, setEnabled, runAudit }}>
      {children}
      {process.env.NODE_ENV === 'development' && results && (
        <AccessibilityBadge results={results} />
      )}
    </AxeContext.Provider>
  );
}

// ============================================================================
// Console Logging
// ============================================================================

function logResults(results: AxeResults): void {
  const { violations, passes, incomplete } = results;

  if (violations.length === 0) {
    log.info('Accessibility audit passed', { passes, incomplete });
    return;
  }

  log.warn('Accessibility violations found', {
    violationCount: violations.length,
    passes,
    incomplete,
    violations: violations.map((violation) => ({
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      affectedElements: violation.nodes.map((node) => ({
        target: node.target.join(' > '),
        html: node.html,
        fix: node.failureSummary,
      })),
    })),
  });
}

// ============================================================================
// Visual Highlights
// ============================================================================

function highlightViolations(violations: AxeViolation[]): void {
  // Remove existing highlights
  document.querySelectorAll('[data-a11y-highlight]').forEach((el) => {
    el.removeAttribute('data-a11y-highlight');
    (el as HTMLElement).style.outline = '';
  });

  const impactStyles: Record<string, string> = {
    critical: '3px solid #dc2626',
    serious: '3px solid #ea580c',
    moderate: '3px dashed #ca8a04',
    minor: '2px dashed #65a30d',
  };

  violations.forEach((violation) => {
    violation.nodes.forEach((node) => {
      try {
        const selector = node.target.join(' ');
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.setAttribute('data-a11y-highlight', violation.impact);
          element.style.outline = impactStyles[violation.impact];
          element.title = `[A11Y ${violation.impact}] ${violation.help}`;
        }
      } catch {
        // Selector might be invalid
      }
    });
  });
}

// ============================================================================
// Status Badge Component
// ============================================================================

function AccessibilityBadge({ results }: { results: AxeResults }): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const violationCount = results.violations.length;

  const badgeColor =
    violationCount === 0
      ? 'bg-green-500'
      : results.violations.some((v) => v.impact === 'critical')
        ? 'bg-red-500'
        : results.violations.some((v) => v.impact === 'serious')
          ? 'bg-orange-500'
          : 'bg-yellow-500';

  return (
    <output className="fixed bottom-4 right-4 z-[99999] font-sans text-sm" aria-live="polite">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`${badgeColor} text-white px-3 py-2 rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2`}
        aria-expanded={isExpanded}
        aria-label={`Accessibility: ${violationCount} violations found. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      >
        <span aria-hidden="true">♿</span>
        <span>{violationCount}</span>
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 w-80 max-h-96 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <h3 className="font-bold text-gray-900 mb-2">Accessibility Audit Results</h3>
          <p className="text-gray-600 text-xs mb-3">
            Last run: {results.timestamp.toLocaleTimeString()}
          </p>

          {violationCount === 0 ? (
            <p className="text-green-600">✅ No violations found!</p>
          ) : (
            <ul className="space-y-2">
              {results.violations.map((v, i) => (
                <li
                  key={i}
                  className="text-xs border-l-2 pl-2"
                  style={{
                    borderColor:
                      v.impact === 'critical'
                        ? '#dc2626'
                        : v.impact === 'serious'
                          ? '#ea580c'
                          : '#ca8a04',
                  }}
                >
                  <span className="font-medium text-gray-900">{v.help}</span>
                  <span className="text-gray-500 block">{v.nodes.length} element(s) affected</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Passed: {results.passes} | Incomplete: {results.incomplete}
          </div>
        </div>
      )}
    </output>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default AxeAccessibilityProvider;
