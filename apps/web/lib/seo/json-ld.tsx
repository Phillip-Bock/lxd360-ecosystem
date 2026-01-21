/**
 * =============================================================================
 * LXP360-SaaS | JSON-LD Structured Data
 * =============================================================================
 *
 * @fileoverview Structured data helpers for rich search results
 *
 * @description
 * Generates JSON-LD structured data for enhanced search engine visibility:
 * - Organization schema
 * - Course schema (for learning content)
 * - BreadcrumbList schema
 * - WebPage schema
 * - FAQ schema
 *
 * @see https://schema.org
 * @see https://developers.google.com/search/docs/appearance/structured-data
 *
 * =============================================================================
 */

import type * as React from 'react';
import { SITE_NAME, SITE_URL } from './metadata';

// ============================================================================
// Types
// ============================================================================

export interface OrganizationSchemaOptions {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  contactEmail?: string;
  socialProfiles?: string[];
  sameAs?: string[];
}

export interface CourseSchemaOptions {
  name: string;
  description: string;
  url: string;
  image?: string;
  provider?: {
    name: string;
    url: string;
  };
  instructor?: {
    name: string;
    url?: string;
    image?: string;
  };
  duration?: string; // ISO 8601 duration format (e.g., 'PT4H30M')
  educationalLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  courseLanguage?: string;
  price?: {
    amount: number;
    currency: string;
  };
  rating?: {
    value: number;
    count: number;
  };
  datePublished?: string;
  dateModified?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface WebPageSchemaOptions {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export interface ArticleSchemaOptions {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
  };
}

// ============================================================================
// Schema Generators
// ============================================================================

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(options: OrganizationSchemaOptions = {}): object {
  const {
    name = SITE_NAME,
    url = SITE_URL,
    logo = `${SITE_URL}/logo.png`,
    description = 'Neuroscience-informed learning experience platform',
    contactEmail = 'support@lxd360.com',
    sameAs = [],
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    description,
    contactPoint: {
      '@type': 'ContactPoint',
      email: contactEmail,
      contactType: 'customer service',
    },
    sameAs,
  };
}

/**
 * Generate Course schema
 */
export function generateCourseSchema(options: CourseSchemaOptions): object {
  const {
    name,
    description,
    url,
    image,
    provider = { name: SITE_NAME, url: SITE_URL },
    instructor,
    duration,
    educationalLevel,
    courseLanguage = 'en',
    price,
    rating,
    datePublished,
    dateModified,
  } = options;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      url: provider.url,
    },
    inLanguage: courseLanguage,
  };

  if (image) {
    schema.image = image;
  }

  if (instructor) {
    schema.instructor = {
      '@type': 'Person',
      name: instructor.name,
      ...(instructor.url && { url: instructor.url }),
      ...(instructor.image && { image: instructor.image }),
    };
  }

  if (duration) {
    schema.timeRequired = duration;
  }

  if (educationalLevel) {
    schema.educationalLevel = educationalLevel;
  }

  if (price) {
    schema.offers = {
      '@type': 'Offer',
      price: price.amount,
      priceCurrency: price.currency,
      availability: 'https://schema.org/InStock',
    };
  }

  if (rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.value,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(options: WebPageSchemaOptions): object {
  const { name, description, url, image, datePublished, dateModified, author, breadcrumbs } =
    options;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (image) {
    schema.image = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author,
    };
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = generateBreadcrumbSchema(breadcrumbs);
  }

  return schema;
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(options: ArticleSchemaOptions): object {
  const {
    headline,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author,
    publisher = { name: SITE_NAME, logo: `${SITE_URL}/logo.png` },
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    image: image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url.startsWith('http') ? url : `${SITE_URL}${url}`,
    },
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(items: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ============================================================================
// React Component Helper
// ============================================================================

/**
 * Generate JSON-LD script element content
 */
export function toJsonLd(schema: object | object[]): string {
  return JSON.stringify(Array.isArray(schema) ? schema : schema);
}

/**
 * JsonLd component for embedding structured data
 * Usage: <JsonLd data={generateCourseSchema({...})} />
 */
export function JsonLdScript({ data }: { data: object | object[] }): React.JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(data) }} />;
}

// ============================================================================
// Exports
// ============================================================================

export { JsonLdScript as default };
