import {
  Activity,
  Award,
  BarChart2,
  Gavel,
  Layers,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import type { AssessmentType } from './types';

export const ASSESSMENT_TYPES: AssessmentType[] = [
  {
    id: 'diagnostic',
    title: 'Diagnostic',
    icon: Stethoscope,
    color: 'text-lxd-success',
    bgColor: 'bg-lxd-success/10',
    purpose: 'Identify existing knowledge & misconceptions before starting.',
    examples: 'Pre-tests, self-assessments, initial polls.',
    wizardContext:
      "Diagnostic assessments should be low-stakes (ungraded). The goal is to inform the instructor/learner of gaps, not to penalize. Focus on 'Gateway Concepts'.",
    steps: ['Target Knowledge', 'Misconception Check', 'Pre-Test Questions'],
  },
  {
    id: 'formative',
    title: 'Formative',
    icon: Activity,
    color: 'text-lxd-blue',
    bgColor: 'bg-lxd-blue/10',
    purpose: 'Monitor learning & provide ongoing feedback during the course.',
    examples: 'Quizzes, one-minute papers, group work.',
    wizardContext:
      "Formative assessments are 'Checkpoints'. Feedback must be immediate and corrective. If they get it wrong, tell them WHY immediately.",
    steps: ['Learning Gap', 'Feedback Strategy', 'Activity Design'],
  },
  {
    id: 'summative',
    title: 'Summative',
    icon: Award,
    color: 'text-lxd-purple',
    bgColor: 'bg-lxd-purple/10',
    purpose: 'Evaluate mastery at the end of a course/module.',
    examples: 'Final exams, final projects, certification tests.',
    wizardContext:
      'Summative assessments require strict validity. Ensure your questions map 1:1 with your Learning Objectives. Security and fairness are paramount here.',
    steps: ['Blueprint Alignment', 'Security/Integrity', 'Exam Questions'],
  },
  {
    id: 'interim',
    title: 'Interim / Benchmark',
    icon: BarChart2,
    color: 'text-lxd-warning',
    bgColor: 'bg-lxd-warning/10',
    purpose: 'Check progress periodically over a longer program.',
    examples: 'Mid-term exams, quarterly reviews.',
    wizardContext:
      'Interim assessments predict Summative success. Use them to pivot instruction if the cohort is falling behind.',
    steps: ['Progress Metrics', 'Pacing Check', 'Questions'],
  },
  {
    id: 'criterion',
    title: 'Criterion-Referenced',
    icon: Gavel,
    color: 'text-lxd-text-light-secondary',
    bgColor: 'bg-lxd-dark-surface/30',
    purpose: 'Measure against a fixed standard (not other students).',
    examples: 'Competency checklists, rubrics.',
    wizardContext:
      "Absolute standards apply here. 'Cut scores' must be defensible. Avoid 'grading on a curve'.",
    steps: ['Define Standards', 'Create Rubric', 'Pass/Fail Logic'],
  },
  {
    id: 'norm',
    title: 'Norm-Referenced',
    icon: Users,
    color: 'text-lxd-purple-dark',
    bgColor: 'bg-lxd-purple-dark/10',
    purpose: 'Compare performance to a larger group.',
    examples: 'Percentile rankings, competitive placement.',
    wizardContext:
      'Use this only when you need to rank learners (e.g., selecting top 10% for a leadership program). Can demotivate lower performers.',
    steps: ['Comparison Group', 'Ranking Criteria', 'Test Items'],
  },
  {
    id: 'scenario',
    title: 'Scenario-Based',
    icon: Layers,
    color: 'text-lxd-success',
    bgColor: 'bg-lxd-success/10',
    purpose: 'Apply knowledge to solve realistic problems.',
    examples: 'Simulations, branching scenarios, case studies.',
    wizardContext:
      "Context is king. The learner should feel 'in the role'. Focus on decisions and consequences, not just facts.",
    steps: ['The Situation', 'The Challenge', 'Branching Options'],
  },
  {
    id: 'self',
    title: 'Self-Assessment',
    icon: UserCheck,
    color: 'text-lxd-purple',
    bgColor: 'bg-lxd-purple/10',
    purpose: 'Promote self-awareness and responsibility.',
    examples: 'Confidence logs, reflection journals.',
    wizardContext:
      "Metacognition tool. Ask learners 'How sure are you?' alongside the answer. Helps them identify the 'Illusion of Competence'.",
    steps: ['Reflection Prompts', 'Confidence Scale', 'Action Plan'],
  },
  {
    id: 'peer',
    title: 'Peer Assessment',
    icon: Users,
    color: 'text-lxd-blue-light',
    bgColor: 'bg-lxd-blue-light/10',
    purpose: 'Learners provide feedback to each other.',
    examples: 'Code reviews, design critiques, essay swaps.',
    wizardContext:
      'Requires a strong rubric. Novices cannot grade novices without clear criteria. Anonymity is often helpful.',
    steps: ['Review Rubric', 'Anonymity Rules', 'Feedback Structure'],
  },
];
