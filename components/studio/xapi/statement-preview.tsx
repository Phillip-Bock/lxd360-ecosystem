'use client';

/**
 * StatementPreview - xAPI Statement JSON Viewer
 *
 * Displays xAPI statements in a formatted JSON view with
 * syntax highlighting and collapsible sections.
 */

import {
  Activity,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  FileJson,
  Play,
  User,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { XAPIStatement } from '@/types/xapi';

// =============================================================================
// TYPES
// =============================================================================

interface StatementPreviewProps {
  /** Statement to preview */
  statement?: XAPIStatement;
  /** Multiple statements */
  statements?: XAPIStatement[];
  /** Show raw JSON view */
  showRawJson?: boolean;
  /** Show formatted view */
  showFormatted?: boolean;
  /** Additional class name */
  className?: string;
}

interface JsonViewerProps {
  data: unknown;
  depth?: number;
  className?: string;
}

// =============================================================================
// SAMPLE STATEMENTS
// =============================================================================

const SAMPLE_STATEMENTS: Record<string, XAPIStatement> = {
  experienced: {
    actor: {
      objectType: 'Agent',
      name: 'John Doe',
      mbox: 'mailto:john.doe@example.com',
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/experienced',
      display: { 'en-US': 'experienced' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://inspire.lxd360.com/activities/lesson/intro-to-xapi',
      definition: {
        type: 'http://adlnet.gov/expapi/activities/lesson',
        name: { 'en-US': 'Introduction to xAPI' },
        description: { 'en-US': 'Learn the basics of Experience API' },
      },
    },
    timestamp: new Date().toISOString(),
  },
  answered: {
    actor: {
      objectType: 'Agent',
      name: 'Jane Smith',
      mbox: 'mailto:jane.smith@example.com',
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: { 'en-US': 'answered' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://inspire.lxd360.com/activities/question/q1',
      definition: {
        type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
        name: { 'en-US': 'Quiz Question 1' },
        interactionType: 'choice',
        correctResponsesPattern: ['b'],
        choices: [
          { id: 'a', description: { 'en-US': 'Option A' } },
          { id: 'b', description: { 'en-US': 'Option B (Correct)' } },
          { id: 'c', description: { 'en-US': 'Option C' } },
        ],
      },
    },
    result: {
      score: { scaled: 1, raw: 1, min: 0, max: 1 },
      success: true,
      completion: true,
      response: 'b',
    },
    timestamp: new Date().toISOString(),
  },
  completed: {
    actor: {
      objectType: 'Agent',
      name: 'Alex Johnson',
      account: {
        homePage: 'https://lxd360.com',
        name: 'alex.johnson',
      },
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://inspire.lxd360.com/activities/course/xapi-fundamentals',
      definition: {
        type: 'http://adlnet.gov/expapi/activities/course',
        name: { 'en-US': 'xAPI Fundamentals' },
      },
    },
    result: {
      completion: true,
      success: true,
      score: { scaled: 0.85, raw: 85, min: 0, max: 100 },
      duration: 'PT45M30S',
    },
    context: {
      registration: '12345678-1234-1234-1234-123456789012',
      extensions: {
        'https://lxd360.com/xapi/extensions/platform': 'INSPIRE Studio',
        'https://lxd360.com/xapi/extensions/language': 'en-US',
      },
    },
    timestamp: new Date().toISOString(),
  },
  video: {
    actor: {
      objectType: 'Agent',
      name: 'Sam Wilson',
      mbox: 'mailto:sam.wilson@example.com',
    },
    verb: {
      id: 'https://w3id.org/xapi/video/verbs/played',
      display: { 'en-US': 'played' },
    },
    object: {
      objectType: 'Activity',
      id: 'https://inspire.lxd360.com/activities/video/intro-video',
      definition: {
        type: 'https://w3id.org/xapi/video/activity-type/video',
        name: { 'en-US': 'Welcome Video' },
      },
    },
    context: {
      extensions: {
        'https://w3id.org/xapi/video/extensions/time': 0,
        'https://w3id.org/xapi/video/extensions/length': 180,
      },
    },
    timestamp: new Date().toISOString(),
  },
};

// =============================================================================
// JSON VIEWER COMPONENT
// =============================================================================

function JsonViewer({ data, depth = 0, className }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (value: unknown, key: string, currentDepth: number): React.ReactNode => {
    const fullKey = `${currentDepth}-${key}`;

    if (value === null) {
      return <span className="text-orange-400">null</span>;
    }

    if (value === undefined) {
      return <span className="text-zinc-500">undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-400">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-cyan-400">{value}</span>;
    }

    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return (
          <span className="text-green-400">
            &quot;<span className="underline">{value}</span>&quot;
          </span>
        );
      }
      return <span className="text-green-400">&quot;{value}&quot;</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-zinc-500">[]</span>;
      }

      const isCollapsed = collapsed[fullKey];

      return (
        <span>
          <button
            type="button"
            onClick={() => toggleCollapse(fullKey)}
            className="inline-flex items-center hover:text-blue-400"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <span className="text-zinc-500">[</span>
          {isCollapsed ? (
            <span className="text-zinc-500">...{value.length} items</span>
          ) : (
            value.map((item, index) => (
              <div key={index} style={{ marginLeft: (currentDepth + 1) * 16 }}>
                {renderValue(item, `${index}`, currentDepth + 1)}
                {index < value.length - 1 && <span className="text-zinc-500">,</span>}
              </div>
            ))
          )}
          <span className="text-zinc-500">]</span>
        </span>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);

      if (entries.length === 0) {
        return <span className="text-zinc-500">{'{}'}</span>;
      }

      const isCollapsed = collapsed[fullKey];

      return (
        <span>
          <button
            type="button"
            onClick={() => toggleCollapse(fullKey)}
            className="inline-flex items-center hover:text-blue-400"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <span className="text-zinc-500">{'{'}</span>
          {isCollapsed ? (
            <span className="text-zinc-500">...{entries.length} keys</span>
          ) : (
            entries.map(([k, v], index) => (
              <div key={k} style={{ marginLeft: (currentDepth + 1) * 16 }}>
                <span className="text-blue-300">&quot;{k}&quot;</span>
                <span className="text-zinc-500">: </span>
                {renderValue(v, k, currentDepth + 1)}
                {index < entries.length - 1 && <span className="text-zinc-500">,</span>}
              </div>
            ))
          )}
          <span className="text-zinc-500">{'}'}</span>
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className={cn('font-mono text-xs leading-relaxed', className)}>
      {renderValue(data, 'root', depth)}
    </div>
  );
}

// =============================================================================
// FORMATTED VIEW COMPONENT
// =============================================================================

interface FormattedStatementViewProps {
  statement: XAPIStatement;
}

function FormattedStatementView({ statement }: FormattedStatementViewProps) {
  const getActorDisplay = () => {
    const actor = statement.actor;
    if ('name' in actor && actor.name) {
      return actor.name;
    }
    if ('mbox' in actor && actor.mbox) {
      return actor.mbox.replace('mailto:', '');
    }
    if ('account' in actor && actor.account) {
      return `${actor.account.name}@${actor.account.homePage}`;
    }
    return 'Unknown Actor';
  };

  const getVerbDisplay = () => {
    if (statement.verb.display?.['en-US']) {
      return statement.verb.display['en-US'];
    }
    return statement.verb.id.split('/').pop() || 'Unknown Verb';
  };

  const getObjectDisplay = () => {
    if (typeof statement.object === 'object' && 'definition' in statement.object) {
      return statement.object.definition?.name?.['en-US'] || statement.object.id;
    }
    return 'Unknown Object';
  };

  return (
    <div className="space-y-4">
      {/* Statement Summary */}
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-blue-400" />
        <span className="font-medium text-zinc-200">{getActorDisplay()}</span>
        <Play className="h-4 w-4 text-green-400" />
        <span className="font-medium text-green-400">{getVerbDisplay()}</span>
        <Activity className="h-4 w-4 text-purple-400" />
        <span className="font-medium text-zinc-200 truncate max-w-[200px]">
          {getObjectDisplay()}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Actor */}
        <div className="space-y-1">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Actor</div>
          <div className="p-2 bg-white/5 rounded">
            <div className="text-zinc-300">{getActorDisplay()}</div>
            {'mbox' in statement.actor && statement.actor.mbox && (
              <div className="text-xs text-zinc-500">{statement.actor.mbox}</div>
            )}
          </div>
        </div>

        {/* Verb */}
        <div className="space-y-1">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Verb</div>
          <div className="p-2 bg-white/5 rounded">
            <div className="text-green-400">{getVerbDisplay()}</div>
            <div className="text-xs text-zinc-500 truncate">{statement.verb.id}</div>
          </div>
        </div>

        {/* Object */}
        <div className="space-y-1 col-span-2">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Object</div>
          <div className="p-2 bg-white/5 rounded">
            <div className="text-zinc-300">{getObjectDisplay()}</div>
            {typeof statement.object === 'object' && 'id' in statement.object && (
              <div className="text-xs text-zinc-500 truncate">{statement.object.id}</div>
            )}
          </div>
        </div>

        {/* Result */}
        {statement.result && (
          <div className="space-y-1 col-span-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Result</div>
            <div className="p-2 bg-white/5 rounded grid grid-cols-3 gap-2">
              {statement.result.score && (
                <div>
                  <div className="text-xs text-zinc-500">Score</div>
                  <div className="text-cyan-400">
                    {statement.result.score.scaled !== undefined
                      ? `${Math.round(statement.result.score.scaled * 100)}%`
                      : statement.result.score.raw}
                  </div>
                </div>
              )}
              {statement.result.success !== undefined && (
                <div>
                  <div className="text-xs text-zinc-500">Success</div>
                  <div className={statement.result.success ? 'text-green-400' : 'text-red-400'}>
                    {statement.result.success ? 'Yes' : 'No'}
                  </div>
                </div>
              )}
              {statement.result.completion !== undefined && (
                <div>
                  <div className="text-xs text-zinc-500">Completion</div>
                  <div className={statement.result.completion ? 'text-green-400' : 'text-zinc-400'}>
                    {statement.result.completion ? 'Complete' : 'Incomplete'}
                  </div>
                </div>
              )}
              {statement.result.duration && (
                <div>
                  <div className="text-xs text-zinc-500">Duration</div>
                  <div className="text-zinc-300">{statement.result.duration}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {statement.timestamp && (
          <div className="space-y-1 col-span-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Timestamp
            </div>
            <div className="p-2 bg-white/5 rounded text-zinc-300 text-xs font-mono">
              {new Date(statement.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function StatementPreview({
  statement,
  statements,
  showRawJson = true,
  showFormatted = true,
  className,
}: StatementPreviewProps) {
  const [selectedSample, setSelectedSample] = useState<string>('experienced');
  const [copied, setCopied] = useState(false);

  const displayStatement = statement || statements?.[0] || SAMPLE_STATEMENTS[selectedSample];
  const displayStatements = statements || (statement ? [statement] : undefined);

  const copyToClipboard = useCallback(async () => {
    const data = displayStatements || displayStatement;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayStatement, displayStatements]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sample Selector (if no statement provided) */}
      {!statement && !statements && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Sample Statement</span>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(SAMPLE_STATEMENTS).map((key) => (
              <Button
                key={key}
                variant={selectedSample === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSample(key)}
                className="capitalize"
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Statement Display */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Tabs defaultValue={showFormatted ? 'formatted' : 'json'} className="w-full">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <TabsList className="bg-transparent">
              {showFormatted && (
                <TabsTrigger value="formatted" className="gap-2">
                  <Activity className="h-3 w-3" />
                  Formatted
                </TabsTrigger>
              )}
              {showRawJson && (
                <TabsTrigger value="json" className="gap-2">
                  <FileJson className="h-3 w-3" />
                  JSON
                </TabsTrigger>
              )}
            </TabsList>

            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {showFormatted && (
            <TabsContent value="formatted" className="p-4 m-0">
              <FormattedStatementView statement={displayStatement} />
            </TabsContent>
          )}

          {showRawJson && (
            <TabsContent value="json" className="p-4 m-0 max-h-96 overflow-auto">
              <JsonViewer data={displayStatements || displayStatement} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Statement Count */}
      {displayStatements && displayStatements.length > 1 && (
        <div className="text-xs text-zinc-500 text-center">
          Showing {displayStatements.length} statements
        </div>
      )}
    </div>
  );
}

export { SAMPLE_STATEMENTS };
