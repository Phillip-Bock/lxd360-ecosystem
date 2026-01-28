'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApprovalCard, ApprovalModal } from '@/components/ignite/approvals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { approveEnrollment } from '@/lib/actions/enrollments';
import { cn } from '@/lib/utils';
import type { PendingApproval } from '@/types/lms/enrollment';

// ============================================================================
// TYPES
// ============================================================================

type ModalMode = 'approve' | 'reject' | 'bulk-approve' | 'bulk-reject';

interface ApprovalStats {
  total: number;
  urgent: number;
  today: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateStats(approvals: PendingApproval[]): ApprovalStats {
  return approvals.reduce(
    (stats, a) => {
      stats.total++;
      if (a.daysWaiting >= 7) stats.urgent++;
      if (a.daysWaiting === 0) stats.today++;
      return stats;
    },
    { total: 0, urgent: 0, today: 0 },
  );
}

// Get Firebase ID token
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

// ============================================================================
// STATS CARDS
// ============================================================================

function StatsCard({
  title,
  value,
  icon: Icon,
  variant,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  variant: 'default' | 'warning' | 'success';
}) {
  const variantStyles = {
    default: 'bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)]',
    warning: 'bg-[var(--color-lxd-error)]/10 text-[var(--color-lxd-error)]',
    success: 'bg-[var(--color-lxd-success)]/10 text-[var(--color-lxd-success)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            </div>
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                variantStyles[variant],
              )}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--color-lxd-success)]/10 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-[var(--color-lxd-success)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
      <p className="text-muted-foreground max-w-sm">
        There are no pending enrollment requests to review. New requests will appear here when
        learners apply for courses.
      </p>
    </motion.div>
  );
}

// ============================================================================
// LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2
        className="w-8 h-8 animate-spin text-[var(--color-lxd-primary)]"
        aria-hidden="true"
      />
      <p className="text-muted-foreground mt-4">Loading pending approvals...</p>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-lxd-error)]/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-[var(--color-lxd-error)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load approvals</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{message}</p>
      <Button type="button" onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
        Try Again
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ApprovalsPage() {
  const toast = useToast();

  // State
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('approve');
  const [modalApprovals, setModalApprovals] = useState<PendingApproval[]>([]);

  // Fetch pending approvals
  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ignite/enrollments/pending', {
        headers: {
          Authorization: `Bearer ${await getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      const data = await response.json();
      setApprovals(data.pendingApprovals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Filter approvals
  const filteredApprovals = useMemo(() => {
    if (!searchQuery.trim()) return approvals;

    const query = searchQuery.toLowerCase();
    return approvals.filter((a) => {
      const learnerName = a.enrollment.learnerName?.toLowerCase() || '';
      const learnerEmail = a.enrollment.learnerEmail?.toLowerCase() || '';
      const courseName = a.enrollment.courseName?.toLowerCase() || '';
      return (
        learnerName.includes(query) || learnerEmail.includes(query) || courseName.includes(query)
      );
    });
  }, [approvals, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => calculateStats(approvals), [approvals]);

  // Selection handlers
  const toggleSelection = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredApprovals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApprovals.map((a) => a.enrollment.id)));
    }
  }, [filteredApprovals, selectedIds.size]);

  // Modal handlers
  const openModal = useCallback((mode: ModalMode, items: PendingApproval[]) => {
    setModalMode(mode);
    setModalApprovals(items);
    setModalOpen(true);
  }, []);

  const handleSingleApprove = useCallback(
    (approval: PendingApproval) => {
      openModal('approve', [approval]);
    },
    [openModal],
  );

  const handleSingleReject = useCallback(
    (approval: PendingApproval) => {
      openModal('reject', [approval]);
    },
    [openModal],
  );

  const handleBulkApprove = useCallback(() => {
    const selected = filteredApprovals.filter((a) => selectedIds.has(a.enrollment.id));
    if (selected.length > 0) {
      openModal('bulk-approve', selected);
    }
  }, [filteredApprovals, selectedIds, openModal]);

  const handleBulkReject = useCallback(() => {
    const selected = filteredApprovals.filter((a) => selectedIds.has(a.enrollment.id));
    if (selected.length > 0) {
      openModal('bulk-reject', selected);
    }
  }, [filteredApprovals, selectedIds, openModal]);

  // Process approval/rejection
  const handleConfirm = useCallback(
    async (data: { approved: boolean; reason?: string }) => {
      const ids = modalApprovals.map((a) => a.enrollment.id);
      setProcessingIds((prev) => new Set([...prev, ...ids]));

      try {
        const results = await Promise.all(
          ids.map((id) => approveEnrollment(id, data.approved, data.reason)),
        );

        const errors = results.filter((r): r is { error: string } => 'error' in r);
        const successes = results.filter((r): r is { data: { status: string } } => 'data' in r);

        if (successes.length > 0) {
          toast.success({
            title: data.approved ? 'Enrollment(s) Approved' : 'Enrollment(s) Denied',
            description: `Successfully processed ${successes.length} enrollment request(s).`,
          });

          // Remove processed approvals from list
          setApprovals((prev) => prev.filter((a) => !ids.includes(a.enrollment.id)));
          setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const id of ids) {
              next.delete(id);
            }
            return next;
          });
        }

        if (errors.length > 0) {
          toast.error({
            title: 'Some requests failed',
            description: `${errors.length} request(s) could not be processed.`,
          });
        }
      } catch (err) {
        toast.error({
          title: 'Error',
          description: err instanceof Error ? err.message : 'An error occurred',
        });
        throw err;
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) {
            next.delete(id);
          }
          return next;
        });
      }
    },
    [modalApprovals, toast],
  );

  // Check if all filtered are selected
  const allSelected = filteredApprovals.length > 0 && selectedIds.size === filteredApprovals.length;
  const someSelected = selectedIds.size > 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enrollment Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending enrollment requests from learners
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Pending Requests" value={stats.total} icon={Inbox} variant="default" />
          <StatsCard
            title="Urgent (7+ days)"
            value={stats.urgent}
            icon={AlertCircle}
            variant="warning"
          />
          <StatsCard title="Received Today" value={stats.today} icon={Clock} variant="success" />
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader className="border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  {filteredApprovals.length} request{filteredApprovals.length !== 1 ? 's' : ''}{' '}
                  awaiting review
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchApprovals}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
                  aria-hidden="true"
                />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchApprovals} />
            ) : approvals.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Toolbar */}
                <div className="p-4 border-b border-border/50 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      placeholder="Search by learner name, email, or course..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
                      aria-label="Search pending approvals"
                    />
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all approvals"
                        />
                        <span className="text-sm text-foreground">
                          {allSelected ? 'Deselect all' : 'Select all'}
                        </span>
                      </button>
                      {someSelected && (
                        <Badge variant="outline" className="text-xs">
                          {selectedIds.size} selected
                        </Badge>
                      )}
                    </div>

                    {someSelected && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleBulkReject}
                          className="text-[var(--color-lxd-error)] border-[var(--color-lxd-error)]/30 hover:bg-[var(--color-lxd-error)]/10"
                        >
                          <X className="w-4 h-4 mr-1" aria-hidden="true" />
                          Deny Selected
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleBulkApprove}
                          className="bg-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/90"
                        >
                          <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                          Approve Selected
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approvals Grid */}
                <div className="p-4">
                  {filteredApprovals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                      <p>No matching requests found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredApprovals.map((approval, index) => (
                        <motion.div
                          key={approval.enrollment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ApprovalCard
                            approval={approval}
                            isSelected={selectedIds.has(approval.enrollment.id)}
                            onSelectChange={(selected) =>
                              toggleSelection(approval.enrollment.id, selected)
                            }
                            onApprove={() => handleSingleApprove(approval)}
                            onReject={() => handleSingleReject(approval)}
                            isProcessing={processingIds.has(approval.enrollment.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Approval Modal */}
        <ApprovalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          approvals={modalApprovals}
          onConfirm={handleConfirm}
        />
      </div>
    </TooltipProvider>
  );
}
