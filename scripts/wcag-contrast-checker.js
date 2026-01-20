/**
 * WCAG 2.2 AA Contrast Ratio Checker
 * Calculates contrast ratios for LXP360-SaaS color palette
 */

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance
function getRelativeLuminance(r, g, b) {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const r2 = rsRGB <= 0.03928 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
  const g2 = gsRGB <= 0.03928 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
  const b2 = bsRGB <= 0.03928 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;

  return 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Determine pass/fail status
function checkCompliance(ratio, type = 'normal-text') {
  const requirements = {
    'normal-text': 4.5,
    'large-text': 3.0,
    'ui-component': 3.0,
  };

  const required = requirements[type];
  const passes = ratio >= required;

  return { required, passes };
}

// Format results
function formatResult(fg, bg, fgName, bgName, type = 'normal-text') {
  const ratio = getContrastRatio(fg, bg);
  const { required, passes } = checkCompliance(ratio, type);

  return {
    foreground: `${fgName} (${fg})`,
    background: `${bgName} (${bg})`,
    ratio: `${ratio.toFixed(2)}:1`,
    required: `${required}:1`,
    status: passes ? 'PASS ✓' : 'FAIL ✗',
  };
}

// Light Mode Combinations
console.log('\n=== LIGHT MODE COMBINATIONS ===\n');

const lightModeTests = [
  ['#232323', '#F5F5F5', 'Text Primary', 'Page Background'],
  ['#232323', '#ffffff', 'Text Primary', 'Card Background'],
  ['#4b5563', '#F5F5F5', 'Text Secondary', 'Page Background'],
  ['#4b5563', '#ffffff', 'Text Secondary', 'Card Background'],
  ['#6b7280', '#F5F5F5', 'Text Tertiary', 'Page Background'],
  ['#9ca3af', '#ffffff', 'Text Muted', 'Card Background'],
  ['#ffffff', '#0056B8', 'Primary Button Text', 'Primary'],
  ['#0056B8', '#ffffff', 'Link', 'Card Background'],
];

const lightResults = lightModeTests.map(([fg, bg, fgName, bgName]) =>
  formatResult(fg, bg, fgName, bgName),
);

// Print light mode table
console.log(
  'Foreground                          | Background                    | Ratio    | Required | Status',
);
console.log(
  '-----------------------------------|-------------------------------|----------|----------|----------',
);
lightResults.forEach((r) => {
  console.log(
    `${r.foreground.padEnd(35)} | ${r.background.padEnd(29)} | ${r.ratio.padEnd(8)} | ${r.required.padEnd(8)} | ${r.status}`,
  );
});

// Dark Mode Combinations
console.log('\n\n=== DARK MODE COMBINATIONS ===\n');

const darkModeTests = [
  ['#f5f5f5', '#0f172a', 'Text Primary', 'Page Background'],
  ['#f5f5f5', '#1e293b', 'Text Primary', 'Card Background'],
  ['#e2e8f0', '#0f172a', 'Text Secondary', 'Page Background'],
  ['#94a3b8', '#0f172a', 'Text Tertiary', 'Page Background'],
  ['#64748b', '#1e293b', 'Text Muted', 'Card Background'],
  ['#3b82f6', '#0f172a', 'Primary', 'Page Background'],
  ['#019EF3', '#0f172a', 'Accent', 'Page Background'],
];

const darkResults = darkModeTests.map(([fg, bg, fgName, bgName]) =>
  formatResult(fg, bg, fgName, bgName),
);

// Print dark mode table
console.log(
  'Foreground                          | Background                    | Ratio    | Required | Status',
);
console.log(
  '-----------------------------------|-------------------------------|----------|----------|----------',
);
darkResults.forEach((r) => {
  console.log(
    `${r.foreground.padEnd(35)} | ${r.background.padEnd(29)} | ${r.ratio.padEnd(8)} | ${r.required.padEnd(8)} | ${r.status}`,
  );
});

// Summary
console.log('\n\n=== SUMMARY ===\n');

const allResults = [...lightResults, ...darkResults];
const totalTests = allResults.length;
const passed = allResults.filter((r) => r.status.includes('PASS')).length;
const failed = totalTests - passed;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passed} (${((passed / totalTests) * 100).toFixed(1)}%)`);
console.log(`Failed: ${failed} (${((failed / totalTests) * 100).toFixed(1)}%)`);

console.log('\n--- Failed Combinations (require attention) ---\n');
allResults.forEach((r, i) => {
  if (r.status.includes('FAIL')) {
    const testSet = i < lightResults.length ? 'Light Mode' : 'Dark Mode';
    console.log(`[${testSet}] ${r.foreground} on ${r.background}`);
    console.log(`  Current: ${r.ratio} | Required: ${r.required}`);
    console.log('');
  }
});

console.log('\nNote: All ratios calculated for normal text (4.5:1 requirement)');
console.log('Large text (18pt+) and UI components require 3:1 minimum\n');
