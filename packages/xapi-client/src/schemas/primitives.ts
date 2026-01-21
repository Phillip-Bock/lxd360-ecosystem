/**
 * xAPI 1.0.3 Primitive Schemas
 *
 * @module @inspire/xapi-client/schemas/primitives
 */

import { z } from 'zod';

// ============================================================================
// LANGUAGE MAP
// ============================================================================

/**
 * Language map for internationalized content.
 * Keys are language tags (e.g., "en-US", "de-DE").
 */
export const LanguageMapSchema = z.record(z.string(), z.string());
export type LanguageMap = z.infer<typeof LanguageMapSchema>;

// ============================================================================
// INTERNATIONALIZED RESOURCE IDENTIFIER (IRI)
// ============================================================================

/**
 * xAPI IRI - must be a valid URL.
 */
export const IRISchema = z.string().url();
export type IRI = z.infer<typeof IRISchema>;

// ============================================================================
// TIMESTAMP
// ============================================================================

/**
 * ISO 8601 timestamp.
 */
export const TimestampSchema = z.string().datetime({ offset: true });
export type Timestamp = z.infer<typeof TimestampSchema>;

// ============================================================================
// UUID
// ============================================================================

/**
 * UUID v4 for statement IDs.
 */
export const UUIDSchema = z.string().uuid();
export type UUID = z.infer<typeof UUIDSchema>;

// ============================================================================
// ISO 8601 DURATION
// ============================================================================

/**
 * ISO 8601 duration string (e.g., "PT1H30M").
 */
export const DurationSchema = z
  .string()
  .regex(
    /^P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/,
    'Invalid ISO 8601 duration format',
  );
export type Duration = z.infer<typeof DurationSchema>;

// ============================================================================
// EXTENSIONS
// ============================================================================

/**
 * Extensions object - map of IRI to any value.
 */
export const ExtensionsSchema = z.record(z.string().url(), z.unknown());
export type Extensions = z.infer<typeof ExtensionsSchema>;
