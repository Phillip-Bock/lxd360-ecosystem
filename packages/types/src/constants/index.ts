/**
 * Constants Exports
 *
 * @module @inspire/types/constants
 */

export {
  CONSENT_TIERS,
  CONTENT_MODALITIES,
  type ConsentTier,
  type ContentModality,
  FUNCTIONAL_STATES,
  type FunctionalState,
  INSPIRE_EXTENSIONS,
  type InspireExtensionIRI,
  type InspireExtensionKey,
} from './extensions';
export {
  getAllPermissions,
  hasPermission,
  isRoleAtLeast,
  PERMISSIONS,
  type Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  type Role,
} from './roles';
