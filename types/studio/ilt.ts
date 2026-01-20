// =============================================================================
// SESSION TYPES
// =============================================================================

/**
 * Training delivery mode
 */
export type DeliveryMode = 'in-person' | 'virtual' | 'hybrid';

/**
 * Session activity type
 */
export type ActivityType =
  | 'presentation'
  | 'discussion'
  | 'exercise'
  | 'breakout'
  | 'demo'
  | 'assessment'
  | 'break'
  | 'icebreaker'
  | 'debrief'
  | 'q-and-a'
  | 'role-play'
  | 'case-study'
  | 'hands-on-lab'
  | 'video'
  | 'reading'
  | 'reflection';

/**
 * Interaction level for activities
 */
export type InteractionLevel = 'passive' | 'moderate' | 'active' | 'highly-active';

/**
 * ILT/vILT Session configuration
 */
export interface ILTSession {
  id: string;
  title: string;
  description?: string;
  deliveryMode: DeliveryMode;

  // Timing
  duration: number; // minutes
  scheduledDate?: string;
  scheduledTime?: string;
  timezone?: string;

  // Participants
  minParticipants?: number;
  maxParticipants?: number;
  targetAudience?: string;
  prerequisites?: string[];

  // Content
  learningObjectives: string[];
  agenda: SessionAgendaItem[];
  materials: SessionMaterial[];

  // Facilitator
  facilitatorNotes?: string;
  facilitatorGuide?: FacilitatorGuide;

  // Virtual settings (for vILT)
  virtualSettings?: VirtualSessionSettings;

  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
  status: 'draft' | 'ready' | 'in-progress' | 'completed' | 'archived';
}

/**
 * Session agenda item
 */
export interface SessionAgendaItem {
  id: string;
  title: string;
  description?: string;
  activityType: ActivityType;
  duration: number; // minutes
  startTime?: string; // Calculated from session start
  interactionLevel: InteractionLevel;

  // Content linkage
  linkedLessonId?: string;
  linkedSlideIds?: string[];

  // Facilitator instructions
  facilitatorInstructions?: string;
  talkingPoints?: string[];
  transitionNotes?: string;

  // Materials needed for this activity
  requiredMaterials?: string[];

  // Virtual-specific
  virtualTools?: VirtualTool[];
  breakoutConfig?: BreakoutConfig;

  // Assessment
  assessmentConfig?: ActivityAssessment;
}

/**
 * Virtual session settings
 */
export interface VirtualSessionSettings {
  platform: 'zoom' | 'teams' | 'webex' | 'google-meet' | 'other';
  platformUrl?: string;
  meetingId?: string;
  passcode?: string;

  // Features
  enableRecording?: boolean;
  enableChat?: boolean;
  enablePolls?: boolean;
  enableBreakoutRooms?: boolean;
  enableWhiteboard?: boolean;
  enableScreenShare?: boolean;

  // Technical requirements
  bandwidthRequirements?: 'low' | 'medium' | 'high';
  browserRequirements?: string[];
  softwareRequirements?: string[];

  // Backup plan
  backupPlatform?: string;
  technicalSupportContact?: string;
}

/**
 * Virtual tool configuration
 */
export interface VirtualTool {
  type:
    | 'poll'
    | 'whiteboard'
    | 'breakout'
    | 'chat'
    | 'annotation'
    | 'screen-share'
    | 'video-share'
    | 'quiz';
  name: string;
  instructions?: string;
  setupNotes?: string;
}

/**
 * Breakout room configuration
 */
export interface BreakoutConfig {
  numberOfRooms: number;
  assignmentMethod: 'auto' | 'manual' | 'self-select';
  duration: number; // minutes
  groupSize?: number;
  activityInstructions: string;
  debriefQuestions?: string[];
  reportBackFormat?: 'verbal' | 'written' | 'presentation' | 'shared-document';
}

/**
 * Activity assessment configuration
 */
export interface ActivityAssessment {
  type: 'formative' | 'summative' | 'self-assessment' | 'peer-assessment';
  method: 'observation' | 'quiz' | 'discussion' | 'demonstration' | 'submission';
  criteria?: string[];
  rubric?: AssessmentRubric;
}

/**
 * Assessment rubric
 */
export interface AssessmentRubric {
  name: string;
  criteria: RubricCriterion[];
  totalPoints: number;
}

/**
 * Rubric criterion
 */
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  levels: RubricLevel[];
  weight: number;
}

/**
 * Rubric level
 */
export interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

// =============================================================================
// MATERIALS
// =============================================================================

/**
 * Session material
 */
export interface SessionMaterial {
  id: string;
  name: string;
  type: MaterialType;
  description?: string;
  quantity?: number;
  url?: string;
  filePath?: string;
  printable?: boolean;
  digitalOnly?: boolean;
  requiredFor?: string[]; // Activity IDs
  preparationNotes?: string;
  distributionTime?: 'pre-session' | 'during' | 'post-session';
}

/**
 * Material type
 */
export type MaterialType =
  | 'handout'
  | 'worksheet'
  | 'slides'
  | 'video'
  | 'audio'
  | 'exercise-file'
  | 'reference-guide'
  | 'job-aid'
  | 'assessment'
  | 'certificate'
  | 'prop'
  | 'equipment'
  | 'software'
  | 'supplies'
  | 'other';

/**
 * Materials checklist
 */
export interface MaterialsChecklist {
  sessionId: string;
  items: MaterialChecklistItem[];
  lastUpdated: string;
  completedBy?: string;
}

/**
 * Materials checklist item
 */
export interface MaterialChecklistItem {
  materialId: string;
  materialName: string;
  status: 'not-started' | 'in-progress' | 'ready' | 'distributed';
  notes?: string;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
}

// =============================================================================
// FACILITATOR GUIDE
// =============================================================================

/**
 * Facilitator guide document
 */
export interface FacilitatorGuide {
  sessionId: string;
  version: string;
  generatedAt: string;

  // Overview section
  overview: {
    title: string;
    description: string;
    duration: number;
    deliveryMode: DeliveryMode;
    targetAudience: string;
    prerequisites: string[];
    learningObjectives: string[];
  };

  // Preparation section
  preparation: {
    advancePreparation: PreparationTask[];
    dayOfPreparation: PreparationTask[];
    roomSetup?: RoomSetup;
    technicalSetup?: TechnicalSetup;
    materialsChecklist: string[];
  };

  // Detailed agenda with timing
  detailedAgenda: AgendaSection[];

  // Appendices
  appendices: {
    assessmentKeys?: AssessmentKey[];
    additionalResources?: Resource[];
    troubleshootingGuide?: TroubleshootingItem[];
    participantRoster?: boolean;
    feedbackForm?: boolean;
  };
}

/**
 * Preparation task
 */
export interface PreparationTask {
  task: string;
  timing: string;
  completed?: boolean;
  notes?: string;
}

/**
 * Room setup instructions
 */
export interface RoomSetup {
  layoutType: 'theater' | 'classroom' | 'u-shape' | 'rounds' | 'boardroom' | 'pods';
  seatingCapacity: number;
  equipmentNeeded: string[];
  specialRequirements?: string[];
  diagram?: string; // URL to diagram image
}

/**
 * Technical setup instructions
 */
export interface TechnicalSetup {
  platform?: string;
  testingInstructions: string[];
  backupPlan: string;
  technicalRequirements: string[];
  supportContact?: string;
}

/**
 * Detailed agenda section for facilitator guide
 */
export interface AgendaSection {
  id: string;
  title: string;
  timeAllocation: string; // e.g., "9:00 AM - 9:15 AM"
  duration: number;
  activityType: ActivityType;

  // Facilitator content
  purpose: string;
  facilitatorActions: string[];
  participantActions: string[];
  keyMessages: string[];
  discussionQuestions?: string[];
  transitionStatement?: string;

  // Visual aids
  slideNumbers?: string;
  mediaToPlay?: string[];

  // Interaction
  interactionNotes?: string;
  energyLevel: 'low' | 'medium' | 'high';

  // Timing cues
  timingCues?: TimingCue[];

  // Contingency
  ifTimePermits?: string;
  ifRunningShort?: string;
}

/**
 * Timing cue for facilitator
 */
export interface TimingCue {
  atMinute: number;
  action: string;
}

/**
 * Assessment answer key
 */
export interface AssessmentKey {
  activityId: string;
  activityName: string;
  answers: AssessmentAnswer[];
}

/**
 * Assessment answer
 */
export interface AssessmentAnswer {
  question: string;
  correctAnswer: string;
  explanation?: string;
  commonMistakes?: string[];
}

/**
 * Additional resource
 */
export interface Resource {
  title: string;
  type: 'article' | 'video' | 'book' | 'website' | 'tool' | 'template';
  url?: string;
  description?: string;
}

/**
 * Troubleshooting item
 */
export interface TroubleshootingItem {
  issue: string;
  symptoms: string[];
  solutions: string[];
  escalationPath?: string;
}

// =============================================================================
// GENERATOR OPTIONS
// =============================================================================

/**
 * Options for ILT session generation
 */
export interface ILTGeneratorOptions {
  /** Source lesson ID to generate from */
  sourceLessonId: string;

  /** Target delivery mode */
  deliveryMode: DeliveryMode;

  /** Total session duration in minutes */
  totalDuration: number;

  /** Include breaks */
  includeBreaks: boolean;

  /** Break frequency (minutes between breaks) */
  breakFrequency?: number;

  /** Break duration (minutes) */
  breakDuration?: number;

  /** Include icebreaker */
  includeIcebreaker: boolean;

  /** Include wrap-up/debrief */
  includeDebrief: boolean;

  /** Activity mix preference */
  activityMix: 'presentation-heavy' | 'balanced' | 'activity-heavy';

  /** Group activities preference */
  groupActivities: 'none' | 'some' | 'many';

  /** Assessment integration */
  assessmentIntegration: 'none' | 'formative' | 'summative' | 'both';

  /** Virtual tools to enable (for vILT) */
  virtualTools?: VirtualTool['type'][];

  /** Generate facilitator guide */
  generateFacilitatorGuide: boolean;

  /** Generate materials list */
  generateMaterialsList: boolean;
}

/**
 * ILT generation result
 */
export interface ILTGenerationResult {
  success: boolean;
  session?: ILTSession;
  facilitatorGuide?: FacilitatorGuide;
  materialsList?: SessionMaterial[];
  warnings?: string[];
  errors?: string[];
}

// =============================================================================
// TEMPLATES
// =============================================================================

/**
 * Session template
 */
export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  deliveryMode: DeliveryMode;
  durationRange: { min: number; max: number };
  agendaTemplate: AgendaTemplateItem[];
  suggestedMaterials: MaterialType[];
  tags: string[];
}

/**
 * Agenda template item
 */
export interface AgendaTemplateItem {
  activityType: ActivityType;
  title: string;
  durationPercentage: number; // Percentage of total time
  description: string;
  isOptional: boolean;
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

/**
 * Export format for ILT materials
 */
export type ILTExportFormat =
  | 'pdf-guide'
  | 'pptx-slides'
  | 'docx-guide'
  | 'xlsx-materials'
  | 'zip-bundle';

/**
 * Export options
 */
export interface ILTExportOptions {
  format: ILTExportFormat;
  includeSlides?: boolean;
  includeFacilitatorGuide?: boolean;
  includeMaterialsChecklist?: boolean;
  includeParticipantMaterials?: boolean;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
  };
}
