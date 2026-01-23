'use client';

export const dynamic = 'force-dynamic';

import { ChevronDown, Download, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock statements data - TODO: Replace with LRS queries
const statementsData = [
  {
    id: 'stmt-1',
    actor: { name: 'John Smith', mbox: 'mailto:john.smith@acme.com' },
    verb: { id: 'http://adlnet.gov/expapi/verbs/completed', display: 'completed' },
    object: { id: 'https://lxd360.com/courses/leadership/module-3', name: 'Module 3 Assessment' },
    result: { score: { scaled: 0.92 }, success: true },
    timestamp: '2024-01-15T10:30:00Z',
    context: { extensions: { cognitiveLoad: 6.5, latency: 45000 } },
  },
  {
    id: 'stmt-2',
    actor: { name: 'Sarah Johnson', mbox: 'mailto:sarah.johnson@acme.com' },
    verb: { id: 'http://adlnet.gov/expapi/verbs/answered', display: 'answered' },
    object: { id: 'https://lxd360.com/courses/safety/quiz-1/q5', name: 'Question 5' },
    result: { score: { scaled: 1.0 }, success: true },
    timestamp: '2024-01-15T10:28:00Z',
    context: { extensions: { cognitiveLoad: 4.2, latency: 12000 } },
  },
  {
    id: 'stmt-3',
    actor: { name: 'Mike Davis', mbox: 'mailto:mike.davis@globalind.com' },
    verb: { id: 'http://adlnet.gov/expapi/verbs/launched', display: 'launched' },
    object: { id: 'https://lxd360.com/courses/analytics', name: 'Data Analytics Course' },
    result: null,
    timestamp: '2024-01-15T10:25:00Z',
    context: { extensions: {} },
  },
  {
    id: 'stmt-4',
    actor: { name: 'Emily Brown', mbox: 'mailto:emily.brown@techstart.io' },
    verb: { id: 'http://adlnet.gov/expapi/verbs/progressed', display: 'progressed' },
    object: { id: 'https://lxd360.com/courses/leadership/module-2', name: 'Leadership Module 2' },
    result: { extensions: { progress: 0.65 } },
    timestamp: '2024-01-15T10:22:00Z',
    context: { extensions: { cognitiveLoad: 5.1 } },
  },
  {
    id: 'stmt-5',
    actor: { name: 'David Wilson', mbox: 'mailto:david.wilson@acme.com' },
    verb: { id: 'http://adlnet.gov/expapi/verbs/failed', display: 'failed' },
    object: {
      id: 'https://lxd360.com/courses/compliance/assessment',
      name: 'Compliance Assessment',
    },
    result: { score: { scaled: 0.58 }, success: false },
    timestamp: '2024-01-15T10:18:00Z',
    context: { extensions: { cognitiveLoad: 8.2, latency: 120000 } },
  },
];

/**
 * Statement Browser - Browse and filter xAPI statements
 */
export default function StatementBrowserPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [verbFilter, setVerbFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredStatements = statementsData.filter((stmt) => {
    const matchesSearch =
      stmt.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stmt.object.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerb = verbFilter === 'all' || stmt.verb.display === verbFilter;
    return matchesSearch && matchesVerb;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Statement Browser</h1>
          <p className="text-muted-foreground mt-1">Browse and inspect xAPI statements</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" aria-hidden="true" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by actor or object..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary placeholder-muted-foreground focus:outline-hidden focus:border-lxd-purple/50"
                aria-label="Search statements"
              />
            </div>

            {/* Verb filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <select
                value={verbFilter}
                onChange={(e) => setVerbFilter(e.target.value)}
                className="w-full sm:w-40 pl-10 pr-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary appearance-none cursor-pointer"
                aria-label="Filter by verb"
              >
                <option value="all">All Verbs</option>
                <option value="completed">Completed</option>
                <option value="answered">Answered</option>
                <option value="launched">Launched</option>
                <option value="progressed">Progressed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredStatements.length} statements
      </p>

      {/* Statements List */}
      <div className="space-y-3">
        {filteredStatements.map((stmt) => (
          <Card
            key={stmt.id}
            className="bg-lxd-dark-surface border-lxd-dark-border overflow-hidden"
          >
            <button
              type="button"
              className="w-full text-left p-4 cursor-pointer hover:bg-lxd-dark-bg/30 transition-colors"
              onClick={() => setExpandedId(expandedId === stmt.id ? null : stmt.id)}
              aria-expanded={expandedId === stmt.id}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded-full capitalize',
                      stmt.verb.display === 'completed' && 'bg-green-500/20 text-green-400',
                      stmt.verb.display === 'answered' && 'bg-blue-500/20 text-blue-400',
                      stmt.verb.display === 'launched' && 'bg-purple-500/20 text-purple-400',
                      stmt.verb.display === 'progressed' && 'bg-yellow-500/20 text-yellow-400',
                      stmt.verb.display === 'failed' && 'bg-red-500/20 text-red-400',
                    )}
                  >
                    {stmt.verb.display}
                  </span>
                  <div>
                    <p className="text-sm text-brand-primary">
                      <span className="font-medium">{stmt.actor.name}</span>{' '}
                      <span className="text-muted-foreground">{stmt.verb.display}</span>{' '}
                      <span className="font-medium">{stmt.object.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(stmt.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {stmt.result?.score && (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        stmt.result.success ? 'text-green-400' : 'text-red-400',
                      )}
                    >
                      {Math.round(stmt.result.score.scaled * 100)}%
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      expandedId === stmt.id && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedId === stmt.id && (
              <div className="p-4 border-t border-lxd-dark-border bg-lxd-dark-bg/50">
                <pre className="text-xs text-brand-primary overflow-x-auto">
                  {JSON.stringify(stmt, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
