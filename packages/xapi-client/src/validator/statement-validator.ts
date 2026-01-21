/**
 * xAPI Statement Validator
 *
 * Validates statements against xAPI 1.0.3 specification.
 *
 * @module @inspire/xapi-client/validator/statement-validator
 */

import type { Statement } from '../schemas';
import { StatementSchema } from '../schemas/statement';

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  statement?: Statement;
}

// ============================================================================
// VALIDATOR
// ============================================================================

/**
 * Validate a single statement.
 */
export function validateStatement(input: unknown): ValidationResult {
  const result = StatementSchema.safeParse(input);

  if (result.success) {
    return {
      valid: true,
      errors: [],
      statement: result.data,
    };
  }

  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return {
    valid: false,
    errors,
  };
}

/**
 * Validate a batch of statements.
 */
export function validateStatementBatch(inputs: unknown[]): {
  valid: boolean;
  results: ValidationResult[];
} {
  const results = inputs.map((input) => validateStatement(input));
  const valid = results.every((r) => r.valid);

  return { valid, results };
}

/**
 * Parse and validate a statement, throwing on error.
 */
export function parseStatement(input: unknown): Statement {
  return StatementSchema.parse(input);
}

/**
 * Safe parse a statement, returning undefined on error.
 */
export function safeParseStatement(input: unknown): Statement | undefined {
  const result = StatementSchema.safeParse(input);
  return result.success ? result.data : undefined;
}

// ============================================================================
// SPECIFIC VALIDATORS
// ============================================================================

/**
 * Check if a statement has required INSPIRE extensions.
 */
export function hasRequiredInspireExtensions(
  statement: Statement,
  required: string[],
): { valid: boolean; missing: string[] } {
  const extensions = statement.context?.extensions ?? {};
  const missing = required.filter((ext) => !(ext in extensions));

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Check if a statement has a consent tier (EU AI Act compliance).
 */
export function hasConsentTier(statement: Statement): boolean {
  const extensions = statement.context?.extensions ?? {};
  const consentTierKey = 'https://lxd360.com/xapi/extensions/consent-tier';
  return consentTierKey in extensions;
}

/**
 * Check if a voiding statement is valid.
 */
export function isValidVoidingStatement(statement: Statement): boolean {
  // Verb must be "voided"
  if (statement.verb.id !== 'http://adlnet.gov/expapi/verbs/voided') {
    return false;
  }

  // Object must be a StatementRef
  if (!('objectType' in statement.object) || statement.object.objectType !== 'StatementRef') {
    return false;
  }

  // Cannot void a voiding statement
  return true;
}
