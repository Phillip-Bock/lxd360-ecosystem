'use client';

import { AlertTriangle, CheckCircle, GitFork, MapPin, Route, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useScenarioStore } from '@/store/inspire/useScenarioStore';
import { analyzeScenarioPaths } from './PathAnalyzer';

// =============================================================================
// Dead End Validator Component
// =============================================================================

interface DeadEndValidatorProps {
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

export function DeadEndValidator({ className, onNodeClick }: DeadEndValidatorProps) {
  const scenario = useScenarioStore((state) => state.scenario);
  const setValidationIssues = useScenarioStore((state) => state.setValidationIssues);

  // Analyze paths on scenario changes
  const analysis = useMemo(() => {
    const result = analyzeScenarioPaths(scenario);

    // Update store with validation issues
    const issues = [
      ...result.deadEnds.map((nodeId) => ({
        nodeId,
        type: 'error' as const,
        message: 'Node has no exit path',
      })),
      ...result.unreachable.map((nodeId) => ({
        nodeId,
        type: 'warning' as const,
        message: 'Node is unreachable from start',
      })),
      ...result.loops.map((loop) => ({
        nodeId: loop[0],
        type: 'warning' as const,
        message: `Potential infinite loop: ${loop.join(' → ')}`,
      })),
    ];
    setValidationIssues(issues);

    return result;
  }, [scenario, setValidationIssues]);

  const hasIssues =
    analysis.deadEnds.length > 0 || analysis.unreachable.length > 0 || analysis.loops.length > 0;

  const totalPaths = analysis.paths.length;
  const successPaths = analysis.paths.filter((path) => {
    const lastNode = scenario.nodes.find((n) => n.id === path[path.length - 1]);
    return lastNode?.type === 'end_state' && lastNode.data?.outcome === 'success';
  }).length;

  return (
    <div className={cn('flex flex-col h-full bg-lxd-dark-bg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-lxd-dark-border">
        <div className="flex items-center gap-2">
          {hasIssues ? (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          <h3 className="text-sm font-semibold text-white">Scenario Validation</h3>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-lxd-dark-border">
        <StatCard icon={Route} label="Total Paths" value={totalPaths} color="text-lxd-cyan" />
        <StatCard
          icon={CheckCircle}
          label="Success Paths"
          value={successPaths}
          color="text-green-400"
        />
        <StatCard
          icon={XCircle}
          label="Issues"
          value={analysis.deadEnds.length + analysis.unreachable.length}
          color={hasIssues ? 'text-red-400' : 'text-white/40'}
        />
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Dead Ends */}
        {analysis.deadEnds.length > 0 && (
          <IssueSection
            title="Dead Ends"
            icon={XCircle}
            iconColor="text-red-400"
            description="Nodes with no exit path (not marked as End State)"
          >
            {analysis.deadEnds.map((nodeId) => {
              const node = scenario.nodes.find((n) => n.id === nodeId);
              return (
                <IssueItem
                  key={nodeId}
                  nodeId={nodeId}
                  label={node?.data?.label ?? node?.type ?? 'Unknown'}
                  type={node?.type ?? 'unknown'}
                  severity="error"
                  onClick={() => onNodeClick?.(nodeId)}
                />
              );
            })}
          </IssueSection>
        )}

        {/* Unreachable Nodes */}
        {analysis.unreachable.length > 0 && (
          <IssueSection
            title="Unreachable Nodes"
            icon={MapPin}
            iconColor="text-yellow-400"
            description="Nodes not connected to the start node"
          >
            {analysis.unreachable.map((nodeId) => {
              const node = scenario.nodes.find((n) => n.id === nodeId);
              return (
                <IssueItem
                  key={nodeId}
                  nodeId={nodeId}
                  label={node?.data?.label ?? node?.type ?? 'Unknown'}
                  type={node?.type ?? 'unknown'}
                  severity="warning"
                  onClick={() => onNodeClick?.(nodeId)}
                />
              );
            })}
          </IssueSection>
        )}

        {/* Loops */}
        {analysis.loops.length > 0 && (
          <IssueSection
            title="Potential Loops"
            icon={GitFork}
            iconColor="text-orange-400"
            description="Circular paths that may cause infinite loops"
          >
            {analysis.loops.map((loop, index) => (
              <div
                key={index}
                className="p-2 rounded bg-orange-500/10 border border-orange-500/30 text-xs"
              >
                <div className="flex items-center gap-1 text-orange-300 font-mono">
                  {loop.map((nodeId, i) => (
                    <span key={nodeId}>
                      {i > 0 && <span className="text-orange-400/50"> → </span>}
                      <button
                        type="button"
                        onClick={() => onNodeClick?.(nodeId)}
                        className="hover:underline"
                      >
                        {nodeId.slice(0, 8)}
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </IssueSection>
        )}

        {/* All Clear */}
        {!hasIssues && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-white">All Clear!</p>
            <p className="text-xs text-white/50 mt-1">No dead ends or unreachable nodes detected</p>
          </div>
        )}
      </div>

      {/* Path Summary */}
      {totalPaths > 0 && (
        <div className="p-4 border-t border-lxd-dark-border bg-lxd-dark-surface/50">
          <p className="text-xs text-white/60 mb-2">Path Summary</p>
          <div className="text-xs space-y-1">
            {analysis.paths.slice(0, 5).map((path, index) => {
              const lastNode = scenario.nodes.find((n) => n.id === path[path.length - 1]);
              const outcome = lastNode?.data?.outcome ?? 'unknown';
              return (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white/40">Path {index + 1}:</span>
                  <span className="font-mono text-white/60">{path.length} steps</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px]',
                      outcome === 'success' && 'bg-green-500/20 text-green-400',
                      outcome === 'failure' && 'bg-red-500/20 text-red-400',
                      outcome === 'neutral' && 'bg-gray-500/20 text-gray-400',
                    )}
                  >
                    {outcome}
                  </span>
                </div>
              );
            })}
            {totalPaths > 5 && <p className="text-white/30">...and {totalPaths - 5} more paths</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Sub Components
// =============================================================================

interface StatCardProps {
  icon: typeof Route;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="p-2 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border text-center">
      <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}

interface IssueSectionProps {
  title: string;
  icon: typeof XCircle;
  iconColor: string;
  description: string;
  children: React.ReactNode;
}

function IssueSection({ title, icon: Icon, iconColor, description, children }: IssueSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', iconColor)} />
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-[10px] text-white/40">{description}</p>
        </div>
      </div>
      <div className="space-y-1 ml-6">{children}</div>
    </div>
  );
}

interface IssueItemProps {
  nodeId: string;
  label: string;
  type: string;
  severity: 'error' | 'warning';
  onClick?: () => void;
}

function IssueItem({ nodeId, label, type, severity, onClick }: IssueItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 p-2 rounded text-left transition-colors',
        severity === 'error'
          ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
          : 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{label}</p>
        <p className="text-[10px] font-mono text-white/40 truncate">{nodeId.slice(0, 8)}...</p>
      </div>
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded uppercase',
          severity === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400',
        )}
      >
        {type.replace('_', ' ')}
      </span>
    </button>
  );
}

export { analyzeScenarioPaths, type PathAnalysis } from './PathAnalyzer';
export { TrapDetector } from './TrapDetector';
export default DeadEndValidator;
