'use client';

import type {
  DigitalFluency,
  LearnerArchetype,
  LearnerPersona,
  PriorKnowledgeLevel,
} from '@/schemas/inspire';

// ============================================================================
// LOCAL UI TYPES
// ============================================================================

/**
 * Form data for creating/editing a persona (without system fields)
 */
export interface PersonaFormData {
  name: string;
  archetype: LearnerArchetype;
  jobTitle: string;
  yearsExperience: number;
  priorKnowledge: PriorKnowledgeLevel;
  digitalFluency: DigitalFluency;
  internalMotivation: number;
  externalMotivation: number;
  learningGoals: string[];
  painPoints: string[];
  accessibilityNeeds: string[];
  availableTimePerWeek: number;
  preferredLearningTimes: string[];
  location: string;
  primaryLanguage: string;
}

/**
 * Archetype option for selector
 */
export interface ArchetypeOption {
  id: LearnerArchetype;
  name: string;
  description: string;
  icon: string;
  defaultTraits: Partial<PersonaFormData>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ARCHETYPE_CATALOG: ArchetypeOption[] = [
  {
    id: 'entry-level',
    name: 'Entry-Level Employee',
    description: 'New hires or junior staff with limited experience',
    icon: 'user-plus',
    defaultTraits: {
      yearsExperience: 1,
      priorKnowledge: 'basic',
      digitalFluency: 'medium',
      internalMotivation: 7,
      externalMotivation: 8,
    },
  },
  {
    id: 'individual-contributor',
    name: 'Individual Contributor',
    description: 'Experienced professional without direct reports',
    icon: 'user',
    defaultTraits: {
      yearsExperience: 5,
      priorKnowledge: 'intermediate',
      digitalFluency: 'high',
      internalMotivation: 6,
      externalMotivation: 6,
    },
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team lead or first-line manager with direct reports',
    icon: 'users',
    defaultTraits: {
      yearsExperience: 8,
      priorKnowledge: 'intermediate',
      digitalFluency: 'high',
      internalMotivation: 7,
      externalMotivation: 7,
    },
  },
  {
    id: 'director',
    name: 'Director',
    description: 'Senior leader managing multiple teams or departments',
    icon: 'building-2',
    defaultTraits: {
      yearsExperience: 12,
      priorKnowledge: 'advanced',
      digitalFluency: 'high',
      internalMotivation: 8,
      externalMotivation: 5,
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'C-suite or VP-level strategic decision maker',
    icon: 'crown',
    defaultTraits: {
      yearsExperience: 15,
      priorKnowledge: 'advanced',
      digitalFluency: 'medium',
      internalMotivation: 9,
      externalMotivation: 4,
      availableTimePerWeek: 2,
    },
  },
  {
    id: 'specialist',
    name: 'Subject Matter Expert',
    description: 'Deep expertise in a specific domain or technical area',
    icon: 'microscope',
    defaultTraits: {
      yearsExperience: 10,
      priorKnowledge: 'expert',
      digitalFluency: 'high',
      internalMotivation: 8,
      externalMotivation: 5,
    },
  },
  {
    id: 'contractor',
    name: 'Contractor / Vendor',
    description: 'External workforce requiring specific certifications',
    icon: 'briefcase',
    defaultTraits: {
      yearsExperience: 5,
      priorKnowledge: 'intermediate',
      digitalFluency: 'medium',
      internalMotivation: 5,
      externalMotivation: 9,
    },
  },
  {
    id: 'other',
    name: 'Custom Persona',
    description: 'Define a unique learner profile for your needs',
    icon: 'sparkles',
    defaultTraits: {
      yearsExperience: 3,
      priorKnowledge: 'basic',
      digitalFluency: 'medium',
      internalMotivation: 5,
      externalMotivation: 5,
    },
  },
];

export const PRIOR_KNOWLEDGE_OPTIONS: {
  value: PriorKnowledgeLevel;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No prior exposure to the subject' },
  {
    value: 'awareness',
    label: 'Awareness',
    description: 'Heard of the topic but no practical knowledge',
  },
  { value: 'basic', label: 'Basic', description: 'Fundamental understanding, needs guidance' },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Can work independently on standard tasks',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Handles complex scenarios, mentors others',
  },
  {
    value: 'expert',
    label: 'Expert',
    description: 'Industry-recognized expertise, creates standards',
  },
];

export const DIGITAL_FLUENCY_OPTIONS: {
  value: DigitalFluency;
  label: string;
  description: string;
}[] = [
  { value: 'low', label: 'Low', description: 'Needs significant support with digital tools' },
  { value: 'medium', label: 'Medium', description: 'Comfortable with common applications' },
  { value: 'high', label: 'High', description: 'Quickly adapts to new technology' },
];

export const LEARNING_TIME_OPTIONS = [
  'Early Morning (6-9 AM)',
  'Morning (9 AM-12 PM)',
  'Lunch Break',
  'Afternoon (12-5 PM)',
  'Evening (5-8 PM)',
  'Night (8 PM+)',
  'Weekends Only',
  'During Commute',
];

export const ACCESSIBILITY_NEEDS_OPTIONS = [
  'Screen Reader Compatible',
  'High Contrast Mode',
  'Keyboard Navigation Only',
  'Closed Captions Required',
  'Audio Descriptions',
  'Reduced Motion',
  'Large Text',
  'Color Blind Friendly',
  'Simple Language',
  'Extended Time Limits',
];

export const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for a new persona
 */
export function generatePersonaId(): string {
  return crypto.randomUUID();
}

/**
 * Create default form data for a new persona
 */
export function getDefaultPersonaFormData(): PersonaFormData {
  return {
    name: '',
    archetype: 'individual-contributor',
    jobTitle: '',
    yearsExperience: 3,
    priorKnowledge: 'basic',
    digitalFluency: 'medium',
    internalMotivation: 5,
    externalMotivation: 5,
    learningGoals: [],
    painPoints: [],
    accessibilityNeeds: [],
    availableTimePerWeek: 4,
    preferredLearningTimes: [],
    location: '',
    primaryLanguage: 'en',
  };
}

/**
 * Convert form data to schema persona
 */
export function toSchemaPersona(formData: PersonaFormData, id?: string): LearnerPersona {
  return {
    id: id ?? generatePersonaId(),
    name: formData.name,
    archetype: formData.archetype,
    jobTitle: formData.jobTitle || undefined,
    yearsExperience: formData.yearsExperience || undefined,
    priorKnowledge: formData.priorKnowledge,
    digitalFluency: formData.digitalFluency,
    internalMotivation: formData.internalMotivation,
    externalMotivation: formData.externalMotivation,
    learningGoals: formData.learningGoals,
    painPoints: formData.painPoints,
    accessibilityNeeds: formData.accessibilityNeeds,
    availableTimePerWeek: formData.availableTimePerWeek || undefined,
    preferredLearningTimes: formData.preferredLearningTimes,
    location: formData.location || undefined,
    primaryLanguage: formData.primaryLanguage,
    source: 'manual',
  };
}

/**
 * Convert schema persona to form data
 */
export function fromSchemaPersona(persona: LearnerPersona): PersonaFormData {
  return {
    name: persona.name,
    archetype: persona.archetype,
    jobTitle: persona.jobTitle ?? '',
    yearsExperience: persona.yearsExperience ?? 0,
    priorKnowledge: persona.priorKnowledge,
    digitalFluency: persona.digitalFluency,
    internalMotivation: persona.internalMotivation,
    externalMotivation: persona.externalMotivation,
    learningGoals: persona.learningGoals,
    painPoints: persona.painPoints,
    accessibilityNeeds: persona.accessibilityNeeds,
    availableTimePerWeek: persona.availableTimePerWeek ?? 4,
    preferredLearningTimes: persona.preferredLearningTimes,
    location: persona.location ?? '',
    primaryLanguage: persona.primaryLanguage,
  };
}

/**
 * Get motivation label based on value
 */
export function getMotivationLabel(value: number): string {
  if (value <= 2) return 'Very Low';
  if (value <= 4) return 'Low';
  if (value <= 6) return 'Moderate';
  if (value <= 8) return 'High';
  return 'Very High';
}
