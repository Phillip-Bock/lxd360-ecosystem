'use client';

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Eye,
  Plus,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Mock case studies
const mockCaseStudies = [
  {
    id: 1,
    title: 'Sales Enablement Transformation',
    client: 'Fortune 500 Tech Company',
    status: 'published',
    thumbnail: null,
    competencies: ['ADDIE', 'Storyline 360', 'xAPI Analytics'],
    metrics: {
      completionRate: '+34%',
      timeToCompetency: '-45 days',
      satisfaction: '4.8/5',
    },
  },
  {
    id: 2,
    title: 'Compliance Microlearning Series',
    client: 'Healthcare Organization',
    status: 'draft',
    thumbnail: null,
    competencies: ['SAM', 'Rise 360', 'Accessibility'],
    metrics: {
      completionRate: '+52%',
      retentionScore: '+28%',
      satisfaction: '4.6/5',
    },
  },
  {
    id: 3,
    title: 'Leadership Development Program',
    client: 'Global Consulting Firm',
    status: 'published',
    thumbnail: null,
    competencies: ['Blended Learning', 'Video Production', 'Coaching'],
    metrics: {
      promotionRate: '+18%',
      engagementScore: '92%',
      nps: '+45',
    },
  },
];

const competencyOptions = [
  'ADDIE',
  'SAM',
  'Action Mapping',
  'Storyline 360',
  'Rise 360',
  'Captivate',
  'Camtasia',
  'xAPI Analytics',
  'SCORM',
  'Accessibility',
  'Video Production',
  'Gamification',
  'Simulation Design',
  'Coaching',
  'Facilitation',
  'LMS Administration',
  'Project Management',
  'Stakeholder Management',
];

export function PortfolioBuilder(): React.JSX.Element {
  const [caseStudies] = useState(mockCaseStudies);
  const [showNewCaseStudy, setShowNewCaseStudy] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio Builder</h1>
          <p className="text-muted-foreground">
            Showcase your work with case studies designed for LXD professionals
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Preview Site
          </Button>
          <Dialog open={showNewCaseStudy} onOpenChange={setShowNewCaseStudy}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Case Study
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Case Study</DialogTitle>
                <DialogDescription>
                  Document your project with a structured case study format
                </DialogDescription>
              </DialogHeader>
              <NewCaseStudyForm onClose={() => setShowNewCaseStudy(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="cases" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Case Studies
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-2">
            <Settings className="h-4 w-4" />
            Site Settings
          </TabsTrigger>
        </TabsList>

        {/* Case Studies Tab */}
        <TabsContent value="cases" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{caseStudies.length}</p>
                    <p className="text-sm text-muted-foreground">Case Studies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-brand-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">
                      {caseStudies.filter((c) => c.status === 'published').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">12</p>
                    <p className="text-sm text-muted-foreground">Competencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">342</p>
                    <p className="text-sm text-muted-foreground">Portfolio Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case Studies Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Card
                key={study.id}
                className="group cursor-pointer hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="aspect-16/10 bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-purple-500/10" />
                    <Briefcase className="h-10 w-10 text-muted-foreground relative z-10" />
                    <Badge
                      className="absolute top-3 right-3 z-10"
                      variant={study.status === 'published' ? 'default' : 'secondary'}
                    >
                      {study.status}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {study.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{study.client}</p>
                    </div>

                    {/* Competencies */}
                    <div className="flex flex-wrap gap-1">
                      {study.competencies.slice(0, 3).map((comp) => (
                        <Badge key={comp} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {study.competencies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{study.competencies.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      {Object.entries(study.metrics)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className="text-sm font-semibold text-primary">{value}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Card */}
            <Card
              className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => setShowNewCaseStudy(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Add Case Study</h3>
                <p className="text-sm text-muted-foreground">
                  Document another project to showcase your skills
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Site Settings Tab */}
        <TabsContent value="site" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Site</CardTitle>
                <CardDescription>Customize your public portfolio page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Portfolio URL</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="jordan-rivera" className="flex-1" />
                    <span className="flex items-center text-sm text-muted-foreground">
                      .lxdnexus.com
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    placeholder="Learning Experience Designer"
                    defaultValue="Learning Experience Designer | Corporate Training Specialist"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    rows={4}
                    placeholder="Tell visitors about yourself..."
                    defaultValue="Passionate about creating engaging learning experiences that drive real behavior change. 5+ years in corporate L&D with expertise in Articulate suite and xAPI analytics."
                  />
                </div>
                <Button className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme & Branding</CardTitle>
                <CardDescription>Customize the look of your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    {['#0d9488', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'].map((color) => (
                      <button
                        type="button"
                        key={color}
                        className="h-8 w-8 rounded-full border-2 border-transparent hover:border-foreground transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Layout Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors bg-primary/5 border-primary">
                      <div className="h-16 bg-muted rounded mb-2" />
                      <p className="text-sm font-medium text-center">Grid</p>
                    </div>
                    <div className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="space-y-1 mb-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded" />
                      </div>
                      <p className="text-sm font-medium text-center">List</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <ExternalLink className="h-4 w-4" />
                    View Live Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewCaseStudyForm({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [step, setStep] = useState(1);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);

  const toggleCompetency = (comp: string): void => {
    setSelectedCompetencies((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp],
    );
  };

  return (
    <div className="space-y-6 py-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Project Overview</h3>
          <div className="space-y-2">
            <Label>Project Title</Label>
            <Input placeholder="e.g., Sales Enablement Transformation" />
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label>Client / Organization</Label>
              <Input placeholder="e.g., Fortune 500 Tech Company" />
            </div>
            <div className="space-y-2">
              <Label>Your Role</Label>
              <Input placeholder="e.g., Lead Instructional Designer" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Brief Description</Label>
            <Textarea
              rows={3}
              placeholder="What was the project about? What problem did it solve?"
            />
          </div>
        </div>
      )}

      {/* Step 2: Before & After */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold">The Transformation Story</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-xs">
                  B
                </span>
                Before State
              </Label>
              <Textarea rows={4} placeholder="What was the situation before your intervention?" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                  A
                </span>
                After State
              </Label>
              <Textarea rows={4} placeholder="What changed as a result of your work?" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Key Metrics & Results</Label>
            <div className="grid gap-3 grid-cols-3">
              <Input placeholder="e.g., +34% completion" />
              <Input placeholder="e.g., -45 days to competency" />
              <Input placeholder="e.g., 4.8/5 satisfaction" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Competencies */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Competencies Demonstrated</h3>
          <p className="text-sm text-muted-foreground">
            Select all the skills and methodologies you applied in this project
          </p>
          <div className="flex flex-wrap gap-2">
            {competencyOptions.map((comp) => (
              <Badge
                key={comp}
                variant={selectedCompetencies.includes(comp) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCompetency(comp)}
              >
                {comp}
              </Badge>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t">
            <Label>Link to Live Project (optional)</Label>
            <Input placeholder="https://..." />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} className="gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onClose} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Create Case Study
          </Button>
        )}
      </div>
    </div>
  );
}
