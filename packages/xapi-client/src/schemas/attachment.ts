/**
 * xAPI 1.0.3 Attachment Schemas
 *
 * Attachments allow including digital artifacts with statements.
 *
 * @module @inspire/xapi-client/schemas/attachment
 */

import { z } from 'zod';
import { LanguageMapSchema } from './primitives';

// ============================================================================
// ATTACHMENT
// ============================================================================

export const AttachmentSchema = z.object({
  /** IRI describing the usage of this attachment */
  usageType: z.string().url(),
  /** Human-readable display names per language */
  display: LanguageMapSchema,
  /** Human-readable descriptions per language */
  description: LanguageMapSchema.optional(),
  /** MIME type of the attachment */
  contentType: z.string(),
  /** Length of the attachment in bytes */
  length: z.number().int().positive(),
  /** SHA-256 hash of the attachment content */
  sha2: z.string(),
  /** URL where the attachment content can be retrieved */
  fileUrl: z.string().url().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

// ============================================================================
// ATTACHMENT USAGE TYPES
// ============================================================================

export const ATTACHMENT_USAGE_TYPES = {
  /** Signature attachment per JSON Web Signature spec */
  signature: 'http://adlnet.gov/expapi/attachments/signature',
} as const;
