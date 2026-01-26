/**
 * Format Detector for Course Packages
 *
 * Detects the content format of course packages by examining their contents.
 * Supports SCORM 1.2, SCORM 2004, xAPI, cmi5, AICC, HTML5, and PDF formats.
 */

import type JSZip from 'jszip';
import { detectScormVersion, extractTitleFromManifest } from './parsers';
import { extractActivityId, extractXapiLaunchUrl, extractXapiTitle } from './parsers/xapi-manifest';
import type { ContentFormat, CourseMetadata, FormatDetectionResult } from './types';

/**
 * Detect content format from a JSZip instance
 */
export async function detectFormat(zip: JSZip): Promise<FormatDetectionResult> {
  const fileNames = Object.keys(zip.files);
  const fileNamesLower = fileNames.map((f) => f.toLowerCase());

  // Check for SCORM (imsmanifest.xml)
  const hasImsManifest =
    fileNamesLower.includes('imsmanifest.xml') ||
    fileNames.some((f) => f.toLowerCase().endsWith('/imsmanifest.xml'));

  if (hasImsManifest) {
    const manifestFile = fileNames.find(
      (f) => f.toLowerCase() === 'imsmanifest.xml' || f.toLowerCase().endsWith('/imsmanifest.xml'),
    );

    if (manifestFile) {
      const content = await zip.files[manifestFile].async('text');
      const version = detectScormVersion(content);

      const format: ContentFormat =
        version === '1.2' || version === 'unknown' ? 'scorm_1.2' : 'scorm_2004';

      return {
        format,
        version,
        manifestPath: manifestFile,
      };
    }
  }

  // Check for xAPI (tincan.xml)
  const hasTincan =
    fileNamesLower.includes('tincan.xml') ||
    fileNames.some((f) => f.toLowerCase().endsWith('/tincan.xml'));

  if (hasTincan) {
    const manifestFile = fileNames.find(
      (f) => f.toLowerCase() === 'tincan.xml' || f.toLowerCase().endsWith('/tincan.xml'),
    );

    return {
      format: 'xapi',
      manifestPath: manifestFile,
    };
  }

  // Check for cmi5 (cmi5.xml)
  const hasCmi5 =
    fileNamesLower.includes('cmi5.xml') ||
    fileNames.some((f) => f.toLowerCase().endsWith('/cmi5.xml'));

  if (hasCmi5) {
    const manifestFile = fileNames.find(
      (f) => f.toLowerCase() === 'cmi5.xml' || f.toLowerCase().endsWith('/cmi5.xml'),
    );

    return {
      format: 'cmi5',
      manifestPath: manifestFile,
    };
  }

  // Check for AICC (.au files or course.ini)
  const hasAicc =
    fileNames.some((f) => f.toLowerCase().endsWith('.au')) ||
    fileNamesLower.includes('course.ini') ||
    fileNames.some((f) => f.toLowerCase().endsWith('/course.ini'));

  if (hasAicc) {
    return {
      format: 'aicc',
    };
  }

  // Check for HTML5 (index.html without other manifests)
  const hasIndexHtml =
    fileNamesLower.includes('index.html') ||
    fileNames.some((f) => f.toLowerCase().endsWith('/index.html'));

  if (hasIndexHtml) {
    const indexFile = fileNames.find(
      (f) => f.toLowerCase() === 'index.html' || f.toLowerCase().endsWith('/index.html'),
    );

    return {
      format: 'html5',
      entryPoint: indexFile,
    };
  }

  return {
    format: 'unknown',
  };
}

/**
 * Detect format from a file path (for PDF and other single files)
 */
export function detectFormatFromFilename(filename: string): FormatDetectionResult {
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.endsWith('.pdf')) {
    return {
      format: 'pdf',
      entryPoint: filename,
    };
  }

  if (lowerFilename.endsWith('.zip')) {
    return {
      format: 'unknown', // Will be determined by examining zip contents
    };
  }

  return {
    format: 'unknown',
  };
}

/**
 * Parse manifest and extract metadata based on detected format
 * Uses regex-based extraction for simplicity and reliability
 */
export async function parseManifest(
  zip: JSZip,
  format: ContentFormat,
  manifestPath?: string,
): Promise<CourseMetadata> {
  switch (format) {
    case 'scorm_1.2':
    case 'scorm_2004': {
      if (!manifestPath) {
        throw new Error('Manifest path required for SCORM packages');
      }
      const content = await zip.files[manifestPath].async('text');

      // Use regex extraction for simplicity
      const title = extractTitleFromManifest(content);
      const entryPointMatch = content.match(/href=["']([^"']+\.html?)["']/i);
      const versionMatch = content.match(/<schemaversion>([^<]+)<\/schemaversion>/i);
      const descMatch = content.match(
        /<description>[\s\S]*?<langstring[^>]*>([^<]+)<\/langstring>/i,
      );

      return {
        title,
        description: descMatch?.[1]?.trim() || '',
        entryPoint: entryPointMatch?.[1] || 'index.html',
        version: versionMatch?.[1]?.trim(),
      };
    }

    case 'xapi': {
      if (!manifestPath) {
        throw new Error('Manifest path required for xAPI packages');
      }
      const content = await zip.files[manifestPath].async('text');

      return {
        title: extractXapiTitle(content),
        description: '',
        entryPoint: extractXapiLaunchUrl(content),
        activityId: extractActivityId(content),
      };
    }

    case 'cmi5': {
      if (!manifestPath) {
        throw new Error('Manifest path required for cmi5 packages');
      }
      const content = await zip.files[manifestPath].async('text');

      // Regex extraction for cmi5
      const titleMatch = content.match(/<langstring[^>]*>([^<]+)<\/langstring>/i);
      const urlMatch = content.match(/<url>([^<]+)<\/url>/i);
      const idMatch = content.match(/course\s+id=["']([^"']+)["']/i);

      return {
        title: titleMatch?.[1]?.trim() || 'Untitled cmi5 Course',
        description: '',
        entryPoint: urlMatch?.[1]?.trim() || 'index.html',
        activityId: idMatch?.[1],
      };
    }

    case 'aicc': {
      // AICC parsing - look for course.ini or .au files
      const fileNames = Object.keys(zip.files);
      const courseIni = fileNames.find(
        (f) => f.toLowerCase() === 'course.ini' || f.toLowerCase().endsWith('/course.ini'),
      );

      let title = 'Untitled AICC Course';
      let entryPoint = 'index.html';

      if (courseIni) {
        const content = await zip.files[courseIni].async('text');
        const titleMatch = content.match(/Course_Title\s*=\s*(.+)/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }

      // Find entry point from .au file
      const auFile = fileNames.find((f) => f.toLowerCase().endsWith('.au'));
      if (auFile) {
        const auContent = await zip.files[auFile].async('text');
        const fileNameMatch = auContent.match(/File_Name\s*=\s*(.+)/i);
        if (fileNameMatch) {
          entryPoint = fileNameMatch[1].trim();
        }
      }

      return {
        title,
        description: '',
        entryPoint,
      };
    }

    case 'html5': {
      // For HTML5, find index.html
      const fileNames = Object.keys(zip.files);
      const indexFile = fileNames.find(
        (f) => f.toLowerCase() === 'index.html' || f.toLowerCase().endsWith('/index.html'),
      );

      let title = 'Untitled HTML5 Course';
      const entryPoint = indexFile || 'index.html';

      // Try to extract title from index.html
      if (indexFile) {
        const content = await zip.files[indexFile].async('text');
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }

      return {
        title,
        description: '',
        entryPoint,
      };
    }

    default:
      return {
        title: 'Untitled Course',
        description: '',
        entryPoint: 'index.html',
      };
  }
}

/**
 * Generate a clean title from filename
 */
export function generateTitleFromFilename(filename: string): string {
  // Remove extension
  let title = filename.replace(/\.(zip|pdf)$/i, '');

  // Remove common suffixes like -scorm12-ABC123, -xapi-ABC123, -raw-ABC123
  title = title.replace(/-(?:scorm(?:12|2004)?|xapi|cmi5|aicc|raw)-[a-zA-Z0-9]+$/i, '');

  // Replace hyphens and underscores with spaces
  title = title.replace(/[-_]/g, ' ');

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, (char) => char.toUpperCase());

  return title.trim() || 'Untitled Course';
}
