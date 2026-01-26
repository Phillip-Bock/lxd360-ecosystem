/**
 * xAPI/TinCan Manifest Parser
 *
 * Parses tincan.xml files for xAPI content packages.
 * Extracts activity ID, launch URL, and metadata.
 */

import type { CourseMetadata } from '../types';

/**
 * Raw TinCan manifest structure from xml2js
 */
interface RawTinCanManifest {
  tincan?: {
    activities?: Array<{
      activity?: Array<{
        $?: {
          id?: string;
          type?: string;
        };
        name?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
        description?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
        launch?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
      }>;
    }>;
  };
}

/**
 * Raw cmi5 manifest structure from xml2js
 */
interface RawCmi5Manifest {
  courseStructure?: {
    course?: Array<{
      $?: {
        id?: string;
      };
      title?: Array<{
        langstring?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
      }>;
      description?: Array<{
        langstring?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
      }>;
    }>;
    au?: Array<{
      $?: {
        id?: string;
        launchMethod?: string;
        moveOn?: string;
      };
      title?: Array<{
        langstring?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
      }>;
      description?: Array<{
        langstring?: Array<{
          _?: string;
          $?: { lang?: string };
        }>;
      }>;
      url?: string[];
    }>;
    block?: Array<{
      au?: Array<{
        $?: {
          id?: string;
        };
        title?: Array<{
          langstring?: Array<{
            _?: string;
          }>;
        }>;
        url?: string[];
      }>;
    }>;
  };
}

/**
 * Parse TinCan (xAPI) manifest XML into structured metadata
 */
export async function parseXapiManifest(
  manifestContent: string,
  parseXml: (xml: string) => Promise<RawTinCanManifest>,
): Promise<CourseMetadata> {
  const result = await parseXml(manifestContent);
  const tincan = result.tincan;

  if (!tincan) {
    throw new Error('Invalid TinCan manifest: missing tincan element');
  }

  const activities = tincan.activities?.[0]?.activity || [];
  const firstActivity = activities[0];

  if (!firstActivity) {
    throw new Error('Invalid TinCan manifest: no activities found');
  }

  // Extract activity ID
  const activityId = firstActivity.$?.id || '';

  // Extract title from name element
  let title = 'Untitled xAPI Course';
  if (firstActivity.name?.[0]) {
    const nameObj = firstActivity.name[0];
    title = typeof nameObj === 'string' ? nameObj : nameObj._ || title;
  }

  // Extract description
  let description = '';
  if (firstActivity.description?.[0]) {
    const descObj = firstActivity.description[0];
    description = typeof descObj === 'string' ? descObj : descObj._ || '';
  }

  // Extract launch URL
  let launchUrl = 'index.html';
  if (firstActivity.launch?.[0]) {
    const launchObj = firstActivity.launch[0];
    launchUrl = typeof launchObj === 'string' ? launchObj : launchObj._ || launchUrl;
  }

  // Extract language from name attribute
  const language = firstActivity.name?.[0]?.$?.lang;

  return {
    title,
    description,
    entryPoint: launchUrl,
    activityId,
    launchUrl,
    language,
  };
}

/**
 * Parse cmi5 manifest XML into structured metadata
 */
export async function parseCmi5Manifest(
  manifestContent: string,
  parseXml: (xml: string) => Promise<RawCmi5Manifest>,
): Promise<CourseMetadata> {
  const result = await parseXml(manifestContent);
  const courseStructure = result.courseStructure;

  if (!courseStructure) {
    throw new Error('Invalid cmi5 manifest: missing courseStructure element');
  }

  const course = courseStructure.course?.[0];
  const aus = courseStructure.au || [];
  const blocks = courseStructure.block || [];

  // Get title from course or first AU
  let title = 'Untitled cmi5 Course';
  if (course?.title?.[0]?.langstring?.[0]) {
    const langstring = course.title[0].langstring[0];
    title = typeof langstring === 'string' ? langstring : langstring._ || title;
  }

  // Get description
  let description = '';
  if (course?.description?.[0]?.langstring?.[0]) {
    const langstring = course.description[0].langstring[0];
    description = typeof langstring === 'string' ? langstring : langstring._ || '';
  }

  // Get activity ID from course
  const activityId = course?.$?.id || '';

  // Get launch URL from first AU
  let launchUrl = 'index.html';
  const firstAu = aus[0] || blocks[0]?.au?.[0];
  if (firstAu?.url?.[0]) {
    launchUrl = firstAu.url[0];
  }

  // If no title from course, try first AU
  if (title === 'Untitled cmi5 Course' && firstAu?.title?.[0]?.langstring?.[0]) {
    const langstring = firstAu.title[0].langstring[0];
    title = typeof langstring === 'string' ? langstring : langstring._ || title;
  }

  return {
    title,
    description,
    entryPoint: launchUrl,
    activityId,
    launchUrl,
  };
}

/**
 * Extract activity ID from tincan.xml using regex (quick extraction)
 */
export function extractActivityId(manifestContent: string): string | undefined {
  const match = manifestContent.match(/activity\s+id=["']([^"']+)["']/i);
  return match?.[1];
}

/**
 * Extract title from tincan.xml using regex (quick extraction)
 */
export function extractXapiTitle(manifestContent: string): string {
  // Try name element first
  const nameMatch = manifestContent.match(/<name[^>]*>([^<]+)<\/name>/i);
  if (nameMatch) {
    return nameMatch[1].trim();
  }

  // Try langstring in name
  const langstringMatch = manifestContent.match(
    /<name[^>]*>[\s\S]*?<langstring[^>]*>([^<]+)<\/langstring>/i,
  );
  if (langstringMatch) {
    return langstringMatch[1].trim();
  }

  return 'Untitled xAPI Course';
}

/**
 * Extract launch URL from tincan.xml using regex (quick extraction)
 */
export function extractXapiLaunchUrl(manifestContent: string): string {
  const match = manifestContent.match(/<launch[^>]*>([^<]+)<\/launch>/i);
  return match?.[1]?.trim() || 'index.html';
}
