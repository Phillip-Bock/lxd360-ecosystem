export type ViolationImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface AxeNodeResult {
  html: string;
  target: string[];
  failureSummary?: string;
  unknown: AxeCheckResult[];
  all: AxeCheckResult[];
  none: AxeCheckResult[];
}

export interface AxeCheckResult {
  id: string;
  impact?: ViolationImpact;
  message: string;
  data?: unknown;
  relatedNodes?: AxeNodeResult[];
}

export interface AxeViolation {
  id: string;
  impact: ViolationImpact;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNodeResult[];
}

export interface AxeResult {
  violations: AxeViolation[];
  passes: AxeViolation[];
  incomplete: AxeViolation[];
  inapplicable: AxeViolation[];
  timestamp: string;
  url: string;
  testEngine: {
    name: string;
    version: string;
  };
  testRunner: {
    name: string;
  };
  testEnvironment: {
    userAgent: string;
    windowWidth: number;
    windowHeight: number;
  };
}

export interface AccessibilityAuditOptions {
  selector?: string;
  tags?: string[];
  debounceMs?: number;
  runOnMount?: boolean;
}

export interface ViolationWithElement extends AxeViolation {
  element?: HTMLElement;
  nodeIndex?: number;
}

export interface AccessibilityAuditState {
  isRunning: boolean;
  results: AxeResult | null;
  violations: AxeViolation[];
  error: Error | null;
  lastAuditTime: Date | null;
}

// EARL (Evaluation And Report Language) Report Types
export interface EARLAssertion {
  '@type': 'Assertion';
  assertedBy: string;
  subject: EARLSubject;
  test: EARLTest;
  result: EARLResult;
  mode: 'earl:automatic';
}

export interface EARLSubject {
  '@type': 'TestSubject';
  source: string;
  description?: string;
}

export interface EARLTest {
  '@type': 'TestCriterion';
  title: string;
  description: string;
  isPartOf?: string[];
}

export interface EARLResult {
  '@type': 'TestResult';
  outcome: 'earl:passed' | 'earl:failed' | 'earl:cantTell' | 'earl:inapplicable' | 'earl:untested';
  description?: string;
  date: string;
  pointer?: string[];
}

export interface EARLReport {
  '@context': {
    earl: string;
    dct: string;
    doap: string;
  };
  '@type': 'Evaluation';
  title: string;
  summary: string;
  creator: {
    '@type': 'Software';
    name: string;
    version: string;
  };
  date: string;
  commissioner?: string;
  assertions: EARLAssertion[];
  scope: {
    '@type': 'WebSite' | 'WebPage';
    uri: string;
    conformanceTarget?: string[];
  };
}

export type TagFilter =
  | 'wcag2a'
  | 'wcag2aa'
  | 'wcag2aaa'
  | 'wcag21a'
  | 'wcag21aa'
  | 'wcag22aa'
  | 'section508'
  | 'best-practice';

export const TAG_LABELS: Record<TagFilter, string> = {
  wcag2a: 'WCAG 2.0 A',
  wcag2aa: 'WCAG 2.0 AA',
  wcag2aaa: 'WCAG 2.0 AAA',
  wcag21a: 'WCAG 2.1 A',
  wcag21aa: 'WCAG 2.1 AA',
  wcag22aa: 'WCAG 2.2 AA',
  section508: 'Section 508',
  'best-practice': 'Best Practice',
};

export const IMPACT_COLORS: Record<ViolationImpact, { bg: string; text: string; border: string }> =
  {
    critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    serious: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    minor: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  };

export const IMPACT_PRIORITY: Record<ViolationImpact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};
