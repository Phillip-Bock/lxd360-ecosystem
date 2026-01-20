/**
 * =============================================================================
 * INSPIRE Studio - xAPI Analytics Service
 * =============================================================================
 *
 * Service for querying and analyzing xAPI statements from the LRS.
 * Provides aggregated analytics, learner progress, and reporting.
 *
 * @module lib/xapi/analytics-service
 * @version 1.0.0
 */

import type {
  AnalyticsQuery,
  AnalyticsResult,
  CompletionStatistics,
  ExtendedXAPIVerb,
  LRSConfig,
  ScoreStatistics,
  TimeSeriesPoint,
  XAPIStatement,
} from '@/types/xapi';
import { EXTENDED_VERB_IRIS, parseDurationToSeconds } from '@/types/xapi';
import type { LearnerProgress } from '@/types/xapi/index';

// Alias for backwards compatibility
const parseDuration = parseDurationToSeconds;

// =============================================================================
// ANALYTICS SERVICE
// =============================================================================

export class AnalyticsService {
  private config: LRSConfig;

  constructor(config: LRSConfig) {
    this.config = config;
  }

  // ----------------------------------------
  // QUERY METHODS
  // ----------------------------------------

  /**
   * Query statements from the LRS.
   */
  async queryStatements(query: AnalyticsQuery): Promise<XAPIStatement[]> {
    const url = new URL(`${this.config.endpoint}/statements`);

    if (query.actor) {
      url.searchParams.set(
        'agent',
        JSON.stringify({
          account: {
            homePage: 'https://inspire.lxd360.com',
            name: query.actor,
          },
        }),
      );
    }

    if (query.verb) {
      const verbs = Array.isArray(query.verb) ? query.verb : [query.verb];
      // LRS typically only supports single verb filter, query multiple and filter client-side
      if (verbs.length === 1) {
        url.searchParams.set('verb', EXTENDED_VERB_IRIS[verbs[0]]);
      }
    }

    if (query.activity) {
      url.searchParams.set('activity', query.activity);
    }

    if (query.registration) {
      url.searchParams.set('registration', query.registration);
    }

    if (query.since) {
      url.searchParams.set('since', query.since);
    }

    if (query.until) {
      url.searchParams.set('until', query.until);
    }

    if (query.limit) {
      url.searchParams.set('limit', String(query.limit));
    }

    if (query.ascending !== undefined) {
      url.searchParams.set('ascending', String(query.ascending));
    }

    const response = await this.fetch(url.toString());
    const data = await response.json();

    let statements: XAPIStatement[] = data.statements || [];

    // Client-side filter for multiple verbs
    if (query.verb && Array.isArray(query.verb) && query.verb.length > 1) {
      const verbIRIs = query.verb.map((v: ExtendedXAPIVerb) => EXTENDED_VERB_IRIS[v]);
      statements = statements.filter((s) => verbIRIs.includes(s.verb.id));
    }

    return statements;
  }

  /**
   * Get aggregate analytics for a query.
   */
  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const statements = await this.queryStatements({ ...query, limit: 10000 });

    return this.aggregateStatements(statements);
  }

  /**
   * Get learner progress for a lesson.
   */
  async getLearnerProgress(
    userId: string,
    lessonId: string,
    registration?: string,
  ): Promise<LearnerProgress | null> {
    const statements = await this.queryStatements({
      actor: userId,
      activity: `https://inspire.lxd360.com/activities/lesson/${lessonId}`,
      registration,
      ascending: true,
    });

    if (statements.length === 0) {
      return null;
    }

    return this.calculateProgress(statements, userId, lessonId, registration);
  }

  /**
   * Get all learner progress for a lesson (instructor view).
   */
  async getAllLearnersProgress(lessonId: string): Promise<LearnerProgress[]> {
    const statements = await this.queryStatements({
      activity: `https://inspire.lxd360.com/activities/lesson/${lessonId}`,
      ascending: true,
      limit: 10000,
    });

    // Group by actor
    const byActor = new Map<string, XAPIStatement[]>();
    for (const statement of statements) {
      const actorId = this.getActorId(statement.actor);
      if (!byActor.has(actorId)) {
        byActor.set(actorId, []);
      }
      byActor.get(actorId)?.push(statement);
    }

    // Calculate progress for each learner
    const progress: LearnerProgress[] = [];
    for (const [actorId, actorStatements] of byActor) {
      const p = this.calculateProgress(actorStatements, actorId, lessonId);
      if (p) {
        progress.push(p);
      }
    }

    return progress;
  }

  /**
   * Get score statistics for an activity.
   */
  async getScoreStatistics(activityId: string): Promise<ScoreStatistics | null> {
    const statements = await this.queryStatements({
      activity: activityId,
      verb: ['passed', 'failed', 'completed', 'scored'],
      limit: 10000,
    });

    const scores: number[] = [];
    for (const statement of statements) {
      if (statement.result?.score?.scaled !== undefined) {
        scores.push(statement.result.score.scaled);
      } else if (
        statement.result?.score?.raw !== undefined &&
        statement.result?.score?.max !== undefined
      ) {
        scores.push(statement.result.score.raw / statement.result.score.max);
      }
    }

    if (scores.length === 0) {
      return null;
    }

    return this.calculateScoreStats(scores);
  }

  /**
   * Get completion statistics for an activity.
   */
  async getCompletionStatistics(activityId: string): Promise<CompletionStatistics | null> {
    const statements = await this.queryStatements({
      activity: activityId,
      limit: 10000,
    });

    // Group by registration (attempt)
    const byRegistration = new Map<string, XAPIStatement[]>();
    for (const statement of statements) {
      const reg = statement.context?.registration || 'unknown';
      if (!byRegistration.has(reg)) {
        byRegistration.set(reg, []);
      }
      byRegistration.get(reg)?.push(statement);
    }

    let totalAttempts = 0;
    let completedCount = 0;
    let passedCount = 0;
    let totalDuration = 0;
    const attemptCounts = new Map<string, number>();

    for (const [_reg, regStatements] of byRegistration) {
      totalAttempts++;

      // Check for completion
      const hasCompleted = regStatements.some(
        (s) =>
          s.verb.id === EXTENDED_VERB_IRIS.completed ||
          s.verb.id === EXTENDED_VERB_IRIS.passed ||
          s.verb.id === EXTENDED_VERB_IRIS.failed,
      );

      if (hasCompleted) {
        completedCount++;
      }

      // Check for pass
      const hasPassed = regStatements.some((s) => s.verb.id === EXTENDED_VERB_IRIS.passed);
      if (hasPassed) {
        passedCount++;
      }

      // Calculate duration
      const completedStatement = regStatements.find(
        (s) =>
          s.verb.id === EXTENDED_VERB_IRIS.completed || s.verb.id === EXTENDED_VERB_IRIS.terminated,
      );
      if (completedStatement?.result?.duration) {
        totalDuration += parseDuration(completedStatement.result.duration);
      }

      // Count attempts per learner
      const actorId = this.getActorId(regStatements[0].actor);
      attemptCounts.set(actorId, (attemptCounts.get(actorId) || 0) + 1);
    }

    if (totalAttempts === 0) {
      return null;
    }

    const averageAttempts =
      attemptCounts.size > 0
        ? Array.from(attemptCounts.values()).reduce((a, b) => a + b, 0) / attemptCounts.size
        : 0;

    return {
      totalAttempts,
      completedCount,
      completionRate: totalAttempts > 0 ? completedCount / totalAttempts : 0,
      passedCount,
      passRate: completedCount > 0 ? passedCount / completedCount : 0,
      averageAttempts,
      averageDuration: completedCount > 0 ? totalDuration / completedCount : 0,
    };
  }

  /**
   * Get time series data for statements.
   */
  async getTimeSeries(
    query: AnalyticsQuery,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<TimeSeriesPoint[]> {
    const statements = await this.queryStatements({ ...query, ascending: true });

    const buckets = new Map<string, { count: number; verb?: string }>();

    for (const statement of statements) {
      if (!statement.timestamp) continue;

      const date = new Date(statement.timestamp);
      const key = this.getTimeSeriesKey(date, interval);

      const existing = buckets.get(key) || { count: 0 };
      existing.count++;
      buckets.set(key, existing);
    }

    return Array.from(buckets.entries()).map(([timestamp, data]) => ({
      timestamp,
      count: data.count,
      verb: data.verb,
    }));
  }

  // ----------------------------------------
  // HELPER METHODS
  // ----------------------------------------

  private async fetch(url: string): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Experience-API-Version': this.config.version || '1.0.3',
    };

    if (this.config.auth) {
      headers.Authorization = this.config.auth;
    } else if (this.config.username && this.config.password) {
      const auth = btoa(`${this.config.username}:${this.config.password}`);
      headers.Authorization = `Basic ${auth}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`LRS request failed: ${response.statusText}`);
    }

    return response;
  }

  private getActorId(actor: XAPIStatement['actor']): string {
    // Handle Agent types
    if ('mbox' in actor && actor.mbox) {
      return actor.mbox.replace('mailto:', '');
    }
    if ('account' in actor && actor.account) {
      return actor.account.name;
    }
    if ('mbox_sha1sum' in actor && actor.mbox_sha1sum) {
      return actor.mbox_sha1sum;
    }
    if ('openid' in actor && actor.openid) {
      return actor.openid;
    }
    return 'unknown';
  }

  private getObjectId(object: XAPIStatement['object']): string | null {
    // Activity has an 'id' property
    if ('id' in object && typeof object.id === 'string') {
      return object.id;
    }
    return null;
  }

  private aggregateStatements(statements: XAPIStatement[]): AnalyticsResult {
    const actors = new Set<string>();
    const verbCounts: Record<string, number> = {};
    const activityCounts: Record<string, number> = {};
    const scores: number[] = [];

    for (const statement of statements) {
      // Count actors
      actors.add(this.getActorId(statement.actor));

      // Count verbs
      const verbName = statement.verb.display?.['en-US'] || statement.verb.id;
      verbCounts[verbName] = (verbCounts[verbName] || 0) + 1;

      // Count activities
      const activityId = this.getObjectId(statement.object);
      if (activityId) {
        activityCounts[activityId] = (activityCounts[activityId] || 0) + 1;
      }

      // Collect scores
      if (statement.result?.score?.scaled !== undefined) {
        scores.push(statement.result.score.scaled);
      }
    }

    const result: AnalyticsResult = {
      totalStatements: statements.length,
      uniqueActors: actors.size,
      verbCounts,
      activityCounts,
    };

    if (scores.length > 0) {
      result.scoreStats = this.calculateScoreStats(scores);
    }

    return result;
  }

  private calculateProgress(
    statements: XAPIStatement[],
    userId: string,
    lessonId: string,
    registration?: string,
  ): LearnerProgress | null {
    if (statements.length === 0) return null;

    const completedActivities = new Set<string>();
    let totalScore = 0;
    let maxPossibleScore = 0;
    let totalTimeSpent = 0;
    let completionStatus: LearnerProgress['completionStatus'] = 'not-started';
    let successStatus: LearnerProgress['successStatus'] = 'unknown';
    const attemptCount = 1;

    const firstStatement = statements[0];
    const lastStatement = statements[statements.length - 1];

    for (const statement of statements) {
      const verbId = statement.verb.id;

      // Track completed activities
      if (verbId === EXTENDED_VERB_IRIS.completed || verbId === EXTENDED_VERB_IRIS.passed) {
        const objectId = this.getObjectId(statement.object);
        if (objectId) {
          completedActivities.add(objectId);

          if (objectId.includes(`/lesson/${lessonId}`)) {
            completionStatus = 'completed';
          }
        }
      }

      // Track progress
      if (verbId === EXTENDED_VERB_IRIS.progressed || verbId === EXTENDED_VERB_IRIS.initialized) {
        if (completionStatus === 'not-started') {
          completionStatus = 'in-progress';
        }
      }

      // Track success
      if (verbId === EXTENDED_VERB_IRIS.passed) {
        successStatus = 'passed';
      } else if (verbId === EXTENDED_VERB_IRIS.failed && successStatus !== 'passed') {
        successStatus = 'failed';
      }

      // Track scores
      if (statement.result?.score) {
        if (statement.result.score.raw !== undefined) {
          totalScore += statement.result.score.raw;
        }
        if (statement.result.score.max !== undefined) {
          maxPossibleScore += statement.result.score.max;
        }
      }

      // Track duration
      if (statement.result?.duration) {
        totalTimeSpent += parseDuration(statement.result.duration);
      }
    }

    // Calculate progress percentage from result extensions or completed activities
    let progressPercentage = 0;
    const progressExtensionKey = 'https://w3id.org/xapi/cmi5/result/extensions/progress';
    const progressStatement = [...statements].reverse().find((s) => {
      const result = s.result as Record<string, unknown> | undefined;
      const extensions = result?.extensions as Record<string, unknown> | undefined;
      return extensions?.[progressExtensionKey] !== undefined;
    });

    if (progressStatement?.result) {
      const result = progressStatement.result as Record<string, unknown>;
      const extensions = result?.extensions as Record<string, unknown> | undefined;
      progressPercentage = (extensions?.[progressExtensionKey] as number) || 0;
    }

    return {
      userId,
      lessonId,
      registration: registration || statements[0].context?.registration || '',

      progressPercentage,
      completedActivities: Array.from(completedActivities),
      totalActivities: completedActivities.size, // This would need to come from lesson metadata

      firstAccessed: firstStatement.timestamp || new Date().toISOString(),
      lastAccessed: lastStatement.timestamp || new Date().toISOString(),
      totalTimeSpent,

      currentScore: totalScore,
      maxPossibleScore,
      scaledScore: maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0,

      completionStatus,
      successStatus,

      attemptCount,
      currentAttempt: attemptCount,
    };
  }

  private calculateScoreStats(scores: number[]): ScoreStatistics {
    const sorted = [...scores].sort((a, b) => a - b);
    const count = sorted.length;

    const min = sorted[0];
    const max = sorted[count - 1];
    const mean = sorted.reduce((a, b) => a + b, 0) / count;
    const median =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];

    // Standard deviation
    const squaredDiffs = sorted.map((score) => (score - mean) ** 2);
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
    const standardDeviation = Math.sqrt(avgSquaredDiff);

    // Distribution (10 buckets)
    const bucketSize = 0.1;
    const distribution: ScoreStatistics['distribution'] = [];
    for (let i = 0; i < 10; i++) {
      const rangeStart = i * bucketSize;
      const rangeEnd = (i + 1) * bucketSize;
      const bucketCount = sorted.filter((s) => s >= rangeStart && s < rangeEnd).length;
      distribution.push({
        rangeStart,
        rangeEnd,
        count: bucketCount,
        percentage: count > 0 ? bucketCount / count : 0,
      });
    }

    return {
      count,
      min,
      max,
      mean,
      median,
      standardDeviation,
      distribution,
    };
  }

  private getTimeSeriesKey(date: Date, interval: 'hour' | 'day' | 'week' | 'month'): string {
    switch (interval) {
      case 'hour':
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
        ).toISOString();
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.toISOString();
      }
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      default:
        return date.toISOString();
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let analyticsService: AnalyticsService | null = null;

/**
 * Initialize the analytics service.
 */
export function initializeAnalytics(config: LRSConfig): AnalyticsService {
  analyticsService = new AnalyticsService(config);
  return analyticsService;
}

/**
 * Get the analytics service instance.
 */
export function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    throw new Error('Analytics service not initialized. Call initializeAnalytics first.');
  }
  return analyticsService;
}

/**
 * Check if analytics service is initialized.
 */
export function hasAnalyticsService(): boolean {
  return analyticsService !== null;
}
