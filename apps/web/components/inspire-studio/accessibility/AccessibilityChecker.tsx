'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Accessibility,
  AlertTriangle,
  ChevronRight,
  Clock,
  Download,
  FileJson,
  FileText,
  PanelRight,
  PanelRightClose,
  Play,
  RefreshCw,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { AccessibilityMarkers } from './AccessibilityMarkers';
import { AccessibilityPanel } from './AccessibilityPanel';
import { downloadEARLReport, downloadHTMLReport, generateEARLReport } from './earlReportGenerator';
import type { AxeViolation, TagFilter } from './types';
import { IMPACT_COLORS } from './types';
import { useAccessibilityAudit } from './useAccessibilityAudit';

interface AccessibilityCheckerProps {
  selector?: string;
  defaultTags?: TagFilter[];
  onClose?: () => void;
  className?: string;
  position?: 'right' | 'bottom' | 'floating';
  defaultOpen?: boolean;
}

function SummaryBadge({
  count,
  impact,
  label,
}: {
  count: number;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | 'passed';
  label: string;
}): React.JSX.Element {
  const colors =
    impact === 'passed'
      ? { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
      : IMPACT_COLORS[impact];

  return (
    <div
      className={cn('flex flex-col items-center p-2 rounded-lg border', colors.bg, colors.border)}
    >
      <span className={cn('text-lg font-bold', colors.text)}>{count}</span>
      <span className="text-[10px] text-muted-foreground capitalize">{label}</span>
    </div>
  );
}

export function AccessibilityChecker({
  selector = '#editor-content',
  defaultTags = ['wcag2aa', 'section508'],
  onClose,
  className,
  position = 'right',
  defaultOpen = true,
}: AccessibilityCheckerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showMarkers, setShowMarkers] = useState(true);
  const [highlightedSelector, setHighlightedSelector] = useState<string[] | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const {
    isRunning,
    violations,
    results,
    error,
    lastAuditTime,
    runAudit,
    clearResults,
    setTags,
    activeTags,
    violationCount,
    criticalCount,
    seriousCount,
    moderateCount,
    minorCount,
  } = useAccessibilityAudit({
    selector,
    tags: defaultTags,
    debounceMs: 1000,
    runOnMount: false,
  });

  const handleRunAudit = useCallback(async () => {
    setHighlightedSelector(null);
    await runAudit();
  }, [runAudit]);

  const handleExportEARL = useCallback(() => {
    if (!results) return;
    const report = generateEARLReport(results, {
      title: 'LXP360 Course Accessibility Report',
      commissioner: 'LXP360 Course Editor',
    });
    downloadEARLReport(report);
    setShowExportMenu(false);
  }, [results]);

  const handleExportHTML = useCallback(() => {
    if (!results) return;
    const report = generateEARLReport(results, {
      title: 'LXP360 Course Accessibility Report',
      commissioner: 'LXP360 Course Editor',
    });
    downloadHTMLReport(report);
    setShowExportMenu(false);
  }, [results]);

  const handleMarkerClick = useCallback((violation: AxeViolation, nodeIndex: number) => {
    const node = violation.nodes[nodeIndex];
    if (node) {
      setHighlightedSelector(node.target);
    }
  }, []);

  const handleHighlightElement = useCallback((selector: string[] | null) => {
    setHighlightedSelector(selector);
  }, []);

  const handleToggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const passedCount = results?.passes?.length || 0;

  // Panel positioning styles
  const panelPositionStyles = {
    right: 'fixed right-0 top-0 h-full w-96 border-l shadow-xl',
    bottom: 'fixed bottom-0 left-0 right-0 h-80 border-t shadow-xl',
    floating: 'fixed right-4 top-20 w-96 max-h-[calc(100vh-160px)] rounded-xl border shadow-2xl',
  };

  return (
    <>
      {/* Inline Markers */}
      {showMarkers && violations.length > 0 && (
        <AccessibilityMarkers
          violations={violations}
          containerSelector={selector}
          highlightedSelector={highlightedSelector}
          onMarkerClick={handleMarkerClick}
          showMarkers={showMarkers}
          showOverlay={true}
        />
      )}

      {/* Toggle Button (when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleToggleOpen}
            className={cn(
              'fixed z-50 p-3 bg-primary text-primary-foreground rounded-l-lg shadow-lg',
              'hover:bg-primary/90 transition-colors',
              position === 'right' && 'right-0 top-1/2 -translate-y-1/2',
              position === 'bottom' && 'bottom-0 right-8',
              position === 'floating' && 'right-4 top-20',
            )}
            title="Open Accessibility Checker"
          >
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              {violationCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {violationCount}
                </span>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              x: position === 'right' ? 100 : 0,
              y: position === 'bottom' ? 100 : 0,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{
              opacity: 0,
              x: position === 'right' ? 100 : 0,
              y: position === 'bottom' ? 100 : 0,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'z-50 bg-background flex flex-col',
              panelPositionStyles[position],
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Accessibility Checker</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowMarkers(!showMarkers)}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    showMarkers ? 'bg-primary/10 text-primary' : 'hover:bg-accent',
                  )}
                  title={showMarkers ? 'Hide inline markers' : 'Show inline markers'}
                >
                  {showMarkers ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRight className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleToggleOpen}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors"
                  title="Minimize"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? 'Checking...' : 'Run Check'}
              </button>

              {results && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border hover:bg-accent transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  <AnimatePresence>
                    {showExportMenu && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default bg-transparent border-none"
                          onClick={() => setShowExportMenu(false)}
                          aria-label="Close export menu"
                          tabIndex={-1}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 mt-1 w-48 bg-popover border rounded-lg shadow-lg z-20 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={handleExportEARL}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            <FileJson className="w-4 h-4" />
                            EARL Report (JSON)
                          </button>
                          <button
                            type="button"
                            onClick={handleExportHTML}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            HTML Report
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {lastAuditTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="w-3 h-3" />
                  {lastAuditTime.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Summary Stats */}
            {results && (
              <div className="grid grid-cols-5 gap-2 px-4 py-3 border-b bg-muted/20">
                <SummaryBadge count={criticalCount} impact="critical" label="Critical" />
                <SummaryBadge count={seriousCount} impact="serious" label="Serious" />
                <SummaryBadge count={moderateCount} impact="moderate" label="Moderate" />
                <SummaryBadge count={minorCount} impact="minor" label="Minor" />
                <SummaryBadge count={passedCount} impact="passed" label="Passed" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mx-4 my-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-xs text-destructive/80 mt-1">{error.message}</p>
              </div>
            )}

            {/* Results Panel */}
            <div className="flex-1 overflow-hidden px-4 py-3">
              {!results && !isRunning ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Accessibility className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No audit results yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Click "Run Check" to scan for accessibility issues
                  </p>
                </div>
              ) : (
                <AccessibilityPanel
                  violations={violations}
                  isLoading={isRunning}
                  onHighlightElement={handleHighlightElement}
                  highlightedSelector={highlightedSelector}
                  activeTags={activeTags}
                  onTagsChange={setTags}
                />
              )}
            </div>

            {/* Footer */}
            {results && (
              <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Powered by axe-core {results.testEngine?.version || ''}</span>
                  <button
                    type="button"
                    onClick={clearResults}
                    className="text-primary hover:underline"
                  >
                    Clear results
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AccessibilityChecker;
