'use client';

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { LocalPerformanceGap, PerformanceGapFormData } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface PerformanceGapEditorProps {
  gaps: LocalPerformanceGap[];
  onChange: (gaps: LocalPerformanceGap[]) => void;
  className?: string;
}

/**
 * PerformanceGapEditor - Manual entry and management of performance gaps
 *
 * Features:
 * - Add/Edit/Delete gaps
 * - Drag-drop reordering (visual only in this version)
 * - Priority badges
 * - Expandable details
 */
export function PerformanceGapEditor({ gaps, onChange, className }: PerformanceGapEditorProps) {
  const [editingGap, setEditingGap] = useState<LocalPerformanceGap | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set());

  // Toggle gap expansion
  const toggleExpanded = (gapId: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(gapId)) {
        next.delete(gapId);
      } else {
        next.add(gapId);
      }
      return next;
    });
  };

  // Add new gap
  const handleAddGap = useCallback(() => {
    setEditingGap(null);
    setIsDialogOpen(true);
  }, []);

  // Edit existing gap
  const handleEditGap = useCallback((gap: LocalPerformanceGap) => {
    setEditingGap(gap);
    setIsDialogOpen(true);
  }, []);

  // Delete gap
  const handleDeleteGap = useCallback(
    (gapId: string) => {
      onChange(gaps.filter((g) => g.id !== gapId));
    },
    [gaps, onChange],
  );

  // Save gap from dialog
  const handleSaveGap = useCallback(
    (formData: PerformanceGapFormData) => {
      if (editingGap) {
        // Update existing
        onChange(gaps.map((g) => (g.id === editingGap.id ? { ...g, ...formData } : g)));
      } else {
        // Add new
        const newGap: LocalPerformanceGap = {
          id: `manual-${Date.now()}`,
          ...formData,
          source: 'manual',
        };
        onChange([...gaps, newGap]);
      }
      setIsDialogOpen(false);
      setEditingGap(null);
    },
    [gaps, onChange, editingGap],
  );

  // Move gap up/down
  const handleMoveGap = useCallback(
    (gapId: string, direction: 'up' | 'down') => {
      const index = gaps.findIndex((g) => g.id === gapId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= gaps.length) return;

      const newGaps = [...gaps];
      const targetGap = newGaps[index];
      const swapGap = newGaps[newIndex];
      if (targetGap && swapGap) {
        newGaps[index] = swapGap;
        newGaps[newIndex] = targetGap;
        onChange(newGaps);
      }
    },
    [gaps, onChange],
  );

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-lxd-cyan" />
              Performance Gaps
            </CardTitle>
            <CardDescription>
              {gaps.length} gap{gaps.length !== 1 ? 's' : ''} identified
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddGap}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gap
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {gaps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No performance gaps defined yet</p>
            <p className="text-xs mt-1">Add gaps manually, use AI suggestions, or upload a CSV</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gaps.map((gap, index) => (
              <div
                key={gap.id}
                className="border border-lxd-dark-border rounded-lg overflow-hidden"
              >
                {/* Gap Header */}
                <div className="flex items-center gap-2 p-3 bg-lxd-dark-bg/30">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                  <div className="flex flex-col">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => handleMoveGap(gap.id, 'up')}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => handleMoveGap(gap.id, 'down')}
                      disabled={index === gaps.length - 1}
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => toggleExpanded(gap.id)}
                    aria-expanded={expandedGaps.has(gap.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{gap.title}</span>
                      <Badge
                        variant={
                          gap.priority === 'critical'
                            ? 'destructive'
                            : gap.priority === 'high'
                              ? 'default'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {gap.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {gap.source}
                      </Badge>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditGap(gap)}
                      aria-label="Edit gap"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-400"
                      onClick={() => handleDeleteGap(gap.id)}
                      aria-label="Delete gap"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Gap Details (Expanded) */}
                {expandedGaps.has(gap.id) && (
                  <div className="p-3 border-t border-lxd-dark-border space-y-3">
                    <p className="text-sm text-muted-foreground">{gap.description}</p>

                    {gap.rootCauses.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">
                          Root Causes
                        </h5>
                        <ul className="text-sm space-y-1">
                          {gap.rootCauses.map((cause, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-lxd-cyan">•</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {gap.successMetrics.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">
                          Success Metrics
                        </h5>
                        <ul className="text-sm space-y-1">
                          {gap.successMetrics.map((metric, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <GapEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        gap={editingGap}
        onSave={handleSaveGap}
      />
    </Card>
  );
}

// ============================================================================
// GAP EDIT DIALOG
// ============================================================================

interface GapEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gap: LocalPerformanceGap | null;
  onSave: (data: PerformanceGapFormData) => void;
}

function GapEditDialog({ open, onOpenChange, gap, onSave }: GapEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootCausesText, setRootCausesText] = useState('');
  const [successMetricsText, setSuccessMetricsText] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (gap) {
        setTitle(gap.title);
        setDescription(gap.description);
        setRootCausesText(gap.rootCauses.join('\n'));
        setSuccessMetricsText(gap.successMetrics.join('\n'));
        setPriority(gap.priority);
      } else {
        setTitle('');
        setDescription('');
        setRootCausesText('');
        setSuccessMetricsText('');
        setPriority('medium');
      }
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      rootCauses: rootCausesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      successMetrics: successMetricsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-lxd-dark-surface border-lxd-dark-border">
        <DialogHeader>
          <DialogTitle>{gap ? 'Edit Performance Gap' : 'Add Performance Gap'}</DialogTitle>
          <DialogDescription>
            {gap
              ? 'Update the performance gap details below'
              : 'Define a new performance gap for your training'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gap-title">Title *</Label>
            <Input
              id="gap-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Safety Protocol Compliance"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gap-description">Description</Label>
            <Textarea
              id="gap-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the performance gap..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gap-priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger id="gap-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gap-causes">Root Causes (one per line)</Label>
            <Textarea
              id="gap-causes"
              value={rootCausesText}
              onChange={(e) => setRootCausesText(e.target.value)}
              placeholder="Inadequate training&#10;Complex procedures&#10;Time pressure"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gap-metrics">Success Metrics (one per line)</Label>
            <Textarea
              id="gap-metrics"
              value={successMetricsText}
              onChange={(e) => setSuccessMetricsText(e.target.value)}
              placeholder="Protocol adherence rate&#10;Incident reduction&#10;Audit scores"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {gap ? 'Save Changes' : 'Add Gap'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
