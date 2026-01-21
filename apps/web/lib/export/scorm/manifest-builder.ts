import type {
  ContentItem,
  CourseMetadata,
  ManifestMetadata,
  Organization,
  OrganizationItem,
  Resource,
  SCORMManifest,
  SCORMSettings,
  SCORMVersion,
} from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCORM_SCHEMAS = {
  '1.2': {
    schema: 'ADL SCORM',
    schemaversion: '1.2',
    namespace: 'http://www.adlnet.org/xsd/adlcp_rootv1p2',
    imsNamespace: 'http://www.imsproject.org/xsd/imscp_rootv1p1p2',
  },
  '2004-3rd': {
    schema: 'ADL SCORM CAM',
    schemaversion: '2004 3rd Edition',
    namespace: 'http://www.adlnet.org/xsd/adlcp_v1p3',
    imsNamespace: 'http://www.imsglobal.org/xsd/imscp_v1p1',
    seqNamespace: 'http://www.imsglobal.org/xsd/imsss',
  },
  '2004-4th': {
    schema: 'ADL SCORM CAM',
    schemaversion: '2004 4th Edition',
    namespace: 'http://www.adlnet.org/xsd/adlcp_v1p3',
    imsNamespace: 'http://www.imsglobal.org/xsd/imscp_v1p1',
    seqNamespace: 'http://www.imsglobal.org/xsd/imsss',
  },
} as const;

// ============================================================================
// BUILDER CLASS
// ============================================================================

/**
 * SCORM manifest builder
 */
export class ManifestBuilder {
  private version: SCORMVersion;
  private schema: (typeof SCORM_SCHEMAS)[SCORMVersion];

  constructor(version: SCORMVersion = '1.2') {
    this.version = version;
    this.schema = SCORM_SCHEMAS[version];
  }

  /**
   * Get the sequencing namespace for SCORM 2004
   */
  private getSeqNamespace(): string {
    if (this.version === '2004-3rd' || this.version === '2004-4th') {
      return SCORM_SCHEMAS[this.version].seqNamespace;
    }
    return '';
  }

  /**
   * Build a complete manifest from course data
   */
  buildManifest(courseMetadata: CourseMetadata, contentItems: ContentItem[]): SCORMManifest {
    const identifier = this.sanitizeIdentifier(courseMetadata.identifier);

    return {
      identifier,
      version: courseMetadata.version,
      metadata: this.buildMetadata(courseMetadata),
      organizations: [this.buildOrganization(courseMetadata, contentItems)],
      resources: this.buildResources(contentItems),
    };
  }

  /**
   * Generate XML string from manifest object
   */
  generateXML(manifest: SCORMManifest): string {
    const xml: string[] = [];

    // XML declaration
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');

    // Root manifest element with namespaces
    xml.push(this.buildManifestOpenTag(manifest.identifier));

    // Metadata section
    xml.push(this.buildMetadataXML(manifest.metadata));

    // Organizations section
    xml.push(this.buildOrganizationsXML(manifest.organizations));

    // Resources section
    xml.push(this.buildResourcesXML(manifest.resources));

    // Close manifest
    xml.push('</manifest>');

    return xml.join('\n');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private buildManifestOpenTag(identifier: string): string {
    if (this.version === '1.2') {
      return `<manifest identifier="${identifier}"
  xmlns="${this.schema.imsNamespace}"
  xmlns:adlcp="${this.schema.namespace}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="${this.schema.imsNamespace} imscp_rootv1p1p2.xsd
    ${this.schema.namespace} adlcp_rootv1p2.xsd">`;
    }

    // SCORM 2004
    return `<manifest identifier="${identifier}"
  xmlns="${this.schema.imsNamespace}"
  xmlns:adlcp="${this.schema.namespace}"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="${this.getSeqNamespace()}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="${this.schema.imsNamespace} imscp_v1p1.xsd
    ${this.schema.namespace} adlcp_v1p3.xsd
    http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
    http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
    ${this.getSeqNamespace()} imsss_v1p0.xsd">`;
  }

  private buildMetadata(courseMetadata: CourseMetadata): ManifestMetadata {
    return {
      schema: this.schema.schema,
      schemaversion: this.schema.schemaversion,
      title: courseMetadata.title,
      description: courseMetadata.description,
      keywords: courseMetadata.keywords,
      language: courseMetadata.language,
      version: courseMetadata.version,
      duration: courseMetadata.duration,
    };
  }

  private buildMetadataXML(metadata: ManifestMetadata): string {
    const xml: string[] = [];

    xml.push('  <metadata>');
    xml.push(`    <schema>${this.escapeXML(metadata.schema)}</schema>`);
    xml.push(`    <schemaversion>${this.escapeXML(metadata.schemaversion)}</schemaversion>`);

    // LOM metadata
    xml.push('    <lom xmlns="http://ltsc.ieee.org/xsd/LOM">');
    xml.push('      <general>');
    xml.push('        <title>');
    xml.push(
      `          <string language="${metadata.language || 'en'}">${this.escapeXML(metadata.title)}</string>`,
    );
    xml.push('        </title>');

    if (metadata.description) {
      xml.push('        <description>');
      xml.push(
        `          <string language="${metadata.language || 'en'}">${this.escapeXML(metadata.description)}</string>`,
      );
      xml.push('        </description>');
    }

    if (metadata.keywords && metadata.keywords.length > 0) {
      for (const keyword of metadata.keywords) {
        xml.push('        <keyword>');
        xml.push(
          `          <string language="${metadata.language || 'en'}">${this.escapeXML(keyword)}</string>`,
        );
        xml.push('        </keyword>');
      }
    }

    if (metadata.language) {
      xml.push(`        <language>${this.escapeXML(metadata.language)}</language>`);
    }

    xml.push('      </general>');

    if (metadata.duration) {
      xml.push('      <technical>');
      xml.push(`        <duration>${this.escapeXML(metadata.duration)}</duration>`);
      xml.push('      </technical>');
    }

    xml.push('    </lom>');
    xml.push('  </metadata>');

    return xml.join('\n');
  }

  private buildOrganization(
    courseMetadata: CourseMetadata,
    contentItems: ContentItem[],
  ): Organization {
    const identifier = `${this.sanitizeIdentifier(courseMetadata.identifier)}_org`;

    // Build hierarchy from flat content items
    const rootItems = contentItems.filter((item) => !item.parentId);
    const itemsByParent = new Map<string, ContentItem[]>();

    for (const item of contentItems) {
      if (item.parentId) {
        const siblings = itemsByParent.get(item.parentId) ?? [];
        siblings.push(item);
        itemsByParent.set(item.parentId, siblings);
      }
    }

    const buildItem = (item: ContentItem): OrganizationItem => {
      const children = itemsByParent.get(item.id) ?? [];
      const hasChildren = children.length > 0;

      const orgItem: OrganizationItem = {
        identifier: this.sanitizeIdentifier(item.id),
        title: item.title,
      };

      // Only leaf nodes reference resources (are SCOs)
      if (!hasChildren) {
        orgItem.identifierref = `RES_${this.sanitizeIdentifier(item.id)}`;
      }

      // Add mastery score for assessments
      if (item.assessmentSettings && this.version !== '1.2') {
        orgItem.masteryScore = item.assessmentSettings.passingScore / 100;
      }

      // Recursively build children
      if (hasChildren) {
        orgItem.items = children.sort((a, b) => a.order - b.order).map(buildItem);
      }

      return orgItem;
    };

    return {
      identifier,
      title: courseMetadata.title,
      items: rootItems.sort((a, b) => a.order - b.order).map(buildItem),
    };
  }

  private buildOrganizationsXML(organizations: Organization[]): string {
    const xml: string[] = [];

    xml.push(`  <organizations default="${organizations[0].identifier}">`);

    for (const org of organizations) {
      xml.push(`    <organization identifier="${org.identifier}">`);
      xml.push(`      <title>${this.escapeXML(org.title)}</title>`);

      for (const item of org.items) {
        xml.push(this.buildItemXML(item, 3));
      }

      xml.push('    </organization>');
    }

    xml.push('  </organizations>');

    return xml.join('\n');
  }

  private buildItemXML(item: OrganizationItem, indent: number): string {
    const padding = '  '.repeat(indent);
    const xml: string[] = [];

    const identifierref = item.identifierref ? ` identifierref="${item.identifierref}"` : '';
    xml.push(`${padding}<item identifier="${item.identifier}"${identifierref}>`);
    xml.push(`${padding}  <title>${this.escapeXML(item.title)}</title>`);

    // SCORM 2004 mastery score
    if (item.masteryScore !== undefined && this.version !== '1.2') {
      xml.push(`${padding}  <imsss:sequencing>`);
      xml.push(`${padding}    <imsss:objectives>`);
      xml.push(
        `${padding}      <imsss:primaryObjective objectiveID="PRIMARYOBJ" satisfiedByMeasure="true">`,
      );
      xml.push(
        `${padding}        <imsss:minNormalizedMeasure>${item.masteryScore}</imsss:minNormalizedMeasure>`,
      );
      xml.push(`${padding}      </imsss:primaryObjective>`);
      xml.push(`${padding}    </imsss:objectives>`);
      xml.push(`${padding}  </imsss:sequencing>`);
    }

    // Child items
    if (item.items && item.items.length > 0) {
      for (const child of item.items) {
        xml.push(this.buildItemXML(child, indent + 1));
      }
    }

    xml.push(`${padding}</item>`);

    return xml.join('\n');
  }

  private buildResources(contentItems: ContentItem[]): Resource[] {
    const resources: Resource[] = [];

    // Only create resources for leaf items (SCOs)
    const leafItems = contentItems.filter((item) => {
      const hasChildren = contentItems.some((other) => other.parentId === item.id);
      return !hasChildren;
    });

    for (const item of leafItems) {
      const resourceId = `RES_${this.sanitizeIdentifier(item.id)}`;

      const files = item.resources.map((r) => ({
        href: r.url,
        size: r.size,
      }));

      // Add the launch page
      files.unshift({
        href: `content/${this.sanitizeIdentifier(item.id)}/index.html`,
        size: undefined,
      });

      resources.push({
        identifier: resourceId,
        type: 'webcontent',
        scormType: 'sco',
        href: `content/${this.sanitizeIdentifier(item.id)}/index.html`,
        files,
      });
    }

    return resources;
  }

  private buildResourcesXML(resources: Resource[]): string {
    const xml: string[] = [];

    xml.push('  <resources>');

    for (const resource of resources) {
      const scormType =
        this.version === '1.2'
          ? `adlcp:scormtype="${resource.scormType}"`
          : `adlcp:scormType="${resource.scormType}"`;

      xml.push(
        `    <resource identifier="${resource.identifier}" type="${resource.type}" ${scormType} href="${resource.href}">`,
      );

      for (const file of resource.files) {
        xml.push(`      <file href="${this.escapeXML(file.href)}" />`);
      }

      if (resource.dependencies) {
        for (const dep of resource.dependencies) {
          xml.push(`      <dependency identifierref="${dep}" />`);
        }
      }

      xml.push('    </resource>');
    }

    xml.push('  </resources>');

    return xml.join('\n');
  }

  private sanitizeIdentifier(id: string): string {
    // SCORM identifiers must start with letter and contain only alphanumerics, underscores, hyphens
    return id.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^([^a-zA-Z])/, 'ID_$1');
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a manifest builder for the specified SCORM version
 */
export function createManifestBuilder(version: SCORMVersion = '1.2'): ManifestBuilder {
  return new ManifestBuilder(version);
}

/**
 * Generate imsmanifest.xml content
 */
export function generateManifestXML(
  courseMetadata: CourseMetadata,
  contentItems: ContentItem[],
  settings: SCORMSettings,
): string {
  const builder = new ManifestBuilder(settings.version);
  const manifest = builder.buildManifest(courseMetadata, contentItems);
  return builder.generateXML(manifest);
}
