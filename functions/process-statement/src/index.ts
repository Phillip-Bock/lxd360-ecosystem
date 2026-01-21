/**
 * Cloud Function: Process xAPI Statement
 *
 * Triggered by Pub/Sub when a new xAPI statement is published.
 * Performs:
 * 1. Extract interaction data for real-time Firestore
 * 2. Update learner mastery state (BKT)
 * 3. Generate recommendations if needed
 *
 * @module functions/process-statement
 */

import { FieldValue, Firestore } from '@google-cloud/firestore';
import type { CloudEvent } from '@google-cloud/functions-framework';

// Initialize Firestore
const firestore = new Firestore();

// ============================================================================
// TYPES
// ============================================================================

interface PubSubMessage {
  data: string;
  attributes?: Record<string, string>;
}

interface XAPIStatement {
  id: string;
  actor: {
    account?: { homePage: string; name: string };
    mbox?: string;
  };
  verb: { id: string; display?: Record<string, string> };
  object: {
    id: string;
    objectType?: string;
    definition?: {
      type?: string;
      name?: Record<string, string>;
    };
  };
  result?: {
    success?: boolean;
    completion?: boolean;
    score?: { scaled?: number; raw?: number };
    duration?: string;
    response?: string;
    extensions?: Record<string, unknown>;
  };
  context?: {
    registration?: string;
    extensions?: Record<string, unknown>;
  };
  timestamp: string;
}

interface MasteryState {
  skillId: string;
  pMastery: number;
  pLearn: number;
  pGuess: number;
  pSlip: number;
  opportunities: number;
  correctCount: number;
  incorrectCount: number;
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string | null;
  lastUpdated: FirebaseFirestore.Timestamp;
  lastInteractionId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INSPIRE_NS = 'https://lxd360.com/xapi/extensions';

const INSPIRE_EXTENSIONS = {
  SESSION_ID: `${INSPIRE_NS}/session-id`,
  SKILL_ID: `${INSPIRE_NS}/skill-id`,
  BLOCK_ID: `${INSPIRE_NS}/block-id`,
  BLOCK_TYPE: `${INSPIRE_NS}/block-type`,
  LATENCY: `${INSPIRE_NS}/latency`,
  COGNITIVE_LOAD: `${INSPIRE_NS}/cognitive-load`,
  CONSENT_TIER: `${INSPIRE_NS}/consent-tier`,
};

// BKT default parameters
const DEFAULT_BKT = {
  pLearn: 0.1,
  pGuess: 0.2,
  pSlip: 0.1,
};

// ============================================================================
// BKT ALGORITHM
// ============================================================================

function updateMastery(
  pMastery: number,
  correct: boolean,
  params: { pLearn: number; pGuess: number; pSlip: number },
): number {
  const { pLearn, pGuess, pSlip } = params;

  const pCorrectIfMastered = 1 - pSlip;
  const pCorrectIfNotMastered = pGuess;

  let pMasteredGivenObs: number;

  if (correct) {
    const numerator = pCorrectIfMastered * pMastery;
    const denominator = pCorrectIfMastered * pMastery + pCorrectIfNotMastered * (1 - pMastery);
    pMasteredGivenObs = numerator / denominator;
  } else {
    const pIncorrectIfMastered = pSlip;
    const pIncorrectIfNotMastered = 1 - pGuess;
    const numerator = pIncorrectIfMastered * pMastery;
    const denominator = pIncorrectIfMastered * pMastery + pIncorrectIfNotMastered * (1 - pMastery);
    pMasteredGivenObs = numerator / denominator;
  }

  const pMasteryAfterLearning = pMasteredGivenObs + (1 - pMasteredGivenObs) * pLearn;

  return Math.max(0, Math.min(1, pMasteryAfterLearning));
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Cloud Function entry point.
 */
export async function processStatement(event: CloudEvent<PubSubMessage>): Promise<void> {
  const message = event.data;
  if (!message?.data) {
    console.error('No data in Pub/Sub message');
    return;
  }

  // Decode the statement
  let statement: XAPIStatement;
  try {
    const decoded = Buffer.from(message.data, 'base64').toString('utf-8');
    statement = JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse statement:', error);
    return;
  }

  const tenantId = message.attributes?.tenantId;
  if (!tenantId) {
    console.error('No tenantId in message attributes');
    return;
  }

  // Extract actor ID
  const actorId = statement.actor.account?.name ?? statement.actor.mbox ?? 'unknown';

  // Extract INSPIRE extensions
  const extensions = statement.context?.extensions ?? {};
  const resultExtensions = statement.result?.extensions ?? {};
  const sessionId = extensions[INSPIRE_EXTENSIONS.SESSION_ID] as string | undefined;
  const skillId = (extensions[INSPIRE_EXTENSIONS.SKILL_ID] ??
    resultExtensions[INSPIRE_EXTENSIONS.SKILL_ID]) as string | undefined;
  const blockId = extensions[INSPIRE_EXTENSIONS.BLOCK_ID] as string | undefined;
  const blockType = extensions[INSPIRE_EXTENSIONS.BLOCK_TYPE] as string | undefined;
  const latencyMs = resultExtensions[INSPIRE_EXTENSIONS.LATENCY] as number | undefined;

  console.log(`Processing statement ${statement.id} for learner ${actorId} in tenant ${tenantId}`);

  // ============================================================================
  // 1. WRITE INTERACTION TO FIRESTORE
  // ============================================================================

  const interactionRef = firestore
    .collection('tenants')
    .doc(tenantId)
    .collection('learners')
    .doc(actorId)
    .collection('interactions')
    .doc(statement.id);

  await interactionRef.set({
    id: statement.id,
    tenantId,
    learnerId: actorId,
    activityId: statement.object.id,
    activityType: statement.object.definition?.type ?? null,
    blockId: blockId ?? null,
    blockType: blockType ?? null,
    verb: statement.verb.id,
    success: statement.result?.success ?? null,
    completion: statement.result?.completion ?? null,
    scoreScaled: statement.result?.score?.scaled ?? null,
    response: statement.result?.response ?? null,
    latencyMs: latencyMs ?? null,
    skillId: skillId ?? null,
    sessionId: sessionId ?? null,
    timestamp: new Date(statement.timestamp),
    xapiStatementId: statement.id,
  });

  // ============================================================================
  // 2. UPDATE MASTERY STATE (if skill is tracked)
  // ============================================================================

  if (skillId && statement.result?.success !== undefined) {
    const masteryRef = firestore
      .collection('tenants')
      .doc(tenantId)
      .collection('learners')
      .doc(actorId)
      .collection('masteryStates')
      .doc(skillId);

    await firestore.runTransaction(async (transaction) => {
      const masteryDoc = await transaction.get(masteryRef);

      let currentState: MasteryState;
      if (masteryDoc.exists) {
        currentState = masteryDoc.data() as MasteryState;
      } else {
        // Initialize new mastery state
        currentState = {
          skillId,
          pMastery: 0.0,
          pLearn: DEFAULT_BKT.pLearn,
          pGuess: DEFAULT_BKT.pGuess,
          pSlip: DEFAULT_BKT.pSlip,
          opportunities: 0,
          correctCount: 0,
          incorrectCount: 0,
          easinessFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: null,
          lastUpdated: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
          lastInteractionId: statement.id,
        };
      }

      // Update BKT mastery
      // Safe to access - we checked statement.result?.success !== undefined above
      const success = statement.result?.success ?? false;
      const newPMastery = updateMastery(currentState.pMastery, success, {
        pLearn: currentState.pLearn,
        pGuess: currentState.pGuess,
        pSlip: currentState.pSlip,
      });

      const correct = success;

      transaction.set(masteryRef, {
        ...currentState,
        pMastery: newPMastery,
        opportunities: currentState.opportunities + 1,
        correctCount: currentState.correctCount + (correct ? 1 : 0),
        incorrectCount: currentState.incorrectCount + (correct ? 0 : 1),
        lastUpdated: FieldValue.serverTimestamp(),
        lastInteractionId: statement.id,
      });

      console.log(
        `Updated mastery for skill ${skillId}: ${currentState.pMastery.toFixed(3)} -> ${newPMastery.toFixed(3)}`,
      );
    });
  }

  // ============================================================================
  // 3. CHECK FOR RECOMMENDATIONS (if struggling)
  // ============================================================================

  if (
    skillId &&
    statement.result?.success === false &&
    statement.verb.id === 'http://adlnet.gov/expapi/verbs/answered'
  ) {
    // Check recent performance
    const recentInteractions = await firestore
      .collection('tenants')
      .doc(tenantId)
      .collection('learners')
      .doc(actorId)
      .collection('interactions')
      .where('skillId', '==', skillId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    const recentResults = recentInteractions.docs.map((doc) => doc.data().success);
    const incorrectCount = recentResults.filter((r) => r === false).length;

    // If 3+ incorrect in last 5, create recommendation
    if (incorrectCount >= 3) {
      const recommendationRef = firestore
        .collection('tenants')
        .doc(tenantId)
        .collection('learners')
        .doc(actorId)
        .collection('recommendations')
        .doc();

      await recommendationRef.set({
        id: recommendationRef.id,
        type: 'intervention',
        targetActivityId: statement.object.id,
        targetActivityName: statement.object.definition?.name?.['en-US'] ?? 'Unknown',
        suggestedModality: 'video', // Default to video for struggling learners
        confidence: 0.8,
        explanation: {
          shortExplanation:
            "You've had difficulty with recent questions. Let's try a different approach.",
          featureContributions: [
            {
              factor: 'Recent incorrect answers',
              value: `${incorrectCount} in last 5 attempts`,
              weight: 0.8,
              direction: 'supports',
            },
          ],
          modelVersion: '1.0.0',
          generatedAt: new Date().toISOString(),
        },
        overrideOptions: {
          canSkip: true,
          canAdjustDifficulty: true,
          canChangeModality: true,
          alternatives: [],
        },
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      console.log(`Created intervention recommendation for learner ${actorId} on skill ${skillId}`);
    }
  }

  console.log(`Successfully processed statement ${statement.id}`);
}
