'use client';

/**
 * FacilitatorGuideGenerator - Generate Facilitator Guides
 *
 * Creates detailed facilitator guides from ILT sessions with
 * timing cues, talking points, and preparation checklists.
 */

import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageSquare,
  Printer,
  Target,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type {
  AgendaSection,
  FacilitatorGuide,
  ILTSession,
  PreparationTask,
} from '@/types/studio/ilt';

// =============================================================================
// TYPES
// =============================================================================

interface FacilitatorGuideGeneratorProps {
  /** Session to generate guide from */
  session: ILTSession;
  /** Existing guide (for editing) */
  guide?: FacilitatorGuide;
  /** Callback when guide is generated */
  onGenerate?: (guide: FacilitatorGuide) => void;
  /** Additional class name */
  className?: string;
}

interface FacilitatorGuideViewerProps {
  /** Guide to display */
  guide: FacilitatorGuide;
  /** Enable editing */
  editable?: boolean;
  /** Callback when guide changes */
  onChange?: (guide: FacilitatorGuide) => void;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}h ${mins}m`;
}

function generateGuideFromSession(session: ILTSession): FacilitatorGuide {
  const now = new Date().toISOString();

  // Generate preparation tasks
  const advancePreparation: PreparationTask[] = [
    { task: 'Review all session materials and content', timing: '1 week before' },
    { task: 'Confirm participant registration list', timing: '3 days before' },
    { task: 'Send pre-session communication to participants', timing: '3 days before' },
    { task: 'Test all technology and equipment', timing: '1 day before' },
    { task: 'Prepare handouts and materials', timing: '1 day before' },
  ];

  const dayOfPreparation: PreparationTask[] = [
    { task: 'Arrive early to set up room/technology', timing: '30 minutes before' },
    { task: 'Test projector/screen sharing', timing: '20 minutes before' },
    { task: 'Set up materials at each station', timing: '15 minutes before' },
    { task: 'Welcome early arrivals', timing: '10 minutes before' },
  ];

  if (session.deliveryMode === 'virtual') {
    advancePreparation.push({
      task: 'Send virtual meeting link and instructions',
      timing: '1 day before',
    });
    dayOfPreparation.unshift({
      task: 'Open virtual meeting room for tech check',
      timing: '15 minutes before',
    });
  }

  // Generate detailed agenda sections
  let cumulativeMinutes = 0;
  const startTime = new Date(`2000-01-01T${session.scheduledTime || '09:00'}`);

  const detailedAgenda: AgendaSection[] = session.agenda.map((item, index) => {
    const activityStart = new Date(startTime.getTime() + cumulativeMinutes * 60000);
    const activityEnd = new Date(activityStart.getTime() + item.duration * 60000);

    const timeAllocation = `${activityStart.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })} - ${activityEnd.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    cumulativeMinutes += item.duration;

    // Generate facilitator actions based on activity type
    let facilitatorActions: string[] = [];
    let participantActions: string[] = [];
    let keyMessages: string[] = [];

    switch (item.activityType) {
      case 'presentation':
        facilitatorActions = [
          'Present content using slides',
          'Check for understanding periodically',
          'Address questions as they arise',
        ];
        participantActions = ['Listen actively', 'Take notes', 'Ask clarifying questions'];
        keyMessages = item.talkingPoints || ['Key concept to emphasize'];
        break;

      case 'discussion':
        facilitatorActions = [
          'Pose discussion questions',
          'Facilitate balanced participation',
          'Summarize key points',
        ];
        participantActions = [
          'Share perspectives',
          "Build on others' ideas",
          'Practice active listening',
        ];
        break;

      case 'exercise':
        facilitatorActions = [
          'Explain exercise instructions clearly',
          'Circulate to provide support',
          'Manage time and provide warnings',
        ];
        participantActions = [
          'Follow instructions',
          'Complete the exercise',
          'Ask for help if needed',
        ];
        break;

      case 'breakout':
        facilitatorActions = [
          'Assign groups',
          'Provide clear instructions and time limits',
          'Visit rooms to check progress',
          'Bring groups back for debrief',
        ];
        participantActions = [
          'Join assigned group',
          'Participate in group discussion',
          'Prepare to report out',
        ];
        break;

      case 'break':
        facilitatorActions = ['Announce break duration', 'Be available for individual questions'];
        participantActions = ['Take a break', 'Return on time'];
        break;

      default:
        facilitatorActions = item.facilitatorInstructions
          ? [item.facilitatorInstructions]
          : ['Facilitate activity'];
        participantActions = ['Participate in activity'];
    }

    const section: AgendaSection = {
      id: item.id,
      title: item.title,
      timeAllocation,
      duration: item.duration,
      activityType: item.activityType,
      purpose: item.description || `Conduct ${item.activityType} activity`,
      facilitatorActions,
      participantActions,
      keyMessages,
      transitionStatement:
        index < session.agenda.length - 1
          ? `Now let's move on to ${session.agenda[index + 1]?.title || 'the next activity'}.`
          : undefined,
      energyLevel:
        item.interactionLevel === 'highly-active'
          ? 'high'
          : item.interactionLevel === 'active'
            ? 'medium'
            : 'low',
      timingCues: [
        { atMinute: Math.floor(item.duration / 2), action: 'Check time - halfway point' },
        { atMinute: item.duration - 5, action: '5 minutes remaining - begin wrap-up' },
      ],
    };

    return section;
  });

  const guide: FacilitatorGuide = {
    sessionId: session.id,
    version: '1.0',
    generatedAt: now,

    overview: {
      title: session.title,
      description: session.description || '',
      duration: session.duration,
      deliveryMode: session.deliveryMode,
      targetAudience: session.targetAudience || 'Training participants',
      prerequisites: session.prerequisites || [],
      learningObjectives: session.learningObjectives,
    },

    preparation: {
      advancePreparation,
      dayOfPreparation,
      materialsChecklist: session.materials.map((m) => m.name),
      ...(session.deliveryMode !== 'virtual' && {
        roomSetup: {
          layoutType: 'classroom',
          seatingCapacity: session.maxParticipants || 20,
          equipmentNeeded: ['Projector', 'Screen', 'Whiteboard', 'Markers'],
        },
      }),
      ...(session.deliveryMode !== 'in-person' && {
        technicalSetup: {
          platform: session.virtualSettings?.platform || 'zoom',
          testingInstructions: [
            'Test audio and video',
            'Test screen sharing',
            'Test breakout rooms if using',
          ],
          backupPlan: 'Have phone dial-in as backup',
          technicalRequirements: ['Stable internet connection', 'Webcam', 'Microphone'],
        },
      }),
    },

    detailedAgenda,

    appendices: {
      additionalResources: [],
      troubleshootingGuide: [
        {
          issue: 'Audio not working',
          symptoms: ['No sound', 'Echo'],
          solutions: ['Check mute status', 'Reconnect audio', 'Use phone dial-in'],
        },
        {
          issue: 'Screen sharing not working',
          symptoms: ['Blank screen', 'Wrong window shared'],
          solutions: ['Stop and restart share', 'Share specific window', 'Close and reopen app'],
        },
      ],
    },
  };

  return guide;
}

// =============================================================================
// GUIDE SECTION COMPONENT
// =============================================================================

interface GuideSectionProps {
  title: string;
  icon: typeof BookOpen;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

function GuideSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
  className,
}: GuideSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('border border-white/10 rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-blue-400" />
          <span className="font-medium text-zinc-200">{title}</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}

// =============================================================================
// FACILITATOR GUIDE GENERATOR
// =============================================================================

export function FacilitatorGuideGenerator({
  session,
  guide: existingGuide,
  onGenerate,
  className,
}: FacilitatorGuideGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState<FacilitatorGuide | null>(
    existingGuide || null,
  );

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const guide = generateGuideFromSession(session);
    setGeneratedGuide(guide);
    onGenerate?.(guide);

    setIsGenerating(false);
  }, [session, onGenerate]);

  if (generatedGuide) {
    return (
      <FacilitatorGuideViewer
        guide={generatedGuide}
        editable
        onChange={setGeneratedGuide}
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
        <FileText className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-200 mb-2">Generate Facilitator Guide</h3>
        <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
          Create a detailed facilitator guide with timing cues, talking points, preparation
          checklists, and activity instructions.
        </p>

        <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Guide
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <ListChecks className="h-5 w-5 text-green-400 mb-2" />
          <h4 className="font-medium text-zinc-200 mb-1">Preparation Checklists</h4>
          <p className="text-xs text-zinc-400">Advance and day-of preparation tasks</p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <Clock className="h-5 w-5 text-blue-400 mb-2" />
          <h4 className="font-medium text-zinc-200 mb-1">Detailed Timing</h4>
          <p className="text-xs text-zinc-400">Minute-by-minute activity breakdown</p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <MessageSquare className="h-5 w-5 text-purple-400 mb-2" />
          <h4 className="font-medium text-zinc-200 mb-1">Talking Points</h4>
          <p className="text-xs text-zinc-400">Key messages and transitions</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FACILITATOR GUIDE VIEWER
// =============================================================================

export function FacilitatorGuideViewer({
  guide,
  editable: _editable = false,
  onChange: _onChange,
  className,
}: FacilitatorGuideViewerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-200">{guide.overview.title}</h2>
          <p className="text-sm text-zinc-400">Facilitator Guide • Version {guide.version}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Section */}
      <GuideSection title="Session Overview" icon={BookOpen}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Duration</span>
              <p className="text-zinc-200">{formatDuration(guide.overview.duration)}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Delivery Mode</span>
              <p className="text-zinc-200 capitalize">
                {guide.overview.deliveryMode.replace('-', ' ')}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                Target Audience
              </span>
              <p className="text-zinc-200">{guide.overview.targetAudience}</p>
            </div>
          </div>

          {guide.overview.learningObjectives.length > 0 && (
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                Learning Objectives
              </span>
              <ul className="mt-2 space-y-1">
                {guide.overview.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Target className="h-4 w-4 mt-0.5 text-green-400 shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </GuideSection>

      {/* Preparation Section */}
      <GuideSection title="Preparation Checklist" icon={ListChecks}>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Advance Preparation</h4>
            <div className="space-y-2">
              {guide.preparation.advancePreparation.map((task, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Checkbox id={`advance-${i}`} />
                  <div className="flex-1">
                    <label
                      htmlFor={`advance-${i}`}
                      className="text-sm text-zinc-200 cursor-pointer"
                    >
                      {task.task}
                    </label>
                    <p className="text-xs text-zinc-500">{task.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Day-of Preparation</h4>
            <div className="space-y-2">
              {guide.preparation.dayOfPreparation.map((task, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Checkbox id={`dayof-${i}`} />
                  <div className="flex-1">
                    <label htmlFor={`dayof-${i}`} className="text-sm text-zinc-200 cursor-pointer">
                      {task.task}
                    </label>
                    <p className="text-xs text-zinc-500">{task.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GuideSection>

      {/* Detailed Agenda Section */}
      <GuideSection title="Detailed Agenda" icon={Clock}>
        <div className="space-y-4">
          {guide.detailedAgenda.map((section, _index) => (
            <div key={section.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-zinc-200">{section.title}</h4>
                  <p className="text-sm text-zinc-400">
                    {section.timeAllocation} ({formatDuration(section.duration)})
                  </p>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs',
                    section.energyLevel === 'high'
                      ? 'bg-orange-500/20 text-orange-400'
                      : section.energyLevel === 'medium'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-zinc-500/20 text-zinc-400',
                  )}
                >
                  {section.energyLevel} energy
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Purpose</span>
                  <p className="text-zinc-300">{section.purpose}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      Facilitator Actions
                    </span>
                    <ul className="mt-1 space-y-1">
                      {section.facilitatorActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-zinc-300">
                          <span className="text-blue-400">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      Participant Actions
                    </span>
                    <ul className="mt-1 space-y-1">
                      {section.participantActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-zinc-300">
                          <span className="text-green-400">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {section.keyMessages.length > 0 && (
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      Key Messages
                    </span>
                    <ul className="mt-1 space-y-1">
                      {section.keyMessages.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2 text-zinc-300">
                          <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-400 shrink-0" />
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.transitionStatement && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      Transition
                    </span>
                    <p className="text-zinc-400 italic">
                      &quot;{section.transitionStatement}&quot;
                    </p>
                  </div>
                )}

                {section.timingCues && section.timingCues.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      Timing Cues
                    </span>
                    <div className="flex gap-4 mt-1">
                      {section.timingCues.map((cue, i) => (
                        <span key={i} className="text-xs text-amber-400">
                          @{cue.atMinute}min: {cue.action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* Troubleshooting Section */}
      {guide.appendices.troubleshootingGuide &&
        guide.appendices.troubleshootingGuide.length > 0 && (
          <GuideSection title="Troubleshooting Guide" icon={AlertCircle} defaultExpanded={false}>
            <div className="space-y-4">
              {guide.appendices.troubleshootingGuide.map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h4 className="font-medium text-red-400 mb-2">{item.issue}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">
                        Symptoms
                      </span>
                      <ul className="mt-1 space-y-1">
                        {item.symptoms.map((s, j) => (
                          <li key={j} className="text-zinc-400">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">
                        Solutions
                      </span>
                      <ul className="mt-1 space-y-1">
                        {item.solutions.map((s, j) => (
                          <li key={j} className="text-zinc-300">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GuideSection>
        )}
    </div>
  );
}
