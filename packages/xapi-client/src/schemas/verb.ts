/**
 * xAPI 1.0.3 Verb Schemas
 *
 * A Verb describes the action being performed.
 *
 * @module @inspire/xapi-client/schemas/verb
 */

import { z } from 'zod';
import { LanguageMapSchema } from './primitives';

// ============================================================================
// VERB
// ============================================================================

/**
 * Verb - describes the action between Actor and Object.
 */
export const VerbSchema = z.object({
  /** IRI identifying the Verb */
  id: z.string().url(),
  /** Human-readable display names per language */
  display: LanguageMapSchema.optional(),
});
export type Verb = z.infer<typeof VerbSchema>;

// ============================================================================
// STANDARD ADL VERBS
// ============================================================================

export const ADL_VERBS = {
  answered: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  asked: {
    id: 'http://adlnet.gov/expapi/verbs/asked',
    display: { 'en-US': 'asked' },
  },
  attempted: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  attended: {
    id: 'http://adlnet.gov/expapi/verbs/attended',
    display: { 'en-US': 'attended' },
  },
  commented: {
    id: 'http://adlnet.gov/expapi/verbs/commented',
    display: { 'en-US': 'commented' },
  },
  completed: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  exited: {
    id: 'http://adlnet.gov/expapi/verbs/exited',
    display: { 'en-US': 'exited' },
  },
  experienced: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  failed: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  imported: {
    id: 'http://adlnet.gov/expapi/verbs/imported',
    display: { 'en-US': 'imported' },
  },
  initialized: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  interacted: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  launched: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  mastered: {
    id: 'http://adlnet.gov/expapi/verbs/mastered',
    display: { 'en-US': 'mastered' },
  },
  passed: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  preferred: {
    id: 'http://adlnet.gov/expapi/verbs/preferred',
    display: { 'en-US': 'preferred' },
  },
  progressed: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  registered: {
    id: 'http://adlnet.gov/expapi/verbs/registered',
    display: { 'en-US': 'registered' },
  },
  responded: {
    id: 'http://adlnet.gov/expapi/verbs/responded',
    display: { 'en-US': 'responded' },
  },
  resumed: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
  scored: {
    id: 'http://adlnet.gov/expapi/verbs/scored',
    display: { 'en-US': 'scored' },
  },
  shared: {
    id: 'http://adlnet.gov/expapi/verbs/shared',
    display: { 'en-US': 'shared' },
  },
  suspended: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },
  terminated: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  voided: {
    id: 'http://adlnet.gov/expapi/verbs/voided',
    display: { 'en-US': 'voided' },
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// VIDEO xAPI PROFILE VERBS
// ============================================================================

export const VIDEO_VERBS = {
  played: {
    id: 'https://w3id.org/xapi/video/verbs/played',
    display: { 'en-US': 'played' },
  },
  paused: {
    id: 'https://w3id.org/xapi/video/verbs/paused',
    display: { 'en-US': 'paused' },
  },
  seeked: {
    id: 'https://w3id.org/xapi/video/verbs/seeked',
    display: { 'en-US': 'seeked' },
  },
  interacted: {
    id: 'https://w3id.org/xapi/video/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// INSPIRE CUSTOM VERBS
// ============================================================================

export const INSPIRE_VERBS = {
  adapted: {
    id: 'https://lxd360.com/xapi/verbs/adapted',
    display: { 'en-US': 'received adaptation' },
  },
  overrode: {
    id: 'https://lxd360.com/xapi/verbs/overrode',
    display: { 'en-US': 'overrode recommendation' },
  },
  probed: {
    id: 'https://lxd360.com/xapi/verbs/probed',
    display: { 'en-US': 'was probed for baseline' },
  },
  struggled: {
    id: 'https://lxd360.com/xapi/verbs/struggled',
    display: { 'en-US': 'struggled with' },
  },
  reflected: {
    id: 'https://lxd360.com/xapi/verbs/reflected',
    display: { 'en-US': 'reflected on' },
  },
  hesitated: {
    id: 'https://lxd360.com/xapi/verbs/hesitated',
    display: { 'en-US': 'hesitated on' },
  },
  disengaged: {
    id: 'https://lxd360.com/xapi/verbs/disengaged',
    display: { 'en-US': 'disengaged from' },
  },
} as const satisfies Record<string, Verb>;

// ============================================================================
// ALL VERBS
// ============================================================================

export const ALL_VERBS = {
  ...ADL_VERBS,
  ...VIDEO_VERBS,
  ...INSPIRE_VERBS,
} as const;

export type VerbKey = keyof typeof ALL_VERBS;

/**
 * Get a verb by key.
 */
export function getVerb(key: VerbKey): Verb {
  return ALL_VERBS[key];
}

/**
 * Check if an IRI matches a known verb.
 */
export function isKnownVerb(iri: string): boolean {
  return Object.values(ALL_VERBS).some((v) => v.id === iri);
}
