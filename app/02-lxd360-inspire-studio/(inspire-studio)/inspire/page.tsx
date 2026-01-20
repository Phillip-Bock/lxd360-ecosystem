'use client';

export const dynamic = 'force-dynamic';

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Lightbulb,
  Palette,
  Rocket,
  Search,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const inspirePhases = [
  {
    letter: 'I',
    title: 'Investigate',
    description: 'Understand your learners, stakeholders, and organizational context',
    icon: Search,
    color: 'text-brand-blue',
    bgColor: 'bg-brand-primary/10',
    activities: [
      'Conduct learner analysis',
      'Stakeholder interviews',
      'Needs assessment',
      'Review existing materials',
      'Define success metrics',
    ],
    deliverables: ['Learner Personas', 'Stakeholder Map', 'Needs Analysis Report'],
    tools: ['ITLA', 'ICES'],
  },
  {
    letter: 'N',
    title: 'Navigate',
    description: 'Chart the learning journey with clear objectives and pathways',
    icon: Target,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    activities: [
      'Define learning objectives',
      'Map competency frameworks',
      'Create learning paths',
      'Align with business goals',
      'Sequence content logically',
    ],
    deliverables: ['Learning Objectives', 'Competency Map', 'Course Outline'],
    tools: ['ICL', 'ICDT', 'IPMG', 'ICPF'],
  },
  {
    letter: 'S',
    title: 'Storyboard',
    description: 'Design engaging content with multimedia and interactive elements',
    icon: Palette,
    color: 'text-brand-purple',
    bgColor: 'bg-brand-secondary/10',
    activities: [
      'Create storyboards',
      'Design visual layouts',
      'Plan interactions',
      'Script narration',
      'Select media assets',
    ],
    deliverables: ['Storyboard Document', 'Asset List', 'Interaction Specifications'],
    tools: ['NPPM', 'ILMI'],
  },
  {
    letter: 'P',
    title: 'Produce',
    description: 'Build and develop the learning experience using authoring tools',
    icon: Rocket,
    color: 'text-orange-500',
    bgColor: 'bg-brand-warning/10',
    activities: [
      'Develop in authoring tool',
      'Create assessments',
      'Integrate multimedia',
      'Build interactions',
      'Implement accessibility',
    ],
    deliverables: ['Alpha Build', 'Assessment Bank', 'Media Library'],
    tools: ['IDNS', 'IADC'],
  },
  {
    letter: 'I',
    title: 'Implement',
    description: 'Deploy the course and prepare learners and facilitators',
    icon: Users,
    color: 'text-brand-success',
    bgColor: 'bg-brand-success/10',
    activities: [
      'LMS integration',
      'Pilot testing',
      'Facilitator training',
      'Learner onboarding',
      'Technical setup',
    ],
    deliverables: ['Deployed Course', 'Facilitator Guide', 'Learner Resources'],
    tools: ['ILEM'],
  },
  {
    letter: 'R',
    title: 'Refine',
    description: 'Gather feedback and iterate based on learner performance data',
    icon: BarChart3,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    activities: [
      'Collect feedback',
      'Analyze completion rates',
      'Review assessment data',
      'Identify improvements',
      'Update content',
    ],
    deliverables: ['Analytics Report', 'Improvement Plan', 'Updated Materials'],
    tools: ['IALM'],
  },
  {
    letter: 'E',
    title: 'Evaluate',
    description: 'Measure impact and demonstrate ROI to stakeholders',
    icon: Award,
    color: 'text-rose-500',
    bgColor: 'bg-brand-error/10',
    activities: [
      'Kirkpatrick evaluation',
      'ROI calculation',
      'Stakeholder reporting',
      'Success documentation',
      'Lessons learned',
    ],
    deliverables: ['Evaluation Report', 'ROI Analysis', 'Case Study'],
    tools: ['IALM'],
  },
];

export default function INSPIREFrameworkPage() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <main className="flex-1 overflow-auto p-6">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-linear-to-br from-purple-500 to-purple-700">
            <Lightbulb className="h-8 w-8 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">The INSPIRE Model</h1>
            <p className="text-muted-foreground">
              A Modern Framework for Learning Experience Design
            </p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">
          INSPIRE is a learner-centered instructional design framework that guides the creation of
          engaging, effective, and measurable learning experiences. Each phase builds upon the
          previous, ensuring a systematic approach to course development.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-brand-primary/10">
              <BookOpen className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-sm text-muted-foreground">Phases</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-teal-500/10">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">35+</p>
              <p className="text-sm text-muted-foreground">Activities</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-brand-secondary/10">
              <Clock className="h-5 w-5 text-brand-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">21</p>
              <p className="text-sm text-muted-foreground">Deliverables</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-brand-warning/10">
              <Sparkles className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">ILA Tools</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>INSPIRE Framework Phases</CardTitle>
          <CardDescription>
            Click on each phase to learn more about its activities and deliverables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Phase Letters */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2" />
            {inspirePhases.map((phase, index) => (
              <button
                type="button"
                key={phase.letter + index}
                onClick={() => setActivePhase(index)}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                  activePhase === index
                    ? 'bg-linear-to-br from-purple-500 to-purple-700 text-brand-primary scale-110 shadow-lg shadow-purple-500/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {phase.letter}
              </button>
            ))}
          </div>

          {/* Active Phase Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = inspirePhases[activePhase].icon;
                  return (
                    <div className={`p-3 rounded-xl ${inspirePhases[activePhase].bgColor}`}>
                      <Icon className={`h-6 w-6 ${inspirePhases[activePhase].color}`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-xl font-bold">
                    {inspirePhases[activePhase].letter} - {inspirePhases[activePhase].title}
                  </h3>
                  <p className="text-muted-foreground">{inspirePhases[activePhase].description}</p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Key Activities
              </h4>
              <ul className="space-y-2">
                {inspirePhases[activePhase].activities.map((activity, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Deliverables
              </h4>
              <div className="space-y-2 mb-6">
                {inspirePhases[activePhase].deliverables.map((deliverable, i) => (
                  <Badge key={i} variant="outline" className="mr-2 mb-2">
                    {deliverable}
                  </Badge>
                ))}
              </div>

              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                ILA Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {inspirePhases[activePhase].tools.map((tool) => (
                  <Link key={tool} href={`/inspire-studio/tools/${tool.toLowerCase()}`}>
                    <Badge className="bg-brand-secondary hover:bg-brand-secondary cursor-pointer">
                      {tool}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Additional Info */}
      <Tabs defaultValue="comparison" className="mb-8">
        <TabsList>
          <TabsTrigger value="comparison">vs Other Models</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="tools">12 ILA Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">vs ADDIE</h4>
                  <p className="text-muted-foreground text-sm">
                    INSPIRE adds explicit learner investigation, refinement loops, and ROI
                    evaluation phases missing from traditional ADDIE.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">vs SAM</h4>
                  <p className="text-muted-foreground text-sm">
                    While SAM focuses on rapid iteration, INSPIRE provides structured phases with
                    clear deliverables for larger projects.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">vs Action Mapping</h4>
                  <p className="text-muted-foreground text-sm">
                    INSPIRE incorporates Action Mapping principles in the Navigate phase while
                    providing a complete development lifecycle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Learner-centered approach from day one',
                  'Clear deliverables at each phase',
                  'Built-in quality checkpoints',
                  'Measurable outcomes and ROI tracking',
                  'Iterative refinement loops',
                  'Stakeholder alignment throughout',
                  'AI-enhanced workflows',
                  'Scalable for unknown project size',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/inspire-studio/tools/itla">
                  <div className="p-4 rounded-lg border hover:border-brand-primary transition-colors cursor-pointer">
                    <Target className="h-6 w-6 text-brand-blue mb-2" />
                    <h4 className="font-semibold">ITLA</h4>
                    <p className="text-sm text-muted-foreground">Target Learner Analysis</p>
                  </div>
                </Link>
                <Link href="/inspire-studio/tools/nppm">
                  <div className="p-4 rounded-lg border hover:border-brand-secondary transition-colors cursor-pointer">
                    <Users className="h-6 w-6 text-brand-purple mb-2" />
                    <h4 className="font-semibold">NPPM</h4>
                    <p className="text-sm text-muted-foreground">Neuro-Persona Profiling</p>
                  </div>
                </Link>
                <Link href="/inspire-studio/tools/icl">
                  <div className="p-4 rounded-lg border hover:border-teal-500 transition-colors cursor-pointer">
                    <BarChart3 className="h-6 w-6 text-teal-500 mb-2" />
                    <h4 className="font-semibold">ICL</h4>
                    <p className="text-sm text-muted-foreground">Competency Ladder</p>
                  </div>
                </Link>
                <Link href="/inspire-studio/tools">
                  <div className="p-4 rounded-lg border hover:border-orange-500 transition-colors cursor-pointer bg-muted/50">
                    <Sparkles className="h-6 w-6 text-orange-500 mb-2" />
                    <h4 className="font-semibold">View All 12 Tools</h4>
                    <p className="text-sm text-muted-foreground">Complete ILA toolkit</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CTA */}
      <Card className="bg-linear-to-r from-purple-500/10 to-orange-500/10">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to Start Creating?</h3>
            <p className="text-muted-foreground">
              Use the INSPIRE model to build your next learning experience
            </p>
          </div>
          <Link href="/inspire-studio/tools">
            <Button className="bg-brand-secondary hover:bg-brand-secondary-hover text-brand-primary">
              Open ILA Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
