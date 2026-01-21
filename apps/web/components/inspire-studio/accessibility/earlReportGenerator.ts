import type { AxeResult, EARLAssertion, EARLReport } from './types';

const WCAG_SC_MAPPING: Record<string, string[]> = {
  'color-contrast': ['1.4.3'],
  'image-alt': ['1.1.1'],
  label: ['1.3.1', '4.1.2'],
  'link-name': ['2.4.4', '4.1.2'],
  'button-name': ['4.1.2'],
  'html-has-lang': ['3.1.1'],
  'html-lang-valid': ['3.1.1'],
  'document-title': ['2.4.2'],
  bypass: ['2.4.1'],
  'landmark-one-main': ['2.4.1'],
  region: ['2.4.1'],
  'focus-order-semantics': ['2.4.3'],
  tabindex: ['2.4.3'],
  'heading-order': ['1.3.1'],
  'empty-heading': ['2.4.6'],
  'duplicate-id': ['4.1.1'],
  'duplicate-id-aria': ['4.1.1'],
  'aria-valid-attr': ['4.1.2'],
  'aria-valid-attr-value': ['4.1.2'],
  'aria-required-attr': ['4.1.2'],
  'aria-required-children': ['4.1.2'],
  'aria-required-parent': ['4.1.2'],
  'role-img-alt': ['1.1.1'],
  'input-image-alt': ['1.1.1'],
  'video-caption': ['1.2.2'],
  'audio-caption': ['1.2.1'],
  'td-headers-attr': ['1.3.1'],
  'th-has-data-cells': ['1.3.1'],
  'form-field-multiple-labels': ['3.3.2'],
  'autocomplete-valid': ['1.3.5'],
};

function mapImpactToOutcome(): 'earl:failed' {
  // All violations are failures, impact indicates severity
  return 'earl:failed';
}

function getWCAGCriteria(ruleId: string, tags: string[]): string[] {
  const mapped = WCAG_SC_MAPPING[ruleId] || [];

  // Extract WCAG success criteria from tags
  const wcagFromTags = tags
    .filter((tag) => tag.startsWith('wcag') && tag.match(/\d+/))
    .map((tag) => {
      const match = tag.match(/wcag\d+(\d)(\d)(\d+)/);
      if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
      }
      return null;
    })
    .filter((sc): sc is string => sc !== null);

  return [...new Set([...mapped, ...wcagFromTags])];
}

export function generateEARLReport(
  results: AxeResult,
  options: {
    title?: string;
    commissioner?: string;
    pageUrl?: string;
    conformanceTarget?: string[];
  } = {},
): EARLReport {
  const {
    title = 'Accessibility Audit Report',
    commissioner,
    pageUrl = results.url || window?.location?.href || 'unknown',
    conformanceTarget = ['WCAG21:AA'],
  } = options;

  const now = new Date().toISOString();

  const assertions: EARLAssertion[] = [];

  // Add failed assertions (violations)
  results.violations.forEach((violation) => {
    const wcagCriteria = getWCAGCriteria(violation.id, violation.tags);

    violation.nodes.forEach((node) => {
      assertions.push({
        '@type': 'Assertion',
        assertedBy: `LXP360 Accessibility Checker v${results.testEngine?.version || '1.0.0'}`,
        subject: {
          '@type': 'TestSubject',
          source: pageUrl,
          description: node.html.substring(0, 200),
        },
        test: {
          '@type': 'TestCriterion',
          title: violation.help,
          description: violation.description,
          isPartOf: wcagCriteria.map((sc) => `WCAG21:${sc}`),
        },
        result: {
          '@type': 'TestResult',
          outcome: mapImpactToOutcome(),
          description: node.failureSummary || violation.help,
          date: now,
          pointer: node.target,
        },
        mode: 'earl:automatic',
      });
    });
  });

  // Add passed assertions
  results.passes.forEach((pass) => {
    const wcagCriteria = getWCAGCriteria(pass.id, pass.tags);

    assertions.push({
      '@type': 'Assertion',
      assertedBy: `LXP360 Accessibility Checker v${results.testEngine?.version || '1.0.0'}`,
      subject: {
        '@type': 'TestSubject',
        source: pageUrl,
      },
      test: {
        '@type': 'TestCriterion',
        title: pass.help,
        description: pass.description,
        isPartOf: wcagCriteria.map((sc) => `WCAG21:${sc}`),
      },
      result: {
        '@type': 'TestResult',
        outcome: 'earl:passed',
        date: now,
      },
      mode: 'earl:automatic',
    });
  });

  // Add incomplete assertions (needs review)
  results.incomplete.forEach((incomplete) => {
    const wcagCriteria = getWCAGCriteria(incomplete.id, incomplete.tags);

    incomplete.nodes.forEach((node) => {
      assertions.push({
        '@type': 'Assertion',
        assertedBy: `LXP360 Accessibility Checker v${results.testEngine?.version || '1.0.0'}`,
        subject: {
          '@type': 'TestSubject',
          source: pageUrl,
          description: node.html.substring(0, 200),
        },
        test: {
          '@type': 'TestCriterion',
          title: incomplete.help,
          description: incomplete.description,
          isPartOf: wcagCriteria.map((sc) => `WCAG21:${sc}`),
        },
        result: {
          '@type': 'TestResult',
          outcome: 'earl:cantTell',
          description: node.failureSummary || 'Requires manual review',
          date: now,
          pointer: node.target,
        },
        mode: 'earl:automatic',
      });
    });
  });

  // Generate summary
  const violationCount = results.violations.length;
  const passCount = results.passes.length;
  const incompleteCount = results.incomplete.length;

  const summary = `Automated accessibility audit completed. Found ${violationCount} violation(s), ${passCount} passing rule(s), and ${incompleteCount} item(s) requiring manual review.`;

  return {
    '@context': {
      earl: 'http://www.w3.org/ns/earl#',
      dct: 'http://purl.org/dc/terms/',
      doap: 'http://usefulinc.com/ns/doap#',
    },
    '@type': 'Evaluation',
    title,
    summary,
    creator: {
      '@type': 'Software',
      name: 'LXP360 Accessibility Checker',
      version: results.testEngine?.version || '1.0.0',
    },
    date: now,
    commissioner,
    assertions,
    scope: {
      '@type': 'WebPage',
      uri: pageUrl,
      conformanceTarget,
    },
  };
}

export function downloadEARLReport(report: EARLReport, filename?: string): void {
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const defaultFilename = `accessibility-report-${date}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateHTMLReport(report: EARLReport): string {
  const violationAssertions = report.assertions.filter((a) => a.result.outcome === 'earl:failed');
  const passedAssertions = report.assertions.filter((a) => a.result.outcome === 'earl:passed');
  const incompleteAssertions = report.assertions.filter(
    (a) => a.result.outcome === 'earl:cantTell',
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    :root {
      --color-critical: #dc2626;
      --color-serious: #ea580c;
      --color-moderate: #ca8a04;
      --color-minor: #2563eb;
      --color-passed: #16a34a;
      --color-incomplete: var(--color-studio-text-muted);
    }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      color: var(--color-studio-text);
    }
    h1 { color: var(--color-studio-bg); border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { color: var(--color-studio-surface); margin-top: 2rem; }
    .summary { background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0; }
    .stats { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 1rem 0; }
    .stat { text-align: center; padding: 1rem; background: white; border-radius: 0.5rem; min-width: 100px; }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { font-size: 0.875rem; color: var(--color-studio-text-muted); }
    .stat.violations .stat-value { color: var(--color-critical); }
    .stat.passed .stat-value { color: var(--color-passed); }
    .stat.incomplete .stat-value { color: var(--color-incomplete); }
    .violation-list { list-style: none; padding: 0; }
    .violation-item {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 0.75rem 0;
      background: white;
    }
    .violation-header { display: flex; justify-content: space-between; align-items: center; }
    .violation-title { font-weight: 600; color: var(--color-studio-bg); }
    .violation-description { color: var(--color-studio-text-muted); margin: 0.5rem 0; }
    .element-code {
      background: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-family: monospace;
      font-size: 0.875rem;
      overflow-x: auto;
    }
    .wcag-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
    .wcag-tag {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; color: var(--color-studio-text-muted); font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>${report.title}</h1>

  <div class="summary">
    <p>${report.summary}</p>
    <div class="stats">
      <div class="stat violations">
        <div class="stat-value">${violationAssertions.length}</div>
        <div class="stat-label">Violations</div>
      </div>
      <div class="stat passed">
        <div class="stat-value">${passedAssertions.length}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat incomplete">
        <div class="stat-value">${incompleteAssertions.length}</div>
        <div class="stat-label">Needs Review</div>
      </div>
    </div>
    <p><strong>Report Date:</strong> ${new Date(report.date).toLocaleString()}</p>
    <p><strong>Page URL:</strong> ${report.scope.uri}</p>
    ${report.commissioner ? `<p><strong>Commissioner:</strong> ${report.commissioner}</p>` : ''}
  </div>

  <h2>Violations (${violationAssertions.length})</h2>
  ${
    violationAssertions.length === 0
      ? '<p>No accessibility violations detected.</p>'
      : `<ul class="violation-list">
    ${violationAssertions
      .map(
        (a) => `
      <li class="violation-item">
        <div class="violation-header">
          <span class="violation-title">${a.test.title}</span>
        </div>
        <p class="violation-description">${a.test.description}</p>
        ${a.subject.description ? `<div class="element-code">${escapeHtml(a.subject.description)}</div>` : ''}
        <div class="wcag-tags">
          ${(a.test.isPartOf || []).map((sc) => `<span class="wcag-tag">${sc}</span>`).join('')}
        </div>
      </li>
    `,
      )
      .join('')}
  </ul>`
  }

  <h2>Items Requiring Manual Review (${incompleteAssertions.length})</h2>
  ${
    incompleteAssertions.length === 0
      ? '<p>No items require manual review.</p>'
      : `<ul class="violation-list">
    ${incompleteAssertions
      .map(
        (a) => `
      <li class="violation-item">
        <div class="violation-header">
          <span class="violation-title">${a.test.title}</span>
        </div>
        <p class="violation-description">${a.result.description}</p>
        ${a.subject.description ? `<div class="element-code">${escapeHtml(a.subject.description)}</div>` : ''}
      </li>
    `,
      )
      .join('')}
  </ul>`
  }

  <div class="footer">
    <p>Generated by ${report.creator.name} v${report.creator.version}</p>
    <p>Conformance Target: ${report.scope.conformanceTarget?.join(', ') || 'Not specified'}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadHTMLReport(report: EARLReport, filename?: string): void {
  const html = generateHTMLReport(report);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const defaultFilename = `accessibility-report-${date}.html`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
