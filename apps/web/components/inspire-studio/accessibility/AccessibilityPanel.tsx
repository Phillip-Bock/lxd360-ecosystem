'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Info,
  Lightbulb,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { AxeNodeResult, AxeViolation, TagFilter, ViolationImpact } from './types';
import { IMPACT_COLORS, TAG_LABELS } from './types';

interface AccessibilityPanelProps {
  violations: AxeViolation[];
  isLoading?: boolean;
  onHighlightElement?: (selector: string[] | null) => void;
  highlightedSelector?: string[] | null;
  activeTags: TagFilter[];
  onTagsChange: (tags: TagFilter[]) => void;
  className?: string;
}

const IMPACT_ICONS: Record<ViolationImpact, typeof AlertCircle> = {
  critical: AlertOctagon,
  serious: AlertTriangle,
  moderate: AlertCircle,
  minor: Info,
};

function SeverityBadge({ impact }: { impact: ViolationImpact }): React.JSX.Element {
  const colors = IMPACT_COLORS[impact];
  const Icon = IMPACT_ICONS[impact];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="capitalize">{impact}</span>
    </span>
  );
}

function ViolationNode({
  node,
  onHighlight,
  isHighlighted,
}: {
  node: AxeNodeResult;
  onHighlight: (selector: string[] | null) => void;
  isHighlighted: boolean;
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(node.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [node.html]);

  const handleToggleHighlight = useCallback((): void => {
    onHighlight(isHighlighted ? null : node.target);
  }, [isHighlighted, node.target, onHighlight]);

  return (
    <div
      className={cn(
        'border rounded-md p-3 bg-muted/30 transition-colors',
        isHighlighted && 'ring-2 ring-primary border-primary',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <code className="text-xs text-muted-foreground font-mono">{node.target.join(' > ')}</code>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToggleHighlight}
            className={cn(
              'p-1 rounded hover:bg-accent transition-colors',
              isHighlighted && 'bg-primary/10 text-primary',
            )}
            title={isHighlighted ? 'Remove highlight' : 'Highlight element'}
          >
            {isHighlighted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-accent transition-colors"
            title="Copy HTML"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <pre className="text-xs bg-background/50 p-2 rounded border overflow-x-auto max-h-24">
        <code>{node.html}</code>
      </pre>

      {node.failureSummary && (
        <div className="mt-2 flex items-start gap-2 text-xs">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-muted-foreground">
            <strong className="text-foreground">Fix suggestion:</strong>
            <p className="mt-0.5 whitespace-pre-wrap">{node.failureSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ViolationItem({
  violation,
  onHighlightElement,
  highlightedSelector,
}: {
  violation: AxeViolation;
  onHighlightElement?: (selector: string[] | null) => void;
  highlightedSelector?: string[] | null;
}): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHighlight = useCallback(
    (selector: string[] | null): void => {
      onHighlightElement?.(selector);
    },
    [onHighlightElement],
  );

  const isNodeHighlighted = (target: string[]): boolean => {
    return highlightedSelector?.join() === target.join();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left"
      >
        <span className="mt-0.5 shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge impact={violation.impact} />
            <span className="text-sm font-medium">{violation.help}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{violation.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="bg-muted px-1.5 py-0.5 rounded">
              {violation.nodes.length} element{violation.nodes.length !== 1 ? 's' : ''} affected
            </span>
            <a
              href={violation.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Learn more <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t bg-muted/20 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Tags:</span>
                {violation.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 bg-background border rounded">
                    {tag}
                  </span>
                ))}
                {violation.tags.length > 6 && (
                  <span className="text-xs text-muted-foreground">
                    +{violation.tags.length - 6} more
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Affected Elements:</h4>
                {violation.nodes.map((node, index) => (
                  <ViolationNode
                    key={`${violation.id}-${index}`}
                    node={node}
                    onHighlight={handleHighlight}
                    isHighlighted={isNodeHighlighted(node.target)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TagFilterDropdown({
  activeTags,
  onTagsChange,
}: {
  activeTags: TagFilter[];
  onTagsChange: (tags: TagFilter[]) => void;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const allTags: TagFilter[] = [
    'wcag2aa',
    'wcag21aa',
    'wcag22aa',
    'section508',
    'wcag2a',
    'wcag2aaa',
    'best-practice',
  ];

  const toggleTag = (tag: TagFilter): void => {
    if (activeTags.includes(tag)) {
      onTagsChange(activeTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...activeTags, tag]);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors',
          isOpen ? 'bg-accent border-primary' : 'hover:bg-accent',
        )}
      >
        <Filter className="w-3.5 h-3.5" />
        Standards
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setIsOpen(false)}
              aria-label="Close dropdown"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-1 w-52 bg-popover border rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {allTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
                      activeTags.includes(tag) ? 'bg-primary/10 text-primary' : 'hover:bg-accent',
                    )}
                  >
                    <span
                      className={cn(
                        'w-3.5 h-3.5 rounded border-2 flex items-center justify-center',
                        activeTags.includes(tag)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground',
                      )}
                    >
                      {activeTags.includes(tag) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      )}
                    </span>
                    {TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AccessibilityPanel({
  violations,
  isLoading = false,
  onHighlightElement,
  highlightedSelector,
  activeTags,
  onTagsChange,
  className,
}: AccessibilityPanelProps): React.JSX.Element {
  const [filterImpact, setFilterImpact] = useState<ViolationImpact | 'all'>('all');

  const filteredViolations =
    filterImpact === 'all' ? violations : violations.filter((v) => v.impact === filterImpact);

  const impactCounts = violations.reduce(
    (acc, v) => {
      acc[v.impact] = (acc[v.impact] || 0) + 1;
      return acc;
    },
    {} as Record<ViolationImpact, number>,
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b mb-3">
        <h3 className="font-semibold text-sm">
          Accessibility Issues
          {violations.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({filteredViolations.length})
            </span>
          )}
        </h3>
        <TagFilterDropdown activeTags={activeTags} onTagsChange={onTagsChange} />
      </div>

      {/* Impact Filter Pills */}
      {violations.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <button
            type="button"
            onClick={() => setFilterImpact('all')}
            className={cn(
              'px-2 py-1 text-xs rounded-full border transition-colors',
              filterImpact === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-accent',
            )}
          >
            All ({violations.length})
          </button>
          {(['critical', 'serious', 'moderate', 'minor'] as ViolationImpact[]).map((impact) =>
            impactCounts[impact] ? (
              <button
                type="button"
                key={impact}
                onClick={() => setFilterImpact(impact)}
                className={cn(
                  'px-2 py-1 text-xs rounded-full border transition-colors capitalize',
                  filterImpact === impact
                    ? cn(
                        IMPACT_COLORS[impact].bg,
                        IMPACT_COLORS[impact].text,
                        IMPACT_COLORS[impact].border,
                      )
                    : 'hover:bg-accent',
                )}
              >
                {impact} ({impactCounts[impact]})
              </button>
            ) : null,
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Running accessibility check...</span>
            </div>
          </div>
        ) : filteredViolations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {violations.length === 0 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-700">No issues found!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your content passes the selected accessibility standards.
                </p>
              </>
            ) : (
              <>
                <Info className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No {filterImpact} issues to display.
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredViolations.map((violation) => (
              <ViolationItem
                key={violation.id}
                violation={violation}
                onHighlightElement={onHighlightElement}
                highlightedSelector={highlightedSelector}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default AccessibilityPanel;
