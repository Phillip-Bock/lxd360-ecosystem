// =============================================================================
// CONTENT FORMAT DETECTOR
// =============================================================================
// Detects content format from package structure by checking for standard files:
// - imsmanifest.xml → SCORM (check version for 1.2 vs 2004)
// - tincan.xml → xAPI
// - cmi5.xml → cmi5
// - .au files or course.ini → AICC
// - index.html only → HTML5
// - .pdf → PDF
// =============================================================================

import type { ContentFormat, ContentManifest, Scorm2004Edition } from './types';

/**
 * File entry in a package (from zip or storage).
 */
export interface PackageFile {
  /** File path relative to package root */
  path: string;
  /** Get file content as text */
  getText: () => Promise<string>;
}

/**
 * Result of content detection.
 */
export interface DetectionResult {
  /** Whether detection was successful */
  success: boolean;
  /** Detected manifest (if successful) */
  manifest?: ContentManifest;
  /** Error message (if detection failed) */
  error?: string;
}

/**
 * Detect content format from a package.
 * @param files - List of files in the package
 * @returns Detection result with manifest or error
 */
export async function detectContentFormat(files: PackageFile[]): Promise<DetectionResult> {
  // Build a map of normalized paths for quick lookup
  const fileMap = new Map<string, PackageFile>();
  for (const file of files) {
    const normalizedPath = file.path.toLowerCase().replace(/\\/g, '/');
    fileMap.set(normalizedPath, file);
  }

  // Check for cmi5.xml first (most specific)
  const cmi5Result = await detectCmi5(fileMap);
  if (cmi5Result.success) return cmi5Result;

  // Check for tincan.xml (xAPI)
  const xapiResult = await detectXApi(fileMap);
  if (xapiResult.success) return xapiResult;

  // Check for imsmanifest.xml (SCORM)
  const scormResult = await detectScorm(fileMap);
  if (scormResult.success) return scormResult;

  // Check for AICC (course.ini or .au files)
  const aiccResult = await detectAicc(fileMap);
  if (aiccResult.success) return aiccResult;

  // Check for PDF
  const pdfResult = detectPdf(files);
  if (pdfResult.success) return pdfResult;

  // Check for HTML5 (index.html)
  const html5Result = detectHtml5(fileMap);
  if (html5Result.success) return html5Result;

  return {
    success: false,
    error: 'Unable to detect content format. No recognized manifest or entry point found.',
  };
}

/**
 * Detect cmi5 content from cmi5.xml.
 */
async function detectCmi5(fileMap: Map<string, PackageFile>): Promise<DetectionResult> {
  const cmi5File = fileMap.get('cmi5.xml');
  if (!cmi5File) return { success: false };

  try {
    const content = await cmi5File.getText();
    const manifest = parseCmi5Xml(content);
    return { success: true, manifest };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse cmi5.xml: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Detect xAPI content from tincan.xml.
 */
async function detectXApi(fileMap: Map<string, PackageFile>): Promise<DetectionResult> {
  const tincanFile = fileMap.get('tincan.xml');
  if (!tincanFile) return { success: false };

  try {
    const content = await tincanFile.getText();
    const manifest = parseTincanXml(content);
    return { success: true, manifest };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse tincan.xml: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Detect SCORM content from imsmanifest.xml.
 */
async function detectScorm(fileMap: Map<string, PackageFile>): Promise<DetectionResult> {
  const manifestFile = fileMap.get('imsmanifest.xml');
  if (!manifestFile) return { success: false };

  try {
    const content = await manifestFile.getText();
    const manifest = parseImsManifest(content);
    return { success: true, manifest };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse imsmanifest.xml: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Detect AICC content from course.ini or .au files.
 */
async function detectAicc(fileMap: Map<string, PackageFile>): Promise<DetectionResult> {
  // Check for course.ini
  const courseIni = fileMap.get('course.ini');
  if (courseIni) {
    try {
      const content = await courseIni.getText();
      const manifest = parseCourseIni(content, fileMap);
      return { success: true, manifest };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse course.ini: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Check for .au files
  for (const [path] of fileMap) {
    if (path.endsWith('.au')) {
      return {
        success: true,
        manifest: {
          format: 'aicc',
          entryPoint: path,
          title: 'AICC Content',
        },
      };
    }
  }

  return { success: false };
}

/**
 * Detect PDF content.
 */
function detectPdf(files: PackageFile[]): DetectionResult {
  const pdfFile = files.find((f) => f.path.toLowerCase().endsWith('.pdf'));

  if (pdfFile) {
    return {
      success: true,
      manifest: {
        format: 'pdf',
        entryPoint: pdfFile.path,
        title: extractFilename(pdfFile.path),
      },
    };
  }

  return { success: false };
}

/**
 * Detect HTML5 content from index.html.
 */
function detectHtml5(fileMap: Map<string, PackageFile>): DetectionResult {
  // Check for index.html at root or in common locations
  const indexPaths = ['index.html', 'index.htm', 'default.html', 'default.htm'];

  for (const path of indexPaths) {
    if (fileMap.has(path)) {
      return {
        success: true,
        manifest: {
          format: 'html5',
          entryPoint: path,
          title: 'HTML5 Content',
        },
      };
    }
  }

  return { success: false };
}

// =============================================================================
// XML PARSING HELPERS
// =============================================================================

/**
 * Parse cmi5.xml and extract manifest information.
 */
function parseCmi5Xml(content: string): ContentManifest {
  // Extract course title
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // Extract activity ID
  const activityIdMatch = content.match(/id\s*=\s*["']([^"']+)["']/i);
  const activityId = activityIdMatch ? activityIdMatch[1] : undefined;

  // Extract launch URL (entry point)
  const launchMatch =
    content.match(/<url[^>]*>([^<]+)<\/url>/i) || content.match(/url\s*=\s*["']([^"']+)["']/i);
  const entryPoint = launchMatch ? launchMatch[1].trim() : 'index.html';

  return {
    format: 'cmi5',
    entryPoint,
    title,
    activityId,
  };
}

/**
 * Parse tincan.xml and extract manifest information.
 */
function parseTincanXml(content: string): ContentManifest {
  // Extract activity name
  const nameMatch = content.match(/<name[^>]*>([^<]+)<\/name>/i);
  const title = nameMatch ? nameMatch[1].trim() : undefined;

  // Extract activity ID
  const activityIdMatch = content.match(/<activity[^>]*id\s*=\s*["']([^"']+)["']/i);
  const activityId = activityIdMatch ? activityIdMatch[1] : undefined;

  // Extract launch URL
  const launchMatch = content.match(/<launch[^>]*>([^<]+)<\/launch>/i);
  const entryPoint = launchMatch ? launchMatch[1].trim() : 'index.html';

  return {
    format: 'xapi',
    entryPoint,
    title,
    activityId,
  };
}

/**
 * Parse imsmanifest.xml and extract SCORM manifest information.
 */
function parseImsManifest(content: string): ContentManifest {
  // Detect SCORM version from schemaversion or namespace
  const version = detectScormVersion(content);
  const format: ContentFormat = version.startsWith('2004') ? 'scorm_2004' : 'scorm_12';

  // Extract title from organization
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // Extract entry point (launch href)
  const hrefMatch = content.match(/<resource[^>]*href\s*=\s*["']([^"']+)["']/i);
  const entryPoint = hrefMatch ? hrefMatch[1] : 'index.html';

  // Extract mastery score
  const masteryMatch =
    content.match(/<imsss:minNormalizedMeasure>([^<]+)<\/imsss:minNormalizedMeasure>/i) ||
    content.match(/<adlcp:masteryscore>([^<]+)<\/adlcp:masteryscore>/i);
  const masteryScore = masteryMatch ? parseFloat(masteryMatch[1]) : undefined;

  // Extract time limit
  const timeLimitMatch =
    content.match(
      /<imsss:attemptAbsoluteDurationLimit>([^<]+)<\/imsss:attemptAbsoluteDurationLimit>/i,
    ) || content.match(/<adlcp:maxtimeallowed>([^<]+)<\/adlcp:maxtimeallowed>/i);
  const maxTimeAllowed = timeLimitMatch ? timeLimitMatch[1] : undefined;

  return {
    format,
    entryPoint,
    title,
    version,
    scormVersion: version,
    masteryScore,
    maxTimeAllowed,
  };
}

/**
 * Detect SCORM version from manifest content.
 */
function detectScormVersion(content: string): string {
  // Check for SCORM 2004 namespaces/schema versions
  if (content.includes('2004 4th Edition') || content.includes('ADL SCORM 2004 4th')) {
    return '2004 4th Edition';
  }
  if (content.includes('2004 3rd Edition') || content.includes('ADL SCORM 2004 3rd')) {
    return '2004 3rd Edition';
  }
  if (content.includes('2004 2nd Edition') || content.includes('ADL SCORM 2004 2nd')) {
    return '2004 2nd Edition';
  }

  // Check schemaversion element
  const schemaMatch = content.match(/<schemaversion[^>]*>([^<]+)<\/schemaversion>/i);
  if (schemaMatch) {
    const schemaVersion = schemaMatch[1].trim().toLowerCase();
    if (schemaVersion.includes('2004')) {
      // Try to detect edition
      if (schemaVersion.includes('4')) return '2004 4th Edition';
      if (schemaVersion.includes('3')) return '2004 3rd Edition';
      if (schemaVersion.includes('2')) return '2004 2nd Edition';
      return '2004 3rd Edition'; // Default to 3rd edition
    }
    if (schemaVersion === '1.2' || schemaVersion.includes('1.2')) {
      return '1.2';
    }
  }

  // Check for SCORM 2004 namespaces
  if (content.includes('adlseq') || content.includes('imsss') || content.includes('adlnav')) {
    return '2004 3rd Edition'; // Default to 3rd edition for 2004 without explicit version
  }

  // Default to SCORM 1.2
  return '1.2';
}

/**
 * Get SCORM 2004 edition from version string.
 */
export function getScorm2004Edition(version: string): Scorm2004Edition {
  if (version.includes('4th')) return '4th';
  if (version.includes('2nd')) return '2nd';
  return '3rd'; // Default to 3rd edition
}

/**
 * Parse course.ini for AICC content.
 */
function parseCourseIni(content: string, fileMap: Map<string, PackageFile>): ContentManifest {
  // Parse INI-style content
  const lines = content.split('\n');
  let title = 'AICC Content';
  let entryPoint = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('course_title=')) {
      title = trimmed.substring('course_title='.length).trim();
    }
  }

  // Look for .au file reference in descriptor
  const descFile = fileMap.get('course.des');
  if (descFile) {
    // Try to find the AU entry point from descriptor
    for (const [path] of fileMap) {
      if (path.endsWith('.au')) {
        entryPoint = path;
        break;
      }
    }
  }

  // Fallback: find any HTML file as entry point
  if (!entryPoint) {
    for (const [path] of fileMap) {
      if (path.endsWith('.html') || path.endsWith('.htm')) {
        entryPoint = path;
        break;
      }
    }
  }

  return {
    format: 'aicc',
    entryPoint: entryPoint || 'index.html',
    title,
  };
}

/**
 * Extract filename without extension from path.
 */
function extractFilename(path: string): string {
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
}

// =============================================================================
// URL-BASED DETECTION
// =============================================================================

/**
 * Detect content format from a single file URL.
 * Used when content is a single file rather than a package.
 * @param url - URL of the content file
 * @returns Detected manifest
 */
export function detectContentFormatFromUrl(url: string): ContentManifest {
  const lowerUrl = url.toLowerCase();
  const filename = url.split('/').pop() ?? url;

  // PDF detection
  if (lowerUrl.endsWith('.pdf')) {
    return {
      format: 'pdf',
      entryPoint: url,
      title: extractFilename(filename),
    };
  }

  // HTML detection
  if (lowerUrl.endsWith('.html') || lowerUrl.endsWith('.htm')) {
    return {
      format: 'html5',
      entryPoint: url,
      title: extractFilename(filename),
    };
  }

  // Default to native
  return {
    format: 'native',
    entryPoint: url,
    title: extractFilename(filename),
  };
}

/**
 * Detect content format from Storage URL by fetching manifest files.
 * @param baseUrl - Base URL of the content package
 * @param fetchFn - Function to fetch files (for testing/mocking)
 * @returns Detection result
 */
export async function detectContentFormatFromStorage(
  baseUrl: string,
  fetchFn: (url: string) => Promise<string | null> = defaultFetch,
): Promise<DetectionResult> {
  // Normalize base URL
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Try cmi5.xml first
  const cmi5Content = await fetchFn(`${normalizedBase}/cmi5.xml`);
  if (cmi5Content) {
    try {
      const manifest = parseCmi5Xml(cmi5Content);
      manifest.entryPoint = `${normalizedBase}/${manifest.entryPoint}`;
      return { success: true, manifest };
    } catch {
      // Continue to next format
    }
  }

  // Try tincan.xml
  const tincanContent = await fetchFn(`${normalizedBase}/tincan.xml`);
  if (tincanContent) {
    try {
      const manifest = parseTincanXml(tincanContent);
      manifest.entryPoint = `${normalizedBase}/${manifest.entryPoint}`;
      return { success: true, manifest };
    } catch {
      // Continue to next format
    }
  }

  // Try imsmanifest.xml
  const imsContent = await fetchFn(`${normalizedBase}/imsmanifest.xml`);
  if (imsContent) {
    try {
      const manifest = parseImsManifest(imsContent);
      manifest.entryPoint = `${normalizedBase}/${manifest.entryPoint}`;
      return { success: true, manifest };
    } catch {
      // Continue to next format
    }
  }

  // Try course.ini (AICC)
  const courseIniContent = await fetchFn(`${normalizedBase}/course.ini`);
  if (courseIniContent) {
    // Simplified AICC detection for storage
    return {
      success: true,
      manifest: {
        format: 'aicc',
        entryPoint: `${normalizedBase}/index.html`,
        title: 'AICC Content',
      },
    };
  }

  // Try index.html (HTML5)
  const indexContent = await fetchFn(`${normalizedBase}/index.html`);
  if (indexContent) {
    return {
      success: true,
      manifest: {
        format: 'html5',
        entryPoint: `${normalizedBase}/index.html`,
        title: 'HTML5 Content',
      },
    };
  }

  return {
    success: false,
    error: 'Unable to detect content format from storage URL.',
  };
}

/**
 * Default fetch function for storage detection.
 */
async function defaultFetch(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}
