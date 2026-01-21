import { v4 as uuidv4 } from 'uuid';
import { ACTIVITY_TYPES, type ActivityTypeKey } from '@/lib/xapi/activity-types';
import type { Activity, Actor, Context, Result, Statement, Verb } from '@/lib/xapi/types';
import { XAPI_VERBS, type XAPIVerbKey } from '@/lib/xapi/verbs';
import type {
  AssessmentResult,
  BlockInteraction,
  ContentBlock,
  CourseOutline,
  LearnerProfile,
  Lesson,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_URL = 'https://lxd360.com';
const PLATFORM = 'LXP360 Demo';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates an xAPI Actor from a learner profile
 */
export function createActor(learner: LearnerProfile): Actor {
  return {
    objectType: 'Agent',
    name: learner.name,
    mbox: `mailto:${learner.email}`,
    account: {
      homePage: BASE_URL,
      name: learner.id,
    },
  };
}

/**
 * Creates an xAPI Activity from course/lesson/block data
 */
export function createActivity(
  id: string,
  name: string,
  description: string | undefined,
  type: ActivityTypeKey,
): Activity {
  const activityId = id.startsWith('http')
    ? id
    : `${BASE_URL}/activities/${encodeURIComponent(id)}`;

  return {
    objectType: 'Activity',
    id: activityId,
    definition: {
      name: { 'en-US': name },
      ...(description && { description: { 'en-US': description } }),
      type: ACTIVITY_TYPES[type],
    },
  };
}

/**
 * Gets a verb from the registry
 */
export function getVerb(verbKey: XAPIVerbKey): Verb {
  return XAPI_VERBS[verbKey];
}

/**
 * Formats duration in ISO 8601 format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `PT${seconds}S`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `PT${minutes}M${remainingSeconds}S` : `PT${minutes}M`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `PT${hours}H${remainingMinutes}M${remainingSeconds}S`;
}

/**
 * Creates a base context for statements
 */
function createBaseContext(
  registration: string,
  parentActivity?: Activity,
  groupingActivity?: Activity,
): Context {
  const context: Context = {
    registration,
    platform: PLATFORM,
    extensions: {
      'https://lxp360.com/xapi/extensions/demo-mode': true,
      'https://lxp360.com/xapi/extensions/agent-type': 'learner-agent',
    },
  };

  if (parentActivity || groupingActivity) {
    context.contextActivities = {};
    if (parentActivity) {
      context.contextActivities.parent = [parentActivity];
    }
    if (groupingActivity) {
      context.contextActivities.grouping = [groupingActivity];
    }
  }

  return context;
}

// ============================================================================
// STATEMENT GENERATORS
// ============================================================================

/**
 * Generates a course launch statement
 */
export function generateLaunchStatement(
  learner: LearnerProfile,
  course: CourseOutline,
  registration: string,
  timestamp?: string,
): Statement {
  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb('launched'),
    object: createActivity(course.id, course.title, course.description, 'course'),
    context: createBaseContext(registration),
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

/**
 * Generates a progress statement
 */
export function generateProgressStatement(
  learner: LearnerProfile,
  course: CourseOutline,
  lesson: Lesson,
  registration: string,
  progressPercent: number,
  durationSeconds: number,
  timestamp?: string,
): Statement {
  const courseActivity = createActivity(course.id, course.title, course.description, 'course');
  const lessonActivity = createActivity(lesson.id, lesson.title, lesson.description, 'lesson');

  const result: Result = {
    completion: progressPercent >= 100,
    extensions: {
      'https://lxp360.com/xapi/extensions/progress': progressPercent,
    },
    duration: formatDuration(durationSeconds),
  };

  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb('progressed'),
    object: lessonActivity,
    result,
    context: createBaseContext(registration, undefined, courseActivity),
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

/**
 * Generates a block interaction statement
 */
export function generateBlockInteractionStatement(
  learner: LearnerProfile,
  course: CourseOutline,
  lesson: Lesson,
  block: ContentBlock,
  interaction: BlockInteraction,
  registration: string,
  timestamp?: string,
): Statement {
  const courseActivity = createActivity(course.id, course.title, course.description, 'course');
  const lessonActivity = createActivity(lesson.id, lesson.title, lesson.description, 'lesson');

  // Determine the verb based on block type and completion
  let verbKey: XAPIVerbKey = 'interacted';
  if (interaction.completed) {
    verbKey = 'completed';
  } else if (block.type === 'video') {
    verbKey = 'played';
  } else if (block.type === 'quiz' || block.type === 'assessment') {
    verbKey = 'attempted';
  }

  // Map block type to activity type
  const blockTypeMap: Record<string, ActivityTypeKey> = {
    text: 'lesson',
    video: 'video',
    quiz: 'quiz',
    interactive: 'interaction',
    scenario: 'simulation',
    assessment: 'assessment',
  };

  const activityType = blockTypeMap[block.type] ?? 'lesson';
  const blockActivity = createActivity(
    block.id,
    block.title,
    block.content.substring(0, 200),
    activityType,
  );

  const result: Result = {
    completion: interaction.completed,
    duration: formatDuration(interaction.durationSeconds),
  };

  if (interaction.score !== undefined) {
    result.score = {
      scaled: interaction.score / 100,
      raw: interaction.score,
      min: 0,
      max: 100,
    };
    result.success = interaction.score >= 70;
  }

  if (interaction.response) {
    result.response = interaction.response;
  }

  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb(verbKey),
    object: blockActivity,
    result,
    context: {
      ...createBaseContext(registration, lessonActivity, courseActivity),
      extensions: {
        ...createBaseContext(registration).extensions,
        'https://lxp360.com/xapi/extensions/block-type': block.type,
        ...(interaction.attempts && {
          'https://lxp360.com/xapi/extensions/attempt-number': interaction.attempts,
        }),
      },
    },
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

/**
 * Generates an assessment completion statement
 */
export function generateAssessmentStatement(
  learner: LearnerProfile,
  course: CourseOutline,
  assessmentResult: AssessmentResult,
  registration: string,
  timestamp?: string,
): Statement {
  const courseActivity = createActivity(course.id, course.title, course.description, 'course');
  const assessmentActivity = createActivity(
    assessmentResult.assessmentId,
    'Course Assessment',
    'Final assessment for the course',
    'assessment',
  );

  const verbKey: XAPIVerbKey = assessmentResult.passed ? 'passed' : 'failed';

  const result: Result = {
    score: {
      scaled: assessmentResult.score / 100,
      raw: assessmentResult.score,
      min: 0,
      max: 100,
    },
    success: assessmentResult.passed,
    completion: true,
    duration: formatDuration(
      Math.floor(
        (new Date(assessmentResult.completedAt).getTime() -
          new Date(assessmentResult.startedAt).getTime()) /
          1000,
      ),
    ),
    extensions: {
      'https://lxp360.com/xapi/extensions/passing-score': assessmentResult.passingScore,
      'https://lxp360.com/xapi/extensions/attempt-number': assessmentResult.attempts,
      'https://lxp360.com/xapi/extensions/questions-correct':
        assessmentResult.questionResults.filter((q: { correct: boolean }) => q.correct).length,
      'https://lxp360.com/xapi/extensions/questions-total': assessmentResult.questionResults.length,
    },
  };

  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb(verbKey),
    object: assessmentActivity,
    result,
    context: createBaseContext(registration, undefined, courseActivity),
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

/**
 * Generates a course completion statement
 */
export function generateCompletionStatement(
  learner: LearnerProfile,
  course: CourseOutline,
  registration: string,
  totalDurationSeconds: number,
  finalScore?: number,
  timestamp?: string,
): Statement {
  const courseActivity = createActivity(course.id, course.title, course.description, 'course');

  const result: Result = {
    completion: true,
    duration: formatDuration(totalDurationSeconds),
  };

  if (finalScore !== undefined) {
    result.score = {
      scaled: finalScore / 100,
      raw: finalScore,
      min: 0,
      max: 100,
    };
    result.success = finalScore >= 70;
  }

  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb('completed'),
    object: courseActivity,
    result,
    context: createBaseContext(registration),
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

/**
 * Generates a scored statement (for graded activities)
 */
export function generateScoredStatement(
  learner: LearnerProfile,
  activity: Activity,
  score: number,
  maxScore: number,
  registration: string,
  parentActivity?: Activity,
  timestamp?: string,
): Statement {
  const scaled = score / maxScore;
  const result: Result = {
    score: {
      scaled,
      raw: score,
      min: 0,
      max: maxScore,
    },
    success: scaled >= 0.7,
  };

  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb('scored'),
    object: activity,
    result,
    context: createBaseContext(registration, parentActivity),
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

/**
 * Generates a termination/exit statement (for dropout scenarios)
 */
export function generateTerminationStatement(
  learner: LearnerProfile,
  course: CourseOutline,
  registration: string,
  progressPercent: number,
  durationSeconds: number,
  timestamp?: string,
): Statement {
  const courseActivity = createActivity(course.id, course.title, course.description, 'course');

  const result: Result = {
    completion: false,
    duration: formatDuration(durationSeconds),
    extensions: {
      'https://lxp360.com/xapi/extensions/progress': progressPercent,
      'https://lxp360.com/xapi/extensions/termination-reason': 'learner-exit',
    },
  };

  return {
    id: uuidv4(),
    actor: createActor(learner),
    verb: getVerb('terminated'),
    object: courseActivity,
    result,
    context: createBaseContext(registration),
    timestamp: timestamp ?? new Date().toISOString(),
    version: '1.0.3',
  };
}

// ============================================================================
// BATCH GENERATOR
// ============================================================================

export interface StatementBatch {
  statements: Statement[];
  summary: {
    total: number;
    byVerb: Record<string, number>;
    byActor: Record<string, number>;
  };
}

/**
 * Creates a summary of a batch of statements
 */
export function summarizeBatch(statements: Statement[]): StatementBatch {
  const byVerb: Record<string, number> = {};
  const byActor: Record<string, number> = {};

  for (const statement of statements) {
    const verbDisplay = statement.verb.display?.['en-US'] ?? 'unknown';
    byVerb[verbDisplay] = (byVerb[verbDisplay] ?? 0) + 1;

    const actorName = statement.actor.name ?? 'unknown';
    byActor[actorName] = (byActor[actorName] ?? 0) + 1;
  }

  return {
    statements,
    summary: {
      total: statements.length,
      byVerb,
      byActor,
    },
  };
}
