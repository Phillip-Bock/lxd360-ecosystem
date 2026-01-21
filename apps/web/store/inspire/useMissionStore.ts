/**
 * INSPIRE Mission Store (Zustand)
 *
 * The "Golden Thread" store that maintains state across all INSPIRE phases.
 * Uses persist middleware for localStorage persistence.
 *
 * @module store/inspire/useMissionStore
 */

import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AssimilationData,
  CompetencyRung,
  ContentBlock,
  EncodingData,
  ICESOutput,
  ICLOutput,
  ILMIOutput,
  ITLAOutput,
  LearnerPersona,
  MissionManifest,
  MissionMetadata,
  NeuroSignature,
  SynthesizationData,
} from '@/schemas/inspire';

// ============================================================================
// STATE TYPES
// ============================================================================

export type MissionPhase = 'encoding' | 'synthesization' | 'assimilation' | 'audit';

export interface MissionStep {
  phase: MissionPhase;
  step: number;
  name: string;
  isComplete: boolean;
}

interface MissionState {
  /** Current mission manifest (Golden Thread) */
  manifest: MissionManifest | null;

  /** Current phase */
  currentPhase: MissionPhase;

  /** Current step within phase */
  currentStep: number;

  /** Wizard mode enabled */
  wizardEnabled: boolean;

  /** Auto-save enabled */
  autoSaveEnabled: boolean;

  /** Last saved timestamp */
  lastSavedAt: string | null;

  /** Is dirty (unsaved changes) */
  isDirty: boolean;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;

  /** Validation errors by field */
  validationErrors: Record<string, string[]>;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

interface MissionActions {
  // ─────────────────────────────────────────────────────────────────────────
  // MISSION LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  /** Create a new mission */
  createMission: (metadata: Partial<MissionMetadata>) => void;

  /** Load an existing mission */
  loadMission: (manifest: MissionManifest) => void;

  /** Reset to initial state */
  resetMission: () => void;

  /** Save mission (mark as clean) */
  saveMission: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────

  /** Set current phase */
  setPhase: (phase: MissionPhase) => void;

  /** Set current step */
  setStep: (step: number) => void;

  /** Go to next step */
  nextStep: () => void;

  /** Go to previous step */
  prevStep: () => void;

  /** Toggle wizard mode */
  toggleWizard: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // METADATA
  // ─────────────────────────────────────────────────────────────────────────

  /** Update mission metadata */
  updateMetadata: (metadata: Partial<MissionMetadata>) => void;

  /** Update neuro signature */
  updateNeuroSignature: (signature: Partial<NeuroSignature>) => void;

  // ─────────────────────────────────────────────────────────────────────────
  // ENCODING PHASE (1.1-1.5)
  // ─────────────────────────────────────────────────────────────────────────

  /** Update encoding data */
  updateEncodingData: (data: Partial<EncodingData>) => void;

  /** Set industry (1.1) */
  setIndustry: (industry: string, topic: string) => void;

  /** Add learner persona (1.2) */
  addPersona: (persona: Omit<LearnerPersona, 'id'>) => void;

  /** Update learner persona */
  updatePersona: (id: string, updates: Partial<LearnerPersona>) => void;

  /** Remove learner persona */
  removePersona: (id: string) => void;

  /** Set activation strategy (1.3) */
  setActivationStrategy: (itla: ITLAOutput) => void;

  /** Set modality plan (1.4) */
  setModalityPlan: (ilmi: ILMIOutput) => void;

  /** Set engagement level (1.5) */
  setEngagementLevel: (ices: ICESOutput) => void;

  /** Mark encoding complete */
  completeEncoding: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHESIZATION PHASE (2.1-2.4)
  // ─────────────────────────────────────────────────────────────────────────

  /** Update synthesization data */
  updateSynthesizationData: (data: Partial<SynthesizationData>) => void;

  /** Set competency ladder (2.4) */
  setCompetencyLadder: (ladder: ICLOutput) => void;

  /** Add competency rung */
  addCompetencyRung: (rung: Omit<CompetencyRung, 'id'>) => void;

  /** Update competency rung */
  updateCompetencyRung: (id: string, updates: Partial<CompetencyRung>) => void;

  /** Remove competency rung */
  removeCompetencyRung: (id: string) => void;

  /** Mark synthesization complete */
  completeSynthesization: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIMILATION PHASE (3.x)
  // ─────────────────────────────────────────────────────────────────────────

  /** Update assimilation data */
  updateAssimilationData: (data: Partial<AssimilationData>) => void;

  /** Add content block */
  addBlock: (block: Omit<ContentBlock, 'id'>) => string;

  /** Update content block */
  updateBlock: (id: string, updates: Partial<ContentBlock>) => void;

  /** Remove content block */
  removeBlock: (id: string) => void;

  /** Reorder blocks */
  reorderBlocks: (fromIndex: number, toIndex: number) => void;

  /** Link block to ladder rung */
  linkBlockToRung: (blockId: string, rungId: string) => void;

  /** Mark assimilation complete */
  completeAssimilation: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────────────────────────────────

  /** Set loading state */
  setLoading: (loading: boolean) => void;

  /** Set error */
  setError: (error: string | null) => void;

  /** Set validation errors */
  setValidationErrors: (errors: Record<string, string[]>) => void;

  /** Clear validation errors */
  clearValidationErrors: () => void;

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED / SELECTORS
  // ─────────────────────────────────────────────────────────────────────────

  /** Get phase completion status */
  getPhaseCompletion: (phase: MissionPhase) => boolean;

  /** Get overall progress percentage */
  getOverallProgress: () => number;

  /** Get current step info */
  getCurrentStepInfo: () => MissionStep;

  /** Get blocks by rung ID */
  getBlocksByRung: (rungId: string) => ContentBlock[];
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: MissionState = {
  manifest: null,
  currentPhase: 'encoding',
  currentStep: 1,
  wizardEnabled: true,
  autoSaveEnabled: true,
  lastSavedAt: null,
  isDirty: false,
  isLoading: false,
  error: null,
  validationErrors: {},
};

// ============================================================================
// STEP CONFIGURATION
// ============================================================================

const PHASE_STEPS: Record<MissionPhase, number> = {
  encoding: 5, // 1.1-1.5
  synthesization: 4, // 2.1-2.4
  assimilation: 4, // 3.1-3.4
  audit: 2, // 4.1-4.2
};

const TOTAL_STEPS = Object.values(PHASE_STEPS).reduce((a, b) => a + b, 0);

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useMissionStore = create<MissionState & MissionActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // =====================================================================
        // MISSION LIFECYCLE
        // =====================================================================

        createMission: (metadata) => {
          const now = new Date().toISOString();
          const newManifest: MissionManifest = {
            metadata: {
              id: uuidv4(),
              title: metadata.title ?? 'Untitled Mission',
              description: metadata.description,
              organizationId: metadata.organizationId,
              createdBy: metadata.createdBy,
              industry: metadata.industry,
              courseType: metadata.courseType,
              version: 1,
              createdAt: now,
              updatedAt: now,
            },
            competencyLadder: [],
            encoding: {
              personas: [],
              isComplete: false,
              startedAt: now,
            },
            synthesization: {
              isComplete: false,
            },
            assimilation: {
              blocks: [],
              isComplete: false,
            },
          };

          set({
            manifest: newManifest,
            currentPhase: 'encoding',
            currentStep: 1,
            isDirty: true,
            error: null,
          });
        },

        loadMission: (manifest) => {
          set({
            manifest,
            currentPhase: 'encoding',
            currentStep: 1,
            isDirty: false,
            error: null,
          });
        },

        resetMission: () => {
          set(initialState);
        },

        saveMission: () => {
          const { manifest } = get();
          if (!manifest) return;

          const now = new Date().toISOString();
          set({
            manifest: {
              ...manifest,
              metadata: {
                ...manifest.metadata,
                updatedAt: now,
              },
            },
            lastSavedAt: now,
            isDirty: false,
          });
        },

        // =====================================================================
        // NAVIGATION
        // =====================================================================

        setPhase: (phase) => {
          set({ currentPhase: phase, currentStep: 1 });
        },

        setStep: (step) => {
          const { currentPhase } = get();
          const maxStep = PHASE_STEPS[currentPhase];
          if (step >= 1 && step <= maxStep) {
            set({ currentStep: step });
          }
        },

        nextStep: () => {
          const { currentPhase, currentStep } = get();
          const maxStep = PHASE_STEPS[currentPhase];

          if (currentStep < maxStep) {
            set({ currentStep: currentStep + 1 });
          } else {
            // Move to next phase
            const phases: MissionPhase[] = ['encoding', 'synthesization', 'assimilation', 'audit'];
            const currentIndex = phases.indexOf(currentPhase);
            if (currentIndex < phases.length - 1) {
              set({ currentPhase: phases[currentIndex + 1], currentStep: 1 });
            }
          }
        },

        prevStep: () => {
          const { currentPhase, currentStep } = get();

          if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
          } else {
            // Move to previous phase
            const phases: MissionPhase[] = ['encoding', 'synthesization', 'assimilation', 'audit'];
            const currentIndex = phases.indexOf(currentPhase);
            if (currentIndex > 0) {
              const prevPhase = phases[currentIndex - 1];
              set({
                currentPhase: prevPhase,
                currentStep: PHASE_STEPS[prevPhase],
              });
            }
          }
        },

        toggleWizard: () => {
          set((state) => ({ wizardEnabled: !state.wizardEnabled }));
        },

        // =====================================================================
        // METADATA
        // =====================================================================

        updateMetadata: (metadata) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              metadata: {
                ...manifest.metadata,
                ...metadata,
                updatedAt: new Date().toISOString(),
              },
            },
            isDirty: true,
          });
        },

        updateNeuroSignature: (signature) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              neuroSignature: {
                ...manifest.neuroSignature,
                ...signature,
              } as NeuroSignature,
            },
            isDirty: true,
          });
        },

        // =====================================================================
        // ENCODING PHASE
        // =====================================================================

        updateEncodingData: (data) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                ...data,
              },
            },
            isDirty: true,
          });
        },

        setIndustry: (industry, topic) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              metadata: {
                ...manifest.metadata,
                industry,
              },
              encoding: {
                ...manifest.encoding,
                industryAnalysis: {
                  industry,
                  topic,
                  performanceGaps: [],
                  regulatoryRequirements: [],
                  businessDrivers: [],
                  aiResearchUsed: false,
                },
              },
            },
            isDirty: true,
          });
        },

        addPersona: (persona) => {
          const { manifest } = get();
          if (!manifest) return;

          const newPersona: LearnerPersona = {
            ...persona,
            id: uuidv4(),
          };

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                personas: [...(manifest.encoding?.personas ?? []), newPersona],
              },
            },
            isDirty: true,
          });
        },

        updatePersona: (id, updates) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                personas: (manifest.encoding?.personas ?? []).map((p) =>
                  p.id === id ? { ...p, ...updates } : p,
                ),
              },
            },
            isDirty: true,
          });
        },

        removePersona: (id) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                personas: (manifest.encoding?.personas ?? []).filter((p) => p.id !== id),
              },
            },
            isDirty: true,
          });
        },

        setActivationStrategy: (itla) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                activationStrategy: itla,
              },
              neuroSignature: {
                ...manifest.neuroSignature,
                principles: itla.principles.map((p) => p.principle),
                dopamineIntensity: itla.dopamineSliderValue,
                workingMemoryLimit: itla.workingMemoryLimit,
              } as NeuroSignature,
            },
            isDirty: true,
          });
        },

        setModalityPlan: (ilmi) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                modalityPlan: ilmi,
              },
              neuroSignature: {
                ...manifest.neuroSignature,
                primaryModality: ilmi.primaryModality as
                  | 'visual'
                  | 'auditory'
                  | 'textual'
                  | 'kinesthetic'
                  | 'social',
                secondaryModality: ilmi.secondaryModality as
                  | 'visual'
                  | 'auditory'
                  | 'textual'
                  | 'kinesthetic'
                  | 'social'
                  | undefined,
                dualCodingScore: ilmi.dualCodingScore,
              } as NeuroSignature,
            },
            isDirty: true,
          });
        },

        setEngagementLevel: (ices) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                engagementLevel: ices,
              },
              neuroSignature: {
                ...manifest.neuroSignature,
                engagementLevel: ices.targetLevel,
                cognitiveLoadEstimate: ices.cognitiveLoadEstimate,
              } as NeuroSignature,
            },
            isDirty: true,
          });
        },

        completeEncoding: () => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              encoding: {
                ...manifest.encoding,
                isComplete: true,
                completedAt: new Date().toISOString(),
              },
            },
            isDirty: true,
          });
        },

        // =====================================================================
        // SYNTHESIZATION PHASE
        // =====================================================================

        updateSynthesizationData: (data) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              synthesization: {
                ...manifest.synthesization,
                ...data,
              },
            },
            isDirty: true,
          });
        },

        setCompetencyLadder: (ladder) => {
          const { manifest } = get();
          if (!manifest) return;

          // Convert ladder rungs to competency rungs
          const competencyRungs: CompetencyRung[] = ladder.rungs.map((rung) => ({
            id: rung.id,
            order: rung.order,
            objective: rung.objective,
            cognitiveLevel:
              rung.complexityLevel === 'foundation'
                ? 'remember'
                : rung.complexityLevel === 'application'
                  ? 'apply'
                  : rung.complexityLevel === 'adaptive'
                    ? 'analyze'
                    : rung.complexityLevel === 'strategic'
                      ? 'evaluate'
                      : rung.complexityLevel === 'mastery'
                        ? 'evaluate'
                        : 'create',
            complexityLevel:
              [
                'foundation',
                'application',
                'adaptive',
                'strategic',
                'mastery',
                'innovation',
              ].indexOf(rung.complexityLevel) + 1,
            targetProficiency:
              ['aware', 'comprehend', 'apply', 'adapt', 'integrate', 'elevate'].indexOf(
                rung.proficiencyTarget,
              ) + 1,
            performanceCriteria: [],
            jobTasks: rung.taskIds,
            prerequisites: rung.prerequisites,
            recommendedBlockTypes: rung.recommendedBlockTypes,
          }));

          set({
            manifest: {
              ...manifest,
              competencyLadder: competencyRungs,
              synthesization: {
                ...manifest.synthesization,
                competencyLadder: ladder,
              },
            },
            isDirty: true,
          });
        },

        addCompetencyRung: (rung) => {
          const { manifest } = get();
          if (!manifest) return;

          const newRung: CompetencyRung = {
            ...rung,
            id: uuidv4(),
          };

          set({
            manifest: {
              ...manifest,
              competencyLadder: [...manifest.competencyLadder, newRung],
            },
            isDirty: true,
          });
        },

        updateCompetencyRung: (id, updates) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              competencyLadder: manifest.competencyLadder.map((r) =>
                r.id === id ? { ...r, ...updates } : r,
              ),
            },
            isDirty: true,
          });
        },

        removeCompetencyRung: (id) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              competencyLadder: manifest.competencyLadder.filter((r) => r.id !== id),
            },
            isDirty: true,
          });
        },

        completeSynthesization: () => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              synthesization: {
                ...manifest.synthesization,
                isComplete: true,
                completedAt: new Date().toISOString(),
              },
            },
            isDirty: true,
          });
        },

        // =====================================================================
        // ASSIMILATION PHASE
        // =====================================================================

        updateAssimilationData: (data) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                ...data,
              },
            },
            isDirty: true,
          });
        },

        addBlock: (block) => {
          const { manifest } = get();
          if (!manifest) return '';

          const newBlock: ContentBlock = {
            ...block,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                blocks: [...(manifest.assimilation?.blocks ?? []), newBlock],
              },
            },
            isDirty: true,
          });

          return newBlock.id;
        },

        updateBlock: (id, updates) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                blocks: (manifest.assimilation?.blocks ?? []).map((b) =>
                  b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b,
                ),
              },
            },
            isDirty: true,
          });
        },

        removeBlock: (id) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                blocks: (manifest.assimilation?.blocks ?? []).filter((b) => b.id !== id),
              },
            },
            isDirty: true,
          });
        },

        reorderBlocks: (fromIndex, toIndex) => {
          const { manifest } = get();
          if (!manifest) return;

          const blocks = [...(manifest.assimilation?.blocks ?? [])];
          const [removed] = blocks.splice(fromIndex, 1);
          blocks.splice(toIndex, 0, removed);

          // Update order values
          const reorderedBlocks = blocks.map((block, idx) => ({
            ...block,
            order: idx,
          }));

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                blocks: reorderedBlocks,
              },
            },
            isDirty: true,
          });
        },

        linkBlockToRung: (blockId, rungId) => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                blocks: (manifest.assimilation?.blocks ?? []).map((b) =>
                  b.id === blockId ? { ...b, ladderRungId: rungId } : b,
                ),
              },
            },
            isDirty: true,
          });
        },

        completeAssimilation: () => {
          const { manifest } = get();
          if (!manifest) return;

          set({
            manifest: {
              ...manifest,
              assimilation: {
                ...manifest.assimilation,
                isComplete: true,
                completedAt: new Date().toISOString(),
              },
            },
            isDirty: true,
          });
        },

        // =====================================================================
        // UTILITY
        // =====================================================================

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setValidationErrors: (validationErrors) => set({ validationErrors }),

        clearValidationErrors: () => set({ validationErrors: {} }),

        // =====================================================================
        // COMPUTED / SELECTORS
        // =====================================================================

        getPhaseCompletion: (phase) => {
          const { manifest } = get();
          if (!manifest) return false;

          switch (phase) {
            case 'encoding':
              return manifest.encoding?.isComplete ?? false;
            case 'synthesization':
              return manifest.synthesization?.isComplete ?? false;
            case 'assimilation':
              return manifest.assimilation?.isComplete ?? false;
            case 'audit':
              return false; // Audit is final review
            default:
              return false;
          }
        },

        getOverallProgress: () => {
          const { manifest } = get();
          if (!manifest) return 0;

          let completedSteps = 0;

          // Encoding steps
          if (manifest.encoding?.industryAnalysis) completedSteps++;
          if ((manifest.encoding?.personas?.length ?? 0) > 0) completedSteps++;
          if (manifest.encoding?.activationStrategy) completedSteps++;
          if (manifest.encoding?.modalityPlan) completedSteps++;
          if (manifest.encoding?.engagementLevel) completedSteps++;

          // Synthesization steps
          if (manifest.synthesization?.performanceMapping) completedSteps++;
          if (manifest.synthesization?.cognitiveDemand) completedSteps++;
          if (manifest.synthesization?.capabilityProgression) completedSteps++;
          if (manifest.synthesization?.competencyLadder) completedSteps++;

          // Assimilation steps (count blocks and config)
          if ((manifest.assimilation?.blocks?.length ?? 0) > 0) completedSteps++;
          if (manifest.assimilation?.canvasConfig) completedSteps++;
          if (manifest.assimilation?.exportConfig) completedSteps++;

          return Math.round((completedSteps / TOTAL_STEPS) * 100);
        },

        getCurrentStepInfo: () => {
          const { currentPhase, currentStep } = get();

          const stepNames: Record<MissionPhase, string[]> = {
            encoding: [
              'Industry Analysis',
              'Learner Persona',
              'ITLA Activation',
              'ILMI Modality',
              'ICES Engagement',
            ],
            synthesization: ['IPMG Performance', 'ICDT Cognitive', 'ICPF Capability', 'ICL Ladder'],
            assimilation: ['Canvas Setup', 'Content Blocks', 'Export Config', 'Review'],
            audit: ['QA Checklist', 'Final Publish'],
          };

          return {
            phase: currentPhase,
            step: currentStep,
            name: stepNames[currentPhase][currentStep - 1] ?? '',
            isComplete: false, // Could compute based on manifest data
          };
        },

        getBlocksByRung: (rungId) => {
          const { manifest } = get();
          if (!manifest) return [];

          return (manifest.assimilation?.blocks ?? []).filter((b) => b.ladderRungId === rungId);
        },
      }),
      {
        name: 'inspire-mission-store',
        partialize: (state) => ({
          manifest: state.manifest,
          currentPhase: state.currentPhase,
          currentStep: state.currentStep,
          wizardEnabled: state.wizardEnabled,
          autoSaveEnabled: state.autoSaveEnabled,
          lastSavedAt: state.lastSavedAt,
        }),
      },
    ),
    { name: 'MissionStore' },
  ),
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectManifest = (state: MissionState & MissionActions) => state.manifest;
export const selectCurrentPhase = (state: MissionState & MissionActions) => state.currentPhase;
export const selectCurrentStep = (state: MissionState & MissionActions) => state.currentStep;
export const selectWizardEnabled = (state: MissionState & MissionActions) => state.wizardEnabled;
export const selectIsDirty = (state: MissionState & MissionActions) => state.isDirty;
export const selectIsLoading = (state: MissionState & MissionActions) => state.isLoading;
export const selectError = (state: MissionState & MissionActions) => state.error;

export const selectEncodingData = (state: MissionState & MissionActions) =>
  state.manifest?.encoding;
export const selectSynthesizationData = (state: MissionState & MissionActions) =>
  state.manifest?.synthesization;
export const selectAssimilationData = (state: MissionState & MissionActions) =>
  state.manifest?.assimilation;
export const selectCompetencyLadder = (state: MissionState & MissionActions) =>
  state.manifest?.competencyLadder ?? [];
export const selectNeuroSignature = (state: MissionState & MissionActions) =>
  state.manifest?.neuroSignature;

export const selectBlocks = (state: MissionState & MissionActions) =>
  state.manifest?.assimilation?.blocks ?? [];
export const selectPersonas = (state: MissionState & MissionActions) =>
  state.manifest?.encoding?.personas ?? [];
