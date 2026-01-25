'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import type {
  AccessibilityAuditOptions,
  AccessibilityAuditState,
  AxeResult,
  AxeViolation,
  TagFilter,
} from './types';

const log = logger.scope('useAccessibilityAudit');

const DEFAULT_DEBOUNCE_MS = 1000;
const DEFAULT_TAGS: TagFilter[] = ['wcag2aa', 'section508'];

interface UseAccessibilityAuditReturn extends AccessibilityAuditState {
  runAudit: () => Promise<void>;
  clearResults: () => void;
  setTags: (tags: TagFilter[]) => void;
  setSelector: (selector: string) => void;
  activeTags: TagFilter[];
  activeSelector: string;
  violationCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
}

export function useAccessibilityAudit(
  options: AccessibilityAuditOptions = {},
): UseAccessibilityAuditReturn {
  const {
    selector: initialSelector = '#editor-content',
    tags: initialTags = DEFAULT_TAGS,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    runOnMount = false,
  } = options;

  const [state, setState] = useState<AccessibilityAuditState>({
    isRunning: false,
    results: null,
    violations: [],
    error: null,
    lastAuditTime: null,
  });

  const [activeTags, setActiveTags] = useState<TagFilter[]>(initialTags as TagFilter[]);
  const [activeSelector, setActiveSelector] = useState<string>(initialSelector);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const axeRef = useRef<typeof import('axe-core') | null>(null);
  const mountedRef = useRef(true);

  // Load axe-core dynamically (only on client)
  useEffect(() => {
    const loadAxe = async (): Promise<void> => {
      if (typeof window !== 'undefined' && !axeRef.current) {
        try {
          const axe = await import('axe-core');
          axeRef.current = axe.default || axe;
        } catch (error) {
          log.error(
            'Failed to load axe-core',
            error instanceof Error ? error : new Error(String(error)),
          );
          if (mountedRef.current) {
            setState((prev) => ({
              ...prev,
              error: new Error('Failed to load accessibility testing library'),
            }));
          }
        }
      }
    };
    loadAxe();

    return (): void => {
      mountedRef.current = false;
    };
  }, []);

  // Run the accessibility audit
  const runAudit = useCallback(async (): Promise<void> => {
    if (!axeRef.current || typeof window === 'undefined') {
      return;
    }

    const targetElement = document.querySelector(activeSelector);
    if (!targetElement) {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: new Error(`Target element not found: ${activeSelector}`),
      }));
      return;
    }

    setState((prev) => ({ ...prev, isRunning: true, error: null }));

    try {
      const results = await axeRef.current.run(targetElement as HTMLElement, {
        runOnly: {
          type: 'tag',
          values: activeTags,
        },
        resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
        reporter: 'v2',
      });

      if (mountedRef.current) {
        // Sort violations by impact severity
        const sortedViolations = [...results.violations].sort((a, b) => {
          const impactOrder: Record<string, number> = {
            critical: 0,
            serious: 1,
            moderate: 2,
            minor: 3,
          };
          const impactA = a.impact ? (impactOrder[a.impact] ?? 4) : 4;
          const impactB = b.impact ? (impactOrder[b.impact] ?? 4) : 4;
          return impactA - impactB;
        });

        setState({
          isRunning: false,
          results: results as unknown as AxeResult,
          violations: sortedViolations as unknown as AxeViolation[],
          error: null,
          lastAuditTime: new Date(),
        });
      }
    } catch (error) {
      log.error(
        'Accessibility audit failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: error instanceof Error ? error : new Error('Audit failed'),
        }));
      }
    }
  }, [activeSelector, activeTags]);

  // Debounced audit trigger
  const debouncedRunAudit = useCallback((): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      runAudit();
    }, debounceMs);
  }, [runAudit, debounceMs]);

  // Set up mutation observer for automatic re-auditing on content changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const targetElement = document.querySelector(activeSelector);
    if (!targetElement) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new MutationObserver((mutations) => {
      // Filter out attribute changes that don't affect accessibility
      const significantChange = mutations.some(
        (mutation) =>
          mutation.type === 'childList' ||
          mutation.type === 'characterData' ||
          (mutation.type === 'attributes' &&
            [
              'alt',
              'aria-label',
              'aria-labelledby',
              'aria-describedby',
              'role',
              'tabindex',
              'href',
              'src',
              'lang',
            ].includes(mutation.attributeName || '')),
      );

      if (significantChange) {
        debouncedRunAudit();
      }
    });

    observerRef.current.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        'alt',
        'aria-label',
        'aria-labelledby',
        'aria-describedby',
        'role',
        'tabindex',
        'href',
        'src',
        'lang',
        'title',
      ],
    });

    return (): void => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeSelector, debouncedRunAudit]);

  // Run audit on mount if requested
  useEffect(() => {
    if (runOnMount && axeRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(runAudit, 500);
      return (): void => clearTimeout(timer);
    }
  }, [runOnMount, runAudit]);

  // Clear results
  const clearResults = useCallback((): void => {
    setState({
      isRunning: false,
      results: null,
      violations: [],
      error: null,
      lastAuditTime: null,
    });
  }, []);

  // Update tags
  const setTags = useCallback((newTags: TagFilter[]): void => {
    setActiveTags(newTags);
  }, []);

  // Update selector
  const setSelector = useCallback((newSelector: string): void => {
    setActiveSelector(newSelector);
  }, []);

  // Compute violation counts by severity
  const { violationCount, criticalCount, seriousCount, moderateCount, minorCount } = useMemo(() => {
    const counts = {
      violationCount: state.violations.length,
      criticalCount: 0,
      seriousCount: 0,
      moderateCount: 0,
      minorCount: 0,
    };

    state.violations.forEach((violation) => {
      switch (violation.impact) {
        case 'critical':
          counts.criticalCount++;
          break;
        case 'serious':
          counts.seriousCount++;
          break;
        case 'moderate':
          counts.moderateCount++;
          break;
        case 'minor':
          counts.minorCount++;
          break;
      }
    });

    return counts;
  }, [state.violations]);

  return {
    ...state,
    runAudit,
    clearResults,
    setTags,
    setSelector,
    activeTags,
    activeSelector,
    violationCount,
    criticalCount,
    seriousCount,
    moderateCount,
    minorCount,
  };
}

export default useAccessibilityAudit;
