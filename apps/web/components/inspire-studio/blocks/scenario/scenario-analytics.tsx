'use client';

import { motion } from 'framer-motion';
import {
  BarChart2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  GitBranch,
  Info,
  type LucideIcon,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { ScenarioConfig } from '@/types/blocks';

interface ScenarioAnalyticsProps {
  config: ScenarioConfig;
  analytics?: ScenarioAnalyticsData;
  onRefresh?: () => void;
  onExport?: () => void;
}

export interface ScenarioAnalyticsData {
  totalAttempts: number;
  uniqueUsers: number;
  completionRate: number;
  averageScore: number;
  averageTime: number;
  pathData: PathAnalytics[];
  decisionData: DecisionAnalytics[];
  endingData: EndingAnalytics[];
  timeSeriesData?: TimeSeriesPoint[];
}

interface PathAnalytics {
  pathId: string;
  nodeIds: string[];
  count: number;
  percentage: number;
  averageScore: number;
}

interface DecisionAnalytics {
  nodeId: string;
  nodeTitle: string;
  options: {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
  }[];
}

interface EndingAnalytics {
  nodeId: string;
  endType: 'complete' | 'fail' | 'partial';
  count: number;
  percentage: number;
  averageScore: number;
}

interface TimeSeriesPoint {
  date: string;
  attempts: number;
  completions: number;
}

// Generate mock analytics for preview
function generateMockAnalytics(config: ScenarioConfig): ScenarioAnalyticsData {
  const decisions = config.nodes.filter((n) => n.type === 'decision' || n.type === 'question');
  const endings = config.nodes.filter((n) => n.type === 'end');

  return {
    totalAttempts: 1247,
    uniqueUsers: 892,
    completionRate: 78.5,
    averageScore: 82,
    averageTime: 324,
    pathData: [
      {
        pathId: 'path-1',
        nodeIds: [],
        count: 523,
        percentage: 42,
        averageScore: 95,
      },
      {
        pathId: 'path-2',
        nodeIds: [],
        count: 312,
        percentage: 25,
        averageScore: 78,
      },
      {
        pathId: 'path-3',
        nodeIds: [],
        count: 234,
        percentage: 19,
        averageScore: 65,
      },
      {
        pathId: 'path-4',
        nodeIds: [],
        count: 178,
        percentage: 14,
        averageScore: 45,
      },
    ],
    decisionData: decisions.map((node) => ({
      nodeId: node.id,
      nodeTitle: node.data.title || node.data.label || `Decision ${node.id.slice(-4)}`,
      options: (node.data.options || []).map((opt: unknown, idx: number) => ({
        optionId: (opt && typeof opt === 'object' && 'id' in opt ? opt.id : `opt-${idx}`) as string,
        optionText: (opt && typeof opt === 'object' && 'text' in opt
          ? opt.text
          : `Option ${idx + 1}`) as string,
        count: Math.floor(Math.random() * 500) + 100,
        percentage: Math.floor(Math.random() * 40) + 10,
      })),
    })),
    endingData: endings.map((node) => {
      const rawEndType: string = node.data.endType || 'complete';
      let endType: 'complete' | 'fail' | 'partial' = 'complete';

      if (rawEndType === 'fail') {
        endType = 'fail';
      } else if (rawEndType === 'partial') {
        endType = 'partial';
      } else {
        // 'complete', 'restart', 'redirect' all map to 'complete'
        endType = 'complete';
      }

      return {
        nodeId: node.id,
        endType,
        count: Math.floor(Math.random() * 400) + 50,
        percentage: Math.floor(Math.random() * 30) + 10,
        averageScore: Math.floor(Math.random() * 50) + 50,
      };
    }),
    timeSeriesData: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      attempts: Math.floor(Math.random() * 100) + 50,
      completions: Math.floor(Math.random() * 80) + 30,
    })),
  };
}

/**
 * ScenarioAnalytics - Analytics visualization component
 */
export function ScenarioAnalytics({
  config,
  analytics,
  onRefresh,
  onExport,
}: ScenarioAnalyticsProps): React.JSX.Element {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'decisions']);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Use provided analytics or generate mock data
  const data = useMemo(() => {
    return analytics || generateMockAnalytics(config);
  }, [analytics, config]);

  // Toggle section expansion
  const toggleSection = (section: string): void => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-primary">Scenario Analytics</h2>
          <p className="text-sm text-studio-text-muted">{config.title || 'Untitled Scenario'}</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 text-studio-text-muted hover:text-brand-primary transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-studio-surface/50 hover:bg-studio-surface text-studio-text rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('overview')}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          {expandedSections.includes('overview') ? (
            <ChevronDown className="w-5 h-5 text-studio-text-muted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-studio-text-muted" />
          )}
          <h3 className="text-lg font-semibold text-brand-primary">Overview</h3>
        </button>

        {expandedSections.includes('overview') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              icon={Users}
              label="Total Attempts"
              value={data.totalAttempts.toLocaleString()}
              subValue={`${data.uniqueUsers.toLocaleString()} unique users`}
              color="var(--color-studio-accent)"
            />
            <StatCard
              icon={Target}
              label="Completion Rate"
              value={`${data.completionRate}%`}
              subValue={data.completionRate >= 70 ? 'Above target' : 'Below target'}
              color={data.completionRate >= 70 ? 'rgb(34 197 94)' : 'rgb(239 68 68)'}
              trend={data.completionRate >= 70 ? 'up' : 'down'}
            />
            <StatCard
              icon={BarChart2}
              label="Average Score"
              value={`${data.averageScore}/100`}
              subValue="Across all completions"
              color="var(--color-block-scenario)"
            />
            <StatCard
              icon={Clock}
              label="Average Time"
              value={formatTime(data.averageTime)}
              subValue="Per completion"
              color="rgb(245 158 11)"
            />
          </motion.div>
        )}
      </section>

      {/* Path Distribution */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('paths')}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          {expandedSections.includes('paths') ? (
            <ChevronDown className="w-5 h-5 text-studio-text-muted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-studio-text-muted" />
          )}
          <h3 className="text-lg font-semibold text-brand-primary">Path Distribution</h3>
        </button>

        {expandedSections.includes('paths') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-studio-bg rounded-xl p-4 border border-studio-surface/30"
          >
            <div className="space-y-4">
              {data.pathData.map((path, index) => (
                <button
                  type="button"
                  key={path.pathId}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-colors cursor-pointer
                    ${
                      selectedPath === path.pathId
                        ? 'bg-(--color-block-scenario)/10 border-(--color-block-scenario)/30'
                        : 'bg-studio-bg-dark border-studio-surface/30 hover:border-studio-surface'
                    }
                  `}
                  onClick={() => setSelectedPath(selectedPath === path.pathId ? null : path.pathId)}
                  aria-pressed={selectedPath === path.pathId}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-studio-text-muted" />
                      <span className="font-medium text-brand-primary">Path {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-studio-text-muted">{path.count} users</span>
                      <span className="text-(--color-block-scenario) font-medium">
                        {path.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-studio-surface rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-linear-to-r from-(--color-block-scenario) to-studio-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${path.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-studio-text-muted">
                    Avg. Score: <span className="text-brand-primary">{path.averageScore}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Most popular path indicator */}
            <div className="mt-4 p-3 bg-brand-success/10 border border-brand-success/30 rounded-lg flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-brand-success" />
              <div>
                <p className="text-sm text-brand-success font-medium">Most Popular Path</p>
                <p className="text-xs text-studio-text-muted">
                  Path 1 leads to the highest completion rate and score
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Decision Analytics */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('decisions')}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          {expandedSections.includes('decisions') ? (
            <ChevronDown className="w-5 h-5 text-studio-text-muted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-studio-text-muted" />
          )}
          <h3 className="text-lg font-semibold text-brand-primary">Decision Points</h3>
        </button>

        {expandedSections.includes('decisions') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {data.decisionData.length === 0 ? (
              <div className="text-center py-8 text-studio-text-muted">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p>No decision points found in this scenario</p>
              </div>
            ) : (
              data.decisionData.map((decision) => (
                <div
                  key={decision.nodeId}
                  className="bg-studio-bg rounded-xl p-4 border border-studio-surface/30"
                >
                  <h4 className="font-medium text-brand-primary mb-4">{decision.nodeTitle}</h4>
                  <div className="space-y-3">
                    {decision.options.map((option, optIndex) => (
                      <div key={option.optionId}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-studio-text flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-studio-surface flex items-center justify-center text-xs">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            {option.optionText}
                          </span>
                          <span className="text-studio-text-muted">
                            {option.count} ({option.percentage}%)
                          </span>
                        </div>
                        <div className="relative h-2 bg-studio-surface rounded-full overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              backgroundColor: `hsl(${260 + optIndex * 30}, 70%, 60%)`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${option.percentage}%` }}
                            transition={{ duration: 0.5, delay: optIndex * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </section>

      {/* Ending Distribution */}
      <section>
        <button
          type="button"
          onClick={() => toggleSection('endings')}
          className="flex items-center gap-2 w-full text-left mb-4"
        >
          {expandedSections.includes('endings') ? (
            <ChevronDown className="w-5 h-5 text-studio-text-muted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-studio-text-muted" />
          )}
          <h3 className="text-lg font-semibold text-brand-primary">Endings</h3>
        </button>

        {expandedSections.includes('endings') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-studio-bg rounded-xl p-4 border border-studio-surface/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.endingData.map((ending) => {
                const colors = {
                  complete: {
                    bg: 'bg-brand-success/10',
                    border: 'border-brand-success/30',
                    text: 'text-brand-success',
                    icon: CheckCircle,
                  },
                  fail: {
                    bg: 'bg-brand-error/10',
                    border: 'border-brand-error/30',
                    text: 'text-brand-error',
                    icon: XCircle,
                  },
                  partial: {
                    bg: 'bg-brand-warning/10',
                    border: 'border-amber-500/30',
                    text: 'text-brand-warning',
                    icon: TrendingDown,
                  },
                };
                const color = colors[ending.endType] || colors.partial;
                const Icon = color.icon;

                return (
                  <div
                    key={ending.nodeId}
                    className={`p-4 rounded-lg ${color.bg} border ${color.border}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 ${color.text}`} />
                      <span className={`font-medium ${color.text} capitalize`}>
                        {ending.endType}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-studio-text-muted">Users</span>
                        <span className="text-brand-primary">{ending.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-studio-text-muted">Percentage</span>
                        <span className="text-brand-primary">{ending.percentage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-studio-text-muted">Avg. Score</span>
                        <span className="text-brand-primary">{ending.averageScore}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.endingData.length === 0 && (
              <div className="text-center py-8 text-studio-text-muted">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p>No end nodes found in this scenario</p>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Time Series (if available) */}
      {data.timeSeriesData && (
        <section>
          <button
            type="button"
            onClick={() => toggleSection('timeseries')}
            className="flex items-center gap-2 w-full text-left mb-4"
          >
            {expandedSections.includes('timeseries') ? (
              <ChevronDown className="w-5 h-5 text-studio-text-muted" />
            ) : (
              <ChevronRight className="w-5 h-5 text-studio-text-muted" />
            )}
            <h3 className="text-lg font-semibold text-brand-primary">Activity Over Time</h3>
          </button>

          {expandedSections.includes('timeseries') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-studio-bg rounded-xl p-4 border border-studio-surface/30"
            >
              <div className="h-48 flex items-end gap-2">
                {data.timeSeriesData.map((point, index) => {
                  const maxAttempts = Math.max(
                    ...(data.timeSeriesData ?? []).map((p) => p.attempts),
                  );
                  const attemptHeight = (point.attempts / maxAttempts) * 100;
                  const completionHeight = (point.completions / maxAttempts) * 100;

                  return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-1 items-end h-40">
                        <motion.div
                          className="flex-1 bg-studio-accent/50 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${attemptHeight}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          title={`${point.attempts} attempts`}
                        />
                        <motion.div
                          className="flex-1 bg-brand-success/50 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${completionHeight}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                          title={`${point.completions} completions`}
                        />
                      </div>
                      <span className="text-[10px] text-studio-text-muted">
                        {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-studio-accent/50" />
                  <span className="text-studio-text-muted">Attempts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-brand-success/50" />
                  <span className="text-studio-text-muted">Completions</span>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      )}

      {/* Insights */}
      <section className="bg-linear-to-r from-(--color-block-scenario)/10 to-studio-accent/10 rounded-xl p-4 border border-(--color-block-scenario)/20">
        <h3 className="text-lg font-semibold text-brand-primary mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-(--color-block-scenario)" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
            <span className="text-studio-text">
              Completion rate of{' '}
              <span className="text-brand-primary font-medium">{data.completionRate}%</span> is{' '}
              {data.completionRate >= 70 ? 'above' : 'below'} the 70% benchmark
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            <span className="text-studio-text">
              Most users ({data.pathData[0]?.percentage || 0}%) take the primary path through the
              scenario
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
            <span className="text-studio-text">
              Average completion time of{' '}
              <span className="text-brand-primary font-medium">{formatTime(data.averageTime)}</span>{' '}
              {data.averageTime > 300
                ? 'suggests thorough engagement'
                : 'indicates quick progression'}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue: string;
  color: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-studio-bg rounded-xl p-4 border border-studio-surface/30">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend &&
          (trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-brand-success ml-auto" />
          ) : (
            <TrendingDown className="w-4 h-4 text-brand-error ml-auto" />
          ))}
      </div>
      <p className="text-2xl font-bold text-brand-primary">{value}</p>
      <p className="text-xs text-studio-text-muted">{label}</p>
      <p className="text-xs text-studio-text-muted mt-1">{subValue}</p>
    </div>
  );
}

export default ScenarioAnalytics;
