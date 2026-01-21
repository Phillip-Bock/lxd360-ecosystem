import type { Activity, ActivityDefinition, Verb } from './types';

// ============================================================================
// VERB DEFINITIONS
// ADL Experience API verbs: https://registry.tincanapi.com/
// ============================================================================

/**
 * Standard xAPI verbs from ADL registry
 */
export const VERBS = {
  // Core Learning Verbs
  initialized: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  launched: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  experienced: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  attended: {
    id: 'http://adlnet.gov/expapi/verbs/attended',
    display: { 'en-US': 'attended' },
  },
  attempted: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },

  // Progress & Completion
  progressed: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  completed: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  passed: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  failed: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  mastered: {
    id: 'http://adlnet.gov/expapi/verbs/mastered',
    display: { 'en-US': 'mastered' },
  },
  scored: {
    id: 'http://adlnet.gov/expapi/verbs/scored',
    display: { 'en-US': 'scored' },
  },

  // Assessment Verbs
  answered: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  asked: {
    id: 'http://adlnet.gov/expapi/verbs/asked',
    display: { 'en-US': 'asked' },
  },
  interacted: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },

  // Session Lifecycle
  suspended: {
    id: 'http://adlnet.gov/expapi/verbs/suspended',
    display: { 'en-US': 'suspended' },
  },
  resumed: {
    id: 'http://adlnet.gov/expapi/verbs/resumed',
    display: { 'en-US': 'resumed' },
  },
  terminated: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  exited: {
    id: 'http://adlnet.gov/expapi/verbs/exited',
    display: { 'en-US': 'exited' },
  },

  // Registration & Preferences
  registered: {
    id: 'http://adlnet.gov/expapi/verbs/registered',
    display: { 'en-US': 'registered' },
  },
  preferred: {
    id: 'http://adlnet.gov/expapi/verbs/preferred',
    display: { 'en-US': 'preferred' },
  },

  // Social Verbs
  commented: {
    id: 'http://adlnet.gov/expapi/verbs/commented',
    display: { 'en-US': 'commented' },
  },
  shared: {
    id: 'http://adlnet.gov/expapi/verbs/shared',
    display: { 'en-US': 'shared' },
  },
  liked: {
    id: 'http://id.tincanapi.com/verb/liked',
    display: { 'en-US': 'liked' },
  },

  // Media Verbs (from Activity Streams / TinCan)
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

  // LXP360 Custom Verbs
  identified: {
    id: 'https://lxp360.com/xapi/verbs/identified',
    display: { 'en-US': 'identified' },
  },
  skipped: {
    id: 'http://id.tincanapi.com/verb/skipped',
    display: { 'en-US': 'skipped' },
  },
  reviewed: {
    id: 'http://id.tincanapi.com/verb/reviewed',
    display: { 'en-US': 'reviewed' },
  },
  bookmarked: {
    id: 'http://id.tincanapi.com/verb/bookmarked',
    display: { 'en-US': 'bookmarked' },
  },
  downloaded: {
    id: 'http://id.tincanapi.com/verb/downloaded',
    display: { 'en-US': 'downloaded' },
  },
  earned: {
    id: 'http://id.tincanapi.com/verb/earned',
    display: { 'en-US': 'earned' },
  },
} as const satisfies Record<string, Verb>;

export type VerbKey = keyof typeof VERBS;

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

/**
 * Standard xAPI activity types
 */
export const ACTIVITY_TYPES = {
  // ADL Activity Types
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  interaction: 'http://adlnet.gov/expapi/activities/cmi.interaction',
  question: 'http://adlnet.gov/expapi/activities/question',
  objective: 'http://adlnet.gov/expapi/activities/objective',
  attempt: 'http://adlnet.gov/expapi/activities/attempt',
  file: 'http://adlnet.gov/expapi/activities/file',
  link: 'http://adlnet.gov/expapi/activities/link',
  media: 'http://adlnet.gov/expapi/activities/media',
  meeting: 'http://adlnet.gov/expapi/activities/meeting',
  performance: 'http://adlnet.gov/expapi/activities/performance',
  profile: 'http://adlnet.gov/expapi/activities/profile',
  simulation: 'http://adlnet.gov/expapi/activities/simulation',

  // Activity Streams Types
  video: 'https://w3id.org/xapi/video/activity-type/video',
  audio: 'https://w3id.org/xapi/audio/activity-type/audio',
  article: 'http://activitystrea.ms/schema/1.0/article',
  book: 'http://id.tincanapi.com/activitytype/book',
  chapter: 'http://id.tincanapi.com/activitytype/chapter',
  document: 'http://id.tincanapi.com/activitytype/document',
  ebook: 'http://id.tincanapi.com/activitytype/ebook',
  slide: 'http://id.tincanapi.com/activitytype/slide',
  slideshow: 'http://id.tincanapi.com/activitytype/slide-deck',

  // LXP360 Custom Types
  scenario: 'https://lxp360.com/xapi/activities/scenario',
  simulation3d: 'https://lxp360.com/xapi/activities/simulation-3d',
  vrExperience: 'https://lxp360.com/xapi/activities/vr-experience',
  arExperience: 'https://lxp360.com/xapi/activities/ar-experience',
  microlearning: 'https://lxp360.com/xapi/activities/microlearning',
  practiceExercise: 'https://lxp360.com/xapi/activities/practice-exercise',
  safetyChecklist: 'https://lxp360.com/xapi/activities/safety-checklist',
  badge: 'https://lxp360.com/xapi/activities/badge',
  certificate: 'https://lxp360.com/xapi/activities/certificate',
  learningPath: 'https://lxp360.com/xapi/activities/learning-path',
} as const;

export type ActivityTypeKey = keyof typeof ACTIVITY_TYPES;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const BASE_IRI = 'https://lxp360.com/xapi/activities';

/**
 * Build a fully qualified activity IRI
 *
 * @param type - Activity type key from ACTIVITY_TYPES
 * @param slug - Unique identifier for the activity
 * @returns Fully qualified activity IRI
 *
 * @example
 * buildActivityId('course', 'safety-101')
 * // => 'https://lxp360.com/xapi/activities/course/safety-101'
 */
export function buildActivityId(type: ActivityTypeKey, slug: string): string {
  return `${BASE_IRI}/${type}/${encodeURIComponent(slug)}`;
}

/**
 * Build an activity object with standard structure
 *
 * @param id - Activity IRI or slug (will be converted to IRI if not a URL)
 * @param name - Activity name (language map or string)
 * @param type - Activity type key
 * @param description - Optional description
 * @returns Activity object ready for statement
 *
 * @example
 * buildActivity('safety-101', 'Safety Training 101', 'course')
 */
export function buildActivity(
  id: string,
  name: string | Record<string, string>,
  type: ActivityTypeKey,
  description?: string | Record<string, string>,
): Activity {
  const activityId = id.startsWith('http') ? id : buildActivityId(type, id);
  const nameMap = typeof name === 'string' ? { 'en-US': name } : name;
  const descMap = description
    ? typeof description === 'string'
      ? { 'en-US': description }
      : description
    : undefined;

  const definition: ActivityDefinition = {
    type: ACTIVITY_TYPES[type],
    name: nameMap,
  };

  if (descMap) {
    definition.description = descMap;
  }

  return {
    objectType: 'Activity',
    id: activityId,
    definition,
  };
}

/**
 * Get a verb by key
 *
 * @param key - Verb key from VERBS
 * @returns Verb object
 */
export function getVerb(key: VerbKey): Verb {
  return VERBS[key];
}

/**
 * Get activity type IRI by key
 *
 * @param key - Activity type key
 * @returns Activity type IRI
 */
export function getActivityType(key: ActivityTypeKey): string {
  return ACTIVITY_TYPES[key];
}

/**
 * Format ISO 8601 duration from seconds
 *
 * @param seconds - Duration in seconds
 * @returns ISO 8601 duration string (e.g., "PT1H30M15S")
 *
 * @example
 * formatDuration(5415) // => "PT1H30M15S"
 * formatDuration(90)   // => "PT1M30S"
 * formatDuration(45)   // => "PT45S"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return 'PT0S';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || ms > 0) {
    duration += ms > 0 ? `${secs}.${ms}S` : `${secs}S`;
  }

  return duration === 'PT' ? 'PT0S' : duration;
}

/**
 * Parse ISO 8601 duration to seconds
 *
 * @param duration - ISO 8601 duration string
 * @returns Duration in seconds
 *
 * @example
 * parseDuration("PT1H30M15S") // => 5415
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseFloat(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Create an actor from user email
 *
 * @param email - User email address
 * @param name - Optional display name
 * @returns Agent object
 */
export function createActorFromEmail(
  email: string,
  name?: string,
): { objectType: 'Agent'; mbox: string; name?: string } {
  const mbox = email.startsWith('mailto:') ? email : `mailto:${email}`;
  return {
    objectType: 'Agent' as const,
    mbox,
    ...(name && { name }),
  };
}

/**
 * Create an actor from account
 *
 * @param homePage - Account home page URL
 * @param accountName - Account identifier
 * @param displayName - Optional display name
 * @returns Agent object
 */
export function createActorFromAccount(
  homePage: string,
  accountName: string,
  displayName?: string,
): { objectType: 'Agent'; account: { homePage: string; name: string }; name?: string } {
  return {
    objectType: 'Agent' as const,
    account: {
      homePage,
      name: accountName,
    },
    ...(displayName && { name: displayName }),
  };
}
