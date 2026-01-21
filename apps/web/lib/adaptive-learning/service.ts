// TODO(LXD-301): Replace with Firestore client
// Define a minimal client interface for the migration period
interface DatabaseClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
    upsert: (data: unknown, options?: unknown) => Promise<{ data: unknown; error: unknown }>;
    insert: (data: unknown) => Promise<{ data: unknown; error: unknown }>;
    update: (data: unknown) => {
      eq: (column: string, value: string) => Promise<{ data: unknown; error: unknown }>;
    };
  };
}

import {
  type AttemptInsights,
  type AttemptRecord,
  createInitialKnowledgeState,
  DEFAULT_BKT_PARAMS,
  type KnowledgeState,
  SAFETY_CRITICAL_BKT_PARAMS,
  updateKnowledgeState,
} from './bkt';
import {
  type CognitiveLoadAssessment,
  CognitiveLoadDetector,
  type TelemetryEvent,
} from './cognitive-load';

// ============================================================================
// TYPES
// ============================================================================

export interface SkillDefinition {
  skillId: string;
  skillName: string;
  isSafetyCritical: boolean;
  expectedResponseTimeMs?: number;
  prerequisites?: string[];
}

export interface ProcessedAttempt {
  knowledgeState: KnowledgeState;
  insights: AttemptInsights;
  cognitiveLoad?: CognitiveLoadAssessment;
}

// ============================================================================
// ADAPTIVE LEARNING SERVICE
// ============================================================================

/**
 * Main service class for adaptive learning operations
 */
export class AdaptiveLearningService {
  private cognitiveLoadDetector: CognitiveLoadDetector;
  private knowledgeCache: Map<string, KnowledgeState> = new Map();

  constructor(
    _db: DatabaseClient,
    private tenantId?: string,
  ) {
    this.cognitiveLoadDetector = new CognitiveLoadDetector(300); // 5 min window
  }

  // --------------------------------------------------------------------------
  // KNOWLEDGE STATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Get or create knowledge state for a learner-skill pair
   */
  async getKnowledgeState(
    learnerId: string,
    skillId: string,
    skillDef?: SkillDefinition,
  ): Promise<KnowledgeState> {
    const cacheKey = `${learnerId}:${skillId}`;

    // Check cache first
    const cached = this.knowledgeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO(LXD-301): Implement Firestore query
    // For now, return initial state since database is not configured
    const newState = createInitialKnowledgeState(
      learnerId,
      skillId,
      skillDef?.skillName ?? skillId,
      {
        expectedResponseTimeMs: skillDef?.expectedResponseTimeMs,
        tenantId: this.tenantId,
        isSafetyCritical: skillDef?.isSafetyCritical ?? false,
        params: skillDef?.isSafetyCritical ? SAFETY_CRITICAL_BKT_PARAMS : DEFAULT_BKT_PARAMS,
      },
    );

    this.knowledgeCache.set(cacheKey, newState);
    return newState;
  }

  /**
   * Save knowledge state to learner_profiles.knowledge
   */
  async saveKnowledgeState(state: KnowledgeState): Promise<void> {
    const cacheKey = `${state.learnerId}:${state.skillId}`;
    this.knowledgeCache.set(cacheKey, state);

    // TODO(LXD-301): Implement Firestore persistence
    // Database operations are disabled during migration
  }

  // --------------------------------------------------------------------------
  // MAIN PROCESSING
  // --------------------------------------------------------------------------

  /**
   * Process a learning attempt and update all relevant state
   * This is the main entry point for the adaptive learning system
   */
  async processAttempt(
    learnerId: string,
    sessionId: string,
    attempt: AttemptRecord,
    skillDef?: SkillDefinition,
  ): Promise<ProcessedAttempt> {
    // 1. Get current knowledge state
    const currentState = await this.getKnowledgeState(learnerId, attempt.skillId, skillDef);

    // 2. Run BKT update
    const { updatedState, insights } = updateKnowledgeState(currentState, attempt);

    // 3. Save updated state
    await this.saveKnowledgeState(updatedState);

    // 4. Run cognitive load assessment
    const telemetryEvent: TelemetryEvent = {
      timestamp: attempt.timestamp ?? new Date(),
      responseTimeMs: attempt.responseTimeMs,
      correct: attempt.correct,
      confidenceRating: attempt.confidenceRating,
      revisionCount: attempt.revisionCount,
      rageClicks: attempt.rageClicks,
    };

    const cognitiveLoad = this.cognitiveLoadDetector.assess(
      learnerId,
      sessionId,
      telemetryEvent,
      attempt.skillId,
    );

    // 5. Save cognitive load assessment (disabled during migration)
    // await this.saveCognitiveLoad(learnerId, sessionId, cognitiveLoad);

    // 6. Check and save interventions (disabled during migration)
    // if (insights.interventionRecommended) {
    //   await this.saveIntervention(learnerId, sessionId, insights.interventionRecommended);
    // }

    return {
      knowledgeState: updatedState,
      insights,
      cognitiveLoad,
    };
  }

  /**
   * Process an xAPI statement into an attempt record and run through ML
   */
  async processXAPIStatement(
    learnerId: string,
    sessionId: string,
    statement: {
      verb: { id: string };
      object: { id: string; definition?: { type?: string } };
      result?: {
        success?: boolean;
        score?: { scaled?: number };
        duration?: string;
        extensions?: Record<string, unknown>;
      };
      context?: {
        extensions?: Record<string, unknown>;
      };
      timestamp?: string;
    },
    skillId: string,
    skillDef?: SkillDefinition,
  ): Promise<ProcessedAttempt | null> {
    // Only process assessment verbs
    const assessmentVerbs = [
      'http://adlnet.gov/expapi/verbs/answered',
      'http://adlnet.gov/expapi/verbs/attempted',
      'http://adlnet.gov/expapi/verbs/completed',
    ];

    if (!assessmentVerbs.includes(statement.verb.id)) {
      return null;
    }

    // Extract behavioral telemetry from extensions
    const behaviorExt = statement.result?.extensions ?? {};

    // Parse duration to milliseconds
    let responseTimeMs = 5000; // Default
    if (statement.result?.duration) {
      // ISO 8601 duration: PT30S = 30 seconds
      const match = statement.result.duration.match(/PT(\d+(?:\.\d+)?)S/);
      if (match) {
        responseTimeMs = parseFloat(match[1]) * 1000;
      }
    }

    // Build attempt record
    const attempt: AttemptRecord = {
      skillId,
      correct: statement.result?.success ?? false,
      responseTimeMs,
      confidenceRating: behaviorExt['https://lxp360.com/xapi/extensions/confidence'] as
        | number
        | undefined,
      revisionCount: behaviorExt['https://lxp360.com/xapi/extensions/revisions'] as
        | number
        | undefined,
      timeToFirstActionMs: behaviorExt['https://lxp360.com/xapi/extensions/time_to_first_action'] as
        | number
        | undefined,
      rageClicks: behaviorExt['https://lxp360.com/xapi/extensions/rage_clicks'] as
        | number
        | undefined,
      timestamp: statement.timestamp ? new Date(statement.timestamp) : new Date(),
    };

    return this.processAttempt(learnerId, sessionId, attempt, skillDef);
  }

  // --------------------------------------------------------------------------
  // QUERY HELPERS
  // --------------------------------------------------------------------------

  /**
   * Get all knowledge states for a learner
   */
  async getAllKnowledgeStates(learnerId: string): Promise<KnowledgeState[]> {
    // TODO(LXD-301): Implement Firestore persistence
    // Return cached states for now
    const states: KnowledgeState[] = [];
    this.knowledgeCache.forEach((state) => {
      if (state.learnerId === learnerId) {
        states.push(state);
      }
    });
    return states;
  }

  /**
   * Get skills due for review (spaced repetition)
   */
  async getSkillsDueForReview(learnerId: string): Promise<KnowledgeState[]> {
    const allStates = await this.getAllKnowledgeStates(learnerId);
    const now = new Date();

    return allStates.filter((s) => s.nextReviewDue && s.nextReviewDue <= now);
  }

  /**
   * Get recent cognitive load history
   */
  async getCognitiveLoadHistory(
    _learnerId: string,
    _sessionId?: string,
    _limit: number = 20,
  ): Promise<Array<{ timestamp: Date; level: string; score: number }>> {
    // TODO(LXD-301): Implement Firestore persistence
    return [];
  }

  /**
   * Get pending interventions for a learner
   */
  async getPendingInterventions(
    _learnerId: string,
    _sessionId?: string,
  ): Promise<Array<{ id: string; type: string; message: string; severity: string }>> {
    // TODO(LXD-301): Implement Firestore persistence
    return [];
  }

  /**
   * Mark intervention as acknowledged
   */
  async acknowledgeIntervention(_alertId: string, _learnerId: string): Promise<void> {
    // TODO(LXD-301): Implement Firestore persistence
  }

  // --------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * End a learning session and clean up
   */
  endSession(learnerId: string, sessionId: string): void {
    this.cognitiveLoadDetector.clearSession(learnerId, sessionId);
  }

  /**
   * Clear the knowledge cache (useful for testing or session reset)
   */
  clearCache(): void {
    this.knowledgeCache.clear();
  }
}
