/**
 * Variables System Types - Dynamic content personalization
 */

export type VariableType = 'text' | 'number' | 'boolean' | 'date' | 'list';

export interface Variable {
  id: string;
  name: string;
  key: string;
  type: VariableType;
  defaultValue: string | number | boolean | Date | string[];
  description?: string;
  category: 'system' | 'learner' | 'course' | 'custom';
  isReadOnly?: boolean;
}

export const SYSTEM_VARIABLES: Variable[] = [
  {
    id: 'sys-date',
    name: 'Current Date',
    key: 'system.date',
    type: 'date',
    defaultValue: new Date(),
    description: "Today's date",
    category: 'system',
    isReadOnly: true,
  },
  {
    id: 'sys-time',
    name: 'Current Time',
    key: 'system.time',
    type: 'text',
    defaultValue: '',
    description: 'Current time',
    category: 'system',
    isReadOnly: true,
  },
  {
    id: 'sys-slide',
    name: 'Current Slide',
    key: 'system.slide',
    type: 'number',
    defaultValue: 1,
    description: 'Current slide number',
    category: 'system',
    isReadOnly: true,
  },
  {
    id: 'sys-total-slides',
    name: 'Total Slides',
    key: 'system.totalSlides',
    type: 'number',
    defaultValue: 0,
    description: 'Total number of slides',
    category: 'system',
    isReadOnly: true,
  },
  {
    id: 'sys-progress',
    name: 'Progress',
    key: 'system.progress',
    type: 'number',
    defaultValue: 0,
    description: 'Course progress percentage',
    category: 'system',
    isReadOnly: true,
  },
];

export const LEARNER_VARIABLES: Variable[] = [
  {
    id: 'learner-name',
    name: 'Learner Name',
    key: 'learner.name',
    type: 'text',
    defaultValue: 'Learner',
    description: 'Full name of the learner',
    category: 'learner',
  },
  {
    id: 'learner-first-name',
    name: 'First Name',
    key: 'learner.firstName',
    type: 'text',
    defaultValue: 'Learner',
    description: 'First name of the learner',
    category: 'learner',
  },
  {
    id: 'learner-email',
    name: 'Email',
    key: 'learner.email',
    type: 'text',
    defaultValue: '',
    description: 'Email address',
    category: 'learner',
  },
  {
    id: 'learner-id',
    name: 'Learner ID',
    key: 'learner.id',
    type: 'text',
    defaultValue: '',
    description: 'Unique learner identifier',
    category: 'learner',
  },
  {
    id: 'learner-department',
    name: 'Department',
    key: 'learner.department',
    type: 'text',
    defaultValue: '',
    description: "Learner's department",
    category: 'learner',
  },
  {
    id: 'learner-role',
    name: 'Job Role',
    key: 'learner.role',
    type: 'text',
    defaultValue: '',
    description: 'Job title or role',
    category: 'learner',
  },
];

export const COURSE_VARIABLES: Variable[] = [
  {
    id: 'course-title',
    name: 'Course Title',
    key: 'course.title',
    type: 'text',
    defaultValue: 'Untitled Course',
    description: 'Name of the course',
    category: 'course',
  },
  {
    id: 'course-score',
    name: 'Course Score',
    key: 'course.score',
    type: 'number',
    defaultValue: 0,
    description: 'Current quiz/assessment score',
    category: 'course',
  },
  {
    id: 'course-attempts',
    name: 'Attempts',
    key: 'course.attempts',
    type: 'number',
    defaultValue: 0,
    description: 'Number of quiz attempts',
    category: 'course',
  },
  {
    id: 'course-passed',
    name: 'Passed',
    key: 'course.passed',
    type: 'boolean',
    defaultValue: false,
    description: 'Whether learner has passed',
    category: 'course',
  },
];

export const ALL_VARIABLES = [...SYSTEM_VARIABLES, ...LEARNER_VARIABLES, ...COURSE_VARIABLES];
