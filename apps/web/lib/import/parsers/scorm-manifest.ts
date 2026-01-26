/**
 * SCORM Manifest Parser
 *
 * Parses imsmanifest.xml files for SCORM 1.2 and SCORM 2004 packages.
 * Extracts course metadata, organization structure, and launch URL.
 */

import type {
  CourseMetadata,
  ManifestResource,
  OrganizationItem,
  OrganizationStructure,
  ScormVersion,
} from '../types';

/**
 * Raw manifest structure from xml2js
 */
interface RawManifest {
  manifest?: {
    $?: {
      version?: string;
      identifier?: string;
    };
    metadata?: Array<{
      schemaversion?: string[];
      schema?: string[];
      lom?: Array<{
        general?: Array<{
          title?: Array<{
            langstring?: Array<{ _: string; $?: { language?: string } }>;
            string?: Array<{ _: string; $?: { language?: string } }>;
          }>;
          description?: Array<{
            langstring?: Array<{ _: string }>;
            string?: Array<{ _: string }>;
          }>;
          language?: string[];
        }>;
        educational?: Array<{
          typicallearningtime?: Array<{
            datetime?: string[];
          }>;
        }>;
      }>;
    }>;
    organizations?: Array<{
      default?: string;
      organization?: Array<{
        $?: { identifier?: string };
        title?: string[];
        item?: RawItem[];
      }>;
    }>;
    resources?: Array<{
      resource?: Array<{
        $?: {
          identifier?: string;
          type?: string;
          href?: string;
          'adlcp:scormtype'?: string;
          'adlcp:scormType'?: string;
        };
        file?: Array<{ $?: { href?: string } }>;
      }>;
    }>;
  };
}

interface RawItem {
  $?: { identifier?: string; identifierref?: string };
  title?: string[];
  item?: RawItem[];
}

/**
 * Detect SCORM version from manifest content
 */
export function detectScormVersion(manifestContent: string): ScormVersion {
  // Check for SCORM 2004 indicators
  if (manifestContent.includes('2004 4th Edition')) {
    return '2004 4th Edition';
  }
  if (manifestContent.includes('2004 3rd Edition')) {
    return '2004 3rd Edition';
  }
  if (manifestContent.includes('2004 2nd Edition')) {
    return '2004 2nd Edition';
  }
  if (
    manifestContent.includes('adlseq:') ||
    manifestContent.includes('imsss:') ||
    manifestContent.includes('ADL SCORM 2004')
  ) {
    return '2004 3rd Edition';
  }

  // Check for SCORM 1.2 indicators
  if (
    manifestContent.includes('ADL SCORM 1.2') ||
    manifestContent.includes('adlcp:prerequisites') ||
    manifestContent.includes('schemaversion>1.2')
  ) {
    return '1.2';
  }

  // Default to 1.2 if unclear
  return 'unknown';
}

/**
 * Parse SCORM manifest XML into structured metadata
 */
export async function parseScormManifest(
  manifestContent: string,
  parseXml: (xml: string) => Promise<RawManifest>,
): Promise<CourseMetadata> {
  const result = await parseXml(manifestContent);
  const manifest = result.manifest;

  if (!manifest) {
    throw new Error('Invalid SCORM manifest: missing manifest element');
  }

  // Extract metadata
  const metadata = manifest.metadata?.[0];
  const lom = metadata?.lom?.[0];
  const general = lom?.general?.[0];

  // Get title
  let title = 'Untitled Course';
  if (general?.title?.[0]) {
    const titleObj = general.title[0];
    if (titleObj.langstring?.[0]) {
      title =
        typeof titleObj.langstring[0] === 'string'
          ? titleObj.langstring[0]
          : titleObj.langstring[0]._ || title;
    } else if (titleObj.string?.[0]) {
      title =
        typeof titleObj.string[0] === 'string' ? titleObj.string[0] : titleObj.string[0]._ || title;
    }
  }

  // Get description
  let description = '';
  if (general?.description?.[0]) {
    const descObj = general.description[0];
    if (descObj.langstring?.[0]) {
      description =
        typeof descObj.langstring[0] === 'string' ? descObj.langstring[0] : descObj.langstring[0]._;
    } else if (descObj.string?.[0]) {
      description = typeof descObj.string[0] === 'string' ? descObj.string[0] : descObj.string[0]._;
    }
  }

  // Get language
  const language = general?.language?.[0];

  // Get duration from typical learning time
  let duration: number | undefined;
  const typicalTime = lom?.educational?.[0]?.typicallearningtime?.[0]?.datetime?.[0];
  if (typicalTime) {
    duration = parseDuration(typicalTime);
  }

  // Get version from schema
  const version = metadata?.schemaversion?.[0] || manifest.$?.version;

  // Parse organizations
  const orgs = manifest.organizations?.[0];
  const defaultOrgId = orgs?.default;
  const orgList = orgs?.organization || [];

  let organization: OrganizationStructure | undefined;
  let entryPoint = 'index.html';

  // Find the default or first organization
  const defaultOrg = orgList.find((o) => o.$?.identifier === defaultOrgId) || orgList[0];

  if (defaultOrg) {
    const orgTitle = defaultOrg.title?.[0] || 'Main Organization';
    const items = parseItems(defaultOrg.item || []);

    organization = {
      identifier: defaultOrg.$?.identifier || 'default',
      title: orgTitle,
      items,
    };

    // Use organization title if no metadata title
    if (title === 'Untitled Course' && orgTitle !== 'Main Organization') {
      title = orgTitle;
    }
  }

  // Parse resources to find entry point
  const resources = manifest.resources?.[0]?.resource || [];
  const resourceMap = parseResources(resources);

  // Find the launch resource (first SCO or Asset with href)
  if (organization?.items?.[0]) {
    const firstItemRef = findFirstIdentifierRef(organization.items);
    if (firstItemRef && resourceMap[firstItemRef]) {
      entryPoint = resourceMap[firstItemRef].href || entryPoint;
    }
  }

  // Fallback: find first resource with href
  if (entryPoint === 'index.html') {
    for (const resource of resources) {
      if (resource.$?.href) {
        entryPoint = resource.$.href;
        break;
      }
    }
  }

  return {
    title,
    description,
    entryPoint,
    version,
    duration,
    language,
    organization,
  };
}

/**
 * Parse organization items recursively
 */
function parseItems(rawItems: RawItem[]): OrganizationItem[] {
  return rawItems.map((item) => ({
    identifier: item.$?.identifier || '',
    identifierRef: item.$?.identifierref,
    title: item.title?.[0] || 'Untitled',
    items: item.item ? parseItems(item.item) : undefined,
  }));
}

/**
 * Parse resources into a map
 */
function parseResources(
  rawResources: Array<{
    $?: {
      identifier?: string;
      type?: string;
      href?: string;
      'adlcp:scormtype'?: string;
      'adlcp:scormType'?: string;
    };
    file?: Array<{ $?: { href?: string } }>;
  }>,
): Record<string, ManifestResource> {
  const map: Record<string, ManifestResource> = {};

  for (const res of rawResources) {
    const identifier = res.$?.identifier;
    if (!identifier) continue;

    map[identifier] = {
      identifier,
      type: res.$?.type || 'webcontent',
      href: res.$?.href,
      scormType: res.$?.['adlcp:scormtype'] || res.$?.['adlcp:scormType'],
      files: res.file?.map((f) => f.$?.href).filter(Boolean) as string[],
    };
  }

  return map;
}

/**
 * Find first identifierref in organization items
 */
function findFirstIdentifierRef(items: OrganizationItem[]): string | undefined {
  for (const item of items) {
    if (item.identifierRef) {
      return item.identifierRef;
    }
    if (item.items) {
      const found = findFirstIdentifierRef(item.items);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Parse ISO 8601 duration to minutes
 */
function parseDuration(duration: string): number | undefined {
  // Handle PT format (e.g., PT1H30M, PT45M, PT2H)
  const ptMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (ptMatch) {
    const hours = Number.parseInt(ptMatch[1] || '0', 10);
    const minutes = Number.parseInt(ptMatch[2] || '0', 10);
    const seconds = Number.parseInt(ptMatch[3] || '0', 10);
    return hours * 60 + minutes + Math.ceil(seconds / 60);
  }

  // Handle simple minute format
  const minMatch = duration.match(/(\d+)\s*min/i);
  if (minMatch) {
    return Number.parseInt(minMatch[1], 10);
  }

  return undefined;
}

/**
 * Extract title from manifest when full parsing isn't needed
 */
export function extractTitleFromManifest(manifestContent: string): string {
  // Try to extract title using regex for quick parsing
  const titleMatch = manifestContent.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Try langstring
  const langstringMatch = manifestContent.match(/<langstring[^>]*>([^<]+)<\/langstring>/i);
  if (langstringMatch) {
    return langstringMatch[1].trim();
  }

  // Try organization title
  const orgTitleMatch = manifestContent.match(
    /<organization[^>]*>[\s\S]*?<title>([^<]+)<\/title>/i,
  );
  if (orgTitleMatch) {
    return orgTitleMatch[1].trim();
  }

  return 'Untitled Course';
}
