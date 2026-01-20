import type {
  BlockInstance,
  FITBQuestionContent,
  MCQuestionContent,
  StarterBlockType,
  VideoContent,
} from '@/types/blocks';

import type {
  XAPIActor,
  XAPIContext,
  XAPIObject,
  XAPIResult,
  XAPIStatement,
  XAPIVerb,
  XAPIVerbObject,
} from '@/types/xapi';

import { XAPI_VERB_IRIS } from '@/types/xapi';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Base IRI for INSPIRE Studio activities.
 */
export const INSPIRE_ACTIVITY_BASE = 'https://inspire.lxd360.com/activities';

/**
 * Activity type IRIs.
 */
export const ACTIVITY_TYPES = {
  content: 'http://adlnet.gov/expapi/activities/media',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  interaction: 'http://adlnet.gov/expapi/activities/interaction',
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  question: 'http://adlnet.gov/expapi/activities/cmi.interaction',
  video: 'https://w3id.org/xapi/video/activity-type/video',
} as const;

/**
 * CMI interaction types for assessments.
 */
export const INTERACTION_TYPES = {
  choice: 'choice',
  fillIn: 'fill-in',
  matching: 'matching',
  sequencing: 'sequencing',
  trueFalse: 'true-false',
  numeric: 'numeric',
  other: 'other',
} as const;

// =============================================================================
// VERB HELPERS
// =============================================================================

/**
 * Create an xAPI verb object from a verb key.
 */
export function createVerb(verb: XAPIVerb): XAPIVerbObject {
  const verbDisplayNames: Record<XAPIVerb, string> = {
    experienced: 'experienced',
    interacted: 'interacted',
    answered: 'answered',
    passed: 'passed',
    failed: 'failed',
    completed: 'completed',
    played: 'played',
    paused: 'paused',
    seeked: 'seeked',
    progressed: 'progressed',
    asked: 'asked',
    attempted: 'attempted',
    scored: 'scored',
  };

  return {
    id: XAPI_VERB_IRIS[verb],
    display: {
      'en-US': verbDisplayNames[verb],
    },
  };
}

// =============================================================================
// ACTOR HELPERS
// =============================================================================

/**
 * Create an xAPI actor from user data.
 */
export function createActor(user: { id: string; email?: string; name?: string }): XAPIActor {
  if (user.email) {
    return {
      objectType: 'Agent',
      mbox: `mailto:${user.email}` as `mailto:${string}`,
      ...(user.name && { name: user.name }),
    };
  }

  return {
    objectType: 'Agent',
    account: {
      homePage: 'https://inspire.lxd360.com',
      name: user.id,
    },
    ...(user.name && { name: user.name }),
  };
}

// =============================================================================
// OBJECT TEMPLATES
// =============================================================================

/**
 * Create an xAPI object for a content block.
 */
export function createBlockObject(
  block: BlockInstance,
  courseId?: string,
  lessonId?: string,
): XAPIObject {
  const activityId = buildActivityId(block.id, courseId, lessonId);

  return {
    objectType: 'Activity',
    id: activityId,
    definition: {
      type: getActivityType(block.type),
      name: {
        'en-US': getBlockName(block),
      },
      description: {
        'en-US': getBlockDescription(block),
      },
    },
  };
}

/**
 * Create an xAPI object for a multiple choice question.
 */
export function createMCQuestionObject(
  block: BlockInstance,
  content: MCQuestionContent,
  courseId?: string,
  lessonId?: string,
): XAPIObject {
  const activityId = buildActivityId(block.id, courseId, lessonId);

  return {
    objectType: 'Activity',
    id: activityId,
    definition: {
      type: ACTIVITY_TYPES.question,
      name: {
        'en-US': 'Multiple Choice Question',
      },
      description: {
        'en-US': content.question,
      },
      interactionType: content.multipleAnswer
        ? 'choice' // multi-select
        : 'choice', // single-select
      correctResponsesPattern: content.choices
        .filter((c: MCQuestionContent['choices'][number]) => c.correct)
        .map((c: MCQuestionContent['choices'][number]) => c.id),
      choices: content.choices.map((choice: MCQuestionContent['choices'][number]) => ({
        id: choice.id,
        description: {
          'en-US': choice.text,
        },
      })),
    },
  };
}

/**
 * Create an xAPI object for a fill-in-the-blank question.
 */
export function createFITBQuestionObject(
  block: BlockInstance,
  content: FITBQuestionContent,
  courseId?: string,
  lessonId?: string,
): XAPIObject {
  const activityId = buildActivityId(block.id, courseId, lessonId);

  // Build correct responses pattern (format: blank1[,]blank2[,]blank3)
  const correctPattern = content.blanks
    .map((blank: FITBQuestionContent['blanks'][number]) => blank.acceptedAnswers.join('[,]'))
    .join('[,]');

  return {
    objectType: 'Activity',
    id: activityId,
    definition: {
      type: ACTIVITY_TYPES.question,
      name: {
        'en-US': 'Fill in the Blank Question',
      },
      description: {
        'en-US': content.template,
      },
      interactionType: 'fill-in',
      correctResponsesPattern: [correctPattern],
    },
  };
}

/**
 * Create an xAPI object for a video.
 */
export function createVideoObject(
  block: BlockInstance,
  content: VideoContent,
  courseId?: string,
  lessonId?: string,
): XAPIObject {
  const activityId = buildActivityId(block.id, courseId, lessonId);

  return {
    objectType: 'Activity',
    id: activityId,
    definition: {
      type: ACTIVITY_TYPES.video,
      name: {
        'en-US': content.title,
      },
    },
  };
}

// =============================================================================
// RESULT TEMPLATES
// =============================================================================

/**
 * Create an xAPI result for an assessment answer.
 */
export function createAssessmentResult(params: {
  score: number;
  maxScore: number;
  success: boolean;
  response: string;
  duration?: number;
}): XAPIResult {
  const result: XAPIResult = {
    score: {
      scaled: params.maxScore > 0 ? params.score / params.maxScore : 0,
      raw: params.score,
      min: 0,
      max: params.maxScore,
    },
    success: params.success,
    completion: true,
    response: params.response,
  };

  if (params.duration !== undefined) {
    result.duration = formatDuration(params.duration);
  }

  return result;
}

/**
 * Create an xAPI result for video progress.
 */
export function createVideoResult(params: {
  progress?: number;
  currentTime?: number;
  duration?: number;
  completed?: boolean;
}): XAPIResult {
  const result: XAPIResult = {};

  if (params.completed !== undefined) {
    result.completion = params.completed;
  }

  if (params.duration !== undefined) {
    result.duration = formatDuration(params.duration);
  }

  return result;
}

/**
 * Create an xAPI result for content viewing.
 */
export function createViewResult(params: { duration?: number; completed?: boolean }): XAPIResult {
  const result: XAPIResult = {};

  if (params.completed !== undefined) {
    result.completion = params.completed;
  }

  if (params.duration !== undefined) {
    result.duration = formatDuration(params.duration);
  }

  return result;
}

// =============================================================================
// CONTEXT HELPERS
// =============================================================================

/**
 * Create an xAPI context with course/lesson hierarchy.
 */
export function createContext(params: {
  registration?: string;
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonName?: string;
  extensions?: Record<string, unknown>;
}): XAPIContext {
  const context: XAPIContext = {};

  if (params.registration) {
    context.registration = params.registration;
  }

  const contextActivities: XAPIContext['contextActivities'] = {};

  if (params.lessonId) {
    contextActivities.parent = [
      {
        objectType: 'Activity',
        id: `${INSPIRE_ACTIVITY_BASE}/lesson/${params.lessonId}`,
        definition: {
          type: ACTIVITY_TYPES.lesson,
          name: params.lessonName ? { 'en-US': params.lessonName } : undefined,
        },
      },
    ];
  }

  if (params.courseId) {
    contextActivities.grouping = [
      {
        objectType: 'Activity',
        id: `${INSPIRE_ACTIVITY_BASE}/course/${params.courseId}`,
        definition: {
          type: ACTIVITY_TYPES.course,
          name: params.courseName ? { 'en-US': params.courseName } : undefined,
        },
      },
    ];
  }

  if (Object.keys(contextActivities).length > 0) {
    context.contextActivities = contextActivities;
  }

  if (params.extensions) {
    context.extensions = params.extensions;
  }

  return context;
}

// =============================================================================
// STATEMENT GENERATORS
// =============================================================================

/**
 * Generate statement for viewing content (paragraph, image, quote, list).
 */
export function generateExperiencedStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  courseId?: string;
  lessonId?: string;
  duration?: number;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('experienced'),
    object: createBlockObject(params.block, params.courseId, params.lessonId),
    result: createViewResult({
      duration: params.duration,
      completed: true,
    }),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate statement for interacting with content (accordion, tabs, flip-card).
 */
export function generateInteractedStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  interactionType: string;
  interactionId?: string;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('interacted'),
    object: createBlockObject(params.block, params.courseId, params.lessonId),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
      extensions: {
        'https://inspire.lxd360.com/extensions/interaction-type': params.interactionType,
        'https://inspire.lxd360.com/extensions/interaction-id': params.interactionId,
      },
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate statement for answering a multiple choice question.
 */
export function generateMCAnsweredStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  content: MCQuestionContent;
  selectedChoiceIds: string[];
  score: number;
  maxScore: number;
  success: boolean;
  duration?: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('answered'),
    object: createMCQuestionObject(params.block, params.content, params.courseId, params.lessonId),
    result: createAssessmentResult({
      score: params.score,
      maxScore: params.maxScore,
      success: params.success,
      response: params.selectedChoiceIds.join('[,]'),
      duration: params.duration,
    }),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate statement for answering a fill-in-the-blank question.
 */
export function generateFITBAnsweredStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  content: FITBQuestionContent;
  responses: Record<string, string>;
  score: number;
  maxScore: number;
  success: boolean;
  duration?: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  // Format response as blank_id=answer pairs
  const responseStr = Object.entries(params.responses)
    .map(([id, answer]) => `${id}=${answer}`)
    .join('[,]');

  return {
    actor: params.actor,
    verb: createVerb('answered'),
    object: createFITBQuestionObject(
      params.block,
      params.content,
      params.courseId,
      params.lessonId,
    ),
    result: createAssessmentResult({
      score: params.score,
      maxScore: params.maxScore,
      success: params.success,
      response: responseStr,
      duration: params.duration,
    }),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate passed/failed statement after assessment attempt.
 */
export function generatePassFailStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  passed: boolean;
  score: number;
  maxScore: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb(params.passed ? 'passed' : 'failed'),
    object: createBlockObject(params.block, params.courseId, params.lessonId),
    result: {
      score: {
        scaled: params.maxScore > 0 ? params.score / params.maxScore : 0,
        raw: params.score,
        min: 0,
        max: params.maxScore,
      },
      success: params.passed,
      completion: true,
    },
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate video played statement.
 */
export function generateVideoPlayedStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  content: VideoContent;
  currentTime: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('played'),
    object: createVideoObject(params.block, params.content, params.courseId, params.lessonId),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
      extensions: {
        'https://w3id.org/xapi/video/extensions/time': params.currentTime,
      },
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate video paused statement.
 */
export function generateVideoPausedStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  content: VideoContent;
  currentTime: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('paused'),
    object: createVideoObject(params.block, params.content, params.courseId, params.lessonId),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
      extensions: {
        'https://w3id.org/xapi/video/extensions/time': params.currentTime,
      },
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate video seeked statement.
 */
export function generateVideoSeekedStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  content: VideoContent;
  fromTime: number;
  toTime: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('seeked'),
    object: createVideoObject(params.block, params.content, params.courseId, params.lessonId),
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
      extensions: {
        'https://w3id.org/xapi/video/extensions/time-from': params.fromTime,
        'https://w3id.org/xapi/video/extensions/time-to': params.toTime,
      },
    }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate video completed statement.
 */
export function generateVideoCompletedStatement(params: {
  actor: XAPIActor;
  block: BlockInstance;
  content: VideoContent;
  watchedDuration: number;
  totalDuration: number;
  courseId?: string;
  lessonId?: string;
}): XAPIStatement {
  return {
    actor: params.actor,
    verb: createVerb('completed'),
    object: createVideoObject(params.block, params.content, params.courseId, params.lessonId),
    result: {
      completion: true,
      duration: formatDuration(params.watchedDuration),
      extensions: {
        'https://w3id.org/xapi/video/extensions/progress':
          params.totalDuration > 0 ? params.watchedDuration / params.totalDuration : 0,
      },
    } as XAPIResult,
    context: createContext({
      courseId: params.courseId,
      lessonId: params.lessonId,
    }),
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Build activity ID from components.
 */
function buildActivityId(blockId: string, courseId?: string, lessonId?: string): string {
  const parts = [INSPIRE_ACTIVITY_BASE];

  if (courseId) {
    parts.push(`course/${courseId}`);
  }

  if (lessonId) {
    parts.push(`lesson/${lessonId}`);
  }

  parts.push(`block/${blockId}`);

  return parts.join('/');
}

/**
 * Get activity type for a block.
 */
function getActivityType(blockType: StarterBlockType): string {
  switch (blockType) {
    case 'mc-question':
    case 'fitb-question':
      return ACTIVITY_TYPES.assessment;
    case 'video':
      return ACTIVITY_TYPES.video;
    case 'accordion':
    case 'tabs':
    case 'flip-card':
      return ACTIVITY_TYPES.interaction;
    default:
      return ACTIVITY_TYPES.content;
  }
}

/**
 * Get human-readable name for a block.
 */
function getBlockName(block: BlockInstance): string {
  const names: Record<StarterBlockType, string> = {
    paragraph: 'Text Content',
    image: 'Image',
    video: 'Video',
    quote: 'Quote',
    list: 'List',
    'mc-question': 'Multiple Choice Question',
    'fitb-question': 'Fill in the Blank Question',
    accordion: 'Accordion',
    tabs: 'Tabs',
    'flip-card': 'Flip Card',
  };

  return names[block.type] ?? 'Content Block';
}

/**
 * Get description for a block.
 */
function getBlockDescription(block: BlockInstance): string {
  const descriptions: Record<StarterBlockType, string> = {
    paragraph: 'Text paragraph content',
    image: 'Image with caption',
    video: 'Video content',
    quote: 'Blockquote with attribution',
    list: 'List of items',
    'mc-question': 'Multiple choice assessment question',
    'fitb-question': 'Fill-in-the-blank assessment question',
    accordion: 'Expandable accordion sections',
    tabs: 'Tabbed content panels',
    'flip-card': 'Interactive flip card',
  };

  return descriptions[block.type] ?? 'Learning content block';
}

/**
 * Format duration in ISO 8601 format (PT#H#M#S).
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let duration = 'PT';

  if (hours > 0) {
    duration += `${hours}H`;
  }

  if (minutes > 0) {
    duration += `${minutes}M`;
  }

  if (secs > 0 || duration === 'PT') {
    duration += `${secs}S`;
  }

  return duration;
}

/**
 * Parse ISO 8601 duration to seconds.
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Generate a unique statement ID (UUID v4 format).
 */
export function generateStatementId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
