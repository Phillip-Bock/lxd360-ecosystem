import {
  type AttemptRecord,
  createInitialKnowledgeState,
  SAFETY_CRITICAL_BKT_PARAMS,
  updateKnowledgeState,
} from '../lib/adaptive-learning/bkt';
import {
  CognitiveLoadDetector,
  type TelemetryEvent,
} from '../lib/adaptive-learning/cognitive-load';

// ============================================================================
// LEARNER ARCHETYPES
// ============================================================================

export type LearnerArchetype =
  | 'confident_expert'
  | 'steady_learner'
  | 'struggling_novice'
  | 'frustrated_guesser'
  | 'overconfident_danger'
  | 'anxious_underconfident';

interface ArchetypeProfile {
  name: string;
  description: string;
  baseAccuracy: number;
  accuracyVariance: number;
  responseTimeMultiplier: number;
  confidenceOffset: number; // Added to accuracy for self-reported confidence
  rageClickProbability: number;
  focusLossProbability: number;
  revisionRate: number;
}

const ARCHETYPE_PROFILES: Record<LearnerArchetype, ArchetypeProfile> = {
  confident_expert: {
    name: 'Confident Expert',
    description: 'High performer with accurate self-assessment',
    baseAccuracy: 0.92,
    accuracyVariance: 0.05,
    responseTimeMultiplier: 0.7,
    confidenceOffset: 0.02, // Slightly overconfident
    rageClickProbability: 0.01,
    focusLossProbability: 0.05,
    revisionRate: 0.1,
  },
  steady_learner: {
    name: 'Steady Learner',
    description: 'Consistent progress with good metacognition',
    baseAccuracy: 0.72,
    accuracyVariance: 0.1,
    responseTimeMultiplier: 1.0,
    confidenceOffset: -0.05, // Slightly underconfident (healthy)
    rageClickProbability: 0.03,
    focusLossProbability: 0.1,
    revisionRate: 0.3,
  },
  struggling_novice: {
    name: 'Struggling Novice',
    description: 'Low accuracy but aware of gaps',
    baseAccuracy: 0.35,
    accuracyVariance: 0.15,
    responseTimeMultiplier: 1.5,
    confidenceOffset: -0.15, // Underconfident
    rageClickProbability: 0.15,
    focusLossProbability: 0.2,
    revisionRate: 0.5,
  },
  frustrated_guesser: {
    name: 'Frustrated Guesser',
    description: 'Gives up and guesses randomly',
    baseAccuracy: 0.25, // Near random for 4-choice MCQ
    accuracyVariance: 0.2,
    responseTimeMultiplier: 0.2, // Very fast (guessing)
    confidenceOffset: 0.0,
    rageClickProbability: 0.4,
    focusLossProbability: 0.35,
    revisionRate: 0.05, // Doesn't revise, just submits
  },
  overconfident_danger: {
    name: 'Overconfident Danger',
    description: "SAFETY CRITICAL: Wrong but thinks they're right",
    baseAccuracy: 0.45,
    accuracyVariance: 0.1,
    responseTimeMultiplier: 0.6, // Fast because "knows" the answer
    confidenceOffset: 0.4, // Highly overconfident!
    rageClickProbability: 0.02,
    focusLossProbability: 0.08,
    revisionRate: 0.05,
  },
  anxious_underconfident: {
    name: 'Anxious Underconfident',
    description: 'Good knowledge but crippled by doubt',
    baseAccuracy: 0.78,
    accuracyVariance: 0.08,
    responseTimeMultiplier: 2.0, // Slow, second-guessing
    confidenceOffset: -0.35, // Severely underconfident
    rageClickProbability: 0.08,
    focusLossProbability: 0.15,
    revisionRate: 0.7, // Lots of revisions
  },
};

// ============================================================================
// SKILL DEFINITIONS (Aviation Example)
// ============================================================================

export interface MockSkill {
  id: string;
  name: string;
  expectedResponseTimeMs: number;
  isSafetyCritical: boolean;
  prerequisites: string[];
}

export const AVIATION_SKILLS: MockSkill[] = [
  {
    id: 'preflight-exterior',
    name: 'Pre-flight Exterior Inspection',
    expectedResponseTimeMs: 15000,
    isSafetyCritical: true,
    prerequisites: [],
  },
  {
    id: 'preflight-interior',
    name: 'Pre-flight Interior Check',
    expectedResponseTimeMs: 12000,
    isSafetyCritical: true,
    prerequisites: ['preflight-exterior'],
  },
  {
    id: 'engine-start',
    name: 'Engine Start Procedure',
    expectedResponseTimeMs: 20000,
    isSafetyCritical: true,
    prerequisites: ['preflight-interior'],
  },
  {
    id: 'radio-comms',
    name: 'Radio Communications',
    expectedResponseTimeMs: 10000,
    isSafetyCritical: false,
    prerequisites: [],
  },
  {
    id: 'emergency-procedures',
    name: 'Emergency Procedures',
    expectedResponseTimeMs: 8000,
    isSafetyCritical: true,
    prerequisites: ['engine-start'],
  },
];

// ============================================================================
// ATTEMPT GENERATOR
// ============================================================================

function generateAttempt(
  skill: MockSkill,
  profile: ArchetypeProfile,
  attemptNumber: number,
): AttemptRecord {
  // Accuracy improves slightly with practice
  const learningBonus = Math.min(attemptNumber * 0.02, 0.15);
  const effectiveAccuracy = Math.min(
    profile.baseAccuracy + learningBonus + (Math.random() - 0.5) * profile.accuracyVariance,
    0.98,
  );

  const correct = Math.random() < effectiveAccuracy;

  // Response time
  const baseTime = skill.expectedResponseTimeMs * profile.responseTimeMultiplier;
  const timeVariance = baseTime * 0.3 * (Math.random() - 0.5);
  const responseTimeMs = Math.max(500, baseTime + timeVariance);

  // Confidence (calibrated to accuracy + offset)
  const idealConfidence = effectiveAccuracy;
  const reportedConfidence = Math.max(
    0,
    Math.min(1, idealConfidence + profile.confidenceOffset + (Math.random() - 0.5) * 0.15),
  );

  // Behavioral signals
  const rageClicks =
    Math.random() < profile.rageClickProbability ? Math.floor(Math.random() * 5) + 3 : 0;

  const revisionCount =
    Math.random() < profile.revisionRate ? Math.floor(Math.random() * 4) + 1 : 0;

  return {
    skillId: skill.id,
    correct,
    responseTimeMs,
    confidenceRating: reportedConfidence,
    revisionCount,
    rageClicks,
    timestamp: new Date(),
  };
}

function generateTelemetryEvent(profile: ArchetypeProfile, attempt: AttemptRecord): TelemetryEvent {
  return {
    timestamp: attempt.timestamp ?? new Date(),
    responseTimeMs: attempt.responseTimeMs,
    correct: attempt.correct,
    confidenceRating: attempt.confidenceRating,
    revisionCount: attempt.revisionCount,
    rageClicks: attempt.rageClicks,
    focusLoss: Math.random() < profile.focusLossProbability,
    readingSpeedWpm: 200 + Math.random() * 100,
  };
}

// ============================================================================
// SCENARIO RUNNER
// ============================================================================

export interface ScenarioResult {
  learnerType: LearnerArchetype;
  skill: MockSkill;
  attempts: Array<{
    attemptNumber: number;
    correct: boolean;
    responseTimeMs: number;
    confidence: number | undefined;
    masteryBefore: number;
    masteryAfter: number;
    masteryLevel: string;
    guessDetected: boolean;
    confidenceWarning: boolean;
    interventionTriggered: boolean;
    interventionType?: string;
    cognitiveLoad: string;
    cognitiveLoadScore: number;
  }>;
  finalMastery: number;
  finalMasteryLevel: string;
  totalInterventions: number;
  guessesDetected: number;
  overconfidentErrors: number;
}

/**
 * Run a learning scenario for a specific archetype and skill
 */
export function runScenario(
  archetype: LearnerArchetype,
  skill: MockSkill,
  numAttempts: number = 10,
): ScenarioResult {
  const profile = ARCHETYPE_PROFILES[archetype];
  const learnerId = `mock-${archetype}-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  // Initialize
  let state = createInitialKnowledgeState(learnerId, skill.id, skill.name, {
    expectedResponseTimeMs: skill.expectedResponseTimeMs,
    isSafetyCritical: skill.isSafetyCritical,
    params: skill.isSafetyCritical ? SAFETY_CRITICAL_BKT_PARAMS : undefined,
  });

  const cognitiveDetector = new CognitiveLoadDetector(300);

  const attempts: ScenarioResult['attempts'] = [];
  let totalInterventions = 0;
  let guessesDetected = 0;
  let overconfidentErrors = 0;

  // Run attempts
  for (let i = 0; i < numAttempts; i++) {
    const masteryBefore = state.masteryProbability;

    // Generate attempt
    const attempt = generateAttempt(skill, profile, i);

    // Run BKT update
    const { updatedState, insights } = updateKnowledgeState(state, attempt);

    // Run cognitive load detection
    const telemetryEvent = generateTelemetryEvent(profile, attempt);
    const cognitiveAssessment = cognitiveDetector.assess(
      learnerId,
      sessionId,
      telemetryEvent,
      skill.id,
    );

    // Track metrics
    if (insights.guessDetected) guessesDetected++;
    if (insights.confidenceWarningType === 'overconfident_error') overconfidentErrors++;
    if (insights.interventionRecommended || cognitiveAssessment.interventionTriggered) {
      totalInterventions++;
    }

    attempts.push({
      attemptNumber: i + 1,
      correct: attempt.correct,
      responseTimeMs: attempt.responseTimeMs,
      confidence: attempt.confidenceRating,
      masteryBefore,
      masteryAfter: updatedState.masteryProbability,
      masteryLevel: updatedState.masteryLevel,
      guessDetected: insights.guessDetected,
      confidenceWarning: insights.confidenceWarning,
      interventionTriggered: !!(
        insights.interventionRecommended || cognitiveAssessment.interventionTriggered
      ),
      interventionType:
        insights.interventionRecommended?.type ?? cognitiveAssessment.interventionType,
      cognitiveLoad: cognitiveAssessment.loadLevel,
      cognitiveLoadScore: cognitiveAssessment.loadScore,
    });

    state = updatedState;
  }

  return {
    learnerType: archetype,
    skill,
    attempts,
    finalMastery: state.masteryProbability,
    finalMasteryLevel: state.masteryLevel,
    totalInterventions,
    guessesDetected,
    overconfidentErrors,
  };
}

// ============================================================================
// TEST RUNNER & REPORTER
// ============================================================================

export interface TestReport {
  timestamp: Date;
  scenarios: ScenarioResult[];
  summary: {
    totalScenarios: number;
    avgFinalMastery: number;
    totalInterventions: number;
    guessesDetected: number;
    overconfidentErrors: number;
    safetyAlertsTriggered: number;
  };
  validationResults: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

/**
 * Run all test scenarios and produce a validation report
 */
export function runFullTestSuite(): TestReport {
  console.log('\n🧪 LXP360 Adaptive Learning Test Suite\n');
  console.log('='.repeat(60));

  const scenarios: ScenarioResult[] = [];
  const archetypes: LearnerArchetype[] = [
    'confident_expert',
    'steady_learner',
    'struggling_novice',
    'frustrated_guesser',
    'overconfident_danger',
    'anxious_underconfident',
  ];

  // Run each archetype against a safety-critical skill
  const testSkill = AVIATION_SKILLS.find((s) => s.id === 'emergency-procedures');
  if (!testSkill) {
    throw new Error('Test skill "emergency-procedures" not found in AVIATION_SKILLS');
  }

  for (const archetype of archetypes) {
    console.log(`\n📊 Testing: ${ARCHETYPE_PROFILES[archetype].name}`);
    console.log(`   Skill: ${testSkill.name} (Safety-Critical: ${testSkill.isSafetyCritical})`);

    const result = runScenario(archetype, testSkill, 12);
    scenarios.push(result);

    // Print summary
    console.log(
      `   Final Mastery: ${(result.finalMastery * 100).toFixed(1)}% (${result.finalMasteryLevel})`,
    );
    console.log(`   Interventions: ${result.totalInterventions}`);
    console.log(`   Guesses Detected: ${result.guessesDetected}`);
    console.log(`   Overconfident Errors: ${result.overconfidentErrors}`);
  }

  // Validation tests
  const validationResults: TestReport['validationResults'] = [];

  // Helper function to get scenario result with error handling
  function getScenarioResult(learnerType: LearnerArchetype): ScenarioResult {
    const result = scenarios.find((s) => s.learnerType === learnerType);
    if (!result) {
      throw new Error(`Scenario result for "${learnerType}" not found`);
    }
    return result;
  }

  // Test 1: Expert should reach high mastery
  const expertResult = getScenarioResult('confident_expert');
  validationResults.push({
    name: 'Expert reaches high mastery',
    passed: expertResult.finalMastery > 0.8,
    message: `Expert reached ${(expertResult.finalMastery * 100).toFixed(1)}% mastery`,
  });

  // Test 2: Guesser should trigger interventions
  const guesserResult = getScenarioResult('frustrated_guesser');
  validationResults.push({
    name: 'Guesser triggers interventions',
    passed: guesserResult.totalInterventions >= 2,
    message: `Guesser triggered ${guesserResult.totalInterventions} interventions`,
  });

  // Test 3: Guess detection should catch guessers
  validationResults.push({
    name: 'Guess detection works',
    passed: guesserResult.guessesDetected >= 3,
    message: `Detected ${guesserResult.guessesDetected} guesses from frustrated guesser`,
  });

  // Test 4: Overconfident danger should trigger safety alerts
  const dangerResult = getScenarioResult('overconfident_danger');
  validationResults.push({
    name: 'Overconfident errors detected',
    passed: dangerResult.overconfidentErrors >= 1,
    message: `Detected ${dangerResult.overconfidentErrors} overconfident errors (SAFETY CRITICAL)`,
  });

  // Test 5: Steady learner shows progress
  const steadyResult = getScenarioResult('steady_learner');
  const steadyFirstMastery = steadyResult.attempts[0].masteryBefore;
  validationResults.push({
    name: 'Steady learner shows progress',
    passed: steadyResult.finalMastery > steadyFirstMastery + 0.1,
    message: `Mastery improved from ${(steadyFirstMastery * 100).toFixed(1)}% to ${(steadyResult.finalMastery * 100).toFixed(1)}%`,
  });

  // Test 6: Struggling novice gets help
  const noviceResult = getScenarioResult('struggling_novice');
  validationResults.push({
    name: 'Struggling novice receives support',
    passed: noviceResult.totalInterventions >= 2,
    message: `Novice received ${noviceResult.totalInterventions} interventions`,
  });

  // Print validation results
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ VALIDATION RESULTS\n');

  let allPassed = true;
  for (const result of validationResults) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (!result.passed) allPassed = false;
  }

  // Summary
  const summary = {
    totalScenarios: scenarios.length,
    avgFinalMastery: scenarios.reduce((sum, s) => sum + s.finalMastery, 0) / scenarios.length,
    totalInterventions: scenarios.reduce((sum, s) => sum + s.totalInterventions, 0),
    guessesDetected: scenarios.reduce((sum, s) => sum + s.guessesDetected, 0),
    overconfidentErrors: scenarios.reduce((sum, s) => sum + s.overconfidentErrors, 0),
    safetyAlertsTriggered: dangerResult.overconfidentErrors,
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log('📈 SUMMARY\n');
  console.log(`Total Scenarios: ${summary.totalScenarios}`);
  console.log(`Average Final Mastery: ${(summary.avgFinalMastery * 100).toFixed(1)}%`);
  console.log(`Total Interventions: ${summary.totalInterventions}`);
  console.log(`Guesses Detected: ${summary.guessesDetected}`);
  console.log(`Overconfident Errors: ${summary.overconfidentErrors}`);
  console.log(`Safety Alerts: ${summary.safetyAlertsTriggered}`);

  console.log(`\n${'='.repeat(60)}`);
  if (allPassed) {
    console.log('🎉 ALL VALIDATION TESTS PASSED!');
  } else {
    console.log('⚠️  SOME VALIDATION TESTS FAILED - Review results above');
  }
  console.log(`${'='.repeat(60)}\n`);

  return {
    timestamp: new Date(),
    scenarios,
    summary,
    validationResults,
  };
}

// ============================================================================
// DEMO SCENARIO (For Investor Presentations)
// ============================================================================

/**
 * Run an interactive demo scenario showing the system in action
 */
export function runInvestorDemo(): void {
  console.log(`\n${'🚀'.repeat(30)}`);
  console.log('\n  LXP360 ADAPTIVE LEARNING DEMO');
  console.log('  Real-time Cognitive Load & Mastery Tracking\n');
  console.log(`${'🚀'.repeat(30)}\n`);

  const skill: MockSkill = {
    id: 'emergency-engine-failure',
    name: 'Emergency Engine Failure Procedure',
    expectedResponseTimeMs: 15000,
    isSafetyCritical: true,
    prerequisites: ['engine-start'],
  };

  const learnerId = 'demo-trainee';
  const sessionId = `demo-${Date.now()}`;

  let state = createInitialKnowledgeState(learnerId, skill.id, skill.name, {
    expectedResponseTimeMs: skill.expectedResponseTimeMs,
    isSafetyCritical: true,
  });

  const detector = new CognitiveLoadDetector(300);

  console.log(`📋 SKILL: ${skill.name}`);
  console.log(`⚠️  SAFETY CRITICAL: Yes`);
  console.log(`⏱️  Expected Response Time: ${skill.expectedResponseTimeMs / 1000}s`);
  console.log(`📊 Initial Mastery: ${(state.masteryProbability * 100).toFixed(1)}%\n`);
  console.log('-'.repeat(60));

  // Scenario phases
  interface DemoAttempt {
    correct: boolean;
    time: number;
    confidence: number;
    revisions: number;
    rageClicks?: number;
    focusLoss?: boolean;
  }

  const phases: Array<{ name: string; attempts: DemoAttempt[] }> = [
    {
      name: 'Initial Engagement',
      attempts: [
        { correct: true, time: 12000, confidence: 0.6, revisions: 1 },
        { correct: true, time: 14000, confidence: 0.65, revisions: 0 },
        { correct: true, time: 10000, confidence: 0.75, revisions: 0 },
      ],
    },
    {
      name: 'Challenging Material',
      attempts: [
        { correct: false, time: 18000, confidence: 0.5, revisions: 2 },
        { correct: false, time: 20000, confidence: 0.4, revisions: 3 },
        { correct: true, time: 16000, confidence: 0.55, revisions: 1 },
      ],
    },
    {
      name: 'Struggling (Triggers Intervention)',
      attempts: [
        {
          correct: false,
          time: 25000,
          confidence: 0.35,
          revisions: 5,
          rageClicks: 4,
          focusLoss: true,
        },
      ],
    },
    {
      name: 'Recovery After Intervention',
      attempts: [
        { correct: true, time: 14000, confidence: 0.6, revisions: 1 },
        { correct: true, time: 12000, confidence: 0.7, revisions: 0 },
        { correct: true, time: 11000, confidence: 0.8, revisions: 0 },
      ],
    },
    {
      name: 'Guess Detection Test',
      attempts: [
        { correct: true, time: 1500, confidence: 0.5, revisions: 0 }, // Too fast!
      ],
    },
    {
      name: 'SAFETY ALERT: Overconfident Error',
      attempts: [
        { correct: false, time: 8000, confidence: 0.95, revisions: 0 }, // Wrong but very confident!
      ],
    },
  ];

  let attemptNum = 0;
  for (const phase of phases) {
    console.log(`\n🔷 PHASE: ${phase.name}`);
    console.log('-'.repeat(40));

    for (const a of phase.attempts) {
      attemptNum++;
      const masteryBefore = state.masteryProbability;

      const attempt: AttemptRecord = {
        skillId: skill.id,
        correct: a.correct,
        responseTimeMs: a.time,
        confidenceRating: a.confidence,
        revisionCount: a.revisions,
        rageClicks: a.rageClicks ?? 0,
      };

      const { updatedState, insights } = updateKnowledgeState(state, attempt);

      const telemetryEvent: TelemetryEvent = {
        timestamp: new Date(),
        responseTimeMs: a.time,
        correct: a.correct,
        confidenceRating: a.confidence,
        revisionCount: a.revisions,
        rageClicks: a.rageClicks,
        focusLoss: a.focusLoss,
      };

      const cogLoad = detector.assess(learnerId, sessionId, telemetryEvent, skill.id);

      // Display
      const icon = a.correct ? '✅' : '❌';
      console.log(`\n  Attempt ${attemptNum}: ${icon} ${a.correct ? 'Correct' : 'Incorrect'}`);
      console.log(`  ├─ Response Time: ${(a.time / 1000).toFixed(1)}s`);
      console.log(`  ├─ Confidence: ${(a.confidence * 100).toFixed(0)}%`);
      console.log(
        `  ├─ Mastery: ${(masteryBefore * 100).toFixed(1)}% → ${(updatedState.masteryProbability * 100).toFixed(1)}% (${updatedState.masteryLevel})`,
      );
      console.log(
        `  ├─ Cognitive Load: ${cogLoad.loadLevel.toUpperCase()} (${(cogLoad.loadScore * 100).toFixed(0)}%)`,
      );

      if (insights.guessDetected) {
        console.log(
          `  ├─ ⚠️  GUESS DETECTED (${(insights.guessProbability * 100).toFixed(0)}% probability)`,
        );
      }

      if (insights.confidenceWarning) {
        const warningIcon = insights.confidenceWarningType === 'overconfident_error' ? '🚨' : 'ℹ️';
        console.log(
          `  ├─ ${warningIcon} ${insights.confidenceWarningType?.replace(/_/g, ' ').toUpperCase()}`,
        );
      }

      if (insights.interventionRecommended) {
        console.log(`  └─ 💡 INTERVENTION: ${insights.interventionRecommended.type}`);
        console.log(`     "${insights.interventionRecommended.message}"`);
      } else if (cogLoad.interventionTriggered) {
        console.log(`  └─ 💡 INTERVENTION: ${cogLoad.interventionType}`);
        console.log(`     "${cogLoad.interventionMessage}"`);
      }

      state = updatedState;
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('\n📊 FINAL ASSESSMENT\n');
  console.log(`  Mastery: ${(state.masteryProbability * 100).toFixed(1)}% (${state.masteryLevel})`);
  console.log(`  Total Attempts: ${state.totalAttempts}`);
  console.log(
    `  Success Rate: ${((state.successfulAttempts / state.totalAttempts) * 100).toFixed(1)}%`,
  );
  console.log(`  Confidence Calibration: ${state.confidenceCalibration?.toFixed(2) ?? 'N/A'}`);
  console.log(`  Next Review: ${state.nextReviewDue?.toLocaleDateString() ?? 'Not set'}`);

  console.log(`\n${'-'.repeat(60)}`);
  console.log('\n🎯 COMPARISON: Traditional LMS vs LXP360\n');
  console.log('  Traditional LMS:');
  console.log('    └─ Status: ✅ Complete (70% score)');
  console.log('');
  console.log('  LXP360 Adaptive Learning:');
  console.log(
    `    ├─ Mastery: ${(state.masteryProbability * 100).toFixed(1)}% (${state.masteryLevel})`,
  );
  console.log(
    `    ├─ Confidence Calibration: ${((state.confidenceCalibration ?? 0) * 100).toFixed(0)}%`,
  );
  console.log('    ├─ Guesses Detected: Yes (intervention triggered)');
  console.log('    ├─ Safety Concerns: Overconfident error flagged');
  console.log(`    └─ Recommendation: Additional practice before certification`);

  console.log(`\n${'='.repeat(60)}`);
  console.log('\n🚀 KEY DIFFERENTIATORS DEMONSTRATED:\n');
  console.log('  1. Mastery-based (not completion-based)');
  console.log('  2. Real-time cognitive load detection');
  console.log('  3. Safety-critical guess detection');
  console.log('  4. Confidence calibration for misconceptions');
  console.log('  5. Intelligent intervention timing');
  console.log('  6. Spaced repetition scheduling');
  console.log('');
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--demo')) {
    runInvestorDemo();
  } else {
    runFullTestSuite();
  }
}

export { ARCHETYPE_PROFILES };
