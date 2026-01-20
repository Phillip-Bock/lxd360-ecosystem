'use client';

/**
 * StatementBuilder - Custom xAPI Statement Builder UI
 *
 * Provides a form-based interface for building custom xAPI statements
 * with actor, verb, object, result, and context configuration.
 */

import {
  Activity,
  ChevronDown,
  ChevronRight,
  Copy,
  FileJson,
  Play,
  Plus,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';
import {
  EXTENDED_VERB_IRIS,
  type ExtendedXAPIVerb,
  type XAPIActor,
  type XAPIContext,
  type XAPIObject,
  type XAPIResult,
  type XAPIStatement,
} from '@/types/xapi';

// =============================================================================
// TYPES
// =============================================================================

interface StatementBuilderProps {
  /** Initial statement to edit */
  initialStatement?: Partial<XAPIStatement>;
  /** Callback when statement changes */
  onChange?: (statement: XAPIStatement) => void;
  /** Callback to send statement */
  onSend?: (statement: XAPIStatement) => Promise<void>;
  /** Show send button */
  showSendButton?: boolean;
  /** Additional class name */
  className?: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  required?: boolean;
}

// =============================================================================
// VERB OPTIONS
// =============================================================================

const VERB_OPTIONS: Array<{ value: ExtendedXAPIVerb; label: string; category: string }> = [
  // Lifecycle
  { value: 'initialized', label: 'Initialized', category: 'Lifecycle' },
  { value: 'launched', label: 'Launched', category: 'Lifecycle' },
  { value: 'completed', label: 'Completed', category: 'Lifecycle' },
  { value: 'terminated', label: 'Terminated', category: 'Lifecycle' },

  // Progress
  { value: 'progressed', label: 'Progressed', category: 'Progress' },
  { value: 'resumed', label: 'Resumed', category: 'Progress' },
  { value: 'suspended', label: 'Suspended', category: 'Progress' },

  // Assessment
  { value: 'passed', label: 'Passed', category: 'Assessment' },
  { value: 'failed', label: 'Failed', category: 'Assessment' },
  { value: 'scored', label: 'Scored', category: 'Assessment' },
  { value: 'answered', label: 'Answered', category: 'Assessment' },
  { value: 'attempted', label: 'Attempted', category: 'Assessment' },
  { value: 'mastered', label: 'Mastered', category: 'Assessment' },

  // Interaction
  { value: 'interacted', label: 'Interacted', category: 'Interaction' },
  { value: 'experienced', label: 'Experienced', category: 'Interaction' },
  { value: 'asked', label: 'Asked', category: 'Interaction' },

  // Media
  { value: 'played', label: 'Played', category: 'Media' },
  { value: 'paused', label: 'Paused', category: 'Media' },
  { value: 'seeked', label: 'Seeked', category: 'Media' },

  // Social
  { value: 'commented', label: 'Commented', category: 'Social' },
  { value: 'shared', label: 'Shared', category: 'Social' },
  { value: 'liked', label: 'Liked', category: 'Social' },

  // Navigation
  { value: 'exited', label: 'Exited', category: 'Navigation' },
  { value: 'skipped', label: 'Skipped', category: 'Navigation' },

  // cmi5
  { value: 'satisfied', label: 'Satisfied', category: 'cmi5' },
  { value: 'waived', label: 'Waived', category: 'cmi5' },
];

const ACTIVITY_TYPES = [
  { value: 'http://adlnet.gov/expapi/activities/course', label: 'Course' },
  { value: 'http://adlnet.gov/expapi/activities/module', label: 'Module' },
  { value: 'http://adlnet.gov/expapi/activities/lesson', label: 'Lesson' },
  { value: 'http://adlnet.gov/expapi/activities/assessment', label: 'Assessment' },
  { value: 'http://adlnet.gov/expapi/activities/question', label: 'Question' },
  { value: 'http://adlnet.gov/expapi/activities/interaction', label: 'Interaction' },
  { value: 'http://adlnet.gov/expapi/activities/simulation', label: 'Simulation' },
  { value: 'http://adlnet.gov/expapi/activities/media', label: 'Media' },
  { value: 'https://w3id.org/xapi/video/activity-type/video', label: 'Video' },
  { value: 'https://w3id.org/xapi/audio/activity-type/audio', label: 'Audio' },
  { value: 'http://id.tincanapi.com/activitytype/slide', label: 'Slide' },
];

// =============================================================================
// SECTION COMPONENT
// =============================================================================

function Section({ title, icon, expanded, onToggle, children, required }: SectionProps) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">{icon}</span>
          <span className="font-medium text-zinc-200">{title}</span>
          {required && <span className="text-xs text-red-400">Required</span>}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      {expanded && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function StatementBuilder({
  initialStatement,
  onChange: _onChange,
  onSend,
  showSendButton = true,
  className,
}: StatementBuilderProps) {
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    actor: true,
    verb: true,
    object: true,
    result: false,
    context: false,
  });

  // Actor state
  const [actorType, setActorType] = useState<'mbox' | 'account'>('mbox');
  const [actorName, setActorName] = useState(
    initialStatement?.actor && 'name' in initialStatement.actor ? initialStatement.actor.name : '',
  );
  const [actorEmail, setActorEmail] = useState(() => {
    if (initialStatement?.actor && 'mbox' in initialStatement.actor) {
      return initialStatement.actor.mbox?.replace('mailto:', '') || '';
    }
    return '';
  });
  const [actorAccountName, setActorAccountName] = useState(() => {
    if (initialStatement?.actor && 'account' in initialStatement.actor) {
      return initialStatement.actor.account?.name || '';
    }
    return '';
  });
  const [actorAccountHomePage, setActorAccountHomePage] = useState(() => {
    if (initialStatement?.actor && 'account' in initialStatement.actor) {
      return initialStatement.actor.account?.homePage || '';
    }
    return 'https://lxd360.com';
  });

  // Verb state
  const [selectedVerb, setSelectedVerb] = useState<ExtendedXAPIVerb>('experienced');
  const [customVerbId, setCustomVerbId] = useState('');
  const [customVerbDisplay, setCustomVerbDisplay] = useState('');
  const [useCustomVerb, setUseCustomVerb] = useState(false);

  // Object state
  const [objectId, setObjectId] = useState(
    initialStatement?.object && 'id' in initialStatement.object
      ? initialStatement.object.id
      : 'https://inspire.lxd360.com/activities/',
  );
  const [objectName, setObjectName] = useState('');
  const [objectDescription, setObjectDescription] = useState('');
  const [objectType, setObjectType] = useState(ACTIVITY_TYPES[0].value);

  // Result state
  const [includeResult, setIncludeResult] = useState(false);
  const [resultScore, setResultScore] = useState<number | undefined>();
  const [resultSuccess, setResultSuccess] = useState<boolean | undefined>();
  const [resultCompletion, setResultCompletion] = useState<boolean | undefined>();
  const [resultResponse, setResultResponse] = useState('');
  const [resultDuration, setResultDuration] = useState('');

  // Context state
  const [includeContext, setIncludeContext] = useState(false);
  const [contextRegistration, setContextRegistration] = useState('');
  const [contextPlatform, setContextPlatform] = useState('INSPIRE Studio');
  const [contextLanguage, setContextLanguage] = useState('en-US');

  // Extensions state
  const [extensions, setExtensions] = useState<Array<{ key: string; value: string }>>([]);

  // Sending state
  const [isSending, setIsSending] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Build the statement object
  const buildStatement = useCallback((): XAPIStatement => {
    // Build actor based on identifier type
    const actor: XAPIActor =
      actorType === 'mbox'
        ? {
            objectType: 'Agent',
            mbox: `mailto:${actorEmail}` as `mailto:${string}`,
            ...(actorName && { name: actorName }),
          }
        : {
            objectType: 'Agent',
            account: {
              homePage: actorAccountHomePage,
              name: actorAccountName,
            },
            ...(actorName && { name: actorName }),
          };

    // Build verb
    const verb = useCustomVerb
      ? {
          id: customVerbId,
          display: { 'en-US': customVerbDisplay || customVerbId.split('/').pop() || '' },
        }
      : {
          id: EXTENDED_VERB_IRIS[selectedVerb],
          display: { 'en-US': selectedVerb },
        };

    // Build object
    const object: XAPIObject = {
      objectType: 'Activity',
      id: objectId,
      definition: {
        type: objectType,
        ...(objectName && { name: { 'en-US': objectName } }),
        ...(objectDescription && { description: { 'en-US': objectDescription } }),
      },
    };

    // Build result
    let result: XAPIResult | undefined;
    if (includeResult) {
      result = {};

      if (resultScore !== undefined) {
        result.score = {
          scaled: resultScore / 100,
          raw: resultScore,
          min: 0,
          max: 100,
        };
      }

      if (resultSuccess !== undefined) {
        result.success = resultSuccess;
      }

      if (resultCompletion !== undefined) {
        result.completion = resultCompletion;
      }

      if (resultResponse) {
        result.response = resultResponse;
      }

      if (resultDuration) {
        result.duration = resultDuration;
      }
    }

    // Build context
    let context: XAPIContext | undefined;
    if (includeContext) {
      context = {
        ...(contextRegistration && { registration: contextRegistration }),
      };

      // Add platform and language as extensions (since they're not in base XAPIContext)
      const contextExtensions: Record<string, unknown> = {};

      if (contextPlatform) {
        contextExtensions['https://lxd360.com/xapi/extensions/platform'] = contextPlatform;
      }

      if (contextLanguage) {
        contextExtensions['https://lxd360.com/xapi/extensions/language'] = contextLanguage;
      }

      // Add user-defined extensions
      for (const ext of extensions) {
        if (ext.key && ext.value) {
          try {
            contextExtensions[ext.key] = JSON.parse(ext.value);
          } catch {
            contextExtensions[ext.key] = ext.value;
          }
        }
      }

      if (Object.keys(contextExtensions).length > 0) {
        context.extensions = contextExtensions;
      }
    }

    const statement: XAPIStatement = {
      actor,
      verb,
      object,
      ...(result && { result }),
      ...(context && { context }),
      timestamp: new Date().toISOString(),
    };

    return statement;
  }, [
    actorType,
    actorName,
    actorEmail,
    actorAccountName,
    actorAccountHomePage,
    useCustomVerb,
    customVerbId,
    customVerbDisplay,
    selectedVerb,
    objectId,
    objectName,
    objectDescription,
    objectType,
    includeResult,
    resultScore,
    resultSuccess,
    resultCompletion,
    resultResponse,
    resultDuration,
    includeContext,
    contextRegistration,
    contextPlatform,
    contextLanguage,
    extensions,
  ]);

  const handleCopy = async () => {
    const statement = buildStatement();
    await navigator.clipboard.writeText(JSON.stringify(statement, null, 2));
  };

  const handleSend = async () => {
    if (!onSend) return;

    setIsSending(true);
    try {
      const statement = buildStatement();
      await onSend(statement);
    } finally {
      setIsSending(false);
    }
  };

  const addExtension = () => {
    setExtensions((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateExtension = (index: number, field: 'key' | 'value', value: string) => {
    setExtensions((prev) => prev.map((ext, i) => (i === index ? { ...ext, [field]: value } : ext)));
  };

  const removeExtension = (index: number) => {
    setExtensions((prev) => prev.filter((_, i) => i !== index));
  };

  // Notify parent of changes
  const _statement = buildStatement();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Actor Section */}
      <Section
        title="Actor"
        icon={<User className="h-4 w-4" />}
        expanded={expandedSections.actor}
        onToggle={() => toggleSection('actor')}
        required
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="actor-name">Name</Label>
            <Input
              id="actor-name"
              value={actorName}
              onChange={(e) => setActorName(e.target.value)}
              placeholder="John Doe"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label>Identifier Type</Label>
            <Select value={actorType} onValueChange={(v) => setActorType(v as 'mbox' | 'account')}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mbox">Email (mbox)</SelectItem>
                <SelectItem value="account">Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actorType === 'mbox' ? (
            <div className="grid gap-2">
              <Label htmlFor="actor-email">Email</Label>
              <Input
                id="actor-email"
                type="email"
                value={actorEmail}
                onChange={(e) => setActorEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="bg-white/5 border-white/10"
              />
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="account-homepage">Account Home Page</Label>
                <Input
                  id="account-homepage"
                  value={actorAccountHomePage}
                  onChange={(e) => setActorAccountHomePage(e.target.value)}
                  placeholder="https://lxd360.com"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={actorAccountName}
                  onChange={(e) => setActorAccountName(e.target.value)}
                  placeholder="john.doe"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Verb Section */}
      <Section
        title="Verb"
        icon={<Play className="h-4 w-4" />}
        expanded={expandedSections.verb}
        onToggle={() => toggleSection('verb')}
        required
      >
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="use-custom-verb"
              checked={useCustomVerb}
              onCheckedChange={(checked) => setUseCustomVerb(checked === true)}
            />
            <Label htmlFor="use-custom-verb" className="font-normal cursor-pointer">
              Use custom verb
            </Label>
          </div>

          {useCustomVerb ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="custom-verb-id">Verb ID (IRI)</Label>
                <Input
                  id="custom-verb-id"
                  value={customVerbId}
                  onChange={(e) => setCustomVerbId(e.target.value)}
                  placeholder="http://example.com/verbs/customverb"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="custom-verb-display">Display Name</Label>
                <Input
                  id="custom-verb-display"
                  value={customVerbDisplay}
                  onChange={(e) => setCustomVerbDisplay(e.target.value)}
                  placeholder="custom verb"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="verb-select">Select Verb</Label>
              <Select
                value={selectedVerb}
                onValueChange={(v) => setSelectedVerb(v as ExtendedXAPIVerb)}
              >
                <SelectTrigger id="verb-select" className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {VERB_OPTIONS.map((verb) => (
                    <SelectItem key={verb.value} value={verb.value}>
                      <span className="text-xs text-zinc-500 mr-2">[{verb.category}]</span>
                      {verb.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 font-mono truncate">
                {EXTENDED_VERB_IRIS[selectedVerb]}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Object Section */}
      <Section
        title="Object"
        icon={<Activity className="h-4 w-4" />}
        expanded={expandedSections.object}
        onToggle={() => toggleSection('object')}
        required
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="object-id">Activity ID (IRI)</Label>
            <Input
              id="object-id"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              placeholder="https://inspire.lxd360.com/activities/lesson/intro"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="object-type">Activity Type</Label>
            <Select value={objectType} onValueChange={setObjectType}>
              <SelectTrigger id="object-type" className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="object-name">Name</Label>
            <Input
              id="object-name"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="Introduction to xAPI"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="object-description">Description</Label>
            <Textarea
              id="object-description"
              value={objectDescription}
              onChange={(e) => setObjectDescription(e.target.value)}
              placeholder="Learn the basics of Experience API"
              className="bg-white/5 border-white/10 resize-none"
              rows={2}
            />
          </div>
        </div>
      </Section>

      {/* Result Section */}
      <Section
        title="Result"
        icon={<FileJson className="h-4 w-4" />}
        expanded={expandedSections.result}
        onToggle={() => toggleSection('result')}
      >
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="include-result"
              checked={includeResult}
              onCheckedChange={(checked) => setIncludeResult(checked === true)}
            />
            <Label htmlFor="include-result" className="font-normal cursor-pointer">
              Include result in statement
            </Label>
          </div>

          {includeResult && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="result-score">Score (0-100)</Label>
                  <Input
                    id="result-score"
                    type="number"
                    min={0}
                    max={100}
                    value={resultScore ?? ''}
                    onChange={(e) =>
                      setResultScore(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="result-duration">Duration (ISO 8601)</Label>
                  <Input
                    id="result-duration"
                    value={resultDuration}
                    onChange={(e) => setResultDuration(e.target.value)}
                    placeholder="PT30M"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="result-success"
                    checked={resultSuccess === true}
                    onCheckedChange={(checked) =>
                      setResultSuccess(checked === 'indeterminate' ? undefined : checked === true)
                    }
                  />
                  <Label htmlFor="result-success" className="font-normal cursor-pointer">
                    Success
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="result-completion"
                    checked={resultCompletion === true}
                    onCheckedChange={(checked) =>
                      setResultCompletion(
                        checked === 'indeterminate' ? undefined : checked === true,
                      )
                    }
                  />
                  <Label htmlFor="result-completion" className="font-normal cursor-pointer">
                    Completion
                  </Label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="result-response">Response</Label>
                <Input
                  id="result-response"
                  value={resultResponse}
                  onChange={(e) => setResultResponse(e.target.value)}
                  placeholder="Learner response data"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Context Section */}
      <Section
        title="Context"
        icon={<FileJson className="h-4 w-4" />}
        expanded={expandedSections.context}
        onToggle={() => toggleSection('context')}
      >
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="include-context"
              checked={includeContext}
              onCheckedChange={(checked) => setIncludeContext(checked === true)}
            />
            <Label htmlFor="include-context" className="font-normal cursor-pointer">
              Include context in statement
            </Label>
          </div>

          {includeContext && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="context-registration">Registration UUID</Label>
                <Input
                  id="context-registration"
                  value={contextRegistration}
                  onChange={(e) => setContextRegistration(e.target.value)}
                  placeholder="12345678-1234-1234-1234-123456789012"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="context-platform">Platform</Label>
                  <Input
                    id="context-platform"
                    value={contextPlatform}
                    onChange={(e) => setContextPlatform(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="context-language">Language</Label>
                  <Input
                    id="context-language"
                    value={contextLanguage}
                    onChange={(e) => setContextLanguage(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {/* Extensions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Extensions</Label>
                  <Button variant="ghost" size="sm" onClick={addExtension} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>

                {extensions.map((ext, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ext.key}
                      onChange={(e) => updateExtension(index, 'key', e.target.value)}
                      placeholder="https://example.com/ext/key"
                      className="bg-white/5 border-white/10 flex-1"
                    />
                    <Input
                      value={ext.value}
                      onChange={(e) => updateExtension(index, 'value', e.target.value)}
                      placeholder="Value (or JSON)"
                      className="bg-white/5 border-white/10 flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExtension(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={handleCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy JSON
        </Button>

        {showSendButton && onSend && (
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Statement'}
          </Button>
        )}
      </div>
    </div>
  );
}
