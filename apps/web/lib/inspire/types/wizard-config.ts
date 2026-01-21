import type { ExperienceLevel, ILAStage, INSPIREPillar, WizardStep } from './inspire-types';

// ============================================================================
// SECTION 1: WIZARD PHASE DEFINITIONS
// ============================================================================

/**
 * Wizard phase configuration
 * Each phase represents a major milestone in the course creation process
 */
export interface WizardPhase {
  /** Phase number (1-4) */
  phaseNumber: 1 | 2 | 3 | 4;

  /** Phase name */
  name: string;

  /** Phase description */
  description: string;

  /** Icon name for visual representation */
  icon: string;

  /** Primary ILA stage for this phase */
  primaryStage: ILAStage;

  /** INSPIRE pillars emphasized in this phase */
  inspireEmphasis: INSPIREPillar[];

  /** Steps included in this phase */
  steps: number[];

  /** Color theme for this phase */
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * All four phases of the INSPIRE wizard
 */
export const WIZARD_PHASES: WizardPhase[] = [
  {
    phaseNumber: 1,
    name: 'Discovery & Analysis',
    description:
      'Understand the learning need, audience, environment, and business context. This foundational phase ensures everything that follows is built on solid research.',
    icon: 'search',
    primaryStage: 'encoding',
    inspireEmphasis: ['integrative', 'strategic', 'neuroscience-informed'],
    steps: [1, 2, 3, 4],
    colorTheme: {
      primary: '#1E40AF', // Deep blue
      secondary: '#3B82F6',
      accent: '#93C5FD',
    },
  },
  {
    phaseNumber: 2,
    name: 'Design & Architecture',
    description:
      'Transform analysis into actionable learning objectives, content structures, instructional strategies, and assessment plans. This is where neuroscience meets strategy.',
    icon: 'pencil-ruler',
    primaryStage: 'synthesization',
    inspireEmphasis: ['neuroscience-informed', 'personalized', 'strategic'],
    steps: [5, 6, 7, 8, 9],
    colorTheme: {
      primary: '#7C3AED', // Purple
      secondary: '#A78BFA',
      accent: '#DDD6FE',
    },
  },
  {
    phaseNumber: 3,
    name: 'Development & Production',
    description:
      'Bring the design to life through storyboards, prototypes, media production, and quality assurance. Immersive experiences take shape here.',
    icon: 'hammer',
    primaryStage: 'assimilation',
    inspireEmphasis: ['immersive', 'personalized', 'evolutionary'],
    steps: [10, 11, 12, 13, 14],
    colorTheme: {
      primary: '#059669', // Green
      secondary: '#34D399',
      accent: '#A7F3D0',
    },
  },
  {
    phaseNumber: 4,
    name: 'Deployment & Optimization',
    description:
      'Launch, measure, and continuously improve. Results-focused evaluation ensures lasting impact and evolutionary growth.',
    icon: 'rocket',
    primaryStage: 'assimilation',
    inspireEmphasis: ['results-focused', 'evolutionary', 'strategic'],
    steps: [15, 16, 17],
    colorTheme: {
      primary: '#DC2626', // Red
      secondary: '#F87171',
      accent: '#FECACA',
    },
  },
];

// ============================================================================
// SECTION 2: COMPLETE 17-STEP WIZARD CONFIGURATION
// ============================================================================

/**
 * Extended wizard step with additional metadata
 * This provides everything needed to render and operate each step
 */
export interface ExtendedWizardStep extends WizardStep {
  /** Short title for navigation */
  shortTitle: string;

  /** Icon name */
  icon: string;

  /** Typical time range at different experience levels */
  timeByLevel: {
    novice: { min: number; max: number };
    intermediate: { min: number; max: number };
    advanced: { min: number; max: number };
    expert: { min: number; max: number };
  };

  /** Key questions this step answers */
  keyQuestions: string[];

  /** Outputs/deliverables from this step */
  deliverables: string[];

  /** Common mistakes to avoid */
  commonMistakes: string[];

  /** Success criteria */
  successCriteria: string[];

  /** Related book chapters for "Dive Deeper" */
  bookChapters: string[];

  /** Industry-specific considerations */
  industryConsiderations: {
    healthcare?: string;
    aerospace?: string;
    manufacturing?: string;
    general: string;
  };
}

/**
 * Complete 17-step wizard configuration
 * Each step is fully documented with all metadata needed for the UI
 */
export const WIZARD_STEPS: ExtendedWizardStep[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: DISCOVERY & ANALYSIS (Steps 1-4)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    stepNumber: 1,
    name: 'Project Initiation & Stakeholder Alignment',
    shortTitle: 'Project Setup',
    description:
      'Define the project scope, identify key stakeholders, establish the business case, and set clear expectations for success. This step ensures everyone is aligned before development begins.',
    phase: 1,
    stage: 'encoding',
    tools: ['itla'],
    icon: 'briefcase',
    required: true,
    prerequisites: [],
    estimatedMinutes: 30,
    timeByLevel: {
      novice: { min: 45, max: 60 },
      intermediate: { min: 30, max: 45 },
      advanced: { min: 20, max: 30 },
      expert: { min: 10, max: 20 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Project initiation is critical - it sets the foundation for everything that follows. A well-defined project prevents scope creep, ensures stakeholder buy-in, and establishes clear success metrics.',
      videoTutorialUrl: '/tutorials/step-1-project-initiation',
      diveDeeper: [
        'Strategic alignment with business goals',
        'ROI expectation setting',
        'Stakeholder identification matrix',
        'Project charter development',
      ],
      examples: [
        'Healthcare compliance training project charter',
        'Manufacturing safety onboarding initiative',
        'Leadership development program scope',
      ],
    },
    keyQuestions: [
      'What business problem are we solving?',
      'Who are the key stakeholders and sponsors?',
      'What does success look like?',
      'What are the timeline and budget constraints?',
      'Are there regulatory or compliance requirements?',
    ],
    deliverables: [
      'Project charter document',
      'Stakeholder map',
      'Success metrics definition',
      'High-level timeline',
      'Budget estimate',
    ],
    commonMistakes: [
      'Skipping stakeholder alignment - leads to rework later',
      'Vague success metrics - cannot measure ROI',
      'Unrealistic timelines - quality suffers',
      'Missing compliance requirements - legal/regulatory risk',
    ],
    successCriteria: [
      'All key stakeholders identified and consulted',
      'Clear, measurable success metrics defined',
      'Budget and timeline approved',
      'Project charter signed off',
    ],
    bookChapters: ['Chapter 1', 'Chapter 5'],
    industryConsiderations: {
      healthcare: 'Include HIPAA compliance requirements and patient safety considerations',
      aerospace: 'Reference FAA/EASA regulations and safety-critical training requirements',
      manufacturing: 'Address OSHA requirements and equipment-specific certifications',
      general: 'Ensure alignment with organizational strategic goals and learning culture',
    },
  },

  {
    stepNumber: 2,
    name: 'Learner Analysis & Persona Development',
    shortTitle: 'Learner Personas',
    description:
      'Understand who your learners are - their demographics, prior knowledge, learning preferences, accessibility needs, and motivations. Create detailed personas to guide design decisions.',
    phase: 1,
    stage: 'encoding',
    tools: ['itla'],
    icon: 'users',
    required: true,
    prerequisites: [1],
    estimatedMinutes: 45,
    timeByLevel: {
      novice: { min: 60, max: 90 },
      intermediate: { min: 40, max: 60 },
      advanced: { min: 25, max: 40 },
      expert: { min: 15, max: 25 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Understanding your learners is the cornerstone of learner-centered design. Adult learners have unique characteristics - they are self-directed, bring prior experience, and need to see relevance to their work.',
      videoTutorialUrl: '/tutorials/step-2-learner-analysis',
      diveDeeper: [
        'Adult learning theory (Andragogy)',
        'VARK learning preferences',
        'Neurodiversity considerations',
        'Accessibility requirements (WCAG, Section 508)',
        'Motivation and engagement factors',
      ],
      examples: [
        'Entry-level aerospace technician persona',
        'Senior healthcare administrator persona',
        'Multi-generational manufacturing workforce analysis',
      ],
    },
    keyQuestions: [
      'Who are our learners (roles, demographics)?',
      'What do they already know about this topic?',
      'What are their learning preferences?',
      'What accessibility needs must we accommodate?',
      'What motivates them to learn?',
      'What barriers might prevent them from learning?',
    ],
    deliverables: [
      'Learner personas (3-5 detailed profiles)',
      'Prior knowledge assessment plan',
      'Accessibility requirements document',
      'Learning preferences summary',
      'Motivation factors analysis',
    ],
    commonMistakes: [
      'Assuming all learners are the same',
      'Ignoring accessibility requirements',
      'Overestimating prior knowledge',
      'Not considering motivation factors',
      'Forgetting neurodiversity needs',
    ],
    successCriteria: [
      'At least 3 detailed learner personas created',
      'Accessibility requirements documented',
      'Prior knowledge level determined',
      'Learning preferences identified',
    ],
    bookChapters: ['Chapter 2', 'Chapter 4'],
    industryConsiderations: {
      healthcare: 'Consider varied clinical backgrounds and shift schedules',
      aerospace: 'Account for technical expertise levels and certification requirements',
      manufacturing: 'Address literacy levels and language barriers',
      general: 'Include generational differences and remote/on-site considerations',
    },
  },

  {
    stepNumber: 3,
    name: 'Needs Assessment & Gap Analysis',
    shortTitle: 'Needs Analysis',
    description:
      'Identify the gap between current performance and desired performance. Determine root causes and confirm that training is the right solution to close the gap.',
    phase: 1,
    stage: 'encoding',
    tools: ['itla'],
    icon: 'chart-bar',
    required: true,
    prerequisites: [1, 2],
    estimatedMinutes: 40,
    timeByLevel: {
      novice: { min: 50, max: 75 },
      intermediate: { min: 35, max: 50 },
      advanced: { min: 20, max: 35 },
      expert: { min: 10, max: 20 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        "Not every performance problem is a training problem. Needs assessment helps distinguish skill/knowledge gaps from other issues like motivation, environment, or resources. This prevents building training that won't solve the actual problem.",
      videoTutorialUrl: '/tutorials/step-3-needs-assessment',
      diveDeeper: [
        "Gilbert's Behavior Engineering Model",
        'Root cause analysis techniques',
        'Performance vs. training needs',
        'Data collection methods',
      ],
      examples: [
        'Safety incident root cause analysis',
        'Customer service performance gap analysis',
        'Technical skill gap assessment',
      ],
    },
    keyQuestions: [
      'What is the current state of performance?',
      'What is the desired state of performance?',
      'What is causing the gap?',
      'Is training the right solution?',
      'What will happen if we do nothing?',
    ],
    deliverables: [
      'Performance gap analysis document',
      'Root cause analysis',
      'Training vs. non-training solutions',
      'Priority ranking of needs',
      'Baseline metrics for later comparison',
    ],
    commonMistakes: [
      'Assuming training is always the answer',
      'Skipping root cause analysis',
      'Not establishing baseline metrics',
      'Ignoring environmental factors',
    ],
    successCriteria: [
      'Clear gap between current and desired state',
      'Root causes identified and documented',
      'Training confirmed as appropriate solution',
      'Baseline metrics established',
    ],
    bookChapters: ['Chapter 5'],
    industryConsiderations: {
      healthcare: 'Consider patient outcome data and quality metrics',
      aerospace: 'Analyze incident reports and maintenance data',
      manufacturing: 'Review quality control data and safety records',
      general: 'Use multiple data sources to triangulate findings',
    },
  },

  {
    stepNumber: 4,
    name: 'Environmental & Context Analysis',
    shortTitle: 'Context Analysis',
    description:
      'Assess the technical infrastructure, delivery constraints, cultural factors, and organizational readiness. Ensure the solution will work in the real-world environment.',
    phase: 1,
    stage: 'encoding',
    tools: ['itla'],
    icon: 'building',
    required: true,
    prerequisites: [1],
    estimatedMinutes: 35,
    timeByLevel: {
      novice: { min: 45, max: 60 },
      intermediate: { min: 30, max: 45 },
      advanced: { min: 20, max: 30 },
      expert: { min: 10, max: 20 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        "The best-designed training can fail if it doesn't fit the learning environment. This step ensures your solution is compatible with the technical infrastructure, time available, cultural norms, and other contextual factors.",
      videoTutorialUrl: '/tutorials/step-4-context-analysis',
      diveDeeper: [
        'Technical infrastructure assessment',
        'LMS/LXP platform capabilities',
        'Bandwidth and device considerations',
        'Organizational culture assessment',
        'Change readiness factors',
      ],
      examples: [
        'Global organization multi-language deployment',
        'Factory floor training environment assessment',
        'Remote workforce technology audit',
      ],
    },
    keyQuestions: [
      'What technology is available to learners?',
      'What are the bandwidth/connectivity constraints?',
      'How much time can learners dedicate to training?',
      'What is the organizational culture around learning?',
      'Are there manager/leadership support factors?',
    ],
    deliverables: [
      'Technical infrastructure audit',
      'Device and browser compatibility requirements',
      'Time and scheduling constraints',
      'Cultural considerations document',
      'Manager engagement plan',
    ],
    commonMistakes: [
      'Overestimating technology capabilities',
      'Not considering bandwidth limitations',
      'Ignoring time constraints',
      'Underestimating cultural resistance',
    ],
    successCriteria: [
      'Technical requirements documented',
      'Delivery constraints identified',
      'Cultural factors assessed',
      'Manager support plan developed',
    ],
    bookChapters: ['Chapter 4', 'Chapter 5'],
    industryConsiderations: {
      healthcare: 'Consider clinical workflow integration and shift handoffs',
      aerospace: 'Account for hangar/flight line environments and security restrictions',
      manufacturing: 'Address production floor access and safety zones',
      general: 'Ensure mobile compatibility for distributed workforce',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: DESIGN & ARCHITECTURE (Steps 5-9)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    stepNumber: 5,
    name: 'Learning Objectives & Competency Mapping',
    shortTitle: 'Objectives',
    description:
      "Define clear, measurable learning objectives using Bloom's Taxonomy. Map objectives to competencies and job performance requirements. This is where we translate needs into specific learning outcomes.",
    phase: 2,
    stage: 'synthesization',
    tools: ['icl', 'icdt'],
    icon: 'target',
    required: true,
    prerequisites: [3],
    estimatedMinutes: 50,
    timeByLevel: {
      novice: { min: 60, max: 90 },
      intermediate: { min: 45, max: 60 },
      advanced: { min: 30, max: 45 },
      expert: { min: 15, max: 30 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Learning objectives are the foundation of instructional design. Well-written objectives specify exactly what learners will be able to DO after training, making assessment and evaluation straightforward.',
      videoTutorialUrl: '/tutorials/step-5-learning-objectives',
      diveDeeper: [
        "Bloom's Revised Taxonomy",
        'ABCD objective format',
        'Terminal vs. enabling objectives',
        'Competency framework development',
        'Measurable action verbs',
      ],
      examples: [
        'Technical skill objectives hierarchy',
        'Leadership competency mapping',
        'Compliance training objectives',
      ],
    },
    keyQuestions: [
      'What will learners be able to DO after training?',
      'How will we measure achievement?',
      "What cognitive level is required (Bloom's)?",
      'How do objectives map to job competencies?',
      'What is the hierarchy of objectives?',
    ],
    deliverables: [
      'Terminal learning objectives',
      'Enabling objectives hierarchy',
      'Competency mapping matrix',
      "Bloom's taxonomy alignment",
      'Assessment criteria for each objective',
    ],
    commonMistakes: [
      'Writing vague, unmeasurable objectives',
      'Objectives at wrong cognitive level',
      'Too many objectives for time available',
      'Missing the job performance connection',
    ],
    successCriteria: [
      'All objectives are measurable',
      "Objectives mapped to Bloom's levels",
      'Competency alignment documented',
      'Assessment method for each objective',
    ],
    bookChapters: ['Chapter 6', 'Chapter 7'],
    industryConsiderations: {
      healthcare: 'Align with clinical competency frameworks and nursing standards',
      aerospace: 'Map to FAA/EASA competency requirements',
      manufacturing: 'Connect to job task analysis and SOPs',
      general: 'Ensure objectives support business outcomes',
    },
  },

  {
    stepNumber: 6,
    name: 'Content Architecture & Curriculum Design',
    shortTitle: 'Content Structure',
    description:
      'Organize content into logical modules, lessons, and topics. Design learning pathways that scaffold from basic to advanced. Apply neuroscience principles to content sequencing.',
    phase: 2,
    stage: 'synthesization',
    tools: ['icpf', 'nppm'],
    icon: 'sitemap',
    required: true,
    prerequisites: [5],
    estimatedMinutes: 60,
    timeByLevel: {
      novice: { min: 75, max: 120 },
      intermediate: { min: 50, max: 75 },
      advanced: { min: 35, max: 50 },
      expert: { min: 20, max: 35 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Content architecture is about organizing learning in a way that makes sense to the brain. We use chunking, sequencing, and scaffolding based on cognitive load theory and neuroplasticity principles.',
      videoTutorialUrl: '/tutorials/step-6-content-architecture',
      diveDeeper: [
        'Cognitive load theory in sequencing',
        'Scaffolding and prerequisites',
        'Microlearning structure',
        'Learning pathways design',
        'Adaptive path branching',
      ],
      examples: [
        'Technical certification curriculum',
        'Leadership development pathway',
        'Onboarding program structure',
      ],
    },
    keyQuestions: [
      'How should content be chunked?',
      'What is the optimal sequence?',
      'What are the prerequisite relationships?',
      'How long should each module be?',
      'Where should adaptive branching occur?',
    ],
    deliverables: [
      'Course outline with modules and lessons',
      'Learning pathway diagram',
      'Prerequisite mapping',
      'Time allocation per section',
      'Adaptive path decision points',
    ],
    commonMistakes: [
      'Information overload in modules',
      'Illogical sequencing',
      'Missing prerequisites',
      'No consideration of cognitive load',
    ],
    successCriteria: [
      'Logical content hierarchy established',
      'Prerequisites mapped',
      'Module durations appropriate',
      'Adaptive paths identified',
    ],
    bookChapters: ['Chapter 3', 'Chapter 6', 'Chapter 7'],
    industryConsiderations: {
      healthcare: 'Integrate clinical workflows and case-based learning',
      aerospace: 'Follow training requirements from OEM and regulators',
      manufacturing: 'Sequence around equipment and process logic',
      general: 'Apply spaced repetition and retrieval practice principles',
    },
  },

  {
    stepNumber: 7,
    name: 'Instructional Strategy Selection',
    shortTitle: 'Strategy',
    description:
      'Choose the instructional approaches that best fit your objectives, learners, and context. Apply INSPIRE neuroscience principles to select strategies that optimize learning.',
    phase: 2,
    stage: 'encoding',
    tools: ['nppm', 'ilmi', 'ices'],
    icon: 'lightbulb',
    required: true,
    prerequisites: [5, 6],
    estimatedMinutes: 45,
    timeByLevel: {
      novice: { min: 60, max: 90 },
      intermediate: { min: 40, max: 60 },
      advanced: { min: 25, max: 40 },
      expert: { min: 15, max: 25 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Strategy selection is where neuroscience meets pedagogy. We choose approaches like active learning, collaborative learning, scenario-based learning based on what will activate the right neural pathways for deep encoding.',
      videoTutorialUrl: '/tutorials/step-7-instructional-strategy',
      diveDeeper: [
        'Active vs. passive learning strategies',
        'Collaborative learning approaches',
        'Scenario-based and problem-based learning',
        'Experiential learning cycle',
        'NPPM reinforcement strategies',
        'ILMI modality selection',
        'ICES cognitive engagement levels',
      ],
      examples: [
        'Immersive scenario-based safety training',
        'Collaborative leadership workshop',
        'Self-paced technical certification',
      ],
    },
    keyQuestions: [
      'What cognitive engagement level is needed (ICES)?',
      'Which learning modalities are best (ILMI)?',
      'How will we reinforce learning (NPPM)?',
      'What instructional approach fits best?',
      'How will we integrate neuroscience principles?',
    ],
    deliverables: [
      'Instructional strategy document',
      'ICES level assignments',
      'ILMI modality selections',
      'NPPM reinforcement plan',
      'Activity type mapping',
    ],
    commonMistakes: [
      'Defaulting to passive approaches',
      'Ignoring cognitive load considerations',
      'Not matching strategy to objectives',
      'Skipping reinforcement planning',
    ],
    successCriteria: [
      'Strategies aligned with objectives',
      'ICES levels appropriate for content',
      'Multiple modalities integrated (ILMI)',
      'Reinforcement plan in place (NPPM)',
    ],
    bookChapters: ['Chapter 3', 'Chapter 7', 'Chapter 8'],
    industryConsiderations: {
      healthcare: 'Include simulation for clinical skills',
      aerospace: 'Use simulator-based training for procedural skills',
      manufacturing: 'Emphasize hands-on, kinesthetic approaches',
      general: 'Balance efficiency with engagement',
    },
  },

  {
    stepNumber: 8,
    name: 'Assessment Strategy & Validation',
    shortTitle: 'Assessments',
    description:
      'Design formative and summative assessments that accurately measure learning. Create rubrics, question banks, and validation approaches. Ensure assessments are fair, reliable, and valid.',
    phase: 2,
    stage: 'synthesization',
    tools: ['icdt', 'ipmg'],
    icon: 'clipboard-check',
    required: true,
    prerequisites: [5],
    estimatedMinutes: 50,
    timeByLevel: {
      novice: { min: 60, max: 90 },
      intermediate: { min: 45, max: 60 },
      advanced: { min: 30, max: 45 },
      expert: { min: 15, max: 30 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        "Assessment is not just testing - it's a learning opportunity. Formative assessments help learners identify gaps. Summative assessments validate competency. Both must align precisely with objectives.",
      videoTutorialUrl: '/tutorials/step-8-assessment-strategy',
      diveDeeper: [
        'Formative vs. summative assessment',
        'Authentic assessment design',
        'Rubric development',
        'Question item analysis',
        'Reliability and validity',
      ],
      examples: [
        'Performance-based assessment rubrics',
        'Scenario-based assessment items',
        'Certification exam blueprint',
      ],
    },
    keyQuestions: [
      'How will we measure each objective?',
      'What formative checks will guide learning?',
      'What summative assessment validates mastery?',
      'How will we ensure fairness and validity?',
      'What is the passing standard?',
    ],
    deliverables: [
      'Assessment blueprint',
      'Formative assessment plan',
      'Summative assessment design',
      'Rubrics and scoring guides',
      'Question bank (if applicable)',
    ],
    commonMistakes: [
      "Assessments don't match objectives",
      'Only testing recall, not application',
      'No formative checks',
      'Unclear scoring criteria',
    ],
    successCriteria: [
      'Every objective has an assessment',
      'Mix of formative and summative',
      'Clear rubrics for complex tasks',
      'Passing standards defined',
    ],
    bookChapters: ['Chapter 6', 'Chapter 15'],
    industryConsiderations: {
      healthcare: 'Include clinical skill demonstrations',
      aerospace: 'Design for certification requirements',
      manufacturing: 'Incorporate practical demonstrations',
      general: 'Balance efficiency with authenticity',
    },
  },

  {
    stepNumber: 9,
    name: 'Media & Interaction Design',
    shortTitle: 'Media Design',
    description:
      'Select and specify media types, interaction patterns, and accessibility requirements. Apply cognitive load optimization and design for engagement across all modalities.',
    phase: 2,
    stage: 'assimilation',
    tools: ['ilmi', 'idns'],
    icon: 'film',
    required: true,
    prerequisites: [7],
    estimatedMinutes: 55,
    timeByLevel: {
      novice: { min: 70, max: 100 },
      intermediate: { min: 50, max: 70 },
      advanced: { min: 35, max: 50 },
      expert: { min: 20, max: 35 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Media and interactions are the vehicles for learning content. Every media choice should be purposeful - supporting cognitive engagement, not just looking pretty. This is where we operationalize cognitive load theory.',
      videoTutorialUrl: '/tutorials/step-9-media-design',
      diveDeeper: [
        "Mayer's multimedia principles",
        'Cognitive load in media design',
        'Interaction patterns',
        'Accessibility in media',
        'Video, graphics, and animation',
      ],
      examples: [
        'Interactive scenario specifications',
        'Video production brief',
        'Accessibility requirements document',
      ],
    },
    keyQuestions: [
      'What media best supports each objective?',
      'How will we minimize extraneous load?',
      'What interactions support active learning?',
      'How will we ensure accessibility?',
      'What is the real-time cognitive load?',
    ],
    deliverables: [
      'Media selection matrix',
      'Interaction specifications',
      'Accessibility requirements',
      'Cognitive load analysis',
      'Asset production requirements',
    ],
    commonMistakes: [
      "Media doesn't serve learning purpose",
      'Cognitive overload from complex designs',
      'Inaccessible media formats',
      'Interactions that distract rather than engage',
    ],
    successCriteria: [
      'Media aligned with objectives',
      'Cognitive load optimized',
      'WCAG compliance planned',
      'Interaction patterns specified',
    ],
    bookChapters: ['Chapter 3', 'Chapter 8'],
    industryConsiderations: {
      healthcare: 'Include clinical imagery and procedure videos',
      aerospace: 'Use cockpit/equipment visuals and simulations',
      manufacturing: 'Show equipment and processes clearly',
      general: 'Ensure mobile and VR compatibility',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: DEVELOPMENT & PRODUCTION (Steps 10-14)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    stepNumber: 10,
    name: 'Storyboard & Script Development',
    shortTitle: 'Storyboards',
    description:
      'Create detailed storyboards and scripts that specify every screen, interaction, narration, and visual element. This is the blueprint for production.',
    phase: 3,
    stage: 'assimilation',
    tools: ['idns', 'ilem'],
    icon: 'layout',
    required: true,
    prerequisites: [6, 7, 9],
    estimatedMinutes: 90,
    timeByLevel: {
      novice: { min: 120, max: 180 },
      intermediate: { min: 80, max: 120 },
      advanced: { min: 50, max: 80 },
      expert: { min: 30, max: 50 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Storyboards translate design into actionable production documents. Every element is specified so developers know exactly what to build. Clear storyboards prevent costly rework.',
      videoTutorialUrl: '/tutorials/step-10-storyboards',
      diveDeeper: [
        'Storyboard formats and templates',
        'Script writing for learning',
        'Visual specifications',
        'Interaction flow documentation',
        'SME review process',
      ],
      examples: [
        'Branching scenario storyboard',
        'Video script with timestamps',
        'Interactive simulation specification',
      ],
    },
    keyQuestions: [
      'What appears on each screen?',
      'What does the narration/text say?',
      'What interactions are available?',
      'What happens after each interaction?',
      'How is feedback provided?',
    ],
    deliverables: [
      'Complete storyboards',
      'Narration scripts',
      'Visual specifications',
      'Interaction flow diagrams',
      'SME review documentation',
    ],
    commonMistakes: [
      'Incomplete specifications',
      'Scripts too long/complex',
      'Missing interaction details',
      'No SME review',
    ],
    successCriteria: [
      'All screens documented',
      'Scripts reviewed by SME',
      'Interactions fully specified',
      'Ready for production',
    ],
    bookChapters: ['Chapter 7', 'Chapter 8'],
    industryConsiderations: {
      healthcare: 'Include clinical accuracy review',
      aerospace: 'Ensure technical accuracy with SMEs',
      manufacturing: 'Reference SOPs and safety requirements',
      general: 'Plan for accessibility from the start',
    },
  },

  {
    stepNumber: 11,
    name: 'Prototype Development',
    shortTitle: 'Prototype',
    description:
      'Build a working prototype of key interactions to test with stakeholders and learners. Iterate based on feedback before full development.',
    phase: 3,
    stage: 'assimilation',
    tools: ['iadc'],
    icon: 'box',
    required: false,
    prerequisites: [10],
    estimatedMinutes: 120,
    timeByLevel: {
      novice: { min: 150, max: 240 },
      intermediate: { min: 100, max: 150 },
      advanced: { min: 60, max: 100 },
      expert: { min: 30, max: 60 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        "Prototyping is where you test your design with real users before committing to full production. It's much cheaper to fix problems at this stage than after full development.",
      videoTutorialUrl: '/tutorials/step-11-prototyping',
      diveDeeper: [
        'Rapid prototyping techniques',
        'User testing methods',
        'Iteration based on feedback',
        'Stakeholder review process',
        'v0 Authoring Tool Integration (Placeholder)',
      ],
      examples: [
        'Interactive scenario prototype',
        'Navigation and flow prototype',
        'Mobile responsiveness test',
      ],
    },
    keyQuestions: [
      'What critical elements need testing?',
      'How will we gather feedback?',
      'What are the success criteria?',
      'How many iterations are planned?',
      'Who needs to approve the prototype?',
    ],
    deliverables: [
      'Working prototype',
      'User testing feedback',
      'Iteration documentation',
      'Stakeholder sign-off',
      'Updated storyboards (if needed)',
    ],
    commonMistakes: [
      'Skipping prototype testing',
      'Testing with wrong users',
      'Ignoring negative feedback',
      'Too many iterations without progress',
    ],
    successCriteria: [
      'Prototype tested with target users',
      'Critical feedback addressed',
      'Stakeholder approval obtained',
      'Ready for full development',
    ],
    bookChapters: ['Chapter 7'],
    industryConsiderations: {
      healthcare: 'Include clinical end-users in testing',
      aerospace: 'Test with actual pilots/technicians',
      manufacturing: 'Test on production floor devices',
      general: 'Test across all target devices/platforms',
    },
  },

  {
    stepNumber: 12,
    name: 'Media Production',
    shortTitle: 'Production',
    description:
      'Produce all required media assets - videos, graphics, audio, animations. Ensure quality standards and accessibility requirements are met.',
    phase: 3,
    stage: 'assimilation',
    tools: ['ilem'],
    icon: 'video',
    required: true,
    prerequisites: [10],
    estimatedMinutes: 180,
    timeByLevel: {
      novice: { min: 240, max: 360 },
      intermediate: { min: 150, max: 240 },
      advanced: { min: 90, max: 150 },
      expert: { min: 60, max: 90 },
    },
    aiAssistance: {
      draftGeneration: false,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Media production brings your storyboards to life. Quality matters - poor audio, confusing visuals, or inaccessible content will undermine even the best design.',
      videoTutorialUrl: '/tutorials/step-12-media-production',
      diveDeeper: [
        'Video production best practices',
        'Graphics and animation guidelines',
        'Audio quality standards',
        'Captioning and transcription',
        'Asset management',
      ],
      examples: [
        'Video production checklist',
        'Graphic design specifications',
        'Audio recording guidelines',
      ],
    },
    keyQuestions: [
      'What assets need to be produced?',
      'What are the quality standards?',
      'Who is responsible for each asset?',
      'What is the production timeline?',
      'How will accessibility be ensured?',
    ],
    deliverables: [
      'All video assets',
      'Graphics and images',
      'Audio files',
      'Animations/simulations',
      'Caption/transcript files',
    ],
    commonMistakes: [
      'Poor audio quality',
      'Inconsistent visual style',
      'Missing captions/transcripts',
      "Assets don't match specifications",
    ],
    successCriteria: [
      'All assets produced per specs',
      'Quality standards met',
      'Accessibility requirements met',
      'Asset library organized',
    ],
    bookChapters: ['Chapter 8'],
    industryConsiderations: {
      healthcare: 'Ensure HIPAA compliance in unknown patient-related content',
      aerospace: 'Use high-fidelity cockpit/equipment imagery',
      manufacturing: 'Show equipment clearly and safely',
      general: 'Maintain consistent brand standards',
    },
  },

  {
    stepNumber: 13,
    name: 'Course Assembly & Integration',
    shortTitle: 'Assembly',
    description:
      'Assemble all content and media into the final course structure. Integrate with LMS/LXP, configure navigation, and ensure technical functionality.',
    phase: 3,
    stage: 'assimilation',
    tools: ['ilem'],
    icon: 'puzzle-piece',
    required: true,
    prerequisites: [10, 12],
    estimatedMinutes: 90,
    timeByLevel: {
      novice: { min: 120, max: 180 },
      intermediate: { min: 80, max: 120 },
      advanced: { min: 50, max: 80 },
      expert: { min: 30, max: 50 },
    },
    aiAssistance: {
      draftGeneration: false,
      suggestions: true,
      validation: true,
      examples: false,
    },
    helpContent: {
      overview:
        'Course assembly is where all the pieces come together. Technical configuration, navigation flow, LMS integration, and final polish happen here.',
      videoTutorialUrl: '/tutorials/step-13-assembly',
      diveDeeper: [
        'LMS/LXP integration',
        'SCORM/xAPI configuration',
        'Navigation and flow setup',
        'Variable and branching logic',
        'Publishing settings',
      ],
      examples: [
        'SCORM package configuration',
        'xAPI statement design',
        'Navigation logic documentation',
      ],
    },
    keyQuestions: [
      'How will the course be delivered?',
      'What tracking is required?',
      'How should navigation work?',
      'What completion criteria apply?',
      'How will data be captured?',
    ],
    deliverables: [
      'Assembled course package',
      'LMS configuration documentation',
      'Navigation logic documentation',
      'xAPI/SCORM configuration',
      'Initial technical testing results',
    ],
    commonMistakes: [
      'Poor LMS integration',
      'Broken navigation paths',
      'Tracking not working',
      'Missing completion triggers',
    ],
    successCriteria: [
      'Course assembled and functional',
      'LMS integration working',
      'Tracking configured correctly',
      'Navigation tested',
    ],
    bookChapters: ['Chapter 8', 'Chapter 15'],
    industryConsiderations: {
      healthcare: 'Ensure compliance tracking meets regulatory needs',
      aerospace: 'Configure for training records requirements',
      manufacturing: 'Integrate with existing training systems',
      general: 'Test across all target platforms',
    },
  },

  {
    stepNumber: 14,
    name: 'Quality Assurance & Testing',
    shortTitle: 'QA Testing',
    description:
      'Comprehensive testing for functionality, accessibility, content accuracy, and cognitive load validation. Ensure the course works as designed.',
    phase: 3,
    stage: 'assimilation',
    tools: ['ialm'],
    icon: 'check-circle',
    required: true,
    prerequisites: [13],
    estimatedMinutes: 60,
    timeByLevel: {
      novice: { min: 90, max: 120 },
      intermediate: { min: 60, max: 90 },
      advanced: { min: 40, max: 60 },
      expert: { min: 20, max: 40 },
    },
    aiAssistance: {
      draftGeneration: false,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'QA testing catches problems before learners do. We test functionality, accessibility, content accuracy, and cognitive load to ensure a quality learning experience.',
      videoTutorialUrl: '/tutorials/step-14-qa-testing',
      diveDeeper: [
        'Functional testing checklist',
        'Accessibility testing (WCAG)',
        'Content accuracy review',
        'Cognitive load validation (NASA-TLX, Paas)',
        'Cross-browser/device testing',
      ],
      examples: [
        'QA testing checklist',
        'Accessibility audit report',
        'Bug tracking and resolution',
      ],
    },
    keyQuestions: [
      'Does everything work as designed?',
      'Is the course accessible?',
      'Is all content accurate?',
      'Is cognitive load optimized?',
      'Does it work on all target platforms?',
    ],
    deliverables: [
      'Functional test results',
      'Accessibility audit report',
      'Content accuracy sign-off',
      'Cognitive load validation',
      'Bug resolution documentation',
    ],
    commonMistakes: [
      'Insufficient testing time',
      'Not testing on target devices',
      'Ignoring accessibility testing',
      'Not retesting after fixes',
    ],
    successCriteria: [
      'All critical bugs resolved',
      'Accessibility standards met',
      'Content approved by SME',
      'Cognitive load within targets',
    ],
    bookChapters: ['Chapter 8', 'Chapter 15'],
    industryConsiderations: {
      healthcare: 'Include clinical accuracy review',
      aerospace: 'Technical accuracy review required',
      manufacturing: 'Safety information accuracy critical',
      general: 'Test with representative users',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: DEPLOYMENT & OPTIMIZATION (Steps 15-17)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    stepNumber: 15,
    name: 'Pilot & Beta Testing',
    shortTitle: 'Pilot',
    description:
      'Deploy to a pilot group, collect feedback, and make final refinements before full launch. Validate effectiveness with real learners.',
    phase: 4,
    stage: 'assimilation',
    tools: ['ialm'],
    icon: 'users-cog',
    required: false,
    prerequisites: [14],
    estimatedMinutes: 120,
    timeByLevel: {
      novice: { min: 150, max: 240 },
      intermediate: { min: 100, max: 150 },
      advanced: { min: 60, max: 100 },
      expert: { min: 30, max: 60 },
    },
    aiAssistance: {
      draftGeneration: false,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Pilot testing is your last chance to catch issues before full deployment. A well-run pilot provides valuable feedback and builds champion advocates for the training.',
      videoTutorialUrl: '/tutorials/step-15-pilot-testing',
      diveDeeper: [
        'Pilot group selection',
        'Feedback collection methods',
        'Success metrics for pilot',
        'Issue tracking and resolution',
        'Go/no-go decision criteria',
      ],
      examples: ['Pilot plan template', 'Feedback survey design', 'Pilot results analysis'],
    },
    keyQuestions: [
      'Who should be in the pilot group?',
      'How will we collect feedback?',
      'What metrics define success?',
      'What issues must be fixed before launch?',
      'Who makes the go/no-go decision?',
    ],
    deliverables: [
      'Pilot plan',
      'Feedback collection instruments',
      'Pilot results analysis',
      'Issue resolution documentation',
      'Go/no-go recommendation',
    ],
    commonMistakes: [
      'Pilot group not representative',
      'Not enough time for feedback',
      'Ignoring critical feedback',
      'Rushing to launch despite issues',
    ],
    successCriteria: [
      'Representative pilot completed',
      'Key feedback addressed',
      'Success metrics achieved',
      'Stakeholder go decision',
    ],
    bookChapters: ['Chapter 15'],
    industryConsiderations: {
      healthcare: 'Include clinical staff from target departments',
      aerospace: 'Pilot with actual crews/technicians',
      manufacturing: 'Test across shifts and locations',
      general: 'Ensure pilot reflects diversity of audience',
    },
  },

  {
    stepNumber: 16,
    name: 'Launch & Deployment',
    shortTitle: 'Launch',
    description:
      'Execute the full launch with communication plans, support documentation, and rollout management. Ensure a smooth transition to live training.',
    phase: 4,
    stage: 'assimilation',
    tools: ['ialm'],
    icon: 'rocket',
    required: true,
    prerequisites: [14],
    estimatedMinutes: 60,
    timeByLevel: {
      novice: { min: 90, max: 120 },
      intermediate: { min: 60, max: 90 },
      advanced: { min: 40, max: 60 },
      expert: { min: 20, max: 40 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'A successful launch requires more than just making the course available. Communication, support resources, and rollout management ensure learners actually engage with the training.',
      videoTutorialUrl: '/tutorials/step-16-launch',
      diveDeeper: [
        'Communication planning',
        'Support resource development',
        'Rollout management',
        'Troubleshooting common issues',
        'Change management',
      ],
      examples: ['Launch communication templates', 'Support FAQ document', 'Rollout schedule'],
    },
    keyQuestions: [
      'How will we communicate the launch?',
      'What support resources are needed?',
      'What is the rollout schedule?',
      'Who handles support issues?',
      'How will we track early adoption?',
    ],
    deliverables: [
      'Launch communication plan',
      'Support documentation (FAQs, guides)',
      'Rollout schedule',
      'Escalation procedures',
      'Early adoption tracking',
    ],
    commonMistakes: [
      'Poor communication about launch',
      'No support resources ready',
      'Overwhelming learners with too much at once',
      'Not monitoring early issues',
    ],
    successCriteria: [
      'Communication delivered',
      'Support resources available',
      'Rollout proceeding on schedule',
      'Early issues being addressed',
    ],
    bookChapters: ['Chapter 15'],
    industryConsiderations: {
      healthcare: 'Coordinate with clinical schedules',
      aerospace: 'Align with training requirements calendar',
      manufacturing: 'Work around production schedules',
      general: 'Consider time zones for global rollouts',
    },
  },

  {
    stepNumber: 17,
    name: 'Evaluation & Continuous Improvement',
    shortTitle: 'Evaluation',
    description:
      'Measure learning effectiveness using Kirkpatrick levels, calculate ROI, document ESSA Tier IV compliance, and plan iterative improvements. This is the "Evolutionary" principle in action.',
    phase: 4,
    stage: 'assimilation',
    tools: ['ialm'],
    icon: 'chart-line',
    required: true,
    prerequisites: [16],
    estimatedMinutes: 90,
    timeByLevel: {
      novice: { min: 120, max: 180 },
      intermediate: { min: 80, max: 120 },
      advanced: { min: 50, max: 80 },
      expert: { min: 30, max: 50 },
    },
    aiAssistance: {
      draftGeneration: true,
      suggestions: true,
      validation: true,
      examples: true,
    },
    helpContent: {
      overview:
        'Evaluation closes the loop - we measure whether training achieved its goals and use data to continuously improve. This is where results-focused and evolutionary principles come together.',
      videoTutorialUrl: '/tutorials/step-17-evaluation',
      diveDeeper: [
        'Kirkpatrick 4-level evaluation',
        'Phillips ROI methodology',
        'xAPI analytics and dashboards',
        'ESSA Tier IV compliance documentation',
        'Continuous improvement planning',
      ],
      examples: [
        'Kirkpatrick evaluation report',
        'ROI calculation example',
        'ESSA Tier IV logic model',
        'Improvement recommendations',
      ],
    },
    keyQuestions: [
      'Did learners achieve the objectives (Level 2)?',
      'Did behavior change on the job (Level 3)?',
      'Did business metrics improve (Level 4)?',
      'What is the ROI?',
      'What improvements should we make?',
    ],
    deliverables: [
      'Kirkpatrick evaluation report',
      'ROI calculation (if applicable)',
      'xAPI analytics dashboard',
      'ESSA Tier IV documentation',
      'Continuous improvement plan',
    ],
    commonMistakes: [
      'Only measuring completion (Level 1)',
      'Not connecting to business outcomes',
      'No baseline for comparison',
      'Not acting on evaluation data',
    ],
    successCriteria: [
      'All Kirkpatrick levels measured',
      'ROI demonstrated (if applicable)',
      'ESSA compliance documented',
      'Improvement actions planned',
    ],
    bookChapters: ['Chapter 15', 'ESSA Logic Model Document'],
    industryConsiderations: {
      healthcare: 'Connect to patient outcomes data',
      aerospace: 'Link to safety and efficiency metrics',
      manufacturing: 'Tie to quality and productivity data',
      general: 'Ensure evaluation plan was established in Step 1',
    },
  },
];

// ============================================================================
// SECTION 3: WIZARD NAVIGATION HELPERS
// ============================================================================

/**
 * Get the phase for a given step number
 *
 * @param stepNumber - The step number (1-17)
 * @returns The phase configuration
 */
export function getPhaseForStep(stepNumber: number): WizardPhase | undefined {
  return WIZARD_PHASES.find((phase) => phase.steps.includes(stepNumber));
}

/**
 * Get the next available step based on completed steps
 *
 * @param completedSteps - Array of completed step numbers
 * @returns The next step number, or undefined if all complete
 */
export function getNextStep(completedSteps: number[]): number | undefined {
  for (const step of WIZARD_STEPS) {
    if (!completedSteps.includes(step.stepNumber)) {
      // Check if prerequisites are met
      const prereqsMet = step.prerequisites.every((prereq) => completedSteps.includes(prereq));
      if (prereqsMet) {
        return step.stepNumber;
      }
    }
  }
  return undefined;
}

/**
 * Get all steps that can be started based on completed steps
 *
 * @param completedSteps - Array of completed step numbers
 * @returns Array of available step numbers
 */
export function getAvailableSteps(completedSteps: number[]): number[] {
  return WIZARD_STEPS.filter((step) => {
    if (completedSteps.includes(step.stepNumber)) return false;
    return step.prerequisites.every((prereq) => completedSteps.includes(prereq));
  }).map((step) => step.stepNumber);
}

/**
 * Calculate overall progress percentage
 *
 * @param completedSteps - Array of completed step numbers
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(completedSteps: number[]): number {
  const requiredSteps = WIZARD_STEPS.filter((step) => step.required).length;
  const completedRequired = completedSteps.filter(
    (stepNum) => WIZARD_STEPS.find((s) => s.stepNumber === stepNum)?.required,
  ).length;
  return Math.round((completedRequired / requiredSteps) * 100);
}

/**
 * Estimate total time remaining
 *
 * @param completedSteps - Array of completed step numbers
 * @param experienceLevel - User's experience level
 * @returns Estimated minutes remaining
 */
export function estimateTimeRemaining(
  completedSteps: number[],
  experienceLevel: ExperienceLevel,
): { min: number; max: number } {
  const remainingSteps = WIZARD_STEPS.filter(
    (step) => !completedSteps.includes(step.stepNumber) && step.required,
  );

  const totalMin = remainingSteps.reduce(
    (sum, step) => sum + step.timeByLevel[experienceLevel].min,
    0,
  );

  const totalMax = remainingSteps.reduce(
    (sum, step) => sum + step.timeByLevel[experienceLevel].max,
    0,
  );

  return { min: totalMin, max: totalMax };
}

/**
 * Get step by number
 *
 * @param stepNumber - The step number (1-17)
 * @returns The step configuration
 */
export function getStep(stepNumber: number): ExtendedWizardStep | undefined {
  return WIZARD_STEPS.find((step) => step.stepNumber === stepNumber);
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export WizardStepNumber from contentBlocks for convenience
export type { WizardStepNumber } from './contentBlocks';

// ============================================================================
// END OF WIZARD CONFIGURATION
// ============================================================================
