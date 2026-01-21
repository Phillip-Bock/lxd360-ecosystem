# INSPIRE STUDIO — PHASED BUILD INSTRUCTIONS

**For Claude VS Code Development**

| Attribute | Value |
|-----------|-------|
| Repository | lxd360-ecosystem |
| Version | 1.0 |
| Date | January 2026 |
| Classification | Internal Engineering |
| Company | LXD360 LLC — Service-Disabled Veteran-Owned Small Business |

---

## EXECUTIVE OVERVIEW

This document provides comprehensive, phased build instructions for the INSPIRE Course Creation branch within INSPIRE Studio. These prompts are designed for Claude VS Code development, following the "Nice not Twice" philosophy with investor-grade quality standards.

### Build Scope

INSPIRE Studio offers four authoring approaches. This document covers the INSPIRE Course Creation branch exclusively:

1. **INSPIRE Course Creation (This Document)**
2. Traditional Course Creation (Future)
3. Generative AI Course Creation (Future)
4. Micro-Learning with AI Tools (Future)

### Phase Summary

| Phase | Name | Priority | Dependencies |
|-------|------|----------|--------------|
| 1 | Data Architecture Foundation | CRITICAL - First | None |
| 2 | Mission Control Dashboard Shell | CRITICAL - Second | Phase 1 |
| 3 | Encoding Phase Components | HIGH | Phase 1, 2 |
| 4 | Synthesization Phase Components | HIGH | Phase 1, 2, 3 |
| 5 | Assimilation - Course Canvas | HIGH | Phase 1-4 |
| 6 | Smart Block Suites | HIGH | Phase 1, 5 |
| 7 | xAPI Pipeline Integration | HIGH | Phase 1, 6 |
| 8 | QA & Audit Tools | MEDIUM | Phase 1-7 |
| 9 | 360° Neural-Spatial Editor | POST-MVP | Phase 1-8 |
| 10 | Logic-Branching Scenario Editor | POST-MVP | Phase 1-8 |

---

## GLOBAL GUARD RAILS

These constraints apply to ALL phases and MUST be enforced at the start of every Claude VS Code session.

### Zero Tolerance Policy

| Category | Target | Enforcement |
|----------|--------|-------------|
| TypeScript errors | 0 | CI blocks deployment |
| Lint errors | 0 | Pre-commit blocks |
| `any` types | 0 | CI blocks deployment |
| `@ts-ignore` / `@ts-expect-error` | 0 | CI blocks deployment |
| `eslint-disable` comments | 0 | CI blocks deployment |
| `console.log` in production | 0 | CI blocks deployment |
| Missing button type attribute | 0 | A11y audit blocks |
| Missing alt text on images | 0 | A11y audit blocks |

### Mandatory Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend | Next.js | 15+ (App Router) | React 19, RSC |
| Language | TypeScript | 5.9+ | Strict mode ON |
| UI Library | shadcn/ui | Latest | Radix primitives |
| Styling | Tailwind CSS | v4 | CSS-first config |
| State | Zustand | Latest | NO Redux |
| Validation | Zod | Latest | Schema validation |
| Forms | React Hook Form | Latest | With Zod resolver |
| Analytics DB | BigQuery | N/A | xAPI warehouse |
| AI/ML | Vertex AI | Latest | Gemini 2.0 |

### Package Manager Rules

```bash
# ALWAYS use npm with --legacy-peer-deps flag
npm install --legacy-peer-deps

# NEVER use pnpm, yarn, or bun
# NEVER bypass pre-commit hooks with --no-verify
```

---

## PHASE 1: DATA ARCHITECTURE FOUNDATION

**CRITICAL - BUILD FIRST | Estimated: 2-3 sessions | No dependencies**

### Mission Context

This phase establishes the "Golden Thread" - the centralized data architecture that maintains continuity across the Encoding, Synthesization, and Assimilation phases. Every data point captured in Phase 1 must inform logic in subsequent phases.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 1
                      DATA ARCHITECTURE FOUNDATION
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 1
BRANCH: claude/inspire-data-arch-[random-4-chars]
REPO: lxd360-ecosystem

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

1. Read the entire CLAUDE.md file in the repository root
2. Confirm these statements:
   - "I have read CLAUDE.md in full"
   - "I understand 'Nice not Twice' philosophy"
   - "I will use npm only with --legacy-peer-deps"
   - "I will NEVER use --no-verify"

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Create the centralized data architecture ("Golden Thread") for INSPIRE Studio.
This includes the Zustand store and all Zod validation schemas.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

1. store/inspire/useMissionStore.ts
   - Zustand store with persist middleware
   - State: currentPhase, currentStep, manifest object
   - Actions: setIndustry, updatePersona, addLadderRung, nextStep, etc.
   - Persist to localStorage as 'inspire-mission-vault'

2. schemas/inspire/missionManifest.ts
   - Main manifest schema using Zod
   - Includes: mission_metadata, neuro_signature, competency_ladder

3. schemas/inspire/encoding.ts
   - Industry analysis schema
   - Learner persona schema (Full Learner Personas structure)
   - ITLA activation strategy schema
   - ILMI modality integrator schema
   - ICES engagement spectrum schema

4. schemas/inspire/synthesization.ts
   - IPMG performance mapping schema
   - ICDT cognitive demand schema
   - ICPF capability progression schema
   - ICL competency ladder schema

5. schemas/inspire/assimilation.ts
   - Block schema (with xAPI instrumentation)
   - Canvas layout schema
   - Export configuration schema

6. schemas/inspire/xapi.ts
   - xAPI statement schema
   - Verb vocabulary constants
   - Actor, Object, Result, Context schemas

7. lib/inspire/constants/verbs.ts
   - Complete xAPI verb vocabulary
   - ADL standard verbs + custom INSPIRE verbs
   - Export as typed constants

8. types/inspire/index.ts
   - Export all Zod inferred types
   - Union types for phases, engagement levels, etc.

═══════════════════════════════════════════════════════════════════════════════
                          ZUSTAND STORE SPEC
═══════════════════════════════════════════════════════════════════════════════

interface MissionState {
  // Navigation
  currentPhase: 'encoding' | 'synthesization' | 'assimilation' | 'audit';
  currentStep: number;
  wizardEnabled: boolean;

  // The Golden Thread Manifest
  manifest: {
    // Phase 1: Encoding
    industry?: string;
    persona?: LearnerPersona;
    activationStrategy?: ITLAOutput;
    modalityPlan?: ILMIOutput;
    engagementLevel?: ICESOutput;

    // Phase 2: Synthesization
    performanceMap?: IPMGOutput;
    cognitiveDemand?: ICDTOutput;
    proficiencyFramework?: ICPFOutput;
    competencyLadder: CompetencyRung[];

    // Phase 3: Assimilation
    blocks: ContentBlock[];
    canvasLayout: CanvasConfig;
    exportConfig?: ExportConfig;
  };

  // Actions
  setIndustry: (industry: string) => void;
  updatePersona: (data: LearnerPersona) => void;
  setActivationStrategy: (data: ITLAOutput) => void;
  setModalityPlan: (data: ILMIOutput) => void;
  setEngagementLevel: (data: ICESOutput) => void;
  addLadderRung: (rung: CompetencyRung) => void;
  addBlock: (block: ContentBlock) => void;
  updateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  removeBlock: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPhase: (phase: MissionState['currentPhase']) => void;
  toggleWizard: () => void;
  resetMission: () => void;
  exportManifest: () => string; // JSON export
  importManifest: (json: string) => void; // JSON import
}

═══════════════════════════════════════════════════════════════════════════════
                         XAPI VERB CONSTANTS
═══════════════════════════════════════════════════════════════════════════════

// Core Interaction Verbs
INITIALIZED, INTERACTED, COMPLETED, PASSED, FAILED

// Assessment & Logic Verbs
ANSWERED, CHOSE, SCORED, MASTERED

// Immersive & Spatial Verbs
EXPLORED, FOCUSED, MANIPULATED, LOCATED

// Adaptive & Biometric Verbs
HESITATED, STRESSED, REVIEWING, SKIPPED

// Social & Collaborative Verbs
COMMENTED, SHARED, REACTED

Each verb must include:
- id: ADL URI or custom INSPIRE URI
- display: { "en-US": "verb" }

═══════════════════════════════════════════════════════════════════════════════
                              CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- All schemas MUST use Zod (no other validation libraries)
- All types MUST be inferred from Zod schemas (z.infer<typeof Schema>)
- NO any types
- NO @ts-ignore
- Store MUST use persist middleware with localStorage
- All exports MUST be TypeScript strict compliant

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-data-arch-XXXX
- [ ] All 8 files created with complete implementations
- [ ] TypeScript: 0 errors
- [ ] All Zod schemas validated
- [ ] Store actions tested
- [ ] Types exported and usable
- [ ] Ready for Phase 2 integration

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 2: MISSION CONTROL DASHBOARD SHELL

**CRITICAL - BUILD SECOND | Estimated: 3-4 sessions | Depends: Phase 1**

### Mission Context

The Mission Control Dashboard is the persistent wizard shell that guides designers through the INSPIRE methodology. It provides navigation, progress tracking, and the AI Co-Pilot sidebar while maintaining orientation across all phases.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 2
                    MISSION CONTROL DASHBOARD SHELL
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 2
BRANCH: claude/inspire-dashboard-shell-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1 (Data Architecture) must be merged

═══════════════════════════════════════════════════════════════════════════════
                         MANDATORY FIRST STEP
═══════════════════════════════════════════════════════════════════════════════

1. Read the entire CLAUDE.md file
2. Verify Phase 1 files exist:
   - store/inspire/useMissionStore.ts
   - schemas/inspire/*.ts
3. Confirm understanding of the Golden Thread data flow

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the Mission Control Dashboard - the persistent wizard shell that wraps
all INSPIRE Studio phases. This includes navigation, progress tracking, and
the foundation for the AI Co-Pilot.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

1. app/(tenant)/inspire-studio/inspire/layout.tsx
   - Root layout for INSPIRE Course Creation
   - Wraps all children with MissionControlProvider
   - Includes persistent sidebar and header

2. components/inspire-studio/mission-control/
   ├── MissionControlProvider.tsx
   │   - Context provider for wizard state
   │   - Manages wizard visibility toggle
   │   - Handles "Resume Exactly Here" URL persistence
   │
   ├── NavigationLadder.tsx
   │   - Vertical progress tracker (left sidebar)
   │   - Shows: Encoding → Synthesization → Assimilation → Audit
   │   - Expandable to show sub-steps
   │   - Visual completion indicators
   │
   ├── PhaseHeader.tsx
   │   - Current phase/step title
   │   - Breadcrumb navigation
   │   - Time estimate display
   │
   ├── WizardToggle.tsx
   │   - "NASA Toggle" for Novice/Senior Architect mode
   │   - Persists preference to localStorage
   │   - Controls wizard hint visibility
   │
   ├── CoPilotSidebar.tsx
   │   - Slide-out AI assistant panel (right side)
   │   - Uses ITLA principles for suggestions
   │   - Placeholder for Vertex AI integration
   │
   ├── ContinuityVault.tsx
   │   - Bottom panel with Data Export/Import Hub
   │   - Download JSON/CSV manifest
   │   - "Resume Exactly Here" URL generator
   │   - Blueprint Preview (live-updating)
   │
   └── StepNavigation.tsx
       - Previous/Next step buttons
       - Validates current step before allowing progression
       - Disabled states based on required fields

3. hooks/inspire/
   ├── useWizardNavigation.ts
   │   - Multi-step controller logic
   │   - isNextDisabled validation
   │   - Step transition handlers
   │
   ├── useResumeUrl.ts
   │   - Generates unique URL with encoded state
   │   - Parses URL params to restore position
   │
   └── useCoPilot.ts
       - AI suggestion fetching (stub for Vertex AI)
       - Context-aware prompts based on current step

4. lib/inspire/wizard-config.ts
   - Step definitions with:
     - id, title, description
     - required fields
     - validation rules
     - estimated time
   - Phase groupings

═══════════════════════════════════════════════════════════════════════════════
                      NAVIGATION LADDER STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

ENCODING (Phase 1)
├── 1.1 Research & Industry Analysis
├── 1.2 Learner Persona Generator
├── 1.3 Activation Strategy (ITLA)
├── 1.4 Modality Integrator (ILMI)
└── 1.5 Engagement Spectrum (ICES)

SYNTHESIZATION (Phase 2)
├── 2.1 Performance Mapping (IPMG)
├── 2.2 Cognitive Demand (ICDT)
├── 2.3 Capability Progression (ICPF)
└── 2.4 Competency Ladder (ICL)

ASSIMILATION (Phase 3)
├── 3.1 Adaptive Design Cycle (IADC)
├── 3.2 Learning Experience Matrix (ILEM) - THE CANVAS
├── 3.3 Adaptive Measurement (IALM)
└── 3.4 Deployment & Launch

AUDIT (Phase 4)
├── 4.1 Cognitive UX Review
├── 4.2 WCAG & UDL Compliance
├── 4.3 UI/UX Aesthetic Polish
└── 4.4 Linguistic & Localization

═══════════════════════════════════════════════════════════════════════════════
                          UI/UX REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

Theme: Neural-Futuristic ("NASA Aesthetic")
- Background: Dark mode default (#0A0A0F)
- Accent: Cyan (#00CED1)
- Secondary: Purple (#8B5CF6)
- Accent gradient: linear-gradient(135deg, #00CED1, #8B5CF6)

Components: Use shadcn/ui exclusively
- Sheet for CoPilotSidebar
- Collapsible for NavigationLadder sections
- Progress for step completion
- Tooltip for step hints
- Button with type="button" ALWAYS

Accessibility:
- All buttons MUST have type="button" or type="submit"
- Skip links for main content
- ARIA landmarks for navigation
- Keyboard navigable progress tracker

═══════════════════════════════════════════════════════════════════════════════
                              CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- USE existing lib/ code (don't recreate)
- USE shadcn/ui components
- USE Tailwind v4 syntax
- CONNECT to useMissionStore from Phase 1
- ALL buttons must have type="button" or type="submit"
- ALL interactive elements need keyboard support
- DO NOT use any types
- DO NOT use --no-verify

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-dashboard-shell-XXXX
- [ ] Layout with persistent navigation
- [ ] NavigationLadder fully functional
- [ ] CoPilotSidebar sliding panel working
- [ ] ContinuityVault with export/import
- [ ] StepNavigation with validation
- [ ] All hooks implemented
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations
- [ ] Ready for Phase 3 components

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 3: ENCODING PHASE COMPONENTS

**HIGH PRIORITY | Estimated: 4-5 sessions | Depends: Phase 1, 2**

### Mission Context

The Encoding Phase captures the "Why" and "Who" of the learning design. Its outputs provide the context and constraints for everything that follows. This phase includes 5 steps: Research & Analysis, Learner Personas, ITLA, ILMI, and ICES.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 3
                ENCODING PHASE COMPONENTS (Steps 1.1-1.5)
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 3
BRANCH: claude/inspire-encoding-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1 & 2 must be merged

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the 5 Encoding Phase step components. Each step captures critical data
that feeds into subsequent steps via the Golden Thread store.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

For each step, create a directory with these files:

components/inspire-studio/encoding/
├── Step1_1_Research/
│   ├── index.tsx           - Main step component
│   ├── IndustrySelector.tsx      - Dropdown with industry list
│   ├── AIResearchInjector.tsx    - AI baseline suggestion tool
│   ├── CSVUploader.tsx           - Bulk upload for performance gaps
│   ├── PerformanceGapEditor.tsx  - Manual gap entry
│   └── types.ts                  - Step-specific types
│
├── Step1_2_Persona/
│   ├── index.tsx
│   ├── ArchetypeSelector.tsx     - Entry-Level → Executive dropdown
│   ├── MotivationSliders.tsx     - Conative domain sliders
│   ├── DigitalFluencyToggle.tsx
│   ├── PersonaLibrary.tsx        - Pre-built persona templates
│   └── types.ts
│
├── Step1_3_ITLA/
│   ├── index.tsx
│   ├── NeuroPrincipleCards.tsx   - Draggable principle selectors
│   ├── DopamineSlider.tsx        - Gamification intensity
│   ├── WorkingMemoryGuard.tsx    - Concept limit (3-5)
│   ├── AutoNeuroMatch.tsx        - AI-suggested principles
│   └── types.ts
│
├── Step1_4_ILMI/
│   ├── index.tsx
│   ├── SensoryMixer.tsx          - Primary/Secondary modality select
│   ├── DualCodingValidator.tsx   - Visual validation gauge
│   ├── InteractionSearch.tsx     - Search catalog by modality
│   ├── ModalityBalanceWheel.tsx  - Circular balance indicator
│   └── types.ts
│
└── Step1_5_ICES/
    ├── index.tsx
    ├── EngagementLadder.tsx      - 6-level selector (Passive→Immersive)
    ├── WorkingMemoryGuard.tsx    - Biometric indicator
    ├── EngagementModalityCheck.tsx - Validates ILMI alignment
    ├── StressSlider.tsx          - Simulated stress intensity
    └── types.ts

═══════════════════════════════════════════════════════════════════════════════
                    STEP 1.1: RESEARCH & ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

Required Input: Industry Topic (e.g., "Aviation Maintenance Safety")

Tools:
- IndustrySelector: Dropdown populated from industry summaries
- AIResearchInjector: If blank, AI suggests common performance gaps
- CSVUploader: Download template, fill in, bulk upload

Fallback: "AI Research Injector" provides baseline data per industry

Output to Store:
  manifest.industry = selected industry
  Plus: performance gaps, root causes, success metrics

═══════════════════════════════════════════════════════════════════════════════
                      STEP 1.2: PERSONA ARCHITECT
═══════════════════════════════════════════════════════════════════════════════

Required Input: Learner Demographics, Prior Knowledge Level

Tools:
- ArchetypeSelector: Entry-Level, Manager, Director, Executive
- MotivationSliders: Internal vs External drive (1-10 scale)
- DigitalFluencyToggle: Low/Medium/High tech comfort
- PersonaLibrary: Pre-built templates to customize

Fallback: AI injects "Pro-Persona" based on industry selection

Output to Store:
  manifest.persona = { demographics, knowledge, motivation, fluency }

═══════════════════════════════════════════════════════════════════════════════
                      STEP 1.3: ACTIVATION (ITLA)
═══════════════════════════════════════════════════════════════════════════════

Required Input: Selection of Neuroscience Principles

Available Principles:
- Spaced Repetition
- Retrieval Practice
- Emotional Arousal
- Multisensory Integration
- Novelty & Curiosity
- Cognitive Load Management
- Social Learning
- Feedback & Error Correction
- Metacognition & Reflection
- Contextual & Situated
- Motivation & Reward
- Attention Management
- Sleep & Rest Integration

Tools:
- NeuroPrincipleCards: Drag-drop with "Brain Why" explanations
- DopamineSlider: 1-10 gamification intensity
- WorkingMemoryGuard: Limits new concepts per module (3-5)
- AutoNeuroMatch: AI matches principles to business goal

Output to Store:
  manifest.activationStrategy = { principles[], intensity, schedule }

═══════════════════════════════════════════════════════════════════════════════
                       STEP 1.4: MODALITY (ILMI)
═══════════════════════════════════════════════════════════════════════════════

Required Input: Primary & Secondary Modalities

Available Modalities:
- Visual, Auditory, Textual, Kinesthetic
- Social (Async), Gamified, Reflective, Contextual/Situated

Tools:
- SensoryMixer: Checkbox grid for modality selection
- DualCodingValidator: Lights up when Visual + Auditory paired
- InteractionSearch: Search catalog by modality capability
- ModalityBalanceWheel: Circular chart showing balance

Output to Store:
  manifest.modalityPlan = { primary, secondary, dualCodingScore }

═══════════════════════════════════════════════════════════════════════════════
                      STEP 1.5: ENGAGEMENT (ICES)
═══════════════════════════════════════════════════════════════════════════════

Required Input: Target Engagement Level

Levels:
- Passive (Minimal cognitive load - awareness)
- Reflective (Deeper internalization)
- Active (Applied understanding)
- Collaborative (Team problem-solving)
- Exploratory (Autonomous discovery)
- Immersive (Scenario-based simulation)

Tools:
- EngagementLadder: 6-level selector with descriptions
- WorkingMemoryGuard: Warning if Immersive + Novice persona
- EngagementModalityCheck: Ensures ILMI supports selection
- StressSlider: Simulated stress for Immersive levels

Output to Store:
  manifest.engagementLevel = { level, cognitiveLoadEstimate, stressConfig }

═══════════════════════════════════════════════════════════════════════════════
                              CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- Each step MUST save to useMissionStore on completion
- Each step MUST validate with Zod schema before allowing Next
- ALL fallbacks must be implemented (AI injection, templates)
- CSV templates must match schema exactly
- Use shadcn/ui components exclusively
- Follow Neural-Futuristic theme

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-encoding-XXXX
- [ ] All 5 step directories with components
- [ ] Store integration complete
- [ ] Zod validation on each step
- [ ] AI fallbacks implemented (stubs OK for Vertex)
- [ ] CSV upload/download working
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations
- [ ] Ready for Phase 4 (Synthesization)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 4: SYNTHESIZATION PHASE COMPONENTS

**HIGH PRIORITY | Estimated: 4-5 sessions | Depends: Phase 1, 2, 3**

### Mission Context

The Synthesization Phase bridges raw data and instructional content. It defines the "What" and "How hard" by mapping performance to objectives, tagging cognitive complexity, and building the proficiency scaffold.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 4
            SYNTHESIZATION PHASE COMPONENTS (Steps 2.1-2.4)
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 4
BRANCH: claude/inspire-synthesization-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1, 2, 3 must be merged

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the 4 Synthesization Phase step components. These transform Encoding
data into the structural DNA of the course.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

components/inspire-studio/synthesization/
├── Step2_1_IPMG/
│   ├── index.tsx
│   ├── TaskCompetencyLinker.tsx    - Split-screen drag-drop grid
│   ├── ObservableActionBuilder.tsx - Performance criteria editor
│   ├── TaskPrioritizer.tsx         - High-Stakes/High-Frequency toggle
│   ├── IPMGFallbackMatrix.tsx      - Industry baseline benchmarks
│   └── types.ts
│
├── Step2_2_ICDT/
│   ├── index.tsx
│   ├── MentalDemandSlider.tsx      - 6-level complexity selector
│   ├── DomainMultiSelector.tsx     - 7 Learning Domains checkboxes
│   ├── CognitiveLoadHeatmap.tsx    - Visual load indicator
│   ├── VerbSelector.tsx            - ICDT verb vocabulary dropdown
│   └── types.ts
│
├── Step2_3_ICPF/
│   ├── index.tsx
│   ├── SupportScaffoldingSlider.tsx - 6 proficiency levels
│   ├── GuidanceFader.tsx            - Visual hint fade demonstration
│   ├── DomainBenchmarks.tsx         - Observable behaviors per domain
│   ├── NeuroReadinessGauge.tsx      - Persona vs target alignment
│   └── types.ts
│
└── Step2_4_ICL/
    ├── index.tsx
    ├── LadderBuilder.tsx           - Drag-drop objective arrangement
    ├── SMARTGoalOptimizer.tsx      - Verb library polisher
    ├── PrerequisiteMap.tsx         - Visual connector for gaps
    ├── LadderPreview.tsx           - Full ladder visualization
    └── types.ts

═══════════════════════════════════════════════════════════════════════════════
                   STEP 2.1: PERFORMANCE MAPPING (IPMG)
═══════════════════════════════════════════════════════════════════════════════

Purpose: Anchor every learning objective to a real-world job task

Tools:
- TaskCompetencyLinker: Drag competencies to job tasks
- ObservableActionBuilder: Define measurable criteria
  ("with zero errors", "within 30 seconds")
- TaskPrioritizer: Flag High-Stakes or High-Frequency tasks

Fallback: IPMG Fallback Matrix with industry baseline benchmarks

Output to Store:
  manifest.performanceMap = { tasks[], competencies[], criteria[] }

═══════════════════════════════════════════════════════════════════════════════
                    STEP 2.2: COGNITIVE DEMAND (ICDT)
═══════════════════════════════════════════════════════════════════════════════

Purpose: Classify every objective by mental load

Complexity Levels:
1. Foundation (Recognize & Recall)
2. Application (Apply in familiar context)
3. Adaptive Competency (Modify approach)
4. Strategic Integration (Multi-system coordination)
5. Mastery (Near-automaticity)
6. Innovation (Novel problem-solving)

7 Learning Domains:
- Cognitive, Affective, Psychomotor, Social
- Metacognitive, Creative, Digital

Tools:
- MentalDemandSlider: Select complexity per objective
- DomainMultiSelector: Tag active domains
- CognitiveLoadHeatmap: Color-coded load visualization
- VerbSelector: ICDT verb library dropdown

Output to Store:
  manifest.cognitiveDemand = { objectives: [{ id, level, domains[] }] }

═══════════════════════════════════════════════════════════════════════════════
                  STEP 2.3: CAPABILITY PROGRESSION (ICPF)
═══════════════════════════════════════════════════════════════════════════════

Purpose: Define how instructional support fades as learner advances

Proficiency Levels:
1. Aware - Recognizes information exists
2. Comprehend - Understands concepts
3. Apply - Uses in familiar contexts
4. Adapt - Modifies for novel situations
5. Integrate - Combines multiple skills
6. Elevate - Innovates and teaches others

Tools:
- SupportScaffoldingSlider: Select target level
- GuidanceFader: Visual demo of hint disappearance
- DomainBenchmarks: Observable behaviors per domain
- NeuroReadinessGauge: Checks persona capability

Output to Store:
  manifest.proficiencyFramework = { levels[], milestones[] }

═══════════════════════════════════════════════════════════════════════════════
                    STEP 2.4: COMPETENCY LADDER (ICL)
═══════════════════════════════════════════════════════════════════════════════

Purpose: Assemble final visual "Ladder" of achievement

Tools:
- LadderBuilder: Drag-drop objectives onto "Rungs"
- SMARTGoalOptimizer: Polish with ICDT verb library
- PrerequisiteMap: Highlight gaps (L4 without L2 foundation)
- LadderPreview: Full ladder visualization

I/O Logic:
- Defines "Unlock Logic" for player
- Determines block types per rung level
  - Foundation rungs → Interactive Concept Builders
  - Strategic rungs → Immersive Simulations

Output to Store:
  manifest.competencyLadder = CompetencyRung[]

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-synthesization-XXXX
- [ ] All 4 step directories with components
- [ ] Store integration complete
- [ ] Zod validation on each step
- [ ] Drag-drop interactions working
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations
- [ ] Ready for Phase 5 (Assimilation Canvas)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 5: ASSIMILATION - COURSE CANVAS

**HIGH PRIORITY | Estimated: 6-8 sessions | Depends: Phase 1-4**

### Mission Context

The Course Canvas is where the theoretical "Golden Thread" becomes the actual interactive product. This is the build environment where designers place drag-and-drop blocks, configure interactions, and wire xAPI tracking.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 5
               ASSIMILATION - COURSE CANVAS (Steps 3.1-3.4)
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 5
BRANCH: claude/inspire-canvas-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1-4 must be merged

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the Course Canvas - the 16:9 authoring environment where designers
place content blocks. This is the "Hangar" where the course is assembled.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

components/inspire-studio/canvas/
├── CourseCanvas.tsx        - Main 16:9 canvas container
├── CanvasToolbar.tsx       - Top toolbar (zoom, grid, rulers)
├── BlueprintOverlay.tsx    - Grid and ruler system
├── BlockLibrary.tsx        - Draggable block sidebar
├── BlockRenderer.tsx       - Renders blocks based on type
├── BlockContextMenu.tsx    - Right-click edit menu
├── CanvasDropZone.tsx      - Drop target for blocks
├── LadderPinIndicator.tsx  - Shows competency rung link
├── CognitiveLoadMeter.tsx  - Real-time load indicator
└── PropertyPanel.tsx       - Right sidebar for block config

components/inspire-studio/canvas/tools/
├── GridToggle.tsx          - 10x10 or 12-column grid
├── RulerSystem.tsx         - Horizontal/vertical rulers
├── SnapToGrid.tsx          - Magnetic snapping logic
├── ZoomControls.tsx        - Canvas zoom (25%-200%)
├── SafeZones.tsx           - Center frame indicator
└── UndoRedo.tsx            - Time travel with zundo

lib/inspire/canvas/
├── canvasConfig.ts         - 16:9 dimensions, grid settings
├── blockRegistry.ts        - Maps block types to components
├── dropHelpers.ts          - Drag-drop calculation utils
└── loadCalculator.ts       - Cognitive load computation

═══════════════════════════════════════════════════════════════════════════════
                        CANVAS SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════════════

Aspect Ratio: 16:9 (1920x1080 logical pixels)
Default Zoom: 100%
Zoom Range: 25% - 200%

Grid Options:
- 12-column CSS grid (standard web layout)
- 10x10 technical grid (NASA coordinate system)

Rulers:
- Horizontal (top): Shows pixels or percentages
- Vertical (left): Shows pixels or percentages
- Unit toggle in toolbar

Safe Zones:
- Outer margin: 5% inset
- Center cross for alignment

═══════════════════════════════════════════════════════════════════════════════
                       BLOCK LIBRARY (FILTERED)
═══════════════════════════════════════════════════════════════════════════════

The BlockLibrary dynamically filters available blocks based on:
1. ILMI Modality selection (Phase 1.4)
2. ICES Engagement level (Phase 1.5)
3. ICDT Complexity tags (Phase 2.2)

Example Logic:
- If ICES = "Immersive" → Prioritize X-017 VR Procedural Simulations
- If Modality = "Kinesthetic" → Highlight Drag-Drop, Sliders
- If Complexity = "Foundation" → Show Text, Image basics

═══════════════════════════════════════════════════════════════════════════════
                       BLOCK PLACEMENT LOGIC
═══════════════════════════════════════════════════════════════════════════════

On Block Drop:
1. Calculate grid position
2. Snap to nearest grid intersection
3. Create block instance with unique ID
4. Add to manifest.blocks[]
5. Wire default xAPI verb
6. Update CognitiveLoadMeter

Block Instance Properties:
- id: string (UUID)
- type: BlockType
- position: { x, y, width, height }
- content: BlockContent
- metadata: { cognitiveLoad, engagementLevel, modality[] }
- xapi: { verb, objectType, extensions }
- a11y: { altText, transcript, ariaLabel }
- style: { layout, theme, customCSS }
- ladderRung?: string (links to competency)

═══════════════════════════════════════════════════════════════════════════════
                       COGNITIVE LOAD METER
═══════════════════════════════════════════════════════════════════════════════

Position: Top-right of canvas (persistent)

Colors:
- Green (0-60): Optimal
- Amber (61-75): Moderate
- Orange (76-90): High
- Red (91-100): Overload

Calculation:
- Sum of block cognitiveLoad weights
- Adjusted by Working Memory Guard (3-5 items max)
- Warning at > 3 new concepts per screen

═══════════════════════════════════════════════════════════════════════════════
                 STEP 3.3: ADAPTIVE MEASUREMENT (IALM)
═══════════════════════════════════════════════════════════════════════════════

Each block has "xAPI Sensor" toggle in PropertyPanel:

When enabled:
- Auto-wires xAPI statement template
- Tracks: verb, object, result
- Custom extensions available

Automated Remediation:
- Define "Self-Correction" rules
- On fail → trigger remediation block
- Links to G-014 Automated Remediation Loop

═══════════════════════════════════════════════════════════════════════════════
                   STEP 3.4: DEPLOYMENT & LAUNCH
═══════════════════════════════════════════════════════════════════════════════

Export Formats:
- Native JSON (internal)
- SCORM 1.2
- SCORM 2004 4th Ed
- xAPI (TinCan)
- cmi5

Export Button generates:
1. manifest.json (Golden Thread)
2. Package structure with assets
3. LRS integration config

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-canvas-XXXX
- [ ] 16:9 Canvas with grid/rulers
- [ ] BlockLibrary with filtering
- [ ] Drag-drop placement working
- [ ] PropertyPanel configuration
- [ ] CognitiveLoadMeter updating
- [ ] LadderPinIndicator showing rung links
- [ ] Undo/Redo with zundo
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations
- [ ] Ready for Phase 6 (Smart Block Suites)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 6: SMART BLOCK SUITES

**HIGH PRIORITY | Estimated: 6-8 sessions | Depends: Phase 1, 5**

### Mission Context

The Smart Block Suites consolidate 83 blocks into 7 intelligent component suites. Each suite uses the "one block, many modes" philosophy with configurable attributes in the PropertyPanel.

### The 7 Consolidated Suites

| Suite | Replaces Blocks | Key Attributes |
|-------|-----------------|----------------|
| Smart Text | Headings 1-6, Paragraph, Code, Quote, Note, Tip | Level, Style, Code Language, Dyslexia Font |
| Unified Media | Image, Gallery, Carousel, 360°, Before/After | Display Mode, Zoom Lock, Panorama Start |
| Logic Quiz | MC, MRQ, T/F, Likert, Ranking, Matrix | Question Type, Points, Randomize, Feedback |
| Contextual Audio | Embed, Upload, Podcast, Transcript | Source Type, Transcript Toggle |
| Dynamic Video | Embed, Upload, Interactive, Branching | Overlays, Seek Lock, Auto-Chapters |
| Spatial Container | 3D Model, AR, VR, Simulation | Physics Toggle, IoT Link, Model Scale |
| Social Hub | Discussion, Poll, Peer Review, Collab | Moderation, Reaction Set, Real-time Sync |

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 6
                SMART BLOCK SUITES (7 Consolidated Blocks)
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 6
BRANCH: claude/inspire-blocks-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1 & 5 must be merged

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the 7 Smart Block Suites. Each suite is a single component with
configurable modes via the PropertyPanel. Follow the "one block, many modes"
philosophy.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

components/inspire-studio/blocks/
├── SmartText/
│   ├── index.tsx              - Main smart text component
│   ├── SmartTextEditor.tsx    - Rich text editing
│   ├── SmartTextConfig.tsx    - PropertyPanel config
│   ├── modes/
│   │   ├── Heading.tsx        - H1-H6 rendering
│   │   ├── Paragraph.tsx      - Body text
│   │   ├── Quote.tsx          - Blockquote
│   │   ├── Code.tsx           - Syntax highlighted
│   │   ├── Note.tsx           - Callout note
│   │   └── Tip.tsx            - Tip callout
│   └── types.ts
│
├── UnifiedMedia/
│   ├── index.tsx
│   ├── UnifiedMediaConfig.tsx
│   ├── modes/
│   │   ├── SingleImage.tsx
│   │   ├── Gallery.tsx        - Grid/Masonry layouts
│   │   ├── Carousel.tsx       - Swipeable
│   │   ├── Panoramic.tsx      - 360° view
│   │   └── Comparison.tsx     - Before/After slider
│   └── types.ts
│
├── LogicQuiz/
│   ├── index.tsx
│   ├── LogicQuizConfig.tsx
│   ├── modes/
│   │   ├── MultipleChoice.tsx
│   │   ├── MultiResponse.tsx
│   │   ├── TrueFalse.tsx
│   │   ├── LikertScale.tsx
│   │   ├── Ranking.tsx
│   │   └── Matrix.tsx
│   ├── FeedbackEngine.tsx     - Correct/incorrect handling
│   ├── ScoreCalculator.tsx
│   └── types.ts
│
├── ContextualAudio/
│   ├── index.tsx
│   ├── ContextualAudioConfig.tsx
│   ├── modes/
│   │   ├── AudioEmbed.tsx
│   │   ├── AudioUpload.tsx
│   │   ├── Podcast.tsx
│   │   └── AudioTranscript.tsx
│   └── types.ts
│
├── DynamicVideo/
│   ├── index.tsx
│   ├── DynamicVideoConfig.tsx
│   ├── modes/
│   │   ├── VideoEmbed.tsx
│   │   ├── VideoUpload.tsx
│   │   ├── InteractiveVideo.tsx   - With overlays
│   │   └── BranchingVideo.tsx     - Choose path
│   ├── OverlayManager.tsx         - Timestamp-linked overlays
│   ├── ChapterGenerator.tsx       - Auto-chapters
│   └── types.ts
│
├── SpatialContainer/
│   ├── index.tsx
│   ├── SpatialContainerConfig.tsx
│   ├── modes/
│   │   ├── Model3D.tsx        - Three.js viewer
│   │   ├── ARExperience.tsx   - AR.js integration
│   │   ├── VRScene.tsx        - WebXR scene
│   │   └── Simulation.tsx     - Physics-enabled
│   └── types.ts
│
└── SocialHub/
    ├── index.tsx
    ├── SocialHubConfig.tsx
    ├── modes/
    │   ├── Discussion.tsx     - Threaded comments
    │   ├── Poll.tsx           - Quick voting
    │   ├── PeerReview.tsx     - Assignment review
    │   └── Collaboration.tsx  - Real-time collab
    └── types.ts

═══════════════════════════════════════════════════════════════════════════════
                  BASE BLOCK HOC (Higher Order Component)
═══════════════════════════════════════════════════════════════════════════════

Every block MUST be wrapped in BaseInspireBlock:

interface BaseInspireBlockProps {
  id: string;
  type: BlockType;
  phase: InspirePhase;
  children: React.ReactNode;
}

BaseInspireBlock provides:
- Automatic CSS variable theming based on phase
- xAPI "Fire & Forget" integration
- Hidden metadata for AI reading
- Accessibility wrapper with ARIA

═══════════════════════════════════════════════════════════════════════════════
                      COMMON BLOCK ATTRIBUTES
═══════════════════════════════════════════════════════════════════════════════

All blocks inherit these from BaseInspireBlock:

INSPIRE Meta:
- phase: InspirePhase (Ignite, Navigate, Scaffold, Practice, etc.)
- cognitiveLoadWeight: 1-3
- targetProficiency: ICPFLevel

Ares HUD Logic:
- latencyAlertThreshold: number (ms)
- modalityPriority: 'text' | 'video' | 'audio'

Geometry:
- padding: { top, bottom }
- margin: number
- aspectRatioLock: boolean

Custom Code:
- customJS: string
- customCSS: string
- customHTML: string

xAPI Config:
- trackingEnabled: boolean
- defaultVerb: xAPIVerb
- customExtensions: Record<string, unknown>

═══════════════════════════════════════════════════════════════════════════════
                    XAPI "FIRE & FORGET" WRAPPER
═══════════════════════════════════════════════════════════════════════════════

// components/inspire-studio/blocks/XApiWrapper.tsx

Every block action auto-fires xAPI to BigQuery:

On Block Enter:
  fireStatement('initialized', blockId, blockType)

On Block Interaction:
  fireStatement('interacted', blockId, { interaction details })

On Block Complete:
  fireStatement('completed', blockId, { duration, result })

On Quiz Answer:
  fireStatement('answered', blockId, { response, correct, score })

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-blocks-XXXX
- [ ] All 7 Smart Block Suites implemented
- [ ] Each suite has mode components
- [ ] PropertyPanel configs for all
- [ ] BaseInspireBlock HOC working
- [ ] XApiWrapper firing to BigQuery
- [ ] Zod schemas for each block type
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations
- [ ] Ready for Phase 7 (xAPI Pipeline)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 7: xAPI PIPELINE INTEGRATION

**HIGH PRIORITY | Estimated: 3-4 sessions | Depends: Phase 1, 6**

### Mission Context

The xAPI Pipeline ensures that all learning interactions flow directly to BigQuery. This enables real-time analytics, adaptive recommendations, and compliance audit trails.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 7
               XAPI PIPELINE INTEGRATION (BigQuery Direct)
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 7
BRANCH: claude/inspire-xapi-pipeline-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1 & 6 must be merged

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the complete xAPI pipeline that sends statements directly to BigQuery
via Pub/Sub. This is the "Fire & Forget" engine for non-technical IDs.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

lib/xapi/
├── client.ts             - Main xAPI client
├── statement-builder.ts  - Statement factory functions
├── verb-registry.ts      - Typed verb constants
├── bigquery-sink.ts      - BigQuery insertion
├── pubsub-publisher.ts   - Pub/Sub message sender
├── batch-processor.ts    - Batches statements for efficiency
└── types.ts              - xAPI type definitions

hooks/inspire/
├── useXApi.ts            - Hook for components
├── useStatementTracer.ts - Debug HUD for statements
└── useIALMSensor.ts      - Adaptive measurement hook

components/inspire-studio/debug/
├── XApiTracerHUD.tsx     - Live statement feed (Review Tab)
├── StatementInspector.tsx - Detailed statement viewer
└── BigQueryStatus.tsx    - Connection health indicator

═══════════════════════════════════════════════════════════════════════════════
                       XAPI STATEMENT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

interface XApiStatement {
  id: string;  // UUID
  actor: {
    name: string;
    mbox?: string;
    account?: {
      homePage: string;
      name: string;
    };
  };
  verb: {
    id: string;  // ADL URI
    display: { "en-US": string };
  };
  object: {
    id: string;  // Activity URI
    objectType: "Activity";
    definition?: {
      type?: string;
      name?: { "en-US": string };
      description?: { "en-US": string };
      extensions?: Record<string, unknown>;
    };
  };
  result?: {
    success?: boolean;
    completion?: boolean;
    score?: {
      scaled?: number;  // 0-1
      raw?: number;
      min?: number;
      max?: number;
    };
    duration?: string;  // ISO 8601
    response?: string;
    extensions?: Record<string, unknown>;
  };
  context?: {
    registration?: string;  // UUID
    contextActivities?: {
      parent?: Activity[];
      grouping?: Activity[];
    };
    extensions?: Record<string, unknown>;
  };
  timestamp: string;  // ISO 8601
  stored?: string;    // Set by LRS
}

═══════════════════════════════════════════════════════════════════════════════
                       VERB VOCABULARY (Complete)
═══════════════════════════════════════════════════════════════════════════════

// Core Interaction Verbs
INITIALIZED: "http://adlnet.gov/expapi/verbs/initialized"
INTERACTED: "http://adlnet.gov/expapi/verbs/interacted"
COMPLETED: "http://adlnet.gov/expapi/verbs/completed"
PASSED: "http://adlnet.gov/expapi/verbs/passed"
FAILED: "http://adlnet.gov/expapi/verbs/failed"

// Assessment & Logic Verbs
ANSWERED: "http://adlnet.gov/expapi/verbs/answered"
CHOSE: "http://adlnet.gov/expapi/verbs/chose"
SCORED: "http://adlnet.gov/expapi/verbs/scored"
MASTERED: "http://adlnet.gov/expapi/verbs/mastered"

// Immersive & Spatial Verbs
EXPLORED: "https://w3id.org/xapi/tla/verbs/explored"
FOCUSED: "https://w3id.org/xapi/tla/verbs/focused"
MANIPULATED: "https://w3id.org/xapi/tla/verbs/manipulated"
LOCATED: "https://w3id.org/xapi/tla/verbs/located"

// Adaptive & Biometric Verbs (Custom INSPIRE)
HESITATED: "http://id.inspire.io/verbs/hesitated"
STRESSED: "http://id.inspire.io/verbs/stressed"
REVIEWING: "http://id.inspire.io/verbs/reviewing"
SKIPPED: "http://adlnet.gov/expapi/verbs/skipped"

// Social & Collaborative Verbs
COMMENTED: "http://adlnet.gov/expapi/verbs/commented"
SHARED: "http://adlnet.gov/expapi/verbs/shared"
REACTED: "http://adlnet.gov/expapi/verbs/reacted"

═══════════════════════════════════════════════════════════════════════════════
                          BIGQUERY SCHEMA
═══════════════════════════════════════════════════════════════════════════════

Table: lxd360_production.xapi_statements

Columns:
- id: STRING (NOT NULL)
- tenant_id: STRING (NOT NULL)
- actor_id: STRING (NOT NULL)
- actor_name: STRING
- actor_email: STRING
- verb_id: STRING (NOT NULL)
- verb_display: STRING
- object_id: STRING (NOT NULL)
- object_type: STRING
- object_name: STRING
- result_success: BOOL
- result_completion: BOOL
- result_score_scaled: FLOAT64
- result_score_raw: FLOAT64
- result_duration: STRING
- context_registration: STRING
- context_course_id: STRING
- context_lesson_id: STRING
- context_session_id: STRING
- context_platform: STRING
- extensions: JSON
- timestamp: TIMESTAMP (NOT NULL)
- stored: TIMESTAMP (NOT NULL)
- _PARTITIONTIME: TIMESTAMP

PARTITION BY DATE(timestamp)
CLUSTER BY tenant_id, actor_id

═══════════════════════════════════════════════════════════════════════════════
               USEIALMSENSOR HOOK (Adaptive Measurement)
═══════════════════════════════════════════════════════════════════════════════

Purpose: Monitor learner performance and trigger remediation

const { trackPerformance, triggerRemediation } = useIALMSensor(blockId, criteria);

On interaction:
1. Compare learner action to performanceCriteria.target
2. If success: fire "completed" with positive result
3. If fail:
   - Fire "failed" statement
   - Call triggerRemediation(blockId)
   - Auto-inject remediation block (G-014)

Track:
- Hesitation latency (> threshold → "hesitated" verb)
- Biometric stress (if available → "stressed" verb)
- Retry count

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-xapi-pipeline-XXXX
- [ ] xAPI client with BigQuery direct sink
- [ ] Pub/Sub publisher integration
- [ ] Batch processor for efficiency
- [ ] Complete verb vocabulary typed
- [ ] useXApi hook working
- [ ] useIALMSensor hook with remediation
- [ ] XApiTracerHUD for debugging
- [ ] TypeScript: 0 errors
- [ ] BigQuery schema deployed
- [ ] Ready for Phase 8 (QA Tools)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 8: QA & AUDIT TOOLS

**MEDIUM PRIORITY | Estimated: 3-4 sessions | Depends: Phase 1-7**

### Mission Context

The QA & Audit Tools ensure the course is optimized for the human brain and accessible to every learner. This phase implements the Mission Readiness Audit (Phase 4 of the INSPIRE workflow).

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 8
                   QA & AUDIT TOOLS (Mission Readiness)
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 8
BRANCH: claude/inspire-qa-audit-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1-7 must be merged

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build the comprehensive QA suite for Phase 4: Mission Readiness Audit.
This includes cognitive UX review, accessibility compliance, linguistic
quality, and the complete audit checklist.

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

components/inspire-studio/audit/
├── AuditDashboard.tsx           - Main audit overview
├── CognitiveUXReview/
│   ├── index.tsx
│   ├── WorkingMemoryScan.tsx    - 3-5 item limit checker
│   ├── SplitAttentionPredictor.tsx - Text/visual separation
│   ├── CoherenceChecker.tsx     - Visual noise detector
│   └── CognitiveHeatmap.tsx     - Load visualization
│
├── AccessibilityAudit/
│   ├── index.tsx
│   ├── ColorContrastValidator.tsx - 4.5:1 ratio check
│   ├── NonVisualCueScanner.tsx    - Color-only info
│   ├── KeyboardNavSimulator.tsx   - Tab order test
│   ├── CaptionTranscriptAuditor.tsx
│   └── WCAGChecklist.tsx          - Full WCAG 2.1 AA
│
├── AcronymSentinel/
│   ├── index.tsx
│   ├── AcronymDetector.tsx      - Finds undefined acronyms
│   ├── GlossaryManager.tsx      - Add to glossary
│   └── AcronymResolver.tsx      - Auto-expand suggestions
│
├── AIAccessibilityTools/
│   ├── index.tsx
│   ├── AIAltTextGenerator.tsx   - Vision AI integration
│   ├── OCRScanner.tsx           - Text from images
│   └── MetadataAutoFiller.tsx   - INSPIRE DNA labels
│
├── UIDSkinPreview/
│   ├── index.tsx
│   ├── SkinToggle.tsx           - NASA/Minimal/Accessible
│   ├── DyslexiaFriendlyMode.tsx
│   ├── SeizureSafeMode.tsx      - Animation freeze
│   └── ColorBlindFilters.tsx    - Protanopia/Deuteranopia
│
├── LinguisticQuality/
│   ├── index.tsx
│   ├── SpellingSyntaxGuard.tsx  - Grammar check
│   ├── TechnicalGlossarySync.tsx - Term linking
│   └── LocalizationPreview.tsx  - Language preview
│
└── MissionReadinessReport/
    ├── index.tsx
    ├── AuditSummary.tsx         - Pass/fail overview
    ├── RecommendationList.tsx   - Action items
    └── ExportReport.tsx         - PDF/JSON export

hooks/inspire/
├── useAcronymSentinel.ts        - Acronym detection hook
├── useAccessibilityAudit.ts     - A11y scanning hook
└── useCognitiveUX.ts            - Load calculation hook

═══════════════════════════════════════════════════════════════════════════════
                     STEP 4.1: COGNITIVE UX REVIEW
═══════════════════════════════════════════════════════════════════════════════

Working Memory Scan:
- Flags screens with > 3-5 new concepts
- Highlights overloaded blocks

Split-Attention Predictor:
- Detects text/visual spatial separation
- Suggests integration improvements

Coherence Checker:
- Identifies visual noise (extraneous graphics)
- Recommends removal of non-essential elements

═══════════════════════════════════════════════════════════════════════════════
                    STEP 4.2: WCAG & UDL COMPLIANCE
═══════════════════════════════════════════════════════════════════════════════

Color Contrast Validator:
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Real-time canvas scanning

Non-Visual Cue Scanner:
- Identifies color-only information
- Suggests icon/text alternatives

Keyboard Navigation Simulator:
- Tests all interactions without mouse
- Validates tab order logic

Caption/Transcript Auditor:
- Checks every video for captions
- Verifies audio transcripts exist

═══════════════════════════════════════════════════════════════════════════════
                      STEP 4.3: ACRONYM SENTINEL
═══════════════════════════════════════════════════════════════════════════════

Detection Logic:
- Regex: /\b[A-Z]{3,}\b/g
- Checks for prior "Full Name (ACRONYM)" definition
- Red highlight on first undefined use

Resolution UI:
- "Auto-Apply Definition" button
- "Spell Out in Parentheses" option
- "Add to Mission Glossary" button

Glossary Integration:
- Technical Glossary Sync auto-links terms
- Mouse-over definitions in player

═══════════════════════════════════════════════════════════════════════════════
                   STEP 4.4: AI ACCESSIBILITY TOOLS
═══════════════════════════════════════════════════════════════════════════════

AI Alt-Text Generator:
- Vision AI analyzes image context
- Provides 3 suggestions per image
- Human approves/refines

OCR Scanner:
- Extracts text from image uploads
- Populates Long Description field
- Supports legacy media

Metadata Auto-Fill:
- Auto-tags with ICES level
- Auto-tags with ICDT complexity
- Creates INSPIRE DNA labels

═══════════════════════════════════════════════════════════════════════════════
                          UDL SKIN MODES
═══════════════════════════════════════════════════════════════════════════════

Global CSS class toggles:
- .udl-standard (default)
- .udl-dyslexic - Open Dyslexic font
- .udl-seizure-safe - No animations
- .udl-high-contrast - Max contrast
- .udl-reader - Increased padding, narrow width

Implementation:
- CSS variables swap on body class
- No page reload required
- Persists to localStorage

═══════════════════════════════════════════════════════════════════════════════
                     MISSION READINESS REPORT
═══════════════════════════════════════════════════════════════════════════════

Audit Point Categories:
- Cognitive Load: Pass/Fail
- Accessibility: Pass/Fail
- Neuro-Alignment: Pass/Fail
- LRS Handshake: Pass/Fail

Report Output:
- Summary dashboard
- Detailed findings
- Action items with priority
- Export to PDF/JSON

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-qa-audit-XXXX
- [ ] All audit components implemented
- [ ] Acronym Sentinel working
- [ ] AI Alt-Text integration (Vertex stub)
- [ ] UDL skin modes toggleable
- [ ] Color blindness filters working
- [ ] Mission Readiness Report generating
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations (meta!)
- [ ] Ready for Phase 9 (Post-MVP: 360 Editor)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 9: 360° NEURAL-SPATIAL EDITOR (POST-MVP)

**POST-MVP | Estimated: 5-6 sessions | Depends: Phase 1-8**

### Mission Context

The 360° Neural-Spatial Editor enables immersive panoramic experiences with interactive hotspots, guided tours, and spatial audio. This uses React Three Fiber for high-performance rendering.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 9 (POST-MVP)
                        360° NEURAL-SPATIAL EDITOR
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 9
BRANCH: claude/inspire-360-editor-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1-8 must be merged

═══════════════════════════════════════════════════════════════════════════════
                          DEPENDENCY SETUP
═══════════════════════════════════════════════════════════════════════════════

INSTALL THESE PACKAGES FIRST:

npm install @react-three/fiber @react-three/drei three --legacy-peer-deps
npm install -D @types/three --legacy-peer-deps

Verify installation before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build a lightweight 360° editor using React Three Fiber. Support:
- Equirectangular image loading
- Interactive hotspot placement
- Guided vs Unguided tour modes
- xAPI tracking for spatial interactions

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

components/inspire-studio/spatial/
├── ThreeSixtyEditor/
│   ├── index.tsx           - Main editor container
│   ├── EditorScene.tsx     - R3F Canvas + Scene
│   ├── PanoramaSphere.tsx  - 360° sphere with texture
│   ├── HotspotManager.tsx  - Hotspot CRUD operations
│   ├── HotspotMarker.tsx   - Individual hotspot component
│   ├── HotspotConfig.tsx   - PropertyPanel for hotspot
│   ├── GuidedTourEngine.tsx - Camera animation sequencer
│   ├── OrbitController.tsx - Look-around controls
│   └── types.ts
│
├── ThreeSixtyPlayer/
│   ├── index.tsx           - Learner-facing player
│   ├── PlayerScene.tsx     - Read-only scene
│   ├── TourNavigation.tsx  - Next/Prev for guided
│   ├── HotspotInteraction.tsx
│   └── DwellTimeTracker.tsx - xAPI focus tracking
│
└── spatial-utils/
    ├── textureLoader.ts    - Async texture loading
    ├── raycaster.ts        - Click position calculation
    ├── cameraAnimator.ts   - GSAP/Spring camera moves
    └── xapiSpatialVerbs.ts - explored, focused, manipulated

schemas/inspire/spatial.ts (ADD TO EXISTING)
- Vector3Schema
- HotspotSchema
- ThreeSixtySceneSchema

═══════════════════════════════════════════════════════════════════════════════
                       ZOD SCHEMA: 360° SCENE
═══════════════════════════════════════════════════════════════════════════════

const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const HotspotTypeSchema = z.enum([
  'info_popup',      // Simple text/image
  'audio_spatial',   // Positional audio
  'navigation',      // Jump to another scene
  'quiz_block',      // Opens Logic Quiz
  'sim_trigger'      // Starts simulation
]);

const HotspotSchema = z.object({
  id: z.string().uuid(),
  position: Vector3Schema,
  type: HotspotTypeSchema,
  label: z.string().optional(),
  linkedBlockId: z.string().optional(),
  interactionTrigger: z.enum(['click', 'gaze', 'proximity']).default('click'),
  xapiVerb: z.string().default('interacted'),
});

const ThreeSixtySceneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  assetUrl: z.string().url(),
  initialHeading: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  isGuided: z.boolean().default(false),
  tourSequence: z.array(z.string()).optional(),  // Hotspot IDs in order
  hotspots: z.array(HotspotSchema),
});

═══════════════════════════════════════════════════════════════════════════════
                          EDITOR FEATURES
═══════════════════════════════════════════════════════════════════════════════

Hotspot Placement:
1. User clicks inside sphere
2. Raycaster calculates [x, y, z] on sphere surface
3. Hotspot marker appears at position
4. Config panel opens for type/content selection

Guided Tour Mode:
- Camera animates between hotspots
- GSAP/React-Spring tweening
- "Next" button progresses sequence
- Auto-narration option

Unguided Mode:
- OrbitControls enabled
- Free look-around
- xAPI tracks dwell time per sector
- Hotspots clickable at any time

═══════════════════════════════════════════════════════════════════════════════
                        XAPI SPATIAL VERBS
═══════════════════════════════════════════════════════════════════════════════

On Scene Enter:
  fireStatement('initialized', sceneId)

On Guided Tour Start:
  fireStatement('explored', { mode: 'guided' })

On Free Exploration:
  fireStatement('explored', { mode: 'unguided' })

On Hotspot Gaze (> 2 seconds):
  fireStatement('focused', { hotspotId, dwellTime })

On Hotspot Click:
  fireStatement('interacted', { hotspotId, action })

On Tour Complete:
  fireStatement('completed', { sceneId, duration })

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-360-editor-XXXX
- [ ] R3F dependencies installed and working
- [ ] PanoramaSphere rendering 360° images
- [ ] Hotspot placement via raycasting
- [ ] HotspotConfig panel integration
- [ ] Guided tour camera animation
- [ ] Unguided OrbitControls mode
- [ ] xAPI spatial verbs firing
- [ ] Zod schemas validated
- [ ] TypeScript: 0 errors
- [ ] Ready for Phase 10 (Branching Editor)

═══════════════════════════════════════════════════════════════════════════════
```

---

## PHASE 10: LOGIC-BRANCHING SCENARIO EDITOR (POST-MVP)

**POST-MVP | Estimated: 5-6 sessions | Depends: Phase 1-8**

### Mission Context

The Logic-Branching Scenario Editor is a visual flowchart tool for creating decision-based learning experiences. It supports variables, conditions, and complex branching logic similar to Storyline but with INSPIRE integration.

### Claude VS Code Prompt

```
═══════════════════════════════════════════════════════════════════════════════
                    LXD360 | INSPIRE STUDIO - PHASE 10 (POST-MVP)
                     LOGIC-BRANCHING SCENARIO EDITOR
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code Phase 10
BRANCH: claude/inspire-branching-editor-[random-4-chars]
REPO: lxd360-ecosystem
DEPENDS: Phase 1-8 must be merged

═══════════════════════════════════════════════════════════════════════════════
                          DEPENDENCY SETUP
═══════════════════════════════════════════════════════════════════════════════

INSTALL THESE PACKAGES FIRST:

npm install reactflow zustand zundo --legacy-peer-deps

reactflow: Node-based flowchart UI
zundo: Undo/redo middleware for Zustand

Verify installation before proceeding.

═══════════════════════════════════════════════════════════════════════════════
                              YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════

Build a visual "Story View" editor using ReactFlow. Support:
- Dialogue/Action/Logic Gate nodes
- Variable management (Storyline-style)
- Conditional branching with If/Else
- xAPI tracking for every choice

═══════════════════════════════════════════════════════════════════════════════
                            FILES TO CREATE
═══════════════════════════════════════════════════════════════════════════════

components/inspire-studio/branching/
├── FlowBuilder/
│   ├── index.tsx           - Main editor container
│   ├── FlowCanvas.tsx      - ReactFlow wrapper
│   ├── NodeToolbox.tsx     - Draggable node types
│   ├── ConnectionLine.tsx  - Custom edge styling
│   └── MiniMap.tsx         - Overview navigator
│
├── nodes/
│   ├── DialogueNode.tsx    - Character + text + choices
│   ├── ActionNode.tsx      - Silent actions (var mutations)
│   ├── LogicGateNode.tsx   - If/Else diamond
│   ├── EndStateNode.tsx    - Terminal outcomes
│   ├── BaseScenarioNode.tsx - Common HOC
│   └── NodeConfig.tsx      - PropertyPanel for nodes
│
├── VariableManager/
│   ├── index.tsx           - Variable HUD panel
│   ├── VariableEditor.tsx  - Create/edit variables
│   ├── VariableDebugger.tsx - Live value monitor
│   └── ConditionBuilder.tsx - Visual condition UI
│
├── DeadEndValidator/
│   ├── index.tsx           - Graph walker algorithm
│   ├── PathAnalyzer.tsx    - All paths finder
│   └── TrapDetector.tsx    - Broken path alerter
│
└── ScenarioPlayer/
    ├── index.tsx           - Learner-facing player
    ├── StateEngine.tsx     - Variable state machine
    ├── ChoicePresenter.tsx - Shows choices
    └── OutcomeTracker.tsx  - xAPI for decisions

store/inspire/useScenarioStore.ts
- Nodes, edges, variables state
- zundo middleware for undo/redo

schemas/inspire/scenario.ts (ADD TO EXISTING)
- VariableSchema
- ConditionSchema
- NodeSchema
- ScenarioManifestSchema

═══════════════════════════════════════════════════════════════════════════════
                      ZOD SCHEMAS: BRANCHING
═══════════════════════════════════════════════════════════════════════════════

const VariableSchema = z.object({
  key: z.string().regex(/^[a-zA-Z0-9_]+$/),
  type: z.enum(['boolean', 'number', 'string']),
  initialValue: z.union([z.boolean(), z.number(), z.string()]),
  currentValue: z.union([z.boolean(), z.number(), z.string()]).optional(),
});

const ConditionSchema = z.object({
  variableKey: z.string(),
  operator: z.enum(['equals', 'greater_than', 'less_than', 'contains']),
  targetValue: z.union([z.boolean(), z.number(), z.string()]),
});

const VariableMutationSchema = z.object({
  variableKey: z.string(),
  operation: z.enum(['add', 'subtract', 'set', 'toggle']),
  value: z.union([z.number(), z.string(), z.boolean()]),
});

const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  targetNodeId: z.string(),
  variableMutations: z.array(VariableMutationSchema).optional(),
  condition: ConditionSchema.optional(),  // Show only if condition met
});

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['dialogue', 'action', 'logic_gate', 'end_state']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    characterId: z.string().optional(),
    backgroundId: z.string().optional(),
    contentBlockId: z.string().optional(),
    dialogueText: z.string().optional(),
    choices: z.array(ChoiceSchema).optional(),
    condition: ConditionSchema.optional(),  // For logic gates
    truePath: z.string().optional(),
    falsePath: z.string().optional(),
    outcome: z.enum(['success', 'failure', 'neutral']).optional(),
  }),
});

const ScenarioManifestSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  variables: z.array(VariableSchema),
  nodes: z.array(NodeSchema),
  edges: z.array(z.any()),  // ReactFlow edges
  startingNodeId: z.string(),
});

═══════════════════════════════════════════════════════════════════════════════
                            NODE TYPES
═══════════════════════════════════════════════════════════════════════════════

DIALOGUE NODE (Rectangle)
- Character avatar
- Background image
- Dialogue text
- 1-4 choice buttons
- Each choice can mutate variables

ACTION NODE (Rounded Rectangle)
- No visible content to learner
- Executes variable mutations
- Auto-proceeds to next node

LOGIC GATE (Diamond)
- Evaluates a condition
- True path → one node
- False path → another node
- IF Trust_Score > 50 THEN A ELSE B

END STATE (Rounded Terminal)
- Marks scenario completion
- Tags outcome: success/failure/neutral
- Fires xAPI completed statement

═══════════════════════════════════════════════════════════════════════════════
                        DEAD END VALIDATOR
═══════════════════════════════════════════════════════════════════════════════

Algorithm:
1. Start from startingNodeId
2. Depth-first traversal of all paths
3. Track visited nodes to detect loops
4. Flag nodes with no outgoing edges (not end_state)
5. Highlight "Trap Detected" on canvas

UI:
- Red glow on problematic nodes
- Tooltip: "This node has no exit path"
- Fix suggestion: "Add choice or mark as End State"

═══════════════════════════════════════════════════════════════════════════════
                        XAPI FOR BRANCHING
═══════════════════════════════════════════════════════════════════════════════

On Scenario Start:
  fireStatement('initialized', scenarioId)

On Every Choice:
  fireStatement('chose', {
    nodeId,
    choiceId,
    choiceLabel,
    variablesMutated: [...]
  })

On Logic Gate Evaluation:
  fireStatement('evaluated', {
    condition,
    result: true/false,
    pathTaken
  })

On Scenario Complete:
  fireStatement('completed', {
    scenarioId,
    outcome,
    pathTaken: [nodeId1, nodeId2, ...],
    finalVariableState,
    duration
  })

═══════════════════════════════════════════════════════════════════════════════
                       VARIABLE MANAGER HUD
═══════════════════════════════════════════════════════════════════════════════

Position: Docked right panel

Design Tab:
- Create new variables
- Set initial values
- Define types

Debug Mode (Preview):
- Live-updating variable values
- Highlights recent changes
- Reset to initial state button

Why: Designer can see WHY a logic gate failed ("Trust was 40, needed 50")

═══════════════════════════════════════════════════════════════════════════════
                       UNDO/REDO WITH ZUNDO
═══════════════════════════════════════════════════════════════════════════════

Implement zundo middleware on useScenarioStore:
- Ctrl+Z: Undo (restores nodes, edges, AND connections)
- Ctrl+Y: Redo
- History visible in panel (optional)

Critical: When user deletes a node, undo must restore:
1. The node itself
2. All edges connected to it
3. Variable references to that node

═══════════════════════════════════════════════════════════════════════════════
                             DELIVERABLES
═══════════════════════════════════════════════════════════════════════════════

- [ ] Branch: claude/inspire-branching-editor-XXXX
- [ ] ReactFlow dependencies installed
- [ ] FlowCanvas with drag-drop nodes
- [ ] All 4 node types implemented
- [ ] VariableManager HUD working
- [ ] ConditionBuilder UI for logic gates
- [ ] DeadEndValidator algorithm
- [ ] zundo undo/redo working
- [ ] ScenarioPlayer for preview
- [ ] xAPI firing for all choices
- [ ] Zod schemas validated
- [ ] TypeScript: 0 errors
- [ ] A11y: 0 violations
- [ ] INSPIRE Studio Complete!

═══════════════════════════════════════════════════════════════════════════════
```

---

## APPENDIX A: SESSION HANDOFF TEMPLATE

Every Claude VS Code session MUST end with this handoff format:

```markdown
## Session Handoff — [Date]

### Completed Work
- [ ] Branch: `claude/feature-xxxx`
- [ ] Commits: `abc1234`, `def5678`
- [ ] Files: `/path/to/file1.ts`, `/path/to/file2.tsx`

### Status
| Item | Status | Notes |
|------|--------|-------|
| TypeScript errors | 0 | ✅ |
| Lint errors | 0 | ✅ |
| Tests passing | Yes | ✅ |
| Ready for merge | Yes/No | |

### Next Steps
1. [Specific next action]
2. [Specific next action]

### Blockers
- [Any blocking issues or decisions needed]
```

---

## APPENDIX B: GLOSSARY

| Term | Definition |
|------|------------|
| IADC | INSPIRE Adaptive Design Cycle - Iterative build process |
| ICDT | INSPIRE Cognitive Demand Taxonomy - Complexity classification |
| ICES | INSPIRE Cognitive Engagement Spectrum - Engagement levels |
| ICL | INSPIRE Competency Ladder - Achievement progression |
| ICPF | INSPIRE Capability Progression Framework - Proficiency scaffold |
| IALM | INSPIRE Adaptive Learning Measurement - xAPI sensors |
| ILEM | INSPIRE Learning Experience Matrix - Block selection |
| ILMI | INSPIRE Learning Modality Integrator - Sensory selection |
| IPMG | INSPIRE Performance Mapping Grid - Task-objective linking |
| ITLA | INSPIRE Theory of Learning Activation - Neuroscience principles |
| Golden Thread | The continuous data flow from Encoding through Assimilation |
| Smart Suite | Consolidated block type with multiple configurable modes |

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Claude + Phill | Initial comprehensive document |

---

*— End of Document —*
