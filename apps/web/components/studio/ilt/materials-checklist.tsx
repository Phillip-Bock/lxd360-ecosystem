'use client';

/**
 * MaterialsChecklist - ILT Materials Management Component
 *
 * Provides a checklist interface for managing and tracking
 * session materials with status tracking and assignment.
 */

import {
  Archive,
  CheckCircle2,
  ChevronDown,
  File,
  FileText,
  Film,
  FolderOpen,
  Headphones,
  Laptop,
  Monitor,
  Package,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
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
import type {
  MaterialChecklistItem,
  MaterialsChecklist,
  MaterialType,
  SessionMaterial,
} from '@/types/studio/ilt';

// =============================================================================
// TYPES
// =============================================================================

interface MaterialsChecklistProps {
  /** Session ID */
  sessionId: string;
  /** Materials list */
  materials: SessionMaterial[];
  /** Existing checklist */
  checklist?: MaterialsChecklist;
  /** Callback when checklist changes */
  onChange?: (checklist: MaterialsChecklist) => void;
  /** Callback when materials change */
  onMaterialsChange?: (materials: SessionMaterial[]) => void;
  /** Read-only mode */
  readOnly?: boolean;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MATERIAL_TYPES: Array<{
  value: MaterialType;
  label: string;
  icon: typeof File;
  color: string;
}> = [
  { value: 'handout', label: 'Handout', icon: FileText, color: 'bg-blue-500' },
  { value: 'worksheet', label: 'Worksheet', icon: Pencil, color: 'bg-green-500' },
  { value: 'slides', label: 'Slides', icon: Monitor, color: 'bg-purple-500' },
  { value: 'video', label: 'Video', icon: Film, color: 'bg-red-500' },
  { value: 'audio', label: 'Audio', icon: Headphones, color: 'bg-orange-500' },
  { value: 'exercise-file', label: 'Exercise File', icon: File, color: 'bg-cyan-500' },
  { value: 'reference-guide', label: 'Reference Guide', icon: FileText, color: 'bg-indigo-500' },
  { value: 'job-aid', label: 'Job Aid', icon: FileText, color: 'bg-teal-500' },
  { value: 'assessment', label: 'Assessment', icon: CheckCircle2, color: 'bg-amber-500' },
  { value: 'certificate', label: 'Certificate', icon: Archive, color: 'bg-yellow-500' },
  { value: 'prop', label: 'Prop', icon: Package, color: 'bg-pink-500' },
  { value: 'equipment', label: 'Equipment', icon: Laptop, color: 'bg-violet-500' },
  { value: 'software', label: 'Software', icon: Laptop, color: 'bg-emerald-500' },
  { value: 'supplies', label: 'Supplies', icon: Package, color: 'bg-rose-500' },
  { value: 'other', label: 'Other', icon: FolderOpen, color: 'bg-zinc-500' },
];

const STATUS_OPTIONS: Array<{
  value: MaterialChecklistItem['status'];
  label: string;
  color: string;
}> = [
  { value: 'not-started', label: 'Not Started', color: 'bg-zinc-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500' },
  { value: 'distributed', label: 'Distributed', color: 'bg-purple-500' },
];

const DISTRIBUTION_OPTIONS: Array<{
  value: SessionMaterial['distributionTime'];
  label: string;
}> = [
  { value: 'pre-session', label: 'Pre-Session' },
  { value: 'during', label: 'During Session' },
  { value: 'post-session', label: 'Post-Session' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateId(): string {
  return `mat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getMaterialIcon(type: MaterialType) {
  return MATERIAL_TYPES.find((t) => t.value === type)?.icon || File;
}

function getMaterialColor(type: MaterialType) {
  return MATERIAL_TYPES.find((t) => t.value === type)?.color || 'bg-zinc-500';
}

// =============================================================================
// MATERIAL ITEM COMPONENT
// =============================================================================

interface MaterialItemProps {
  material: SessionMaterial;
  checklistItem?: MaterialChecklistItem;
  onMaterialUpdate: (material: SessionMaterial) => void;
  onMaterialDelete: () => void;
  onStatusUpdate: (status: MaterialChecklistItem['status']) => void;
  readOnly?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function MaterialItem({
  material,
  checklistItem,
  onMaterialUpdate,
  onMaterialDelete,
  onStatusUpdate,
  readOnly,
  isExpanded,
  onToggleExpand,
}: MaterialItemProps) {
  const Icon = getMaterialIcon(material.type);
  const statusConfig = STATUS_OPTIONS.find((s) => s.value === checklistItem?.status);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox for status */}
        <Checkbox
          checked={checklistItem?.status === 'ready' || checklistItem?.status === 'distributed'}
          onCheckedChange={(checked) => {
            onStatusUpdate(checked ? 'ready' : 'not-started');
          }}
          disabled={readOnly}
        />

        {/* Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded flex items-center justify-center shrink-0',
            getMaterialColor(material.type),
          )}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>

        {/* Content */}
        <button
          type="button"
          className="flex-1 min-w-0 cursor-pointer text-left bg-transparent border-0 p-0"
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200 truncate">{material.name}</span>
            {material.printable && (
              <span title="Printable">
                <Printer className="h-3 w-3 text-zinc-500" />
              </span>
            )}
            {material.digitalOnly && (
              <span title="Digital Only">
                <Monitor className="h-3 w-3 text-zinc-500" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{MATERIAL_TYPES.find((t) => t.value === material.type)?.label}</span>
            {material.quantity && material.quantity > 1 && <span>• Qty: {material.quantity}</span>}
            {material.distributionTime && (
              <span>
                • {DISTRIBUTION_OPTIONS.find((d) => d.value === material.distributionTime)?.label}
              </span>
            )}
          </div>
        </button>

        {/* Status */}
        {!readOnly && (
          <Select
            value={checklistItem?.status || 'not-started'}
            onValueChange={(v) => onStatusUpdate(v as MaterialChecklistItem['status'])}
          >
            <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', status.color)} />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {readOnly && checklistItem && (
          <span className={cn('px-2 py-1 rounded text-xs text-white', statusConfig?.color)}>
            {statusConfig?.label}
          </span>
        )}

        {/* Actions */}
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400"
            onClick={onMaterialDelete}
            aria-label="Delete material"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        <button
          type="button"
          className="bg-transparent border-0 p-0 cursor-pointer"
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          aria-expanded={isExpanded}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 text-zinc-400 transition-transform',
              !isExpanded && '-rotate-90',
            )}
          />
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={material.name}
                onChange={(e) => onMaterialUpdate({ ...material, name: e.target.value })}
                disabled={readOnly}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={material.type}
                onValueChange={(v) => onMaterialUpdate({ ...material, type: v as MaterialType })}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={material.quantity || 1}
                onChange={(e) =>
                  onMaterialUpdate({ ...material, quantity: parseInt(e.target.value, 10) || 1 })
                }
                disabled={readOnly}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label>Distribution</Label>
              <Select
                value={material.distributionTime || 'during'}
                onValueChange={(v) =>
                  onMaterialUpdate({
                    ...material,
                    distributionTime: v as SessionMaterial['distributionTime'],
                  })
                }
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value ?? ''}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Format</Label>
              <div className="flex gap-4 pt-2">
                <span className="flex items-center gap-2 text-sm text-zinc-300">
                  <Checkbox
                    id={`printable-${material.id}`}
                    checked={material.printable}
                    onCheckedChange={(checked) =>
                      onMaterialUpdate({ ...material, printable: checked === true })
                    }
                    disabled={readOnly}
                  />
                  <Label
                    htmlFor={`printable-${material.id}`}
                    className="cursor-pointer font-normal"
                  >
                    Printable
                  </Label>
                </span>
                <span className="flex items-center gap-2 text-sm text-zinc-300">
                  <Checkbox
                    id={`digital-${material.id}`}
                    checked={material.digitalOnly}
                    onCheckedChange={(checked) =>
                      onMaterialUpdate({ ...material, digitalOnly: checked === true })
                    }
                    disabled={readOnly}
                  />
                  <Label htmlFor={`digital-${material.id}`} className="cursor-pointer font-normal">
                    Digital
                  </Label>
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>URL / File Path</Label>
            <div className="flex gap-2">
              <Input
                value={material.url || material.filePath || ''}
                onChange={(e) => onMaterialUpdate({ ...material, url: e.target.value })}
                placeholder="https://... or /path/to/file"
                disabled={readOnly}
                className="bg-white/5 border-white/10"
              />
              {!readOnly && (
                <Button variant="outline" size="icon" aria-label="Upload file">
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description / Notes</Label>
            <Textarea
              value={material.description || ''}
              onChange={(e) => onMaterialUpdate({ ...material, description: e.target.value })}
              placeholder="Additional notes about this material..."
              disabled={readOnly}
              className="bg-white/5 border-white/10 resize-none"
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label>Preparation Notes</Label>
            <Textarea
              value={material.preparationNotes || ''}
              onChange={(e) => onMaterialUpdate({ ...material, preparationNotes: e.target.value })}
              placeholder="How to prepare this material..."
              disabled={readOnly}
              className="bg-white/5 border-white/10 resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MaterialsChecklistComponent({
  sessionId,
  materials: initialMaterials,
  checklist: initialChecklist,
  onChange,
  onMaterialsChange,
  readOnly = false,
  className,
}: MaterialsChecklistProps) {
  const [materials, setMaterials] = useState<SessionMaterial[]>(initialMaterials);
  const [checklist, setChecklist] = useState<MaterialsChecklist>(
    initialChecklist || {
      sessionId,
      items: initialMaterials.map((m) => ({
        materialId: m.id,
        materialName: m.name,
        status: 'not-started',
      })),
      lastUpdated: new Date().toISOString(),
    },
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Calculate progress
  const progress = useMemo(() => {
    const total = checklist.items.length;
    if (total === 0) return { ready: 0, inProgress: 0, notStarted: 0, total: 0, percent: 0 };

    const ready = checklist.items.filter(
      (i) => i.status === 'ready' || i.status === 'distributed',
    ).length;
    const inProgress = checklist.items.filter((i) => i.status === 'in-progress').length;
    const notStarted = checklist.items.filter((i) => i.status === 'not-started').length;

    return {
      ready,
      inProgress,
      notStarted,
      total,
      percent: Math.round((ready / total) * 100),
    };
  }, [checklist.items]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const checklistItem = checklist.items.find((i) => i.materialId === m.id);

      if (filterStatus !== 'all' && checklistItem?.status !== filterStatus) {
        return false;
      }

      if (filterType !== 'all' && m.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [materials, checklist.items, filterStatus, filterType]);

  const updateMaterial = useCallback(
    (materialId: string, updates: SessionMaterial) => {
      const newMaterials = materials.map((m) => (m.id === materialId ? updates : m));
      setMaterials(newMaterials);
      onMaterialsChange?.(newMaterials);

      // Update checklist item name if changed
      const newChecklist = {
        ...checklist,
        items: checklist.items.map((item) =>
          item.materialId === materialId ? { ...item, materialName: updates.name } : item,
        ),
        lastUpdated: new Date().toISOString(),
      };
      setChecklist(newChecklist);
      onChange?.(newChecklist);
    },
    [materials, checklist, onMaterialsChange, onChange],
  );

  const deleteMaterial = useCallback(
    (materialId: string) => {
      const newMaterials = materials.filter((m) => m.id !== materialId);
      setMaterials(newMaterials);
      onMaterialsChange?.(newMaterials);

      const newChecklist = {
        ...checklist,
        items: checklist.items.filter((i) => i.materialId !== materialId),
        lastUpdated: new Date().toISOString(),
      };
      setChecklist(newChecklist);
      onChange?.(newChecklist);
    },
    [materials, checklist, onMaterialsChange, onChange],
  );

  const updateStatus = useCallback(
    (materialId: string, status: MaterialChecklistItem['status']) => {
      const newChecklist = {
        ...checklist,
        items: checklist.items.map((item) =>
          item.materialId === materialId
            ? {
                ...item,
                status,
                completedAt:
                  status === 'ready' || status === 'distributed'
                    ? new Date().toISOString()
                    : undefined,
              }
            : item,
        ),
        lastUpdated: new Date().toISOString(),
      };
      setChecklist(newChecklist);
      onChange?.(newChecklist);
    },
    [checklist, onChange],
  );

  const addMaterial = useCallback(() => {
    const newMaterial: SessionMaterial = {
      id: generateId(),
      name: 'New Material',
      type: 'handout',
      quantity: 1,
      distributionTime: 'during',
    };

    const newMaterials = [...materials, newMaterial];
    setMaterials(newMaterials);
    onMaterialsChange?.(newMaterials);

    const newChecklist = {
      ...checklist,
      items: [
        ...checklist.items,
        {
          materialId: newMaterial.id,
          materialName: newMaterial.name,
          status: 'not-started' as const,
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
    setChecklist(newChecklist);
    onChange?.(newChecklist);

    setExpandedItems((prev) => new Set(prev).add(newMaterial.id));
  }, [materials, checklist, onMaterialsChange, onChange]);

  const toggleExpand = (materialId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(materialId)) {
        next.delete(materialId);
      } else {
        next.add(materialId);
      }
      return next;
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Summary */}
      <div className="p-4 rounded-lg border border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-300">Materials Progress</h3>
          <span className="text-sm text-zinc-400">
            {progress.ready} of {progress.total} ready ({progress.percent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
          {progress.ready > 0 && (
            <div
              className="h-full bg-green-500"
              style={{ width: `${(progress.ready / progress.total) * 100}%` }}
            />
          )}
          {progress.inProgress > 0 && (
            <div
              className="h-full bg-blue-500"
              style={{ width: `${(progress.inProgress / progress.total) * 100}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Ready: {progress.ready}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            In Progress: {progress.inProgress}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            Not Started: {progress.notStarted}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {MATERIAL_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {!readOnly && (
          <Button onClick={addMaterial} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
        )}
      </div>

      {/* Materials List */}
      <div className="space-y-2">
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
            <Package className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">
              {materials.length === 0
                ? 'No materials added yet'
                : 'No materials match your filters'}
            </p>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <MaterialItem
              key={material.id}
              material={material}
              checklistItem={checklist.items.find((i) => i.materialId === material.id)}
              onMaterialUpdate={(updated) => updateMaterial(material.id, updated)}
              onMaterialDelete={() => deleteMaterial(material.id)}
              onStatusUpdate={(status) => updateStatus(material.id, status)}
              readOnly={readOnly}
              isExpanded={expandedItems.has(material.id)}
              onToggleExpand={() => toggleExpand(material.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { MaterialsChecklistComponent as MaterialsChecklist };
