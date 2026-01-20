import { v4 as uuidv4 } from 'uuid';
import type { Statement } from '@/lib/xapi/types';
import type {
  AssessmentResult,
  BlockInteraction,
  ContentBlock,
  CourseConsumption,
  FullCourse,
  LearnerAgentConfig,
  LearnerBehaviorType,
  LearnerProfile,
  Lesson,
} from './types';
import { LEARNER_BEHAVIOR_PROFILES } from './types';
import {
  generateAssessmentStatement,
  generateBlockInteractionStatement,
  generateCompletionStatement,
  generateLaunchStatement,
  generateProgressStatement,
  generateTerminationStatement,
} from './xapi-generator';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BASE_DELAY_MS = 100;
const DEFAULT_VARIANCE_PERCENT = 20;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a learner profile from a behavior type
 */
export function createLearnerProfile(behaviorType: LearnerBehaviorType): LearnerProfile {
  const baseProfile = LEARNER_BEHAVIOR_PROFILES[behaviorType];
  const id = uuidv4();

  return {
    id,
    email: `${behaviorType}-${id.substring(0, 8)}@demo.lxd360.com`,
    ...baseProfile,
  };
}

/**
 * Adds randomness to a value based on variance
 */
function addVariance(value: number, variancePercent: number): number {
  const variance = value * (variancePercent / 100);
  return value + (Math.random() - 0.5) * 2 * variance;
}

/**
 * Simulates time passage with delay
 */
async function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if learner will complete based on their profile
 */
function willComplete(profile: LearnerProfile, progressPercent: number): boolean {
  const { completionLikelihood } = profile.attributes;
  // Probability of continuing decreases as progress increases for low-completion learners
  const adjustedProbability =
    completionLikelihood - (100 - completionLikelihood) * (progressPercent / 100);
  return Math.random() * 100 < adjustedProbability;
}

/**
 * Calculates score based on learner comprehension
 */
function calculateScore(profile: LearnerProfile): number {
  const { comprehensionLevel } = profile.attributes;
  // Add some randomness around the comprehension level
  const baseScore = addVariance(comprehensionLevel, 15);
  return Math.min(100, Math.max(0, Math.round(baseScore)));
}

/**
 * Calculates time spent on block based on learner profile
 */
function calculateBlockTime(profile: LearnerProfile, blockDuration: number): number {
  // Different behavior types spend different amounts of time
  switch (profile.behaviorType) {
    case 'diligent':
      // Diligent learners spend full time or slightly more
      return Math.round(addVariance(blockDuration, 10));
    case 'speedster':
      // Speedsters rush through (40-60% of time)
      return Math.round(blockDuration * (0.4 + Math.random() * 0.2));
    case 'explorer':
      // Explorers may spend more or less depending on interest
      return Math.round(addVariance(blockDuration, 40));
    case 'struggler':
      // Strugglers take longer due to difficulty
      return Math.round(blockDuration * (1.2 + Math.random() * 0.5));
    case 'dropout':
      // Dropouts spend minimal time before giving up
      return Math.round(blockDuration * (0.2 + Math.random() * 0.3));
    default:
      return Math.round(addVariance(blockDuration, 20));
  }
}

// ============================================================================
// LEARNER AGENT CLASS
// ============================================================================

/**
 * AI Agent that simulates learner behavior
 */
export class LearnerAgent {
  private profile: LearnerProfile;
  private config: Required<LearnerAgentConfig>;
  private statements: Statement[];
  private registration: string;

  constructor(behaviorType: LearnerBehaviorType, config: LearnerAgentConfig = {}) {
    this.profile = createLearnerProfile(behaviorType);
    this.config = {
      simulateDelay: config.simulateDelay ?? false,
      baseDelayMs: config.baseDelayMs ?? DEFAULT_BASE_DELAY_MS,
      variancePercent: config.variancePercent ?? DEFAULT_VARIANCE_PERCENT,
    };
    this.statements = [];
    this.registration = uuidv4();
  }

  /**
   * Gets the learner profile
   */
  getProfile(): LearnerProfile {
    return this.profile;
  }

  /**
   * Gets all generated xAPI statements
   */
  getStatements(): Statement[] {
    return this.statements;
  }

  /**
   * Gets the registration ID for this learning session
   */
  getRegistration(): string {
    return this.registration;
  }

  /**
   * Resets the agent for a new course
   */
  reset(): void {
    this.statements = [];
    this.registration = uuidv4();
  }

  /**
   * Simulates interacting with a content block
   */
  async interactWithBlock(
    course: FullCourse,
    lesson: Lesson,
    block: ContentBlock,
  ): Promise<BlockInteraction> {
    const startTime = new Date();
    const blockDuration = (block.duration ?? 5) * 60; // Convert to seconds

    // Calculate time spent based on profile
    const timeSpent = calculateBlockTime(this.profile, blockDuration);

    // Simulate delay if configured
    if (this.config.simulateDelay) {
      const delay = Math.min(timeSpent * 10, this.config.baseDelayMs * 10); // Scale down for demo
      await simulateDelay(delay);
    }

    // Determine if block is completed
    const { attentionSpan, engagementLevel } = this.profile.attributes;
    const completionChance = (attentionSpan + engagementLevel) / 2;
    const completed = Math.random() * 100 < completionChance;

    // Calculate score for quiz/assessment blocks
    let score: number | undefined;
    let attempts = 1;
    let response: string | undefined;

    if (block.type === 'quiz' || block.type === 'assessment') {
      score = calculateScore(this.profile);

      // Strugglers may retry
      if (this.profile.behaviorType === 'struggler' && score < 70) {
        attempts = 2 + Math.floor(Math.random() * 2);
        score = Math.min(100, score + attempts * 5); // Slight improvement with retries
      }

      response = `Answered ${Math.round(score / 20)} out of 5 questions correctly`;
    }

    const endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + timeSpent);

    const interaction: BlockInteraction = {
      blockId: block.id,
      blockType: block.type,
      startedAt: startTime.toISOString(),
      completedAt: completed ? endTime.toISOString() : undefined,
      durationSeconds: timeSpent,
      completed,
      score,
      attempts,
      response,
    };

    // Generate xAPI statement
    const statement = generateBlockInteractionStatement(
      this.profile,
      course,
      lesson,
      block,
      interaction,
      this.registration,
      endTime.toISOString(),
    );
    this.statements.push(statement);

    return interaction;
  }

  /**
   * Simulates taking an assessment
   */
  async takeAssessment(course: FullCourse, assessmentId: string): Promise<AssessmentResult> {
    const startTime = new Date();

    // Calculate base score
    let score = calculateScore(this.profile);
    let attempts = 1;

    // Strugglers may retry
    if (this.profile.behaviorType === 'struggler' && score < 70) {
      attempts = Math.floor(Math.random() * 3) + 1;
      score = Math.min(100, score + attempts * 3);
    }

    // Diligent learners perform well
    if (this.profile.behaviorType === 'diligent') {
      score = Math.max(score, 80 + Math.floor(Math.random() * 20));
    }

    // Speedsters may miss questions due to rushing
    if (this.profile.behaviorType === 'speedster') {
      score = Math.max(40, score - Math.floor(Math.random() * 20));
    }

    const passingScore = 70;
    const passed = score >= passingScore;

    // Simulate assessment time
    const assessmentDuration = 15 * 60; // 15 minutes base
    const actualDuration = calculateBlockTime(this.profile, assessmentDuration);

    if (this.config.simulateDelay) {
      await simulateDelay(Math.min(actualDuration * 10, this.config.baseDelayMs * 50));
    }

    const endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + actualDuration);

    // Generate question results
    const numQuestions = 10;
    const correctCount = Math.round((score / 100) * numQuestions);
    const questionResults = Array.from({ length: numQuestions }, (_, i) => ({
      questionId: `q-${i + 1}`,
      correct: i < correctCount,
      response: i < correctCount ? 'Correct answer' : 'Incorrect answer',
      timeSpentSeconds: Math.floor(actualDuration / numQuestions),
    }));

    const result: AssessmentResult = {
      assessmentId,
      learnerId: this.profile.id,
      startedAt: startTime.toISOString(),
      completedAt: endTime.toISOString(),
      score,
      passed,
      passingScore,
      attempts,
      questionResults,
    };

    // Generate xAPI statement
    const statement = generateAssessmentStatement(
      this.profile,
      course,
      result,
      this.registration,
      endTime.toISOString(),
    );
    this.statements.push(statement);

    return result;
  }

  /**
   * Simulates consuming an entire course
   */
  async consumeCourse(course: FullCourse): Promise<CourseConsumption> {
    const startTime = new Date();
    const blockInteractions: BlockInteraction[] = [];
    const assessmentResults: AssessmentResult[] = [];
    let totalTime = 0;
    let completedBlocks = 0;
    let totalBlocks = 0;

    // Generate launch statement
    const launchStatement = generateLaunchStatement(
      this.profile,
      course,
      this.registration,
      startTime.toISOString(),
    );
    this.statements.push(launchStatement);

    // Count total blocks
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        totalBlocks += lesson.blocks.length;
      }
    }

    // Process each module
    let currentProgress = 0;
    let terminated = false;

    for (const mod of course.modules) {
      if (terminated) break;

      for (const lesson of mod.lessons) {
        if (terminated) break;

        // Check if learner will continue
        if (!willComplete(this.profile, currentProgress)) {
          terminated = true;

          // Generate termination statement
          const terminationStatement = generateTerminationStatement(
            this.profile,
            course,
            this.registration,
            currentProgress,
            totalTime,
            new Date().toISOString(),
          );
          this.statements.push(terminationStatement);
          break;
        }

        // Process each block in the lesson
        for (const block of lesson.blocks) {
          const interaction = await this.interactWithBlock(course, lesson, block);
          blockInteractions.push(interaction);
          totalTime += interaction.durationSeconds;

          if (interaction.completed) {
            completedBlocks++;
          }
        }

        // Update progress
        currentProgress = (completedBlocks / totalBlocks) * 100;

        // Generate progress statement
        const progressStatement = generateProgressStatement(
          this.profile,
          course,
          lesson,
          this.registration,
          Math.min(currentProgress, 100),
          totalTime,
          new Date().toISOString(),
        );
        this.statements.push(progressStatement);
      }
    }

    // Take final assessment if course was completed
    if (!terminated && currentProgress >= 80) {
      const assessment = await this.takeAssessment(course, `assessment-${course.id}`);
      assessmentResults.push(assessment);
    }

    const endTime = new Date();
    const completed = !terminated && currentProgress >= 100;

    // Generate completion statement if completed
    if (completed) {
      const avgScore =
        assessmentResults.length > 0
          ? assessmentResults.reduce((sum, a) => sum + a.score, 0) / assessmentResults.length
          : undefined;

      const completionStatement = generateCompletionStatement(
        this.profile,
        course,
        this.registration,
        totalTime,
        avgScore,
        endTime.toISOString(),
      );
      this.statements.push(completionStatement);
    }

    return {
      courseId: course.id,
      learnerId: this.profile.id,
      startedAt: startTime.toISOString(),
      completedAt: completed ? endTime.toISOString() : undefined,
      progress: Math.min(currentProgress, 100),
      completed,
      totalTimeSeconds: totalTime,
      blockInteractions,
      assessmentResults: assessmentResults.length > 0 ? assessmentResults : undefined,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates multiple learner agents with different behavior profiles
 */
export function createLearnerCohort(
  behaviorTypes: LearnerBehaviorType[],
  config?: LearnerAgentConfig,
): LearnerAgent[] {
  return behaviorTypes.map((type) => new LearnerAgent(type, config));
}

/**
 * Creates a balanced cohort with all behavior types
 */
export function createBalancedCohort(config?: LearnerAgentConfig): LearnerAgent[] {
  const allTypes: LearnerBehaviorType[] = [
    'diligent',
    'explorer',
    'struggler',
    'speedster',
    'dropout',
  ];
  return createLearnerCohort(allTypes, config);
}
