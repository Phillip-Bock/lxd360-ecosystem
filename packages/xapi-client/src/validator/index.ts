/**
 * Validator Exports
 *
 * @module @inspire/xapi-client/validator
 */

export {
  hasConsentTier,
  hasRequiredInspireExtensions,
  isValidVoidingStatement,
  parseStatement,
  safeParseStatement,
  type ValidationError,
  type ValidationResult,
  validateStatement,
  validateStatementBatch,
} from './statement-validator';
