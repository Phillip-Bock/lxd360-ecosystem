export const dynamic = 'force-dynamic';

/**
 * Accessibility Check API
 *
 * POST /api/accessibility/check
 * Validates content against WCAG 2.1 AA guidelines
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-accessibility-check' });

// ContentBlock type - simplified for accessibility checking
interface ContentBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

// WCAG 2.1 Rule definitions
interface AccessibilityRule {
  id: string;
  name: string;
  description: string;
  wcagCriteria: string;
  level: 'A' | 'AA' | 'AAA';
  check: (block: ContentBlock) => ValidationResult | null;
}

interface ValidationResult {
  ruleId: string;
  ruleName: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  blockId: string;
  blockType: string;
  wcagCriteria: string;
  suggestion?: string;
  autoFixable?: boolean;
}

interface AccessibilityCheckRequest {
  blocks: ContentBlock[];
  level?: 'A' | 'AA' | 'AAA';
  includeWarnings?: boolean;
  includeInfo?: boolean;
}

interface AccessibilityCheckResponse {
  isValid: boolean;
  score: number; // 0-100
  level: 'A' | 'AA' | 'AAA';
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  results: ValidationResult[];
  summary: {
    passed: string[];
    failed: string[];
    byCategory: Record<string, { passed: number; failed: number }>;
  };
}

// Define accessibility rules
const ACCESSIBILITY_RULES: AccessibilityRule[] = [
  // 1.1.1 Non-text Content (Level A)
  {
    id: 'img-alt',
    name: 'Image Alt Text',
    description: 'All images must have alt text',
    wcagCriteria: '1.1.1',
    level: 'A',
    check: (block): ValidationResult | null => {
      if (block.type === 'image' || block.type === 'hotspot_image') {
        const content = block.content as { alt?: string; src?: string };
        if (!content.alt || content.alt.trim() === '') {
          return {
            ruleId: 'img-alt',
            ruleName: 'Image Alt Text',
            severity: 'error',
            message: 'Image is missing alternative text',
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.1.1',
            suggestion: 'Add descriptive alt text that conveys the image content or purpose',
            autoFixable: false,
          };
        }
        // Check for placeholder alt text
        const placeholderPatterns = ['image', 'photo', 'picture', 'img', 'untitled'];
        if (placeholderPatterns.some((p) => content.alt?.toLowerCase() === p)) {
          return {
            ruleId: 'img-alt-quality',
            ruleName: 'Alt Text Quality',
            severity: 'warning',
            message: `Alt text "${content.alt}" is not descriptive`,
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.1.1',
            suggestion: 'Replace with descriptive text explaining the image content',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },

  // 1.2.2 Captions (Prerecorded) (Level A)
  {
    id: 'video-captions',
    name: 'Video Captions',
    description: 'All video content must have captions',
    wcagCriteria: '1.2.2',
    level: 'A',
    check: (block): ValidationResult | null => {
      if (block.type === 'video' || block.type === 'branching_video') {
        const content = block.content as {
          captions?: string;
          transcript?: string;
          subtitles?: string;
        };
        if (!content.captions && !content.transcript && !content.subtitles) {
          return {
            ruleId: 'video-captions',
            ruleName: 'Video Captions',
            severity: 'error',
            message: 'Video is missing captions or transcript',
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.2.2',
            suggestion: 'Add captions (VTT/SRT) or provide a transcript',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },

  // 1.2.3 Audio Description (Level A)
  {
    id: 'video-audio-description',
    name: 'Video Audio Description',
    description: 'Video should have audio descriptions for visual content',
    wcagCriteria: '1.2.3',
    level: 'A',
    check: (block): ValidationResult | null => {
      if (block.type === 'video' || block.type === 'branching_video') {
        const content = block.content as {
          audioDescription?: string;
          hasAudioDescription?: boolean;
        };
        if (!content.audioDescription && !content.hasAudioDescription) {
          return {
            ruleId: 'video-audio-description',
            ruleName: 'Audio Description',
            severity: 'warning',
            message: 'Video may need audio description for visual content',
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.2.3',
            suggestion: 'Consider adding audio descriptions for important visual elements',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },

  // 1.3.1 Info and Relationships (Level A) - Headings
  {
    id: 'heading-structure',
    name: 'Heading Structure',
    description: 'Headings must be used in logical order',
    wcagCriteria: '1.3.1',
    level: 'A',
    check: (block): ValidationResult | null => {
      if (block.type === 'heading') {
        const content = block.content as { level?: number };
        // Note: Full heading hierarchy validation requires context of all blocks
        if (!content.level || content.level < 1 || content.level > 6) {
          return {
            ruleId: 'heading-structure',
            ruleName: 'Heading Structure',
            severity: 'error',
            message: 'Invalid heading level',
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.3.1',
            suggestion: 'Use heading levels 1-6 in hierarchical order',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },

  // 2.4.4 Link Purpose (Level A)
  {
    id: 'link-purpose',
    name: 'Link Purpose',
    description: 'Link text must describe the destination',
    wcagCriteria: '2.4.4',
    level: 'A',
    check: (block): ValidationResult | null => {
      if (block.type === 'button' || block.type === 'resource_glossary') {
        const content = block.content as { text?: string; label?: string };
        const linkText = content.text || content.label;
        const vagueLinkTexts = ['click here', 'here', 'read more', 'learn more', 'more', 'link'];
        if (linkText && vagueLinkTexts.includes(linkText.toLowerCase())) {
          return {
            ruleId: 'link-purpose',
            ruleName: 'Link Purpose',
            severity: 'warning',
            message: `Link text "${linkText}" is not descriptive`,
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '2.4.4',
            suggestion: 'Use descriptive link text that indicates the destination or purpose',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },

  // 1.4.3 Contrast (Minimum) (Level AA)
  {
    id: 'color-contrast',
    name: 'Color Contrast',
    description: 'Text must have sufficient contrast with background',
    wcagCriteria: '1.4.3',
    level: 'AA',
    check: (block): ValidationResult | null => {
      // Check for potential contrast issues based on styling
      const content = block.content as {
        textColor?: string;
        backgroundColor?: string;
        style?: Record<string, string>;
      };
      if (content.textColor && content.backgroundColor) {
        // Would need actual contrast calculation - this is a simplified check
        return {
          ruleId: 'color-contrast',
          ruleName: 'Color Contrast',
          severity: 'info',
          message:
            'Verify text contrast meets WCAG AA requirements (4.5:1 for normal text, 3:1 for large text)',
          blockId: block.id,
          blockType: block.type,
          wcagCriteria: '1.4.3',
          suggestion: 'Use a contrast checker to verify the color combination meets requirements',
          autoFixable: false,
        };
      }
      return null;
    },
  },

  // 3.1.1 Language of Page (Level A)
  {
    id: 'lang-attribute',
    name: 'Language Identification',
    description: 'Content language should be identified',
    wcagCriteria: '3.1.1',
    level: 'A',
    check: (block): ValidationResult | null => {
      // Check for mixed language content without lang attribute
      const content = block.content as { lang?: string; text?: string };
      // This is a simplified check - real implementation would detect language
      if (content.text && content.text.length > 100 && !content.lang) {
        return {
          ruleId: 'lang-attribute',
          ruleName: 'Language Identification',
          severity: 'info',
          message: 'Consider specifying content language for accessibility tools',
          blockId: block.id,
          blockType: block.type,
          wcagCriteria: '3.1.1',
          suggestion: 'Add lang attribute if content is in a different language than the page',
          autoFixable: false,
        };
      }
      return null;
    },
  },

  // Interactive content - keyboard accessibility
  {
    id: 'keyboard-accessible',
    name: 'Keyboard Accessibility',
    description: 'Interactive elements must be keyboard accessible',
    wcagCriteria: '2.1.1',
    level: 'A',
    check: (block): ValidationResult | null => {
      const interactiveTypes = [
        'hotspot',
        'hotspot_image',
        'ar_hotspot_explorer',
        'drag_drop',
        'scenario',
        'decision_tree',
        'interactive_map',
      ];
      if (interactiveTypes.includes(block.type)) {
        return {
          ruleId: 'keyboard-accessible',
          ruleName: 'Keyboard Accessibility',
          severity: 'warning',
          message: 'Verify this interactive element supports keyboard navigation',
          blockId: block.id,
          blockType: block.type,
          wcagCriteria: '2.1.1',
          suggestion:
            'Ensure all interactions can be performed using keyboard only (Tab, Enter, Arrow keys)',
          autoFixable: false,
        };
      }
      return null;
    },
  },

  // Form labels
  {
    id: 'form-labels',
    name: 'Form Labels',
    description: 'Form inputs must have associated labels',
    wcagCriteria: '1.3.1',
    level: 'A',
    check: (block): ValidationResult | null => {
      const formTypes = ['fill_blank', 'short_answer', 'essay', 'audio_response', 'video_response'];
      if (formTypes.includes(block.type)) {
        const content = block.content as { label?: string; question?: string };
        if (!content.label && !content.question) {
          return {
            ruleId: 'form-labels',
            ruleName: 'Form Labels',
            severity: 'error',
            message: 'Input field is missing a label or question',
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.3.1',
            suggestion: 'Add a clear label or question for the input field',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },

  // Table structure
  {
    id: 'table-headers',
    name: 'Table Headers',
    description: 'Data tables must have header cells',
    wcagCriteria: '1.3.1',
    level: 'A',
    check: (block): ValidationResult | null => {
      if (block.type === 'table') {
        const content = block.content as { headers?: string[]; hasHeaders?: boolean };
        if (!content.headers && !content.hasHeaders) {
          return {
            ruleId: 'table-headers',
            ruleName: 'Table Headers',
            severity: 'error',
            message: 'Data table is missing header row',
            blockId: block.id,
            blockType: block.type,
            wcagCriteria: '1.3.1',
            suggestion: 'Add header cells to identify columns',
            autoFixable: false,
          };
        }
      }
      return null;
    },
  },
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AccessibilityCheckRequest = await request.json();

    if (!body.blocks || !Array.isArray(body.blocks)) {
      return NextResponse.json(
        { error: 'Missing required field: blocks (array of content blocks)' },
        { status: 400 },
      );
    }

    const level = body.level || 'AA';
    const includeWarnings = body.includeWarnings !== false;
    const includeInfo = body.includeInfo !== false;

    // Filter rules by level
    const applicableRules = ACCESSIBILITY_RULES.filter((rule) => {
      if (level === 'A') return rule.level === 'A';
      if (level === 'AA') return rule.level === 'A' || rule.level === 'AA';
      return true; // AAA includes all
    });

    // Run all checks
    const allResults: ValidationResult[] = [];
    const passedRules = new Set<string>();
    const failedRules = new Set<string>();
    const categoryStats: Record<string, { passed: number; failed: number }> = {};

    for (const block of body.blocks) {
      for (const rule of applicableRules) {
        const result = rule.check(block);
        if (result) {
          // Apply severity filters
          if (result.severity === 'warning' && !includeWarnings) continue;
          if (result.severity === 'info' && !includeInfo) continue;

          allResults.push(result);
          failedRules.add(rule.id);

          // Track by category (WCAG criteria)
          const category = result.wcagCriteria;
          if (!categoryStats[category]) {
            categoryStats[category] = { passed: 0, failed: 0 };
          }
          categoryStats[category].failed++;
        } else {
          passedRules.add(rule.id);
        }
      }
    }

    // Update passed counts
    for (const rule of applicableRules) {
      if (passedRules.has(rule.id) && !failedRules.has(rule.id)) {
        const category = rule.wcagCriteria;
        if (!categoryStats[category]) {
          categoryStats[category] = { passed: 0, failed: 0 };
        }
        categoryStats[category].passed++;
      }
    }

    // Calculate counts
    const errorCount = allResults.filter((r) => r.severity === 'error').length;
    const warningCount = allResults.filter((r) => r.severity === 'warning').length;
    const infoCount = allResults.filter((r) => r.severity === 'info').length;

    // Calculate score (weighted by severity)
    const maxScore = body.blocks.length * applicableRules.length;
    const deductions = errorCount * 3 + warningCount * 1 + infoCount * 0.5;
    const score = Math.max(0, Math.round(100 - (deductions / maxScore) * 100 * 10));

    const response: AccessibilityCheckResponse = {
      isValid: errorCount === 0,
      score: Math.min(100, score),
      level,
      totalIssues: allResults.length,
      errorCount,
      warningCount,
      infoCount,
      results: allResults,
      summary: {
        passed: Array.from(passedRules).filter((id) => !failedRules.has(id)),
        failed: Array.from(failedRules),
        byCategory: categoryStats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    log.error('Accessibility check error', { error });
    return NextResponse.json(
      { error: 'Failed to perform accessibility check', details: String(error) },
      { status: 500 },
    );
  }
}
