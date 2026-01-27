'use client';

import { motion } from 'framer-motion';
import { Check, CheckCircle, Clock, Inbox, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Pending approval item */
export interface ApprovalItem {
  id: string;
  type: 'enrollment_request' | 'course_access' | 'certificate_request';
  title: string;
  description: string;
  requestedBy: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  requestedAt: Date;
  priority?: 'high' | 'normal' | 'low';
}

export interface ApprovalQueueProps {
  /** List of pending approvals */
  items: ApprovalItem[];
  /** Callback when an item is approved */
  onApprove?: (itemId: string) => void;
  /** Callback when an item is rejected */
  onReject?: (itemId: string) => void;
  /** Loading state for actions */
  isLoading?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * ApprovalQueue - Displays pending approval requests
 *
 * Shows:
 * - Enrollment requests
 * - Course access requests
 * - Certificate requests
 *
 * With approve/reject actions
 */
export function ApprovalQueue({
  items,
  onApprove,
  onReject,
  isLoading = false,
  className,
}: ApprovalQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (itemId: string) => {
    setProcessingId(itemId);
    try {
      await onApprove?.(itemId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (itemId: string) => {
    setProcessingId(itemId);
    try {
      await onReject?.(itemId);
    } finally {
      setProcessingId(null);
    }
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get type icon
  const TypeIcon = ({ type }: { type: ApprovalItem['type'] }) => {
    switch (type) {
      case 'enrollment_request':
        return <UserPlus className="w-4 h-4" aria-hidden="true" />;
      case 'course_access':
        return <CheckCircle className="w-4 h-4" aria-hidden="true" />;
      case 'certificate_request':
        return <CheckCircle className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4" aria-hidden="true" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: ApprovalItem['priority']): string => {
    switch (priority) {
      case 'high':
        return 'border-l-[var(--color-lxd-error)]';
      case 'low':
        return 'border-l-muted-foreground';
      default:
        return 'border-l-[var(--color-lxd-caution)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
                Pending Approvals
              </CardTitle>
              <CardDescription>{items.length} requests awaiting review</CardDescription>
            </div>
            {items.length > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-lxd-primary)] text-white text-xs font-medium">
                {items.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Check className="w-6 h-6 text-[var(--color-lxd-success)]" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg bg-muted/30 border-l-4',
                    getPriorityColor(item.priority),
                  )}
                >
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-[var(--color-lxd-primary)] text-xs font-medium shrink-0 overflow-hidden">
                    {item.requestedBy.avatarUrl ? (
                      <Image
                        src={item.requestedBy.avatarUrl}
                        alt={`${item.requestedBy.name} avatar`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      item.requestedBy.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <TypeIcon type={item.type} />
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.requestedBy.name} • {formatRelativeTime(item.requestedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--color-lxd-success)] hover:bg-[var(--color-lxd-success)]/10"
                      onClick={() => handleApprove(item.id)}
                      disabled={isLoading || processingId === item.id}
                      aria-label={`Approve ${item.title}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--color-lxd-error)] hover:bg-[var(--color-lxd-error)]/10"
                      onClick={() => handleReject(item.id)}
                      disabled={isLoading || processingId === item.id}
                      aria-label={`Reject ${item.title}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ApprovalQueue;
