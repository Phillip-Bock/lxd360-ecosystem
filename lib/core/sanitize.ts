/**
 * HTML/XSS Sanitization Utilities
 * ================================
 * Provides secure HTML sanitization using DOMPurify for XSS prevention.
 *
 * @module lib/sanitize
 * @see https://owasp.org/www-community/xss-filter-evasion-cheatsheet
 */

import DOMPurify, { type Config } from 'isomorphic-dompurify';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default DOMPurify configuration for strict sanitization
 */
const STRICT_CONFIG: Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  // Force all links to open in new tab and prevent tab-nabbing
  FORCE_BODY: true,
};

/**
 * Relaxed configuration for rich text content (e.g., forum posts, course content)
 */
const RICH_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: [
    // Block elements
    'p',
    'div',
    'br',
    'hr',
    // Headings
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Text formatting
    'b',
    'i',
    'em',
    'strong',
    'u',
    's',
    'strike',
    'sub',
    'sup',
    'mark',
    // Lists
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    // Links and media
    'a',
    'img',
    'figure',
    'figcaption',
    // Tables
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'colgroup',
    'col',
    // Quotes and code
    'blockquote',
    'pre',
    'code',
    'kbd',
    'samp',
    // Semantic
    'article',
    'section',
    'aside',
    'header',
    'footer',
    'main',
    'nav',
    // Inline containers
    'span',
    'small',
    'abbr',
    'cite',
    'time',
    'address',
  ],
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'title',
    'target',
    'rel',
    'class',
    'id',
    'name',
    'width',
    'height',
    'loading',
    'colspan',
    'rowspan',
    'scope',
    'datetime',
    'lang',
    'data-testid', // Allow test IDs
  ],
  ALLOW_DATA_ATTR: false,
  ADD_TAGS: [],
  ADD_ATTR: ['target'],
  // Prevent tab-nabbing attacks on links
  FORCE_BODY: true,
};

/**
 * Plain text configuration - strips all HTML
 */
const PLAIN_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitizes HTML with strict settings - only basic formatting allowed.
 * Use for user-generated short text like comments, messages, bios.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 *
 * @example
 * ```ts
 * const safe = sanitizeHtml('<script>alert("xss")</script><b>Bold</b>')
 * // Returns: '<b>Bold</b>'
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  const clean = DOMPurify.sanitize(dirty, STRICT_CONFIG) as string;

  // Post-process: Add rel="noopener noreferrer" to all links
  return addSecurityToLinks(clean);
}

/**
 * Sanitizes rich text HTML - allows more tags for course content, forum posts.
 * Use for authored content like course descriptions, forum posts, articles.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 *
 * @example
 * ```ts
 * const safe = sanitizeRichText('<h1>Title</h1><script>bad()</script><p>Content</p>')
 * // Returns: '<h1>Title</h1><p>Content</p>'
 * ```
 */
export function sanitizeRichText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  const clean = DOMPurify.sanitize(dirty, RICH_TEXT_CONFIG) as string;

  return addSecurityToLinks(clean);
}

/**
 * Strips all HTML tags and returns plain text.
 * Use for displaying user content in contexts where no HTML is allowed.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Plain text with all HTML removed
 *
 * @example
 * ```ts
 * const text = stripHtml('<b>Bold</b> text')
 * // Returns: 'Bold text'
 * ```
 */
export function stripHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, PLAIN_TEXT_CONFIG) as string;
}

/**
 * Sanitizes a URL to prevent javascript: and data: URL attacks.
 *
 * @param url - The potentially unsafe URL
 * @returns Safe URL or empty string if dangerous
 *
 * @example
 * ```ts
 * sanitizeUrl('javascript:alert(1)') // Returns: ''
 * sanitizeUrl('https://example.com') // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }

  // Allow relative URLs and safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', '/'];

  const hasProtocol = trimmed.includes(':');
  if (hasProtocol) {
    const isSafe = safeProtocols.some((p) => trimmed.startsWith(p));
    if (!isSafe) {
      return '';
    }
  }

  return url;
}

/**
 * Escapes HTML entities to prevent XSS when inserting into HTML attributes.
 * Use when you need to insert user content into HTML attributes.
 *
 * @param str - The string to escape
 * @returns Escaped string safe for HTML attributes
 *
 * @example
 * ```ts
 * const safe = escapeHtmlAttr('"><script>alert(1)</script>')
 * // Returns: '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export function escapeHtmlAttr(str: string): string {
  if (!str || typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitizes JSON data by recursively sanitizing all string values.
 *
 * @param data - The data to sanitize
 * @returns Sanitized data with all strings cleaned
 *
 * @example
 * ```ts
 * const safe = sanitizeObject({ name: '<script>bad</script>John' })
 * // Returns: { name: 'John' }
 * ```
 */
export function sanitizeObject<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return stripHtml(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }

  return data;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Adds security attributes to all links in HTML
 */
function addSecurityToLinks(html: string): string {
  // Add rel="noopener noreferrer" and target="_blank" to external links
  return html.replace(/<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi, (_match, attrs) => {
    // Check if already has rel attribute
    if (!attrs.includes('rel=')) {
      attrs += ' rel="noopener noreferrer"';
    }
    // Check if already has target attribute
    if (!attrs.includes('target=')) {
      attrs += ' target="_blank"';
    }
    return `<a ${attrs}>`;
  });
}

// ============================================================================
// REACT COMPONENT HELPERS
// ============================================================================

/**
 * Creates safe props for dangerouslySetInnerHTML.
 * This ensures content is sanitized before being rendered.
 *
 * @param html - The HTML to sanitize
 * @param mode - Sanitization mode: 'strict', 'rich', or 'plain'
 * @returns Props object for use with dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * // In a React component:
 * <div {...safeInnerHtml(userContent, 'strict')} />
 * ```
 */
export function safeInnerHtml(
  html: string,
  mode: 'strict' | 'rich' | 'plain' = 'strict',
): { dangerouslySetInnerHTML: { __html: string } } {
  let sanitized: string;

  switch (mode) {
    case 'rich':
      sanitized = sanitizeRichText(html);
      break;
    case 'plain':
      sanitized = stripHtml(html);
      break;
    default:
      sanitized = sanitizeHtml(html);
  }

  return { dangerouslySetInnerHTML: { __html: sanitized } };
}

// ============================================================================
// EXPORTS
// ============================================================================

const sanitizeUtils = {
  sanitizeHtml,
  sanitizeRichText,
  stripHtml,
  sanitizeUrl,
  escapeHtmlAttr,
  sanitizeObject,
  safeInnerHtml,
};

export default sanitizeUtils;
