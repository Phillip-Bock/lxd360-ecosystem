import type { LucideIcon } from 'lucide-react';

export interface AssessmentType {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  purpose: string;
  examples: string;
  wizardContext: string;
  steps: string[];
}

export interface FormData {
  [key: string]: string | undefined;
  situation?: string;
  challenge?: string;
  decisions?: string;
  question?: string;
  correctAnswer?: string;
  distractors?: string;
  rubric_ExceedsExpectations?: string;
  rubric_MeetsExpectations?: string;
  rubric_NeedsImprovement?: string;
}

export interface StatItem {
  target: number;
  label: string;
}
