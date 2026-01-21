'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Code,
  Database,
  Eye,
  FileCode,
  Layers,
  Maximize2,
  MessageSquare,
  Pause,
  Pin,
  Play,
  RefreshCw,
  Send,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Mock data for uploaded projects
const mockProjects = [
  {
    id: 1,
    name: 'Onboarding Module v2',
    type: 'Storyline 360',
    format: 'SCORM 1.2',
    uploadedAt: '2 days ago',
    status: 'ready',
    annotations: 5,
  },
  {
    id: 2,
    name: 'Compliance Training',
    type: 'Rise 360',
    format: 'xAPI',
    uploadedAt: '1 week ago',
    status: 'reviewed',
    annotations: 12,
  },
  {
    id: 3,
    name: 'Leadership Sim',
    type: 'Captivate',
    format: 'HTML5',
    uploadedAt: '2 weeks ago',
    status: 'ready',
    annotations: 0,
  },
];

// Mock annotations
const mockAnnotations = [
  {
    id: 1,
    author: 'Dr. Sarah Chen',
    timestamp: '0:45',
    slide: 3,
    type: 'timing',
    content: 'This animation is out of sync with the narration. Consider adding a 0.5s delay.',
    resolved: false,
  },
  {
    id: 2,
    author: 'Dr. Sarah Chen',
    timestamp: '1:23',
    slide: 5,
    type: 'accessibility',
    content:
      'The contrast on this button fails WCAG AA standards. Needs darker text or lighter background.',
    resolved: true,
  },
  {
    id: 3,
    author: 'Dr. Sarah Chen',
    timestamp: '2:10',
    slide: 7,
    type: 'interaction',
    content: "Great use of branching here! Consider adding a 'try again' option for wrong answers.",
    resolved: false,
  },
];

// Mock xAPI statements
const mockXAPIStatements = [
  {
    id: 1,
    verb: 'launched',
    object: 'Onboarding Module',
    timestamp: '2024-01-15T10:30:00Z',
    result: null,
  },
  {
    id: 2,
    verb: 'experienced',
    object: 'Slide 3: Company Values',
    timestamp: '2024-01-15T10:31:15Z',
    result: { duration: 'PT45S' },
  },
  {
    id: 3,
    verb: 'answered',
    object: 'Quiz Question 1',
    timestamp: '2024-01-15T10:32:30Z',
    result: { success: true, score: { raw: 1, max: 1 } },
  },
  {
    id: 4,
    verb: 'completed',
    object: 'Onboarding Module',
    timestamp: '2024-01-15T10:45:00Z',
    result: { success: true, score: { raw: 85, max: 100 }, duration: 'PT15M' },
  },
];

export function SandboxSuite(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('viewer');
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime] = useState(45);
  const [duration] = useState(180);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState('general');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sandbox</h1>
          <p className="text-muted-foreground">
            Test, review, and analyze your e-learning projects
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Project
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="viewer" className="gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Project Viewer</span>
            <span className="sm:hidden">Viewer</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Review & Annotate</span>
            <span className="sm:hidden">Review</span>
          </TabsTrigger>
          <TabsTrigger value="lrs" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Test LRS</span>
            <span className="sm:hidden">LRS</span>
          </TabsTrigger>
        </TabsList>

        {/* Project Viewer Tab */}
        <TabsContent value="viewer" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Project List Sidebar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Projects</CardTitle>
                <CardDescription>SCORM, xAPI, and HTML5 packages</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-2">
                    {mockProjects.map((project) => (
                      <button
                        type="button"
                        key={project.id}
                        className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProject.id === project.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.type}</p>
                          </div>
                          <Badge
                            variant={project.status === 'reviewed' ? 'default' : 'secondary'}
                            className="text-xs shrink-0"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileCode className="h-3 w-3" />
                            {project.format}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {project.annotations}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.uploadedAt}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Player Area */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedProject.name}</CardTitle>
                    <CardDescription>
                      {selectedProject.type} - {selectedProject.format}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mock Player View */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5" />
                  <div className="text-center z-10">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">E-Learning Player</p>
                    <p className="text-xs text-muted-foreground">
                      Your {selectedProject.format} package renders here
                    </p>
                  </div>
                  {/* Slide indicator */}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs">
                    Slide 3 of 12
                  </div>
                </div>

                {/* Player Controls */}
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {Math.floor(currentTime / 60)}:
                        {(currentTime % 60).toString().padStart(2, '0')}
                      </span>
                      <span>
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Control buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Review & Annotate Tab */}
        <TabsContent value="review" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Annotation View */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Visual Review</CardTitle>
                    <CardDescription>Click anywhere to add a pin annotation</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Pin className="h-3 w-3" />
                      {mockAnnotations.length} annotations
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mock annotatable view */}
                <div className="aspect-video bg-muted rounded-lg relative border overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5" />

                  {/* Mock annotation pins */}
                  <div className="absolute top-[20%] left-[30%] w-6 h-6 rounded-full bg-destructive text-brand-primary flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform">
                    1
                  </div>
                  <div className="absolute top-[45%] left-[60%] w-6 h-6 rounded-full bg-brand-warning text-brand-primary flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform">
                    2
                  </div>
                  <div className="absolute top-[70%] left-[25%] w-6 h-6 rounded-full bg-primary text-brand-primary flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform">
                    3
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                    <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-lg text-xs text-muted-foreground">
                      Click to add annotation - Drag to reposition
                    </div>
                  </div>
                </div>

                {/* Add annotation form */}
                <div className="mt-4 p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm shrink-0">Type:</Label>
                    <div className="flex gap-2">
                      {['general', 'timing', 'accessibility', 'interaction'].map((type) => (
                        <Badge
                          key={type}
                          variant={annotationType === type ? 'default' : 'outline'}
                          className="cursor-pointer capitalize"
                          onClick={() => setAnnotationType(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add your annotation..."
                      value={newAnnotation}
                      onChange={(e) => setNewAnnotation(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="gap-2">
                      <Send className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annotations List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Annotations</CardTitle>
                <CardDescription>Feedback from your mentor</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-4">
                    {mockAnnotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className={`p-3 rounded-lg border ${
                          annotation.resolved ? 'bg-muted/50 opacity-60' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                annotation.type === 'accessibility'
                                  ? 'border-destructive/50 text-destructive'
                                  : annotation.type === 'timing'
                                    ? 'border-amber-500/50 text-amber-600'
                                    : 'border-primary/50 text-primary'
                              }`}
                            >
                              {annotation.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              @{annotation.timestamp} - Slide {annotation.slide}
                            </span>
                          </div>
                          {annotation.resolved ? (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm">{annotation.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">{annotation.author}</span>
                          {!annotation.resolved && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test LRS Tab */}
        <TabsContent value="lrs" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* xAPI Statement Sender */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Send xAPI Statement
                </CardTitle>
                <CardDescription>
                  Test your xAPI implementation by sending statements to the sandbox LRS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Actor (Learner)</Label>
                  <Input
                    placeholder="mailto:learner@example.com"
                    defaultValue="mailto:jordan@example.com"
                  />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Verb</Label>
                    <Input placeholder="experienced, completed, etc." defaultValue="completed" />
                  </div>
                  <div className="space-y-2">
                    <Label>Object ID</Label>
                    <Input placeholder="Activity ID" defaultValue="http://example.com/module-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Result (JSON)</Label>
                  <Textarea
                    className="font-mono text-sm"
                    rows={4}
                    defaultValue={`{
  "success": true,
  "score": { "raw": 85, "max": 100 },
  "duration": "PT15M"
}`}
                  />
                </div>
                <Button className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Send Statement
                </Button>
              </CardContent>
            </Card>

            {/* Statement Log */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Statement Log
                    </CardTitle>
                    <CardDescription>Recent xAPI statements received</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Clear Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {mockXAPIStatements.map((statement) => (
                      <div
                        key={statement.id}
                        className="p-3 rounded-lg border bg-muted/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-xs">
                            {statement.verb}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(statement.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{statement.object}</p>
                        {statement.result && (
                          <pre className="text-xs bg-background p-2 rounded font-mono overflow-x-auto">
                            {JSON.stringify(statement.result, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* LRS Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Sandbox LRS Endpoint</CardTitle>
              <CardDescription>
                Use these credentials in your authoring tool to send xAPI statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Endpoint URL</Label>
                  <code className="block p-2 bg-muted rounded text-sm font-mono truncate">
                    https://lrs.lxdnexus.com/sandbox/jordan-123
                  </code>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <code className="block p-2 bg-muted rounded text-sm font-mono">
                    sandbox_jordan
                  </code>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <code className="block p-2 bg-muted rounded text-sm font-mono">************</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
