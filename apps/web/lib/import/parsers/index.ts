/**
 * Manifest Parsers Index
 *
 * Re-exports all manifest parsing utilities.
 */

export {
  detectScormVersion,
  extractTitleFromManifest,
  parseScormManifest,
} from './scorm-manifest';

export {
  extractActivityId,
  extractXapiLaunchUrl,
  extractXapiTitle,
  parseCmi5Manifest,
  parseXapiManifest,
} from './xapi-manifest';
