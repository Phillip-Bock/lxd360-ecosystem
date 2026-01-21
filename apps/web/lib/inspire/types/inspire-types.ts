// ============================================================================
// SECTION 1: FOUNDATIONAL TYPES & ENUMS
// ============================================================================

/**
 * The three stages of the INSPIRE Learning Architecture
 * Each stage builds upon the previous, creating a seamless learning journey
 */
export type ILAStage = 'encoding' | 'synthesization' | 'assimilation';

/**
 * The seven pillars of the INSPIRE framework
 * These principles guide every design decision
 */
export type INSPIREPillar =
  | 'integrative' // Blending learning theories and modalities
  | 'neuroscience-informed' // Brain-based design principles
  | 'strategic' // Aligned with business goals
  | 'personalized' // Tailored to individual needs
  | 'immersive' // Engaging, experiential learning
  | 'results-focused' // Measurable outcomes
  | 'evolutionary'; // Continuous improvement

/**
 * User experience level determines the UI complexity and guidance provided
 * Based on the book's recommended progression from novice to expert
 */
export type ExperienceLevel =
  | 'novice' // 🌱 Full wizard, step-by-step, AI drafts first
  | 'intermediate' // 🌿 Optional wizard, more control, AI suggests
  | 'advanced' // 🌳 Wizard off, full customization, on-demand AI
  | 'expert'; // 🎓 Raw access, API integrations, framework modification

/**
 * Industries targeted by LXD360's INSPIRE framework
 * These drive template selection and compliance requirements
 */
export type TargetIndustry =
  | 'healthcare'
  | 'aerospace'
  | 'aviation'
  | 'manufacturing'
  | 'finance'
  | 'technology'
  | 'education'
  | 'government'
  | 'retail'
  | 'energy'
  | 'defense'
  | 'pharmaceutical'
  | 'automotive'
  | 'telecommunications'
  | 'transportation'
  | 'hospitality'
  | 'construction'
  | 'nonprofit'
  | 'professional-services'
  | 'other';

/**
 * Course types that drive content structure and assessment strategies
 */
export type CourseType =
  | 'compliance'
  | 'onboarding'
  | 'technical-skills'
  | 'soft-skills'
  | 'leadership'
  | 'safety'
  | 'product-knowledge'
  | 'certification'
  | 'professional-development'
  | 'change-management'
  | 'product-training'
  | 'process-training'
  | 'custom';

// ============================================================================
// SECTION 2: COGNITIVE LOAD & ACCESSIBILITY TYPES
// ============================================================================

/**
 * Cognitive Load Theory (CLT) metrics
 * Based on Sweller's cognitive load theory - fundamental to INSPIRE's N pillar
 *
 * The three types of cognitive load:
 * - Intrinsic: The inherent complexity of the material itself
 * - Extraneous: Unnecessary mental burden from poor design
 * - Germane: Mental effort that contributes to learning (the "good" load)
 *
 * Our goal: Minimize extraneous, manage intrinsic, maximize germane
 */
export interface CognitiveLoadMetrics {
  /** Intrinsic load (0-100): Content complexity */
  intrinsicLoad: number;

  /** Extraneous load (0-100): Design-imposed burden - we aim to minimize this */
  extraneousLoad: number;

  /** Germane load (0-100): Productive learning effort - we aim to maximize this */
  germaneLoad: number;

  /** Total cognitive load (should not exceed 100 for optimal learning) */
  totalLoad: number;

  /** NASA-TLX prediction score (0-100) - validated assessment tool */
  nasaTlxPrediction: number;

  /** Paas Scale estimate (0-9) - self-reported mental effort scale */
  paasScaleEstimate: number;

  /** Timestamp of measurement */
  timestamp: Date;

  /** AI-generated recommendations for optimization */
  recommendations: CognitiveLoadRecommendation[];
}

/**
 * Individual recommendation for cognitive load optimization
 * AI generates these based on analysis of content and design
 */
export interface CognitiveLoadRecommendation {
  /** Unique identifier */
  id: string;

  /** Which type of load this addresses */
  loadType: 'intrinsic' | 'extraneous' | 'germane';

  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Human-readable recommendation */
  recommendation: string;

  /** Specific action to take */
  action: string;

  /** Expected impact on cognitive load (negative = reduction) */
  expectedImpact: number;

  /** Can this be auto-fixed by the system? */
  autoFixAvailable: boolean;

  /** If auto-fix available, the fix function identifier */
  autoFixId?: string;
}

/**
 * Accessibility settings for neurodiversity support
 *
 * CRITICAL: This addresses dyslexia, aphasia, hearing impairment, autism, and more
 * These settings persist per user and affect the entire tool experience
 *
 * Philosophy: Universal Design for Learning (UDL) - multiple means of
 * representation, expression, and engagement
 */
export interface AccessibilitySettings {
  /** Unique identifier for the settings profile */
  id: string;

  /** User ID these settings belong to */
  userId: string;

  /** Profile name (users can have multiple profiles) */
  profileName: string;

  // ─────────────────────────────────────────────────────────────────────────
  // VISUAL ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Color vision settings
   * Addresses: Color blindness (protanopia, deuteranopia, tritanopia)
   */
  colorVision: {
    /** Enable color vision assistance */
    enabled: boolean;
    /** Type of color blindness correction */
    mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'custom';
    /** Custom color adjustments if mode is 'custom' */
    customAdjustments?: {
      hueRotation: number; // -180 to 180 degrees
      saturation: number; // 0 to 200 percent
      brightness: number; // 0 to 200 percent
      contrast: number; // 0 to 200 percent
    };
  };

  /**
   * High contrast mode
   * Addresses: Low vision, light sensitivity
   */
  highContrast: {
    enabled: boolean;
    mode: 'increased' | 'maximum' | 'inverted' | 'custom';
    /** Minimum contrast ratio (WCAG recommends 4.5:1 for normal text) */
    contrastRatio: number;
  };

  /**
   * Typography settings
   * Addresses: Dyslexia, low vision, reading difficulties
   */
  typography: {
    /** Font family - OpenDyslexic is specifically designed for dyslexia */
    fontFamily:
      | 'system'
      | 'opendyslexic'
      | 'atkinson-hyperlegible'
      | 'lexie-readable'
      | 'comic-sans'
      | 'custom';
    /** Custom font family name if fontFamily is 'custom' */
    customFontFamily?: string;
    /** Base font size in pixels (scales everything proportionally) */
    fontSize: number;
    /** Line height multiplier (1.5-2.0 recommended for readability) */
    lineHeight: number;
    /** Letter spacing in em units (0.12em recommended for dyslexia) */
    letterSpacing: number;
    /** Word spacing in em units */
    wordSpacing: number;
    /** Paragraph spacing multiplier */
    paragraphSpacing: number;
    /** Maximum line length in characters (50-75 recommended) */
    maxLineLength: number;
    /** Text alignment preference */
    textAlign: 'left' | 'center' | 'right' | 'justify';
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MOTION & ANIMATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Motion and animation preferences
   * Addresses: Vestibular disorders, epilepsy, ADHD (distraction), autism
   */
  motion: {
    /** Reduce motion (respects prefers-reduced-motion) */
    reduceMotion: boolean;
    /** Disable all animations entirely */
    disableAnimations: boolean;
    /** Pause animated GIFs and videos */
    pauseAnimatedMedia: boolean;
    /** Animation speed multiplier (0.5 = half speed, 2 = double speed) */
    animationSpeed: number;
    /** Disable parallax scrolling effects */
    disableParallax: boolean;
    /** Disable auto-playing media */
    disableAutoplay: boolean;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AUDITORY ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Audio and hearing settings
   * Addresses: Hearing impairment, deafness, auditory processing disorders
   */
  audio: {
    /** Enable captions for all media */
    captionsEnabled: boolean;
    /** Caption font size multiplier */
    captionFontSize: number;
    /** Caption background opacity (0-1) */
    captionBackgroundOpacity: number;
    /** Caption position preference */
    captionPosition: 'bottom' | 'top';
    /** Enable audio descriptions for visual content */
    audioDescriptions: boolean;
    /** Enable visual indicators for audio cues (bell icon, flashing, etc.) */
    visualAudioIndicators: boolean;
    /** Mono audio (helpful for single-sided hearing) */
    monoAudio: boolean;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COGNITIVE ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Cognitive load and focus settings
   * Addresses: ADHD, autism, cognitive fatigue, learning disabilities
   */
  cognitive: {
    /** Simplified interface (fewer options, cleaner layout) */
    simplifiedInterface: boolean;
    /** Focus mode (dims non-essential elements) */
    focusMode: boolean;
    /** Reading guide (ruler that follows text) */
    readingGuide: boolean;
    /** Reading mask (blocks surrounding text) */
    readingMask: boolean;
    /** Break reminders interval in minutes (0 = disabled) */
    breakReminderInterval: number;
    /** Progress indicators on all long content */
    showProgressIndicators: boolean;
    /** Estimated time to complete displayed */
    showTimeEstimates: boolean;
    /** Chunking preference - max items shown at once */
    maxItemsPerChunk: number;
    /** Tooltip delay in milliseconds */
    tooltipDelay: number;
    /** Extended time for timed activities (multiplier) */
    timeExtension: number;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AUTISM-SPECIFIC ACCOMMODATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Autism-specific accessibility features
   * Addresses: Sensory processing, routine/predictability, literal interpretation
   */
  autismSupport: {
    enabled: boolean;
    /** Predictable layouts (consistent navigation, no surprise changes) */
    predictableLayouts: boolean;
    /** Clear, literal language (avoid idioms, metaphors) */
    literalLanguage: boolean;
    /** Social stories for complex interactions */
    socialStories: boolean;
    /** Visual schedules and checklists */
    visualSchedules: boolean;
    /** Sensory-friendly color palette */
    sensoryFriendlyColors: boolean;
    /** Warning before content changes */
    changeWarnings: boolean;
    /** Explicit instructions (nothing assumed) */
    explicitInstructions: boolean;
    /** Timer visibility for timed activities */
    timerVisibility: 'hidden' | 'on-demand' | 'always';
    /** Transition warnings between sections */
    transitionWarnings: boolean;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DYSLEXIA-SPECIFIC ACCOMMODATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Dyslexia-specific accessibility features
   * Addresses: Letter reversal, visual stress, reading fluency
   */
  dyslexiaSupport: {
    enabled: boolean;
    /** Syllable highlighting */
    syllableHighlighting: boolean;
    /** Color-coded word types (nouns, verbs, etc.) */
    colorCodedGrammar: boolean;
    /** Text-to-speech integration */
    textToSpeech: boolean;
    /** TTS reading speed (words per minute) */
    ttsSpeed: number;
    /** Highlight text as it's read aloud */
    highlightOnRead: boolean;
    /** Bionic reading (bold first few letters of words) */
    bionicReading: boolean;
    /** Screen tint color (some dyslexics benefit from colored overlays) */
    screenTint: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
  };

  /** Last updated timestamp */
  updatedAt: Date;

  /** Created timestamp */
  createdAt: Date;
}

// ============================================================================
// SECTION 3: ENCODING STAGE TYPES (ITLA, NPPM, ILMI, ICES)
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// ITLA - INSPIRE Theory of Learning Activation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Learning Analysis Framework selection
 * Determines what type of analysis is needed for the project
 */
export type LearningAnalysisType =
  | 'needs-analysis' // Identify business goals and performance gaps
  | 'learner-analysis' // Demographics, preferences, experience
  | 'context-analysis' // Environmental and technical factors
  | 'job-task-analysis' // Break down job roles and tasks
  | 'content-analysis' // Audit existing materials
  | 'descriptive-analytics' // What happened
  | 'diagnostic-analytics' // Why it happened
  | 'predictive-analytics' // What will happen
  | 'prescriptive-analytics'; // What should we do

/**
 * ITLA Analysis configuration
 * This is the foundational tool that informs all subsequent decisions
 */
export interface ITLAAnalysis {
  /** Unique identifier */
  id: string;

  /** Project this analysis belongs to */
  projectId: string;

  /** Selected analysis types */
  analysisTypes: LearningAnalysisType[];

  /** Target audience profile */
  audience: {
    /** Estimated audience size */
    size: number;
    /** Primary roles/job titles */
    roles: string[];
    /** Experience level with subject matter */
    priorKnowledge: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
    /** Geographic distribution */
    locations: string[];
    /** Primary language(s) */
    languages: string[];
    /** Accessibility needs identified */
    accessibilityNeeds: string[];
  };

  /** Business context */
  businessContext: {
    /** Primary business driver */
    driver: 'compliance' | 'performance' | 'transformation' | 'onboarding' | 'upskilling';
    /** Key stakeholders */
    stakeholders: string[];
    /** Success metrics (KPIs) */
    successMetrics: string[];
    /** Timeline constraints */
    timeline: {
      startDate: Date;
      targetLaunchDate: Date;
      pilotDate?: Date;
    };
    /** Budget range */
    budget: 'minimal' | 'moderate' | 'substantial' | 'unlimited';
  };

  /** Technical environment */
  technicalEnvironment: {
    /** LMS/LXP platform */
    platform: string;
    /** Supported devices */
    devices: ('desktop' | 'laptop' | 'tablet' | 'mobile' | 'vr')[];
    /** Network constraints */
    networkConstraints: 'offline-capable' | 'low-bandwidth' | 'standard' | 'high-bandwidth';
    /** Integration requirements */
    integrations: string[];
  };

  /** AI-generated insights */
  aiInsights: {
    /** Recommended cognitive engagement level */
    recommendedICESLevel: ICESLevel;
    /** Recommended modalities */
    recommendedModalities: ILMIModality[];
    /** Recommended reinforcement strategies */
    recommendedNPPMStrategies: NPPMStrategy[];
    /** Risk factors identified */
    riskFactors: string[];
    /** Opportunities identified */
    opportunities: string[];
  };

  /** Gap analysis results */
  gapAnalysis?: {
    /** Current state capabilities */
    currentState: string[];
    /** Desired state capabilities */
    desiredState: string[];
    /** Identified gaps */
    gaps: string[];
    /** Priority gaps to address */
    priorityGaps: string[];
  };

  /** Completion status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// NPPM - INSPIRE Neuroplasticity Pathways Model
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Neuroplasticity-based reinforcement strategies
 * Based on the neuroscience principle: "neurons that fire together, wire together"
 */
export type NPPMStrategy =
  | 'spaced-repetition' // Hippocampal-cortical consolidation
  | 'retrieval-practice' // Active hippocampal retrieval
  | 'emotional-arousal' // Amygdala-driven encoding
  | 'multisensory-integration' // Dual coding, sensory integration
  | 'novelty-curiosity' // Dopamine activation
  | 'cognitive-load-management' // Prefrontal cortex management
  | 'social-learning' // Mirror neurons, social cognition
  | 'feedback-error-correction' // Anterior cingulate cortex
  | 'metacognition-reflection' // Self-regulation, executive functions
  | 'contextual-situated' // Neural context transfer
  | 'motivation-reward' // Dopamine reward pathways
  | 'attention-engagement' // Attentional control networks
  | 'sleep-rest-integration'; // Memory consolidation during rest

/**
 * NPPM Strategy configuration with neuroscience alignment
 */
export interface NPPMStrategyConfig {
  /** Strategy identifier */
  strategy: NPPMStrategy;

  /** Type property for strategy configuration */
  type?: string;

  /** Enabled for this project */
  enabled: boolean;

  /** Priority order (1 = highest) */
  priority: number;

  /** Neuroscience alignment explanation */
  neuroscienceAlignment: string;

  /** Recommended techniques */
  techniques: string[];

  /** Recommended technologies */
  recommendedTech: string[];

  /** Ideal use cases */
  useCases: string[];

  /** Schedule/frequency configuration */
  schedule?: {
    /** Interval type */
    intervalType: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'custom';
    /** Custom interval in hours (if intervalType is 'custom') */
    customIntervalHours?: number;
    /** Number of repetitions */
    repetitions: number;
    /** Duration in weeks */
    durationWeeks: number;
  };
}

/**
 * Complete NPPM configuration for a project
 */
export interface NPPMConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Selected strategies with configurations */
  strategies: NPPMStrategyConfig[];

  /** Reinforcement schedule */
  reinforcementPlan: {
    /** Pre-training activities */
    preTraining: NPPMReinforcement[];
    /** During training activities */
    duringTraining: NPPMReinforcement[];
    /** Post-training activities */
    postTraining: NPPMReinforcement[];
  };

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual reinforcement activity
 */
export interface NPPMReinforcement {
  /** Unique identifier */
  id: string;

  /** Activity name */
  name: string;

  /** Strategy this supports */
  strategy: NPPMStrategy;

  /** Description of the activity */
  description: string;

  /** When to deliver (relative to training start) */
  timing: {
    value: number;
    unit: 'hours' | 'days' | 'weeks';
    relative: 'before' | 'during' | 'after';
  };

  /** Delivery method */
  deliveryMethod: 'email' | 'lms-notification' | 'mobile-push' | 'in-app' | 'manager-facilitated';

  /** Duration in minutes */
  durationMinutes: number;

  /** Expected outcome */
  expectedOutcome: string;

  /** Assessment method */
  assessmentMethod: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ILMI - INSPIRE Learning Modality Integrator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Learning modalities based on dual coding theory
 * Multiple modalities activate multiple neural pathways, enhancing retention
 */
export type ILMIModality =
  | 'visual' // Visual cortex - images, diagrams, videos
  | 'auditory' // Auditory cortex - narration, podcasts, discussion
  | 'textual' // Language centers - reading, writing
  | 'kinesthetic' // Motor cortex, hippocampus - hands-on, simulations
  | 'social'; // Social cognition networks - collaboration, peer learning

/**
 * Specific delivery formats within each modality
 */
export interface ILMIDeliveryFormat {
  /** Modality category */
  modality: ILMIModality;

  /** Specific format */
  format: string;

  /** Description */
  description: string;

  /** Technology required */
  technologyRequired: string[];

  /** Best for which ICES levels */
  bestForICESLevels: ICESLevel[];

  /** Accessibility considerations */
  accessibilityConsiderations: string[];

  /** Cognitive load impact (1-5, where 1 is lowest) */
  cognitiveLoadImpact: number;

  /** Production complexity (1-5) */
  productionComplexity: number;
}

/**
 * Complete ILMI configuration for a project
 */
export interface ILMIConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Primary modality */
  primaryModality: ILMIModality;

  /** Secondary modality (for dual coding) */
  secondaryModality: ILMIModality;

  /** All selected modalities with weights */
  modalityMix: {
    modality: ILMIModality;
    weight: number; // Percentage (all should sum to 100)
    formats: ILMIDeliveryFormat[];
  }[];

  /** Accessibility compliance */
  accessibilityCompliance: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    section508: boolean;
    additionalStandards: string[];
    additionalRequirements?: string[];
  };

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICES - INSPIRE Cognitive Engagement Spectrum
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cognitive engagement levels
 * Each level triggers distinct neural pathways, enhancing learning effectiveness
 */
export type ICESLevel =
  | 'passive' // Minimal cognitive load - basic awareness
  | 'reflective' // Metacognition, personal insight
  | 'active' // Moderate load - applied understanding
  | 'collaborative' // Medium-high load - social cognition
  | 'exploratory' // High load - autonomous discovery
  | 'immersive'; // Highest load - full emotional/cognitive engagement

/**
 * Detailed ICES level configuration
 */
export interface ICESLevelConfig {
  /** Level identifier */
  level: ICESLevel;

  /** Description */
  description: string;

  /** Cognitive load range (0-100) */
  cognitiveLoadRange: {
    min: number;
    max: number;
  };

  /** Neural pathways activated */
  neuralPathways: string[];

  /** Example activities */
  exampleActivities: string[];

  /** Technology enablers */
  technologyEnablers: string[];

  /** Best for content types */
  bestForContentTypes: string[];

  /** Learner prerequisites */
  learnerPrerequisites: string[];
}

/**
 * ICES configuration for a specific content item
 */
export interface ICESConfiguration {
  /** Unique identifier */
  id: string;

  /** Content item this applies to */
  contentId: string;

  /** Selected engagement level */
  level: ICESLevel;

  /** Justification for selection */
  justification: string;

  /** Activities designed for this level */
  activities: {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    technologyRequired: string[];
    icesLevel: ICESLevel;
  }[];

  /** Measured cognitive load */
  measuredCognitiveLoad?: CognitiveLoadMetrics;

  /** AI recommendations */
  aiRecommendations: string[];

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SECTION 4: SYNTHESIZATION STAGE TYPES (ICL, ICDT, IPMG, ICPF)
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// ICL - INSPIRE Competency Ladder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Competency proficiency levels
 * Based on Dreyfus model of skill acquisition
 */
export type CompetencyLevel =
  | 'novice' // Rule-based, limited situational perception
  | 'advanced-beginner' // Recognizes aspects of situations
  | 'competent' // Copes with complexity, deliberate planning
  | 'proficient' // Holistic view, prioritizes easily
  | 'expert'; // Intuitive grasp, sees what's possible

/**
 * Individual competency definition
 */
export interface Competency {
  /** Unique identifier */
  id: string;

  /** Competency name */
  name: string;

  /** Description */
  description: string;

  /** Category/domain */
  category: string;

  /** Observable behaviors at each level */
  levelIndicators: {
    level: CompetencyLevel;
    indicators: string[];
  }[];

  /** Related competencies */
  relatedCompetencies: string[];

  /** Industry alignment */
  industryAlignment: TargetIndustry[];

  /** Compliance/regulatory mapping */
  complianceMapping: string[];
}

/**
 * ICL Configuration for a project
 */
export interface ICLConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Competencies in scope */
  competencies: {
    competency: Competency;
    targetLevel: CompetencyLevel;
    currentLevel?: CompetencyLevel;
    priority: 'critical' | 'important' | 'nice-to-have';
  }[];

  /** Prerequisite competencies (must have before training) */
  prerequisites: {
    competencyId: string;
    minimumLevel: CompetencyLevel;
  }[];

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICDT - INSPIRE Cognitive Demand Taxonomy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bloom's Taxonomy cognitive levels
 * Revised Bloom's Taxonomy (Anderson & Krathwohl, 2001)
 */
export type BloomsCognitiveLevel =
  | 'remember' // Retrieve relevant knowledge
  | 'understand' // Construct meaning
  | 'apply' // Use procedure in situation
  | 'analyze' // Break into parts, determine relationships
  | 'evaluate' // Make judgments based on criteria
  | 'create'; // Put elements together to form coherent whole

/**
 * Knowledge dimension (what type of knowledge)
 */
export type KnowledgeDimension =
  | 'factual' // Basic elements
  | 'conceptual' // Interrelationships, structures
  | 'procedural' // How to do something
  | 'metacognitive'; // Awareness of own cognition

/**
 * Individual learning objective
 */
export interface LearningObjective {
  /** Unique identifier */
  id: string;

  /** Objective statement (action verb + content + context) */
  statement: string;

  /** Bloom's cognitive level */
  cognitiveLevel: BloomsCognitiveLevel;

  /** Knowledge dimension */
  knowledgeDimension: KnowledgeDimension;

  /** Action verb used */
  actionVerb: string;

  /** Measurable criteria - can be string or array for backwards compatibility */
  measurableCriteria: string | string[];

  /** Is this a terminal (main) objective or enabling (supporting) objective */
  isTerminal?: boolean;

  /** Prerequisites for this objective */
  prerequisites?: string[];

  /** Related competencies */
  relatedCompetencies?: string[];

  /** Time to achieve (in minutes) */
  timeToAchieve?: number;

  /** Assessment method */
  assessmentMethod?: string;

  /** Competencies this supports */
  competencyIds?: string[];
}

/**
 * ICDT Configuration for a project
 */
export interface ICDTConfiguration {
  /** Unique identifier */
  id?: string;

  /** Project this belongs to */
  projectId?: string;

  /** All learning objectives (combined terminal and enabling) */
  objectives?: LearningObjective[];

  /** Terminal learning objectives (end goals) */
  terminalObjectives?: LearningObjective[];

  /** Enabling objectives (stepping stones) */
  enablingObjectives?: LearningObjective[];

  /** Objective hierarchy mapping */
  objectiveHierarchy?: {
    terminalObjectiveId: string;
    enablingObjectiveIds: string[];
  }[];

  /** Taxonomy alignment information */
  taxonomyAlignment?: {
    framework: string;
    version: string;
  };

  /** AI recommendations */
  aiRecommendations?: string[];

  /** Status */
  status?: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt?: Date;
  updatedAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// IPMG - INSPIRE Performance Mapping Grid
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Performance mapping between learning and job outcomes
 * Bridges training to real-world performance
 */
export interface PerformanceMapping {
  /** Unique identifier */
  id: string;

  /** Learning objective ID */
  learningObjectiveId: string;

  /** Job task this maps to */
  jobTask: {
    title: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as-needed';
    criticality: 'mission-critical' | 'important' | 'supportive';
  };

  /** Performance indicators */
  performanceIndicators: {
    name: string;
    description: string;
    targetMetric: string;
    measurementMethod: string;
  }[];

  /** Success criteria */
  successCriteria: string[];

  /** Support required for transfer */
  transferSupport: string[];
}

/**
 * IPMG Configuration for a project
 */
export interface IPMGConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Performance mappings */
  mappings: PerformanceMapping[];

  /** Business outcomes tied to */
  businessOutcomes: {
    outcome: string;
    metrics: string[];
    targetImprovement: string;
  }[];

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICPF - INSPIRE Capability Progression Framework
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Learning path segment
 */
export interface LearningPathSegment {
  /** Unique identifier */
  id: string;

  /** Segment name */
  name: string;

  /** Description */
  description: string;

  /** Learning objectives covered */
  objectiveIds: string[];

  /** Competencies developed */
  competencyIds: string[];

  /** Prerequisites (other segment IDs) */
  prerequisites: string[];

  /** Estimated duration in hours */
  estimatedHours: number;

  /** Delivery modalities */
  modalities: ILMIModality[];

  /** ICES level */
  icesLevel: ICESLevel;

  /** Completion criteria */
  completionCriteria: string[];
}

/**
 * ICPF Configuration for a project
 * Defines the learning journey from current state to mastery
 */
export interface ICPFConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Learning path segments in order */
  segments: LearningPathSegment[];

  /** Adaptive pathways (alternative routes based on learner performance) */
  adaptivePathways: {
    condition: string;
    alternativeSegmentIds: string[];
  }[];

  /** Milestones */
  milestones: {
    name: string;
    afterSegmentId: string;
    celebration: string;
    certification?: string;
  }[];

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SECTION 5: ASSIMILATION STAGE TYPES (IDNS, IADC, ILEM, IALM)
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// IDNS - INSPIRE Design NeuroSystem
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Design element with neuroscience alignment
 */
export interface NeuroDesignElement {
  /** Unique identifier */
  id: string;

  /** Element type */
  elementType:
    | 'opening-hook'
    | 'content-chunk'
    | 'practice-activity'
    | 'assessment'
    | 'reflection'
    | 'summary'
    | 'transition';

  /** Name */
  name: string;

  /** Description */
  description: string;

  /** Neuroscience principle applied */
  neurosciencePrinciple: string;

  /** Brain regions/pathways activated */
  brainPathways: string[];

  /** ICES level */
  icesLevel: ICESLevel;

  /** Cognitive load contribution */
  cognitiveLoadContribution: {
    intrinsic: number;
    extraneous: number;
    germane: number;
  };

  /** Duration in minutes */
  durationMinutes: number;

  /** Media/assets required */
  mediaRequired: string[];

  /** Interaction type */
  interactionType:
    | 'passive'
    | 'click-reveal'
    | 'drag-drop'
    | 'input'
    | 'simulation'
    | 'collaboration';
}

/**
 * IDNS Configuration for a module
 */
export interface IDNSConfiguration {
  /** Unique identifier */
  id: string;

  /** Module this applies to */
  moduleId: string;

  /** Design elements in sequence */
  elements: NeuroDesignElement[];

  /** Total cognitive load projection */
  totalCognitiveLoad: CognitiveLoadMetrics;

  /** Flow optimization */
  flowOptimization: {
    /** Varies cognitive load throughout */
    loadVariation: boolean;
    /** Recovery breaks included */
    recoveryBreaks: boolean;
    /** Peak engagement points */
    peakEngagementPoints: number[];
  };

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// IADC - INSPIRE Adaptive Design Cycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adaptation rule based on learner performance
 */
export interface AdaptationRule {
  /** Unique identifier */
  id: string;

  /** Rule name */
  name: string;

  /** Trigger condition */
  trigger: {
    metric: 'quiz-score' | 'time-on-task' | 'attempts' | 'engagement-score' | 'confidence-rating';
    operator: 'less-than' | 'greater-than' | 'equals' | 'between';
    value: number | [number, number];
  };

  /** Action to take */
  action: {
    type:
      | 'branch'
      | 'remediate'
      | 'accelerate'
      | 'provide-hint'
      | 'offer-support'
      | 'notify-facilitator';
    targetContentId?: string;
    message?: string;
  };

  /** Priority (if multiple rules trigger) */
  priority: number;
}

/**
 * IADC Configuration for adaptive learning
 */
export interface IADCConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Adaptation rules */
  rules: AdaptationRule[];

  /** Default path (if no rules trigger) */
  defaultPathId: string;

  /** AI-driven adaptations enabled */
  aiAdaptationsEnabled: boolean;

  /** Data collection points */
  dataCollectionPoints: {
    contentId: string;
    metrics: string[];
  }[];

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// ILEM - INSPIRE Learning Experience Matrix
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete learning experience module
 */
export interface LearningExperienceModule {
  /** Unique identifier */
  id: string;

  /** Module title */
  title: string;

  /** Module description */
  description: string;

  /** Learning objectives */
  objectives: LearningObjective[];

  /** Content sections */
  sections: {
    id: string;
    title: string;
    type: 'content' | 'activity' | 'assessment' | 'reflection';
    elements: NeuroDesignElement[];
    duration: number;
  }[];

  /** ICES level for module */
  icesLevel: ICESLevel;

  /** Modality mix */
  modalityMix: ILMIConfiguration;

  /** Cognitive load metrics */
  cognitiveLoadMetrics: CognitiveLoadMetrics;

  /** Assessment strategy */
  assessment: {
    formative: string[];
    summative: string[];
    passingScore: number;
  };

  /** Prerequisites */
  prerequisites: string[];

  /** Estimated time to complete */
  estimatedMinutes: number;

  /** Status */
  status: 'draft' | 'in-development' | 'ready-for-review' | 'approved' | 'published';
}

/**
 * ILEM Configuration for entire course
 */
export interface ILEMConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Course title */
  courseTitle: string;

  /** Course description */
  courseDescription: string;

  /** Modules in order */
  modules: LearningExperienceModule[];

  /** Course-level assessments */
  courseLevelAssessments: {
    type: 'pre-assessment' | 'final-exam' | 'capstone-project';
    description: string;
    weight: number;
  }[];

  /** Completion requirements */
  completionRequirements: {
    minimumModulesCompleted: number;
    minimumAssessmentScore: number;
    additionalRequirements: string[];
  };

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// IALM - INSPIRE Adaptive Learning Measurement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kirkpatrick evaluation levels
 */
export type KirkpatrickLevel =
  | 'reaction' // Level 1: Did they like it?
  | 'learning' // Level 2: Did they learn?
  | 'behavior' // Level 3: Did they apply it?
  | 'results'; // Level 4: Did it impact the business?

/**
 * Evaluation metric definition
 */
export interface EvaluationMetric {
  /** Unique identifier */
  id: string;

  /** Metric name */
  name: string;

  /** Description */
  description: string;

  /** Kirkpatrick level */
  kirkpatrickLevel: KirkpatrickLevel;

  /** Data collection method */
  collectionMethod:
    | 'survey'
    | 'quiz'
    | 'observation'
    | 'system-data'
    | 'business-system'
    | 'interview';

  /** Target value */
  targetValue: number | string;

  /** Measurement timing */
  timing: 'immediate' | 'end-of-course' | '30-days' | '60-days' | '90-days' | '180-days';

  /** xAPI statement template */
  xapiTemplate?: string;
}

/**
 * IALM Configuration for measurement
 */
export interface IALMConfiguration {
  /** Unique identifier */
  id: string;

  /** Project this belongs to */
  projectId: string;

  /** Evaluation metrics */
  metrics: EvaluationMetric[];

  /** ROI calculation approach */
  roiApproach: {
    enabled: boolean;
    costFactors: string[];
    benefitFactors: string[];
    formula: string;
  };

  /** ESSA Tier IV documentation */
  essaTierIV: {
    enabled: boolean;
    logicModel: string;
    evidenceStandards: string[];
  };

  /** Analytics dashboard configuration */
  dashboardConfig: {
    widgets: {
      type:
        | 'completion-rate'
        | 'assessment-scores'
        | 'engagement-heatmap'
        | 'time-analysis'
        | 'roi-tracker';
      position: { x: number; y: number };
      size: { width: number; height: number };
    }[];
  };

  /** AI recommendations */
  aiRecommendations: string[];

  /** Status */
  status: 'draft' | 'in-progress' | 'complete' | 'reviewed';

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SECTION 6: PROJECT & WIZARD TYPES
// ============================================================================

/**
 * Complete INSPIRE Project encompassing all stages and tools
 */
export interface INSPIREProject {
  /** Unique identifier */
  id: string;

  /** Project name */
  name: string;

  /** Project description */
  description: string;

  /** Organization ID */
  organizationId: string;

  /** Created by user ID */
  createdBy: string;

  /** Target industry */
  industry: TargetIndustry;

  /** Course type */
  courseType: CourseType;

  /** User experience level */
  experienceLevel: ExperienceLevel;

  /** Target audience information */
  targetAudience?: {
    /** Estimated audience size */
    size?: number;
    /** Primary roles/job titles */
    roles?: string[];
    /** Experience level with subject matter */
    priorKnowledge?: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
    /** Geographic distribution */
    locations?: string[];
    /** Primary language(s) */
    languages?: string[];
    /** Accessibility needs identified */
    accessibilityNeeds?: string[];
  };

  /** Current wizard step (1-17) */
  currentStep: number;

  /** Completed steps */
  completedSteps: number[];

  /** ITLA Analysis reference */
  itlaAnalysis?: ITLAAnalysis;

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 1: ENCODING
  // ─────────────────────────────────────────────────────────────────────────
  encoding: {
    itla?: ITLAAnalysis;
    nppm?: NPPMConfiguration;
    ilmi?: ILMIConfiguration;
    ices?: ICESConfiguration[];
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 2: SYNTHESIZATION
  // ─────────────────────────────────────────────────────────────────────────
  synthesization: {
    icl?: ICLConfiguration;
    icdt?: ICDTConfiguration;
    ipmg?: IPMGConfiguration;
    icpf?: ICPFConfiguration;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 3: ASSIMILATION
  // ─────────────────────────────────────────────────────────────────────────
  assimilation: {
    idns?: IDNSConfiguration;
    iadc?: IADCConfiguration;
    ilem?: ILEMConfiguration;
    ialm?: IALMConfiguration;
  };

  /** Overall project status */
  status: 'draft' | 'in-progress' | 'review' | 'approved' | 'published' | 'archived';

  /** Collaboration */
  collaborators: {
    userId: string;
    role: 'owner' | 'editor' | 'reviewer' | 'viewer';
    addedAt: Date;
  }[];

  /** Version history */
  versions: {
    version: number;
    savedAt: Date;
    savedBy: string;
    description: string;
  }[];

  /** Export history */
  exports: {
    format: 'json' | 'scorm' | 'xapi' | 'pdf' | 'v0-handoff';
    exportedAt: Date;
    exportedBy: string;
    url?: string;
  }[];

  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wizard step definition
 */
export interface WizardStep {
  /** Step number (1-17) */
  stepNumber: number;

  /** Step name */
  name: string;

  /** Step description */
  description: string;

  /** Phase this belongs to (1-4) */
  phase: 1 | 2 | 3 | 4;

  /** ILA stage */
  stage: ILAStage;

  /** INSPIRE tool(s) used in this step */
  tools: (
    | 'itla'
    | 'nppm'
    | 'ilmi'
    | 'ices'
    | 'icl'
    | 'icdt'
    | 'ipmg'
    | 'icpf'
    | 'idns'
    | 'iadc'
    | 'ilem'
    | 'ialm'
  )[];

  /** Required for completion */
  required: boolean;

  /** Prerequisites (other step numbers) */
  prerequisites: number[];

  /** Estimated time in minutes */
  estimatedMinutes: number;

  /** AI assistance available */
  aiAssistance: {
    draftGeneration: boolean;
    suggestions: boolean;
    validation: boolean;
    examples: boolean;
  };

  /** Help content available */
  helpContent: {
    overview: string;
    videoTutorialUrl?: string;
    diveDeeper: string[];
    examples: string[];
  };
}

// ============================================================================
// SECTION 7: AI ASSISTANT TYPES
// ============================================================================

/**
 * AI Assistant interaction types
 */
export type AIAssistanceType =
  | 'explain-better' // Simplify or deepen explanation
  | 'give-example' // Provide industry/role-specific examples
  | 'help' // Contextual help and guidance
  | 'dive-deeper' // Academic/theoretical deep dive
  | 'generate-draft' // AI creates initial draft
  | 'validate' // Check for completeness/accuracy
  | 'suggest' // Provide recommendations
  | 'cognitive-check'; // Analyze cognitive load

/**
 * AI Assistant request
 */
export interface AIAssistanceRequest {
  /** Request ID */
  id?: string;

  /** Project context */
  projectId?: string;

  /** Current step */
  currentStep?: number;

  /** Assistance type requested */
  type: AIAssistanceType;

  /** User's experience level */
  experienceLevel?: ExperienceLevel;

  /** User's message or question */
  userMessage?: string;

  /** Context data */
  context?: {
    industry?: TargetIndustry;
    courseType?: CourseType;
    currentContent?: string;
    specificQuestion?: string;
    toolId?: string;
    stepNumber?: number;
    projectData?: Record<string, unknown>;
    topic?: string;
    section?: string;
    currentTool?: string;
  };

  /** Requested at */
  requestedAt?: Date;
}

/**
 * AI Assistant response
 */
export interface AIAssistanceResponse {
  /** Response ID */
  id: string;

  /** Request this responds to */
  requestId: string;

  /** Response content */
  content: string;

  /** Additional resources */
  resources?: {
    type: 'book-reference' | 'example' | 'template' | 'video';
    title: string;
    url?: string;
    content?: string;
  }[];

  /** Suggestions for the current context */
  suggestions?: string[];

  /** Follow-up suggestions */
  followUpSuggestions: string[];

  /** Confidence level */
  confidence: number;

  /** Model used */
  model: string;

  /** Tokens used */
  tokensUsed: number;

  /** Generated at */
  generatedAt: Date;
}

// ============================================================================
// SECTION 8: EXPORT & INTEGRATION TYPES
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat =
  | 'inspire-json' // Full INSPIRE project JSON
  | 'scorm-1.2' // SCORM 1.2 package
  | 'scorm-2004' // SCORM 2004 package
  | 'xapi' // xAPI/Tin Can package
  | 'cmi5' // cmi5 package
  | 'pdf-blueprint' // PDF course blueprint
  | 'v0-handoff' // Format for v0 authoring tool
  | 'storyboard-doc'; // Word document storyboard

/**
 * Export configuration
 */
export interface ExportConfiguration {
  /** Format to export */
  format: ExportFormat;

  /** Include options */
  include: {
    analysisData: boolean;
    storyboards: boolean;
    assessments: boolean;
    mediaSpecs: boolean;
    accessibilityRequirements: boolean;
    cognitiveLoadAnalysis: boolean;
  };

  /** LMS/LXP target */
  targetPlatform?: string;

  /** Compliance requirements */
  compliance: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    section508: boolean;
    essaTierIV: boolean;
  };
}

/**
 * Google Cloud integration configuration
 */
export interface GoogleCloudConfig {
  /** Vertex AI settings */
  vertexAI: {
    projectId: string;
    location: string;
    modelId: string;
  };

  /** BigQuery settings */
  bigQuery: {
    projectId: string;
    datasetId: string;
    tablePrefix: string;
  };

  /** Cloud Storage settings */
  cloudStorage: {
    bucket: string;
    pathPrefix: string;
  };
}

// ============================================================================
// SECTION 9: REAL-TIME COLLABORATION TYPES
// ============================================================================

/**
 * Real-time presence information
 */
export interface UserPresence {
  userId: string;
  userName: string;
  avatarUrl?: string;
  currentStep: number;
  currentField?: string;
  lastActivity: Date;
  cursorPosition?: { x: number; y: number };
}

/**
 * Collaboration event
 */
export interface CollaborationEvent {
  id: string;
  projectId: string;
  userId: string;
  eventType: 'join' | 'leave' | 'edit' | 'comment' | 'cursor-move';
  data: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// SECTION 10: UTILITY TYPES
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
  };
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// SECTION 11: ADDITIONAL TYPE EXPORTS
// ============================================================================

/**
 * Learning modality type definition
 */
export interface LearningModality {
  id: string;
  type: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  percentage: number;
}

/**
 * Modality mix configuration
 */
export interface ModalityMix {
  modalities: LearningModality[];
  primaryModality: string;
}

/**
 * WCAG compliance level
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * Learner persona definition
 */
export interface LearnerPersona {
  id: string;
  name: string;
  role: string;
  experience: string;
  goals: string[];
  challenges: string[];
}

/**
 * Stakeholder definition
 */
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  expectations: string[];
}

/**
 * Business driver definition
 */
export interface BusinessDriver {
  id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Accessibility requirement definition
 */
export interface AccessibilityRequirement {
  id: string;
  type: string;
  description: string;
  wcagLevel: WCAGLevel;
}

/**
 * Technical environment configuration
 */
export interface TechnicalEnvironment {
  platform: string;
  devices: string[];
  browsers: string[];
  bandwidth: string;
  lms?: string;
}

/**
 * Reinforcement strategy type
 */
export type ReinforcementStrategyType =
  | 'spaced-repetition'
  | 'practice-tests'
  | 'peer-teaching'
  | 'real-world-application';

/**
 * Reinforcement strategy definition
 */
export interface ReinforcementStrategy {
  id: string;
  type: ReinforcementStrategyType;
  description: string;
  frequency: string;
}

/**
 * Scheduled activity definition
 */
export interface ScheduledActivity {
  id: string;
  title: string;
  type: string;
  duration: number;
  date: string;
}

// ============================================================================
// END OF INSPIRE TYPE DEFINITIONS
// ============================================================================
