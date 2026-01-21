'use client';

export const dynamic = 'force-dynamic';

import { Plus, Rocket } from 'lucide-react';
import { useMissionControl } from '@/components/inspire-studio/mission-control';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMissionStore } from '@/store/inspire';

// ============================================================================
// INDUSTRIES
// ============================================================================

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare & Life Sciences' },
  { value: 'aerospace', label: 'Aerospace & Defense' },
  { value: 'manufacturing', label: 'Manufacturing & Industrial' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'technology', label: 'Technology & Software' },
  { value: 'retail', label: 'Retail & Consumer' },
  { value: 'education', label: 'Education & Training' },
  { value: 'government', label: 'Government & Public Sector' },
  { value: 'other', label: 'Other' },
] as const;

const COURSE_TYPES = [
  { value: 'compliance', label: 'Compliance Training' },
  { value: 'onboarding', label: 'Onboarding & Orientation' },
  { value: 'skills', label: 'Skills Development' },
  { value: 'leadership', label: 'Leadership & Management' },
  { value: 'technical', label: 'Technical Training' },
  { value: 'safety', label: 'Safety & Security' },
  { value: 'sales', label: 'Sales & Customer Service' },
  { value: 'product', label: 'Product Training' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * INSPIRE Course Builder - Main Entry Page
 *
 * This is the starting point for creating a new INSPIRE course.
 * If no mission is loaded, shows the new mission form.
 * If a mission exists, shows the current step content.
 */
export default function InspireCourseBuilderPage() {
  const manifest = useMissionStore((state) => state.manifest);
  const createMission = useMissionStore((state) => state.createMission);
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const { wizardHintsVisible } = useMissionControl();

  // If no mission, show creation form
  if (!manifest) {
    return <NewMissionForm onCreateMission={createMission} />;
  }

  // Otherwise, show current step content
  // This would be replaced with actual step components in Phase 3+
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {getStepTitle(currentPhase, currentStep)}
          </CardTitle>
          <CardDescription>{getStepDescription(currentPhase, currentStep)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-lxd-dark-hover rounded-lg p-8 text-center">
            <Rocket className="h-12 w-12 mx-auto text-lxd-purple/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming in Phase 3</h3>
            <p className="text-muted-foreground">
              Step components for {currentPhase} phase are being built.
            </p>

            {wizardHintsVisible && (
              <div className="mt-4 text-sm text-muted-foreground bg-lxd-dark-surface p-4 rounded-md">
                <p className="font-medium mb-2">This step will include:</p>
                <ul className="list-disc list-inside text-left">
                  {getStepFeatures(currentPhase, currentStep).map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// NEW MISSION FORM
// ============================================================================

interface NewMissionFormProps {
  onCreateMission: (metadata: {
    title?: string;
    description?: string;
    industry?: string;
    courseType?: string;
  }) => void;
}

function NewMissionForm({ onCreateMission }: NewMissionFormProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Start a New INSPIRE Course</CardTitle>
          <CardDescription>
            Begin your learning design journey with the INSPIRE methodology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onCreateMission({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                industry: formData.get('industry') as string,
                courseType: formData.get('courseType') as string,
              });
            }}
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Advanced Safety Procedures Training"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the learning goals..."
                rows={3}
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select name="industry" required>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Type */}
            <div className="space-y-2">
              <Label htmlFor="courseType">Course Type</Label>
              <Select name="courseType">
                <SelectTrigger id="courseType">
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Course
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getStepTitle(phase: string, step: number): string {
  const titles: Record<string, string[]> = {
    encoding: [
      'Research & Industry Analysis',
      'Learner Persona Generator',
      'Activation Strategy (ITLA)',
      'Modality Integrator (ILMI)',
      'Engagement Spectrum (ICES)',
    ],
    synthesization: [
      'Performance Mapping (IPMG)',
      'Cognitive Demand (ICDT)',
      'Capability Progression (ICPF)',
      'Competency Ladder (ICL)',
    ],
    assimilation: [
      'Adaptive Design Cycle (IADC)',
      'Learning Experience Matrix (ILEM)',
      'Adaptive Measurement (IALM)',
      'Deployment & Launch',
    ],
    audit: ['Cognitive UX & WCAG Review', 'Final Publish'],
  };

  return titles[phase]?.[step - 1] ?? `Step ${step}`;
}

function getStepDescription(phase: string, step: number): string {
  const descriptions: Record<string, string[]> = {
    encoding: [
      'Analyze the industry context and identify performance gaps that training can address.',
      'Create detailed learner personas to understand your target audience.',
      'Select neuroscience-based activation strategies for optimal learning.',
      'Choose the right modalities and media formats for your content.',
      'Define the engagement level and cognitive demand for your learning.',
    ],
    synthesization: [
      'Map business performance requirements to learning objectives.',
      "Tag content with cognitive complexity using Bloom's taxonomy.",
      'Define the proficiency progression from novice to expert.',
      'Build the competency ladder that guides your course structure.',
    ],
    assimilation: [
      'Configure the adaptive design cycle for your course.',
      'Build content blocks on the Learning Experience Matrix canvas.',
      'Set up adaptive measurement and analytics.',
      'Prepare for deployment and launch.',
    ],
    audit: [
      'Review cognitive UX and WCAG accessibility compliance.',
      'Final review and publish your course.',
    ],
  };

  return descriptions[phase]?.[step - 1] ?? '';
}

function getStepFeatures(phase: string, step: number): string[] {
  const features: Record<string, string[][]> = {
    encoding: [
      [
        'Industry selector dropdown',
        'Performance gap editor',
        'AI Research Injector',
        'CSV bulk upload',
      ],
      [
        'Archetype selector (Entry-Level to Executive)',
        'Motivation sliders',
        'Digital fluency toggle',
        'Persona library templates',
      ],
      [
        'Neuroscience principle cards (drag-drop)',
        'Dopamine intensity slider',
        'Working memory guard (3-5 concepts)',
        'Auto-neuro match AI',
      ],
      [
        'Sensory mixer grid',
        'Dual coding validator',
        'Interaction search catalog',
        'Modality balance wheel',
      ],
      [
        '6-level engagement ladder',
        'Working memory indicator',
        'Engagement-modality check',
        'Stress intensity slider',
      ],
    ],
    synthesization: [
      ['Performance mapping matrix', 'Objective alignment', 'Gap-to-objective linking'],
      ["Bloom's taxonomy tagger", 'Cognitive complexity meter', 'Prerequisite mapping'],
      ['Proficiency level selector', 'Capability progression chart', 'Milestone definitions'],
      ['Competency rung builder', 'Objective hierarchy', 'Assessment criteria'],
    ],
    assimilation: [
      ['Adaptive path configuration', 'Branching logic setup', 'Condition builder'],
      ['Canvas block editor', 'Drag-drop content blocks', 'xAPI instrumentation'],
      ['Analytics dashboard', 'Measurement configuration', 'Reporting setup'],
      ['Export configuration', 'LMS integration', 'Launch checklist'],
    ],
    audit: [
      ['Cognitive UX checklist', 'WCAG validator', 'UDL compliance check'],
      ['Final review summary', 'Publish controls', 'Version management'],
    ],
  };

  return features[phase]?.[step - 1] ?? [];
}
