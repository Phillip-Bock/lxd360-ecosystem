/**
 * JITAI — Just-In-Time Adaptive Interventions
 *
 * Behavioral intelligence layer implementing the Artemis vision:
 * - Doom-scroll prevention
 * - Speed bump interventions
 * - False confidence detection
 * - Micro-bridge generation
 *
 * @module jitai
 */

// Doom-Scroll Detection
export {
  calculateExpectedTime,
  generateSignal as generateDoomScrollSignal,
  getMetrics as getDoomScrollMetrics,
  recordBlockEngagement,
  resetSession as resetDoomScrollSession,
} from './doom-scroll';
// JITAI Engine (Orchestrator)
export {
  acceptIntervention,
  addGapToContext,
  clearInterventions,
  createContext,
  dismissIntervention,
  getPendingInterventions,
  type JITAIContext,
  type JITAIResult,
  onAssessmentResponse,
  onBlockComplete,
} from './engine';
// False Confidence Detection
export {
  calculateHesitationPenalty,
  detectFalseConfidence,
  explainFalseConfidence,
  generateFalseConfidenceIntervention,
} from './false-confidence';
// Micro-Bridge Generation
export {
  completeMicroBridge,
  createSkillGapFromMastery,
  explainMicroBridge,
  generateMicroBridge,
} from './micro-bridge';
// Speed Bump Interventions
export {
  explainSpeedBump,
  generateSpeedBump,
  shouldTriggerSpeedBump,
} from './speed-bump';
// Types
export type {
  BehavioralSignal,
  BehavioralSignalType,
  ContentBlock,
  DoomScrollMetrics,
  FalseConfidenceSignal,
  Intervention,
  InterventionTrigger,
  InterventionType,
  JITAISkillGap,
  MicroBridge,
  MicroBridgeBlock,
} from './types';
